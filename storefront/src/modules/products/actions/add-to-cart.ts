"use server"

import { addToCart as addToCartLib } from "@lib/data/cart"

/**
 * Server action wrapper for adding product to cart
 * Can be called from Client Components
 */
export async function addToCartAction({
  variantId,
  quantity,
  countryCode,
}: {
  variantId: string
  quantity: number
  countryCode: string
}) {
  try {
    await addToCartLib({
      variantId,
      quantity,
      countryCode,
    })
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to add to cart" }
  }
}

