import { Metadata } from "next"
import CartTemplate from "@modules/cart/templates"

import { enrichLineItems, retrieveCart } from "@lib/data/cart"
import { stripHeavyCartMetadataForRender } from "@lib/util/strip-cart-metadata"
import { applyDisplayPriceCorrectionToCart } from "@lib/util/apply-display-price-correction"
import { HttpTypes } from "@medusajs/types"
import { getCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Cart",
  description: "View your cart",
}

const fetchCart = async () => {
  try {
    const cart = await retrieveCart()

    if (!cart) {
      return null
    }

    if (cart?.items?.length) {
      const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id!)
      // Strip heavy customizer metadata (sideLayouts, prints, artifacts, etc.)
      // before passing to client components — large carts (100+ customized
      // lines) otherwise blow the RSC payload and the page errors out with
      // "Something went wrong loading your cart". Backend keeps the full
      // metadata; re-edit flows refetch it on demand.
      cart.items = stripHeavyCartMetadataForRender(
        enrichedItems
      ) as HttpTypes.StoreCartLineItem[]
      applyDisplayPriceCorrectionToCart(cart)

      // Diagnostic + serialization sanitization in one pass.
      //
      // The cart page has been erroring with "Server Components render" for
      // multiple iterations. PostHog only shows Next.js's production-omitted
      // generic message, so we can't see the real stack. One common cause of
      // RSC render errors is a non-serializable value on a client-component
      // prop — BigInt, Symbol, function, Date with methods, or a circular
      // reference. JSON.stringify will throw on those (which we log), and
      // JSON.parse(JSON.stringify(...)) silently drops anything that
      // survived. That gives us:
      //   - Visible log line showing serialized size + item count
      //   - An exception in logs if JSON.stringify itself can't handle it
      //   - A sanitized cart object that's guaranteed RSC-safe (passes only
      //     plain JSON-compatible values to client components)
      // If the cart starts loading after this lands, the original issue was
      // a non-JSON value somewhere on the cart object.
      try {
        const serialized = JSON.stringify(cart)
        // eslint-disable-next-line no-console
        console.info(
          `[cart-page-diag] items=${cart.items.length} serialized=${(
            Buffer.byteLength(serialized, "utf-8") /
            1024
          ).toFixed(1)}KB cart_id=${cart.id}`
        )
        // Hand back the JSON-roundtripped cart so any non-serializable
        // values (functions, Symbols, BigInt, class instances with custom
        // toJSON) are dropped before they reach client components.
        return JSON.parse(serialized) as HttpTypes.StoreCart
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[cart-page-diag] serialize-cart failed:", e)
        // Fall back to the raw cart — at least the original error stack
        // gets through. If JSON.stringify threw, we'll see that error
        // class/message in Vercel logs instead of the generic RSC mask.
      }
    }

    return cart
  } catch (err) {
    console.error("[cart/page] fetchCart threw:", err)
    return null
  }
}

export default async function Cart() {
  const cart = await fetchCart()
  const customer = await getCustomer()

  return <CartTemplate cart={cart} customer={customer} />
}
