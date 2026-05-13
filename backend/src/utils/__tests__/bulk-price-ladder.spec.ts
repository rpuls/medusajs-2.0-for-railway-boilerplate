import { buildPriceLadder, buildBulkPricingMetadata, toMinorAud } from "../bulk-price-ladder"

describe("bulk-price-ladder", () => {
  describe("buildPriceLadder", () => {
    /**
     * Regression guard for the AS Colour-style markup formula. Both the
     * AS Colour API importer and the FashionBiz importer use this shape;
     * any change to the math needs both importers and storefront tier
     * display to be updated in lockstep.
     */
    it("matches the canonical $6.95 cost ladder", () => {
      const ladder = buildPriceLadder(6.95)
      // tier100Plus = 6.95 * 1.65 = 11.4675 → 11.47
      expect(ladder.tier100Plus).toBe(11.47)
      // standard = 11.4675 / 0.75 = 15.29
      expect(ladder.standard).toBe(15.29)
      // base = standard (default baseMultiplier=2.2)
      expect(ladder.base).toBe(15.29)
      // tiers (15.29 * 0.85 = 12.9965 → rounds to 13.00)
      expect(ladder.tier10to19).toBe(13.76)
      expect(ladder.tier20to49).toBe(13)
      expect(ladder.tier50to99).toBe(12.23)
    })

    it("matches the $10.50 FashionBiz P400MS 1-99 tier", () => {
      const ladder = buildPriceLadder(10.5)
      // tier100Plus = 10.5 * 1.65 = 17.325 → 17.33
      expect(ladder.tier100Plus).toBe(17.33)
      // standard = 17.325 / 0.75 = 23.1
      expect(ladder.standard).toBe(23.1)
      expect(ladder.base).toBe(23.1)
      expect(ladder.tier10to19).toBe(20.79)
      expect(ladder.tier20to49).toBe(19.64)
      expect(ladder.tier50to99).toBe(18.48)
    })

    it("rounds all outputs to 2dp", () => {
      const ladder = buildPriceLadder(7.13)
      for (const v of Object.values(ladder)) {
        expect(Math.round(v * 100) / 100).toBe(v)
      }
    })
  })

  describe("buildBulkPricingMetadata", () => {
    it("emits the keys the storefront expects", () => {
      const ladder = buildPriceLadder(6.95)
      const meta = buildBulkPricingMetadata(ladder)
      expect(meta).toEqual({
        base_sale_price: 15.29,
        tier_10_to_19_price: 13.76,
        tier_20_to_49_price: 13,
        tier_50_to_99_price: 12.23,
        tier_100_plus_price: 11.47,
      })
    })
  })

  describe("toMinorAud", () => {
    it("converts dollars to cents with rounding", () => {
      expect(toMinorAud(15.29)).toBe(1529)
      expect(toMinorAud(11.4675)).toBe(1147)
      expect(toMinorAud(0)).toBe(0)
    })
  })
})
