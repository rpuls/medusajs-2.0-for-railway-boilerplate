import { clx } from "@medusajs/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import {
  finalizeAudAsColourMinorIfHundredfoldTypo,
  resolveHeadlineMinorAmount,
} from "@lib/util/resolve-display-minor"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type BulkTier = {
  min_quantity: number
  max_quantity?: number
  amount: number
}

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim()
    if (!cleaned) {
      return Number.NaN
    }
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : Number.NaN
  }
  return Number.NaN
}

const getBulkPricingTiers = (variant?: HttpTypes.StoreProductVariant): BulkTier[] => {
  const metadata = (variant?.metadata ?? {}) as Record<string, unknown>
  const bulkPricing = metadata.bulk_pricing as
    | {
        tiers?: Array<Record<string, unknown>>
      }
    | undefined

  if (!Array.isArray(bulkPricing?.tiers)) {
    return []
  }

  return bulkPricing.tiers
    .map((tier): BulkTier | null => {
      const minQuantity = toNumber(tier.min_quantity)
      const maxQuantity = toNumber(tier.max_quantity)
      const amount = toNumber(tier.amount)

      if (!Number.isFinite(minQuantity) || !Number.isFinite(amount)) {
        return null
      }

      return {
        min_quantity: minQuantity,
        max_quantity: Number.isFinite(maxQuantity) ? maxQuantity : undefined,
        amount,
      }
    })
    .filter((tier): tier is BulkTier => tier !== null)
    .sort((a, b) => a.min_quantity - b.min_quantity)
}

const getBulkPricingCurrency = (variant?: HttpTypes.StoreProductVariant) => {
  const metadata = (variant?.metadata ?? {}) as Record<string, unknown>
  const bulkPricing = metadata.bulk_pricing as
    | {
        currency_code?: unknown
      }
    | undefined

  return typeof bulkPricing?.currency_code === "string"
    ? bulkPricing.currency_code.toLowerCase()
    : null
}

const resolveTierForQuantity = (tiers: BulkTier[], quantity: number) =>
  tiers.find((tier) => {
    if (quantity < tier.min_quantity) {
      return false
    }
    if (typeof tier.max_quantity === "number" && quantity > tier.max_quantity) {
      return false
    }
    return true
  }) ?? tiers[tiers.length - 1]

const formatTierRange = (tier: BulkTier) =>
  typeof tier.max_quantity === "number"
    ? `${tier.min_quantity}-${tier.max_quantity}`
    : `${tier.min_quantity}+`

export default function ProductPrice({
  product,
  variant,
  quantity = 1,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  quantity?: number
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice
  const bulkTiers = getBulkPricingTiers(variant)
  const selectedQuantity = Math.max(1, quantity)
  const activeBulkTier =
    variant && bulkTiers.length ? resolveTierForQuantity(bulkTiers, selectedQuantity) : null

  if (!selectedPrice && !activeBulkTier) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  const currencyCode = selectedPrice?.currency_code ?? getBulkPricingCurrency(variant) ?? "aud"
  const rawBulkTierAmount = activeBulkTier?.amount
  const headlineResolved = resolveHeadlineMinorAmount(
    rawBulkTierAmount,
    selectedPrice?.calculated_price_number
  )
  const apiMinorForFinalize =
    typeof selectedPrice?.calculated_price_number === "number"
      ? selectedPrice.calculated_price_number
      : headlineResolved
  const activeUnitAmount = finalizeAudAsColourMinorIfHundredfoldTypo(
    headlineResolved,
    apiMinorForFinalize,
    product.handle,
    currencyCode
  )
  const headlineUsesBulkTier =
    !!activeBulkTier &&
    typeof rawBulkTierAmount === "number" &&
    Number.isFinite(rawBulkTierAmount) &&
    activeUnitAmount === rawBulkTierAmount

  const activeUnitPrice = convertToLocale({
    amount: activeUnitAmount,
    currency_code: currencyCode,
  })

  const firstTierRaw = bulkTiers[0]?.amount
  const calcMinor = selectedPrice?.calculated_price_number
  const firstTierResolved =
    typeof firstTierRaw === "number" &&
    firstTierRaw > 0 &&
    typeof calcMinor === "number" &&
    Number.isFinite(calcMinor)
      ? finalizeAudAsColourMinorIfHundredfoldTypo(
          resolveHeadlineMinorAmount(firstTierRaw, calcMinor),
          calcMinor,
          product.handle,
          currencyCode
        )
      : null
  const bulkMinorScale =
    typeof firstTierRaw === "number" &&
    firstTierRaw > 0 &&
    firstTierResolved !== null &&
    Number.isFinite(firstTierResolved)
      ? firstTierResolved / firstTierRaw
      : 1

  const scaledTierMinor = (tier: BulkTier) => Math.round(tier.amount * bulkMinorScale)
  const baseTierAmount = scaledTierMinor(bulkTiers[0] ?? { min_quantity: 1, amount: activeUnitAmount })

  return (
    <div className="flex flex-col text-ui-fg-base">
      <span
        className={clx("text-xl-semi", {
          "text-ui-fg-interactive": selectedPrice?.price_type === "sale",
        })}
      >
        {!variant && "From "}
        <span
          data-testid="product-price"
          data-value={activeUnitAmount}
        >
          {activeUnitPrice}
        </span>
      </span>
      {headlineUsesBulkTier ? (
        <span className="text-xs text-ui-fg-subtle">
          Bulk tier {formatTierRange(activeBulkTier)} applied at qty {selectedQuantity}
        </span>
      ) : null}
      {selectedPrice?.price_type === "sale" && (
        <>
          <p>
            <span className="text-ui-fg-subtle">Original: </span>
            <span
              className="line-through"
              data-testid="original-product-price"
              data-value={selectedPrice.original_price_number}
            >
              {selectedPrice.original_price}
            </span>
          </p>
          <span className="text-ui-fg-interactive">
            -{selectedPrice.percentage_diff}%
          </span>
        </>
      )}
      {variant && bulkTiers.length > 1 ? (
        <div className="mt-3 rounded-md border border-ui-border-base p-3">
          <p className="mb-2 text-sm font-medium text-ui-fg-base">Bulk pricing</p>
          <div className="space-y-1 text-sm text-ui-fg-subtle">
            {bulkTiers.map((tier) => {
              const tierMinor = scaledTierMinor(tier)
              const savingsPct =
                baseTierAmount > tierMinor
                  ? Math.round(((baseTierAmount - tierMinor) / baseTierAmount) * 100)
                  : 0

              return (
                <div key={formatTierRange(tier)} className="flex items-center justify-between gap-4">
                  <span>{formatTierRange(tier)} pcs</span>
                  <span className="text-ui-fg-base">
                    {convertToLocale({
                      amount: tierMinor,
                      currency_code: currencyCode,
                    })}
                    {savingsPct > 0 ? ` (${savingsPct}% off)` : ""}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
