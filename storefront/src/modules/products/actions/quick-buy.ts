"use server"

import { addToCart } from "@lib/data/cart"
import { getOrSetCart } from "@lib/data/cart"
import { redirect } from "next/navigation"

/**
 * Quick buy server action
 * Adds product to cart and redirects to checkout
 */
export async function quickBuy({
  variantId,
  quantity = 1,
  countryCode,
}: {
  variantId: string
  quantity?: number
  countryCode: string
}) {
  if (!variantId) {
    throw new Error("Missing variant ID")
  }

  try {
    // Add to cart
    await addToCart({
      variantId,
      quantity,
      countryCode,
    })

    // Get cart to determine checkout step
    const cart = await getOrSetCart(countryCode)
    
    if (!cart) {
      throw new Error("Failed to retrieve cart")
    }

    // Determine checkout step
    let step = "address"
    if (cart.shipping_address?.address_1 && cart.email) {
      if (cart.shipping_methods?.length === 0) {
        step = "delivery"
      } else {
        step = "payment"
      }
    }

    // Redirect to checkout
    redirect(`/${countryCode}/checkout?step=${step}`)
  } catch (error: any) {
    throw new Error(error.message || "Failed to process quick buy")
  }
}

