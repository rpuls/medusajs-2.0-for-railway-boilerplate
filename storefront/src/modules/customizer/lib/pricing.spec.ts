import { calculatePricing } from "./pricing"

// Field names retain `Cents` for stability; values are major-unit decimals (dollars).
describe("calculatePricing", () => {
  it("applies side surcharges and quantity discounts", () => {
    const pricing = calculatePricing({
      basePriceCents: 20,
      decoratedSidesCount: 3,
      totalQuantity: 50,
    })

    expect(pricing.sideSurchargePerUnitCents).toBe(7.5)
    expect(pricing.quantityDiscountRate).toBe(0.15)
    expect(pricing.discountedUnitPriceCents).toBeCloseTo(23.38, 2)
    expect(pricing.totalPriceCents).toBeCloseTo(1168.75, 2)
  })

  it("keeps quantity at minimum one for calculations", () => {
    const pricing = calculatePricing({
      basePriceCents: 15,
      decoratedSidesCount: 1,
      totalQuantity: 0,
    })

    expect(pricing.totalPriceCents).toBeCloseTo(17.5, 2)
  })

  it("uses SCP tiered print dollars when scpPrint is set", () => {
    const pricing = calculatePricing({
      basePriceCents: 20,
      decoratedSidesCount: 2,
      totalQuantity: 50,
      scpPrint: { printSizeId: "up_to_a6" },
    })

    // Qty 50 → tier index 3 → $5.5 per location × 2 sides = $11/garment
    expect(pricing.sideSurchargePerUnitCents).toBe(11)
  })

  it("forces only printed_tag to A6 tier price; sleeves take selected size", () => {
    const pricing = calculatePricing({
      basePriceCents: 20,
      decoratedSidesCount: 3,
      decoratedSides: ["front", "left_sleeve", "printed_tag"],
      totalQuantity: 10,
      scpPrint: { printSizeId: "up_to_a3" },
    })

    // Qty 10 => tier 1: A3 front $10.5 + A3 sleeve $10.5 + A6 printed tag $7.5 = $28.5
    expect(pricing.sideSurchargePerUnitCents).toBe(28.5)
  })

  it("sums per-print pricing when prints[] is supplied (Phase B)", () => {
    // Two A6s on the front + one A4 on the back at qty 1 (tier 0).
    // A6 tier-0 = $8.50, A4 tier-0 = $11. Total = 8.5 + 8.5 + 11 = $28.
    const pricing = calculatePricing({
      basePriceCents: 25,
      decoratedSidesCount: 2,
      decoratedSides: ["front", "back"],
      totalQuantity: 1,
      scpPrint: { printSizeId: "up_to_a6" },
      prints: [
        { side: "front", sizeId: "up_to_a6" },
        { side: "front", sizeId: "up_to_a6" },
        { side: "back", sizeId: "up_to_a4" },
      ],
    })

    expect(pricing.sideSurchargePerUnitCents).toBeCloseTo(28, 2)
  })

  it("forces printed_tag prints to A6 even when prints[] requests larger", () => {
    const pricing = calculatePricing({
      basePriceCents: 25,
      decoratedSidesCount: 1,
      decoratedSides: ["printed_tag"],
      totalQuantity: 1,
      scpPrint: { printSizeId: "up_to_a3" },
      // Stale override on the spec — pricing must clamp to A6.
      prints: [{ side: "printed_tag", sizeId: "up_to_a3" }],
    })

    // Tier 0 A6 = $8.50 (not A3 $12.50).
    expect(pricing.sideSurchargePerUnitCents).toBeCloseTo(8.5, 2)
  })

  it("ignores prints[] when empty and falls back to side-level pricing", () => {
    const pricing = calculatePricing({
      basePriceCents: 25,
      decoratedSidesCount: 1,
      decoratedSides: ["front"],
      totalQuantity: 1,
      scpPrint: { printSizeId: "up_to_a4" },
      prints: [],
    })

    expect(pricing.sideSurchargePerUnitCents).toBe(11)
  })

  it("uses bulk tiers as base unit pricing when provided", () => {
    const pricing = calculatePricing({
      basePriceCents: 30,
      decoratedSidesCount: 2,
      totalQuantity: 55,
      bulkPricingTiers: [
        { minQuantity: 1, maxQuantity: 9, amountCents: 23.9 },
        { minQuantity: 10, maxQuantity: 49, amountCents: 21.51 },
        { minQuantity: 50, maxQuantity: 99, amountCents: 19.12 },
        { minQuantity: 100, amountCents: 17.92 },
      ],
    })

    expect(pricing.hasBulkPricing).toBe(true)
    expect(pricing.baseUnitPriceCents).toBe(19.12)
    expect(pricing.sideSurchargePerUnitCents).toBe(5)
    expect(pricing.discountedUnitPriceCents).toBeCloseTo(24.12, 2)
    expect(pricing.totalPriceCents).toBeCloseTo(1326.6, 2)
  })
})
