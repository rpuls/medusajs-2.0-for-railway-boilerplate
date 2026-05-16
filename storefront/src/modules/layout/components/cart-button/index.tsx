import { notFound } from "next/navigation"
import CartDropdown from "../cart-dropdown"
import { enrichLineItems, retrieveCart } from "@lib/data/cart"
import { stripHeavyCartMetadataForRender } from "@lib/util/strip-cart-metadata"
import { applyDisplayPriceCorrectionToCart } from "@lib/util/apply-display-price-correction"

const fetchCart = async () => {
  const cart = await retrieveCart()

  if (!cart) {
    return null
  }

  if (cart?.items?.length) {
    const enrichedItems = await enrichLineItems(cart.items, cart.region_id!)
    // Header cart dropdown only shows thumbnails / titles / quantities.
    // Strip heavy customizer metadata so the navbar (rendered on every page)
    // doesn't drag a multi-MB RSC payload around for large carts.
    cart.items = stripHeavyCartMetadataForRender(enrichedItems) as typeof cart.items
    applyDisplayPriceCorrectionToCart(cart)
  }

  return cart
}

export default async function CartButton() {
  const cart = await fetchCart()

  return <CartDropdown cart={cart} />
}
