import { instantMeiliSearch } from "@meilisearch/instant-meilisearch"

export const SEARCH_ENDPOINT =
  process.env.NEXT_PUBLIC_SEARCH_ENDPOINT || "http://127.0.0.1:7700"

// No placeholder default here. This previously fell back to "test_key", which
// authenticates against nothing, so an unconfigured store got a search box that
// silently returned no results with no hint as to why.
export const SEARCH_API_KEY = process.env.NEXT_PUBLIC_SEARCH_API_KEY || ""

if (!SEARCH_API_KEY) {
  console.warn(
    "NEXT_PUBLIC_SEARCH_API_KEY is not set, so storefront search cannot authenticate against MeiliSearch and will return nothing. Set it to a search-only key, or set MEILISEARCH_API_KEY server-side and let the launcher derive one."
  )
}

export const { searchClient } = instantMeiliSearch(SEARCH_ENDPOINT, SEARCH_API_KEY)

export const SEARCH_INDEX_NAME =
  process.env.NEXT_PUBLIC_INDEX_NAME || "products"
