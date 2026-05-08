/**
 * Customer-facing embroidery rate card. Mirrors the storefront source of
 * truth at {@link storefront/src/modules/embroidery/lib/pricing.ts}; both
 * sides should be edited together and verified via spec tests.
 *
 * Single price level (wholesale dropped). Stitch tiers are 1k bands from
 * 3,000 to 12,000; anything above 12,000 is "Price on application" and
 * cannot be added to cart automatically — callers must reject those before
 * pricing.
 */

export const EMBROIDERY_PRICING_VERSION = 1 as const

export const MAX_AUTO_PRICED_STITCHES = 12000

const QUANTITY_TIERS: Array<{ minQuantity: number; label: string }> = [
  { minQuantity: 1, label: "1–25" },
  { minQuantity: 26, label: "26–50" },
  { minQuantity: 51, label: "51–100" },
  { minQuantity: 101, label: "101–250" },
  { minQuantity: 251, label: "251–500" },
  { minQuantity: 501, label: "501+" },
]

const STITCH_TIERS: Array<{ maxStitches: number; prices: number[] }> = [
  { maxStitches: 3000, prices: [10.5, 9.5, 7.5, 5.5, 4.5, 3.5] },
  { maxStitches: 4000, prices: [10.75, 9.75, 7.75, 5.75, 4.75, 3.75] },
  { maxStitches: 5000, prices: [11.0, 10.0, 8.0, 6.0, 5.0, 4.0] },
  { maxStitches: 6000, prices: [11.25, 10.25, 8.25, 6.25, 5.25, 4.25] },
  { maxStitches: 7000, prices: [11.5, 10.5, 8.5, 6.5, 5.5, 4.5] },
  { maxStitches: 8000, prices: [11.75, 10.75, 8.75, 6.75, 5.75, 4.75] },
  { maxStitches: 9000, prices: [12.0, 11.0, 9.0, 7.0, 6.0, 5.0] },
  { maxStitches: 10000, prices: [12.25, 11.25, 9.25, 7.25, 6.25, 5.25] },
  { maxStitches: 11000, prices: [12.5, 11.5, 9.5, 7.5, 6.5, 5.5] },
  { maxStitches: 12000, prices: [12.75, 11.75, 9.75, 7.75, 6.75, 5.75] },
]

const DIGITIZING_FEE_MAJOR = 60

const round2 = (n: number) => Math.round(n * 100) / 100

export const resolveEmbroideryQuantityTier = (
  quantity: number
): { tierIndex: number; label: string } => {
  const safe = Math.max(1, Math.floor(quantity || 1))
  let idx = 0
  for (let i = 0; i < QUANTITY_TIERS.length; i++) {
    if (safe >= QUANTITY_TIERS[i].minQuantity) {
      idx = i
    }
  }
  return { tierIndex: idx, label: QUANTITY_TIERS[idx].label }
}

const resolveStitchTierIndex = (stitchCount: number): number => {
  const safe = Math.max(0, Math.round(stitchCount))
  return STITCH_TIERS.findIndex((tier) => safe <= tier.maxStitches)
}

/**
 * Server-priced unit calculation. Returns the per-garment unit price
 * inclusive of an amortised slice of the digitizing fee, plus the raw
 * components for breakdown display. Throws when `stitchCount` is outside
 * the auto-priced range — callers must check first and route POA designs
 * through the quote flow.
 *
 * `placementCount` defaults to 1 (front-only or back-only). Pass 2 for
 * "both sides" beanies — multiplies the decoration unit but leaves the
 * digitizing fee at 1× (same file runs on both passes).
 */
export const calculateEmbroideryUnitPriceMajor = (input: {
  stitchCount: number
  quantity: number
  includeDigitizing?: boolean
  placementCount?: number
}): {
  unitPriceMajor: number
  unitDecorationMajor: number
  digitizingFeeMajor: number
  tierIndex: number
  tierLabel: string
  placementCount: number
} => {
  if (input.stitchCount > MAX_AUTO_PRICED_STITCHES) {
    throw new Error(
      `calculateEmbroideryUnitPriceMajor called with ${input.stitchCount} stitches — above MAX_AUTO_PRICED_STITCHES (${MAX_AUTO_PRICED_STITCHES}). The route handler should reject POA designs before pricing.`
    )
  }
  const safeQuantity = Math.max(1, Math.floor(input.quantity))
  const safePlacementCount = Math.max(1, Math.floor(input.placementCount ?? 1))
  const { tierIndex, label } = resolveEmbroideryQuantityTier(safeQuantity)
  const stitchTierIndex = resolveStitchTierIndex(input.stitchCount)
  if (stitchTierIndex < 0) {
    // Defensive — shouldn't fire because of the cap above, but if a future
    // caller adds a row beyond 12k without updating the cap, this surfaces it.
    throw new Error(
      `Stitch count ${input.stitchCount} did not match any tier — rate card may be out of date.`
    )
  }
  const perPlacementPriceMajor = STITCH_TIERS[stitchTierIndex].prices[tierIndex] ?? 0
  const unitDecorationMajor = round2(perPlacementPriceMajor * safePlacementCount)
  const digitizingFeeMajor =
    input.includeDigitizing === false ? 0 : DIGITIZING_FEE_MAJOR
  const unitPriceMajor = round2(unitDecorationMajor + digitizingFeeMajor / safeQuantity)
  return {
    unitPriceMajor,
    unitDecorationMajor,
    digitizingFeeMajor,
    tierIndex,
    tierLabel: label,
    placementCount: safePlacementCount,
  }
}
