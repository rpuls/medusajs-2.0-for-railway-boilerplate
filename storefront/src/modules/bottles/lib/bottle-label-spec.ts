import type { HttpTypes } from "@medusajs/types"
import type { GarmentSide } from "@modules/customizer/lib/types"

export type BottleLabelDimensionsCm = {
  width: number
  height: number
}

export type BottleSpec = {
  /** Front label rectangle. Always present on bottle products. */
  frontLabelCm: BottleLabelDimensionsCm
  /** Back label rectangle. Present when the partner offers wrap-around printing. */
  backLabelCm: BottleLabelDimensionsCm | null
  /** Bottle capacity in millilitres (informational). */
  capacityMl: number | null
  /** Spirit type slug — matches storefront/src/lib/data/spirits.ts. */
  spiritType: string | null
  /** Which bottle-shop partner supplies this bottle (admin metadata only — not user-facing). */
  bottleShopId: string | null
}

const DEFAULT_FRONT_LABEL: BottleLabelDimensionsCm = { width: 8.5, height: 11 }

const readDimensions = (
  raw: unknown
): BottleLabelDimensionsCm | null => {
  if (!raw || typeof raw !== "object") return null
  const candidate = raw as Record<string, unknown>
  const w = Number(candidate.width)
  const h = Number(candidate.height)
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
    return null
  }
  return { width: w, height: h }
}

/**
 * Read the bottle spec from product metadata. Falls back to a sensible default
 * label rect when dimensions aren't set, so the customizer can still render
 * during initial setup before staff fills in the bottle-setup widget.
 */
export function getBottleSpec(
  product: HttpTypes.StoreProduct | null | undefined
): BottleSpec {
  const metadata = (product?.metadata ?? {}) as Record<string, unknown>
  return {
    frontLabelCm:
      readDimensions(metadata.bottle_label_dimensions_cm) ?? DEFAULT_FRONT_LABEL,
    backLabelCm: readDimensions(metadata.bottle_back_label_dimensions_cm),
    capacityMl:
      typeof metadata.bottle_capacity_ml === "number"
        ? metadata.bottle_capacity_ml
        : null,
    spiritType:
      typeof metadata.spirit_type === "string" ? metadata.spirit_type : null,
    bottleShopId:
      typeof metadata.bottle_shop_id === "string" ? metadata.bottle_shop_id : null,
  }
}

/**
 * Which print sides this bottle product supports. v1: front label always,
 * back label when the partner has supplied dimensions for it.
 */
export function getBottlePrintSides(spec: BottleSpec): GarmentSide[] {
  const sides: GarmentSide[] = ["bottle_label"]
  if (spec.backLabelCm) sides.push("bottle_back_label")
  return sides
}

export const BOTTLE_LABEL_SIDE_LABEL: Partial<Record<GarmentSide, string>> = {
  bottle_label: "Front label",
  bottle_back_label: "Back label",
}
