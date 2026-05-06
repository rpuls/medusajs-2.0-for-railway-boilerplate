/**
 * Mirror of backend SCP Digital Print constants — keep in sync with:
 * {@link backend/src/lib/scp-dtf-print-pricing.ts}
 */

export const SCP_PRINT_PRICING_VERSION = 1 as const

export type ScpPrintSizeId = "up_to_a6" | "up_to_a4" | "up_to_a3" | "oversize"

export type ScpQuantityTier = {
  label: string
  minQuantity: number
  maxQuantity?: number
}

export const SCP_BLANK_ALIGNED_QUANTITY_TIERS: ScpQuantityTier[] = [
  { label: "Qty 1–9", minQuantity: 1, maxQuantity: 9 },
  { label: "Qty 10–19", minQuantity: 10, maxQuantity: 19 },
  { label: "Qty 20–49", minQuantity: 20, maxQuantity: 49 },
  { label: "Qty 50–99", minQuantity: 50, maxQuantity: 99 },
  { label: "Qty 100+", minQuantity: 100 },
]

export const SCP_PRINT_SIZE_OPTIONS: Array<{
  id: ScpPrintSizeId
  label: string
  dimensionsLabel: string
}> = [
  { id: "up_to_a6", label: "Up to A6", dimensionsLabel: "10×15 cm" },
  { id: "up_to_a4", label: "Up to A4", dimensionsLabel: "21×30 cm" },
  { id: "up_to_a3", label: "Up to A3", dimensionsLabel: "29×42 cm" },
  { id: "oversize", label: "Oversize", dimensionsLabel: "38×48 cm" },
]

export const SCP_PRINT_UNIT_MATRIX: Record<ScpPrintSizeId, readonly [number, number, number, number, number]> =
  {
    up_to_a6: [8.5, 7.5, 6.5, 5.5, 5],
    up_to_a4: [11, 9.5, 8.5, 7.5, 7],
    up_to_a3: [12.5, 10.5, 9.5, 8.5, 8],
    oversize: [15, 13.5, 12.5, 11.5, 11],
  }

export const DEFAULT_SCP_PRINT_SIZE_ID: ScpPrintSizeId = "up_to_a6"
// Only the printed neck tag is hard-restricted to A6 by physical print area.
// Sleeves are gated per garment type in the UI: short sleeves → A6 only,
// long sleeves → up to A3.
export const SCP_A6_ONLY_SIDES = new Set(["printed_tag"])

/**
 * Allowed SCP print sizes per side, accounting for garment cut. UI uses this
 * to filter the size tile picker; pricing trusts whatever size the customer
 * picks per location.
 */
export function getAllowedScpPrintSizesForSide(
  side: string,
  isLongSleeve: boolean
): ScpPrintSizeId[] {
  if (side === "printed_tag") {
    return ["up_to_a6"]
  }
  if (side === "left_sleeve" || side === "right_sleeve") {
    return isLongSleeve ? ["up_to_a6", "up_to_a4", "up_to_a3"] : ["up_to_a6"]
  }
  return ["up_to_a6", "up_to_a4", "up_to_a3", "oversize"]
}

export const isScpPrintSizeId = (value: unknown): value is ScpPrintSizeId =>
  value === "up_to_a6" || value === "up_to_a4" || value === "up_to_a3" || value === "oversize"

export function resolveScpTierIndexForQuantity(quantity: number): number {
  const safeQty = Math.max(1, Math.floor(quantity || 1))
  const idx = SCP_BLANK_ALIGNED_QUANTITY_TIERS.findIndex((tier) => {
    if (safeQty < tier.minQuantity) {
      return false
    }
    if (typeof tier.maxQuantity === "number" && safeQty > tier.maxQuantity) {
      return false
    }
    return true
  })
  return idx >= 0 ? idx : SCP_BLANK_ALIGNED_QUANTITY_TIERS.length - 1
}

export function scpPrintUnitMajorForTier(printSizeId: ScpPrintSizeId, tierIndex: number): number {
  const row = SCP_PRINT_UNIT_MATRIX[printSizeId]
  const idx = Math.min(Math.max(0, tierIndex), row.length - 1)
  return row[idx] ?? 0
}

export function resolveScpPrintSizeForSide(side: string, selectedPrintSizeId: ScpPrintSizeId): ScpPrintSizeId {
  return SCP_A6_ONLY_SIDES.has(side) ? "up_to_a6" : selectedPrintSizeId
}

export function scpPrintTotalMajorPerGarment(args: {
  printSizeId: ScpPrintSizeId
  tierIndex: number
  decoratedSidesCount: number
}): number {
  const sides = Math.max(0, Math.floor(args.decoratedSidesCount || 0))
  const unit = scpPrintUnitMajorForTier(args.printSizeId, args.tierIndex)
  return Math.round(unit * sides * 100) / 100
}

export function scpPrintTotalMajorPerGarmentForSides(args: {
  selectedPrintSizeId: ScpPrintSizeId
  tierIndex: number
  decoratedSides: string[]
}): number {
  const sides = args.decoratedSides.filter((s) => typeof s === "string" && s.trim().length > 0)
  if (!sides.length) {
    return 0
  }
  const total = sides.reduce((sum, side) => {
    const sizeId = resolveScpPrintSizeForSide(side, args.selectedPrintSizeId)
    return sum + scpPrintUnitMajorForTier(sizeId, args.tierIndex)
  }, 0)
  return Math.round(total * 100) / 100
}
