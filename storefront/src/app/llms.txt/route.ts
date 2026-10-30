import { HttpTypes } from "@medusajs/types"

import { listAllProducts, listingCountryCode } from "@lib/data/catalogue"
import { listCategories } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { getBaseURL, getStoreName, isSearchEnabled } from "@lib/util/env"
import { getProductPrice } from "@lib/util/get-product-price"

/**
 * /llms.txt
 *
 * The store described for AI agents, in the format proposed at llmstxt.org: a
 * Markdown file at the site root with a title, a one-paragraph summary and
 * sections of links. An assistant asked to find, compare or buy something here
 * can read the whole catalogue with prices in one request, instead of
 * rendering product pages one at a time or guessing at the region-prefixed
 * URLs.
 *
 * It lists only what a shopper can already see, from the same Store API calls
 * the pages make, so it exposes nothing new. Drafts never appear because the
 * Store API never returns them.
 *
 * Built on every request rather than at build time, for the same reason as
 * sitemap.ts: a product added in the admin should be listed without a
 * storefront redeploy. It costs a few API calls, and agents fetch it rarely.
 */
export const dynamic = "force-dynamic"

/** Long enough to tell products apart, short enough to keep a large catalogue readable in one go. */
const DESCRIPTION_LENGTH = 160

const oneLine = (text?: string | null): string =>
  (text ?? "").replace(/\s+/g, " ").trim()

/** Square brackets in a title would end the Markdown link text early. */
const linkText = (text: string): string => text.replace(/([[\]])/g, "\\$1")

const excerpt = (text?: string | null): string => {
  const flat = oneLine(text)
  if (flat.length <= DESCRIPTION_LENGTH) return flat
  const cut = flat.slice(0, DESCRIPTION_LENGTH)
  return `${cut.slice(0, cut.lastIndexOf(" "))}...`
}

const listOf = (items: string[]): string =>
  items.length > 1
    ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
    : items.join("")

/** "€20.00", "from €20.00" when variants differ, and the old price when it is on sale. */
const priceOf = (product: HttpTypes.StoreProduct): string | null => {
  const { cheapestPrice } = getProductPrice({ product })
  if (!cheapestPrice) return null

  const highest = Math.max(
    ...(product.variants ?? []).map(
      (variant) => variant.calculated_price?.calculated_amount ?? 0
    )
  )
  const from = highest > cheapestPrice.calculated_price_number ? "from " : ""
  const was =
    cheapestPrice.price_type === "sale"
      ? ` (was ${cheapestPrice.original_price})`
      : ""

  return `${from}${cheapestPrice.calculated_price}${was}`
}

/**
 * "Size: S, M, L; Color: Black, White". Medusa gives a product without options
 * a placeholder "Default option", which says nothing to a shopper.
 */
const optionsOf = (product: HttpTypes.StoreProduct): string =>
  (product.options ?? [])
    .filter((option) => option.title !== "Default option")
    .map(
      (option) =>
        `${option.title}: ${(option.values ?? []).map((v) => v.value).join(", ")}`
    )
    .join("; ")

const productLine = (product: HttpTypes.StoreProduct, root: string): string => {
  const details = [priceOf(product), optionsOf(product), excerpt(product.description)]
    .filter(Boolean)
    .join(". ")
  const link = `[${linkText(product.title ?? product.handle!)}](${root}/products/${product.handle})`
  return details ? `- ${link}: ${details}` : `- ${link}`
}

/** Top-level categories, with their subcategories indented beneath them. */
const categoryLines = (
  categories: HttpTypes.StoreProductCategory[],
  root: string,
  parentId: string | null = null,
  depth = 0
): string[] =>
  categories
    .filter((category) => (category.parent_category_id ?? null) === parentId)
    .flatMap((category) => {
      const description = excerpt(category.description)
      const line = `${"  ".repeat(depth)}- [${linkText(category.name)}](${root}/categories/${category.handle})${description ? `: ${description}` : ""}`
      return [line, ...categoryLines(categories, root, category.id, depth + 1)]
    })

export async function GET() {
  const base = getBaseURL().replace(/\/+$/, "")
  const storeName = getStoreName()

  const [countryCode, regions] = await Promise.all([
    listingCountryCode().catch(() => null),
    listRegions().catch(() => null),
  ])

  // Without regions there is no URL to give and no price to quote. Saying so
  // with a 503 is better than an empty catalogue an agent would take at its word.
  if (!countryCode || !regions?.length) {
    return new Response(
      `# ${storeName}\n\n> The catalogue is unavailable right now. Try again in a minute.\n`,
      {
        status: 503,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Retry-After": "60",
        },
      }
    )
  }

  const root = `${base}/${countryCode}`

  // As in sitemap.ts, one section failing costs that section, not the file.
  const [products, categories, collections] = await Promise.all([
    listAllProducts(countryCode, "llms.txt").catch((error) => {
      console.warn("llms.txt: could not list products:", error)
      return []
    }),
    listCategories().catch((error) => {
      console.warn("llms.txt: could not list categories:", error)
      return []
    }),
    getCollectionsList(0, 100)
      .then(({ collections }) => collections)
      .catch((error) => {
        console.warn("llms.txt: could not list collections:", error)
        return []
      }),
  ])

  const listingRegion = regions.find((region) =>
    region.countries?.some((country) => country.iso_2 === countryCode)
  )
  const listingCountry =
    listingRegion?.countries?.find((country) => country.iso_2 === countryCode)
      ?.display_name ?? countryCode.toUpperCase()
  const currency = listingRegion?.currency_code?.toUpperCase() ?? ""

  const served = regions.flatMap((region) =>
    (region.countries ?? []).map((country) => ({
      code: country.iso_2 ?? "",
      name: country.display_name ?? country.iso_2 ?? "",
    }))
  )
  const currencies = [
    ...new Set(regions.map((region) => region.currency_code?.toUpperCase())),
  ].filter(Boolean) as string[]
  const topCategories = (categories ?? [])
    .filter((category) => !category.parent_category_id)
    .map((category) => category.name)

  const lines: string[] = [
    `# ${storeName}`,
    "",
    `> ${storeName} is an online store with ${products.length} ${products.length === 1 ? "product" : "products"}` +
      (topCategories.length ? ` in ${listOf(topCategories)}` : "") +
      `. It sells to customers in ${listOf(served.map((country) => country.name))}, with prices in ${listOf(currencies)}.`,
    "",
    "How to shop here:",
    "",
    `- Every address on this site starts with a two-letter country code, which sets the currency and where an order can be shipped. ${root}/store is the full catalogue for ${listingCountry}. The codes in use are ${served.map((country) => country.code).join(", ")}.`,
    `- Prices below are for ${listingCountry}${currency ? ` in ${currency}` : ""} and do not include shipping. The product page, the cart and the checkout always have the current price, stock and shipping cost.`,
    `- To buy, open a product page, choose the options, add it to the cart and check out from ${root}/cart. No account is needed.`,
  ]

  if (isSearchEnabled()) {
    lines.push(`- To search, open ${root}/results/ followed by the search words.`)
  }

  // The same store through the Universal Commerce Protocol, for an agent that
  // can call tools rather than read pages. See src/lib/ucp.
  lines.push(
    `- AI agents can also shop through the Universal Commerce Protocol: ${base}/.well-known/ucp describes it, and ${base}/ucp/mcp is an MCP server, with no sign-in, that searches the catalogue, builds a cart and starts a checkout. The shopper always pays on this site, at the link the checkout returns.`,
    `- Each product page is also available as Markdown, with variant IDs, prices and stock: add .md to its address.`
  )

  const categoryList = categoryLines(categories ?? [], root)
  if (categoryList.length) {
    lines.push("", "## Categories", "", ...categoryList)
  }

  const collectionList = (collections ?? [])
    .filter((collection) => collection.handle)
    .map(
      (collection) =>
        `- [${linkText(collection.title)}](${root}/collections/${collection.handle})`
    )
  if (collectionList.length) {
    lines.push("", "## Collections", "", ...collectionList)
  }

  lines.push(
    "",
    "## Products",
    "",
    ...(products.length
      ? products
          .filter((product) => product.handle)
          .map((product) => productLine(product, root))
      : ["No products are for sale yet."]),
    "",
    "## Optional",
    "",
    `- [Sitemap](${base}/sitemap.xml): every page on this site`,
    `- [Shipping](${root}/shipping), [returns](${root}/returns), [terms of service](${root}/terms) and [privacy policy](${root}/privacy)`
  )

  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
