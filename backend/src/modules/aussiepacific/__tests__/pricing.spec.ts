import { priceLadderFromAussiePacific } from "../pricing"
import { buildPriceLadder } from "../../../utils/bulk-price-ladder"

describe("priceLadderFromAussiePacific", () => {
  it("matches buildPriceLadder directly when costAdjustment is 1.0", () => {
    const cost = 10
    const expected = buildPriceLadder(cost)
    expect(priceLadderFromAussiePacific(cost, 1.0)).toEqual(expected)
  })

  it("defaults costAdjustment to 1.0 when omitted", () => {
    const cost = 12.5
    const expected = buildPriceLadder(cost)
    expect(priceLadderFromAussiePacific(cost)).toEqual(expected)
  })

  it("applies costAdjustment multiplier before ladder math", () => {
    const cost = 10
    const adjustment = 1.15
    const expected = buildPriceLadder(cost * adjustment)
    expect(priceLadderFromAussiePacific(cost, adjustment)).toEqual(expected)
  })

  it("clamps non-positive / non-finite costAdjustment to 1.0", () => {
    const cost = 10
    const baseline = buildPriceLadder(cost)
    expect(priceLadderFromAussiePacific(cost, 0)).toEqual(baseline)
    expect(priceLadderFromAussiePacific(cost, -1)).toEqual(baseline)
    expect(priceLadderFromAussiePacific(cost, Number.NaN)).toEqual(baseline)
    expect(priceLadderFromAussiePacific(cost, Number.POSITIVE_INFINITY)).toEqual(
      baseline
    )
  })

  it("accepts numeric strings (AP API sometimes returns prices stringified)", () => {
    const expected = buildPriceLadder(15)
    expect(priceLadderFromAussiePacific("15", 1.0)).toEqual(expected)
  })

  it("returns null for missing/zero/negative/non-numeric price", () => {
    expect(priceLadderFromAussiePacific(undefined)).toBeNull()
    expect(priceLadderFromAussiePacific(null)).toBeNull()
    expect(priceLadderFromAussiePacific(0)).toBeNull()
    expect(priceLadderFromAussiePacific(-5)).toBeNull()
    expect(priceLadderFromAussiePacific("abc")).toBeNull()
  })

  it("produces a ladder where standard ≈ cost × 2.20 (sanity check on shared formula)", () => {
    const cost = 10
    const ladder = priceLadderFromAussiePacific(cost, 1.0)!
    // 10 × 1.1 × 1.5 / 0.75 = 22.00
    expect(ladder.standard).toBeCloseTo(22, 1)
    expect(ladder.tier100Plus).toBeCloseTo(16.5, 1)
  })
})
