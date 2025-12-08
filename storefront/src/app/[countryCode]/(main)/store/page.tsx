import { Metadata } from "next"
import { Suspense } from "react"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600

// Allow dynamic rendering for filters (filters change via URL params)
export const dynamic = "force-dynamic"

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    collection?: string | string[]
    category?: string | string[]
    brand?: string | string[]
    price?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage({ searchParams, params }: Params) {
  // Await both params and searchParams in Next.js 16
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const { sortBy, page, collection, category, brand, price } = resolvedSearchParams

  // Normalize to arrays (URL can have multiple values for collection/category/brand)
  const collectionIds = Array.isArray(collection) 
    ? collection.filter(Boolean)
    : collection 
    ? [collection]
    : []
  
  const categoryIds = Array.isArray(category)
    ? category.filter(Boolean)
    : category
    ? [category]
    : []

  const brandIds = Array.isArray(brand)
    ? brand.filter(Boolean)
    : brand
    ? [brand]
    : []

  return (
    <Suspense fallback={<div>Loading store...</div>}>
      <StoreTemplate
        sortBy={sortBy}
        page={page}
        countryCode={resolvedParams.countryCode}
        collectionIds={collectionIds}
        categoryIds={categoryIds}
        brandIds={brandIds}
        priceRange={price}
      />
    </Suspense>
  )
}
