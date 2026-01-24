import "server-only"
import { cookies } from "next/headers"

export const getAuthHeaders = async (): Promise<{ authorization: string } | {}> => {
  const cookiesStore = await cookies()
  const token = cookiesStore.get("_medusa_jwt")?.value

  if (token) {
    return { authorization: `Bearer ${token}` }
  }

  return {}
}

export const setAuthToken = async (token: string) => {
  const cookiesStore = await cookies()
  cookiesStore.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeAuthToken = async () => {
  const cookiesStore = await cookies()
  cookiesStore.set("_medusa_jwt", "", {
    maxAge: -1,
  })
}

export const getCartId = async () => {
  const cookiesStore = await cookies()
  return cookiesStore.get("_medusa_cart_id")?.value
}

export const setCartId = async (cartId: string) => {
  const cookiesStore = await cookies()
  cookiesStore.set("_medusa_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeCartId = async () => {
  const cookiesStore = await cookies()
  cookiesStore.set("_medusa_cart_id", "", { maxAge: -1 })
}

/**
 * Reads the category_ids cookie and returns an array of category IDs
 * Returns empty array if cookie doesn't exist or is invalid
 */
export const getPersonalizationCategoryIds = async (): Promise<string[]> => {
  const cookiesStore = await cookies()
  const categoryIdsCookie = cookiesStore.get("_personalization_category_ids")?.value

  if (!categoryIdsCookie) {
    return []
  }

  // Parse comma-separated string into array
  const categoryIds = categoryIdsCookie.split(",").map((id) => id.trim()).filter(Boolean)
  return categoryIds
}

/**
 * Reads the collection_id cookie and returns the collection ID
 * Returns null if cookie doesn't exist
 */
export const getPersonalizationCollectionId = async (): Promise<string | null> => {
  const cookiesStore = await cookies()
  const collectionIdCookie = cookiesStore.get("_personalization_collection_id")?.value

  return collectionIdCookie || null
}

/**
 * Reads the recent_product_ids cookie and returns an array of product IDs
 * Returns empty array if cookie doesn't exist or is invalid
 */
export const getRecentProductIds = async (): Promise<string[]> => {
  const cookiesStore = await cookies()
  const recentProductIdsCookie = cookiesStore.get("_personalization_recent_product_ids")?.value

  if (!recentProductIdsCookie) {
    return []
  }

  // Parse comma-separated string into array
  const productIds = recentProductIdsCookie.split(",").map((id) => id.trim()).filter(Boolean)
  return productIds
}