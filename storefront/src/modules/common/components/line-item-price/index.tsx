import { clx } from "@medusajs/ui"

import { getPercentageDiff } from "@lib/util/get-precentage-diff"
import {
  cartLineUsesExplicitUnitPrice,
  getPricesForCartLineVariant,
  resolveCartLineDisplayUnitMinor,
  variantWithInferredHandleForLineItem,
} from "@lib/util/cart-line-display-unit"
import { convertMinorToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
}

const LineItemPrice = ({ item, style = "default" }: LineItemPriceProps) => {
  const variantForPricing = variantWithInferredHandleForLineItem(item)
  const prices = getPricesForCartLineVariant(variantForPricing)

  const adjustmentsSum = (item.adjustments || []).reduce(
    (acc, adjustment) => adjustment.amount + acc,
    0
  )

  const unitMinor = resolveCartLineDisplayUnitMinor(item, variantForPricing)
  const currency_code = prices?.currency_code ?? "usd"

  const itemRecord = item as { compare_at_unit_price?: number | null }

  // Defensive: if the line came back partially populated (custom add-to-cart,
  // missing variant, etc.), `quantity` can be undefined → `unitMinor * qty`
  // becomes NaN and the price renders as `$NaN`. Floor at 0.
  const safeQuantity =
    typeof item.quantity === "number" && Number.isFinite(item.quantity)
      ? item.quantity
      : 0

  let originalPrice: number
  let currentPrice: number
  let hasReducedPrice: boolean

  if (cartLineUsesExplicitUnitPrice(item)) {
    const compareAtMinor =
      typeof itemRecord.compare_at_unit_price === "number" &&
      Number.isFinite(itemRecord.compare_at_unit_price)
        ? Math.round(itemRecord.compare_at_unit_price)
        : null
    originalPrice = (compareAtMinor ?? unitMinor) * safeQuantity
    currentPrice = unitMinor * safeQuantity - adjustmentsSum
    hasReducedPrice = compareAtMinor != null && compareAtMinor > unitMinor
  } else {
    const original_price_number = prices?.original_price_number ?? 0
    originalPrice = original_price_number * safeQuantity
    currentPrice = unitMinor * safeQuantity - adjustmentsSum
    hasReducedPrice = currentPrice < originalPrice
  }

  return (
    <div className="flex flex-col gap-x-2 text-ui-fg-subtle items-end">
      <div className="text-left">
        {hasReducedPrice && (
          <>
            <p>
              {style === "default" && (
                <span className="text-ui-fg-subtle">Original: </span>
              )}
              <span
                className="line-through text-ui-fg-muted"
                data-testid="product-original-price"
              >
                {convertMinorToLocale({
                  amount: originalPrice,
                  currency_code,
                })}
              </span>
            </p>
            {style === "default" && (
              <span className="text-ui-fg-interactive">
                -{getPercentageDiff(originalPrice, currentPrice || 0)}%
              </span>
            )}
          </>
        )}
        <span
          className={clx("text-base-regular", {
            "text-ui-fg-interactive": hasReducedPrice,
          })}
          data-testid="product-price"
        >
          {convertMinorToLocale({
            amount: currentPrice,
            currency_code,
          })}
        </span>
      </div>
    </div>
  )
}

export default LineItemPrice
