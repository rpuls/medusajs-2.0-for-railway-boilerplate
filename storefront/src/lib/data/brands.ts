import { MEDUSA_BACKEND_URL } from "@lib/config"
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
      next: { tags: ["brands", `brand-${handle}`], revalidate: 600 },
    })
    if (!res.ok) return { brand: null, children: [] }
    const data = (await res.json()) as BrandRetrieveResponse
    return { brand: data.brand ?? null, children: data.children ?? [] }
  } catch {
    return { brand: null, children: [] }
  }
}
