import {
  DPI_CRITICAL_THRESHOLD,
  DPI_OK_THRESHOLD,
  assessCanvasDpi,
  classifyDpi,
  effectiveDpiForFabricImage,
  getFabricImageSourceWidthPx,
} from "./dpi"

/**
 * Build a duck-typed Fabric image object exposing the small surface our DPI
 * helpers actually touch. Keeps tests independent of Fabric's internals.
 */
const fakeImage = (opts: {
  type?: string
  naturalWidth?: number | null
  fabricWidth?: number | null
  scaledWidth?: number | null
}) => ({
  type: opts.type ?? "image",
  _element: opts.naturalWidth !== undefined ? { naturalWidth: opts.naturalWidth } : undefined,
  width: opts.fabricWidth ?? undefined,
  getScaledWidth: opts.scaledWidth !== null && opts.scaledWidth !== undefined
    ? () => opts.scaledWidth
    : undefined,
})

const fakeCanvas = (objects: any[]) => ({
  getObjects: () => objects,
})

describe("classifyDpi", () => {
  it("returns 'ok' for the upper-bound threshold and above", () => {
    expect(classifyDpi(DPI_OK_THRESHOLD)).toBe("ok")
    expect(classifyDpi(DPI_OK_THRESHOLD + 50)).toBe("ok")
    expect(classifyDpi(600)).toBe("ok")
  })

  it("returns 'warning' between critical and ok thresholds", () => {
    expect(classifyDpi(DPI_CRITICAL_THRESHOLD)).toBe("warning")
    expect(classifyDpi(DPI_CRITICAL_THRESHOLD + 1)).toBe("warning")
    expect(classifyDpi(DPI_OK_THRESHOLD - 1)).toBe("warning")
  })

  it("returns 'critical' below the critical threshold", () => {
    expect(classifyDpi(DPI_CRITICAL_THRESHOLD - 1)).toBe("critical")
    expect(classifyDpi(50)).toBe("critical")
    expect(classifyDpi(1)).toBe("critical")
  })

  it("treats degenerate input as 'ok' to avoid false alarms", () => {
    expect(classifyDpi(0)).toBe("ok")
    expect(classifyDpi(-100)).toBe("ok")
    expect(classifyDpi(NaN)).toBe("ok")
    expect(classifyDpi(Infinity)).toBe("ok")
  })
})

describe("getFabricImageSourceWidthPx", () => {
  it("prefers naturalWidth from _element when present", () => {
    const image = fakeImage({ naturalWidth: 4000, fabricWidth: 800 })
    expect(getFabricImageSourceWidthPx(image)).toBe(4000)
  })

  it("falls back to Fabric width when _element is missing", () => {
    const image = fakeImage({ naturalWidth: undefined, fabricWidth: 1200 })
    expect(getFabricImageSourceWidthPx(image)).toBe(1200)
  })

  it("returns null for non-image objects so we don't compute false DPIs", () => {
    expect(getFabricImageSourceWidthPx(fakeImage({ type: "text" }))).toBeNull()
    expect(getFabricImageSourceWidthPx(null)).toBeNull()
    expect(getFabricImageSourceWidthPx(undefined)).toBeNull()
  })

  it("returns null when both sources are zero or missing", () => {
    expect(getFabricImageSourceWidthPx(fakeImage({}))).toBeNull()
    expect(getFabricImageSourceWidthPx(fakeImage({ naturalWidth: 0, fabricWidth: 0 }))).toBeNull()
  })
})

describe("effectiveDpiForFabricImage", () => {
  it("computes DPI as source-pixels / print-inches", () => {
    // 1500px image rendered at 600 canvas-px in a print box that's 50 canvas-px
    // per inch → 12-inch print width → 1500 / 12 = 125 DPI.
    const image = fakeImage({ naturalWidth: 1500, scaledWidth: 600 })
    const dpi = effectiveDpiForFabricImage(image, 50)
    expect(dpi).toBeCloseTo(125, 5)
  })

  it("returns null when print scale is invalid", () => {
    const image = fakeImage({ naturalWidth: 4000, scaledWidth: 800 })
    expect(effectiveDpiForFabricImage(image, 0)).toBeNull()
    expect(effectiveDpiForFabricImage(image, -10)).toBeNull()
    expect(effectiveDpiForFabricImage(image, NaN)).toBeNull()
  })

  it("returns null when the rendered width is missing", () => {
    const image = fakeImage({ naturalWidth: 4000, scaledWidth: 0 })
    expect(effectiveDpiForFabricImage(image, 50)).toBeNull()
  })

  it("returns null when the source size is unknown", () => {
    const image = fakeImage({ scaledWidth: 800 })
    expect(effectiveDpiForFabricImage(image, 50)).toBeNull()
  })
})

describe("assessCanvasDpi", () => {
  const pixelsPerInch = 50 // i.e. a 12" print box rendered at 600 canvas-px.

  it("returns ok-with-zero when canvas has no images", () => {
    const result = assessCanvasDpi(fakeCanvas([]), pixelsPerInch)
    expect(result).toEqual({
      worstDpi: null,
      severity: "ok",
      imagesEvaluated: 0,
      imagesBelowCritical: 0,
    })
  })

  it("returns the worst DPI across multiple images", () => {
    const images = [
      // 4000px @ 600 = 8 inches → 500 DPI (ok)
      fakeImage({ naturalWidth: 4000, scaledWidth: 400 }),
      // 1000px @ 600 = 12 inches → 83 DPI (critical)
      fakeImage({ naturalWidth: 1000, scaledWidth: 600 }),
      // 1500px @ 600 = 12 inches → 125 DPI (critical)
      fakeImage({ naturalWidth: 1500, scaledWidth: 600 }),
    ]
    const result = assessCanvasDpi(fakeCanvas(images), pixelsPerInch)
    expect(result.imagesEvaluated).toBe(3)
    expect(result.imagesBelowCritical).toBe(2)
    expect(result.severity).toBe("critical")
    // worst is the 1000px one ≈ 83.33 DPI
    expect(result.worstDpi).toBeCloseTo(83.33, 1)
  })

  it("ignores non-image objects (text, shapes)", () => {
    const objects = [
      fakeImage({ type: "text" }),
      fakeImage({ type: "rect" }),
      fakeImage({ naturalWidth: 800, scaledWidth: 600 }),
    ]
    const result = assessCanvasDpi(fakeCanvas(objects), pixelsPerInch)
    expect(result.imagesEvaluated).toBe(1)
  })

  it("classifies the worst image into the right severity band", () => {
    const okOnly = fakeCanvas([fakeImage({ naturalWidth: 4000, scaledWidth: 600 })])
    expect(assessCanvasDpi(okOnly, pixelsPerInch).severity).toBe("ok")

    const warnOnly = fakeCanvas([fakeImage({ naturalWidth: 2000, scaledWidth: 600 })])
    // 2000 / 12 = 166.67 → warning
    expect(assessCanvasDpi(warnOnly, pixelsPerInch).severity).toBe("warning")

    const criticalOnly = fakeCanvas([fakeImage({ naturalWidth: 800, scaledWidth: 600 })])
    expect(assessCanvasDpi(criticalOnly, pixelsPerInch).severity).toBe("critical")
  })

  it("returns ok when canvas argument is falsy", () => {
    expect(assessCanvasDpi(null, pixelsPerInch).severity).toBe("ok")
    expect(assessCanvasDpi({}, pixelsPerInch).severity).toBe("ok")
  })
})
