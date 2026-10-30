import type { MetadataRoute } from "next"

import { getCollectionsList } from "@lib/data/collections"
import { listCategories } from "@lib/data/categories"
import { listAllProducts, listingCountryCode } from "@lib/data/catalogue"
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

type Entry = MetadataRoute.Sitemap[number]

const lastModified = (value?: string | null): Date | undefined => {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseURL().replace(/\/+$/, "")

  const countryCode = await listingCountryCode().catch(() => null)

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
    listAllProducts(countryCode, "sitemap").catch((error) => {
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
