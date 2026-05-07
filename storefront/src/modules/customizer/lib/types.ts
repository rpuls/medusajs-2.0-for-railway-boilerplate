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
}
