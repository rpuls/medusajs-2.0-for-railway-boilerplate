import { buildPriceLadder, type PriceLadder } from "../../utils/bulk-price-ladder"
import { FashionBizPrice } from "./types"

/**
 * Map the FashionBiz `prices` array to SC Prints' retail ladder.
 *
 * The FashionBiz API returns wholesale tiers like:
 *   [{tier:"1-99", price:10.5}, {tier:"100-499", price:10.4}, {tier:"500", price:10.3}]
 *
 * The "1-99" price is **not** what FashionBiz actually charges SC Prints —
 * the distributor storefront sits ~15% above it. We multiply by
 * `costAdjustment` (default 1.0, production typically 1.15) to align the
 * cost we feed into the retail ladder with what we'll actually be billed.
 *
 * Returns `null` if no usable cost can be derived (e.g. `prices` missing
 * or contains only non-numeric values).
 */
export function priceLadderFromFashionBiz(
  prices: FashionBizPrice[] | undefined | null,
  costAdjustment: number = 1.0
): PriceLadder | null {
  const cost = resolveFashionBizCost(prices, costAdjustment)
  return cost === null ? null : buildPriceLadder(cost)
}

/**
 * Resolve the adjusted ex-GST cost (AUD major units) for a FashionBiz
 * product. Returns the same number that's fed into `buildPriceLadder()`.
 * Importers persist this as `variant.metadata.cost_price_ex_gst_minor` so
 * the tier-pricing regeneration job has a single canonical input.
 */
export function resolveFashionBizCost(
  prices: FashionBizPrice[] | undefined | null,
  costAdjustment: number = 1.0
): number | null {
  if (!prices?.length) return null
  // Prefer the "1-99" tier; fall back to the lowest-quantity tier if the
  // brand uses a different first-tier label (e.g. good-mates uses "Gold").
  const oneToNn = prices.find((p) => p.tier?.trim() === "1-99")
  const fallback = prices[0]
  const source = oneToNn ?? fallback
  const cost = Number(source?.price)
  if (!Number.isFinite(cost) || cost <= 0) return null
  const adjustment =
    Number.isFinite(costAdjustment) && costAdjustment > 0 ? costAdjustment : 1.0
  return cost * adjustment
}
