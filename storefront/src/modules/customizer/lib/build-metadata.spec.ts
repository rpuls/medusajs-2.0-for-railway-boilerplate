import { buildCustomizerMetadataBase } from "./build-metadata"
import { CUSTOMIZER_PRINT_NOTES_MAX_LENGTH, type PricingBreakdown } from "./types"

const basePricing: PricingBreakdown = {
  baseUnitPriceCents: 25,
  sideSurchargePerUnitCents: 0,
  sideSurchargeTotalCents: 0,
  quantityDiscountRate: 0,
  hasBulkPricing: false,
  discountedUnitPriceCents: 25,
  totalPriceCents: 25,
}

const baseInput = {
  productId: "prod_1",
  sideLayoutsBySide: { front: [{ id: "obj-1" }] },
  printArea: { x: 0.4, y: 0.6, width: 600.7, height: 800.2 },
  sizes: [{ size: "M", quantity: 5 }],
  pricing: basePricing,
}

describe("buildCustomizerMetadataBase", () => {
  it("emits all five sides even when only some have layouts", () => {
    const meta = buildCustomizerMetadataBase(baseInput)
    const sides = meta.sideLayouts.map((s) => s.side)
    expect(sides).toEqual(["front", "back", "left_sleeve", "right_sleeve", "printed_tag"])
    expect(meta.sideLayouts.find((s) => s.side === "front")?.objects).toHaveLength(1)
    expect(meta.sideLayouts.find((s) => s.side === "back")?.objects).toEqual([])
  })

  it("rounds printArea to integer pixels for stable cart payloads", () => {
    const meta = buildCustomizerMetadataBase(baseInput)
    expect(meta.printArea).toEqual({ x: 0, y: 1, width: 601, height: 800 })
  })

  it("defaults artifacts to empty array (save-without-ordering flow)", () => {
    const meta = buildCustomizerMetadataBase(baseInput)
    expect(meta.artifacts).toEqual([])
  })

  it("preserves passed artifacts", () => {
    const artifacts = [{ side: "front" as const, printUrl: "p", mockupUrl: "m" }]
    const meta = buildCustomizerMetadataBase({ ...baseInput, artifacts })
    expect(meta.artifacts).toEqual(artifacts)
  })

  it("trims and caps printNotes; omits the field when empty after trim", () => {
    const empty = buildCustomizerMetadataBase({ ...baseInput, printNotes: "   " })
    expect(empty.printNotes).toBeUndefined()

    const long = "x".repeat(CUSTOMIZER_PRINT_NOTES_MAX_LENGTH + 50)
    const trimmed = buildCustomizerMetadataBase({ ...baseInput, printNotes: long })
    expect(trimmed.printNotes).toHaveLength(CUSTOMIZER_PRINT_NOTES_MAX_LENGTH)
  })

  it("omits customerOriginalFiles when none provided or empty", () => {
    const noField = buildCustomizerMetadataBase(baseInput)
    expect(noField.customerOriginalFiles).toBeUndefined()

    const empty = buildCustomizerMetadataBase({ ...baseInput, customerOriginalFiles: [] })
    expect(empty.customerOriginalFiles).toBeUndefined()
  })

  it("includes customerOriginalFiles when provided", () => {
    const files = [{ url: "u", fileName: "f.png", mimeType: "image/png" }]
    const meta = buildCustomizerMetadataBase({ ...baseInput, customerOriginalFiles: files })
    expect(meta.customerOriginalFiles).toEqual(files)
  })

  it("omits requiresVectorization unless explicitly true", () => {
    expect(
      buildCustomizerMetadataBase(baseInput).requiresVectorization
    ).toBeUndefined()
    expect(
      buildCustomizerMetadataBase({ ...baseInput, requiresVectorization: false })
        .requiresVectorization
    ).toBeUndefined()
    expect(
      buildCustomizerMetadataBase({ ...baseInput, requiresVectorization: true })
        .requiresVectorization
    ).toBe(true)
  })

  it("sets the schema version + type marker every time", () => {
    const meta = buildCustomizerMetadataBase(baseInput)
    expect(meta.version).toBe(2)
    expect(meta.type).toBe("fabric_customizer")
  })

  it("omits activeSide when not provided", () => {
    expect(buildCustomizerMetadataBase(baseInput).activeSide).toBeUndefined()
  })

  it("preserves activeSide when provided so re-edit lands on the right side", () => {
    expect(
      buildCustomizerMetadataBase({ ...baseInput, activeSide: "back" }).activeSide
    ).toBe("back")
    expect(
      buildCustomizerMetadataBase({ ...baseInput, activeSide: "left_sleeve" }).activeSide
    ).toBe("left_sleeve")
  })
})
