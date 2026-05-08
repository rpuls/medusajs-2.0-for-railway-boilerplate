export type GarmentSide = "front" | "back" | "left_sleeve" | "right_sleeve" | "printed_tag"

export type CustomizerElementType = "image" | "text" | "shape"

export type SideLayout = {
  side: GarmentSide
  objects: Record<string, unknown>[]
}

export type SizeQuantity = {
  size: string
  quantity: number
}

import type { ScpPrintSizeId } from "@modules/customizer/lib/scp-dtf-print-pricing"

export type PricingInput = {
  basePriceCents: number
  decoratedSidesCount: number
  decoratedSides?: GarmentSide[]
  totalQuantity: number
  bulkPricingTiers?: BulkPricingTier[]
  /** When set, garment-side pricing adds SCP tiered print dollars instead of the flat per-side surcharge. */
  scpPrint?: {
    printSizeId: ScpPrintSizeId
  }
  /**
   * Phase-2 per-image pricing model. When supplied, the price per garment is
   * the sum of `unitMatrix[print.sizeId][quantityTier]` over every print —
   * one entry per top-level Fabric object that the customer placed. Passing
   * this overrides the legacy `decoratedSides` × `scpPrint.printSizeId`
   * calculation; orders that pre-date this rollout still go through the
   * legacy path because they don't carry `prints`.
   */
  prints?: PrintPricingSpec[]
}

/** Pricing-only view of a single logical print (one heat-press transfer). */
export type PrintPricingSpec = {
  side: GarmentSide
  sizeId: ScpPrintSizeId
}

export type BulkPricingTier = {
  minQuantity: number
  maxQuantity?: number
  amountCents: number
}

export type PricingBreakdown = {
  baseUnitPriceCents: number
  sideSurchargePerUnitCents: number
  sideSurchargeTotalCents: number
  quantityDiscountRate: number
  hasBulkPricing: boolean
  activeBulkTier?: BulkPricingTier
  bulkPricingTiers?: BulkPricingTier[]
  discountedUnitPriceCents: number
  totalPriceCents: number
}

export type RenderPlacement = {
  x: number
  y: number
  width: number
  height: number
}

export type RenderSidePayload = {
  side: GarmentSide
  artworkSvg: string
  garmentImageUrl: string | null
  placement: RenderPlacement
}

export type RenderArtifact = {
  side: GarmentSide
  printUrl: string | null
  mockupUrl: string | null
}

/** Max length for `printNotes` on cart line metadata (keep payloads small for Medusa). */
export const CUSTOMIZER_PRINT_NOTES_MAX_LENGTH = 2000

export type CustomerOriginalFileRef = {
  /** Public object-storage URL; bytes match the customer’s upload (not the rendered print PNG). */
  url: string
  fileName: string
  mimeType: string
}

export type CustomizerMetadata = {
  version: 2
  type: "fabric_customizer"
  productId: string
  variantId: string
  sideLayouts: SideLayout[]
  printArea: RenderPlacement
  sizes: SizeQuantity[]
  pricing: PricingBreakdown
  artifacts: RenderArtifact[]
  /** Customer instructions for production; omitted when empty. */
  printNotes?: string
  /** Hosted copies of uploaded source files (PNG/JPEG/SVG); omitted when storage unavailable. */
  customerOriginalFiles?: CustomerOriginalFileRef[]
  /** SCP digital print size for this line; persisted so an "edit from cart" flow can restore it. */
  scpPrintSizeId?: string
  /**
   * Customer opted in to a paid artwork vectorization / upscaling service after
   * the live DPI check flagged the artwork as too low-resolution for clean print.
   * Surfaced in the admin so the team can charge / process accordingly.
   */
  requiresVectorization?: boolean
  /**
   * Which garment side the customer was viewing when the design was saved /
   * cart-added. Re-hydration restores it so re-opening a back-of-hoodie design
   * doesn't dump the customer onto the front and make them hunt for their work.
   */
  activeSide?: GarmentSide
  /**
   * Per-image print specifications — one entry per top-level Fabric object
   * the customer placed. Drives per-print pricing and is the production-side
   * source of truth for which transfers to cut and how big each one is.
   * Absent on legacy orders (before per-print pricing rolled out); those keep
   * working through the side-level fallback in pricing/cart code.
   */
  prints?: PrintSpec[]
}

/**
 * Logical "print" record. One per top-level Fabric object on a side; multiple
 * per side are allowed (capped in UI to keep the print room sane). The size
 * tier determines pricing; manualSize=false means we may auto-snap on the
 * next bounding-box change, true means the customer locked it explicitly.
 */
export type PrintSpec = {
  /** Stable customizer object id (matches `customizerId` on the Fabric object). */
  objectId: string
  side: GarmentSide
  sizeId: ScpPrintSizeId
  /** True when the customer has explicitly chosen a size for this print. */
  manualSize: boolean
  /** Approximate physical print size on the garment (cm). */
  approxCm: { width: number; height: number }
}
