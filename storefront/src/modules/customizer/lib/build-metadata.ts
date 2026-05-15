import {
  CUSTOMIZER_PRINT_NOTES_MAX_LENGTH,
  type CustomerOriginalFileRef,
  type CustomizerMetadata,
  type DecorationMethod,
  type EmbroideryConfig,
  type GarmentSide,
  type PricingBreakdown,
  type PrintSpec,
  type RenderArtifact,
  type RenderPlacement,
  type SizeQuantity,
} from "./types"

const DESIGN_SIDES: GarmentSide[] = [
  "front",
  "back",
  "left_sleeve",
  "right_sleeve",
  "printed_tag",
]

export type BuildCustomizerMetadataInput = {
  productId: string
  /** Side → array of serialised Fabric objects. Missing sides default to empty. */
  sideLayoutsBySide: Partial<Record<GarmentSide, Record<string, unknown>[]>>
  printArea: RenderPlacement
  sizes: SizeQuantity[]
  pricing: PricingBreakdown
  /** Server-rendered print + mockup URLs. Empty for "save without ordering" flows. */
  artifacts?: RenderArtifact[]
  scpPrintSizeId?: string
  /** Raw text from the customizer; this helper trims + caps it. */
  printNotes?: string
  /** Already-uploaded source files (Phase 4). Empty when nothing to attach. */
  customerOriginalFiles?: CustomerOriginalFileRef[]
  /** Phase 4 vectorization upsell flag. */
  requiresVectorization?: boolean
  /** Side the customer was viewing at save/cart-add time; restored on re-edit. */
  activeSide?: GarmentSide
  /** Per-image print specs (per-print pricing). Empty array → legacy side-level pricing. */
  prints?: PrintSpec[]
  /**
   * v3+: per-side decoration method. Sides not listed default to "print".
   * Carry only the sides the customer explicitly configured.
   */
  sideDecorationMethods?: Partial<Record<GarmentSide, DecorationMethod>>
  /**
   * v3+: per-side embroidery config (mm dimensions, stitch count, fees).
   * Carry only sides whose method is "embroidery".
   */
  sideEmbroideryConfigs?: Partial<Record<GarmentSide, EmbroideryConfig>>
}

/**
 * Build the variant-agnostic base of a CustomizerMetadata payload — shared by
 * both "Add to cart" (which then layers on `variantId` per garment variant) and
 * "Save to my designs" (which sets `variantId` once for the whole saved design).
 *
 * Centralised here so adding a new field to CustomizerMetadata is a one-file
 * change instead of two near-identical inline builders drifting apart.
 */
export function buildCustomizerMetadataBase(
  input: BuildCustomizerMetadataInput
): Omit<CustomizerMetadata, "variantId"> {
  const trimmedNotes = input.printNotes?.trim().slice(0, CUSTOMIZER_PRINT_NOTES_MAX_LENGTH) ?? ""
  const customerFiles =
    input.customerOriginalFiles && input.customerOriginalFiles.length > 0
      ? input.customerOriginalFiles
      : null

  // If any side is configured for embroidery, bump the metadata version to 3
  // so downstream code knows to look for sideDecorationMethods. v2 carts
  // continue to write version: 2 (print-only) for cleaner audit trails.
  const hasEmbroidery =
    input.sideDecorationMethods &&
    Object.values(input.sideDecorationMethods).some((m) => m === "embroidery")
  const version: 2 | 3 = hasEmbroidery ? 3 : 2

  const methodEntries = input.sideDecorationMethods
    ? Object.entries(input.sideDecorationMethods).filter(([, v]) => Boolean(v))
    : []
  const embroideryEntries = input.sideEmbroideryConfigs
    ? Object.entries(input.sideEmbroideryConfigs).filter(([, v]) => Boolean(v))
    : []

  return {
    version,
    type: "fabric_customizer",
    productId: input.productId,
    sideLayouts: DESIGN_SIDES.map((side) => ({
      side,
      objects: input.sideLayoutsBySide[side] ?? [],
    })),
    printArea: {
      x: Math.round(input.printArea.x),
      y: Math.round(input.printArea.y),
      width: Math.round(input.printArea.width),
      height: Math.round(input.printArea.height),
    },
    sizes: input.sizes,
    pricing: input.pricing,
    artifacts: input.artifacts ?? [],
    ...(input.scpPrintSizeId ? { scpPrintSizeId: input.scpPrintSizeId } : {}),
    ...(trimmedNotes ? { printNotes: trimmedNotes } : {}),
    ...(customerFiles ? { customerOriginalFiles: customerFiles } : {}),
    ...(input.requiresVectorization ? { requiresVectorization: true } : {}),
    ...(input.activeSide ? { activeSide: input.activeSide } : {}),
    ...(input.prints && input.prints.length > 0 ? { prints: input.prints } : {}),
    ...(methodEntries.length > 0
      ? { sideDecorationMethods: Object.fromEntries(methodEntries) as Partial<Record<GarmentSide, DecorationMethod>> }
      : {}),
    ...(embroideryEntries.length > 0
      ? { sideEmbroideryConfigs: Object.fromEntries(embroideryEntries) as Partial<Record<GarmentSide, EmbroideryConfig>> }
      : {}),
  }
}

/**
 * Read the decoration method for a side, defaulting to "print" when the
 * metadata is v2 (no method specified) or the side isn't explicitly listed.
 * Use this everywhere instead of accessing the map directly so v2 metadata
 * continues to read as all-print.
 */
export function getSideDecorationMethod(
  metadata: Pick<CustomizerMetadata, "sideDecorationMethods"> | null | undefined,
  side: GarmentSide
): DecorationMethod {
  return metadata?.sideDecorationMethods?.[side] ?? "print"
}
