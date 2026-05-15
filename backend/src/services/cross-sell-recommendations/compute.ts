/**
 * Pure co-purchase aggregator. Given a flat list of "(order_id,
 * product_id)" facts, returns the top-K most frequently co-purchased
 * products for each product.
 *
 * The algorithm:
 *   1. Group items by order_id, deduplicate product_ids per order.
 *   2. For every unordered pair (A, B) of distinct products in the
 *      same order, increment co-occurrence[A][B] and co-occurrence[B][A].
 *   3. For each product, sort its co-occurrence map by count desc,
 *      keep the top K product_ids whose count is >= MIN_CO_OCCURRENCE.
 *
 * "Pure" = no DB, no Medusa container. Tests use literal fixtures.
 *
 * Cost: O(sum over orders of N_products_in_order^2). For SC Prints
 * (typically 1-3 distinct products per order, sometimes more for team
 * uniforms) this is trivially fast across the full order history.
 */

export type CoPurchaseFact = {
  order_id: string
  product_id: string
}

export type Recommendation = {
  product_id: string
  recommended_product_ids: string[]
  /** Parallel array; recommended_product_ids[i] was co-purchased
   *  with product_id this many times. Useful for debugging /
   *  surfacing "ordered together N times" copy in the future. */
  co_occurrence_counts: number[]
}

export function computeCrossSellRecommendations(
  facts: CoPurchaseFact[] | null | undefined,
  options: { topK?: number; minCoOccurrence?: number } = {}
): Recommendation[] {
  const topK = Math.max(1, options.topK ?? 5)
  const minCoOccurrence = Math.max(1, options.minCoOccurrence ?? 2)
  if (!facts || facts.length === 0) return []

  // ---- Group products per order, de-dup ----
  const productsByOrder = new Map<string, Set<string>>()
  for (const fact of facts) {
    if (!fact?.order_id || !fact?.product_id) continue
    const set = productsByOrder.get(fact.order_id) ?? new Set<string>()
    set.add(fact.product_id)
    productsByOrder.set(fact.order_id, set)
  }

  // ---- Count co-occurrence per ordered pair ----
  // `pair[A].get(B) = N` means A and B appeared together in N orders.
  const pair = new Map<string, Map<string, number>>()
  for (const products of productsByOrder.values()) {
    if (products.size < 2) continue
    const arr = Array.from(products)
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const a = arr[i]
        const b = arr[j]
        const aMap = pair.get(a) ?? new Map<string, number>()
        aMap.set(b, (aMap.get(b) ?? 0) + 1)
        pair.set(a, aMap)
        const bMap = pair.get(b) ?? new Map<string, number>()
        bMap.set(a, (bMap.get(a) ?? 0) + 1)
        pair.set(b, bMap)
      }
    }
  }

  // ---- Pick top-K per product ----
  const result: Recommendation[] = []
  for (const [productId, partners] of pair.entries()) {
    const sorted = Array.from(partners.entries())
      .filter(([, count]) => count >= minCoOccurrence)
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1]
        // Stable tiebreaker so output is deterministic for tests.
        return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0
      })
      .slice(0, topK)
    if (sorted.length === 0) continue
    result.push({
      product_id: productId,
      recommended_product_ids: sorted.map(([id]) => id),
      co_occurrence_counts: sorted.map(([, count]) => count),
    })
  }

  // Deterministic order (by product_id) so persist diffs are minimal.
  result.sort((a, b) =>
    a.product_id < b.product_id ? -1 : a.product_id > b.product_id ? 1 : 0
  )
  return result
}
