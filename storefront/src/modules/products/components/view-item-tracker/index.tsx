"use client"

import { useEffect } from "react"
import { HttpTypes } from "@medusajs/types"

import { trackViewItem, type AnalyticsItem } from "@lib/analytics"

/**
 * Fires `view_item` once per PDP mount. Picks the cheapest variant as
 * the representative item shape so price + sku show up correctly even
 * before the customer chooses a variant.
 */
export const ViewItemTracker = ({
  product,
}: {
  product: HttpTypes.StoreProduct
}) => {
  useEffect(() => {
    if (!product?.id) return
    const variant =
      product.variants?.find(
        (v: any) => v?.calculated_price?.calculated_amount != null
      ) ?? product.variants?.[0]
    const price =
      (variant as any)?.calculated_price?.calculated_amount ?? undefined
    const item: AnalyticsItem = {
      item_id: variant?.id ?? product.id,
      item_name: product.title,
      item_brand: (product as any).collection?.title ?? undefined,
      item_category: (product as any).type?.value ?? undefined,
      item_variant: variant?.title ?? undefined,
      price,
      quantity: 1,
    }
    const currency =
      (variant as any)?.calculated_price?.currency_code?.toUpperCase() ?? "AUD"
    trackViewItem(item, currency)
  }, [product])
  return null
}
