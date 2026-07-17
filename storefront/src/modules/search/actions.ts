"use server"

import { Meilisearch } from "meilisearch"

import {
  SEARCH_API_KEY,
  SEARCH_ENDPOINT,
  SEARCH_INDEX_NAME,
} from "@lib/search-client"

/**
 * Uses MeiliSearch to search for a query
 * @param {string} query - search query
 */
export async function search(query: string) {
  const client = new Meilisearch({
    host: SEARCH_ENDPOINT,
    apiKey: SEARCH_API_KEY,
  })

  const { hits } = await client.index(SEARCH_INDEX_NAME).search(query)

  return hits
}
