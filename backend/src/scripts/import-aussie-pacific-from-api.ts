/**
 * Aussie Pacific catalog import.
 *
 * Mirrors the FashionBiz script. Pulls every product from the AP Public
 * API v1 (https://api.aussiepacific.com.au), creates Medusa products +
 * variants (one per colour/size), links them to the pre-seeded
 * `Aussie Pacific` Brand entity, and seeds initial inventory levels at
 * the "Aussie Pacific Warehouse" stock location.
 *
 * Usage:
 *   IMPORT_LIMIT=5 IMPORT_DRY_RUN=1 \
 *     pnpm --filter backend medusa exec import-aussie-pacific-from-api
 *
 * Env vars:
 *   IMPORT_LIMIT    — cap number of products
 *   IMPORT_DRY_RUN  — 1/true to log only, no DB writes
 *
 * Idempotency: create-only, keyed by handle (`aussie-pacific-{style_code}`).
 * Existing handles are skipped. Re-importing to update an existing product
 * is a planned follow-up.
 *
 * Pricing note: AP returns a single wholesale `price` per variant. We
 * assume this is ex-GST cost (same convention as AS Colour and the
 * FashionBiz "1-99" tier) and feed it through `buildPriceLadder()` to
 * produce the standard 5-tier retail ladder. The first 5 styles emit a
 * calibration log line so the operator can sanity-check the assumption
 * before running a full import.
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
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"
import { AUSSIEPACIFIC_MODULE } from "../modules/aussiepacific"
import AussiePacificService from "../modules/aussiepacific/service"
import {
  AussiePacificProduct,
  AussiePacificVariant,
} from "../modules/aussiepacific/types"
import { priceLadderFromAussiePacific } from "../modules/aussiepacific/pricing"
import type { PriceLadder } from "../utils/bulk-price-ladder"
import {
  tierMinorToPriceSetRows,
  tierMinorToBulkPricingMetadata,
  type TierMoneyMinor,
} from "../utils/bulk-tier-prices"
import {
  buildGarmentImagesForVariant,
  collectImageUrls,
  handleForProduct,
  imageUrl,
  normalizeStockLevel,
  titleCase,
  toArray,
} from "../modules/aussiepacific/mapping"
import { BRAND_MODULE } from "../modules/brand"
import { classifyAussiePacificProduct } from "../lib/product-taxonomy"
import {
  fetchAllProductTypes,
  fetchAllProductTags,
  applyTypeAndTagsToProduct,
} from "../lib/product-type-tag-sync"

const PRICE_CURRENCY_CODE = "aud"
const AUSSIEPACIFIC_LOCATION_NAME = "Aussie Pacific Warehouse"
const AUSSIEPACIFIC_BRAND_HANDLE = "aussie-pacific"
const CALIBRATION_LOG_LIMIT = 5

const ladderToTierMinor = (ladder: PriceLadder): TierMoneyMinor => ({
  t1_9: Math.round(ladder.base * 100),
  t10_19: Math.round(ladder.tier10to19 * 100),
  t20_49: Math.round(ladder.tier20to49 * 100),
  t50_99: Math.round(ladder.tier50to99 * 100),
  t100_plus: Math.round(ladder.tier100Plus * 100),
})

/**
 * Per-variant ladder. AP gives one price per variant, and the cost may
 * vary across SKUs of one style — same pattern as AS Colour. Track the
 * cheapest variant ladder for product-level `bulk_pricing` metadata.
 */
type VariantLadderResult = {
  ladder: PriceLadder
  cost: number
  tierMinor: TierMoneyMinor
}

export default async function importAussiePacificFromApi({
  container,
  args,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  let ap: AussiePacificService
  try {
    ap = container.resolve(AUSSIEPACIFIC_MODULE) as AussiePacificService
  } catch {
    logger.error(
      "Aussie Pacific module not registered — set AUSSIE_PACIFIC_API_TOKEN and restart."
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
  const costAdjustment = ap.getCostAdjustment()

  logger.info(
    `Aussie Pacific import — limit=${limit ?? "all"}, dryRun=${dryRun}, costAdjustment=${costAdjustment}`
  )
  if (costAdjustment === 1.0) {
    logger.info(
      "AUSSIE_PACIFIC_COST_ADJUSTMENT is 1.0 — treating API `price` as ex-GST cost. Calibrate by inspecting the first invoice."
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

  const shippingProfiles = await fulfillmentService.listShippingProfiles({
    type: "default",
  })
  if (!shippingProfiles.length) throw new Error("Default shipping profile not found")
  const shippingProfileId = shippingProfiles[0].id

  // Stock location for AP-managed stock
  let locationId: string | null = null
  const existingLocations = await stockLocationService.listStockLocations({
    name: AUSSIEPACIFIC_LOCATION_NAME,
  })
  if (existingLocations.length) {
    locationId = existingLocations[0].id
  } else if (!dryRun) {
    const created = await stockLocationService.createStockLocations({
      name: AUSSIEPACIFIC_LOCATION_NAME,
    })
    locationId = Array.isArray(created) ? created[0].id : created.id
    logger.info(
      `Created stock location ${AUSSIEPACIFIC_LOCATION_NAME} (${locationId})`
    )
  }

  if (locationId && !dryRun) {
    const allChannels = (await salesChannelService.listSalesChannels(
      {},
      { take: 500 }
    )) as Array<{ id: string }>
    const channelIds = allChannels.map((c) => c.id)
    if (channelIds.length > 0) {
      await linkSalesChannelsToStockLocationWorkflow(container).run({
        input: { id: locationId, add: channelIds },
      })
      logger.info(
        `Linked ${channelIds.length} sales channel(s) to ${AUSSIEPACIFIC_LOCATION_NAME}`
      )
    }
  }

  // Resolve Brand entity. Hard-fail if missing — the migration is supposed
  // to seed it ahead of time.
  const allBrands = (await brandService.listBrands({})) as Array<{
    id: string
    name: string
    handle: string
  }>
  const apBrand = allBrands.find(
    (b) => (b.handle ?? "").toLowerCase() === AUSSIEPACIFIC_BRAND_HANDLE
  )
  if (!apBrand) {
    throw new Error(
      `Brand "${AUSSIEPACIFIC_BRAND_HANDLE}" missing. Run \`pnpm medusa exec migrate-products-to-brand-entity -- --apply\` first.`
    )
  }

  // 1. Fetch all products
  logger.info("Fetching Aussie Pacific catalog…")
  let products = await ap.fetchAllProducts()
  if (limit) products = products.slice(0, limit)
  logger.info(`Fetched ${products.length} product(s).`)

  // One-time debug log of the first product's shape so we can see what AP
  // actually returns vs what the docs imply. Only fires when dryRun + a
  // product was fetched.
  if (dryRun && products[0]) {
    const sample = products[0] as any
    const keys = Object.keys(sample)
    const variantsType = Array.isArray(sample.variants)
      ? `array(${sample.variants.length})`
      : sample.variants && typeof sample.variants === "object"
        ? `object(keys=${Object.keys(sample.variants).slice(0, 5).join(",")})`
        : typeof sample.variants
    const imagesType = Array.isArray(sample.images)
      ? `array(${sample.images.length})`
      : sample.images && typeof sample.images === "object"
        ? `object(keys=${Object.keys(sample.images).slice(0, 5).join(",")})`
        : typeof sample.images
    logger.info(
      `[debug] first product shape: keys=[${keys.join(",")}], variants=${variantsType}, images=${imagesType}`
    )
    // First variant shape (if any)
    const firstVariant = Array.isArray(sample.variants)
      ? sample.variants[0]
      : sample.variants && typeof sample.variants === "object"
        ? Object.values(sample.variants)[0]
        : null
    if (firstVariant) {
      logger.info(
        `[debug] first variant shape: keys=[${Object.keys(firstVariant as object).join(",")}], sample=${JSON.stringify(firstVariant).slice(0, 500)}`
      )
    }
  }

  // 2. Existing-handle skip-list
  const allHandles = products.map((p) => handleForProduct(p.style_code))
  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: allHandles },
  })
  const existingHandles = new Set((existing ?? []).map((p: any) => p.handle))

  type CreatedProductContext = {
    styleCode: string
    productPayload: any
    skus: string[]
    apProduct: AussiePacificProduct
  }
  const toCreate: any[] = []
  const created: CreatedProductContext[] = []
  const stockBySkuFromCatalog = new Map<string, number>()
  let calibrationLogged = 0

  for (const product of products) {
    if (!product.style_code) {
      logger.warn(`Skipping product "${product.name}" — no style_code`)
      continue
    }
    const handle = handleForProduct(product.style_code)
    if (existingHandles.has(handle)) {
      logger.info(`  Skipping existing handle ${handle}`)
      continue
    }

    const variants = toArray<AussiePacificVariant>(product.variants).filter(
      (v): v is AussiePacificVariant => !!v?.sku
    )
    if (!variants.length) {
      logger.warn(`  ${product.style_code}: no variants — skipping`)
      continue
    }

    // Per-variant ladders. AP returns one price per variant, and the cost
    // can vary across SKUs in a style — same pattern as AS Colour.
    const ladderBySku = new Map<string, VariantLadderResult>()
    let cheapest: VariantLadderResult | null = null
    for (const v of variants) {
      const ladder = priceLadderFromAussiePacific(v.price, costAdjustment)
      if (!ladder) continue
      const cost = Number(v.price) * costAdjustment
      const tierMinor = ladderToTierMinor(ladder)
      const result: VariantLadderResult = { ladder, cost, tierMinor }
      ladderBySku.set(v.sku, result)
      if (!cheapest || cost < cheapest.cost) cheapest = result
    }
    if (!cheapest) {
      logger.warn(
        `  ${product.style_code}: no usable prices on any variant — skipping`
      )
      continue
    }

    // Calibration log — first 5 styles only
    if (calibrationLogged < CALIBRATION_LOG_LIMIT) {
      const sampleSku = variants[0].sku
      const sample = ladderBySku.get(sampleSku) ?? cheapest
      logger.info(
        `  [calibration] ${product.style_code}/${sampleSku}: api_price=${variants[0].price}, ` +
          `cost_after_adjustment=${sample.cost.toFixed(2)}, ` +
          `tier_1_9=${sample.ladder.base}, tier_100_plus=${sample.ladder.tier100Plus}`
      )
      calibrationLogged++
    }

    const colourSet = new Set<string>()
    const sizeSet = new Set<string>()
    for (const v of variants) {
      if (v.colour) colourSet.add(v.colour)
      if (v.size) sizeSet.add(v.size)
    }
    const hasColour = colourSet.size > 0
    const hasSize = sizeSet.size > 0 && !(sizeSet.size === 1 && sizeSet.has("OS"))

    const options: { title: string; values: string[] }[] = []
    if (hasColour) options.push({ title: "Colour", values: Array.from(colourSet) })
    if (hasSize) options.push({ title: "Size", values: Array.from(sizeSet) })
    if (!options.length) options.push({ title: "Default", values: ["Default"] })

    const productImages = collectImageUrls(product).map((url) => ({ url }))
    const thumbnail = productImages[0]?.url

    const productVariants: any[] = []
    const variantSkus: string[] = []
    const seenSkus = new Set<string>()
    for (const v of variants) {
      if (seenSkus.has(v.sku)) continue
      seenSkus.add(v.sku)
      const ladderResult = ladderBySku.get(v.sku)
      if (!ladderResult) {
        logger.warn(
          `    ${product.style_code}/${v.sku}: no usable price — skipping variant`
        )
        continue
      }

      const variantOptions: Record<string, string> = {}
      if (hasColour && v.colour) variantOptions["Colour"] = v.colour
      if (hasSize && v.size) variantOptions["Size"] = v.size
      if (!hasColour && !hasSize) variantOptions["Default"] = "Default"

      const titleParts = [v.colour, v.size].filter(Boolean)
      const variantTitle = (titleParts.join(" / ") as string) || v.sku

      const variantImageUrl = imageUrl(toArray<any>(v.images)[0])

      productVariants.push({
        title: variantTitle,
        sku: v.sku,
        barcode: v.barcode || undefined,
        manage_inventory: true,
        allow_backorder: false,
        options: variantOptions,
        prices: tierMinorToPriceSetRows(ladderResult.tierMinor, PRICE_CURRENCY_CODE),
        metadata: {
          aussiepacific: {
            style_code: product.style_code,
            sku: v.sku,
            colour: v.colour ?? null,
            size: v.size ?? null,
            barcode: v.barcode ?? null,
            api_price: v.price ?? null,
          },
          bulk_pricing: tierMinorToBulkPricingMetadata(
            ladderResult.tierMinor,
            "aussiepacific-api"
          ),
          cost_adjustment: costAdjustment,
          garment_images: buildGarmentImagesForVariant(v),
          garment_color: v.colour ?? null,
        },
      })
      variantSkus.push(v.sku)
      stockBySkuFromCatalog.set(v.sku, normalizeStockLevel(v.stock_level))
    }

    if (!productVariants.length) {
      logger.warn(`  ${product.style_code}: no variants after pricing — skipping`)
      continue
    }

    const title = product.name ? titleCase(product.name) : `Aussie Pacific ${product.style_code}`

    const productPayload: any = {
      title,
      handle,
      status: product.run_out ? ProductStatus.DRAFT : ProductStatus.PUBLISHED,
      description: product.description ?? "",
      thumbnail,
      images: productImages,
      options,
      variants: productVariants,
      shipping_profile_id: shippingProfileId,
      sales_channels: [{ id: defaultSalesChannelId }],
      metadata: {
        source: "aussiepacific",
        aussiepacific: {
          style_code: product.style_code,
          style: product.style,
          main_category: product.main_category,
          sub_category: product.sub_category,
          brand_label: product.brand,
          run_out: product.run_out ?? false,
          last_sync: new Date().toISOString(),
        },
        bulk_pricing: tierMinorToBulkPricingMetadata(
          cheapest.tierMinor,
          "aussiepacific-api"
        ),
      },
    }

    toCreate.push(productPayload)
    created.push({
      styleCode: product.style_code,
      productPayload,
      skus: variantSkus,
      apProduct: product,
    })
  }

  logger.info(`Prepared ${toCreate.length} product(s) for creation.`)

  if (dryRun) {
    logger.info("Dry run — skipping createProductsWorkflow + inventory seed.")
    if (toCreate.length) {
      const sample = toCreate[0]
      logger.info(
        `Sample payload: handle=${sample.handle}, variants=${sample.variants.length}, base price=$${(sample.variants[0]?.prices?.[0]?.amount ?? 0)}`
      )
    }
    return
  }

  if (!toCreate.length) {
    logger.info("Nothing to create.")
    return
  }

  // 3. Create products
  const { result } = await createProductsWorkflow(container).run({
    input: { products: toCreate },
  })
  const createdProducts = (result as any[]) ?? []
  logger.info(`Created ${createdProducts.length} product(s).`)

  // 3b. Apply product_type + tags via taxonomy
  {
    const productModule = container.resolve(Modules.PRODUCT) as any
    const typeCache = await fetchAllProductTypes(productModule)
    const tagCache = await fetchAllProductTags(productModule)
    const unknownTaxonomy: string[] = []

    const apByHandle = new Map<string, AussiePacificProduct>()
    for (const ctx of created) {
      apByHandle.set(ctx.productPayload.handle, ctx.apProduct)
    }

    let typeTagOk = 0
    let typeTagFail = 0
    for (const p of createdProducts) {
      const apProduct = apByHandle.get((p as any).handle)
      if (!apProduct) continue
      const extraTags: string[] = apProduct.run_out ? ["Discontinued"] : []
      const { productType, tags } = classifyAussiePacificProduct(
        apProduct,
        unknownTaxonomy
      )
      const combinedTags = Array.from(new Set([...tags, ...extraTags]))
      if (!productType && !combinedTags.length) continue
      try {
        await applyTypeAndTagsToProduct({
          productModule,
          productId: (p as any).id,
          productType,
          tags: combinedTags,
          typeCache,
          tagCache,
        })
        typeTagOk++
      } catch (err: any) {
        typeTagFail++
        logger.warn(
          `Failed to set type/tags for ${(p as any).handle}: ${err?.message ?? err}`
        )
      }
    }
    for (const msg of unknownTaxonomy) logger.warn(`[taxonomy] ${msg}`)
    logger.info(`Type/tag sync: ${typeTagOk} ok, ${typeTagFail} failed.`)
  }

  // 3c. Link each created product to the Aussie Pacific brand
  const link = container.resolve(ContainerRegistrationKeys.LINK) as any
  let linkOk = 0
  let linkFail = 0
  for (const p of createdProducts) {
    try {
      await link.create({
        [Modules.PRODUCT]: { product_id: p.id },
        [BRAND_MODULE]: { brand_id: apBrand.id },
      })
      linkOk++
    } catch (err: any) {
      if (err?.message?.includes("Cannot create multiple links")) {
        linkOk++
      } else {
        linkFail++
        logger.warn(
          `Failed to link product ${p.id} (${p.handle}) to brand: ${err?.message ?? err}`
        )
      }
    }
  }
  logger.info(`Linked ${linkOk} product(s) to brand (${linkFail} failed).`)

  // 3d. Force-patch garment_images on restored variants.
  // Mirrors the FashionBiz importer — if Medusa restores a soft-deleted
  // product (same handle), it keeps the old variants and ignores the new
  // metadata on the payload.
  {
    const patchBySku = new Map<
      string,
      { garment_images: any; garment_color: string | null }
    >()
    for (const payload of toCreate) {
      for (const v of payload.variants ?? []) {
        if (v.sku && v.metadata?.garment_images) {
          patchBySku.set(v.sku, {
            garment_images: v.metadata.garment_images,
            garment_color: v.metadata.garment_color ?? null,
          })
        }
      }
    }

    if (patchBySku.size > 0) {
      const productModuleService = container.resolve(Modules.PRODUCT) as any
      if (typeof productModuleService.updateProductVariants === "function") {
        const skus = Array.from(patchBySku.keys())
        const { data: dbVariants } = await query.graph({
          entity: "product_variant",
          fields: ["id", "sku", "metadata"],
          filters: { sku: skus },
        })
        let patchCount = 0
        for (const dbv of dbVariants ?? []) {
          const sku = (dbv as any).sku as string
          const patch = patchBySku.get(sku)
          if (!patch) continue
          const existingMeta = ((dbv as any).metadata ?? {}) as Record<string, any>
          if (existingMeta.garment_images?.front) continue
          await productModuleService.updateProductVariants((dbv as any).id, {
            metadata: { ...existingMeta, ...patch },
          })
          patchCount++
        }
        if (patchCount > 0) {
          logger.info(`Patched garment_images on ${patchCount} restored variant(s).`)
        }
      }
    }
  }

  // 4. Seed inventory levels at the Aussie Pacific Warehouse
  if (!locationId) {
    logger.warn("Aussie Pacific stock location missing; skipping inventory seed.")
    return
  }

  const targetSkus = Array.from(stockBySkuFromCatalog.keys())
  if (!targetSkus.length) {
    logger.info("No SKUs to seed inventory for.")
    logger.info("Aussie Pacific API import complete.")
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

  const updates: {
    inventory_item_id: string
    location_id: string
    stocked_quantity: number
  }[] = []
  const creates: {
    inventory_item_id: string
    location_id: string
    stocked_quantity: number
  }[] = []
  for (const item of inventoryItems ?? []) {
    const qty = stockBySkuFromCatalog.get(item.sku) ?? 0
    const payload = {
      inventory_item_id: item.id,
      location_id: locationId,
      stocked_quantity: qty,
    }
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

  logger.info("Aussie Pacific API import complete.")
}
