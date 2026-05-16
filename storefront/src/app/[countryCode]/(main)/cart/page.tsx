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

      // Diagnostic: log a one-line summary of the cart payload size so the
      // "Something went wrong loading your cart" error has a paper trail in
      // Vercel runtime logs. JSON.stringify can also surface circular ref
      // or BigInt errors here (caught and logged separately).
      try {
        const serialized = JSON.stringify(cart)
        // eslint-disable-next-line no-console
        console.info(
          `[cart-page-diag] items=${cart.items.length} serialized=${(
            Buffer.byteLength(serialized, "utf-8") /
            1024
          ).toFixed(1)}KB cart_id=${cart.id}`
        )
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[cart-page-diag] serialize-cart-summary failed:", e)
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
