import { resolveVariantColourFromCsvRow } from "./as-colour-csv-variant-colour"
import type { ParsedCsv } from "./csv-import"

/** Payload accepted by `sdk.admin.product.batch({ update })`. */
export type SpreadsheetProductUpdate = Record<string, unknown>

/** Default batch size for non-media field updates. */
export const PRODUCT_UPDATE_BATCH_CHUNK_SIZE = 15

export const PRODUCT_UPDATE_REQUIRED_HEADERS = ["product id"] as const

/** Template CSV columns mapped to Admin product.update fields (first row per Product Id wins). */
export type ProductPatchColumnDef = {
  /** Parsed CSV header key (lowercase, after spreadsheet aliases when applicable). */
  csvKey: string
  /** Human-readable label for the checklist UI. */
  label: string
}

/** Single entry for spreadsheet column analysis UI. */
export type ProductUpdateColumnCandidate = ProductPatchColumnDef & {
  /** Distinct Product Ids whose first row would populate this patch field (non-empty by same rules as the builder). */
  affectedProductCount: number
}

/** Virtual patch column key — combines `product image 1 url` + `product image 2 url` into the `images` field. */
export const PRODUCT_GALLERY_IMAGES_CSV_KEY = "product gallery images"

/**
 * Virtual column: per CSV row, writes `variant.metadata.garment_images` (+ optional `garment_color`)
 * from Product Image 1/2 URLs and variant colour — what the storefront PDP uses for per-variant photos.
 * Does not replace product-level gallery (`product.batch`); use alongside or instead of
 * {@link PRODUCT_GALLERY_IMAGES_CSV_KEY} depending on whether you need PDP variant imagery vs shared gallery.
 */
export const VARIANT_GARMENT_METADATA_CSV_KEY = "variant garment images (PDP metadata)"

/**
 * Smaller batches when updating remote image URLs (thumbnail / gallery). Each product can trigger
 * server-side fetches and file handling; large batches often hit proxy timeouts → browser "Failed to fetch".
 */
export const PRODUCT_UPDATE_BATCH_CHUNK_SIZE_MEDIA = 5

const PRODUCT_UPDATE_MEDIA_CSV_KEYS = new Set<string>([
  PRODUCT_GALLERY_IMAGES_CSV_KEY,
  VARIANT_GARMENT_METADATA_CSV_KEY,
  "product thumbnail",
])

/** Use smaller chunks when the user selected columns that pull remote images into Medusa. */
export function productUpdateBatchChunkSize(enabledCsvKeys: ReadonlyArray<string>): number {
  for (const k of enabledCsvKeys) {
    if (PRODUCT_UPDATE_MEDIA_CSV_KEYS.has(k)) {
      return PRODUCT_UPDATE_BATCH_CHUNK_SIZE_MEDIA
    }
  }
  return PRODUCT_UPDATE_BATCH_CHUNK_SIZE
}

/** CSV columns whose data feeds the virtual gallery patch column (replaced by a single `images` field on update). */
export const PRODUCT_GALLERY_IMAGES_SOURCE_KEYS = [
  "product image 1 url",
  "product image 2 url",
] as const

export const PRODUCT_PATCH_COLUMN_DEFS: readonly ProductPatchColumnDef[] = [
  { csvKey: "product title", label: "Product title" },
  { csvKey: "product subtitle", label: "Product subtitle" },
  { csvKey: "product description", label: "Product description" },
  { csvKey: "product handle", label: "Product handle" },
  { csvKey: "product thumbnail", label: "Product thumbnail" },
  {
    csvKey: PRODUCT_GALLERY_IMAGES_CSV_KEY,
    label: "Product gallery images (Image 1 + Image 2 URLs)",
  },
  {
    csvKey: VARIANT_GARMENT_METADATA_CSV_KEY,
    label: "Variant garment images — PDP metadata (Image 1 / 2 → variant.metadata.garment_images)",
  },
  { csvKey: "product status", label: "Product status" },
  { csvKey: "product discountable", label: "Product discountable" },
  { csvKey: "product external id", label: "Product external id" },
  { csvKey: "product collection id", label: "Product collection id" },
  { csvKey: "product type id", label: "Product type id" },
  { csvKey: "shipping profile id", label: "Shipping profile id" },
  { csvKey: "product sales channel 1 id", label: "Product sales channel 1 id" },
  { csvKey: "product tag 1 id", label: "Product tag 1 id" },
  { csvKey: "product hs code", label: "Product HS code" },
  { csvKey: "product origin country", label: "Product origin country" },
  { csvKey: "product mid code", label: "Product MID code" },
  { csvKey: "product material", label: "Product material" },
  { csvKey: "product weight", label: "Product weight" },
  { csvKey: "product length", label: "Product length" },
  { csvKey: "product width", label: "Product width" },
  { csvKey: "product height", label: "Product height" },
  { csvKey: "product brand", label: "Product brand (link to Brand entity)" },
] as const

const PATCH_CSV_KEYS = new Set(PRODUCT_PATCH_COLUMN_DEFS.map((d) => d.csvKey))

const GALLERY_SOURCE_KEY_SET = new Set<string>(PRODUCT_GALLERY_IMAGES_SOURCE_KEYS)

export type ProductUpdatePreview = {
  productCount: number
  variantRowCount: number
  validationErrors: string[]
}

const TRUEISH = (raw: string): boolean => {
  const v = raw.trim().toLowerCase()
  return v === "true" || v === "1" || v === "yes"
}

type ProductUpdateStatus = "draft" | "published" | "proposed" | "rejected"

const normalizeStatus = (raw: string | undefined): ProductUpdateStatus => {
  const s = (raw ?? "").trim().toLowerCase()
  if (s === "draft" || s === "published" || s === "proposed" || s === "rejected") {
    return s
  }
  return "draft"
}

/** True iff the first row per product feeds this CSV column into product.update ( mirrors build patches ). */
function firstRowFeedsPatch(first: Record<string, string>, csvKey: string): boolean {
  switch (csvKey) {
    case "product title":
      return !!(first["product title"] ?? "").trim()
    case "product subtitle":
      return !!(first["product subtitle"] ?? "").trim()
    case "product description":
      return !!(first["product description"] ?? "").trim()
    case "product handle":
      return !!(first["product handle"] ?? "").trim()
    case "product thumbnail":
      return !!(first["product thumbnail"] ?? "").trim()
    case PRODUCT_GALLERY_IMAGES_CSV_KEY:
      return (
        !!(first["product image 1 url"] ?? "").trim() ||
        !!(first["product image 2 url"] ?? "").trim()
      )
    case "product status":
      return (first["product status"] ?? "").trim() !== ""
    case "product discountable":
      return (first["product discountable"] ?? "").trim() !== ""
    case "product external id":
      return !!(first["product external id"] ?? "").trim()
    case "product collection id":
      return !!(first["product collection id"] ?? "").trim()
    case "product type id":
      return !!(first["product type id"] ?? "").trim()
    case "shipping profile id":
      return !!(first["shipping profile id"] ?? "").trim()
    case "product sales channel 1 id":
      return !!(first["product sales channel 1 id"] ?? "").trim()
    case "product tag 1 id":
      return !!(first["product tag 1 id"] ?? "").trim()
    case "product hs code":
      return !!(first["product hs code"] ?? "").trim()
    case "product origin country":
      return !!(first["product origin country"] ?? "").trim()
    case "product mid code":
      return !!(first["product mid code"] ?? "").trim()
    case "product material":
      return !!(first["product material"] ?? "").trim()
    case "product weight": {
      const raw = (first["product weight"] ?? "").trim()
      if (raw === "") {
        return false
      }
      const n = Number(raw)
      return Number.isFinite(n)
    }
    case "product length":
    case "product width":
    case "product height": {
      const raw = (first[csvKey] ?? "").trim()
      if (raw === "") {
        return false
      }
      const n = Number(raw)
      return Number.isFinite(n)
    }
    case "product brand":
      return (
        !!((first["product brand"] ?? "") as string).trim() ||
        !!((first["product supplier"] ?? "") as string).trim()
      )
    default:
      return false
  }
}

/**
 * Rows present in CSV for unknown headers (not patched here) — for visibility only.
 */
const REQUIRED_HEADER_SET = new Set<string>(PRODUCT_UPDATE_REQUIRED_HEADERS)

export function spreadsheetHeadersIgnoringPatchable(parsed: ParsedCsv): string[] {
  const extras: string[] = []
  const seen = new Set<string>()
  for (const h of parsed.headers) {
    if (REQUIRED_HEADER_SET.has(h) || PATCH_CSV_KEYS.has(h) || GALLERY_SOURCE_KEY_SET.has(h)) {
      continue
    }
    if (!seen.has(h)) {
      seen.add(h)
      extras.push(h)
    }
  }
  return extras
}

/** Per-patchable-column counts across first row of each distinct Product Id. */
export function computeProductUpdateColumnCandidates(parsed: ParsedCsv): ProductUpdateColumnCandidate[] {
  const grouped = groupRowsByProductId(parsed.rows)
  const headerSet = new Set(parsed.headers)
  const galleryHeaderPresent = PRODUCT_GALLERY_IMAGES_SOURCE_KEYS.some((k) => headerSet.has(k))
  const defs = PRODUCT_PATCH_COLUMN_DEFS.filter((d) => {
    if (d.csvKey === PRODUCT_GALLERY_IMAGES_CSV_KEY) {
      return galleryHeaderPresent
    }
    if (d.csvKey === VARIANT_GARMENT_METADATA_CSV_KEY) {
      return galleryHeaderPresent && headerSet.has("variant sku")
    }
    return headerSet.has(d.csvKey)
  })

  const out: ProductUpdateColumnCandidate[] = []
  for (const def of defs) {
    let n = 0
    if (def.csvKey === VARIANT_GARMENT_METADATA_CSV_KEY) {
      for (const rows of grouped.values()) {
        if (rows.some(csvRowFeedsVariantGarmentMetadata)) {
          n++
        }
      }
    } else {
      for (const rows of grouped.values()) {
        const first = rows[0]!
        if (firstRowFeedsPatch(first, def.csvKey)) {
          n++
        }
      }
    }
    if (n > 0) {
      out.push({ ...def, affectedProductCount: n })
    }
  }
  return out
}

export function validateProductUpdateHeaders(parsed: ParsedCsv): string | null {
  const headers = new Set(parsed.headers)
  for (const h of PRODUCT_UPDATE_REQUIRED_HEADERS) {
    if (!headers.has(h)) {
      return `Missing required column "${h}". Use an export from Medusa (import template) so each row includes Product Id.`
    }
  }
  return null
}

export function computeProductUpdatePreview(parsed: ParsedCsv): ProductUpdatePreview {
  const validationErrors: string[] = []
  const headerErr = validateProductUpdateHeaders(parsed)
  if (headerErr) {
    validationErrors.push(headerErr)
    return {
      productCount: 0,
      variantRowCount: parsed.rows.length,
      validationErrors,
    }
  }

  const ids = new Set<string>()
  parsed.rows.forEach((row, idx) => {
    const rowLabel = `Row ${idx + 2}`
    const pid = (row["product id"] ?? "").trim()
    if (!pid) {
      validationErrors.push(`${rowLabel}: missing Product Id`)
      return
    }
    ids.add(pid)
  })

  return {
    productCount: ids.size,
    variantRowCount: parsed.rows.length,
    validationErrors,
  }
}

/** True when the file has rows that could populate PDP garment metadata (SKU + ≥1 image URL). */
export function parsedCsvHasVariantGarmentSourceRows(parsed: ParsedCsv): boolean {
  return parsed.rows.some(csvRowFeedsVariantGarmentMetadata)
}

/** True when this row contributes to variant-level garment metadata (SKU + at least one image URL). */
export function csvRowFeedsVariantGarmentMetadata(row: Record<string, string>): boolean {
  const sku = (row["variant sku"] ?? "").trim()
  if (!sku) {
    return false
  }
  const u1 = (row["product image 1 url"] ?? "").trim()
  const u2 = (row["product image 2 url"] ?? "").trim()
  return !!(u1 || u2)
}

function productGroupHasVariantGarmentMetadata(rows: Record<string, string>[]): boolean {
  return rows.some(csvRowFeedsVariantGarmentMetadata)
}

const groupRowsByProductId = (rows: Record<string, string>[]): Map<string, Record<string, string>[]> => {
  const map = new Map<string, Record<string, string>[]>()
  for (const row of rows) {
    const id = (row["product id"] ?? "").trim()
    if (!id) {
      continue
    }
    const list = map.get(id)
    if (list) {
      list.push(row)
    } else {
      map.set(id, [row])
    }
  }
  return map
}

export type BuildBatchUpdateOptions = {
  /**
   * When set (including empty), only these CSV patch columns contribute to each product patch.
   * Omit to include every patch column that has a value on the first row per product (legacy behaviour).
   */
  enabledCsvKeys?: ReadonlySet<string>
}

/**
 * Side-channel outputs from the per-product patch pass for fields that don't go into the
 * Medusa `product.batch({ update })` payload directly. Brand belongs here because it lives in
 * the separate Brand module and is attached via a Module Link, not a product column.
 */
export type ProductPatchSideEffects = {
  brandValueByProductId: Map<string, string>
}

function applyProductPatchColumns(
  first: Record<string, string>,
  patch: SpreadsheetProductUpdate,
  enabledCsvKeys: ReadonlySet<string> | undefined,
  sideEffects?: ProductPatchSideEffects
): void {
  const allow = (k: string): boolean =>
    enabledCsvKeys === undefined ? PATCH_CSV_KEYS.has(k) : enabledCsvKeys.has(k)

  if (allow("product title")) {
    const title = (first["product title"] ?? "").trim()
    if (title) {
      patch.title = title
    }
  }

  if (allow("product subtitle")) {
    const subtitle = (first["product subtitle"] ?? "").trim()
    if (subtitle) {
      patch.subtitle = subtitle
    }
  }

  if (allow("product description")) {
    const description = (first["product description"] ?? "").trim()
    if (description) {
      patch.description = description
    }
  }

  if (allow("product handle")) {
    const handle = (first["product handle"] ?? "").trim()
    if (handle) {
      patch.handle = handle
    }
  }

  if (allow("product thumbnail")) {
    const thumbnail = (first["product thumbnail"] ?? "").trim()
    if (thumbnail) {
      patch.thumbnail = thumbnail
    }
  }

  if (allow(PRODUCT_GALLERY_IMAGES_CSV_KEY)) {
    const u1 = (first["product image 1 url"] ?? "").trim()
    const u2 = (first["product image 2 url"] ?? "").trim()
    const images = [u1, u2].filter(Boolean).map((url) => ({ url }))
    if (images.length) {
      patch.images = images
    }
  }

  if (allow("product status")) {
    const statusRaw = (first["product status"] ?? "").trim()
    if (statusRaw !== "") {
      patch.status = normalizeStatus(statusRaw)
    }
  }

  if (allow("product discountable")) {
    const discountRaw = (first["product discountable"] ?? "").trim()
    if (discountRaw !== "") {
      patch.discountable = TRUEISH(discountRaw)
    }
  }

  if (allow("product external id")) {
    const externalId = (first["product external id"] ?? "").trim()
    if (externalId) {
      patch.external_id = externalId
    }
  }

  if (allow("product collection id")) {
    const collectionId = (first["product collection id"] ?? "").trim()
    if (collectionId) {
      patch.collection_id = collectionId
    }
  }

  if (allow("product type id")) {
    const typeId = (first["product type id"] ?? "").trim()
    if (typeId) {
      patch.type_id = typeId
    }
  }

  if (allow("shipping profile id")) {
    const shippingProfileId = (first["shipping profile id"] ?? "").trim()
    if (shippingProfileId) {
      patch.shipping_profile_id = shippingProfileId
    }
  }

  if (allow("product sales channel 1 id")) {
    const salesChannelId = (first["product sales channel 1 id"] ?? "").trim()
    if (salesChannelId) {
      patch.sales_channels = [{ id: salesChannelId }]
    }
  }

  if (allow("product tag 1 id")) {
    const tagId = (first["product tag 1 id"] ?? "").trim()
    if (tagId) {
      patch.tags = [{ id: tagId }]
    }
  }

  if (allow("product hs code")) {
    const hs = (first["product hs code"] ?? "").trim()
    if (hs) {
      patch.hs_code = hs
    }
  }

  if (allow("product origin country")) {
    const origin = (first["product origin country"] ?? "").trim()
    if (origin) {
      patch.origin_country = origin
    }
  }

  if (allow("product mid code")) {
    const mid = (first["product mid code"] ?? "").trim()
    if (mid) {
      patch.mid_code = mid
    }
  }

  if (allow("product material")) {
    const material = (first["product material"] ?? "").trim()
    if (material) {
      patch.material = material
    }
  }

  if (allow("product weight")) {
    const weightRaw = (first["product weight"] ?? "").trim()
    if (weightRaw !== "") {
      const n = Number(weightRaw)
      if (Number.isFinite(n)) {
        patch.weight = n
      }
    }
  }

  if (allow("product length")) {
    const n = parseDimensionPatchCell(first["product length"])
    if (n !== undefined) {
      patch.length = n
    }
  }

  if (allow("product width")) {
    const n = parseDimensionPatchCell(first["product width"])
    if (n !== undefined) {
      patch.width = n
    }
  }

  if (allow("product height")) {
    const n = parseDimensionPatchCell(first["product height"])
    if (n !== undefined) {
      patch.height = n
    }
  }

  /**
   * Brand patching emits a side-channel value rather than touching `patch.metadata`. The caller
   * (the spreadsheet-sync-update page) resolves these values to Brand IDs via
   * `spreadsheet-sync-brands.ts` and applies them through the product↔brand Module Link after
   * the regular `sdk.admin.product.batch({ update })` call returns.
   */
  if (allow("product brand")) {
    const brandRaw =
      ((first["product brand"] ?? "") as string).trim() ||
      ((first["product supplier"] ?? "") as string).trim()
    if (brandRaw && sideEffects) {
      sideEffects.brandValueByProductId.set(String(patch.id ?? ""), brandRaw)
    }
  }
}

function parseDimensionPatchCell(raw: string | undefined): number | undefined {
  const v = (raw ?? "").trim()
  if (v === "") {
    return undefined
  }
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

/**
 * Build partial product updates from template CSV rows (first row per Product Id wins for product-level fields).
 */
export function buildBatchUpdatesFromParsedCsv(
  parsed: ParsedCsv,
  options?: BuildBatchUpdateOptions
): {
  updates: SpreadsheetProductUpdate[]
  errors: string[]
  /** Brand cell value per Product Id — resolved & linked by the caller (see spreadsheet-sync-brands). */
  brandValueByProductId: Map<string, string>
} {
  const errors: string[] = []
  const sideEffects: ProductPatchSideEffects = {
    brandValueByProductId: new Map(),
  }
  const { enabledCsvKeys } = options ?? {}

  if (enabledCsvKeys !== undefined && enabledCsvKeys.size === 0) {
    errors.push("Select at least one column to update.")
    return { updates: [], errors, brandValueByProductId: sideEffects.brandValueByProductId }
  }

  const headerErr = validateProductUpdateHeaders(parsed)
  if (headerErr) {
    errors.push(headerErr)
    return { updates: [], errors, brandValueByProductId: sideEffects.brandValueByProductId }
  }

  const preview = computeProductUpdatePreview(parsed)
  preview.validationErrors.forEach((e) => errors.push(e))
  if (preview.validationErrors.length > 0) {
    return { updates: [], errors, brandValueByProductId: sideEffects.brandValueByProductId }
  }

  const grouped = groupRowsByProductId(parsed.rows)
  const updates: SpreadsheetProductUpdate[] = []

  for (const [productId, rows] of grouped) {
    const first = rows[0]!

    const patch: SpreadsheetProductUpdate = {
      id: productId,
    }

    const variantGarmentSelected = enabledCsvKeys?.has(VARIANT_GARMENT_METADATA_CSV_KEY) ?? false
    const productOnlyKeys =
      enabledCsvKeys === undefined
        ? undefined
        : new Set([...enabledCsvKeys].filter((k) => k !== VARIANT_GARMENT_METADATA_CSV_KEY))

    applyProductPatchColumns(first, patch, productOnlyKeys, sideEffects)

    /** Only `id` means nothing to change — but if brand was emitted as a side-effect that's still useful, keep the productId tracked. */
    const keysToSend = Object.keys(patch).filter((k) => k !== "id")
    const hasBrandSideEffect = sideEffects.brandValueByProductId.has(productId)
    if (keysToSend.length === 0 && !hasBrandSideEffect) {
      if (variantGarmentSelected && productGroupHasVariantGarmentMetadata(rows)) {
        continue
      }
      if (variantGarmentSelected && !productGroupHasVariantGarmentMetadata(rows)) {
        /* Variant-only selection: products without image rows are skipped; global validation uses buildVariantGarmentDataByProductId. */
        continue
      }
      errors.push(
        `Product "${productId}": no non-empty columns to update among your selection ` +
          `(first row only for product fields; widen selection or fill cells for those columns).`
      )
      continue
    }

    if (keysToSend.length > 0) {
      updates.push(patch)
    }
  }

  return { updates, errors, brandValueByProductId: sideEffects.brandValueByProductId }
}

export type VariantGarmentCsvRow = {
  sku: string
  front?: string
  back?: string
  color?: string
}

/**
 * Match Medusa variant rows to a CSV SKU — exact trim match first, then case-insensitive (supplier exports vary).
 */
export function findVariantRowForCsvSku<T extends { sku?: string | null }>(
  variants: T[],
  csvSku: string
): T | undefined {
  const want = csvSku.trim()
  if (!want) {
    return undefined
  }
  const exact = variants.find((v) => (v.sku ?? "").trim() === want)
  if (exact) {
    return exact
  }
  const wl = want.toLowerCase()
  return variants.find((v) => (v.sku ?? "").trim().toLowerCase() === wl)
}

/**
 * Collect per-variant garment image payload from **every** CSV row (last row per SKU wins within a product).
 * Used with {@link VARIANT_GARMENT_METADATA_CSV_KEY}; mirrors `apply-garment-images-from-template-csv.ts`.
 */
export function buildVariantGarmentDataByProductId(
  parsed: ParsedCsv,
  enabledCsvKeys: ReadonlySet<string> | undefined
): { byProduct: Map<string, Map<string, VariantGarmentCsvRow>>; errors: string[] } {
  const errors: string[] = []

  if (!enabledCsvKeys?.has(VARIANT_GARMENT_METADATA_CSV_KEY)) {
    return { byProduct: new Map(), errors }
  }

  const headerErr = validateProductUpdateHeaders(parsed)
  if (headerErr) {
    errors.push(headerErr)
    return { byProduct: new Map(), errors }
  }

  if (!parsed.headers.includes("variant sku")) {
    errors.push(
      `Missing "variant sku" column — required when updating variant garment metadata from the spreadsheet.`
    )
    return { byProduct: new Map(), errors }
  }

  const preview = computeProductUpdatePreview(parsed)
  preview.validationErrors.forEach((e) => errors.push(e))
  if (preview.validationErrors.length > 0) {
    return { byProduct: new Map(), errors }
  }

  const byProduct = new Map<string, Map<string, VariantGarmentCsvRow>>()

  parsed.rows.forEach((row, idx) => {
    const rowLabel = `Row ${idx + 2}`
    const pid = (row["product id"] ?? "").trim()
    if (!pid) {
      return
    }
    const sku = (row["variant sku"] ?? "").trim()
    const img1 = (row["product image 1 url"] ?? "").trim()
    const img2 = (row["product image 2 url"] ?? "").trim()

    if (!sku) {
      if (img1 || img2) {
        errors.push(`${rowLabel}: image URL(s) set but Variant SKU is empty — row skipped.`)
      }
      return
    }
    if (!img1 && !img2) {
      return
    }

    const color = resolveVariantColourFromCsvRow(row)
    let perSku = byProduct.get(pid)
    if (!perSku) {
      perSku = new Map()
      byProduct.set(pid, perSku)
    }
    perSku.set(sku, {
      sku,
      front: img1 || undefined,
      back: img2 || undefined,
      color,
    })
  })

  if (byProduct.size === 0) {
    errors.push(
      "Variant garment images: no applicable rows (each row needs Variant SKU and at least one of Product Image 1 Url / Product Image 2 Url)."
    )
  }

  return { byProduct, errors }
}
