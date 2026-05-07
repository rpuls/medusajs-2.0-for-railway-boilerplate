/**
 * Effective-DPI assessment for the customizer canvas. The "effective" DPI is
 * the source-pixel density at the *current* on-canvas size — what actually goes
 * to print — not the file's metadata DPI (which browsers strip anyway). A 4000px
 * image stretched across a 12" print box is 333 DPI; the same image cropped to
 * 1" would be 4000 DPI (overkill).
 *
 * Severity bands ought to match what your press realistically tolerates:
 *  - >=250 DPI: clean print (`ok`)
 *  - 150-249 DPI: visible softness on detail; warn inline (`warning`)
 *  - <150 DPI: visibly pixelated; block-or-vectorize moment (`critical`)
 */

export const DPI_OK_THRESHOLD = 250
export const DPI_CRITICAL_THRESHOLD = 150

export type DpiSeverity = "ok" | "warning" | "critical"

export type DpiAssessment = {
  /** The lowest effective DPI across all evaluated images. */
  worstDpi: number | null
  severity: DpiSeverity
  /** Number of image objects evaluated. Useful for "X of Y images are low-res" copy. */
  imagesEvaluated: number
  imagesBelowCritical: number
}

export function classifyDpi(dpi: number): DpiSeverity {
  if (!Number.isFinite(dpi) || dpi <= 0) return "ok"
  if (dpi >= DPI_OK_THRESHOLD) return "ok"
  if (dpi >= DPI_CRITICAL_THRESHOLD) return "warning"
  return "critical"
}

/**
 * Read the *original* source pixel width from a Fabric image, falling back to
 * the natural width on the underlying HTMLImageElement. Fabric doesn't always
 * surface this consistently across versions, so we probe in priority order.
 */
export function getFabricImageSourceWidthPx(image: any): number | null {
  if (!image || image.type !== "image") return null
  const direct = image._element?.naturalWidth ?? image._originalElement?.naturalWidth
  if (typeof direct === "number" && direct > 0) return direct
  const width = image.width
  if (typeof width === "number" && width > 0) return width
  return null
}

/**
 * Compute effective DPI for one Fabric image given the print-area scale.
 *
 * pixelsPerInch is the ratio of canvas pixels to physical inches in the print
 * area (e.g. printArea.width / 12 for a 12" print box).
 */
export function effectiveDpiForFabricImage(
  image: any,
  pixelsPerInch: number
): number | null {
  if (!Number.isFinite(pixelsPerInch) || pixelsPerInch <= 0) return null
  const sourceWidthPx = getFabricImageSourceWidthPx(image)
  if (!sourceWidthPx) return null
  const renderedWidth = image.getScaledWidth?.()
  if (!Number.isFinite(renderedWidth) || renderedWidth <= 0) return null
  const printWidthInches = renderedWidth / pixelsPerInch
  if (!Number.isFinite(printWidthInches) || printWidthInches <= 0) return null
  return sourceWidthPx / printWidthInches
}

/**
 * Walk every image on the Fabric canvas and return the worst-case DPI.
 * Use this for the "any image needs attention?" decision (modal trigger,
 * pricing-panel badge), versus the active-object check used for inline hints.
 */
export function assessCanvasDpi(
  canvas: any,
  pixelsPerInch: number
): DpiAssessment {
  if (!canvas || typeof canvas.getObjects !== "function") {
    return { worstDpi: null, severity: "ok", imagesEvaluated: 0, imagesBelowCritical: 0 }
  }
  const objects = canvas.getObjects() as any[]
  let worst: number | null = null
  let evaluated = 0
  let belowCritical = 0
  for (const obj of objects) {
    if (!obj || obj.type !== "image") continue
    const dpi = effectiveDpiForFabricImage(obj, pixelsPerInch)
    if (dpi === null) continue
    evaluated += 1
    if (dpi < DPI_CRITICAL_THRESHOLD) belowCritical += 1
    if (worst === null || dpi < worst) worst = dpi
  }
  return {
    worstDpi: worst,
    severity: worst === null ? "ok" : classifyDpi(worst),
    imagesEvaluated: evaluated,
    imagesBelowCritical: belowCritical,
  }
}
