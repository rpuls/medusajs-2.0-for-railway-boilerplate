"use server"

import { cache } from "react"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:9000"

export interface Brand {
  id: string
  name: string
  image_url?: string | null
  product_count?: number
}

/**
 * Get all brands
 */
export const getBrandsList = cache(async function (): Promise<Brand[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/store/brands`, {
      next: {
        tags: ["brands"],
        revalidate: 3600, // ISR: revalidate every hour
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch brands")
    }

    const data = await response.json()
    return data.brands || []
  } catch (error) {
    console.error("Error fetching brands:", error)
    return []
  }
})

/**
 * Get active brands (brands with products) with product counts
 */
export const getActiveBrands = cache(async function (): Promise<Brand[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/store/brands/active`, {
      next: {
        tags: ["brands"],
        revalidate: 3600, // ISR: revalidate every hour
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch active brands")
    }

    const data = await response.json()
    return data.brands || []
  } catch (error) {
    console.error("Error fetching active brands:", error)
    return []
  }
})

/**
 * Get a single brand by ID
 */
export const getBrandById = cache(async function (
  id: string
): Promise<Brand | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/store/brands`, {
      next: {
        tags: ["brands"],
        revalidate: 3600,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch brand")
    }

    const data = await response.json()
    const brand = data.brands?.find((b: Brand) => b.id === id)
    return brand || null
  } catch (error) {
    console.error("Error fetching brand:", error)
    return null
  }
})

/**
 * Get product IDs filtered by brand IDs
 */
export const getProductIdsByBrands = cache(async function (
  brandIds: string[]
): Promise<string[]> {
  if (!brandIds || brandIds.length === 0) {
    return []
  }

  try {
    // Build query string with multiple brand_id parameters
    const queryParams = brandIds.map((id) => `brand_id=${encodeURIComponent(id)}`).join("&")
    const response = await fetch(`${BACKEND_URL}/store/products/by-brand?${queryParams}`, {
      next: {
        tags: ["brands", "products"],
        revalidate: 3600,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch products by brand")
    }

    const data = await response.json()
    return data.product_ids || []
  } catch (error) {
    console.error("Error fetching product IDs by brands:", error)
    return []
  }
})

