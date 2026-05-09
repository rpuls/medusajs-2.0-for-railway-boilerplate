"use client"

import { useEffect } from "react"
import { HttpTypes } from "@medusajs/types"

import { lineItemToItem, trackPurchase } from "@lib/analytics"

/**
 * Fires the GA4 `purchase` event exactly once per (transaction_id,
 * browser). Mounts on the order-confirmed page after server render
 * with the full order in scope. The wrapper inside `trackPurchase`
 * deduplicates via localStorage so a hard reload of the confirmation
 * page doesn't double-count.
 */
export const PurchaseTracker = ({ order }: { order: HttpTypes.StoreOrder }) => {
  useEffect(() => {
    if (!order?.id) return
    const items = (order.items ?? [])
      .map((it) => lineItemToItem(it as any))
      .filter((it): it is NonNullable<ReturnType<typeof lineItemToItem>> => Boolean(it))
    trackPurchase({
      transaction_id: order.display_id ? String(order.display_id) : order.id,
      value: Number(order.total ?? 0),
      currency: (order.currency_code ?? "AUD").toUpperCase(),
      tax: Number((order as any).tax_total ?? 0) || undefined,
      shipping: Number((order as any).shipping_total ?? 0) || undefined,
      items,
    })
  }, [order])
  return null
}
