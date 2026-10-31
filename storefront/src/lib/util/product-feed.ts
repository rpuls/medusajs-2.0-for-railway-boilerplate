import { HttpTypes } from "@medusajs/types"
import { getPricedVariants } from "./product-structured-data"

/**
 * Product feeds: the catalogue as one file that a shopping program reads on a
 * schedule, served by src/app/feeds.
 *
 * - Google Merchant Center fetches /feeds/google/{country}.xml by itself.
 *   Free listings from it appear in Google's Shopping results, and those feed
 *   AI Mode and Gemini. Any store can sign up.
 * - OpenAI reads /feeds/openai/{country}.csv for ChatGPT's shopping results,
 *   but only from merchants it has approved, and only as a file pushed to its
 *   SFTP server. backend/src/jobs/push-openai-feed.ts does that daily once
 *   the credentials OpenAI hands out are set.
 *
 * Both are one row per variant, from the same Store API call the product pages
 * make, so they list only what any visitor can already see and buy, at the
 * price the page shows. That matters: both programs check the landing page
 * and drop an item whose price or stock disagrees with the feed.
 */

/** Stock and images on top of the prices the listing calls already fetch. */
export const FEED_PRODUCT_FIELDS =
  "*variants.calculated_price,+variants.inventory_quantity,+variants.thumbnail,*variants.images,+metadata"

/** Both programs cap the title at 150 characters and the description at 5,000. */
const TITLE_LENGTH = 150
const DESCRIPTION_LENGTH = 5000
/** Google takes up to 10 additional images. */
const ADDITIONAL_IMAGES = 10

export type FeedItem = {
  id: string
  groupId: string
  /** The product has more than one variant, so rows share a group. */
  hasVariations: boolean
  title: string
  description: string
  url: string
  imageUrl?: string
  additionalImageUrls: string[]
  availability: "in_stock" | "out_of_stock" | "backorder"
  /** The regular price, "10.00 EUR". */
  price: string
  /** Set only when a sale price list lowers it. */
  salePrice?: string
  brand: string
  gtin?: string
  mpn?: string
  /** Option title to value, "Color" to "Black". */
  options: Record<string, string>
}

export type FeedStore = {
  name: string
  /** The storefront's public origin, without a trailing slash. */
  base: string
  countryCode: string
  region: HttpTypes.StoreRegion
}

const fractionDigits = (currency: string) =>
  new Intl.NumberFormat("en", {
    style: "currency",
    currency,
  }).resolvedOptions().maximumFractionDigits ?? 2

/** "79.99 USD": the format both programs read, never a localised one like "79,99 €". */
const money = (amount: number, currency: string) =>
  `${amount.toFixed(fractionDigits(currency))} ${currency}`

const clip = (text: string, length: number) =>
  text.length <= length ? text : `${text.slice(0, length - 3).trimEnd()}...`

/**
 * A GTIN only if it is one: 8, 12, 13 or 14 digits with a valid check digit.
 * Both programs reject an item whose GTIN fails the check, and a missing one
 * merely costs ranking, so an invalid value in the admin is left out rather
 * than passed on.
 */
export const validGtin = (value?: string | null): string | undefined => {
  const digits = (value ?? "").replace(/[\s-]/g, "")
  if (!/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(digits) || /^0+$/.test(digits)) {
    return undefined
  }
  const sum = digits
    .slice(0, -1)
    .split("")
    .reverse()
    .reduce((acc, digit, i) => acc + Number(digit) * (i % 2 === 0 ? 3 : 1), 0)
  return (10 - (sum % 10)) % 10 === Number(digits[digits.length - 1])
    ? digits
    : undefined
}

const availabilityOf = (
  variant: HttpTypes.StoreProductVariant
): FeedItem["availability"] => {
  if (!variant.manage_inventory || (variant.inventory_quantity ?? 0) > 0) {
    return "in_stock"
  }
  return variant.allow_backorder ? "backorder" : "out_of_stock"
}

/** Variant images first, then the product's; absolute URLs only, since a program fetches them from outside. */
const imagesOf = (
  product: HttpTypes.StoreProduct,
  variant: HttpTypes.StoreProductVariant
): string[] => {
  const variantImages = variant as HttpTypes.StoreProductVariant & {
    thumbnail?: string | null
    images?: { url?: string | null }[] | null
  }
  const urls = [
    variantImages.thumbnail,
    ...(variantImages.images ?? []).map((image) => image.url),
    product.thumbnail,
    ...(product.images ?? []).map((image) => image.url),
  ].filter((url): url is string => !!url && /^https?:\/\//.test(url))
  return [...new Set(urls)]
}

export const buildFeedItems = (
  products: HttpTypes.StoreProduct[],
  store: FeedStore
): FeedItem[] => {
  const currency = store.region.currency_code.toUpperCase()
  const root = `${store.base}/${store.countryCode}`

  return products.flatMap((product) => {
    if (!product.handle) return []

    // A variant without a price in this region cannot be bought here, so it
    // has no row: the program would show a product the checkout refuses.
    const variants = getPricedVariants(product)
    const hasVariations = variants.length > 1
    const optionTitles = new Map(
      (product.options ?? []).map((option) => [option.id, option.title])
    )
    const productUrl = `${root}/products/${product.handle}`

    // The brand is the store's own unless a product says otherwise in its
    // metadata. Both programs require one, and for a store selling its own
    // goods its name is the right answer. A reseller sets `brand` in each
    // product's metadata in the admin.
    const metadataBrand =
      typeof product.metadata?.brand === "string"
        ? product.metadata.brand.trim()
        : ""
    const brand = metadataBrand || store.name

    return variants.map((variant): FeedItem => {
      const price = variant.calculated_price!
      const shown = price.calculated_amount!
      const regular = price.original_amount ?? shown
      const onSale =
        price.calculated_price?.price_list_type === "sale" && shown < regular

      const options = Object.fromEntries(
        (variant.options ?? [])
          .map((value) => [optionTitles.get(value.option_id ?? ""), value.value])
          .filter(
            (pair): pair is [string, string] =>
              !!pair[0] && !!pair[1] && pair[0] !== "Default option"
          )
      )
      const [imageUrl, ...additionalImageUrls] = imagesOf(product, variant)

      return {
        id: variant.id,
        groupId: product.id,
        hasVariations,
        title: clip(
          hasVariations ? `${product.title} - ${variant.title}` : product.title,
          TITLE_LENGTH
        ),
        description: clip(
          (product.description || product.title).trim(),
          DESCRIPTION_LENGTH
        ),
        // ?v_id= preselects the variant on the product page, so the program
        // finds the price and stock of this row there and not the first one's.
        url: hasVariations ? `${productUrl}?v_id=${variant.id}` : productUrl,
        imageUrl,
        additionalImageUrls: additionalImageUrls.slice(0, ADDITIONAL_IMAGES),
        availability: availabilityOf(variant),
        price: money(onSale ? regular : shown, currency),
        salePrice: onSale ? money(shown, currency) : undefined,
        brand,
        gtin: validGtin(variant.ean) ?? validGtin(variant.upc) ?? validGtin(variant.barcode),
        // The SKU is the part number only when the store makes the product
        // itself. For another brand's goods it is the store's own code, and
        // both programs treat an invented MPN as a wrong one.
        mpn: metadataBrand ? undefined : variant.sku || undefined,
        options,
      }
    })
  })
}

/** Characters XML 1.0 cannot carry at all, which a pasted description sometimes brings along. */
const INVALID_XML = /[^\x09\x0A\x0D\x20-퟿-�]/g

const xml = (text: string) =>
  text
    .replace(INVALID_XML, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")

const optionValue = (options: Record<string, string>, pattern: RegExp) =>
  Object.entries(options).find(([title]) => pattern.test(title))?.[1]

/**
 * Google's RSS 2.0 format with the g: namespace, as Merchant Center reads it
 * from a scheduled fetch. Colour and size go out as their own attributes,
 * which Google requires for clothing in several countries. Gender and age
 * group it requires there too, but Medusa has no field for them.
 */
export const toGoogleFeed = (items: FeedItem[], store: FeedStore): string => {
  const tag = (name: string, value?: string) =>
    value ? `      <g:${name}>${xml(value)}</g:${name}>` : null

  const entries = items.map((item) =>
    [
      "    <item>",
      tag("id", item.id),
      item.hasVariations ? tag("item_group_id", item.groupId) : null,
      tag("title", item.title),
      tag("description", item.description),
      tag("link", item.url),
      tag("image_link", item.imageUrl),
      ...item.additionalImageUrls.map((url) => tag("additional_image_link", url)),
      tag("availability", item.availability),
      tag("price", item.price),
      tag("sale_price", item.salePrice),
      tag("brand", item.brand),
      tag("condition", "new"),
      tag("gtin", item.gtin),
      tag("mpn", item.mpn),
      // "no" tells Google the product has no manufacturer code to match on,
      // instead of leaving it to mark the item as missing one.
      !item.gtin && !item.mpn ? tag("identifier_exists", "no") : null,
      tag("color", optionValue(item.options, /^colou?r$/i)),
      tag("size", optionValue(item.options, /^size$/i)),
      "    </item>",
    ]
      .filter(Boolean)
      .join("\n")
  )

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">`,
    "  <channel>",
    `    <title>${xml(store.name)}</title>`,
    `    <link>${xml(`${store.base}/${store.countryCode}`)}</link>`,
    `    <description>${xml(`${store.name} products for ${store.countryCode.toUpperCase()}, in ${store.region.currency_code.toUpperCase()}`)}</description>`,
    ...entries,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n")
}

/** The columns of OpenAI's product feed, in the order they are written. */
export const OPENAI_FEED_COLUMNS = [
  "item_id",
  "title",
  "description",
  "url",
  "brand",
  "seller_name",
  "image_url",
  "additional_image_urls",
  "availability",
  "price",
  "sale_price",
  "condition",
  "group_id",
  "listing_has_variations",
  "variant_dict",
  "gtin",
  "mpn",
  "seller_url",
  "return_policy",
  "seller_privacy_policy",
  "seller_tos",
  "is_eligible_search",
  "is_eligible_checkout",
] as const

/** Quoted when it holds a comma, quote or line break, with quotes doubled, as the spec asks. */
const csvCell = (value: string | undefined) => {
  if (!value) return ""
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

/**
 * OpenAI's product feed as CSV, to the field reference at
 * developers.openai.com/commerce/specs/file-upload/products.
 *
 * The policy columns link the store's own pages and promise nothing:
 * `accepts_returns` and a return window are left out because the template's
 * returns page is a placeholder, and stating a window the owner never set
 * would be a promise made in their name. Checkout stays off; it needs a
 * separate integration with OpenAI that this template does not have.
 */
export const toOpenAiFeed = (items: FeedItem[], store: FeedStore): string => {
  const root = `${store.base}/${store.countryCode}`

  const rows = items.map((item) => {
    const row: Record<(typeof OPENAI_FEED_COLUMNS)[number], string | undefined> = {
      item_id: item.id,
      title: item.title,
      description: item.description,
      url: item.url,
      brand: item.brand,
      seller_name: store.name,
      image_url: item.imageUrl,
      // Comma separated in CSV, so a comma inside a URL is percent-encoded.
      additional_image_urls: item.additionalImageUrls
        .map((url) => url.replace(/,/g, "%2C"))
        .join(","),
      availability: item.availability,
      price: item.price,
      sale_price: item.salePrice,
      condition: "new",
      group_id: item.hasVariations ? item.groupId : undefined,
      listing_has_variations: item.hasVariations ? "true" : "false",
      variant_dict: item.hasVariations ? JSON.stringify(item.options) : undefined,
      gtin: item.gtin,
      mpn: item.mpn,
      seller_url: root,
      return_policy: `${root}/returns`,
      seller_privacy_policy: `${root}/privacy`,
      seller_tos: `${root}/terms`,
      is_eligible_search: "true",
      is_eligible_checkout: "false",
    }
    return OPENAI_FEED_COLUMNS.map((column) => csvCell(row[column])).join(",")
  })

  return `${[OPENAI_FEED_COLUMNS.join(","), ...rows].join("\n")}\n`
}
