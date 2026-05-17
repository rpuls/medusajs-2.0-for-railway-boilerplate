import { buildPriceLadder, type PriceLadder } from "../../utils/bulk-price-ladder"

/**
 * Map an Aussie Pacific variant `price` to SC Prints' retail ladder.
 *
 * AP returns a single wholesale price per variant (`price` field, AUD).
 * We assume this is ex-GST cost — same convention as AS Colour and the
 * FashionBiz "1-99" tier — and feed it through `buildPriceLadder()` to
 * produce the standard 5-tier retail ladder (qty 1-9 / 10-19 / 20-49 /
 * 50-99 / 100+).
 *
 * `costAdjustment` is the calibration dial:
 *   1.0  — API price is the actual ex-GST cost (default)
 *   0.909 — if AP returns inc-GST prices (= 1 / 1.1)
 *   1.15  — if AP's published price is below the trade rate, like FashionBiz's
 *           distributor storefront vs the public-API "1-99" tier
 *
 * Returns `null` when no usable cost can be derived so callers can skip + warn.
 */
export function priceLadderFromAussiePacific(
  price: number | string | undefined | null,
  costAdjustment: number = 1.0
): PriceLadder | null {
  const cost = typeof price === "number" ? price : Number(price)
  if (!Number.isFinite(cost) || cost <= 0) return null
  const adjustment =
    Number.isFinite(costAdjustment) && costAdjustment > 0 ? costAdjustment : 1.0
  return buildPriceLadder(cost * adjustment)
}
