/**
 * Bulk-pricing ladder shared by every catalog importer that ingests a
 * single wholesale "cost" price and produces SC Prints' standard 5-tier
 * retail ladder (qty 1-9 / 10-19 / 20-49 / 50-99 / 100+).
 *
 *   cost     = supplier trade price (ex GST), AUD major units (dollars)
 *   100+     = cost * 1.10 * 1.5  (= cost * 1.65, GST-inclusive floor)
 *   standard = 100+ / 0.75        (= cost * 2.20)
 *   10-19    = standard * 0.90
 *   20-49    = standard * 0.85
 *   50-99    = standard * 0.80
 *   base     = standard           (covers Medusa qty 1-9)
 *
 * Originally ported from `scripts/build_as_colour_import_csv.py`.
 *
 * NOTE: a separate, slightly different formula (`tiersFromCostMinor` in
 * `backend/src/utils/as-colour-tier-math.ts`) is used by the CSV-generation
 * scripts. Do not unify them blindly — the math is different on purpose.
 */

export type PriceLadder = {
  base: number
  tier10to19: number
  tier20to49: number
  tier50to99: number
  tier100Plus: number
  standard: number
}

const round2 = (n: number) => Math.round(n * 100) / 100

export const buildPriceLadder = (
  cost: number,
  baseMultiplier = 2.2
): PriceLadder => {
  const tier100PlusVal = cost * 1.1 * 1.5
  const standard = tier100PlusVal / 0.75
  const baseVal = (standard * baseMultiplier) / 2.2

  return {
    base: round2(baseVal),
    tier10to19: round2(standard * 0.9),
    tier20to49: round2(standard * 0.85),
    tier50to99: round2(standard * 0.8),
    tier100Plus: round2(tier100PlusVal),
    standard: round2(standard),
  }
}

/** Convert a major-unit AUD value to Medusa minor units (cents). */
export const toMinorAud = (major: number): number => Math.round(major * 100)

/**
 * Build the `metadata.bulk_pricing` block in the same shape the spreadsheet
 * importer + storefront tier-pricing rendering already consume.
 */
export const buildBulkPricingMetadata = (ladder: PriceLadder) => ({
  base_sale_price: ladder.base,
  tier_10_to_19_price: ladder.tier10to19,
  tier_20_to_49_price: ladder.tier20to49,
  tier_50_to_99_price: ladder.tier50to99,
  tier_100_plus_price: ladder.tier100Plus,
})
