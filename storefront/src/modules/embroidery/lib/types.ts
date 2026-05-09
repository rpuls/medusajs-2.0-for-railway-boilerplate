export type StitchTier = {
  /**
   * Upper bound of stitch count for this tier (inclusive). The last tier has
   * `maxStitches: null`. A `null` row plus `isIncrementalRow: true` means
   * "+per-1k stitches" pricing; a `null` row plus `isPoaRow: true` means
   * "Price on application" — pricing is unavailable and the customer must
   * request a quote.
   */
  maxStitches: number | null
  /** Per-unit price for this stitch tier × the matching quantity tier. Empty for POA rows. */
  prices: number[]
  isIncrementalRow?: boolean
  /**
   * When true, designs in this tier cannot be auto-priced and must go through
   * a manual quote. Mutually exclusive with `isIncrementalRow`. Used to gate
   * the cart "Add" button — POA designs surface a "Get a quote" CTA instead.
   */
  isPoaRow?: boolean
}

export type QuantityTier = {
  /** Lower bound of order quantity (inclusive). */
  minQuantity: number
  label: string
}

export type PricingConfig = {
  id: string
  label: string
  /** Minimum order quantity. Below this, `belowMinimum` is true on the breakdown. */
  minimumQuantity: number
  /** Quantity tiers, ordered ascending by `minQuantity`. */
  quantityTiers: QuantityTier[]
  /** Stitch tiers, ordered ascending by `maxStitches`. Final tier should have `maxStitches: null` and `isIncrementalRow: true`. */
  stitchTiers: StitchTier[]
  /** One-off digitizing fee charged once per design. */
  digitizingFee: number
}

export type Breakdown = {
  level: PricingConfig
  stitchCount: number
  quantity: number
  effectiveQuantity: number
  appliedTier: QuantityTier
  unitDecorationPrice: number
  decorationSubtotal: number
  digitizingFee: number
  total: number
  belowMinimum: boolean
  consolidatedQuantity: boolean
  /**
   * When true the design fell into a POA tier — `unitDecorationPrice` /
   * `decorationSubtotal` / `total` are zero and the cart layer must block
   * "Add to cart" in favour of a "Get a quote" CTA.
   */
  requiresQuote: boolean
}

export type ArchMode = "straight" | "arch_up" | "arch_down"

export type LetteringConfig = {
  text: string
  font: string
  heightMm: number
  archMode: ArchMode
}

export type ArtworkConfig = {
  fileName?: string
  fileSize?: number
  manualStitchCount?: number
  /** Populated by Phase 2 AI analysis */
  aiEstimate?: {
    stitchesMin: number
    stitchesMax: number
    complexity: "low" | "medium" | "high"
    notes?: string
  }
}

/**
 * Where on the garment the embroidery sits. Beanies offer front, back,
 * left side, or right side — each is a single embroidery pass on one face
 * of the cap. The legacy "both" value is preserved for back-compat with
 * any cart lines or saved designs from before the picker was split into
 * left/right; new flows never produce it.
 */
export type EmbroideryPlacement = "front" | "back" | "left" | "right" | "both"

/**
 * Number of physical embroidery passes per garment for a given placement.
 * Used by the pricing model to multiply the per-unit decoration cost; the
 * digitizing fee stays at 1× because it's a per-design setup (same logo
 * reuses the digitised file across passes).
 *
 * "both" (legacy) means front + back — 2× decoration cost. Every current
 * placement is a single pass and returns 1.
 */
export const placementCount = (placement: EmbroideryPlacement): number =>
  placement === "both" ? 2 : 1

export type EmbroideryDesign = {
  type: "lettering" | "artwork"
  stitchCount: number
  lettering?: LetteringConfig
  artwork?: ArtworkConfig
  pricing: Breakdown
  /** Where the embroidery is placed on the garment. Defaults to "front" when omitted. */
  placement?: EmbroideryPlacement
}
