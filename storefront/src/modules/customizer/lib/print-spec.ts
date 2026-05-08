/**
 * Helpers for the per-image print model. The visual print-area system in
 * `templates/index.tsx` maps the "oversize" reference (38×48 cm) onto the
 * canvas's 68% × 72% interior rectangle. Everything in this file derives
 * from that mapping so canvas-pixel measurements convert cleanly to
 * approximate real-world centimetres.
 */

import {
  getAllowedScpPrintSizesForSide,
  ScpPrintSizeId,
  SCP_A6_ONLY_SIDES,
} from "./scp-dtf-print-pricing"
import type { GarmentSide, PrintPricingSpec, PrintSpec } from "./types"

/**
 * Visual-reference physical sizes (cm). Mirrors `SCP_PRINT_SIZE_CM` in
 * templates/index.tsx; kept here so cm conversion has a self-contained
 * source of truth and tests can reach it without dragging in the canvas.
 */
export const SCP_PRINT_SIZE_REFERENCE_CM: Record<
  ScpPrintSizeId,
  { width: number; height: number }
> = {
  up_to_a6: { width: 8, height: 12 },
  up_to_a4: { width: 14, height: 20 },
  up_to_a3: { width: 19, height: 27 },
  oversize: { width: 38, height: 48 },
}

/** Tier ordering, smallest → largest. Used by the auto-snap selector. */
export const SCP_PRINT_SIZE_ORDER: ScpPrintSizeId[] = [
  "up_to_a6",
  "up_to_a4",
  "up_to_a3",
  "oversize",
]

/**
 * Constants pulled from `getPrintArea` in templates/index.tsx. Re-derived
 * here (not imported) so this module stays UI-agnostic and testable.
 */
const CANVAS_PRINT_AREA_W_RATIO = 0.68
const CANVAS_PRINT_AREA_H_RATIO = 0.72

/**
 * Convert a bounding-box pixel size on the live editor canvas to an
 * approximate physical centimetre size on the garment. Only the canvas
 * dimensions and the oversize reference are needed because every other
 * print size scales linearly off oversize.
 */
export const canvasPxToApproxCm = (
  pxWidth: number,
  pxHeight: number,
  canvasWidth: number,
  canvasHeight: number
): { width: number; height: number } => {
  if (canvasWidth <= 0 || canvasHeight <= 0) {
    return { width: 0, height: 0 }
  }
  const cmPerPxX = SCP_PRINT_SIZE_REFERENCE_CM.oversize.width /
    (canvasWidth * CANVAS_PRINT_AREA_W_RATIO)
  const cmPerPxY = SCP_PRINT_SIZE_REFERENCE_CM.oversize.height /
    (canvasHeight * CANVAS_PRINT_AREA_H_RATIO)
  return {
    width: pxWidth * cmPerPxX,
    height: pxHeight * cmPerPxY,
  }
}

/**
 * Pick the smallest tier that contains the supplied bounding box. If even
 * the largest tier is too small, returns the largest. Restricted sides
 * (e.g. printed_tag → A6) are honoured so callers don't have to remember
 * that the picker is gated.
 */
export const snapSizeForBoundingCm = (
  side: GarmentSide,
  approxCm: { width: number; height: number },
  isLongSleeve: boolean
): ScpPrintSizeId => {
  const allowed = getAllowedScpPrintSizesForSide(side, isLongSleeve)
  const orderedAllowed = SCP_PRINT_SIZE_ORDER.filter((id) => allowed.includes(id))
  if (!orderedAllowed.length) {
    return "up_to_a6"
  }
  const fits = orderedAllowed.find((id) => {
    const ref = SCP_PRINT_SIZE_REFERENCE_CM[id]
    return approxCm.width <= ref.width && approxCm.height <= ref.height
  })
  return fits ?? orderedAllowed[orderedAllowed.length - 1]
}

/**
 * Reduce a list of PrintSpec down to the pricing-only shape. Side-restricted
 * sizes are forced even if a stale manual override on the spec disagrees —
 * pricing always trusts the side restrictions to keep cart totals in sync
 * with what the customer can actually order.
 */
export const printSpecsToPricingSpecs = (specs: PrintSpec[]): PrintPricingSpec[] =>
  specs.map((spec) => ({
    side: spec.side,
    sizeId: SCP_A6_ONLY_SIDES.has(spec.side) ? "up_to_a6" : spec.sizeId,
  }))
