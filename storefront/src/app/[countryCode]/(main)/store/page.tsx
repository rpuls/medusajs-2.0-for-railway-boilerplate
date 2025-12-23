import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import { getTranslations, getTranslation } from "@lib/i18n/server"

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

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const resolvedParams = await params
  const normalizedCountryCode = typeof resolvedParams?.countryCode === 'string' 
    ? resolvedParams.countryCode.toLowerCase() 
    : 'us'
  
  // Get translations for metadata
  const translations = await getTranslations(normalizedCountryCode)
  const title = getTranslation(translations, "metadata.store.title")
  const description = getTranslation(translations, "metadata.store.description")
  
  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
  }
}

// MIGRATED: Removed export const revalidate = 3600 (incompatible with Cache Components)
// MIGRATED: Removed export const dynamic = "force-dynamic" (incompatible with Cache Components)
// TODO: Will add <Suspense> boundary or "use cache" after analyzing build errors

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
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={resolvedParams.countryCode}
      collectionIds={collectionIds}
      categoryIds={categoryIds}
      brandIds={brandIds}
      priceRange={price}
    />
  )
}
