import { HttpTypes } from "@medusajs/types"
import { getProductsList } from "./products"
import { listRegions } from "./regions"

/**
 * The whole catalogue, for the routes that describe the store to machines
 * rather than to shoppers: /sitemap.xml and /llms.txt.
 */

/**
 * Products are fetched a page at a time and this is where it stops.
 *
 * 20 pages of 100 is 2,000 products, which is far beyond what a store deployed
 * from this template typically carries, and is a bound rather than a judgement
 * about what belongs in a listing. Hitting it logs, because a silently
 * truncated listing looks exactly like a complete one.
 */
const MAX_PRODUCT_PAGES = 20
const PRODUCTS_PER_PAGE = 100

/**
 * The one country code these listings are written for.
 *
 * Every URL in this storefront is region-prefixed, so `/gb/products/x` and
 * `/de/products/x` are the same product at two addresses. Listing all of them
 * would submit the entire catalogue several times over as duplicate content,
 * with no hreflang to disambiguate it, since the regions differ by currency
 * rather than by language. One region is listed instead, chosen the same way
 * middleware.ts chooses: the configured default when a region covers it, and
 * otherwise the first country served.
 */
export const listingCountryCode = async (): Promise<string | null> => {
  const regions = await listRegions()
  const served = (regions ?? [])
    .flatMap((region) => region.countries?.map((country) => country.iso_2) ?? [])
    .filter((code): code is string => Boolean(code))

  if (!served.length) return null

  const configured = process.env.NEXT_PUBLIC_DEFAULT_REGION?.toLowerCase()
  return configured && served.includes(configured) ? configured : served[0]
}

/** `caller` names the route in the log line, so the warning says which file to raise the limit for. */
export const listAllProducts = async (
  countryCode: string,
  caller: string
): Promise<HttpTypes.StoreProduct[]> => {
  const products: HttpTypes.StoreProduct[] = []

  for (let page = 1; page <= MAX_PRODUCT_PAGES; page++) {
    const { response, nextPage } = await getProductsList({
      pageParam: page,
      queryParams: { limit: PRODUCTS_PER_PAGE },
      countryCode,
    })

    products.push(...response.products)

    if (!nextPage) return products

    if (page === MAX_PRODUCT_PAGES) {
      console.warn(
        `${caller}: stopped after ${products.length} products of ${response.count}. ` +
          `Raise MAX_PRODUCT_PAGES in src/lib/data/catalogue.ts to list the rest.`
      )
    }
  }

  return products
}
