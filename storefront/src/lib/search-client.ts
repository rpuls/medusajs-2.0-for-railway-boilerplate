import {
  createInstantSearchAdapter,
  type SearchResult,
} from "@medusajs/instantsearch-adapter"
import type { ComponentProps } from "react"
import type { InstantSearch } from "react-instantsearch"

import { sdk } from "@lib/config"

/**
 * InstantSearch client for the live search modal.
 *
 * Searches through the backend's `POST /store/search` rather than querying
 * MeiliSearch from the browser. Since Medusa 2.20 the Search Module keeps each
 * index in a versioned physical index (`products_v1`, `products_v2`, ...) and
 * switches over after a rebuild, so a browser pointed at a fixed index name
 * reads a stale copy or nothing at all. The backend always knows which version
 * is live. See backend/src/api/middlewares.ts for the route's configuration.
 *
 * The SDK sends the publishable key, so no search key reaches the browser.
 *
 * The transport is spelled out as a `requester` rather than passing `sdk`
 * straight in: the adapter types the SDK's `fetch` more loosely than the SDK
 * declares it, so TypeScript rejects the shorthand even though it works.
 */
const { searchClient: adapter } = createInstantSearchAdapter({
  requester: (queries) =>
    sdk.client
      .fetch<{ results: SearchResult[] }>("/store/search", {
        method: "POST",
        body: { queries },
      })
      .then(({ results }) => results),
})

/**
 * The adapter declares its own copy of InstantSearch's client contract, which
 * is the same at runtime but not structurally identical to the one
 * react-instantsearch is typed against, so it needs this one widening.
 */
export const searchClient = adapter as unknown as ComponentProps<
  typeof InstantSearch
>["searchClient"]

/**
 * The index's registered name, which is stable across rebuilds. It is the
 * `name` the plugin's `defineProductSearchIndex()` defaults to in
 * backend/src/search/products.ts.
 */
export const SEARCH_INDEX_NAME = "products"
