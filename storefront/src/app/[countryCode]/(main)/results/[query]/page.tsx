import { Metadata } from "next"

import SearchResultsTemplate from "@modules/search/templates/search-results-template"

import { search } from "@modules/search/actions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export const metadata: Metadata = {
  title: "Search",
  description: "Explore all of our products.",
}

type Params = {
  params: Promise<{ query: string; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

export default async function SearchResults({ params, searchParams }: Params) {
  const { query, countryCode } = await params
  const { sortBy, page } = await searchParams

  // The route param arrives still URL-encoded ("skate%20sensor"), and Medusa's
  // Postgres search provider takes it literally: on a store without
  // MeiliSearch, every query with a space in it found nothing (31 Oct).
  const hits = await search(decodeURIComponent(query)).then((data) => data)

  const ids = hits
    .map((h) => h.id)
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
