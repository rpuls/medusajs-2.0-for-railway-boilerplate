import { Metadata } from "next"
import { notFound } from "next/navigation"

import { enrichLineItems, retrieveCart } from "@lib/data/cart"
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { HttpTypes } from "@medusajs/types"
import SimpleCheckout from "@modules/checkout/templates/simple-checkout"

export const metadata: Metadata = {
  title: "Đặt hàng | KIN Store",
  description: "Hoàn tất đơn hàng của bạn tại KIN Store",
}

const fetchCart = async () => {
  const cart = await retrieveCart()
  if (!cart) {
    return notFound()
  }

  if (cart?.items?.length) {
    const enrichedItems = await enrichLineItems(cart.items, cart.region_id!)
    cart.items = enrichedItems as HttpTypes.StoreCartLineItem[]
  }

  return cart
}

export default async function Checkout() {
  const cart = await fetchCart()
  const shippingOptions = await listCartShippingMethods(cart.id)

  return <SimpleCheckout cart={cart} shippingOptions={shippingOptions} />
}
