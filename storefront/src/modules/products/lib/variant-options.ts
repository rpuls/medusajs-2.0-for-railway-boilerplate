import type { HttpTypes } from "@medusajs/types"
import { isEqual } from "lodash"

import { remapStaleExternalGarmentUrl } from "@lib/util/remap-stale-supplier-images"

/** Same values as customizer `GarmentSide`; kept local to avoid importing customizer from product lib. */
type PrintGarmentSide = "front" | "back" | "left_sleeve" | "right_sleeve" | "printed_tag"

/** Short-sleeve side-view mockups (`public/placeholders/customizer/`). */
const SLEEVE_PLACEHOLDER_LEFT_SHORT = "/placeholders/customizer/left-sleeve-placeholder.svg"
const SLEEVE_PLACEHOLDER_RIGHT_SHORT = "/placeholders/customizer/left-sleeve-placeholder.svg"

/** Long-sleeve side-view mockups. */
const SLEEVE_PLACEHOLDER_LEFT_LONG = "/placeholders/customizer/left-sleeve-long-placeholder.svg"
const SLEEVE_PLACEHOLDER_RIGHT_LONG = "/placeholders/customizer/left-sleeve-long-placeholder.svg"

/**
 * Whether sleeve print areas should use long-sleeve placeholder art.
 * Uses product metadata when set; otherwise title/handle/description heuristics
 * (e.g. hoodies vs tees). Override with `metadata.sleeve_length`: "long" | "short".
 */
export function isLongSleeveGarmentProduct(
  product: HttpTypes.StoreProduct | undefined | null
): boolean {
  if (!product) {
    return false
  }

  const meta = (product.metadata ?? {}) as Record<string, unknown>
  const metaString = (key: string): string | null => {
    const v = meta[key]
    return typeof v === "string" && v.trim() ? v.trim().toLowerCase() : null
  }

  for (const key of [
    "sleeve_length",
    "sleeve_type",
    "sleeves",
    "apparel_sleeve",
    "garment_sleeve",
  ] as const) {
    const s = metaString(key)
    if (s) {
      if (/\blong\b/.test(s)) {
        return true
      }
      if (/\bshort\b/.test(s)) {
        return false
      }
    }
  }

  const blob = [
    product.title,
    product.handle,
    product.subtitle,
    product.description,
    metaString("style"),
    metaString("product_type"),
  ]
    .filter(Boolean)
    .join(" ")

  const lower = blob.toLowerCase()

  if (/\b(short[\s-]*sleeve|shortsleeve|s\/s)\b/i.test(blob)) {
    return false
  }
  if (/\b(long[\s-]*sleeve|longsleeve|l\/s)\b/i.test(blob)) {
    return true
  }

  if (
    /\b(hoodie|hood\b|sweatshirt|sweat\s*shirt|fleece|pullover|jumper|sweater|rugby|jerseys?|crewneck|crew\s*neck|cardigan|cardigans)\b/i.test(
      lower
    )
  ) {
    return true
  }

  if (/\b(tee|t-?shirt|tank|singlet|polo)\b/i.test(lower)) {
    return false
  }

  return false
}

const HOODIE_META_KEYS = [
  "garment_type",
  "style",
  "product_type",
  "category",
  "apparel_category",
] as const

/** Hoodie / hooded fleece products — used for home “featured range” and similar rails. */
export function isHoodieGarmentProduct(
  product: HttpTypes.StoreProduct | undefined | null
): boolean {
  if (!product) {
    return false
  }

  const meta = (product.metadata ?? {}) as Record<string, unknown>
  const metaString = (key: string): string | null => {
    const v = meta[key]
    return typeof v === "string" && v.trim() ? v.trim().toLowerCase() : null
  }

  for (const key of HOODIE_META_KEYS) {
    const s = metaString(key)
    if (s && /\bhoodie\b/.test(s)) {
      return true
    }
  }

  const blob = [
    product.title,
    product.handle,
    product.subtitle,
    product.description,
    metaString("style"),
    metaString("product_type"),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return /\b(hoodie|hoodies|hooded|hood\b|zip\s*hood|zip\s*hoodie|sweatshirt|sweat\s*shirt)\b/.test(
    blob
  )
}

const HEADWEAR_META_KEYS = [
  "garment_type",
  "style",
  "product_type",
  "category",
  "apparel_category",
  "headwear_type",
] as const

const readHeadwearMeta = (
  product: HttpTypes.StoreProduct | undefined | null
): { metaBlob: string; titleBlob: string } => {
  const meta = (product?.metadata ?? {}) as Record<string, unknown>
  const metaString = (key: string): string | null => {
    const v = meta[key]
    return typeof v === "string" && v.trim() ? v.trim().toLowerCase() : null
  }
  const metaBlob = HEADWEAR_META_KEYS.map(metaString).filter(Boolean).join(" ")
  const titleBlob = [
    product?.title,
    product?.handle,
    product?.subtitle,
    product?.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return { metaBlob, titleBlob }
}

/**
 * Beanie products — knit pull-on caps with no brim. Decoration is embroidery
 * only; the print customizer is suppressed in favour of the embroidery panel.
 *
 * Detection order: explicit metadata first (canonical, override-friendly) →
 * title/handle keyword fallback. The fallback intentionally requires the
 * word "beanie" rather than just "knit" or "fleece" so a fleece pullover
 * doesn't get misclassified.
 */
export function isBeanieGarmentProduct(
  product: HttpTypes.StoreProduct | undefined | null
): boolean {
  if (!product) return false
  const { metaBlob, titleBlob } = readHeadwearMeta(product)
  if (/\bbeanie(s)?\b/.test(metaBlob)) return true
  return /\bbeanie(s)?\b/.test(titleBlob)
}

/**
 * Hat / cap products with a brim — baseball caps, snapbacks, truckers,
 * buckets, etc. Print is allowed but locked to A6 (the only realistic
 * size on a curved crown). Embroidery is also allowed.
 *
 * Beanies are explicitly excluded so they don't double-classify; the
 * beanie path takes precedence.
 */
export function isHatGarmentProduct(
  product: HttpTypes.StoreProduct | undefined | null
): boolean {
  if (!product) return false
  if (isBeanieGarmentProduct(product)) return false
  const { metaBlob, titleBlob } = readHeadwearMeta(product)
  // Metadata wins. We accept "hat", "cap", or "headwear" as a generic
  // signal; "beanie" was already excluded above.
  if (/\b(hat|cap|caps|headwear)\b/.test(metaBlob)) return true
  // Title fallback. Caps/snapbacks/truckers/buckets/visors all use the
  // brimmed-headwear print restrictions. We anchor on whole words to
  // avoid false positives (e.g. "capacity", "thatched").
  return /\b(cap|caps|snapback(s)?|trucker(s)?|bucket\s*hat|visor(s)?|brim(med)?|hat(s)?)\b/.test(
    titleBlob
  )
}

function getSleevePlaceholderUrl(
  side: "left_sleeve" | "right_sleeve",
  product: HttpTypes.StoreProduct | undefined
): string {
  // Both sleeve sides resolve to the same source file — the right sleeve view
  // is rendered by mirroring (CSS scaleX(-1)) in the canvas stage. This keeps
  // a single source of truth so future placeholder updates only happen once.
  const long = isLongSleeveGarmentProduct(product)
  // `side` retained in the signature for callers that may key by side (e.g.
  // analytics, mockup naming) even though both branches return the left URL.
  void side
  return long ? SLEEVE_PLACEHOLDER_LEFT_LONG : SLEEVE_PLACEHOLDER_LEFT_SHORT
}

/** Normalizes option titles and colour labels for stable matching across UI and API. */
export const toTitleSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

/** Shared matcher for color-like product option titles (Color/Colour/Shade). */
export const COLOR_OPTION_MATCHER = /(color|colour|shade)/i

export const isColorOptionTitle = (title: string | undefined | null): boolean =>
  typeof title === "string" && COLOR_OPTION_MATCHER.test(title)

export const normalizeImageUrl = (url: string) => url.split("?")[0].trim()

export const optionsAsKeymap = (
  variantOptions: unknown[] | undefined,
  product?: HttpTypes.StoreProduct
) => {
  return (variantOptions ?? []).reduce(
    (acc: Record<string, string | undefined>, varopt: any) => {
      if (varopt.value === null || varopt.value === undefined) {
        return acc
      }
      if (varopt.option?.title) {
        acc[varopt.option.title] = varopt.value
        return acc
      }
      if (product?.options?.length && varopt.option_id) {
        const def = product.options.find((o) => o.id === varopt.option_id)
        if (def?.title) {
          acc[def.title] = varopt.value
        }
      }
      return acc
    },
    {}
  )
}

/**
 * Resolves a variant’s value for a product option, including when the Store API
 * returns `options` entries with `option_id` but no nested `option.title`.
 */
export const getVariantOptionValue = (
  variant: HttpTypes.StoreProductVariant,
  optionTitle: string,
  product?: HttpTypes.StoreProduct
) => {
  const normalizedTitle = toTitleSlug(optionTitle)

  const fromEmbedded = (variant.options ?? []).find((variantOption: any) => {
    const title = variantOption?.option?.title
    return typeof title === "string" && toTitleSlug(title) === normalizedTitle
  })
  if (fromEmbedded) {
    return (fromEmbedded.value as string | undefined) ?? undefined
  }

  if (!product?.options?.length) {
    return undefined
  }
  const productOption = product.options.find(
    (o) => o.title && toTitleSlug(o.title) === normalizedTitle
  )
  if (!productOption?.id) {
    return undefined
  }
  const byId = (variant.options ?? []).find(
    (vo) => (vo as { option_id?: string })?.option_id === productOption.id
  )
  return (byId as { value?: string } | undefined)?.value
}

/** First variant whose colour option matches `colorValue` (slug-safe), for gallery/thumbnail previews. */
export function findFirstVariantForColorValue(
  product: HttpTypes.StoreProduct,
  colorValue: string
): HttpTypes.StoreProductVariant | undefined {
  const colorOption = product.options?.find((o) => isColorOptionTitle(o.title))
  const colorTitle = colorOption?.title
  if (!colorTitle) {
    return undefined
  }
  const want = toTitleSlug(colorValue)
  return (product.variants ?? []).find((v) => {
    const val = getVariantOptionValue(v, colorTitle, product)
    return typeof val === "string" && toTitleSlug(val) === want
  })
}

const parseGarmentImagesObject = (
  garmentImages: unknown
): { front?: string; back?: string; urls: string[] } => {
  if (!garmentImages) {
    return { urls: [] }
  }

  if (typeof garmentImages === "string") {
    try {
      const parsed = JSON.parse(garmentImages) as Record<string, unknown>
      const all = Array.isArray(parsed.all) ? parsed.all : []
      const raw = [parsed.front, parsed.back, ...all].filter(
        (value): value is string => typeof value === "string" && value.length > 0
      )
      return {
        front: typeof parsed.front === "string" && parsed.front.length ? parsed.front : undefined,
        back: typeof parsed.back === "string" && parsed.back.length ? parsed.back : undefined,
        urls: dedupeImageUrls(raw),
      }
    } catch {
      return { urls: [] }
    }
  }

  if (typeof garmentImages !== "object" || garmentImages === null) {
    return { urls: [] }
  }

  const obj = garmentImages as Record<string, unknown>
  const all = Array.isArray(obj.all) ? obj.all : []
  const raw = [obj.front, obj.back, ...all].filter(
    (value): value is string => typeof value === "string" && value.length > 0
  )

  return {
    front: typeof obj.front === "string" && obj.front.length ? obj.front : undefined,
    back: typeof obj.back === "string" && obj.back.length ? obj.back : undefined,
    urls: dedupeImageUrls(raw),
  }
}

function dedupeImageUrls(urls: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const url of urls) {
    const key = normalizeImageUrl(url)
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    out.push(url)
  }
  return out
}

/** All garment image URLs for gallery (front, back, unique extras). */
export const getGarmentImageUrlsFromMetadata = (
  metadata: Record<string, unknown> | undefined
): string[] => {
  const garmentImages = metadata?.garment_images
  const { urls } = parseGarmentImagesObject(garmentImages)
  return urls
}

/** Single URL for swatches: prefer explicit front, else first gallery URL. */
export const getGarmentSwatchImageUrlFromMetadata = (
  metadata: Record<string, unknown> | undefined
): string | undefined => {
  const garmentImages = metadata?.garment_images
  const { front, urls } = parseGarmentImagesObject(garmentImages)
  if (front) {
    return front
  }
  return urls[0]
}

export const findProductImageByUrl = (
  url: string,
  validImages: Array<{ id: string; url: string }>
): { id: string; url: string } | undefined => {
  const target = normalizeImageUrl(url)
  return validImages.find(
    (image) => image.url === url || normalizeImageUrl(image.url) === target
  )
}

/** Minimum digit length in an image filename to treat as a SKU-mappable product code. */
const MIN_IMAGE_SKU_CODE_LEN = 5

/**
 * Extracts a numeric “style code” from an image path (DNC: `.../3335100.jpg` — no colour words in URL).
 * Prefers a basename that is all digits; otherwise the longest 5+ digit run in the filename.
 */
function extractImageBasenameNumericCode(url: string): string | null {
  const noQuery = url.split("?")[0] ?? url
  const lastSegment = (noQuery.split("/").pop() ?? "").split("?")[0] ?? ""
  if (!lastSegment) {
    return null
  }
  const nameOnly = lastSegment.split(".")[0] ?? lastSegment
  if (/^\d+$/.test(nameOnly) && nameOnly.length >= MIN_IMAGE_SKU_CODE_LEN) {
    return nameOnly
  }
  const m = nameOnly.match(/(\d{5,})/g)
  if (!m?.length) {
    return null
  }
  const best = m.reduce((a, b) => (b.length > a.length ? b : a))
  return best.length >= MIN_IMAGE_SKU_CODE_LEN ? best : null
}

/**
 * Picks the product image whose filename code is a prefix of `variant.sku` (longest match wins).
 * Used for suppliers that encode colour in SKU digits but not in image URL text.
 */
export function findProductImageByVariantSku(
  validImages: Array<{ id: string; url: string }>,
  variant: HttpTypes.StoreProductVariant
): { id: string; url: string } | undefined {
  const rawSku = (variant as { sku?: string | null }).sku
  const sku = typeof rawSku === "string" && rawSku.length > 0 ? rawSku.trim() : ""
  if (!sku || validImages.length <= 1) {
    return undefined
  }
  const pairs: { code: string; image: { id: string; url: string } }[] = []
  for (const image of validImages) {
    const code = extractImageBasenameNumericCode(image.url)
    if (code) {
      pairs.push({ code, image })
    }
  }
  if (pairs.length === 0) {
    return undefined
  }
  pairs.sort((a, b) => b.code.length - a.code.length)
  for (const { code, image } of pairs) {
    if (sku.startsWith(code)) {
      return image
    }
  }
  return undefined
}

/** Tokens derived from a colour label for matching inside image URLs/filenames. */
export const buildColorNeedles = (colorValue: string): string[] => {
  const normalized = toTitleSlug(colorValue)
  if (!normalized) {
    return []
  }
  const words = normalized.split(" ").filter(Boolean)
  const compact = words.join("")
  const joinedWithDash = words.join("-")
  const joinedWithUnderscore = words.join("_")
  return Array.from(new Set([normalized, compact, joinedWithDash, joinedWithUnderscore, ...words]))
}

export const urlMatchesColorNeedles = (url: string, needles: string[]): boolean => {
  if (!needles.length) {
    return true
  }
  const normalizedUrl = toTitleSlug(url)
  return needles.some((needle) => normalizedUrl.includes(needle))
}

/**
 * Stricter than {@link urlMatchesColorNeedles}: for multi-word colours, every significant word
 * must appear in the URL/filename. Prevents e.g. "Marle" alone matching both "White Marle" and "Grey Marle".
 */
export const urlMatchesColorLabelStrict = (url: string, colorLabel: string): boolean => {
  const normalizedUrl = toTitleSlug(url).replace(/\s/g, "")
  const slug = toTitleSlug(colorLabel)
  if (!slug) {
    return true
  }

  const compact = slug.replace(/\s/g, "")
  if (compact && normalizedUrl.includes(compact)) {
    return true
  }

  const words = slug.split(/\s+/).filter((w) => w.length >= 2)
  if (words.length >= 2) {
    return words.every((w) => normalizedUrl.includes(w))
  }

  if (words.length === 1) {
    return normalizedUrl.includes(words[0])
  }

  return Boolean(compact && normalizedUrl.includes(compact))
}

/**
 * Wholesaler / filename tokens that often stand in for a colour (when the label
 * is "Tan" but the file only contains `KHK_` or `blk`).
 */
const APPAREL_COLOR_CODE_HINTS: Record<string, string[]> = {
  black: ["blk", "blck", "bkk", "bkg"],
  navy: ["navy", "nvy", "nav", "nvd"],
  tan: ["tan", "khk", "khc", "kaki", "oat", "sand", "bge"],
  khaki: ["khk", "khc", "tan", "sand", "bge"],
  stone: ["stone", "sto", "gry", "mrl"],
  natural: ["natural", "nat", "natur"],
  beige: ["beige", "bge", "bgr"],
  marle: ["marle", "mrl", "mrla"],
  grey: ["grey", "gry", "gray", "grye"],
  gray: ["grey", "gry", "gray"],
  white: ["white", "wht", "whte"],
  charcoal: ["charcoal", "char", "chc"],
  green: ["green", "grn", "kgn"],
  red: ["red", "crd", "bgrd"],
  orange: ["orange", "ong", "org", "gng"],
  yellow: ["yellow", "yel", "gld"],
  pink: ["pink", "pik", "pnk"],
  purple: ["purple", "ppl", "pur"],
  maroon: ["maroon", "mrn", "bgy"],
  brown: ["brown", "brn", "brwn"],
  rust: ["rust", "rts"],
  olive: ["olive", "olv", "oli"],
  bone: ["bone", "bne", "bwn"],
  silver: ["silver", "slv", "slvr"],
  gold: ["gold", "gld", "gol"],
}

/**
 * Broader than {@link buildColorNeedles} — adds common apparel abbreviations
 * for relaxed URL matching when strict matching fails.
 */
export function buildColorNeedlesForRelaxedMatch(colorLabel: string): string[] {
  const base = buildColorNeedles(colorLabel)
  const slug = toTitleSlug(colorLabel)
  if (!slug) {
    return base
  }
  const first = slug.split(/\s+/).find((w) => w.length >= 2) ?? slug
  const hint = APPAREL_COLOR_CODE_HINTS[first]
  if (!hint) {
    return base
  }
  return Array.from(new Set([...base, ...hint.map((h) => h.toLowerCase())]))
}

/**
 * `garment_images` on a variant already refers to that variant; URLs often have no
 * human-readable colour token. If strict name matching removes every URL, keep the
 * variant’s metadata URLs.
 */
export function filterGarmentImageUrlsForVariantColor(
  urls: string[],
  selectedColor: string | undefined
): string[] {
  if (!selectedColor || urls.length === 0) {
    return urls
  }
  const narrowed = urls.filter((url) => urlMatchesColorLabelStrict(url, selectedColor))
  return narrowed.length > 0 ? narrowed : urls
}

function variantIsPurchasable(variant: HttpTypes.StoreProductVariant): boolean {
  if (!variant.manage_inventory) {
    return true
  }
  if (variant.allow_backorder) {
    return true
  }
  return (variant.inventory_quantity ?? 0) > 0
}

/** True for plain "Black" or colours that start with "Black " (e.g. Black Marle). */
function isBlackGarmentColor(colorValue: string): boolean {
  const n = toTitleSlug(colorValue)
  if (!n) {
    return false
  }
  return n === "black" || n.startsWith("black ")
}

function pickDefinedStringOptions(
  map: Record<string, string | undefined>
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {}
  for (const [k, v] of Object.entries(map)) {
    if (typeof v === "string") {
      out[k] = v
    }
  }
  return out
}

/**
 * Single source of truth for PDP: which Medusa variant matches the current option selection
 * (ProductActions, ImageGallery, EmbeddedProductCustomizer).
 */
export function resolveVariantFromOptions(
  product: HttpTypes.StoreProduct,
  options: Record<string, string | undefined>
): HttpTypes.StoreProductVariant | undefined {
  const variants = product.variants ?? []
  if (!variants.length) {
    return undefined
  }

  const exact = variants.find((v) =>
    isEqual(optionsAsKeymap(v.options ?? undefined, product), options)
  )
  if (exact) {
    return exact
  }

  const selectedEntries = Object.entries(options).filter(
    (e): e is [string, string] => typeof e[1] === "string" && e[1].length > 0
  )

  if (!selectedEntries.length) {
    return variants[0]
  }

  const partial = variants.find((v) => {
    const vo = optionsAsKeymap(v.options ?? undefined, product)
    return selectedEntries.every(([title, value]) => value === vo[title])
  })
  if (partial) {
    return partial
  }

  const colorOption = product.options?.find((o) => isColorOptionTitle(o.title))
  const colorTitle = colorOption?.title
  const selectedColor =
    typeof colorTitle === "string" ? options[colorTitle] : undefined
  const sizeOption = product.options?.find(
    (o) => /size/i.test(o.title ?? "") && !isColorOptionTitle(o.title)
  )
  const sizeTitle = sizeOption?.title
  const selectedSize =
    typeof sizeTitle === "string" ? options[sizeTitle] : undefined

  let pool = variants
  if (typeof selectedColor === "string" && colorTitle) {
    const want = toTitleSlug(selectedColor)
    const colorFiltered = variants.filter((v) => {
      const val = getVariantOptionValue(v, colorTitle, product)
      return typeof val === "string" && toTitleSlug(val) === want
    })
    if (colorFiltered.length) {
      pool = colorFiltered
    }
  }

  if (typeof selectedSize === "string" && sizeTitle) {
    const wantSize = toTitleSlug(selectedSize)
    const sizeMatch = pool.find((v) => {
      const val = getVariantOptionValue(v, sizeTitle, product)
      return typeof val === "string" && toTitleSlug(val) === wantSize
    })
    if (sizeMatch) {
      return sizeMatch
    }
  }

  return pool.find(variantIsPurchasable) ?? pool[0]
}

/**
 * Initial option values for the PDP: full variant selection so the gallery can resolve one colour.
 * Prefers an in-stock Black garment when a Colour option exists; otherwise first purchasable variant.
 */
export function getDefaultProductOptions(
  product: HttpTypes.StoreProduct
): Record<string, string | undefined> {
  const variants = product.variants ?? []
  if (variants.length === 0) {
    return {}
  }

  if (variants.length === 1) {
    return pickDefinedStringOptions(
      optionsAsKeymap(variants[0].options ?? undefined, product)
    )
  }

  const colorOption = product.options?.find((o) => isColorOptionTitle(o.title))
  const colorTitle = colorOption?.title

  let chosen: HttpTypes.StoreProductVariant

  if (colorTitle) {
    const blackVariants = variants.filter((v) => {
      const c = getVariantOptionValue(v, colorTitle, product)
      return typeof c === "string" && isBlackGarmentColor(c)
    })
    chosen =
      blackVariants.find(variantIsPurchasable) ??
      blackVariants[0] ??
      variants.find(variantIsPurchasable) ??
      variants[0]
  } else {
    chosen = variants.find(variantIsPurchasable) ?? variants[0]
  }

  return pickDefinedStringOptions(optionsAsKeymap(chosen.options ?? undefined, product))
}

/** Match product option by title (slug-safe). */
export const findProductOptionByTitle = (
  product: HttpTypes.StoreProduct,
  optionTitle: string
) => {
  const want = toTitleSlug(optionTitle)
  return product.options?.find((o) => o.title && toTitleSlug(o.title) === want)
}

/**
 * Primary garment mockup URL for the selected variant — same resolution rules as the PDP
 * image gallery (variant `garment_images` metadata, then colour-matched product images).
 */
export function getPrimaryGarmentImageUrl(
  product: HttpTypes.StoreProduct | undefined,
  variant: HttpTypes.StoreProductVariant | undefined
): string | null {
  if (!product) {
    return null
  }
  if (!variant) {
    return remapStaleExternalGarmentUrl(
      product.thumbnail ?? product.images?.find((i) => i.url)?.url ?? null
    )
  }

  const validImages = (product.images ?? [])
    .filter((image) => Boolean(image.url))
    .map((image) => ({
      id: image.id,
      url: image.url as string,
    }))

  const colorOption = product.options?.find((o) => isColorOptionTitle(o.title))
  const colorTitle = colorOption?.title
  const selectedColor = colorTitle
    ? getVariantOptionValue(variant, colorTitle, product)
    : undefined

  const rawFromMetadata = getGarmentImageUrlsFromMetadata(
    (variant.metadata ?? {}) as Record<string, unknown>
  )
  const mappedVariantImages = filterGarmentImageUrlsForVariantColor(
    rawFromMetadata,
    selectedColor
  )

  if (mappedVariantImages.length) {
    const firstUrl = mappedVariantImages[0]
    const fromProduct = findProductImageByUrl(firstUrl, validImages)
    return remapStaleExternalGarmentUrl(fromProduct?.url ?? firstUrl)
  }

  if (validImages.length <= 1) {
    return remapStaleExternalGarmentUrl(validImages[0]?.url ?? product.thumbnail ?? null)
  }

  if (selectedColor) {
    const strict = validImages.filter((image) =>
      urlMatchesColorLabelStrict(image.url, selectedColor)
    )
    if (strict.length) {
      return remapStaleExternalGarmentUrl(strict[0].url)
    }
  }

  const bySku = findProductImageByVariantSku(validImages, variant)
  if (bySku) {
    return remapStaleExternalGarmentUrl(bySku.url)
  }

  if (selectedColor) {
    const relaxedNeedles = buildColorNeedlesForRelaxedMatch(selectedColor)
    const relaxed = validImages.filter((image) =>
      urlMatchesColorNeedles(image.url, relaxedNeedles)
    )
    if (relaxed.length) {
      return remapStaleExternalGarmentUrl(relaxed[0].url)
    }
  }

  return remapStaleExternalGarmentUrl(validImages[0]?.url ?? product.thumbnail ?? null)
}

const garmentUrlLooksLikeBack = (url: string) => {
  const slug = toTitleSlug(url)
  const lower = url.toLowerCase()
  return (
    /\bback\b/.test(slug) ||
    /[-/_.]back[-/_.]/i.test(lower) ||
    lower.includes("back.") ||
    lower.includes("_back") ||
    lower.includes("-back")
  )
}

const garmentUrlLooksLikeFront = (url: string) => {
  const slug = toTitleSlug(url)
  const lower = url.toLowerCase()
  return (
    /\bfront\b/.test(slug) ||
    /[-/_.]front[-/_.]/i.test(lower) ||
    lower.includes("front.") ||
    lower.includes("_front") ||
    lower.includes("-front")
  )
}

/**
 * Garment mockup URL for the customizer canvas and mockup renders, matched to print side.
 * Front/back: variant `garment_images`, colour-matched product images, then filename heuristics.
 * Sleeves: static placeholders (no per-product sleeve photography in catalog).
 */
export function getGarmentImageUrlForPrintSide(
  product: HttpTypes.StoreProduct | undefined,
  variant: HttpTypes.StoreProductVariant | undefined,
  side: PrintGarmentSide,
  defaultGarmentImage: string | null
): string | null {
  if (side === "left_sleeve") {
    return getSleevePlaceholderUrl("left_sleeve", product)
  }
  if (side === "right_sleeve") {
    return getSleevePlaceholderUrl("right_sleeve", product)
  }

  const primaryFallback = getPrimaryGarmentImageUrl(product, variant) ?? defaultGarmentImage

  if (side === "printed_tag") {
    return primaryFallback
  }

  if (!product) {
    return primaryFallback
  }

  const validImages = (product.images ?? [])
    .filter((image) => Boolean(image.url))
    .map((image) => ({
      id: image.id,
      url: image.url as string,
    }))

  const resolveToStoreUrl = (u: string | undefined | null): string | null => {
    if (!u?.trim()) {
      return null
    }
    const trimmed = u.trim()
    const fromProduct = findProductImageByUrl(trimmed, validImages)
    return fromProduct?.url ?? trimmed
  }

  const colorOption = product.options?.find((o) => isColorOptionTitle(o.title))
  const colorTitle = colorOption?.title
  const selectedColor =
    variant && colorTitle
      ? getVariantOptionValue(variant, colorTitle, product)
      : undefined

  const matchesColor = (url: string) =>
    !selectedColor || urlMatchesColorLabelStrict(url, selectedColor)

  const meta = variant ? ((variant.metadata ?? {}) as Record<string, unknown>) : {}
  const parsed = parseGarmentImagesObject(meta.garment_images)

  if (side === "front") {
    const ordered = [parsed.front, ...parsed.urls].filter(
      (u): u is string => typeof u === "string" && u.length > 0
    )
    const colorFiltered = selectedColor ? ordered.filter(matchesColor) : ordered
    const pool =
      selectedColor && colorFiltered.length === 0 ? [] : colorFiltered.length ? colorFiltered : ordered
    if (selectedColor && !pool.length) {
      return primaryFallback
    }
    const preferred =
      pool.find((u) => garmentUrlLooksLikeFront(u)) ??
      pool[0] ??
      ordered.find((u) => garmentUrlLooksLikeFront(u)) ??
      ordered[0]
    return resolveToStoreUrl(preferred) ?? primaryFallback
  }

  const backOrdered = [
    parsed.back,
    ...parsed.urls.filter(garmentUrlLooksLikeBack),
    ...parsed.urls,
  ].filter((u): u is string => typeof u === "string" && u.length > 0)

  const colorFilteredBack = selectedColor ? backOrdered.filter(matchesColor) : backOrdered
  const poolBack =
    selectedColor && colorFilteredBack.length === 0
      ? []
      : colorFilteredBack.length
        ? colorFilteredBack
        : backOrdered
  const preferredBack =
    selectedColor && !poolBack.length
      ? undefined
      : poolBack.find((u) => garmentUrlLooksLikeBack(u)) ?? poolBack[0]

  if (preferredBack) {
    const resolved = resolveToStoreUrl(preferredBack)
    if (resolved) {
      return resolved
    }
  }

  const fromProductImages = validImages.map((i) => i.url).filter(matchesColor)
  const backFromGallery =
    fromProductImages.find(garmentUrlLooksLikeBack) ??
    (validImages.length >= 2 ? validImages[1]?.url : undefined)

  if (backFromGallery && garmentUrlLooksLikeBack(backFromGallery)) {
    return backFromGallery
  }

  if (validImages.length >= 2) {
    const second = validImages[1]?.url
    if (second && matchesColor(second)) {
      return second
    }
  }

  return primaryFallback
}
