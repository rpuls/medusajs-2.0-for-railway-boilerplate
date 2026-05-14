import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateLineItemInCartWorkflow } from "@medusajs/medusa/core-flows"

import {
  bnLikeToMajorAmount,
  garmentMajorFromBulkMetadataOrNull,
  normalizeBulkPricingTiersFromVariantMetadata,
} from "./scp-resolve-garment-unit-price"
import {
  isScpPrintSizeId,
  resolveScpTierIndexForQuantity,
  scpPrintTotalMajorFromLocations,
  scpPrintTotalMajorPerGarmentForSides,
  type ScpPrintSizeId,
  type DecoratedLocation,
  decoratedLocationsFromLineMetadata,
  decoratedSidesFromLineMetadata,
} from "./scp-dtf-print-pricing"

/**
 * Cross-cart bulk-tier aggregation.
 *
 * SC Prints' tier ladder (1-9 / 10-19 / 20-49 / 50-99 / 100+) is uniform across
 * every variant (see `backend/src/utils/bulk-price-ladder.ts`). Each variant
 * carries its own per-tier `amount` on `metadata.bulk_pricing.tiers`. The
 * historical pricing model looked up that tier using *just this line's*
 * quantity, meaning a customer adding 20 of Product A and 30 of Product B
 * paid the 20-tier and 30-tier prices independently — not the 50-tier price
 * that 50 total units should unlock.
 *
 * This helper recomputes every eligible line's `unit_price` based on the
 * aggregated quantity across the cart. Eligibility = the line's variant has
 * `bulk_pricing.tiers` metadata and is not opted out via
 * `variant.metadata.exclude_from_bulk_aggregation === true`. Opt-out is
 * intended for niche SKUs like the DTF gang sheet that should not participate
 * in the bulk discount.
 *
 * Each eligible line's price has two parts that both depend on quantity:
 *   - garment unit price (variant `bulk_pricing.tiers` lookup)
 *   - SCP DTF print surcharge (tier-indexed, only for customizer lines)
 *
 * Both are recomputed at the aggregated quantity. Lines without
 * `customizerDesign.pricing.server` metadata are treated as plain garment
 * lines (no print surcharge); they still benefit from the aggregated garment
 * tier.
 *
 * Idempotent and loop-safe: if no line's `unit_price` would change, the
 * helper does nothing. This means a subscriber firing on `cart.updated`
 * won't recurse — the second-pass recompute is a no-op.
 */

const round2 = (n: number) => Math.round(n * 100) / 100

type RecomputeResult = {
  aggregated_quantity: number
  eligible_line_ids: string[]
  excluded_line_ids: string[]
  updates: Array<{ line_id: string; old_unit_price: number; new_unit_price: number }>
}

type CartLineForRecompute = {
  id: string
  quantity: number
  unit_price: unknown
  variant_id?: string | null
  metadata?: Record<string, unknown> | null
  variant?: {
    id?: string
    metadata?: Record<string, unknown> | null
  } | null
}

const ENABLE_FLAG_ENV = "ENABLE_SCP_CART_AGGREGATION"

const aggregationDisabled = (): boolean => {
  const raw = process.env[ENABLE_FLAG_ENV]
  if (raw === undefined) return false
  const normalized = raw.trim().toLowerCase()
  return normalized === "false" || normalized === "0" || normalized === "no"
}

const isLineEligible = (line: CartLineForRecompute): boolean => {
  const variantMeta = line.variant?.metadata ?? null
  if (!variantMeta) return false
  if (variantMeta.exclude_from_bulk_aggregation === true) return false
  const tiers = normalizeBulkPricingTiersFromVariantMetadata(variantMeta)
  return tiers.length > 0
}

const readScpServerBlock = (
  metadata: Record<string, unknown> | null | undefined
): {
  printSizeId: ScpPrintSizeId | null
  decoratedLocations: DecoratedLocation[]
  decoratedSides: string[]
} | null => {
  if (!metadata || typeof metadata !== "object") return null
  const customizerDesign = metadata.customizerDesign as Record<string, unknown> | undefined
  if (!customizerDesign || typeof customizerDesign !== "object") return null

  const pricing = customizerDesign.pricing as Record<string, unknown> | undefined
  const server = (pricing?.server ?? null) as Record<string, unknown> | null
  if (!server || typeof server !== "object") return null

  const printSizeRaw = server.print_size_id
  const printSizeId = isScpPrintSizeId(printSizeRaw) ? printSizeRaw : null

  const decoratedLocations = decoratedLocationsFromLineMetadata(metadata)
  const decoratedSides = decoratedSidesFromLineMetadata(metadata)

  return { printSizeId, decoratedLocations, decoratedSides }
}

const computeNewUnitPriceMajor = (
  line: CartLineForRecompute,
  aggregatedQty: number
): number | null => {
  const variantMeta = line.variant?.metadata ?? null
  const garmentMajor = garmentMajorFromBulkMetadataOrNull(variantMeta, aggregatedQty)
  if (garmentMajor === null) return null

  const scpBlock = readScpServerBlock(line.metadata)
  if (!scpBlock || !scpBlock.printSizeId) {
    // Plain (non-customizer) garment line. Garment-only price.
    return round2(Math.max(0, garmentMajor))
  }

  const tierIndex = resolveScpTierIndexForQuantity(aggregatedQty)
  const printTotalMajor =
    scpBlock.decoratedLocations.length > 0
      ? scpPrintTotalMajorFromLocations({
          selectedPrintSizeId: scpBlock.printSizeId,
          tierIndex,
          locations: scpBlock.decoratedLocations,
        })
      : scpBlock.decoratedSides.length > 0
      ? scpPrintTotalMajorPerGarmentForSides({
          selectedPrintSizeId: scpBlock.printSizeId,
          tierIndex,
          decoratedSides: scpBlock.decoratedSides,
        })
      : 0

  return round2(Math.max(0, garmentMajor) + Math.max(0, printTotalMajor))
}

const buildUpdatedServerBlock = (
  existingMetadata: Record<string, unknown> | null | undefined,
  newUnitPriceMajor: number,
  aggregatedQty: number
): Record<string, unknown> | null => {
  if (!existingMetadata || typeof existingMetadata !== "object") return null
  const customizerDesign = existingMetadata.customizerDesign as
    | Record<string, unknown>
    | undefined
  if (!customizerDesign || typeof customizerDesign !== "object") return null
  const pricing = (customizerDesign.pricing ?? {}) as Record<string, unknown>
  const server = (pricing.server ?? {}) as Record<string, unknown>
  // Mirror the new aggregated tier so admin/order-detail widgets can show "tier
  // applied: 50-99 (aggregated)". Garment + print breakdown is recomputed by
  // the caller — we only stamp the new unit_price and aggregated_quantity.
  const updatedServer: Record<string, unknown> = {
    ...server,
    unit_price_major: newUnitPriceMajor,
    aggregated_quantity: aggregatedQty,
    tier_index: resolveScpTierIndexForQuantity(aggregatedQty),
  }
  return {
    ...existingMetadata,
    customizerDesign: {
      ...customizerDesign,
      pricing: {
        ...pricing,
        server: updatedServer,
      },
    },
  }
}

/**
 * Inspect every line on a cart and rewrite `unit_price` on eligible lines
 * so they reflect the aggregated-quantity tier. Returns a summary of what
 * changed (useful for tests and telemetry). Safe to call repeatedly; the
 * second invocation will return `updates: []` when prices are already
 * aligned.
 *
 * `scope` must be a Medusa container scope (req.scope or subscriber
 * container). The helper resolves the Remote Query and the workflow runner
 * from it.
 */
export async function recomputeScpCartPricing(
  cartId: string,
  scope: { resolve: (key: string) => unknown }
): Promise<RecomputeResult> {
  const empty: RecomputeResult = {
    aggregated_quantity: 0,
    eligible_line_ids: [],
    excluded_line_ids: [],
    updates: [],
  }

  if (aggregationDisabled()) return empty
  if (!cartId) return empty

  const query = scope.resolve(ContainerRegistrationKeys.QUERY) as {
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
      "items.unit_price",
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
          unit_price?: unknown
          variant_id?: string | null
          metadata?: Record<string, unknown> | null
        }>
      }
    | undefined

  if (!cart || cart.completed_at) return empty
  const rawItems = Array.isArray(cart.items) ? cart.items : []
  if (!rawItems.length) return empty

  // Batch-fetch variant metadata directly. Following `items.variant.metadata`
  // through the cart graph collapses to null in production (the join doesn't
  // hydrate metadata reliably), so every line would be skipped and the
  // recompute would no-op. Matches the pattern used by
  // `resolveGarmentUnitAmountMajor` in the add endpoint.
  const variantIds = Array.from(
    new Set(
      rawItems
        .map((it) => it.variant_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    )
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

  const items: CartLineForRecompute[] = rawItems.map((raw) => ({
    id: raw.id ?? "",
    quantity: typeof raw.quantity === "number" ? raw.quantity : 0,
    unit_price: raw.unit_price,
    variant_id: raw.variant_id ?? null,
    metadata: raw.metadata ?? null,
    variant: {
      id: raw.variant_id ?? undefined,
      metadata: raw.variant_id ? variantMetaById.get(raw.variant_id) ?? null : null,
    },
  }))

  const eligible: CartLineForRecompute[] = []
  const excluded: string[] = []
  for (const item of items) {
    if (!item || !item.id) continue
    if (isLineEligible(item)) {
      eligible.push(item)
    } else {
      excluded.push(item.id)
    }
  }

  if (!eligible.length) {
    return { ...empty, excluded_line_ids: excluded }
  }

  const aggregatedQty = eligible.reduce(
    (sum, line) => sum + Math.max(0, Math.floor(line.quantity || 0)),
    0
  )
  const effectiveQty = Math.max(1, aggregatedQty)

  const updates: RecomputeResult["updates"] = []

  for (const line of eligible) {
    const oldUnitPrice = bnLikeToMajorAmount(line.unit_price) ?? 0
    const newUnitPriceMajor = computeNewUnitPriceMajor(line, effectiveQty)
    if (newUnitPriceMajor === null) continue
    if (round2(oldUnitPrice) === round2(newUnitPriceMajor)) continue

    const updatedMetadata = buildUpdatedServerBlock(
      line.metadata,
      newUnitPriceMajor,
      effectiveQty
    )

    await updateLineItemInCartWorkflow(scope as never).run({
      input: {
        cart_id: cartId,
        item_id: line.id,
        update: {
          unit_price: newUnitPriceMajor,
          ...(updatedMetadata ? { metadata: updatedMetadata } : {}),
        },
      },
    })

    updates.push({
      line_id: line.id,
      old_unit_price: round2(oldUnitPrice),
      new_unit_price: newUnitPriceMajor,
    })
  }

  return {
    aggregated_quantity: aggregatedQty,
    eligible_line_ids: eligible.map((l) => l.id),
    excluded_line_ids: excluded,
    updates,
  }
}

/**
 * Test-friendly pure variant of the recompute logic. Given a list of lines
 * (with their variant metadata + per-line metadata), returns the new
 * `unit_price` map without touching any Medusa workflow. Used by unit tests
 * and could also be reused by an admin "what-if" preview widget later.
 */
export function recomputeScpCartPricingPure(
  lines: CartLineForRecompute[]
): {
  aggregated_quantity: number
  prices: Map<string, number>
  excluded_line_ids: string[]
} {
  const prices = new Map<string, number>()
  const excluded: string[] = []
  const eligible: CartLineForRecompute[] = []
  for (const line of lines) {
    if (!line || !line.id) continue
    if (isLineEligible(line)) eligible.push(line)
    else excluded.push(line.id)
  }

  const aggregatedQty = eligible.reduce(
    (sum, line) => sum + Math.max(0, Math.floor(line.quantity || 0)),
    0
  )
  const effectiveQty = Math.max(1, aggregatedQty)

  for (const line of eligible) {
    const major = computeNewUnitPriceMajor(line, effectiveQty)
    if (major !== null) prices.set(line.id, major)
  }

  return { aggregated_quantity: aggregatedQty, prices, excluded_line_ids: excluded }
}
