import { instantMeiliSearch } from "@meilisearch/instant-meilisearch"

export const SEARCH_ENDPOINT =
  process.env.NEXT_PUBLIC_SEARCH_ENDPOINT || "http://127.0.0.1:7700"

export const SEARCH_API_KEY =
  process.env.NEXT_PUBLIC_SEARCH_API_KEY || "test_key"

export const { searchClient } = instantMeiliSearch(SEARCH_ENDPOINT, SEARCH_API_KEY)

export const SEARCH_INDEX_NAME =
  process.env.NEXT_PUBLIC_INDEX_NAME || "products"
