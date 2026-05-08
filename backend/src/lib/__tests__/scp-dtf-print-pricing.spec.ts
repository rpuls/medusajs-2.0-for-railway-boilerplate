import {
  decoratedLocationsFromLineMetadata,
  decoratedSidesFromLineMetadata,
  decoratedSidesCountFromLineMetadata,
  resolveScpTierIndexForQuantity,
  scpPrintTotalMajorFromLocations,
  scpPrintTotalMajorPerGarmentForSides,
  scpPrintTotalMajorPerGarment,
  scpPrintUnitMajorForTier,
} from "../scp-dtf-print-pricing"

describe("scp-dtf-print-pricing", () => {
  it("maps quantity to blank-aligned tier indices", () => {
    expect(resolveScpTierIndexForQuantity(1)).toBe(0)
    expect(resolveScpTierIndexForQuantity(9)).toBe(0)
    expect(resolveScpTierIndexForQuantity(10)).toBe(1)
    expect(resolveScpTierIndexForQuantity(19)).toBe(1)
    expect(resolveScpTierIndexForQuantity(20)).toBe(2)
    expect(resolveScpTierIndexForQuantity(49)).toBe(2)
    expect(resolveScpTierIndexForQuantity(50)).toBe(3)
    expect(resolveScpTierIndexForQuantity(99)).toBe(3)
    expect(resolveScpTierIndexForQuantity(100)).toBe(4)
  })

  it("returns SCP matrix units per tier for up_to_a6", () => {
    expect(scpPrintUnitMajorForTier("up_to_a6", 0)).toBe(8.5)
    expect(scpPrintUnitMajorForTier("up_to_a6", 3)).toBe(5.5)
    expect(scpPrintUnitMajorForTier("up_to_a6", 4)).toBe(5)
  })

  it("sums print fees across decorated sides", () => {
    expect(
      scpPrintTotalMajorPerGarment({
        printSizeId: "up_to_a6",
        tierIndex: 3,
        decoratedSidesCount: 2,
      })
    ).toBe(11)
  })

  it("forces only printed tag to A6; sleeves price by selected size", () => {
    // front + left_sleeve = oversize ($15 each); printed_tag forced A6 ($8.5).
    expect(
      scpPrintTotalMajorPerGarmentForSides({
        selectedPrintSizeId: "oversize",
        tierIndex: 0,
        decoratedSides: ["front", "left_sleeve", "printed_tag"],
      })
    ).toBe(38.5)
  })

  it("counts decorated sides from customizerDesign artifacts", () => {
    expect(
      decoratedSidesCountFromLineMetadata({
        customizerDesign: {
          artifacts: [{ side: "front" }, { side: "back" }],
        },
      })
    ).toBe(2)
  })

  it("returns decorated side keys from metadata artifacts", () => {
    expect(
      decoratedSidesFromLineMetadata({
        customizerDesign: {
          artifacts: [{ side: "front" }, { side: "printed_tag" }],
        },
      })
    ).toEqual(["front", "printed_tag"])
  })

  it("returns decorated locations with optional print_size_id", () => {
    expect(
      decoratedLocationsFromLineMetadata({
        customizerDesign: {
          artifacts: [
            { side: "front", print_size_id: "up_to_a3" },
            { side: "left_sleeve" },
          ],
        },
      })
    ).toEqual([
      { side: "front", printSizeId: "up_to_a3" },
      { side: "left_sleeve", printSizeId: undefined },
    ])
  })

  it("uses per-location print size ids; only printed tag forced to A6", () => {
    // front=A3 ($12.5) + left_sleeve=oversize ($15) + printed_tag forced A6 ($8.5).
    expect(
      scpPrintTotalMajorFromLocations({
        selectedPrintSizeId: "oversize",
        tierIndex: 0,
        locations: [
          { side: "front", printSizeId: "up_to_a3" },
          { side: "left_sleeve", printSizeId: "oversize" },
          { side: "printed_tag", printSizeId: "oversize" },
        ],
      })
    ).toBe(36)
  })

  it("falls back to one side when printPlacement is present without artifacts", () => {
    expect(
      decoratedSidesCountFromLineMetadata({
        printPlacement: { version: 1 },
      })
    ).toBe(1)
  })

  it("reads per-print prints[] when present (Phase B)", () => {
    expect(
      decoratedLocationsFromLineMetadata({
        customizerDesign: {
          // artifacts is single-per-side and would underprice 2× front
          artifacts: [{ side: "front" }, { side: "back" }],
          prints: [
            { objectId: "o1", side: "front", sizeId: "up_to_a6" },
            { objectId: "o2", side: "front", sizeId: "up_to_a4" },
            { objectId: "o3", side: "back", sizeId: "up_to_a3" },
          ],
        },
      })
    ).toEqual([
      { side: "front", printSizeId: "up_to_a6" },
      { side: "front", printSizeId: "up_to_a4" },
      { side: "back", printSizeId: "up_to_a3" },
    ])
  })

  it("decoratedSidesFromLineMetadata dedupes when prints[] has multiple per side", () => {
    expect(
      decoratedSidesFromLineMetadata({
        customizerDesign: {
          prints: [
            { objectId: "o1", side: "front", sizeId: "up_to_a6" },
            { objectId: "o2", side: "front", sizeId: "up_to_a6" },
            { objectId: "o3", side: "back", sizeId: "up_to_a4" },
          ],
        },
      })
    ).toEqual(["front", "back"])
  })

  it("sums per-print pricing for two A6 prints on the front (Phase B)", () => {
    expect(
      scpPrintTotalMajorFromLocations({
        selectedPrintSizeId: "up_to_a6",
        tierIndex: 0,
        locations: [
          { side: "front", printSizeId: "up_to_a6" },
          { side: "front", printSizeId: "up_to_a6" },
        ],
      })
    ).toBe(17) // 8.5 × 2
  })
})
