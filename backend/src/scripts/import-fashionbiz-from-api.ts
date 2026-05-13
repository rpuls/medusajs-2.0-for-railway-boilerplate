/**
 * FashionBiz catalog import.
 *
 * Mirrors the AS Colour script. Pulls every product for the requested
 * FashionBiz brands via the public v3 API, creates Medusa products +
 * variants (one per colour/size), links them to the right Brand entity,
 * and seeds initial inventory levels at the "FashionBiz Warehouse"
 * stock location.
 *
 * Usage:
 *   IMPORT_BRANDS=biz-collection,syzmik IMPORT_LIMIT=5 IMPORT_DRY_RUN=1 \
 *     pnpm --filter backend medusa exec import-fashionbiz-from-api
 *
 * Env vars (medusa exec eats `--flags` via yargs, so env is canonical):
 *   IMPORT_LIMIT    — cap products per brand
 *   IMPORT_DRY_RUN  — 1/true to log only, no DB writes
 *   IMPORT_BRANDS   — comma-separated subset of:
 *                     biz-collection, biz-care, biz-corporates, syzmik
 *                     Default: all four.
 *
 * Idempotency: create-only, keyed by handle (`{brand}-{slug}`). Existing
 * handles are skipped. Re-importing to update an existing product is a
 * follow-up.
 */

import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createProductsWorkflow,
  createInventoryLevelsWorkflow,
  updateInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows"
import { FASHIONBIZ_MODULE } from "../modules/fashionbiz"
import FashionBizService from "../modules/fashionbiz/service"
import {
  FashionBizBrandSlug,
  FashionBizColour,
  FashionBizProduct,
} from "../modules/fashionbiz/types"
import { priceLadderFromFashionBiz } from "../modules/fashionbiz/pricing"
import { buildBulkPricingMetadata } from "../utils/bulk-price-ladder"
import {
  buildGarmentImagesForColour,
  collectImageUrls,
  handleForProduct,
  renderDescription,
  titleCase,
} from "../modules/fashionbiz/mapping"
import { BRAND_MODULE } from "../modules/brand"

const PRICE_CURRENCY_CODE = "aud"
const FASHIONBIZ_LOCATION_NAME = "FashionBiz Warehouse"

/**
 * FashionBiz brand slug -> Brand entity handle. The Brand rows for these
 * handles are already seeded by migrate-products-to-brand-entity.ts; if
 * any are missing we hard-fail rather than auto-create, because parenting
 * (under FashionBiz) is set by the migration and we don't want to
 * accidentally orphan them.
 */
const BRAND_HANDLE_BY_FASHIONBIZ_SLUG: Record<FashionBizBrandSlug, string> = {
  "biz-collection": "biz-collection",
  "biz-care": "biz-care",
  "biz-corporates": "biz-corporates",
  syzmik: "syzmik",
  "good-mates": "good-mates", // not used in the default first-pass set
}

const DEFAULT_BRANDS: FashionBizBrandSlug[] = [
  "biz-collection",
  "biz-care",
  "biz-corporates",
  "syzmik",
]

/** Sleep helper for between-request throttling. */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function parseBrandsEnv(value: string | undefined): FashionBizBrandSlug[] {
  if (!value) return DEFAULT_BRANDS
  const valid = new Set<FashionBizBrandSlug>([
    "biz-collection",
    "biz-care",
    "biz-corporates",
    "syzmik",
    "good-mates",
  ])
  const requested = value
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean) as FashionBizBrandSlug[]
  const filtered = requested.filter((b) => valid.has(b))
  if (!filtered.length) return DEFAULT_BRANDS
  return filtered
}

export default async function importFashionBizFromApi({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  let fashionbiz: FashionBizService
  try {
    fashionbiz = container.resolve(FASHIONBIZ_MODULE) as FashionBizService
  } catch {
    logger.error(
      "FashionBiz module not registered — set FASHIONBIZ_API_TOKEN and restart."
    )
    return
  }

  const flags = new Set(args ?? [])
  const limitArg = (args ?? []).find((a) => a.startsWith("--limit="))
  const envLimit = process.env.IMPORT_LIMIT
  const limit = limitArg
    ? Number.parseInt(limitArg.split("=")[1], 10)
    : envLimit
      ? Number.parseInt(envLimit, 10)
      : undefined
  const dryRun =
    flags.has("--dry-run") ||
    process.env.IMPORT_DRY_RUN === "1" ||
    process.env.IMPORT_DRY_RUN === "true"
  const brands = parseBrandsEnv(process.env.IMPORT_BRANDS)
  const costAdjustment = fashionbiz.getCostAdjustment()

  logger.info(
    `FashionBiz import — brands=[${brands.join(", ")}], limit=${limit ?? "all"}, dryRun=${dryRun}, costAdjustment=${costAdjustment}`
  )
  if (costAdjustment === 1.0) {
    logger.warn(
      "FASHIONBIZ_COST_ADJUSTMENT is 1.0 — using raw API '1-99' tier price as cost. The distributor storefront typically charges ~15% above this; set FASHIONBIZ_COST_ADJUSTMENT=1.15 to match."
    )
  }

  // Common dependencies
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL) as any
  const fulfillmentService = container.resolve(Modules.FULFILLMENT) as any
  const stockLocationService = container.resolve(Modules.STOCK_LOCATION) as any
  const brandService = container.resolve(BRAND_MODULE) as any

  const salesChannels = await salesChannelService.listSalesChannels({
    name: "Default Sales Channel",
  })
  if (!salesChannels.length) throw new Error("Default Sales Channel not found")
  const defaultSalesChannelId = salesChannels[0].id

  const shippingProfiles = await fulfillmentService.listShippingProfiles({ type: "default" })
  if (!shippingProfiles.length) throw new Error("Default shipping profile not found")
  const shippingProfileId = shippingProfiles[0].id

  // Stock location for FashionBiz-managed stock
  let locationId: string | null = null
  const existingLocations = await stockLocationService.listStockLocations({
    name: FASHIONBIZ_LOCATION_NAME,
  })
  if (existingLocations.length) {
    locationId = existingLocations[0].id
  } else if (!dryRun) {
    const created = await stockLocationService.createStockLocations({
      name: FASHIONBIZ_LOCATION_NAME,
    })
    locationId = Array.isArray(created) ? created[0].id : created.id
    logger.info(`Created stock location ${FASHIONBIZ_LOCATION_NAME} (${locationId})`)
  }

  // Resolve Brand entities by handle. Hard-fail with a clear message if any
  // requested brand isn't seeded — the migration is supposed to create them.
  const allBrands = (await brandService.listBrands({})) as Array<{
    id: string
    name: string
    handle: string
  }>
  const brandIdByFashionBizSlug: Partial<Record<FashionBizBrandSlug, string>> = {}
  for (const slug of brands) {
    const targetHandle = BRAND_HANDLE_BY_FASHIONBIZ_SLUG[slug]
    const brand = allBrands.find((b) => (b.handle ?? "").toLowerCase() === targetHandle)
    if (!brand) {
      throw new Error(
        `Brand "${targetHandle}" missing. Run \`pnpm medusa exec migrate-products-to-brand-entity -- --apply\` first.`
      )
    }
    brandIdByFashionBizSlug[slug] = brand.id
  }

  type CreatedProductContext = {
    brand: FashionBizBrandSlug
    slug: string
    productPayload: any
    colourNames: string[]
  }
  const toCreate: any[] = []
  const created: CreatedProductContext[] = []

  // Skip-list: existing handles across all brands in scope. We collect all
  // candidate handles up front, then check against Medusa in one graph
  // query per brand batch (cheaper than per-product).
  type BrandBatch = {
    brand: FashionBizBrandSlug
    products: FashionBizProduct[]
  }
  const batches: BrandBatch[] = []

  // 1. Fetch product lists per brand
  for (const brand of brands) {
    logger.info(`Fetching ${brand} catalog…`)
    let stubs = await fashionbiz.fetchAllProductsForBrand(brand)
    if (limit) stubs = stubs.slice(0, limit)
    logger.info(`  ${brand}: ${stubs.length} products`)

    // 2. Fetch detail per product, throttled
    const details: FashionBizProduct[] = []
    for (const stub of stubs) {
      try {
        const detail = await fashionbiz.fetchProductDetail(brand, stub.slug)
        details.push(detail)
      } catch (err: any) {
        logger.warn(`Failed to fetch ${brand}/${stub.slug}: ${err?.message ?? err}`)
      }
      await sleep(200) // ~5 req/sec
    }
    batches.push({ brand, products: details })
  }

  // 3. Existing-handle skip-list (one query per brand)
  for (const batch of batches) {
    const handles = batch.products.map((p) => handleForProduct(batch.brand, p.slug))
    const { data: existing } = await query.graph({
      entity: "product",
      fields: ["id", "handle"],
      filters: { handle: handles },
    })
    const existingHandles = new Set((existing ?? []).map((p: any) => p.handle))

    // 4. Build create payloads
    for (const product of batch.products) {
      const handle = handleForProduct(batch.brand, product.slug)
      if (existingHandles.has(handle)) {
        logger.info(`  Skipping existing handle ${handle}`)
        continue
      }

      const ladder = priceLadderFromFashionBiz(product.prices, costAdjustment)
      if (!ladder) {
        logger.warn(
          `  ${batch.brand}/${product.slug}: no usable prices — skipping (FashionBiz returned ${product.prices?.length ?? 0} tiers)`
        )
        continue
      }

      const colours = (product.colors ?? []).filter(
        (c): c is FashionBizColour => !!c && (c.sizes?.length ?? 0) > 0
      )
      if (!colours.length) {
        logger.warn(`  ${batch.brand}/${product.slug}: no colours with sizes — skipping`)
        continue
      }

      const sizes = new Set<string>()
      const colourNames = new Set<string>()
      for (const c of colours) {
        colourNames.add(c.name)
        for (const s of c.sizes ?? []) {
          if (s.size) sizes.add(s.size)
        }
      }
      const hasSize = sizes.size > 0
      const hasColour = colourNames.size > 0

      const options: { title: string; values: string[] }[] = []
      if (hasColour) options.push({ title: "Colour", values: Array.from(colourNames) })
      if (hasSize) options.push({ title: "Size", values: Array.from(sizes) })
      if (!options.length) options.push({ title: "Default", values: ["Default"] })

      const productImages = collectImageUrls(product).map((url) => ({ url }))
      const thumbnail = productImages[0]?.url

      // One variant per (colour, size). The same SKU appearing twice in
      // the API (defensively) is skipped to keep Medusa happy.
      const productVariants: any[] = []
      const seenSkus = new Set<string>()
      for (const colour of colours) {
        for (const size of colour.sizes ?? []) {
          if (!size.sku || seenSkus.has(size.sku)) continue
          seenSkus.add(size.sku)

          const variantOptions: Record<string, string> = {}
          if (hasColour) variantOptions["Colour"] = colour.name
          if (hasSize) variantOptions["Size"] = size.size
          if (!hasColour && !hasSize) variantOptions["Default"] = "Default"

          const titleParts = [colour.name, size.size].filter(Boolean)
          const variantTitle = titleParts.join(" / ") || size.sku

          productVariants.push({
            title: variantTitle,
            sku: size.sku,
            manage_inventory: true,
            allow_backorder: false,
            options: variantOptions,
            prices: [
              { amount: ladder.base, currency_code: PRICE_CURRENCY_CODE, min_quantity: 1, max_quantity: 9 },
              { amount: ladder.tier10to19, currency_code: PRICE_CURRENCY_CODE, min_quantity: 10, max_quantity: 19 },
              { amount: ladder.tier20to49, currency_code: PRICE_CURRENCY_CODE, min_quantity: 20, max_quantity: 49 },
              { amount: ladder.tier50to99, currency_code: PRICE_CURRENCY_CODE, min_quantity: 50, max_quantity: 99 },
              { amount: ladder.tier100Plus, currency_code: PRICE_CURRENCY_CODE, min_quantity: 100 },
            ],
            metadata: {
              fashionbiz: {
                product_id: product.id,
                product_slug: product.slug,
                product_code: product.code,
                color_id: colour.id,
                color_name: colour.name,
                size_id: size.id,
                size: size.size,
                hex_value: colour.hex_value ?? colour.tag_value ?? null,
              },
              bulk_pricing: buildBulkPricingMetadata(ladder),
              raw_prices: product.prices ?? [],
              cost_adjustment: costAdjustment,
              garment_images: buildGarmentImagesForColour(colour),
              garment_color: colour.name,
            },
          })
        }
      }

      if (!productVariants.length) {
        logger.warn(`  ${batch.brand}/${product.slug}: no variants after dedupe — skipping`)
        continue
      }

      const title = product.name ? titleCase(product.name) : `FashionBiz ${product.code}`

      const productPayload: any = {
        title,
        handle,
        status: ProductStatus.PUBLISHED,
        description: renderDescription(product.description),
        thumbnail,
        material: product.fabric ?? undefined,
        images: productImages,
        options,
        variants: productVariants,
        shipping_profile_id: shippingProfileId,
        sales_channels: [{ id: defaultSalesChannelId }],
        metadata: {
          source: "fashionbiz",
          fashionbiz: {
            id: product.id,
            slug: product.slug,
            code: product.code,
            brand_slug: batch.brand,
            sales_status: product.sales_status,
            tags: product.tags ?? [],
            fit: product.fit,
            gender: product.gender,
            sleeve: product.sleeve,
            industry: product.industry,
            tech: product.tech,
            seo_title: product.seo_title,
            seo_metadesc: product.seo_metadesc,
            seo_focuskw: product.seo_focuskw,
            stylesheet: product.stylesheet,
            catwalk_url: product.catwalk_url,
            last_sync: new Date().toISOString(),
          },
        },
        // SEO fields if Medusa supports them on product create (they're
        // stored in metadata above too, so safe either way).
      }

      toCreate.push(productPayload)
      created.push({
        brand: batch.brand,
        slug: product.slug,
        productPayload,
        colourNames: Array.from(colourNames),
      })
    }
  }

  logger.info(`Prepared ${toCreate.length} products for creation.`)

  if (dryRun) {
    logger.info("Dry run — skipping createProductsWorkflow + inventory seed.")
    if (toCreate.length) {
      const sample = toCreate[0]
      logger.info(
        `Sample payload: handle=${sample.handle}, variants=${sample.variants.length}, base price=$${(sample.variants[0]?.prices?.[0]?.amount ?? 0) / 100}`
      )
    }
    return
  }

  if (!toCreate.length) {
    logger.info("Nothing to create.")
    return
  }

  // 5. Create products
  const { result } = await createProductsWorkflow(container).run({
    input: { products: toCreate },
  })
  const createdProducts = (result as any[]) ?? []
  logger.info(`Created ${createdProducts.length} products.`)

  // 5b. Link each created product to the right Brand. We rebuild the
  // brand-id-by-handle map keyed by Medusa product handle so we don't
  // depend on creation order.
  const link = container.resolve(ContainerRegistrationKeys.LINK) as any
  const handleToBrandId = new Map<string, string>()
  for (const ctx of created) {
    const brandId = brandIdByFashionBizSlug[ctx.brand]
    if (!brandId) continue
    handleToBrandId.set(ctx.productPayload.handle, brandId)
  }
  let linkOk = 0
  let linkFail = 0
  for (const p of createdProducts) {
    const brandId = handleToBrandId.get(p.handle)
    if (!brandId) continue
    try {
      // Dismiss any stale link first (survives soft-delete of previous product)
      // then create fresh. dismiss() is a no-op when no link exists.
      await link.dismiss({
        [Modules.PRODUCT]: { product_id: p.id },
        [BRAND_MODULE]: { brand_id: brandId },
      })
      await link.create({
        [Modules.PRODUCT]: { product_id: p.id },
        [BRAND_MODULE]: { brand_id: brandId },
      })
      linkOk++
    } catch (err: any) {
      linkFail++
      logger.warn(`Failed to link product ${p.id} (${p.handle}) to brand: ${err?.message ?? err}`)
    }
  }
  logger.info(`Linked ${linkOk} product(s) to brand (${linkFail} failed).`)

  // 6. Seed inventory levels at the FashionBiz Warehouse
  if (!locationId) {
    logger.warn("FashionBiz stock location missing; skipping inventory seed.")
    return
  }

  // Build a stock map by calling /stock for every (brand, slug, colour) tuple.
  const stockBySku = new Map<string, number>()
  const productByHandle = new Map<string, CreatedProductContext>()
  for (const ctx of created) productByHandle.set(ctx.productPayload.handle, ctx)
  for (const p of createdProducts) {
    const ctx = productByHandle.get(p.handle)
    if (!ctx) continue
    for (const colourName of ctx.colourNames) {
      try {
        const stockResp = await fashionbiz.fetchStock(ctx.brand, ctx.slug, colourName)
        for (const item of stockResp.items ?? []) {
          if (!item.sku) continue
          const total = (item.stock ?? []).reduce((a, s) => a + (s.qtyAvailable ?? 0), 0)
          stockBySku.set(item.sku, total)
        }
      } catch (err: any) {
        logger.warn(
          `Stock fetch failed for ${ctx.brand}/${ctx.slug}/${colourName}: ${err?.message ?? err}`
        )
      }
      await sleep(200)
    }
  }

  const targetSkus = Array.from(stockBySku.keys())
  if (!targetSkus.length) {
    logger.info("No stock data returned — leaving inventory levels at zero.")
    logger.info("FashionBiz API import complete.")
    return
  }

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
    filters: { sku: targetSkus },
  })
  const inventoryIds = (inventoryItems ?? []).map((i: any) => i.id)
  const { data: existingLevels } = await query.graph({
    entity: "inventory_level",
    fields: ["id", "inventory_item_id", "location_id"],
    filters: { inventory_item_id: inventoryIds, location_id: locationId },
  })
  const haveLevel = new Set(
    (existingLevels ?? []).map((l: any) => l.inventory_item_id)
  )

  const updates: { inventory_item_id: string; location_id: string; stocked_quantity: number }[] = []
  const creates: { inventory_item_id: string; location_id: string; stocked_quantity: number }[] = []
  for (const item of inventoryItems ?? []) {
    const qty = stockBySku.get(item.sku) ?? 0
    const payload = { inventory_item_id: item.id, location_id: locationId, stocked_quantity: qty }
    if (haveLevel.has(item.id)) updates.push(payload)
    else creates.push(payload)
  }

  if (creates.length) {
    await createInventoryLevelsWorkflow(container).run({
      input: { inventory_levels: creates },
    })
    logger.info(`Created ${creates.length} inventory levels.`)
  }
  if (updates.length) {
    await updateInventoryLevelsWorkflow(container).run({
      input: { updates },
    })
    logger.info(`Updated ${updates.length} inventory levels.`)
  }

  logger.info("FashionBiz API import complete.")
}
