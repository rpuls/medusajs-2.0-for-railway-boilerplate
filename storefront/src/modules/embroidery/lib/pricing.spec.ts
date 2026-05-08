import {
  calculatePrice,
  buildPriceTable,
  STANDARD_CONFIG,
  RETAIL_CONFIG,
  WHOLESALE_CONFIG,
  MAX_AUTO_PRICED_STITCHES,
} from "./pricing"

describe("calculatePrice", () => {
  it("picks the matching flat stitch tier and quantity column", () => {
    const result = calculatePrice({
      stitchCount: 7000,
      quantity: 50,
      includeDigitizing: false,
    })
    // 7000 stitches → "up to 7,000" row, qty 50 → "26–50" column.
    // Matrix lookup: 10.50.
    expect(result.unitDecorationPrice).toBe(10.5)
    expect(result.appliedTier.label).toBe("26–50")
    expect(result.decorationSubtotal).toBe(525)
    expect(result.requiresQuote).toBe(false)
  })

  it("rounds stitch count up to the next thousand-tier", () => {
    // 5,001 stitches lands in the "up to 6,000" row, not "up to 5,000".
    const result = calculatePrice({
      stitchCount: 5001,
      quantity: 1,
      includeDigitizing: false,
    })
    expect(result.unitDecorationPrice).toBe(11.25)
  })

  it("snaps qty 25 to the 1–25 column and qty 26 to 26–50", () => {
    const at25 = calculatePrice({
      stitchCount: 3000,
      quantity: 25,
      includeDigitizing: false,
    })
    const at26 = calculatePrice({
      stitchCount: 3000,
      quantity: 26,
      includeDigitizing: false,
    })
    expect(at25.unitDecorationPrice).toBe(10.5)
    expect(at26.unitDecorationPrice).toBe(9.5)
  })

  it("returns POA breakdown when stitch count exceeds the auto-priced cap", () => {
    const result = calculatePrice({
      stitchCount: MAX_AUTO_PRICED_STITCHES + 1,
      quantity: 100,
      includeDigitizing: false,
    })
    expect(result.requiresQuote).toBe(true)
    expect(result.unitDecorationPrice).toBe(0)
    expect(result.decorationSubtotal).toBe(0)
    expect(result.total).toBe(0)
  })

  it("includes the $60 digitizing fee by default and zero when opted out", () => {
    const withFee = calculatePrice({ stitchCount: 5000, quantity: 24 })
    const withoutFee = calculatePrice({
      stitchCount: 5000,
      quantity: 24,
      includeDigitizing: false,
    })
    expect(withFee.digitizingFee).toBe(60)
    expect(withoutFee.digitizingFee).toBe(0)
  })

  it("treats the wholesale alias as the same single rate card", () => {
    // Wholesale was dropped — the alias resolves to STANDARD_CONFIG so any
    // stale call site keeps working without coercing to a different price.
    expect(WHOLESALE_CONFIG).toBe(STANDARD_CONFIG)
    expect(RETAIL_CONFIG).toBe(STANDARD_CONFIG)
  })

  it("doubles the decoration unit when placementCount is 2 (both sides)", () => {
    const single = calculatePrice({
      stitchCount: 6000,
      quantity: 10,
      placementCount: 1,
      includeDigitizing: false,
    })
    const both = calculatePrice({
      stitchCount: 6000,
      quantity: 10,
      placementCount: 2,
      includeDigitizing: false,
    })
    expect(both.unitDecorationPrice).toBeCloseTo(single.unitDecorationPrice * 2, 4)
    expect(both.decorationSubtotal).toBeCloseTo(single.decorationSubtotal * 2, 4)
  })

  it("does not double the digitizing fee for placementCount 2 (same file, two passes)", () => {
    const both = calculatePrice({
      stitchCount: 6000,
      quantity: 10,
      placementCount: 2,
      includeDigitizing: true,
    })
    expect(both.digitizingFee).toBe(60)
  })

  it("flags belowMinimum only for quantities below 1 (effectively never)", () => {
    // Minimum is 1 unit; calculator clamps quantity at 1 so this is mostly
    // a no-op sanity check that the field is still wired correctly.
    const result = calculatePrice({
      stitchCount: 5000,
      quantity: 1,
      includeDigitizing: false,
    })
    expect(result.belowMinimum).toBe(false)
  })
})

describe("buildPriceTable", () => {
  it("renders the POA row at the bottom", () => {
    const table = buildPriceTable(STANDARD_CONFIG)
    const last = table.rows[table.rows.length - 1]
    expect(last.isPoaRow).toBe(true)
    expect(last.label).toMatch(/Price on application/i)
  })

  it("renders ten flat stitch rows + one POA row", () => {
    const table = buildPriceTable(STANDARD_CONFIG)
    expect(table.rows).toHaveLength(11)
    expect(table.rows[0].label).toBe("Up to 3,000")
    expect(table.rows[9].label).toBe("Up to 12,000")
  })
})
