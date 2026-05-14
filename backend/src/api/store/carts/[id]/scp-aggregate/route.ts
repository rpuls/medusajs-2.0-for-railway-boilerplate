import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { z } from "zod"

import { normalizeBulkPricingTiersFromVariantMetadata } from "../../../../../lib/scp-resolve-garment-unit-price"
import { SCP_BLANK_ALIGNED_QUANTITY_TIERS } from "../../../../../lib/scp-dtf-print-pricing"

// Fallback tier ranges for the storefront aggregate display when no eligible
// line carries a variant tier ladder (e.g. a cart of cap-only SCP customizer
// lines whose variants weren't imported with `bulk_pricing.tiers`). The SCP
// blank-aligned ladder matches the standard 1-9 / 10-19 / 20-49 / 50-99 / 100+
// ranges, so the banner copy stays consistent regardless of product mix.
const FALLBACK_TIERS = SCP_BLANK_ALIGNED_QUANTITY_TIERS.map((t) => ({
  min_quantity: t.minQuantity,
  max_quantity: t.maxQuantity,
}))

const hasScpCustomizerMetadata = (
  lineMetadata: Record<string, unknown> | null | undefined
): boolean => {
  if (!lineMetadata || typeof lineMetadata !== "object") return false
  const customizerDesign = lineMetadata.customizerDesign as Record<string, unknown> | undefined
  if (!customizerDesign || typeof customizerDesign !== "object") return false
  const pricing = customizerDesign.pricing as Record<string, unknown> | undefined
  return Boolean(pricing?.server && typeof pricing.server === "object")
}

const paramsSchema = z.object({
  id: z.string().min(1),
})

/**
 * GET /store/carts/:id/scp-aggregate
 *
 * Returns the cart's current bulk-aggregation snapshot so the storefront can
 * render "you're getting our X-tier bulk price" banners and project the tier
 * a customer would land on after adding their in-progress design.
 *
 * Eligible quantity = sum of line quantities for items whose variant carries
 * `metadata.bulk_pricing.tiers` and is not opted out via
 * `metadata.exclude_from_bulk_aggregation`. The active tier is the matching
 * tier from the SC Prints standard ladder (1-9 / 10-19 / 20-49 / 50-99 / 100+).
 *
 * Returns a stable shape even when the cart is empty, so the storefront can
 * always render without special-casing.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const parsed = paramsSchema.safeParse(req.params ?? {})
  if (!parsed.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid cart id: ${parsed.error.message}`
    )
  }
  const cartId = parsed.data.id

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (q: Record<string, unknown>) => Promise<{ data?: unknown[] }>
  }

  const { data: carts } = await query.graph({
    entity: "cart",
    filters: { id: cartId },
    fields: [
      "id",
      "completed_at",
      "items.id",
      "items.quantity",
      "items.variant_id",
      "items.metadata",
    ],
  })

  const cart = carts?.[0] as
    | {
        id?: string
        completed_at?: unknown
        items?: Array<{
          id?: string
          quantity?: number
          variant_id?: string | null
          metadata?: Record<string, unknown> | null
        }>
      }
    | undefined

  if (!cart) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Cart "${cartId}" not found.`)
  }

  const items = Array.isArray(cart.items) ? cart.items : []

  // Batch-fetch variant metadata directly. Following `items.variant.metadata`
  // through the cart graph proved unreliable in production — the join
  // collapsed to null silently and every line was treated as "no tiers", so
  // the aggregate always returned 0. The working pattern from
  // `resolveGarmentUnitAmountMajor` queries variants by id and reads metadata
  // directly. One round-trip for the whole cart.
  const variantIds = Array.from(
    new Set(items.map((it) => it.variant_id).filter((id): id is string => typeof id === "string" && id.length > 0))
  )

  const variantMetaById = new Map<string, Record<string, unknown>>()
  if (variantIds.length) {
    const { data: variantRows } = await query.graph({
      entity: "variants",
      filters: { id: variantIds },
      fields: ["id", "metadata"],
    })
    for (const row of (variantRows ?? []) as Array<{
      id?: string
      metadata?: Record<string, unknown> | null
    }>) {
      if (row?.id && row.metadata && typeof row.metadata === "object") {
        variantMetaById.set(row.id, row.metadata)
      }
    }
  }

  let eligibleQty = 0
  let excludedQty = 0
  // Shared tier table — the SCP ladder is uniform across all eligible
  // variants, so we sample from the first eligible line. If none is found,
  // we expose an empty tier list (still valid response).
  let sharedTiers: Array<{ min_quantity: number; max_quantity?: number }> | null = null

  for (const item of items) {
    const variantMeta = item.variant_id ? variantMetaById.get(item.variant_id) ?? null : null
    const qty = Math.max(0, Math.floor(item.quantity ?? 0))
    if (variantMeta?.exclude_from_bulk_aggregation === true) {
      excludedQty += qty
      continue
    }
    // Variant carries the standard tier ladder → counts toward aggregate and
    // donates its ranges as the shared tier table for the banner.
    if (variantMeta) {
      const tiers = normalizeBulkPricingTiersFromVariantMetadata(variantMeta)
      if (tiers.length > 0) {
        eligibleQty += qty
        if (!sharedTiers) {
          sharedTiers = tiers.map((t) => ({
            min_quantity: t.minQuantity,
            max_quantity: t.maxQuantity,
          }))
        }
        continue
      }
    }
    // Variant has no ladder but the line is an SCP customizer line. Still
    // counts toward the aggregate (so the print tier crosses boundaries
    // consistently), but the banner falls back to the canonical SCP ranges
    // since there's no variant-specific ladder to sample.
    if (hasScpCustomizerMetadata(item.metadata)) {
      eligibleQty += qty
    }
  }

  // No eligible line had its own ladder but we still need ranges to render
  // the banner. The SCP blank-aligned ladder uses the same boundaries as
  // every variant importer, so this is safe.
  if (!sharedTiers && eligibleQty > 0) {
    sharedTiers = FALLBACK_TIERS
  }

  const effectiveQty = Math.max(0, eligibleQty)
  let activeTier: { min_quantity: number; max_quantity?: number } | null = null
  let nextTier: { min_quantity: number; max_quantity?: number } | null = null
  let unitsToNext = 0

  if (sharedTiers && sharedTiers.length) {
    const tiers = sharedTiers
    let idx = -1
    if (effectiveQty >= 1) {
      idx = tiers.findIndex(
        (t) =>
          effectiveQty >= t.min_quantity &&
          (typeof t.max_quantity !== "number" || effectiveQty <= t.max_quantity)
      )
      if (idx < 0) idx = tiers.length - 1
    }
    if (idx >= 0) {
      activeTier = tiers[idx]
      const candidateNext = tiers[idx + 1]
      if (candidateNext) {
        nextTier = candidateNext
        unitsToNext = Math.max(0, candidateNext.min_quantity - effectiveQty)
      }
    }
  }

  return res.status(200).json({
    cart_id: cartId,
    eligible_quantity: eligibleQty,
    excluded_quantity: excludedQty,
    active_tier: activeTier,
    next_tier: nextTier,
    units_to_next_tier: unitsToNext,
    tiers: sharedTiers ?? [],
  })
}
