import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { z } from "zod"

import { normalizeBulkPricingTiersFromVariantMetadata } from "../../../../../lib/scp-resolve-garment-unit-price"

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
      "items.variant.metadata",
    ],
  })

  const cart = carts?.[0] as
    | {
        id?: string
        completed_at?: unknown
        items?: Array<{
          id?: string
          quantity?: number
          variant_id?: string
          variant?: { metadata?: Record<string, unknown> | null } | null
        }>
      }
    | undefined

  if (!cart) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Cart "${cartId}" not found.`)
  }

  const items = Array.isArray(cart.items) ? cart.items : []
  let eligibleQty = 0
  let excludedQty = 0
  // Shared tier table — the SCP ladder is uniform across all eligible
  // variants, so we sample from the first eligible line. If none is found,
  // we expose an empty tier list (still valid response).
  let sharedTiers: Array<{ min_quantity: number; max_quantity?: number }> | null = null

  for (const item of items) {
    const variantMeta = item.variant?.metadata ?? null
    const qty = Math.max(0, Math.floor(item.quantity ?? 0))
    if (!variantMeta) continue
    if (variantMeta.exclude_from_bulk_aggregation === true) {
      excludedQty += qty
      continue
    }
    const tiers = normalizeBulkPricingTiersFromVariantMetadata(variantMeta)
    if (!tiers.length) continue
    eligibleQty += qty
    if (!sharedTiers) {
      sharedTiers = tiers.map((t) => ({
        min_quantity: t.minQuantity,
        max_quantity: t.maxQuantity,
      }))
    }
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
