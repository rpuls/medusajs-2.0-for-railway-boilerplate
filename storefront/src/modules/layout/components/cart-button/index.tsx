import { notFound } from "next/navigation"
import dynamic from "next/dynamic"
import CartButtonClient from "./cart-button-client"
import { enrichLineItems, retrieveCart } from "@lib/data/cart"

// Lazy load slide-in cart (client-side only)
const SlideInCart = dynamic(
  () => import("@modules/cart/components/slide-in-cart"),
  {
    ssr: false,
  }
)

const fetchCart = async () => {
  const cart = await retrieveCart()

  if (!cart) {
    return null
  }

  if (cart?.items?.length) {
    const enrichedItems = await enrichLineItems(cart.items, cart.region_id!)
    cart.items = enrichedItems
  }

  return cart
}

export default async function CartButton() {
  const cart = await fetchCart()

  return (
    <>
      <CartButtonClient cart={cart} />
      <SlideInCart cart={cart} />
    </>
  )
}
