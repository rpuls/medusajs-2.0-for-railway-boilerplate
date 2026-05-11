/**
 * CSV rows matching Medusa Admin product-import template columns plus supplemental id/name columns.
 * Template columns mirror the official import CSV (one row per variant).
 */

/** Exact headers from Medusa product-import template (42 columns). */
export const PRODUCT_IMPORT_TEMPLATE_COLUMNS = [
  "Product Id",
  "Product Handle",
  "Product Title",
  "Product Subtitle",
  "Product Description",
  "Product Status",
  "Product Thumbnail",
  "Product Weight",
  "Product Length",
  "Product Width",
  "Product Height",
  "Product HS Code",
  "Product Origin Country",
  "Product MID Code",
  "Product Material",
  "Shipping Profile Id",
  "Product Sales Channel 1",
  "Product Collection Id",
  "Product Type Id",
  "Product Tag 1",
  "Product Discountable",
  "Product External Id",
  "Variant Id",
  "Variant Title",
  "Variant SKU",
  "Variant Barcode",
  "Variant Allow Backorder",
  "Variant Manage Inventory",
  "Variant Weight",
  "Variant Length",
  "Variant Width",
  "Variant Height",
  "Variant HS Code",
  "Variant Origin Country",
  "Variant MID Code",
  "Variant Material",
  "Variant Price EUR",
  "Variant Price USD",
  "Variant Option 1 Name",
  "Variant Option 1 Value",
  "Product Image 1 Url",
  "Product Image 2 Url",
] as const

/** Maximum number of `Product Tag N` columns the template emits and the importer reads. */
export const PRODUCT_TAG_COLUMN_COUNT = 10
/** Maximum number of `Product Category N Path` columns the template emits and the importer reads. */
export const PRODUCT_CATEGORY_PATH_COLUMN_COUNT = 5
/** Maximum number of `Product Image N Url` columns the template emits and the importer reads. */
export const PRODUCT_IMAGE_URL_COLUMN_COUNT = 5

const PRODUCT_TAG_EXTRA_COLUMNS = Array.from(
  { length: PRODUCT_TAG_COLUMN_COUNT - 1 },
  (_, i) => `Product Tag ${i + 2}`
)
const PRODUCT_CATEGORY_PATH_COLUMNS = Array.from(
  { length: PRODUCT_CATEGORY_PATH_COLUMN_COUNT },
  (_, i) => `Product Category ${i + 1} Path`
)
const PRODUCT_IMAGE_URL_EXTRA_COLUMNS = Array.from(
  { length: PRODUCT_IMAGE_URL_COLUMN_COUNT - 2 },
  (_, i) => `Product Image ${i + 3} Url`
)

/** Appended after the template for id + human-readable pairs (ignored by strict import parsers). */
export const PRODUCT_IMPORT_SUPPLEMENTAL_COLUMNS = [
  "Product Collection Title",
  "Product Type Value",
  "Product Sales Channel 1 Id",
  "Product Tag 1 Id",
  "Variant Price AUD",
  "BASE_SALE_PRICE",
  "TIER_10_TO_19_PRICE",
  "TIER_20_TO_49_PRICE",
  "TIER_50_TO_99_PRICE",
  "TIER_100_PLUS_PRICE",
  "TIER_10_TO_49_PRICE",
  "Variant Bulk Pricing JSON",
  /** Catalog angled views (stored on product `metadata`; lazy-loaded on PDP). */
  "Image Standard Url",
  "Image Front Url",
  "Image Back Url",
  "Image Side Url",
  /** Variant Option 2 (recognized by the importer). */
  "Variant Option 2 Name",
  "Variant Option 2 Value",
  /** Multi-tag, multi-category, extra metadata, extra gallery images. */
  ...PRODUCT_TAG_EXTRA_COLUMNS,
  ...PRODUCT_CATEGORY_PATH_COLUMNS,
  "Product Metadata JSON",
  ...PRODUCT_IMAGE_URL_EXTRA_COLUMNS,
  /**
   * Brand identity (e.g. "DNC Workwear", "Biz Collection", or an external code like "DNC").
   * Resolved to a Brand row via the spreadsheet importer and attached to the product through
   * the product↔brand Module Link. The metadata key below is the legacy fallback for the
   * one-shot migration; new imports should rely on the link.
   */
  "Product Brand",
] as const

/**
 * Legacy metadata key from before the Brand module existed. Retained only so the
 * `migrate-products-to-brand-entity` script can pick up the value during the one-shot
 * migration. New imports write to the link, not to metadata.
 */
export const PRODUCT_BRAND_LEGACY_METADATA_KEYS = ["brand", "supplier", "manufacturer", "label"] as const

export const PRODUCT_IMPORT_CSV_HEADERS: string[] = [
  ...PRODUCT_IMPORT_TEMPLATE_COLUMNS,
  ...PRODUCT_IMPORT_SUPPLEMENTAL_COLUMNS,
]

/** Fields passed to `sdk.admin.product.list` / compatible list endpoints. */
export const PRODUCT_IMPORT_EXPORT_LIST_FIELDS =
  [
    "id",
    "title",
    "subtitle",
    "status",
    "external_id",
    "description",
    "handle",
    "discountable",
    "thumbnail",
    "collection_id",
    "type_id",
    "weight",
    "length",
    "width",
    "height",
    "hs_code",
    "origin_country",
    "mid_code",
    "material",
    "shipping_profile_id",
    "*type",
    "*collection",
    "*tags",
    "*images",
    "*sales_channels",
    "*variants",
    "*variants.prices",
    "*variants.metadata",
    "*variants.options",
    "*options",
    "*options.values",
    "*brand",
  ].join(",")

const TRUE_FALSE = (value: unknown): string => {
  if (value === true || value === "true" || value === "TRUE") {
    return "TRUE"
  }
  if (value === false || value === "false" || value === "FALSE") {
    return "FALSE"
  }
  return ""
}

const formatCell = (value: unknown): string => {
  if (value === null || value === undefined) {
    return ""
  }
  return String(value)
}

/**
 * Medusa stores price amounts in smallest currency units (e.g. cents). Import templates use major units.
 */
const minorToMajorCsv = (amount: unknown): string => {
  if (amount === null || amount === undefined || amount === "") {
    return ""
  }
  const n =
    typeof amount === "bigint"
      ? Number(amount)
      : typeof amount === "string"
        ? Number(amount)
        : typeof amount === "number"
          ? amount
          : Number.NaN
  if (!Number.isFinite(n)) {
    return ""
  }
  const major = n / 100
  return String(major)
}

const priceMajorForCurrency = (prices: unknown, currency: string): string => {
  if (!Array.isArray(prices)) {
    return ""
  }
  const want = currency.trim().toLowerCase()
  type PriceRow = Record<string, unknown>
  const matches = prices.filter((p) => {
    const row = p as PriceRow
    return String(row.currency_code ?? "")
      .trim()
      .toLowerCase() === want
  }) as PriceRow[]
  if (matches.length === 0) {
    return ""
  }
  if (matches.length === 1) {
    return minorToMajorCsv(matches[0].amount)
  }
  const sorted = [...matches].sort((a, b) => priceRowMinQ(a) - priceRowMinQ(b))
  return minorToMajorCsv(sorted[0].amount)
}

const priceRowMinQ = (row: Record<string, unknown>): number => {
  const v = row.min_quantity
  if (v === undefined || v === null || v === "") {
    return 1
  }
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? n : 1
}

const priceRowMaxQ = (row: Record<string, unknown>): number | undefined => {
  const v = row.max_quantity
  if (v === undefined || v === null || v === "") {
    return undefined
  }
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? n : undefined
}

type TierBandKey = "base" | "tier10" | "tier20" | "tier50" | "tier100"

type ClassifiedTierBand = TierBandKey | "tier10_legacy"

/** Ramo/Syzmik-style quantity bands stored in bulk_pricing and pricing-module rows. */
const classifyBand = (minQ: number, maxQ: number | undefined): ClassifiedTierBand | null => {
  if (minQ === 1 && maxQ === 9) {
    return "base"
  }
  if (minQ === 10 && maxQ === 19) {
    return "tier10"
  }
  if (minQ === 20 && maxQ === 49) {
    return "tier20"
  }
  /** Legacy single row covering old 10–49 band — duplicate into 10–19 and 20–49 columns on export. */
  if (minQ === 10 && maxQ === 49) {
    return "tier10_legacy"
  }
  if (minQ === 50 && maxQ === 99) {
    return "tier50"
  }
  if (minQ >= 100) {
    return "tier100"
  }
  return null
}

/** When classification fails, infer tiers by sort order (4 legacy rows or 5 new rows). */
const assignTierPositionalFallback = (
  sorted: Array<Record<string, unknown>>
): Record<TierBandKey, string> | null => {
  if (sorted.length === 5) {
    return {
      base: minorToMajorCsv(sorted[0]?.amount),
      tier10: minorToMajorCsv(sorted[1]?.amount),
      tier20: minorToMajorCsv(sorted[2]?.amount),
      tier50: minorToMajorCsv(sorted[3]?.amount),
      tier100: minorToMajorCsv(sorted[4]?.amount),
    }
  }
  if (sorted.length === 4) {
    const t10 = minorToMajorCsv(sorted[1]?.amount)
    return {
      base: minorToMajorCsv(sorted[0]?.amount),
      tier10: t10,
      tier20: t10,
      tier50: minorToMajorCsv(sorted[2]?.amount),
      tier100: minorToMajorCsv(sorted[3]?.amount),
    }
  }
  return null
}

const mergeBandCells = (byBand: Record<TierBandKey, string>): boolean =>
  !!(byBand.base || byBand.tier10 || byBand.tier20 || byBand.tier50 || byBand.tier100)

const fillBandsFromTierRows = (
  sorted: Array<Record<string, unknown>>
): Record<TierBandKey, string> | null => {
  const byBand: Record<TierBandKey, string> = {
    base: "",
    tier10: "",
    tier20: "",
    tier50: "",
    tier100: "",
  }
  for (const t of sorted) {
    const minQ = priceRowMinQ(t)
    const maxQ = priceRowMaxQ(t)
    const maj = minorToMajorCsv((t as Record<string, unknown>).amount)
    const band = classifyBand(minQ, maxQ)
    if (band === "tier10_legacy") {
      byBand.tier10 = maj
      byBand.tier20 = maj
    } else if (band) {
      byBand[band] = maj
    }
  }
  if (mergeBandCells(byBand)) {
    return byBand
  }
  return assignTierPositionalFallback(sorted)
}

const stringifyBulkPricingJson = (metadata: unknown): string => {
  const meta = metadata as Record<string, unknown> | null | undefined
  const bp = meta?.bulk_pricing
  if (bp === undefined || bp === null) {
    return ""
  }
  try {
    return JSON.stringify(bp)
  } catch {
    return ""
  }
}

/** Prefer metadata.bulk_pricing tiers (canonical for storefront/graph). */
const extractTierBandsFromBulkPricing = (metadata: unknown): Record<TierBandKey, string> | null => {
  const meta = metadata as Record<string, unknown> | undefined
  const bp = meta?.bulk_pricing as { tiers?: Array<Record<string, unknown>> } | undefined
  if (!Array.isArray(bp?.tiers) || bp.tiers.length === 0) {
    return null
  }
  const sorted = [...bp.tiers].sort((a, b) => {
    const ma = Number((a as Record<string, unknown>).min_quantity ?? 0)
    const mb = Number((b as Record<string, unknown>).min_quantity ?? 0)
    return ma - mb
  })
  return fillBandsFromTierRows(sorted)
}

/** Fallback: parse AUD rows on variant.prices (pricing module). */
const extractTierBandsFromAudPrices = (prices: unknown): Record<TierBandKey, string> | null => {
  if (!Array.isArray(prices)) {
    return null
  }
  const aud = prices.filter(
    (p) =>
      String((p as Record<string, unknown>).currency_code ?? "")
        .trim()
        .toLowerCase() === "aud"
  ) as Array<Record<string, unknown>>
  if (aud.length === 0) {
    return null
  }
  const sorted = [...aud].sort((a, b) => priceRowMinQ(a) - priceRowMinQ(b))
  return fillBandsFromTierRows(sorted)
}

/**
 * Single AUD price with no quantity ladder (one row, default qty) — repeat for all bands + 100+ column per runbook.
 */
const extractFlatSingularAudMajor = (prices: unknown): string | null => {
  if (!Array.isArray(prices)) {
    return null
  }
  const aud = prices.filter(
    (p) =>
      String((p as Record<string, unknown>).currency_code ?? "")
        .trim()
        .toLowerCase() === "aud"
  ) as Array<Record<string, unknown>>
  if (aud.length !== 1) {
    return null
  }
  const row = aud[0]
  const minQ = priceRowMinQ(row)
  const maxQ = priceRowMaxQ(row)
  if (maxQ !== undefined) {
    return null
  }
  if (minQ > 1) {
    return null
  }
  const maj = minorToMajorCsv(row.amount)
  return maj || null
}

const audTierCellsForVariant = (variant: Record<string, unknown>): {
  variantPriceAud: string
  base: string
  tier10: string
  tier20: string
  tier50: string
  tier100: string
  bulkPricingJson: string
} => {
  const bulkPricingJson = stringifyBulkPricingJson(variant.metadata)
  const fromBp = extractTierBandsFromBulkPricing(variant.metadata)
  if (fromBp && mergeBandCells(fromBp)) {
    const t100 = fromBp.tier100
    return {
      variantPriceAud: t100,
      base: fromBp.base,
      tier10: fromBp.tier10,
      tier20: fromBp.tier20,
      tier50: fromBp.tier50,
      tier100: t100,
      bulkPricingJson,
    }
  }

  const fromPrices = extractTierBandsFromAudPrices(variant.prices)
  if (fromPrices && mergeBandCells(fromPrices)) {
    const t100 = fromPrices.tier100
    return {
      variantPriceAud: t100,
      base: fromPrices.base,
      tier10: fromPrices.tier10,
      tier20: fromPrices.tier20,
      tier50: fromPrices.tier50,
      tier100: t100,
      bulkPricingJson,
    }
  }

  const flat = extractFlatSingularAudMajor(variant.prices)
  if (flat) {
    return {
      variantPriceAud: flat,
      base: flat,
      tier10: flat,
      tier20: flat,
      tier50: flat,
      tier100: flat,
      bulkPricingJson,
    }
  }

  return {
    variantPriceAud: "",
    base: "",
    tier10: "",
    tier20: "",
    tier50: "",
    tier100: "",
    bulkPricingJson,
  }
}

const sortImagesByRank = (images: unknown): Array<Record<string, unknown>> => {
  if (!Array.isArray(images)) {
    return []
  }
  const rows = images.filter((i) => i && typeof i === "object") as Array<Record<string, unknown>>
  return [...rows].sort((a, b) => {
    const ra = typeof a.rank === "number" ? a.rank : Number(a.rank ?? 0) || 0
    const rb = typeof b.rank === "number" ? b.rank : Number(b.rank ?? 0) || 0
    return ra - rb
  })
}

const imageUrls = (product: Record<string, unknown>): [string, string] => {
  const sorted = sortImagesByRank(product.images)
  const u0 = sorted[0]?.url != null ? String(sorted[0].url) : ""
  const u1 = sorted[1]?.url != null ? String(sorted[1].url) : ""
  return [u0, u1]
}

const firstSalesChannel = (
  product: Record<string, unknown>
): Record<string, unknown> | undefined => {
  const ch = product.sales_channels
  if (!Array.isArray(ch) || ch.length === 0) {
    return undefined
  }
  const first = ch[0]
  return first && typeof first === "object" ? (first as Record<string, unknown>) : undefined
}

const firstTag = (product: Record<string, unknown>): Record<string, unknown> | undefined => {
  const tags = product.tags
  if (!Array.isArray(tags) || tags.length === 0) {
    return undefined
  }
  const first = tags[0]
  return first && typeof first === "object" ? (first as Record<string, unknown>) : undefined
}

/** Best-effort: first variant option → option title + selected value (Medusa Admin shapes vary slightly). */
const firstVariantOptionPair = (
  product: Record<string, unknown>,
  variant: Record<string, unknown>
): { name: string; value: string } => {
  const opts = variant.options
  if (!Array.isArray(opts) || opts.length === 0) {
    return { name: "", value: "" }
  }
  const o = opts[0] as Record<string, unknown>
  const linked = (o.option ?? o.product_option) as Record<string, unknown> | undefined
  let name =
    (linked?.title != null ? String(linked.title) : "") ||
    (o.option_title != null ? String(o.option_title) : "") ||
    ""

  const optionId =
    (linked?.id as string | undefined) ??
    (o.option_id as string | undefined) ??
    (o.product_option_id as string | undefined)

  if (!name && optionId && Array.isArray(product.options)) {
    const po = (product.options as Record<string, unknown>[]).find((p) => p?.id === optionId)
    if (po?.title != null) {
      name = String(po.title)
    }
  }

  if (!name && Array.isArray(product.options) && product.options.length > 0) {
    const po = product.options[0] as Record<string, unknown>
    if (po?.title != null) {
      name = String(po.title)
    }
  }

  const ov = (o.option_value ?? o.optionValue) as Record<string, unknown> | undefined
  const value =
    (o.value != null ? String(o.value) : "") ||
    (ov?.value != null ? String(ov.value) : "") ||
    ""
  return { name, value }
}

/**
 * Build CSV body rows (without header) for products returned from Admin list/retrieve.
 * Skips products with no variants.
 */
export function buildProductImportTemplateRows(products: unknown[]): string[][] {
  const rows: string[][] = []

  for (const raw of products) {
    if (!raw || typeof raw !== "object") {
      continue
    }
    const product = raw as Record<string, unknown>
    const variants = product.variants
    if (!Array.isArray(variants) || variants.length === 0) {
      continue
    }

    const collection = product.collection as Record<string, unknown> | undefined
    const type = product.type as Record<string, unknown> | undefined
    const channel = firstSalesChannel(product)
    const tag = firstTag(product)
    const [img1, img2] = imageUrls(product)

    const collectionId = formatCell(collection?.id ?? product.collection_id ?? "")
    const collectionTitle = formatCell(collection?.title ?? "")
    const typeId = formatCell(type?.id ?? product.type_id ?? "")
    const typeValue = formatCell(type?.value ?? "")
    const channelName = formatCell(channel?.name ?? "")
    const channelId = formatCell(channel?.id ?? "")
    const tagValue = formatCell(tag?.value ?? "")
    const tagId = formatCell(tag?.id ?? "")

    for (const vr of variants) {
      if (!vr || typeof vr !== "object") {
        continue
      }
      const variant = vr as Record<string, unknown>
      const prices = variant.prices
      const audTiers = audTierCellsForVariant(variant)

      const opt = firstVariantOptionPair(product, variant)

      rows.push([
        formatCell(product.id),
        formatCell(product.handle),
        formatCell(product.title),
        formatCell(product.subtitle),
        formatCell(product.description),
        formatCell(product.status),
        formatCell(product.thumbnail),
        formatCell(product.weight),
        formatCell(product.length),
        formatCell(product.width),
        formatCell(product.height),
        formatCell(product.hs_code),
        formatCell(product.origin_country),
        formatCell(product.mid_code),
        formatCell(product.material),
        formatCell(product.shipping_profile_id),
        channelName,
        collectionId,
        typeId,
        tagValue,
        TRUE_FALSE(product.discountable),
        formatCell(product.external_id),
        formatCell(variant.id),
        formatCell(variant.title),
        formatCell(variant.sku),
        formatCell(variant.barcode),
        TRUE_FALSE(variant.allow_backorder),
        TRUE_FALSE(variant.manage_inventory),
        formatCell(variant.weight),
        formatCell(variant.length),
        formatCell(variant.width),
        formatCell(variant.height),
        formatCell(variant.hs_code),
        formatCell(variant.origin_country),
        formatCell(variant.mid_code),
        formatCell(variant.material),
        priceMajorForCurrency(prices, "eur"),
        priceMajorForCurrency(prices, "usd"),
        opt.name,
        opt.value,
        img1,
        img2,
        collectionTitle,
        typeValue,
        channelId,
        tagId,
        audTiers.variantPriceAud,
        audTiers.base,
        audTiers.tier10,
        audTiers.tier20,
        audTiers.tier50,
        audTiers.tier100,
        audTiers.tier10,
        audTiers.bulkPricingJson,
        formatCell((product.metadata as Record<string, unknown> | undefined)?.image_standard_url ?? ""),
        formatCell((product.metadata as Record<string, unknown> | undefined)?.image_front_url ?? ""),
        formatCell((product.metadata as Record<string, unknown> | undefined)?.image_back_url ?? ""),
        formatCell((product.metadata as Record<string, unknown> | undefined)?.image_side_url ?? ""),
        /** Variant Option 2 Name/Value — emitted by import flow but not yet populated on round-trip export. */
        "",
        "",
        /** Product Tag 2..10 — placeholder; export round-trip for multi-tag is a future enhancement. */
        ...Array.from({ length: PRODUCT_TAG_COLUMN_COUNT - 1 }, () => ""),
        /** Product Category 1..N Path — placeholder; export from existing categories is a future enhancement. */
        ...Array.from({ length: PRODUCT_CATEGORY_PATH_COLUMN_COUNT }, () => ""),
        /** Product Metadata JSON — placeholder; export round-trip is a future enhancement. */
        "",
        /** Product Image 3..N Url — placeholder; existing 1/2 already covered above. */
        ...Array.from({ length: PRODUCT_IMAGE_URL_COLUMN_COUNT - 2 }, () => ""),
        formatCell(
          (() => {
            const brand = (product as Record<string, unknown>).brand as
              | { name?: unknown }
              | Array<{ name?: unknown }>
              | undefined
            const direct = Array.isArray(brand) ? brand[0] : brand
            if (direct?.name) return String(direct.name)
            const meta = product.metadata as Record<string, unknown> | undefined
            for (const k of PRODUCT_BRAND_LEGACY_METADATA_KEYS) {
              const v = meta?.[k]
              if (typeof v === "string" && v.trim()) return v
            }
            return ""
          })()
        ),
      ])
    }
  }

  return rows
}
