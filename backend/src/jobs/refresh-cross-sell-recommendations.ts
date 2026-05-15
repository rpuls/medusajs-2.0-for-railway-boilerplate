import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { CROSS_SELL_ENABLED } from "../lib/constants"
import { refreshCrossSellRecommendations } from "../services/cross-sell-recommendations/refresh"

/**
 * Nightly cross-sell refresh at 02:00 UTC (~12:00 AEST). Walks all
 * non-cancelled orders, counts co-purchase pairs, writes top-K
 * recommendations to `product.metadata.cross_sell_product_ids`.
 * Opt-in via `CROSS_SELL_ENABLED=true`.
 *
 * Idempotent — running it twice in a row produces the same metadata
 * state. Stale recommendations (pairs that no longer meet the
 * threshold) are cleared on each run.
 */
export default async function refreshCrossSellRecommendationsJob(
  container: MedusaContainer
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (!CROSS_SELL_ENABLED) {
    logger.info("refresh-cross-sell-recommendations: CROSS_SELL_ENABLED not 'true' — skipping.")
    return
  }
  try {
    const result = await refreshCrossSellRecommendations(container)
    logger.info(
      `refresh-cross-sell-recommendations: orders=${result.orders_considered} facts=${result.facts} with_recs=${result.products_with_recommendations} cleared=${result.products_cleared} failures=${result.failures}`
    )
  } catch (err: any) {
    logger.error(`refresh-cross-sell-recommendations: ${err?.message ?? err}`)
  }
}

export const config = {
  name: "refresh-cross-sell-recommendations",
  schedule: "0 2 * * *",
}
