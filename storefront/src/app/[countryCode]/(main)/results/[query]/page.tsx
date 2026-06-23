import { Metadata } from "next"

import SearchResultsTemplate from "@modules/search/templates/search-results-template"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export const metadata: Metadata = {
  title: "Tìm kiếm | KIN STORE",
  description: "Tìm kiếm sản phẩm tại KIN STORE.",
}

type Params = {
  params: { query: string; countryCode: string }
  searchParams: {
    sortBy?: SortOptions
    page?: string
  }
}

export default async function SearchResults({ params, searchParams }: Params) {
  const { query } = params
  const { sortBy, page } = searchParams

  return (
    <SearchResultsTemplate
      query={decodeURI(query)}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  )
}
