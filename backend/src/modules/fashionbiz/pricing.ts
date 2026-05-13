import { buildPriceLadder, type PriceLadder } from "../../utils/bulk-price-ladder"
import { FashionBizPrice } from "./types"

/**
 * Map the FashionBiz `prices` array to SC Prints' retail ladder.
 *
 * The FashionBiz API returns wholesale tiers like:
 *   [{tier:"1-99", price:10.5}, {tier:"100-499", price:10.4}, {tier:"500", price:10.3}]
 *
 * We treat the 1-99 tier as the supplier cost and run it through the same
 * markup ladder AS Colour uses, so customer-facing prices stay consistent
 * across the catalog regardless of supplier.
 *
 * Returns `null` if no usable cost can be derived (e.g. `prices` missing
 * or contains only "Gold" / non-1-99 tiers).
 */
export function priceLadderFromFashionBiz(
  prices: FashionBizPrice[] | undefined | null
): PriceLadder | null {
  if (!prices?.length) return null
  // Prefer the "1-99" tier; fall back to the lowest-quantity tier if the
  // brand uses a different first-tier label (e.g. good-mates uses "Gold").
  const oneToNn = prices.find((p) => p.tier?.trim() === "1-99")
  const fallback = prices[0]
  const source = oneToNn ?? fallback
  const cost = Number(source?.price)
  if (!Number.isFinite(cost) || cost <= 0) return null
  return buildPriceLadder(cost)
}
