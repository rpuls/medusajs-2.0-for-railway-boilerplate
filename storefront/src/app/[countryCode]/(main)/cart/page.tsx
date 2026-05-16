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
      // Strip heavy customizer metadata (sideLayouts, prints, customerOriginalFiles)
      // before passing to client components. Pure performance optimization for
      // large carts; the cart UI only reads thumbnail / mockup-artifact URLs
      // (still kept) plus top-level scalars. See stripHeavyCartMetadataForRender.
      cart.items = stripHeavyCartMetadataForRender(
        enrichedItems
      ) as HttpTypes.StoreCartLineItem[]
      applyDisplayPriceCorrectionToCart(cart)
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
