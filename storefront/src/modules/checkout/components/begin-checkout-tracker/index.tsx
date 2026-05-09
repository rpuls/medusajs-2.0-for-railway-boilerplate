"use client"

import { useEffect } from "react"
import { HttpTypes } from "@medusajs/types"

import { lineItemToItem, trackBeginCheckout } from "@lib/analytics"

/**
 * Fires `begin_checkout` once per (cart_id, browser session) when the
 * customer lands on /checkout. Dedupes via sessionStorage so refresh /
 * back-button doesn't double-count within the same session.
 */
export const BeginCheckoutTracker = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  useEffect(() => {
    if (!cart?.id) return
    const sessionKey = `ga4_begin_checkout_${cart.id}`
    if (typeof window !== "undefined") {
      try {
        if (window.sessionStorage.getItem(sessionKey)) return
        window.sessionStorage.setItem(sessionKey, String(Date.now()))
      } catch {
        // sessionStorage disabled — fall through; better to fire than miss.
      }
    }
    const items = (cart.items ?? [])
      .map((it) => lineItemToItem(it as any))
      .filter((it): it is NonNullable<ReturnType<typeof lineItemToItem>> => Boolean(it))
    trackBeginCheckout(
      items,
      (cart.currency_code ?? "AUD").toUpperCase(),
      (cart as any).promo_code ?? undefined
    )
  }, [cart])
  return null
}
