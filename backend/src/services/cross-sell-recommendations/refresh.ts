import type { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

import {
  CROSS_SELL_MAX_PER_PRODUCT,
  CROSS_SELL_MIN_CO_OCCURRENCE,
} from "../../lib/constants"

import {
  computeCrossSellRecommendations,
  type CoPurchaseFact,
} from "./compute"

const RECOMMENDATIONS_KEY = "cross_sell_product_ids"
const REFRESHED_AT_KEY = "cross_sell_refreshed_at"

export type RefreshResult = {
  orders_considered: number
  facts: number
  products_with_recommendations: number
  products_cleared: number
  failures: number
}

/**
 * Pulls every non-cancelled order's line items, builds `(order_id,
 * product_id)` facts, computes the top-K recommendations per product
 * via the pure aggregator, and writes the result onto
 * `product.metadata.cross_sell_product_ids` (an array of product IDs).
 *
 * Also clears stale recommendations on products that no longer qualify
 * (so a once-popular pair that's faded doesn't keep showing up
 * forever).
 *
 * Catalog-only filter: products whose metadata is currently a
 * supplier-imported vectorization service or other "internal" hidden
 * product should not appear as recommendations. We filter by checking
 * `product.status` (only `published`) and `product.is_giftcard` (skip
 * gift cards — those are bought intentionally, not co-purchased).
 */
export async function refreshCrossSellRecommendations(
  container: MedusaContainer,
  options: {
    topK?: number
    minCoOccurrence?: number
    /** Skip the write step — just return what would change. Used for
     *  the cron dry-run path. */
    dryRun?: boolean
  } = {}
): Promise<RefreshResult> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const topK = options.topK ?? CROSS_SELL_MAX_PER_PRODUCT
  const minCoOccurrence =
    options.minCoOccurrence ?? CROSS_SELL_MIN_CO_OCCURRENCE

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule = container.resolve(Modules.PRODUCT) as unknown as {
    updateProducts?: (
      id: string,
      data: { metadata?: Record<string, unknown> }
    ) => Promise<unknown>
  }

  if (typeof productModule.updateProducts !== "function") {
    logger.warn(
      "cross-sell: product module lacks updateProducts — skipping refresh."
    )
    return {
      orders_considered: 0,
      facts: 0,
      products_with_recommendations: 0,
      products_cleared: 0,
      failures: 0,
    }
  }

  // ---- Pull eligible orders + their line items ----
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "status", "items.product_id"],
    pagination: { take: 5000, skip: 0 },
  })

  let ordersConsidered = 0
  const facts: CoPurchaseFact[] = []
  for (const order of (orders as any[]) ?? []) {
    if ((order?.status ?? "").toLowerCase() === "canceled") continue
    const items = Array.isArray(order?.items) ? order.items : []
    if (items.length === 0) continue
    ordersConsidered += 1
    for (const item of items) {
      const productId = typeof item?.product_id === "string" ? item.product_id : null
      if (!productId) continue
      facts.push({ order_id: order.id as string, product_id: productId })
    }
  }

  // ---- Compute recommendations ----
  const recommendations = computeCrossSellRecommendations(facts, {
    topK,
    minCoOccurrence,
  })
  const recommendationsByProduct = new Map<string, string[]>()
  for (const r of recommendations) {
    recommendationsByProduct.set(r.product_id, r.recommended_product_ids)
  }

  // ---- Filter recommendations to only `published` non-giftcard products ----
  const allRecommendedIds = new Set<string>()
  for (const ids of recommendationsByProduct.values()) {
    for (const id of ids) allRecommendedIds.add(id)
  }
  const allSourceIds = Array.from(recommendationsByProduct.keys())
  const productsToCheck = Array.from(
    new Set([...allRecommendedIds, ...allSourceIds])
  )

  const eligibleProductIds = new Set<string>()
  if (productsToCheck.length > 0) {
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "status", "is_giftcard"],
      filters: { id: productsToCheck },
      pagination: { take: productsToCheck.length, skip: 0 },
    })
    for (const p of (products as any[]) ?? []) {
      if (p?.status !== "published") continue
      if (p?.is_giftcard) continue
      eligibleProductIds.add(p.id as string)
    }
  }

  // Strip ineligible recommendations and drop empty source rows.
  const finalRecommendations = new Map<string, string[]>()
  for (const [productId, ids] of recommendationsByProduct) {
    if (!eligibleProductIds.has(productId)) continue
    const filtered = ids.filter((id) => eligibleProductIds.has(id))
    if (filtered.length === 0) continue
    finalRecommendations.set(productId, filtered)
  }

  // ---- Pull every product that *currently* has cross_sell metadata, so we
  // can clear products that no longer qualify. ----
  const { data: allProducts } = await query.graph({
    entity: "product",
    fields: ["id", "metadata"],
    pagination: { take: 5000, skip: 0 },
  })
  const productsCurrentlyTagged = ((allProducts as any[]) ?? []).filter((p) => {
    const meta = (p?.metadata as Record<string, unknown> | undefined) ?? {}
    return Array.isArray(meta[RECOMMENDATIONS_KEY])
  })

  let productsWithRecommendations = 0
  let productsCleared = 0
  let failures = 0

  if (options.dryRun) {
    productsWithRecommendations = finalRecommendations.size
    productsCleared = productsCurrentlyTagged.filter(
      (p) => !finalRecommendations.has(p.id)
    ).length
    return {
      orders_considered: ordersConsidered,
      facts: facts.length,
      products_with_recommendations: productsWithRecommendations,
      products_cleared: productsCleared,
      failures: 0,
    }
  }

  const refreshedAt = new Date().toISOString()

  for (const [productId, ids] of finalRecommendations) {
    try {
      // Read existing metadata so we don't blow away unrelated keys.
      const existing = ((allProducts as any[]) ?? []).find(
        (p) => p?.id === productId
      )
      const existingMeta = (existing?.metadata ?? {}) as Record<string, unknown>
      await productModule.updateProducts!(productId, {
        metadata: {
          ...existingMeta,
          [RECOMMENDATIONS_KEY]: ids,
          [REFRESHED_AT_KEY]: refreshedAt,
        },
      })
      productsWithRecommendations += 1
    } catch (err: any) {
      failures += 1
      logger.warn(
        `cross-sell: failed to update ${productId}: ${err?.message ?? err}`
      )
    }
  }

  for (const product of productsCurrentlyTagged) {
    if (finalRecommendations.has(product.id)) continue
    try {
      const existingMeta = (product.metadata ?? {}) as Record<string, unknown>
      const { [RECOMMENDATIONS_KEY]: _drop, [REFRESHED_AT_KEY]: _drop2, ...rest } = existingMeta
      await productModule.updateProducts!(product.id, {
        metadata: rest,
      })
      productsCleared += 1
    } catch (err: any) {
      failures += 1
      logger.warn(
        `cross-sell: failed to clear ${product.id}: ${err?.message ?? err}`
      )
    }
  }

  return {
    orders_considered: ordersConsidered,
    facts: facts.length,
    products_with_recommendations: productsWithRecommendations,
    products_cleared: productsCleared,
    failures,
  }
}
