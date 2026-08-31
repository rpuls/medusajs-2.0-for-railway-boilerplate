"use server"

import { Meilisearch } from "meilisearch"

import {
  SEARCH_API_KEY,
  SEARCH_ENDPOINT,
  SEARCH_INDEX_NAME,
} from "@lib/search-client"

/**
 * Server-side search, used by the /results page.
 *
 * This is a second MeiliSearch client on purpose, and it is not a duplicate to
 * be consolidated away. `lib/search-client.ts` exports an InstantSearch
 * *adapter* built by `instantMeiliSearch`, which speaks InstantSearch's request
 * and response shape and is what the live-updating search modal needs. This
 * path wants a plain search against the index, so it uses the raw client. Both
 * read the same endpoint, key and index name from `lib/search-client.ts`, so
 * there is exactly one place to change any of those.
 *
 * Built once at module scope rather than per call. The constructor only stores
 * configuration, so this is not about cost; it is so a misconfigured endpoint
 * fails in one place instead of on every keystroke.
 */
const client = new Meilisearch({
  host: SEARCH_ENDPOINT,
  apiKey: SEARCH_API_KEY,
})

/**
 * Uses MeiliSearch to search for a query
 * @param {string} query - search query
 */
export async function search(query: string) {
  const { hits } = await client.index(SEARCH_INDEX_NAME).search(query)

  return hits
}
