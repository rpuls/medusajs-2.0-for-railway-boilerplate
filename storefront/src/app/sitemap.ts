import type { MetadataRoute } from "next"

import { getCollectionsList } from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
import { getProductsList } from "@lib/data/products"
import { listRegions } from "@lib/data/regions"
import { getBaseURL } from "@lib/util/env"

/**
 * /sitemap.xml
 *
 * The template shipped a `next-sitemap.js` config for a package that is not in
 * package.json and never has been, so every store deployed from it advertised a
 * sitemap and served none. This is the replacement, using Next's own metadata
 * route, which needs no dependency.
 *
 * Never pinned at build time. A merchant who adds a product should not have to
 * redeploy the storefront for it to become crawlable, which is the same class
 * of staleness that made every /collections/* URL return 500 until a rebuild.
 *
 * In practice the build reports this route as server-rendered on demand rather
 * than revalidated on a timer, because the shared data layer touches request
 * APIs. That is fine and it is why the ceiling below exists: a sitemap is
 * fetched by crawlers, not by shoppers, so a handful of API calls per request
 * costs nothing. The declaration stays as the intent, and as the behaviour this
 * route would get if the data layer ever stopped being request-scoped.
 */
export const revalidate = 3600

/**
 * Products are fetched a page at a time and this is where it stops.
 *
 * 20 pages of 100 is 2,000 products, which is far beyond what a store deployed
 * from this template typically carries, and is a bound rather than a judgement
 * about what belongs in a sitemap. Hitting it logs, because a silently
 * truncated sitemap looks exactly like a complete one.
 */
const MAX_PRODUCT_PAGES = 20
const PRODUCTS_PER_PAGE = 100

type Entry = MetadataRoute.Sitemap[number]

const lastModified = (value?: string | null): Date | undefined => {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

/**
 * The one country code the sitemap is written for.
 *
 * Every URL in this storefront is region-prefixed, so `/gb/products/x` and
 * `/de/products/x` are the same product at two addresses. Listing all of them
 * would submit the entire catalogue several times over as duplicate content,
 * with no hreflang to disambiguate it, since the regions differ by currency
 * rather than by language. One region is listed instead, chosen the same way
 * middleware.ts chooses: the configured default when a region covers it, and
 * otherwise the first country served.
 */
const sitemapCountryCode = async (): Promise<string | null> => {
  const regions = await listRegions()
  const served = (regions ?? [])
    .flatMap((region) => region.countries?.map((country) => country.iso_2) ?? [])
    .filter((code): code is string => Boolean(code))

  if (!served.length) return null

  const configured = process.env.NEXT_PUBLIC_DEFAULT_REGION?.toLowerCase()
  return configured && served.includes(configured) ? configured : served[0]
}

const allProducts = async (countryCode: string) => {
  const products = []

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
        `sitemap: stopped after ${products.length} products of ${response.count}. ` +
          `Raise MAX_PRODUCT_PAGES in src/app/sitemap.ts to list the rest.`
      )
    }
  }

  return products
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseURL().replace(/\/+$/, "")

  const countryCode = await sitemapCountryCode().catch(() => null)

  // No reachable backend means no regions, and a region prefix is the one thing
  // every URL here needs. An empty sitemap is a truthful answer; a 500 is not.
  if (!countryCode) {
    console.warn(
      "sitemap: no regions available, so no URLs could be generated. Is the backend reachable?"
    )
    return []
  }

  const root = `${base}/${countryCode}`

  const entries: Entry[] = [
    { url: root, changeFrequency: "daily", priority: 1 },
    { url: `${root}/store`, changeFrequency: "daily", priority: 0.9 },
  ]

  /*
   * Each source is fetched independently and its failure is contained.
   *
   * A store with no collections, or a categories endpoint having a bad minute,
   * should cost the sitemap that section and nothing else. Promise.all would
   * throw the whole route away over one of them.
   */
  const [products, categories, collections] = await Promise.all([
    allProducts(countryCode).catch((error) => {
      console.warn("sitemap: could not list products:", error)
      return []
    }),
    listCategories().catch((error) => {
      console.warn("sitemap: could not list categories:", error)
      return []
    }),
    getCollectionsList(0, 100)
      .then(({ collections }) => collections)
      .catch((error) => {
        console.warn("sitemap: could not list collections:", error)
        return []
      }),
  ])

  for (const product of products) {
    if (!product.handle) continue
    entries.push({
      url: `${root}/products/${product.handle}`,
      lastModified: lastModified(product.updated_at),
      changeFrequency: "weekly",
      priority: 0.8,
    })
  }

  for (const category of categories ?? []) {
    if (!category.handle) continue
    entries.push({
      url: `${root}/categories/${category.handle}`,
      lastModified: lastModified(category.updated_at),
      changeFrequency: "weekly",
      priority: 0.7,
    })
  }

  for (const collection of collections ?? []) {
    if (!collection.handle) continue
    entries.push({
      url: `${root}/collections/${collection.handle}`,
      lastModified: lastModified(collection.updated_at),
      changeFrequency: "weekly",
      priority: 0.7,
    })
  }

  return entries
}
