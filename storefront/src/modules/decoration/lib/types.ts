export type DecorationMethod =
  | "embroidery"
  | "dtf"
  | "screen"
  | "uvdtf_sheet"
  | "uvdtf_applied"
  | "uv"

export type RushTier = "standard" | "priority" | "express"

export type Turnaround = {
  standard: string
  priority?: string
  express?: string
}

/** Common shape every method's `calculatePrice()` returns. Per-method designs
 *  attach extra detail under `methodDetails`. */
export type Breakdown = {
  method: DecorationMethod
  /** Per-unit decoration price excluding setup fees and rush. */
  unitPrice: number
  quantity: number
  /** unitPrice × quantity */
  decorationSubtotal: number
  /** Setup fees that don't scale with quantity (digitizing, screens, artwork, gang setup). */
  setupTotal: number
  /** Rush surcharge applied at order level. */
  rushSurcharge: number
  /** Sum of all components, ex-GST. */
  subtotalExGst: number
  /** 10% AU GST on subtotalExGst. */
  gst: number
  /** subtotalExGst + gst */
  totalIncGst: number
  belowMinimum: boolean
  rushTier: RushTier
  notes?: string[]
  /**
   * When true, this design can't be auto-priced and must go through a manual
   * quote (e.g. embroidery >12,000 stitches). Cart layers must block
   * "Add to cart" and surface a quote CTA instead. Optional so non-POA
   * methods don't need to set it explicitly.
   */
  requiresQuote?: boolean
}

export type ScreenDesign = {
  colours: number
  darkGarment: boolean
}

export type DtfDesign = {
  /** "up_to_a6" | "up_to_a4" | "up_to_a3" | "oversize" */
  sizeId: string
}

export type UvdtfDesign = {
  metres: number
  /** Only for applied — informational, no price effect. */
  substrate?: "hard_surface" | "glass" | "metal" | "wood" | "hard_plastic"
}

export type DecorationDesign = {
  method: DecorationMethod
  breakdown: Breakdown
  rushTier: RushTier
  reorder?: boolean
  /** Method-specific configuration. */
  details:
    | { method: "embroidery"; stitchCount: number }
    | { method: "dtf"; design: DtfDesign }
    | { method: "screen"; design: ScreenDesign }
    | { method: "uvdtf_sheet"; design: UvdtfDesign }
    | { method: "uvdtf_applied"; design: UvdtfDesign }
    | { method: "uv" }
}

export const DECORATION_METHOD_LABELS: Record<DecorationMethod, string> = {
  embroidery: "Embroidery",
  dtf: "DTF print",
  screen: "Screen print",
  uvdtf_sheet: "UVDTF gang sheet",
  uvdtf_applied: "UVDTF applied",
  uv: "UV print",
}
