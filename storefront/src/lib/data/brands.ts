"use server"

import { cache } from "react"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:9000"

const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

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
    const headers: HeadersInit = {}
    if (PUBLISHABLE_API_KEY) {
      headers["x-publishable-api-key"] = PUBLISHABLE_API_KEY
    }

    const response = await fetch(`${BACKEND_URL}/store/brands`, {
      headers,
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
    const headers: HeadersInit = {}
    if (PUBLISHABLE_API_KEY) {
      headers["x-publishable-api-key"] = PUBLISHABLE_API_KEY
    }

    const response = await fetch(`${BACKEND_URL}/store/brands/active`, {
      headers,
      next: {
        tags: ["brands"],
        revalidate: 3600, // ISR: revalidate every hour
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to fetch active brands: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`Failed to fetch active brands: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const brands = data.brands || []
    console.log(`[getActiveBrands] Fetched ${brands.length} active brands:`, brands.map((b: Brand) => ({ id: b.id, name: b.name, count: b.product_count })))
    return brands
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
    const headers: HeadersInit = {}
    if (PUBLISHABLE_API_KEY) {
      headers["x-publishable-api-key"] = PUBLISHABLE_API_KEY
    }

    const response = await fetch(`${BACKEND_URL}/store/brands`, {
      headers,
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
    const headers: HeadersInit = {}
    if (PUBLISHABLE_API_KEY) {
      headers["x-publishable-api-key"] = PUBLISHABLE_API_KEY
    }

    // Build query string with multiple brand_id parameters
    const queryParams = brandIds.map((id) => `brand_id=${encodeURIComponent(id)}`).join("&")
    const response = await fetch(`${BACKEND_URL}/store/products/by-brand?${queryParams}`, {
      headers,
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

