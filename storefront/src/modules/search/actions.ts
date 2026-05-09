"use server"

import { SEARCH_INDEX_NAME, searchClient } from "@lib/search-client"

interface Hits {
  readonly objectID?: string
  id?: string
  [x: string | number | symbol]: unknown
}

/**
 * Uses MeiliSearch or Algolia to search for a query
 * @param {string} query - search query
 */
export async function search(query: string) {
  // MeiliSearch
  const queries = [{ params: { query }, indexName: SEARCH_INDEX_NAME }]
  const { results } = (await searchClient.search(queries)) as Record<
    string,
    any
  >
  const { hits } = results[0] as { hits: Hits[] }

  // In case you want to use Algolia instead of MeiliSearch, uncomment the following lines and delete the above lines.

  // const index = searchClient.initIndex(SEARCH_INDEX_NAME)
  // const { hits } = (await index.search(query)) as { hits: Hits[] }

  // Fire-and-forget log of the search to the backend so the admin
  // Reports → Catalog & supply tab can surface top + zero-result
  // queries. Failures are swallowed — never break search UX.
  void logSearchEvent(query.trim(), Array.isArray(hits) ? hits.length : 0)

  return hits
}

const logSearchEvent = async (query: string, resultsCount: number) => {
  if (!query) return
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL?.replace(
    /\/$/,
    ""
  )
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (!backendUrl || !publishableKey) return

  try {
    await fetch(`${backendUrl}/store/search-events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": publishableKey,
      },
      body: JSON.stringify({
        query,
        results_count: resultsCount,
      }),
      // Server-action context — keep the request short so it doesn't
      // hold up the response.
      signal: AbortSignal.timeout(2000),
    })
  } catch {
    // intentional silent
  }
}
