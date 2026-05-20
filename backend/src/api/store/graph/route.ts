import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { isStorefrontOriginAllowed } from "../../../lib/storefront-origins"

/**
 * GET /store/graph
 *
 * Builds the Nodes/Links JSON for the storefront product discovery graph.
 * Uses `query.graph` so a single request fetches product + brand (metadata) +
 * category + collection relationships with no waterfalls.
 *
 * Modes:
 *   - `summary` (default): root + distinct brand nodes + top-level categories
 *     + product types + product tags. No product nodes. Used for initial paint.
 *   - `brand`:    products for one brand + links to brand + their categories/types/tags.
 *   - `category`: products in one category + links.
 *   - `type`:     products for one product type + links.
 *   - `tag`:      products for one product tag + links.
 *   - `all`:      full dump, hard-capped. Diagnostic / admin tool override.
 *
 * Query params:
 *   - mode: "summary" | "brand" | "category" | "type" | "tag" | "all" (default "summary")
 *   - brand: brand name (required when mode=brand)
 *   - category_id: category id (required when mode=category)
 *   - type_id: product type id (required when mode=type)
 *   - tag_id: product tag id (required when mode=tag)
 *   - limit: per-page cap for product-returning modes (default 200, max 500)
 *   - offset: pagination offset (product-returning modes only)
 */

type NodeKind = "root" | "brand" | "category" | "product" | "type" | "tag"

type GraphPrice = { amount: number; currency_code: string }

type GraphNode = {
  id: string
  kind: NodeKind
  label: string
  handle?: string
  thumbnail?: string | null
  price?: GraphPrice | null
  logoSrc?: string | null
  productCount?: number
}

type GraphLinkKind =
  | "product-brand"
  | "product-category"
  | "product-type"
  | "product-tag"
  | "category-parent"
  | "brand-root"
  | "category-root"
  | "type-root"
  | "tag-root"

type GraphLink = { source: string; target: string; kind: GraphLinkKind }

type GraphMode = "summary" | "brand" | "category" | "type" | "tag" | "all"

type GraphPayload = {
  nodes: GraphNode[]
  links: GraphLink[]
  mode: GraphMode
  offset?: number
  total?: number
}

type ProductRow = {
  id: string
  handle: string | null
  title: string
  thumbnail: string | null
  metadata: Record<string, unknown> | null
  status?: string
  type?: { id: string; value: string } | null
  tags?: Array<{ id: string; value: string }>
  variants?: Array<{
    id: string
    prices?: Array<{ amount: number; currency_code: string }>
    metadata?: Record<string, unknown> | null
  }>
  categories?: Array<{
    id: string
    name: string
    parent_category_id: string | null
  }>
  collection?: { id: string; title: string } | null
}

type CategoryRow = {
  id: string
  name: string
  parent_category_id: string | null
}

const ROOT_ID = "root"
const ROOT_NODE: GraphNode = { id: ROOT_ID, kind: "root", label: "Catalog" }

const DEFAULT_LIMIT = 200
const HARD_MAX_LIMIT = 500

/**
 * Longest handle prefix first so `biz-collection` wins over `biz`. Mirrors the
 * storefront `inferBrandFromHandle` helper so products without a metadata
 * brand still get grouped correctly.
 */
const HANDLE_PREFIX_BRAND: Array<{ prefix: string; brand: string }> = [
  { prefix: "biz-collection", brand: "Biz Collection" },
  { prefix: "biz-care", brand: "Biz Care" },
  { prefix: "biz-corporates", brand: "Biz Corporates" },
  { prefix: "as-colour", brand: "AS Colour" },
  { prefix: "syzmik", brand: "Syzmik" },
].sort((a, b) => b.prefix.length - a.prefix.length)

/**
 * Canonical brands always rendered in the summary graph, even when the
 * catalogue currently has zero products for them. Mirrors
 * `storefront/src/modules/brands/data/brands.ts` so the graph stays in sync
 * with the `/brands` page. `logoSrc` paths are relative to the storefront
 * public dir — the graph renderer prefixes them with the storefront origin.
 */
const CANONICAL_BRANDS: Array<{ name: string; logoSrc: string | null }> = [
  { name: "AS Colour", logoSrc: "/images/brands/logos/as-colour.png" },
  { name: "Syzmik", logoSrc: "/images/brands/logos/syzmik-workwear.svg" },
  { name: "Biz Collection", logoSrc: "/images/brands/logos/biz-collection.svg" },
]

function inferBrandFromHandle(handle: string | null | undefined): string | null {
  if (!handle) return null
  const h = handle.trim().toLowerCase()
  for (const { prefix, brand } of HANDLE_PREFIX_BRAND) {
    if (h === prefix || h.startsWith(`${prefix}-`)) {
      return brand
    }
  }
  return null
}

/**
 * Brand resolution priority for the catalog graph:
 *   1. Linked Brand entity (one source of truth, populated by the spreadsheet importer +
 *      `/admin/products/:id/brand` widget). Expansion happens via the product↔brand link in
 *      `query.graph(...)`.
 *   2. Legacy `metadata.brand` — left in place for the 2-week post-migration window so any
 *      product that escaped the link backfill still surfaces in the graph.
 *   3. Handle-prefix inference — last-resort fallback for products that were imported before
 *      either of the above existed.
 */
function resolveProductBrand(row: ProductRow): string | null {
  const linked = (row as { brand?: { name?: string } | Array<{ name?: string }> | null }).brand
  const linkedName = Array.isArray(linked) ? linked[0]?.name : linked?.name
  if (typeof linkedName === "string" && linkedName.trim()) return linkedName.trim()
  const metaBrand =
    typeof row.metadata?.brand === "string" ? (row.metadata.brand as string).trim() : ""
  if (metaBrand) return metaBrand
  return inferBrandFromHandle(row.handle)
}

function resolveProductType(row: ProductRow): { id: string; value: string } | null {
  const t = row.type
  if (t && typeof t.id === "string" && typeof t.value === "string") {
    return { id: t.id, value: t.value }
  }
  return null
}

function resolveProductTags(row: ProductRow): Array<{ id: string; value: string }> {
  const tags = row.tags
  if (!Array.isArray(tags)) return []
  return tags.filter(
    (t): t is { id: string; value: string } =>
      typeof t.id === "string" && typeof t.value === "string"
  )
}

const BULK_VS_CALCULATED_MISMATCH_RATIO = 2
const SUSPICIOUSLY_LOW_CALCULATED_MINOR = 100
const PLAUSIBLE_RETAIL_BULK_MINOR = 500
const AS_COLOUR_HANDLE_PREFIX = "as-colour-"

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim()
    if (!cleaned) {
      return Number.NaN
    }
    const n = Number(cleaned)
    return Number.isFinite(n) ? n : Number.NaN
  }
  return Number.NaN
}

const getFirstBulkTierMinor = (variant: {
  metadata?: Record<string, unknown> | null
}): number | undefined => {
  const metadata = (variant.metadata ?? {}) as Record<string, unknown>
  const bulkPricing = metadata.bulk_pricing as { tiers?: Array<Record<string, unknown>> } | undefined
  if (!Array.isArray(bulkPricing?.tiers) || bulkPricing.tiers.length === 0) {
    return undefined
  }

  const parsed = bulkPricing.tiers
    .map((tier) => {
      const minQuantity = toNumber(tier.min_quantity)
      const amount = toNumber(tier.amount)
      if (!Number.isFinite(minQuantity) || !Number.isFinite(amount)) {
        return null
      }
      return { min_quantity: minQuantity, amount }
    })
    .filter((t): t is { min_quantity: number; amount: number } => t !== null)
    .sort((a, b) => a.min_quantity - b.min_quantity)

  const first = parsed[0]
  return first && Number.isFinite(first.amount) ? first.amount : undefined
}

const resolveHeadlineMinorAmount = (
  bulkTierAmount: number | undefined,
  calculatedMinor: number
): number => {
  const b =
    typeof bulkTierAmount === "number" && Number.isFinite(bulkTierAmount) ? bulkTierAmount : null
  const c = calculatedMinor

  if (b !== null && b > 0 && c > 0) {
    if (c >= b * BULK_VS_CALCULATED_MISMATCH_RATIO) {
      return c
    }
    if (b >= c * BULK_VS_CALCULATED_MISMATCH_RATIO) {
      if (
        c < SUSPICIOUSLY_LOW_CALCULATED_MINOR &&
        b > PLAUSIBLE_RETAIL_BULK_MINOR &&
        b >= c * 10
      ) {
        return b
      }
      return c
    }
    return b
  }

  if (b !== null && b > 0) {
    return b
  }

  return c
}

const finalizeAudAsColourMinorIfHundredfoldTypo = (
  resolvedMinor: number,
  apiMinor: number,
  productHandle: string | null | undefined,
  currencyCode: string
): number => {
  const cc = String(currencyCode ?? "").toLowerCase()
  if (cc !== "aud") {
    return resolvedMinor
  }

  const h = String(productHandle ?? "").trim().toLowerCase()
  if (!h.startsWith(AS_COLOUR_HANDLE_PREFIX)) {
    return resolvedMinor
  }

  if (resolvedMinor !== apiMinor) {
    return resolvedMinor
  }

  if (!(apiMinor >= 5 && apiMinor <= 199)) {
    return resolvedMinor
  }

  const scaled = Math.round(apiMinor * 100)
  if (scaled < 500 || scaled > 600_000) {
    return resolvedMinor
  }
  return scaled
}

/**
 * Pick qty-1 headline-style minor amount for graph cards so Explorer aligns with PDP.
 * Uses preferred currency when available, then falls back to lowest minor in any currency.
 */
function lowestPrice(row: ProductRow, preferredCurrency: string | null): GraphPrice | null {
  const all: GraphPrice[] = []

  for (const variant of row.variants ?? []) {
    const bulkFirst = getFirstBulkTierMinor(variant)
    for (const price of variant.prices ?? []) {
      if (typeof price.amount !== "number" || !price.currency_code) {
        continue
      }
      const currencyCode = price.currency_code.toLowerCase()
      const headlineResolved = resolveHeadlineMinorAmount(bulkFirst, price.amount)
      const displayMinor = finalizeAudAsColourMinorIfHundredfoldTypo(
        headlineResolved,
        price.amount,
        row.handle,
        currencyCode
      )
      all.push({ amount: displayMinor, currency_code: currencyCode })
    }
  }

  if (!all.length) return null
  if (preferredCurrency) {
    const inPreferred = all.filter((p) => p.currency_code === preferredCurrency.toLowerCase())
    if (inPreferred.length) {
      return inPreferred.reduce((min, p) => (p.amount < min.amount ? p : min))
    }
  }
  return all.reduce((min, p) => (p.amount < min.amount ? p : min))
}

function isAllowedOrigin(origin: string): boolean {
  return isStorefrontOriginAllowed(origin)
}

function setCors(req: MedusaRequest, res: MedusaResponse) {
  const origin = req.headers.origin ?? ""
  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
  }
  res.setHeader("Vary", "Origin")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-publishable-api-key")
  res.setHeader("Access-Control-Allow-Credentials", "true")
}

function setCacheHeaders(res: MedusaResponse) {
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600")
}

function parseMode(raw: unknown): GraphMode {
  const v = typeof raw === "string" ? raw.toLowerCase() : ""
  if (v === "brand" || v === "category" || v === "type" || v === "tag" || v === "all") return v
  return "summary"
}

function clampLimit(raw: unknown): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT
  return Math.min(Math.floor(n), HARD_MAX_LIMIT)
}

function clampOffset(raw: unknown): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.floor(n)
}

/** Graph product fields requested via query.graph. */
const PRODUCT_FIELDS = [
  "id",
  "handle",
  "title",
  "thumbnail",
  "metadata",
  "status",
  "brand.id",
  "brand.name",
  "brand.handle",
  "type.id",
  "type.value",
  "tags.id",
  "tags.value",
  "variants.id",
  "variants.prices.amount",
  "variants.prices.currency_code",
  "variants.metadata",
  "categories.id",
  "categories.name",
  "categories.parent_category_id",
  "collection.id",
  "collection.title",
]

type QueryGraph = {
  graph: (args: Record<string, unknown>) => Promise<{
    data: unknown[]
    metadata?: { count?: number; take?: number; skip?: number }
  }>
}

async function fetchProducts(
  query: QueryGraph,
  filters: Record<string, unknown>,
  limit: number,
  offset: number
): Promise<{ rows: ProductRow[]; total: number }> {
  const { data, metadata } = await query.graph({
    entity: "product",
    fields: PRODUCT_FIELDS,
    filters: { status: "published", ...filters },
    pagination: { take: limit, skip: offset },
  })
  return {
    rows: (data as ProductRow[]) ?? [],
    total: metadata?.count ?? (data?.length ?? 0),
  }
}

async function fetchAllCategories(query: QueryGraph): Promise<CategoryRow[]> {
  const rows: CategoryRow[] = []
  let skip = 0
  const take = 200
  for (;;) {
    const { data } = await query.graph({
      entity: "product_category",
      fields: ["id", "name", "parent_category_id"],
      pagination: { take, skip },
    })
    const page = (data as CategoryRow[]) ?? []
    rows.push(...page)
    if (page.length < take) break
    skip += take
  }
  return rows
}

function buildProductNodeAndLinks(
  row: ProductRow,
  preferredCurrency: string | null,
  includeBrandLink: boolean,
  includeCategoryLinks: boolean
): { node: GraphNode; links: GraphLink[]; brand: string | null } {
  const brand = resolveProductBrand(row)
  const node: GraphNode = {
    id: `prod:${row.id}`,
    kind: "product",
    label: row.title,
    handle: row.handle ?? undefined,
    thumbnail: row.thumbnail ?? null,
    price: lowestPrice(row, preferredCurrency),
  }

  const links: GraphLink[] = []
  if (includeBrandLink && brand) {
    links.push({
      source: node.id,
      target: `brand:${brand}`,
      kind: "product-brand",
    })
  }
  if (includeCategoryLinks) {
    for (const cat of row.categories ?? []) {
      links.push({
        source: node.id,
        target: `cat:${cat.id}`,
        kind: "product-category",
      })
    }
  }

  // Always emit type/tag links so products connect to the summary super-nodes
  // when they're merged into the client payload.
  const productType = resolveProductType(row)
  if (productType) {
    links.push({
      source: node.id,
      target: `type:${productType.id}`,
      kind: "product-type",
    })
  }
  for (const tag of resolveProductTags(row)) {
    links.push({
      source: node.id,
      target: `tag:${tag.id}`,
      kind: "product-tag",
    })
  }

  return { node, links, brand }
}

/**
 * Build the initial "summary" payload — root + brand super-nodes + category
 * super-nodes + product type nodes + tag nodes. Brand/type/tag counts come
 * from a lightweight product scan. No product nodes are emitted here.
 */
async function buildSummary(query: QueryGraph): Promise<GraphPayload> {
  const nodes: GraphNode[] = [ROOT_NODE]
  const links: GraphLink[] = []

  const categories = await fetchAllCategories(query)
  const categoryIdSet = new Set(categories.map((c) => c.id))

  for (const cat of categories) {
    nodes.push({
      id: `cat:${cat.id}`,
      kind: "category",
      label: cat.name,
    })
    if (cat.parent_category_id && categoryIdSet.has(cat.parent_category_id)) {
      links.push({
        source: `cat:${cat.id}`,
        target: `cat:${cat.parent_category_id}`,
        kind: "category-parent",
      })
    } else {
      links.push({
        source: `cat:${cat.id}`,
        target: ROOT_ID,
        kind: "category-root",
      })
    }
  }

  const brandCounts = new Map<string, number>()
  const typeCounts = new Map<string, { value: string; count: number }>()
  const tagCounts = new Map<string, { value: string; count: number }>()

  let skip = 0
  const take = 500
  for (;;) {
    const { data } = await query.graph({
      entity: "product",
      fields: ["id", "handle", "metadata", "brand.name", "type.id", "type.value", "tags.id", "tags.value"],
      filters: { status: "published" },
      pagination: { take, skip },
    })
    const page = (data as ProductRow[]) ?? []
    for (const row of page) {
      const brand = resolveProductBrand(row as ProductRow)
      if (brand) {
        brandCounts.set(brand, (brandCounts.get(brand) ?? 0) + 1)
      }

      const productType = resolveProductType(row)
      if (productType) {
        const existing = typeCounts.get(productType.id) ?? { value: productType.value, count: 0 }
        typeCounts.set(productType.id, { ...existing, count: existing.count + 1 })
      }

      for (const tag of resolveProductTags(row)) {
        const existing = tagCounts.get(tag.id) ?? { value: tag.value, count: 0 }
        tagCounts.set(tag.id, { ...existing, count: existing.count + 1 })
      }
    }
    if (page.length < take) break
    skip += take
  }

  /**
   * Always emit every canonical brand so the graph matches the `/brands` page,
   * even when a brand has zero products in the current catalogue. Non-canonical
   * brands discovered from product metadata are appended afterwards.
   */
  const emittedBrands = new Set<string>()
  for (const canonical of CANONICAL_BRANDS) {
    emittedBrands.add(canonical.name)
    nodes.push({
      id: `brand:${canonical.name}`,
      kind: "brand",
      label: canonical.name,
      productCount: brandCounts.get(canonical.name) ?? 0,
      logoSrc: canonical.logoSrc,
    })
    links.push({
      source: `brand:${canonical.name}`,
      target: ROOT_ID,
      kind: "brand-root",
    })
  }

  for (const [brand, count] of brandCounts) {
    if (emittedBrands.has(brand)) continue
    emittedBrands.add(brand)
    nodes.push({
      id: `brand:${brand}`,
      kind: "brand",
      label: brand,
      productCount: count,
    })
    links.push({
      source: `brand:${brand}`,
      target: ROOT_ID,
      kind: "brand-root",
    })
  }

  // Emit product type super-nodes.
  for (const [typeId, { value, count }] of typeCounts) {
    nodes.push({
      id: `type:${typeId}`,
      kind: "type",
      label: value,
      productCount: count,
    })
    links.push({
      source: `type:${typeId}`,
      target: ROOT_ID,
      kind: "type-root",
    })
  }

  // Emit tag super-nodes.
  for (const [tagId, { value, count }] of tagCounts) {
    nodes.push({
      id: `tag:${tagId}`,
      kind: "tag",
      label: value,
      productCount: count,
    })
    links.push({
      source: `tag:${tagId}`,
      target: ROOT_ID,
      kind: "tag-root",
    })
  }

  return { nodes, links, mode: "summary" }
}

async function buildBrand(
  query: QueryGraph,
  brand: string,
  limit: number,
  offset: number,
  preferredCurrency: string | null
): Promise<GraphPayload> {
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []

  const brandLower = brand.toLowerCase()

  const { rows, total } = await fetchProducts(
    query,
    {
      // The brand may live on metadata or only be inferrable from handle, so
      // we OR both signals here rather than relying on a single filter.
      $or: [
        { metadata: { brand } },
        { metadata: { brand: brandLower } },
      ],
    },
    limit,
    offset
  )

  const filtered = rows.filter((row) => resolveProductBrand(row) === brand)

  /**
   * Handle-inference fallback: if the metadata filter missed products we know
   * belong to this brand (legacy rows without `metadata.brand`), top the
   * results up by scanning published products. Capped at `limit - filtered.length`.
   */
  if (filtered.length < limit) {
    const needed = limit - filtered.length
    const { rows: scan } = await fetchProducts(query, {}, needed * 4, 0)
    for (const row of scan) {
      if (filtered.length >= limit) break
      if (resolveProductBrand(row) === brand && !filtered.find((r) => r.id === row.id)) {
        filtered.push(row)
      }
    }
  }

  nodes.push({
    id: `brand:${brand}`,
    kind: "brand",
    label: brand,
    productCount: total,
  })

  const seenCategories = new Set<string>()
  for (const row of filtered) {
    const { node, links: rowLinks } = buildProductNodeAndLinks(
      row,
      preferredCurrency,
      true,
      true
    )
    nodes.push(node)
    links.push(...rowLinks)
    for (const cat of row.categories ?? []) {
      if (!seenCategories.has(cat.id)) {
        seenCategories.add(cat.id)
        nodes.push({ id: `cat:${cat.id}`, kind: "category", label: cat.name })
      }
    }
  }

  return { nodes, links, mode: "brand", offset, total }
}

/**
 * Resolve a category's display name directly from `product_category`, rather
 * than relying on it appearing as a relation on a returned product. This keeps
 * the UI correct even when the category currently contains zero products.
 */
async function fetchCategoryName(
  query: QueryGraph,
  categoryId: string
): Promise<string | null> {
  try {
    const { data } = await query.graph({
      entity: "product_category",
      fields: ["id", "name"],
      filters: { id: categoryId },
    })
    const row = (data as Array<{ id: string; name: string }>)[0]
    return row?.name ?? null
  } catch (error) {
    console.warn(`[/store/graph] failed to fetch category ${categoryId} name`, error)
    return null
  }
}

async function buildCategory(
  query: QueryGraph,
  categoryId: string,
  limit: number,
  offset: number,
  preferredCurrency: string | null
): Promise<GraphPayload> {
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []

  /**
   * Resolve the canonical category name up-front so the node label is always
   * correct — even when the category contains zero products, or when the
   * primary product→category filter returns nothing.
   */
  const resolvedName = await fetchCategoryName(query, categoryId)

  let rows: ProductRow[] = []
  let total = 0
  const attempts: Array<{ label: string; filter: Record<string, unknown> }> = [
    { label: "categories.id", filter: { categories: { id: categoryId } } },
    { label: "category_id", filter: { category_id: categoryId } },
  ]

  for (const attempt of attempts) {
    try {
      const result = await fetchProducts(query, attempt.filter, limit, offset)
      if (result.rows.length > 0 || result.total > 0) {
        rows = result.rows
        total = result.total
        break
      }
      total = result.total
    } catch (error) {
      console.warn(
        `[/store/graph] category filter "${attempt.label}" failed for ${categoryId}`,
        error
      )
    }
  }

  if (!rows.length) {
    console.info(
      `[/store/graph] category ${categoryId} (${
        resolvedName ?? "unknown"
      }) returned 0 products. This usually means no products are assigned to this category in Medusa Admin, or their status != "published".`
    )
  }

  const categoryLabel =
    resolvedName ??
    rows[0]?.categories?.find((c) => c.id === categoryId)?.name ??
    "Category"

  nodes.push({
    id: `cat:${categoryId}`,
    kind: "category",
    label: categoryLabel,
    productCount: total,
  })

  const brandsSeen = new Set<string>()
  for (const row of rows) {
    const { node, links: rowLinks, brand } = buildProductNodeAndLinks(
      row,
      preferredCurrency,
      true,
      true
    )
    nodes.push(node)
    links.push(...rowLinks)
    if (brand && !brandsSeen.has(brand)) {
      brandsSeen.add(brand)
      nodes.push({ id: `brand:${brand}`, kind: "brand", label: brand })
    }
  }

  return { nodes, links, mode: "category", offset, total }
}

async function buildType(
  query: QueryGraph,
  typeId: string,
  limit: number,
  offset: number,
  preferredCurrency: string | null
): Promise<GraphPayload> {
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []

  const { rows, total } = await fetchProducts(
    query,
    { type_id: typeId },
    limit,
    offset
  )

  const typeLabel = resolveProductType(rows[0] ?? ({} as ProductRow))?.value ?? "Type"

  nodes.push({
    id: `type:${typeId}`,
    kind: "type",
    label: typeLabel,
    productCount: total,
  })

  const brandsSeen = new Set<string>()
  const categoriesSeen = new Set<string>()

  for (const row of rows) {
    const { node, links: rowLinks, brand } = buildProductNodeAndLinks(
      row,
      preferredCurrency,
      true,
      true
    )
    nodes.push(node)
    links.push(...rowLinks)
    if (brand && !brandsSeen.has(brand)) {
      brandsSeen.add(brand)
      nodes.push({ id: `brand:${brand}`, kind: "brand", label: brand })
    }
    for (const cat of row.categories ?? []) {
      if (!categoriesSeen.has(cat.id)) {
        categoriesSeen.add(cat.id)
        nodes.push({ id: `cat:${cat.id}`, kind: "category", label: cat.name })
      }
    }
  }

  return { nodes, links, mode: "type", offset, total }
}

async function buildTag(
  query: QueryGraph,
  tagId: string,
  limit: number,
  offset: number,
  preferredCurrency: string | null
): Promise<GraphPayload> {
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []

  // Filter products that have this tag. Medusa v2 supports relation filters
  // via nested objects — `{ tags: { id: tagId } }` matches products where at
  // least one tag matches the given id.
  let rows: ProductRow[] = []
  let total = 0
  try {
    const result = await fetchProducts(query, { tags: { id: tagId } }, limit, offset)
    rows = result.rows
    total = result.total
  } catch (error) {
    console.warn(`[/store/graph] tag filter failed for tag ${tagId}`, error)
  }

  // Determine tag label from any matching product row.
  let tagLabel = "Tag"
  for (const row of rows) {
    const found = resolveProductTags(row).find((t) => t.id === tagId)
    if (found) {
      tagLabel = found.value
      break
    }
  }

  nodes.push({
    id: `tag:${tagId}`,
    kind: "tag",
    label: tagLabel,
    productCount: total,
  })

  const brandsSeen = new Set<string>()
  const categoriesSeen = new Set<string>()

  for (const row of rows) {
    const { node, links: rowLinks, brand } = buildProductNodeAndLinks(
      row,
      preferredCurrency,
      true,
      true
    )
    nodes.push(node)
    links.push(...rowLinks)
    if (brand && !brandsSeen.has(brand)) {
      brandsSeen.add(brand)
      nodes.push({ id: `brand:${brand}`, kind: "brand", label: brand })
    }
    for (const cat of row.categories ?? []) {
      if (!categoriesSeen.has(cat.id)) {
        categoriesSeen.add(cat.id)
        nodes.push({ id: `cat:${cat.id}`, kind: "category", label: cat.name })
      }
    }
  }

  return { nodes, links, mode: "tag", offset, total }
}

async function buildAll(
  query: QueryGraph,
  limit: number,
  offset: number,
  preferredCurrency: string | null
): Promise<GraphPayload> {
  const { rows, total } = await fetchProducts(query, {}, limit, offset)
  const nodes: GraphNode[] = [ROOT_NODE]
  const links: GraphLink[] = []
  const brandsSeen = new Set<string>()
  const categoriesSeen = new Set<string>()

  for (const row of rows) {
    const { node, links: rowLinks, brand } = buildProductNodeAndLinks(
      row,
      preferredCurrency,
      true,
      true
    )
    nodes.push(node)
    links.push(...rowLinks)
    if (brand && !brandsSeen.has(brand)) {
      brandsSeen.add(brand)
      nodes.push({ id: `brand:${brand}`, kind: "brand", label: brand })
      links.push({ source: `brand:${brand}`, target: ROOT_ID, kind: "brand-root" })
    }
    for (const cat of row.categories ?? []) {
      if (!categoriesSeen.has(cat.id)) {
        categoriesSeen.add(cat.id)
        nodes.push({ id: `cat:${cat.id}`, kind: "category", label: cat.name })
      }
    }
  }

  return { nodes, links, mode: "all", offset, total }
}

export async function OPTIONS(req: MedusaRequest, res: MedusaResponse) {
  setCors(req, res)
  return res.status(204).send()
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  setCors(req, res)
  setCacheHeaders(res)

  const mode = parseMode(req.query.mode)
  const limit = clampLimit(req.query.limit)
  const offset = clampOffset(req.query.offset)
  const preferredCurrency =
    typeof req.query.currency_code === "string"
      ? (req.query.currency_code as string).toLowerCase()
      : process.env.STORE_DEFAULT_CURRENCY?.toLowerCase() ?? null

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as QueryGraph

  try {
    let payload: GraphPayload
    if (mode === "summary") {
      payload = await buildSummary(query)
    } else if (mode === "brand") {
      const brand = typeof req.query.brand === "string" ? req.query.brand.trim() : ""
      if (!brand) {
        return res.status(400).json({
          error: "Missing `brand` query parameter for mode=brand",
        })
      }
      payload = await buildBrand(query, brand, limit, offset, preferredCurrency)
    } else if (mode === "category") {
      const categoryId =
        typeof req.query.category_id === "string" ? req.query.category_id.trim() : ""
      if (!categoryId) {
        return res.status(400).json({
          error: "Missing `category_id` query parameter for mode=category",
        })
      }
      payload = await buildCategory(query, categoryId, limit, offset, preferredCurrency)
    } else if (mode === "type") {
      const typeId =
        typeof req.query.type_id === "string" ? req.query.type_id.trim() : ""
      if (!typeId) {
        return res.status(400).json({
          error: "Missing `type_id` query parameter for mode=type",
        })
      }
      payload = await buildType(query, typeId, limit, offset, preferredCurrency)
    } else if (mode === "tag") {
      const tagId =
        typeof req.query.tag_id === "string" ? req.query.tag_id.trim() : ""
      if (!tagId) {
        return res.status(400).json({
          error: "Missing `tag_id` query parameter for mode=tag",
        })
      }
      payload = await buildTag(query, tagId, limit, offset, preferredCurrency)
    } else {
      payload = await buildAll(query, limit, offset, preferredCurrency)
    }

    return res.status(200).json(payload)
  } catch (error) {
    console.error("[/store/graph] failed to build graph payload", error)
    return res.status(500).json({
      error: "Failed to build graph payload",
      message: error instanceof Error ? error.message : "unknown error",
    })
  }
}
