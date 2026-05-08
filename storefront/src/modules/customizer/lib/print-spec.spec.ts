import {
  canvasPxToApproxCm,
  printSpecsToPricingSpecs,
  snapSizeForBoundingCm,
  SCP_PRINT_SIZE_REFERENCE_CM,
} from "./print-spec"
import type { PrintSpec } from "./types"

describe("canvasPxToApproxCm", () => {
  it("returns zero for a degenerate canvas", () => {
    expect(canvasPxToApproxCm(100, 100, 0, 100)).toEqual({ width: 0, height: 0 })
  })

  it("maps the full print area to the oversize reference (38×48)", () => {
    // canvas 1000×1000 → print area 680×720; mapping that area should land
    // at the oversize reference.
    const cm = canvasPxToApproxCm(680, 720, 1000, 1000)
    expect(cm.width).toBeCloseTo(SCP_PRINT_SIZE_REFERENCE_CM.oversize.width, 5)
    expect(cm.height).toBeCloseTo(SCP_PRINT_SIZE_REFERENCE_CM.oversize.height, 5)
  })

  it("maps half the print area to half the reference cm", () => {
    const cm = canvasPxToApproxCm(340, 360, 1000, 1000)
    expect(cm.width).toBeCloseTo(19, 1)
    expect(cm.height).toBeCloseTo(24, 1)
  })
})

describe("snapSizeForBoundingCm", () => {
  it("snaps tiny artwork to A6", () => {
    expect(snapSizeForBoundingCm("front", { width: 5, height: 8 }, { isLongSleeve: false })).toBe("up_to_a6")
  })

  it("snaps mid-sized artwork to A4", () => {
    expect(snapSizeForBoundingCm("front", { width: 12, height: 18 }, false)).toBe("up_to_a4")
  })

  it("snaps large artwork to A3", () => {
    expect(snapSizeForBoundingCm("front", { width: 18, height: 26 }, false)).toBe("up_to_a3")
  })

  it("snaps anything bigger than A3 to oversize", () => {
    expect(snapSizeForBoundingCm("front", { width: 30, height: 40 }, false)).toBe("oversize")
  })

  it("forces printed_tag to A6 regardless of bounding size", () => {
    expect(snapSizeForBoundingCm("printed_tag", { width: 30, height: 40 }, false)).toBe(
      "up_to_a6"
    )
  })

  it("limits short-sleeve sleeves to A6", () => {
    expect(snapSizeForBoundingCm("left_sleeve", { width: 18, height: 26 }, false)).toBe(
      "up_to_a6"
    )
  })

  it("allows long-sleeve sleeves to use up to A3", () => {
    expect(snapSizeForBoundingCm("left_sleeve", { width: 18, height: 26 }, true)).toBe(
      "up_to_a3"
    )
  })

  it("clamps hats to A6 on every side regardless of bounding size", () => {
    expect(
      snapSizeForBoundingCm(
        "front",
        { width: 30, height: 40 },
        { isLongSleeve: false, isHat: true }
      )
    ).toBe("up_to_a6")
    expect(
      snapSizeForBoundingCm(
        "back",
        { width: 25, height: 35 },
        { isLongSleeve: false, isHat: true }
      )
    ).toBe("up_to_a6")
  })
})

describe("printSpecsToPricingSpecs", () => {
  it("clamps printed_tag stale overrides to A6", () => {
    const specs: PrintSpec[] = [
      {
        objectId: "obj_1",
        side: "printed_tag",
        sizeId: "up_to_a3",
        manualSize: true,
        approxCm: { width: 5, height: 5 },
      },
    ]
    expect(printSpecsToPricingSpecs(specs)).toEqual([
      { side: "printed_tag", sizeId: "up_to_a6" },
    ])
  })

  it("preserves non-restricted sides as-is", () => {
    const specs: PrintSpec[] = [
      {
        objectId: "obj_1",
        side: "front",
        sizeId: "up_to_a4",
        manualSize: false,
        approxCm: { width: 12, height: 18 },
      },
    ]
    expect(printSpecsToPricingSpecs(specs)).toEqual([
      { side: "front", sizeId: "up_to_a4" },
    ])
  })
})
