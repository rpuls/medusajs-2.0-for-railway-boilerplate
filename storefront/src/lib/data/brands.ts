import { MEDUSA_BACKEND_URL } from "@lib/config"
import type { HttpTypes } from "@medusajs/types"
import { cache } from "react"

export type StorefrontBrand = {
  id: string
  name: string
  handle: string
  description: string | null
  logo_url: string | null
  external_code: string | null
  parent_id: string | null
}

type BrandsListResponse = {
  brands: StorefrontBrand[]
  count: number
}

type BrandRetrieveResponse = {
  brand: StorefrontBrand
  children: StorefrontBrand[]
}

type BrandProductsResponse = {
  products: HttpTypes.StoreProduct[]
  count: number
  offset: number
  limit: number
}

const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

function brandHeaders(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" }
  if (publishableKey) h["x-publishable-api-key"] = publishableKey
  return h
}

export const listBrands = cache(async function (): Promise<StorefrontBrand[]> {
  try {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/brands?limit=500`, {
      headers: brandHeaders(),
      next: { tags: ["brands"], revalidate: 600 },
    })
    if (!res.ok) return []
    const data = (await res.json()) as BrandsListResponse
    return data.brands ?? []
  } catch {
    return []
  }
})

export async function retrieveBrandByHandle(handle: string): Promise<{
  brand: StorefrontBrand | null
  children: StorefrontBrand[]
}> {
  try {
    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/brands/${encodeURIComponent(handle)}`, {
      headers: brandHeaders(),
      next: { tags: ["brands", `brand-${handle}`], revalidate: 120 },
    })
    if (!res.ok) return { brand: null, children: [] }
    const data = (await res.json()) as BrandRetrieveResponse
    return { brand: data.brand ?? null, children: data.children ?? [] }
  } catch {
    return { brand: null, children: [] }
  }
}

export type BrandProductsParams = {
  limit?: number
  offset?: number
  order?: string
  region_id?: string
  type_id?: string | string[]
  tag_id?: string | string[]
}

/**
 * Paginated, filtered, sales-channel-scoped product list for a single brand.
 *
 * Replaces the old two-step "fetch brand product IDs, then pass them as ?id=... query params"
 * approach. That broke for brands with many products because the URL exceeded proxy limits
 * (AS Colour with ~250 products generated a ~10KB query string).
 *
 * This calls the dedicated backend route that performs the link-table → product join +
 * pagination + sales-channel scoping server-side and returns the paginated page directly.
 */
export const getBrandProducts = cache(async function (
  handle: string,
  params: BrandProductsParams
): Promise<{ products: HttpTypes.StoreProduct[]; count: number }> {
  const search = new URLSearchParams()
  if (typeof params.limit === "number") search.set("limit", String(params.limit))
  if (typeof params.offset === "number") search.set("offset", String(params.offset))
  if (params.order) search.set("order", params.order)
  if (params.region_id) search.set("region_id", params.region_id)
  const appendArray = (key: string, value: string | string[] | undefined) => {
    if (!value) return
    const arr = Array.isArray(value) ? value : [value]
    for (const v of arr) search.append(key, v)
  }
  appendArray("type_id", params.type_id)
  appendArray("tag_id", params.tag_id)

  const qs = search.toString()
  const url =
    `${MEDUSA_BACKEND_URL}/store/brands/${encodeURIComponent(handle)}/products` +
    (qs ? `?${qs}` : "")

  try {
    const res = await fetch(url, {
      headers: brandHeaders(),
      next: { tags: ["brands", `brand-${handle}`, "products"], revalidate: 120 },
    })
    if (!res.ok) return { products: [], count: 0 }
    const data = (await res.json()) as BrandProductsResponse
    return { products: data.products ?? [], count: data.count ?? 0 }
  } catch {
    return { products: [], count: 0 }
  }
})
