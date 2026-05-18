/**
 * Import DNC Workwear catalog from CSV into Medusa (handles `dnc-*`).
 *
 * - Skips rows with Condition=Discontinued.
 * - Groups products by file order: header row (Description2+3 empty) + child SKUs
 *   with ProductCode starting with the header code; or single-SKU blocks when
 *   the next row does not share the prefix (see plan).
 * - Pricing: t100 = round(cost * 1.1 * 1.5) in minor units; lower tiers derived
 *   like `trim-ramo-catalog` (env DNC_DERIVE_*).
 *
 * Usage (from `backend/`):
 *   pnpm run import-dnc-products
 *   pnpm run import-dnc-products -- --apply
 *
 * Env:
 *   DNC_CSV — path to CSV (optional; otherwise tries ./data/ and ./backend/data/ for known filenames)
 *   DNC_MAX_PRODUCTS — cap number of products to import (for testing)
 *   DNC_PRODUCT_BATCH — createProductsWorkflow batch size (default 25)
 *   DNC_DERIVE_T50, DNC_DERIVE_T10_FROM_T50, DNC_DERIVE_BASE_FROM_T10 — same defaults as Ramo
 */

import fs from "node:fs"
import path from "node:path"

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, ProductStatus } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

import { parseMoneyToMinor } from "../utils/parse-money-to-minor"
import { withNonTrackedInventoryDefaults } from "./utils/variant-inventory-defaults"

type CsvRow = Record<string, string>

const PRICE_CURRENCY_CODE = "aud"
const BULK_PRICING_SOURCE = "dnc-vol-13"

const parseEnvFloat = (key: string, fallback: number) => {
  const v = process.env[key]?.trim()
  if (!v) {
    return fallback
  }
  const n = Number.parseFloat(v)
  return Number.isFinite(n) ? n : fallback
}

const getDeriveMultipliers = () => ({
  t50OverT100: parseEnvFloat("DNC_DERIVE_T50", 1.2),
  t10OverT50: parseEnvFloat("DNC_DERIVE_T10_FROM_T50", 16 / 15),
  baseOverT10: parseEnvFloat("DNC_DERIVE_BASE_FROM_T10", 4 / 3),
})

type TierMoneyMinor = {
  base: number
  t10: number
  t50: number
  t100: number
}

const deriveTiersFromT100Minor = (t100M: number, m: ReturnType<typeof getDeriveMultipliers>): TierMoneyMinor => {
  const t50M = Math.round(t100M * m.t50OverT100)
  const t10M = Math.round(t50M * m.t10OverT50)
  const baseM = Math.round(t10M * m.baseOverT10)
  return { base: baseM, t10: t10M, t50: t50M, t100: t100M }
}

/** Minor units → Medusa major units (decimal). Boundary conversion. */
const minorToMajor = (minor: number): number => minor / 100

const buildPricesForPriceSet = (m: TierMoneyMinor): Array<Record<string, unknown>> => [
  { amount: minorToMajor(m.base), currency_code: PRICE_CURRENCY_CODE, min_quantity: 1, max_quantity: 9 },
  { amount: minorToMajor(m.t10), currency_code: PRICE_CURRENCY_CODE, min_quantity: 10, max_quantity: 49 },
  { amount: minorToMajor(m.t50), currency_code: PRICE_CURRENCY_CODE, min_quantity: 50, max_quantity: 99 },
  { amount: minorToMajor(m.t100), currency_code: PRICE_CURRENCY_CODE, min_quantity: 100 },
]

const parseCsvLine = (line: string): string[] => {
  const out: string[] = []
  let value = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === "\"") {
      if (inQuotes && line[i + 1] === "\"") {
        value += "\""
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (ch === "," && !inQuotes) {
      out.push(value)
      value = ""
      continue
    }
    value += ch
  }
  out.push(value)
  return out
}

const splitCsvRecords = (raw: string): string[] => {
  const records: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    if (ch === '"') {
      if (inQuotes && raw[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
        current += ch
      }
      continue
    }
    if (!inQuotes) {
      if (ch === "\n") {
        if (current.length > 0 || records.length > 0) {
          records.push(current)
        }
        current = ""
        continue
      }
      if (ch === "\r") {
        if (raw[i + 1] === "\n") {
          i++
        }
        if (current.length > 0 || records.length > 0) {
          records.push(current)
        }
        current = ""
        continue
      }
    }
    current += ch
  }
  if (current.length > 0 || records.length > 0) {
    records.push(current)
  }
  return records.filter((r) => r.trim().length > 0)
}

const parseCsv = (raw: string): CsvRow[] => {
  const lines = splitCsvRecords(raw)
  if (!lines.length) {
    return []
  }
  const headers = parseCsvLine(lines[0])
  return lines.slice(1).map((line) => {
    const parts = parseCsvLine(line)
    const row: CsvRow = {}
    headers.forEach((header, idx) => {
      row[header] = (parts[idx] ?? "").trim()
    })
    return row
  })
}

const isDiscontinued = (row: CsvRow) =>
  (row["Condition"] || "").trim().toLowerCase() === "discontinued"

const isHeaderRow = (row: CsvRow) => !(row["Description2"] || "").trim() && !(row["Description3"] || "").trim()

const DNC_CSV_FILENAMES = [
  "dnc-vol-13.csv",
  "DNC Workwear Volume 13 Price List - Product data (CSV).csv",
] as const

const resolveCsvPath = (cwd: string): string => {
  const fromEnv = process.env.DNC_CSV?.trim()
  const candidates: string[] = []
  if (fromEnv) {
    candidates.push(path.resolve(fromEnv))
  }
  // Medusa `cwd` is usually `backend/`; on some hosts (e.g. Railway) it may be the repo root — try both.
  for (const name of DNC_CSV_FILENAMES) {
    candidates.push(path.resolve(cwd, "data", name))
    candidates.push(path.resolve(cwd, "backend", "data", name))
  }
  candidates.push(
    path.resolve(cwd, "..", "DNC Workwear Volume 13 Price List - Product data (CSV).csv")
  )

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return p
    }
  }
  throw new Error(
    `DNC CSV not found. Set DNC_CSV to the file path, or add one of: ${DNC_CSV_FILENAMES.join(", ")} under data/ (backend root or repo root). Tried: ${candidates.join(", ")}`
  )
}

const slugifyHandle = (code: string) =>
  code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "product"

const getApplyFlag = (args: string[] | undefined) =>
  (args ?? []).includes("--apply") ||
  process.argv.includes("--apply") ||
  process.env.DNC_IMPORT_APPLY === "1" ||
  process.env.DNC_IMPORT_APPLY === "true"

const parseIntEnv = (key: string, fallback: number) => {
  const n = Number.parseInt(process.env[key] || "", 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

type DncGroup = {
  /** Rows as stored: first may be style header (empty d2/d3) or single-sKU row */
  rows: CsvRow[]
}

const groupDncRows = (rows: CsvRow[], logger: { warn: (s: string) => void }): DncGroup[] => {
  const groups: DncGroup[] = []
  let current: CsvRow[] = []
  let baseCode: string | null = null

  const flush = () => {
    if (current.length && baseCode) {
      groups.push({ rows: current })
    }
    current = []
    baseCode = null
  }

  for (const row of rows) {
    const code = (row["ProductCode"] || "").trim()
    if (!code) {
      logger.warn("Skipping row with empty ProductCode")
      continue
    }

    if (!current.length) {
      current = [row]
      baseCode = code
      continue
    }

    if (code.startsWith(baseCode!)) {
      current.push(row)
      continue
    }

    flush()

    if (isHeaderRow(row)) {
      current = [row]
      baseCode = code
    } else {
      current = [row]
      baseCode = code
    }
  }

  flush()
  return groups
}

type VariantDef = {
  title: string
  sku: string
  barcode?: string
  optionColor?: string
  optionSize?: string
  useColorOption: boolean
  useSizeOption: boolean
  useTypeOption: boolean
  priceRaw: string
  weightGrams?: number
}

/** Multi-key probe for weight columns; DNC exports vary the column header. */
const WEIGHT_COLUMN_KEYS = [
  "Weight",
  "Weight (g)",
  "Weight g",
  "Weight Grams",
  "WeightGrams",
  "Garment Weight",
  "Variant Weight",
  "Product Weight",
] as const

const SIZE_WEIGHT_MULTIPLIER: Record<string, number> = {
  XXS: 0.85,
  XS: 0.9,
  S: 0.95,
  M: 1,
  L: 1.07,
  XL: 1.14,
  "2XL": 1.22,
  XXL: 1.22,
  "3XL": 1.3,
  XXXL: 1.3,
  "4XL": 1.38,
  "5XL": 1.46,
  "6XL": 1.54,
  "7XL": 1.62,
}

const parseWeightFromRow = (row: CsvRow): number | undefined => {
  for (const key of WEIGHT_COLUMN_KEYS) {
    const raw = (row[key] || "").trim()
    if (!raw) {
      continue
    }
    const numeric = Number.parseFloat(raw.replace(/,/g, ""))
    if (!Number.isFinite(numeric) || numeric <= 0) {
      continue
    }
    if (/kg/i.test(raw)) {
      return Math.round(numeric * 1000)
    }
    return Math.round(numeric)
  }
  return undefined
}

const resolveVariantWeightGrams = (
  row: CsvRow,
  baseWeight: number | undefined,
  size: string | undefined
): number | undefined => {
  const direct = parseWeightFromRow(row)
  if (direct) {
    return direct
  }
  if (typeof baseWeight !== "number" || !Number.isFinite(baseWeight) || baseWeight <= 0) {
    return undefined
  }
  const sizeKey = (size || "").trim().toUpperCase()
  const multiplier = SIZE_WEIGHT_MULTIPLIER[sizeKey] ?? 1
  return Math.round(baseWeight * multiplier)
}

const buildVariantRows = (g: DncGroup): { productTitle: string; thumbnail: string; imageUrls: string[]; variantRows: CsvRow[] } | null => {
  const { rows } = g
  if (!rows.length) {
    return null
  }
  const first = rows[0]
  if (isHeaderRow(first)) {
    if (rows.length < 2) {
      return null
    }
    const headerImage = (first["Image"] || "").trim()
    const extra = [first["Picture 1"], first["Picture 2"], first["Picture 3"]]
      .map((x) => (x || "").trim())
      .filter(Boolean)
    const productTitle = (first["Description"] || "").trim() || "DNC product"
    const imageUrls: string[] = []
    if (headerImage) {
      imageUrls.push(headerImage)
    }
    return {
      productTitle,
      thumbnail: headerImage,
      imageUrls,
      variantRows: rows.slice(1),
    }
  }

  const img = (first["Image"] || "").trim()
  return {
    productTitle: (first["Description"] || "").trim() || "DNC product",
    thumbnail: img,
    imageUrls: img ? [img] : [],
    variantRows: rows,
  }
}

const collectOptionFlags = (variantSource: CsvRow[]) => {
  const hasD2 = variantSource.some((r) => (r["Description2"] || "").trim())
  const hasD3 = variantSource.some((r) => (r["Description3"] || "").trim())
  return { hasD2, hasD3 }
}

const toVariantDef = (
  row: CsvRow,
  hasD2: boolean,
  hasD3: boolean,
  groupBaseWeight: number | undefined
): VariantDef | null => {
  const title = (row["Description"] || "").trim() || (row["ProductCode"] || "").trim()
  const sku = (row["ProductCode"] || "").trim()
  const barcode = (row["Barcode"] || "").trim() || undefined
  const d2 = (row["Description2"] || "").trim()
  const d3 = (row["Description3"] || "").trim()
  const useColor = hasD2
  const useSize = hasD3
  const useType = !hasD2 && !hasD3
  if (!sku) {
    return null
  }
  const sizeForWeight = useSize ? d3 || undefined : undefined
  return {
    title,
    sku,
    barcode,
    optionColor: useColor ? d2 || "Default" : undefined,
    optionSize: useSize ? d3 || "One Size" : undefined,
    useColorOption: useColor,
    useSizeOption: useSize,
    useTypeOption: useType,
    priceRaw: row["Price"] || "",
    weightGrams: resolveVariantWeightGrams(row, groupBaseWeight, sizeForWeight),
  }
}

const buildTierMetadata = (tiers: TierMoneyMinor) => ({
  source: BULK_PRICING_SOURCE,
  currency_code: PRICE_CURRENCY_CODE,
  tiers: [
    { min_quantity: 1, max_quantity: 9, amount: minorToMajor(tiers.base) },
    { min_quantity: 10, max_quantity: 49, amount: minorToMajor(tiers.t10) },
    { min_quantity: 50, max_quantity: 99, amount: minorToMajor(tiers.t50) },
    { min_quantity: 100, amount: minorToMajor(tiers.t100) },
  ],
})

const chunk = <T>(items: T[], size: number) => {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size))
  }
  return out
}

export default async function importDncProducts({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const apply = getApplyFlag(args)
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (a: Record<string, unknown>) => Promise<{ data?: unknown[] }>
  }
  const link = container.resolve(ContainerRegistrationKeys.LINK) as {
    create: (data: Record<string, unknown>) => Promise<unknown>
  }
  const productModuleService = container.resolve(Modules.PRODUCT) as {
    updateProductVariants: (id: string, data: Record<string, unknown>) => Promise<unknown>
  }
  const pricingModuleService = container.resolve(Modules.PRICING) as {
    upsertPriceSets: (data: Array<Record<string, unknown>>) => Promise<unknown>
  }
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL) as {
    listSalesChannels: (filters?: Record<string, unknown>) => Promise<Array<{ id: string }>>
  }
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT) as {
    listShippingProfiles: (filters?: Record<string, unknown>) => Promise<Array<{ id: string }>>
  }

  if (typeof productModuleService.updateProductVariants !== "function") {
    throw new Error("updateProductVariants is not available on product module")
  }
  if (typeof pricingModuleService.upsertPriceSets !== "function") {
    throw new Error("upsertPriceSets is not available on pricing module")
  }

  const csvPath = resolveCsvPath(process.cwd())
  const deriveMult = getDeriveMultipliers()
  const maxProducts = parseIntEnv("DNC_MAX_PRODUCTS", Number.POSITIVE_INFINITY)
  const productBatchSize = parseIntEnv("DNC_PRODUCT_BATCH", 25)

  logger.info(`DNC import mode: ${apply ? "APPLY" : "DRY RUN"} (use -- --apply to write)`)
  logger.info(`CSV: ${csvPath}`)

  const raw = fs.readFileSync(csvPath, "utf-8")
  const allRows = parseCsv(raw)
  const activeRows = allRows.filter((r) => !isDiscontinued(r))
  logger.info(`Rows: total=${allRows.length} active (non-discontinued)=${activeRows.length}`)

  const groups = groupDncRows(activeRows, logger)
  const skippedEmpty = groups.filter((g) => {
    const b = buildVariantRows(g)
    return b === null || b.variantRows.length === 0
  }).length
  logger.info(`Product groups: ${groups.length} (skipped empty/no variants: ${skippedEmpty})`)

  const salesChannels = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  })
  if (!salesChannels.length) {
    throw new Error("Default Sales Channel not found")
  }
  const defaultSalesChannelId = salesChannels[0]!.id
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({ type: "default" })
  if (!shippingProfiles.length) {
    throw new Error("Default shipping profile not found")
  }
  const shippingProfileId = shippingProfiles[0]!.id

  const prepared: Array<{
    handle: string
    productPayload: Record<string, unknown>
    skus: string[]
  }> = []

  let orphanCount = 0
  for (const g of groups) {
    if (prepared.length >= maxProducts) {
      break
    }
    const built = buildVariantRows(g)
    if (!built || !built.variantRows.length) {
      continue
    }
    const { productTitle, thumbnail, imageUrls, variantRows } = built
    if (isHeaderRow(g.rows[0]!) && g.rows.length === 1) {
      continue
    }
    if (!isHeaderRow(g.rows[0]!)) {
      orphanCount++
    }
    const baseCode = (g.rows[0]!["ProductCode"] || "").trim()
    const handle = `dnc-${slugifyHandle(baseCode)}`

    const pricedRows = variantRows.filter((r) => parseMoneyToMinor(r["Price"] || "") !== null)
    if (!pricedRows.length) {
      logger.warn(`No rows with valid Price for group starting ${baseCode}, skipping`)
      continue
    }
    if (pricedRows.length < variantRows.length) {
      logger.warn(
        `Group ${baseCode}: ${variantRows.length - pricedRows.length} variant(s) dropped (invalid Price)`
      )
    }

    const { hasD2, hasD3 } = collectOptionFlags(pricedRows)

    const headerWeight = parseWeightFromRow(g.rows[0]!)
    const fallbackVariantWeight = pricedRows
      .map((r) => parseWeightFromRow(r))
      .find((w): w is number => typeof w === "number")
    const groupBaseWeight = headerWeight ?? fallbackVariantWeight

    const variantDefs: VariantDef[] = []
    for (const r of pricedRows) {
      const v = toVariantDef(r, hasD2, hasD3, groupBaseWeight)
      if (v) {
        variantDefs.push(v)
      }
    }
    if (!variantDefs.length) {
      continue
    }

    const first = variantDefs[0]!
    const colorValues = new Set<string>()
    const sizeValues = new Set<string>()
    const typeValues = new Set<string>()
    for (const v of variantDefs) {
      if (v.useColorOption && v.optionColor) {
        colorValues.add(v.optionColor)
      }
      if (v.useSizeOption && v.optionSize) {
        sizeValues.add(v.optionSize)
      }
      if (v.useTypeOption) {
        typeValues.add(v.title)
      }
    }

    const options: Array<{ title: string; values: string[] }> = []
    if (first.useColorOption) {
      options.push({ title: "Color", values: Array.from(colorValues) })
    }
    if (first.useSizeOption) {
      options.push({ title: "Size", values: Array.from(sizeValues) })
    }
    if (first.useTypeOption) {
      options.push({ title: "Type", values: typeValues.size ? Array.from(typeValues) : ["Default"] })
    }
    if (!options.length) {
      options.push({ title: "Type", values: ["Default"] })
    }

    const medusaVariants: Record<string, unknown>[] = []
    for (const v of variantDefs) {
      const costMinor = parseMoneyToMinor(v.priceRaw)!
      const t100Minor = Math.round(costMinor * 1.1 * 1.5)
      const tiers = deriveTiersFromT100Minor(t100Minor, deriveMult)

      const optionsMap: Record<string, string> = {}
      if (v.useColorOption) {
        optionsMap.Color = v.optionColor!
      }
      if (v.useSizeOption) {
        optionsMap.Size = v.optionSize!
      }
      if (v.useTypeOption) {
        optionsMap.Type = v.title
      }
      if (!Object.keys(optionsMap).length) {
        optionsMap.Type = "Default"
      }

      const garmentColor = (variantRows.find((r) => (r["ProductCode"] || "").trim() === v.sku)?.["Description2"] || "").trim() || undefined
      const meta: Record<string, unknown> = {
        dnc_product_code: v.sku,
        dnc_cost_price_ex_gst_minor: costMinor,
        // Canonical ex-GST cost in minor units — read by the tier-pricing
        // regen job. See `backend/src/lib/customer-tiers.ts`.
        cost_price_ex_gst_minor: costMinor,
        bulk_pricing: buildTierMetadata(tiers),
        ...(garmentColor ? { garment_color: garmentColor } : {}),
      }

      medusaVariants.push({
        title: v.title,
        sku: v.sku,
        barcode: v.barcode,
        weight: v.weightGrams,
        options: optionsMap,
        prices: [{ amount: minorToMajor(tiers.base), currency_code: PRICE_CURRENCY_CODE }],
        metadata: meta,
        ...withNonTrackedInventoryDefaults({}),
      })
    }

    if (!medusaVariants.length) {
      continue
    }

    const imgs = new Set<string>()
    for (const u of imageUrls) {
      if (u) {
        imgs.add(u)
      }
    }
    for (const r of variantRows) {
      const u = (r["Image"] || "").trim()
      if (u) {
        imgs.add(u)
      }
    }

    prepared.push({
      handle,
      skus: medusaVariants.map((x) => (x.sku as string) || "").filter(Boolean),
      productPayload: {
        title: productTitle,
        description: undefined,
        handle,
        status: ProductStatus.PUBLISHED,
        thumbnail: thumbnail || undefined,
        weight: groupBaseWeight,
        images: Array.from(imgs).map((url) => ({ url })),
        metadata: {
          brand: "DNC Workwear",
          brand_slug: "dnc",
        },
        options,
        variants: medusaVariants,
        shipping_profile_id: shippingProfileId,
        sales_channels: [{ id: defaultSalesChannelId }],
      },
    })
  }

  logger.info(
    `Prepared products: ${prepared.length} (orphan single-SKU groups: ${orphanCount}). Max products cap: ${
      maxProducts === Number.POSITIVE_INFINITY ? "none" : maxProducts
    }`
  )

  if (!prepared.length) {
    logger.info("Nothing to import.")
    return
  }

  const handles = prepared.map((p) => p.handle)
  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: handles },
  })
  const existingHandles = new Set((existing ?? []).map((e: { handle?: string }) => (e as { handle: string }).handle))
  const toCreate = prepared.filter((p) => !existingHandles.has(p.handle))
  const skipped = prepared.length - toCreate.length
  if (skipped) {
    logger.info(`Skipping ${skipped} product(s) that already exist (by handle).`)
  }
  if (!toCreate.length) {
    logger.info("All prepared handles already exist. Nothing to create.")
    return
  }

  if (!apply) {
    for (const p of toCreate.slice(0, 10)) {
      logger.info(
        ` [dry] ${p.handle} — ${(p.productPayload.variants as unknown[]).length} variants, sample SKUs: ${p.skus.slice(0, 3).join(", ")}`
      )
    }
    if (toCreate.length > 10) {
      logger.info(` [dry] ... and ${toCreate.length - 10} more products`)
    }
    logger.info("Dry run complete. Re-run with -- --apply to create products and apply tiered price sets.")
    return
  }

  for (const batch of chunk(toCreate, productBatchSize)) {
    const products = batch.map((b) => b.productPayload) as any[]
    await createProductsWorkflow(container).run({ input: { products } })
    const batchHandles = batch.map((b) => b.handle)
    const { data: createdProducts } = await query.graph({
      entity: "product",
      fields: ["id", "handle"],
      filters: { handle: batchHandles },
    })
    const idByHandle = new Map(
      (createdProducts ?? []).map((pr: { id: string; handle: string }) => [pr.handle, pr.id])
    )

    for (const item of batch) {
      const pid = idByHandle.get(item.handle)
      if (!pid) {
        logger.warn(`Created batch: could not resolve product id for ${item.handle}`)
        continue
      }
      const { data: vars } = await query.graph({
        entity: "product_variant",
        fields: ["id", "sku", "price_set.id", "metadata"],
        filters: { product_id: [pid] },
      })
      const bySku = new Map(
        (vars ?? []).map((v: { id: string; sku?: string; price_set?: { id?: string }; metadata?: unknown }) => [
          (v.sku || "").trim(),
          v,
        ])
      )

      for (const sku of item.skus) {
        const vrow = bySku.get(sku)
        if (!vrow) {
          logger.warn(`Variant not found for SKU ${sku} on ${item.handle}`)
          continue
        }
        const costMinor = (vrow.metadata as Record<string, unknown> | undefined)?.dnc_cost_price_ex_gst_minor
        if (typeof costMinor !== "number" || !Number.isFinite(costMinor)) {
          continue
        }
        const t100Minor = Math.round(costMinor * 1.1 * 1.5)
        const tiers = deriveTiersFromT100Minor(t100Minor, deriveMult)
        const pricesForPriceSet = buildPricesForPriceSet(tiers)
        const existingMeta = (vrow.metadata ?? {}) as Record<string, unknown>
        const nextMetadata: Record<string, unknown> = {
          ...existingMeta,
          bulk_pricing: buildTierMetadata(tiers),
          dnc_cost_price_ex_gst_minor: costMinor,
          // Canonical ex-GST cost in minor units — read by the tier-pricing
          // regen job. See `backend/src/lib/customer-tiers.ts`.
          cost_price_ex_gst_minor: costMinor,
        }

        const priceSetId = vrow.price_set?.id
        if (priceSetId) {
          await pricingModuleService.upsertPriceSets([{ id: priceSetId, prices: pricesForPriceSet }])
        } else {
          const createdPriceSets = (await pricingModuleService.upsertPriceSets([
            { prices: pricesForPriceSet },
          ])) as Array<{ id?: string }>
          const newId = createdPriceSets[0]?.id
          if (!newId) {
            throw new Error(`Failed to create price set for variant ${vrow.id}`)
          }
          await link.create({
            [Modules.PRODUCT]: { variant_id: vrow.id },
            [Modules.PRICING]: { price_set_id: newId },
          })
        }
        await productModuleService.updateProductVariants(vrow.id, { metadata: nextMetadata })
      }
    }
    logger.info(`Created batch: ${batch.map((b) => b.handle).join(", ")}`)
  }

  logger.info(
    `Import finished. Created ${toCreate.length} product(s). Post-import: revalidate storefront cache; reindex Meilisearch if used.`
  )
}
