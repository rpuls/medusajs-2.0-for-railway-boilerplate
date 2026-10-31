import { listAllProducts } from "@lib/data/catalogue"
import { getRegion } from "@lib/data/regions"
import { getBaseURL, getStoreName } from "@lib/util/env"
import {
  buildFeedItems,
  FEED_PRODUCT_FIELDS,
  FeedItem,
  FeedStore,
} from "@lib/util/product-feed"

/**
 * The shared half of /feeds/google/{country}.xml and /feeds/openai/{country}.csv.
 * `file` is the last path segment, `extension` the one that route serves.
 *
 * Returns a Response for every failure. A 404 for a country no region covers,
 * and a 503, never an empty feed, when the catalogue cannot be read: Merchant
 * Center takes a fetched feed as the complete catalogue, so a backend hiccup
 * answered with zero items would take every product off Google until the next
 * fetch. A failed fetch makes it keep the previous one instead.
 */
export const loadFeed = async (
  file: string,
  extension: string,
  caller: string
): Promise<
  { items: FeedItem[]; store: FeedStore } | { error: Response }
> => {
  const countryCode = file.toLowerCase().match(new RegExp(`^([a-z]{2})\\.${extension}$`))?.[1]
  const region = countryCode ? await getRegion(countryCode) : null

  if (!countryCode || !region) {
    return {
      error: new Response(
        `No feed here. Name the file after a country your store sells to, such as us.${extension}; /llms.txt lists them.\n`,
        { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } }
      ),
    }
  }

  try {
    const products = await listAllProducts(
      countryCode,
      caller,
      FEED_PRODUCT_FIELDS
    )
    const store: FeedStore = {
      name: getStoreName(),
      base: getBaseURL().replace(/\/+$/, ""),
      countryCode,
      region,
    }
    return { items: buildFeedItems(products, store), store }
  } catch (error) {
    console.warn(`${caller}: could not list products:`, error)
    return {
      error: new Response("The catalogue is unavailable right now.\n", {
        status: 503,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Retry-After": "300",
        },
      }),
    }
  }
}
