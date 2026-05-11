import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /store/graph
 *
 * Builds the Nodes/Links JSON for the storefront product discovery graph.
 * Uses `query.graph` so a single request fetches product + brand (metadata) +
 * category + collection relationships with no waterfalls.
 *
 * Modes:
 *   - `summary` (default): root + distinct brand nodes + top-level categories.
 *     No product nodes. Used for the initial paint.
 *   - `brand`:   products for one brand + links to brand + their categories.
 *   - `category`: products in one category + links.
 *   - `all`:     full dump, hard-capped. Diagnostic / admin tool override.
 *
 * Query params:
 *   - mode: "summary" | "brand" | "category" | "all" (default "summary")
 *   - brand: brand name (required when mode=brand)
 *   - category_id: category id (required when mode=category)
 *   - limit: per-page cap for product-returning modes (default 200, max 500)
 *   - offset: pagination offset (product-returning modes only)
 */

type NodeKind = "root" | "brand" | "category" | "product"

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
  | "category-parent"
  | "brand-root"
  | "category-root"

type GraphLink = { source: string; target: string; kind: GraphLinkKind }

type GraphMode = "summary" | "brand" | "category" | "all"

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
  { prefix: "american-apparel", brand: "American Apparel" },
  { prefix: "biz-collection", brand: "Biz Collection" },
  { prefix: "next-level", brand: "Next Level" },
  { prefix: "stanley-stella", brand: "Stanley/Stella" },
  { prefix: "as-colour", brand: "AS Colour" },
  { prefix: "grace", brand: "Grace Collection" },
  { prefix: "dnc", brand: "DNC Workwear" },
  { prefix: "ramo", brand: "Ramo" },
  { prefix: "gildan", brand: "Gildan" },
  { prefix: "syzmik", brand: "Syzmik" },
  { prefix: "anvil", brand: "Anvil" },
  { prefix: "aussie-pacific", brand: "Aussie Pacific" },
  { prefix: "winning-spirit", brand: "Winning Spirit" },
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
  { name: "Gildan", logoSrc: "/images/brands/logos/gildan.png" },
  { name: "Syzmik", logoSrc: "/images/brands/logos/syzmik-workwear.svg" },
  { name: "Biz Collection", logoSrc: "/images/brands/logos/biz-collection.svg" },
  { name: "American Apparel", logoSrc: "/images/brands/logos/american-apparel.png" },
  { name: "Anvil", logoSrc: "/images/brands/logos/anvil.png" },
  { name: "DNC Workwear", logoSrc: "/images/brands/logos/dnc.png" },
  { name: "Grace Collection", logoSrc: "/images/brands/logos/grace.svg" },
  { name: "Ramo", logoSrc: "/images/brands/logos/ramo.svg" },
  { name: "Aussie Pacific", logoSrc: null },
  { name: "Winning Spirit", logoSrc: null },
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

/**
 * STORE_CORS entries may be plain origins (`https://foo.com`) or JS-style
 * regexes wrapped in slashes (`/\.vercel\.app$/`). We accept both so Vercel
 * preview URLs like `medusajs-2-0-for-railway-vercel-<hash>.vercel.app` can be
 * matched without hard-coding every deploy.
 */
function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false

  const defaults: Array<string | RegExp> = [
    "https://medusajs-2-0-for-railway-vercel.vercel.app",
    "http://localhost:8000",
    /^https:\/\/medusajs-2-0-for-railway-vercel[a-z0-9-]*\.vercel\.app$/,
  ]

  const configured = (process.env.STORE_CORS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map<string | RegExp>((entry) => {
      if (entry.startsWith("/") && entry.endsWith("/") && entry.length > 2) {
        try {
          return new RegExp(entry.slice(1, -1))
        } catch {
          return entry
        }
      }
      return entry
    })

  for (const rule of [...defaults, ...configured]) {
    if (typeof rule === "string") {
      if (rule === origin) return true
    } else if (rule.test(origin)) {
      return true
    }
  }
  return false
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
  if (v === "brand" || v === "category" || v === "all") return v
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
  return { node, links, brand }
}

/**
 * Build the initial "summary" payload — root + brand super-nodes + category
 * super-nodes. Brand counts come from a lightweight product scan that pulls
 * only `id`, `handle` and `metadata.brand`, which `query.graph` can satisfy
 * efficiently.
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
  let skip = 0
  const take = 500
  for (;;) {
    const { data } = await query.graph({
      entity: "product",
      fields: ["id", "handle", "metadata", "brand.name"],
      filters: { status: "published" },
      pagination: { take, skip },
    })
    const page = (data as Array<Pick<ProductRow, "id" | "handle" | "metadata">>) ?? []
    for (const row of page) {
      const brand = resolveProductBrand(row as ProductRow)
      if (!brand) continue
      brandCounts.set(brand, (brandCounts.get(brand) ?? 0) + 1)
    }
    if (page.length < take) break
    skip += take
  }

  /**
   * Always emit every canonical brand so the graph matches the `/brands` page,
   * even when a brand has zero products in the current catalogue (common for
   * newly-added brands or regions without stock). Non-canonical brands
   * discovered from product metadata are appended afterwards.
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
      // Keep the latest attempt's total in case every attempt returns zero —
      // so the UI still shows `0` rather than `undefined` in the badge.
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
