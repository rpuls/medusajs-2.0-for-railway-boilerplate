"use server"

import { sdk } from "@lib/config"
import { SEARCH_INDEX_NAME } from "@lib/search-client"
import { ProductHit } from "@modules/search/components/hit"

type StoreSearchResponse = {
  results: { hits: { id: string; document: ProductHit }[] }[]
}

/**
 * Server-side search, used by the /results page.
 *
 * Same backend route as the live search modal (`lib/search-client.ts`), called
 * directly because this path wants plain hits rather than InstantSearch's
 * request and response shape. Both share `SEARCH_INDEX_NAME`, so there is one
 * place to change it.
 *
 * Returns no hits rather than throwing when the search request fails, so the
 * page renders its "no results" state instead of the error boundary.
 * @param {string} query - search query
 */
export async function search(query: string) {
  return sdk.client
    .fetch<StoreSearchResponse>("/store/search", {
      method: "POST",
      body: { entity: SEARCH_INDEX_NAME, filters: { q: query } },
    })
    .then(({ results }) => results[0]?.hits.map((hit) => hit.document) ?? [])
    .catch(() => [] as ProductHit[])
}
