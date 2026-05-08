import { convertToLocale } from "@lib/util/money"

import {
  resolveScpPrintSizeForSide,
  resolveScpTierIndexForQuantity,
  scpPrintTotalMajorPerGarment,
  scpPrintTotalMajorPerGarmentForSides,
  scpPrintUnitMajorForTier,
} from "./scp-dtf-print-pricing"
import { BulkPricingTier, PricingBreakdown, PricingInput } from "./types"

/**
 * NOTE: input/output field names retain the `Cents` suffix for compatibility, but values are now
 * **major units** (decimal dollars) — same scale as Medusa 2.x `price.amount` and the rest of the
 * storefront. Internal math rounds to 2dp to preserve cent precision.
 */

const SIDE_SURCHARGE = 2.5

const round2 = (n: number) => Math.round(n * 100) / 100

const getQuantityDiscountRate = (quantity: number) => {
  if (quantity >= 100) {
    return 0.2
  }

  if (quantity >= 50) {
    return 0.15
  }

  if (quantity >= 20) {
    return 0.1
  }

  if (quantity >= 10) {
    return 0.05
  }

  return 0
}

const normalizeTiers = (tiers?: BulkPricingTier[]) =>
  (tiers ?? [])
    .filter((tier) => Number.isFinite(tier.minQuantity) && Number.isFinite(tier.amountCents))
    .map((tier) => ({
      minQuantity: Math.max(1, Math.floor(tier.minQuantity)),
      maxQuantity:
        typeof tier.maxQuantity === "number" && Number.isFinite(tier.maxQuantity)
          ? Math.max(1, Math.floor(tier.maxQuantity))
          : undefined,
      amountCents: Math.max(0, round2(tier.amountCents)),
    }))
    .sort((a, b) => a.minQuantity - b.minQuantity)

const resolveBulkTierForQuantity = (tiers: BulkPricingTier[], quantity: number) =>
  tiers.find((tier) => {
    if (quantity < tier.minQuantity) {
      return false
    }
    if (typeof tier.maxQuantity === "number" && quantity > tier.maxQuantity) {
      return false
    }
    return true
  }) ?? tiers[tiers.length - 1]

export const formatCurrency = (amount: number, currencyCode = "aud") =>
  convertToLocale({ amount, currency_code: currencyCode })

export const calculatePricing = ({
  basePriceCents,
  decoratedSidesCount,
  decoratedSides,
  totalQuantity,
  bulkPricingTiers,
  scpPrint,
  prints,
}: PricingInput): PricingBreakdown => {
  const safeQuantity = Math.max(1, Math.floor(totalQuantity || 1))
  const decoratedSidesResolved = Math.max(0, Math.floor(decoratedSidesCount || 0))
  let sideSurchargePerUnit =
    decoratedSidesResolved > 0 ? round2(decoratedSidesResolved * SIDE_SURCHARGE) : 0

  if (scpPrint && decoratedSidesResolved > 0) {
    const tierIndex = resolveScpTierIndexForQuantity(safeQuantity)
    sideSurchargePerUnit = Array.isArray(decoratedSides) && decoratedSides.length
      ? scpPrintTotalMajorPerGarmentForSides({
          selectedPrintSizeId: scpPrint.printSizeId,
          tierIndex,
          decoratedSides,
        })
      : scpPrintTotalMajorPerGarment({
          printSizeId: scpPrint.printSizeId,
          tierIndex,
          decoratedSidesCount: decoratedSidesResolved,
        })
  }
  // Per-print pricing takes precedence whenever the customizer hands us a
  // populated `prints` list. Each entry is one transfer charged at its own
  // size tier — that's how production actually costs (one film per object).
  // The legacy `decoratedSides` × global-size path stays in place for older
  // saved-design / cart payloads that still use the single-size model.
  if (Array.isArray(prints) && prints.length > 0) {
    const tierIndex = resolveScpTierIndexForQuantity(safeQuantity)
    sideSurchargePerUnit = round2(
      prints.reduce((sum, print) => {
        const sizeId = resolveScpPrintSizeForSide(print.side, print.sizeId)
        return sum + scpPrintUnitMajorForTier(sizeId, tierIndex)
      }, 0)
    )
  }
  const normalizedTiers = normalizeTiers(bulkPricingTiers)
  const activeBulkTier = normalizedTiers.length
    ? resolveBulkTierForQuantity(normalizedTiers, safeQuantity)
    : undefined
  const fallbackBaseUnit = Math.max(0, round2(basePriceCents))
  const baseUnit = activeBulkTier?.amountCents ?? fallbackBaseUnit
  const beforeDiscountUnit = round2(baseUnit + sideSurchargePerUnit)
  const firstTierBase = normalizedTiers[0]?.amountCents ?? baseUnit
  const quantityDiscountRate = normalizedTiers.length
    ? firstTierBase > baseUnit
      ? (firstTierBase - baseUnit) / firstTierBase
      : 0
    : getQuantityDiscountRate(safeQuantity)
  const discountedUnitPriceCents = normalizedTiers.length
    ? beforeDiscountUnit
    : round2(beforeDiscountUnit * (1 - quantityDiscountRate))
  const sideSurchargeTotalCents = round2(sideSurchargePerUnit * safeQuantity)
  const totalPriceCents = round2(discountedUnitPriceCents * safeQuantity)

  return {
    baseUnitPriceCents: baseUnit,
    sideSurchargePerUnitCents: sideSurchargePerUnit,
    sideSurchargeTotalCents,
    quantityDiscountRate,
    hasBulkPricing: normalizedTiers.length > 0,
    activeBulkTier,
    bulkPricingTiers: normalizedTiers.length ? normalizedTiers : undefined,
    discountedUnitPriceCents,
    totalPriceCents,
  }
}
