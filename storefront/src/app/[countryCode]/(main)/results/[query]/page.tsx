import { Metadata } from "next"

import SearchResultsTemplate from "@modules/search/templates/search-results-template"

import { search } from "@modules/search/actions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getTranslations, getTranslation } from "@lib/i18n/server"

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const resolvedParams = await params
  const { query, countryCode } = resolvedParams
  
  const normalizedCountryCode = typeof countryCode === 'string' 
    ? countryCode.toLowerCase() 
    : 'us'
  
  // Get translations for metadata
  const translations = await getTranslations(normalizedCountryCode)
  const siteName = getTranslation(translations, "metadata.siteName")
  const searchForQuery = getTranslation(translations, "metadata.search.forQuery")
  const findProducts = getTranslation(translations, "metadata.search.findProducts")
  
  const title = `${searchForQuery.replace("{query}", query)} | ${siteName}`
  const description = findProducts.replace("{query}", query)
  
  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
  }
}

// Enable ISR with 1 hour revalidation for search results
// MIGRATED: Removed export const revalidate = 3600 (incompatible with Cache Components)
// TODO: Will add "use cache" + cacheLife() or <Suspense> after analyzing build errors

type Params = {
  params: Promise<{ query: string; countryCode: string }>
  searchParams: {
    sortBy?: SortOptions
    page?: string
  }
}

export default async function SearchResults({ params, searchParams }: Params) {
  // Await params in Next.js 16
  const resolvedParams = await params
  const { query, countryCode } = resolvedParams
  const { sortBy, page } = searchParams

  const hits = await search(query).then((data) => data)

  const ids = hits
    .map((h) => h.objectID || h.id)
    .filter((id): id is string => {
      return typeof id === "string"
    })

  return (
    <SearchResultsTemplate
      query={query}
      ids={ids}
      sortBy={sortBy}
      page={page}
      countryCode={countryCode}
    />
  )
}
