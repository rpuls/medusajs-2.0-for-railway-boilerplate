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
import { ASCOLOUR_MODULE } from "../modules/ascolour"
import AsColourService from "../modules/ascolour/service"
import {
  AsColourImage,
  AsColourInventoryItem,
  AsColourPriceListEntry,
  AsColourProduct,
  AsColourVariant,
} from "../modules/ascolour/types"
import {
  buildBulkPricingMetadata,
  buildPriceLadder,
} from "../modules/ascolour/pricing"
import { BRAND_MODULE } from "../modules/brand"

const PRICE_CURRENCY_CODE = "aud"
// AS Colour brand identity — single source of truth via the Brand entity
// (per the brands convention in CLAUDE.md). external_code keeps the brand
// identifiable across importers (spreadsheet sync resolves by name OR
// external_code, case-insensitive).
const AS_COLOUR_BRAND_NAME = "AS Colour"
const AS_COLOUR_BRAND_HANDLE = "as-colour"
const AS_COLOUR_BRAND_EXTERNAL_CODE = "ASCOLOUR"
const AS_COLOUR_LOCATION_NAME = "AS Colour Warehouse"

const slugify = (s: string) =>
  (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const handleForStyle = (style: AsColourProduct) => {
  const name = style.productName ?? style.styleCode ?? "as-colour-product"
  return `as-colour-${slugify(`${name}-${style.styleCode}`)}`
}

const titleCase = (s: string | undefined) => {
  if (!s) return ""
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ")
}

type EnrichedStyle = {
  product: AsColourProduct
  variants: AsColourVariant[]
  images: AsColourImage[]
}

const extractArray = <T,>(resp: any): T[] => {
  if (!resp) return []
  if (Array.isArray(resp)) return resp as T[]
  return resp.items ?? resp.data ?? resp.results ?? []
}

export default async function importAsColourFromApi({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const ascolour = container.resolve(ASCOLOUR_MODULE) as AsColourService

  // medusa exec swallows --flag-style args via its own yargs parser, so the
  // canonical way to pass options to scripts is environment variables. Old
  // --dry-run / --limit=N args are still honoured when they reach `args`.
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

  const salesChannelService = container.resolve(Modules.SALES_CHANNEL) as any
  const fulfillmentService = container.resolve(Modules.FULFILLMENT) as any
  const stockLocationService = container.resolve(Modules.STOCK_LOCATION) as any
  const inventoryService = container.resolve(Modules.INVENTORY) as any
  const productService = container.resolve(Modules.PRODUCT) as any

  // Resolve common dependencies
  const salesChannels = await salesChannelService.listSalesChannels({
    name: "Default Sales Channel",
  })
  if (!salesChannels.length) throw new Error("Default Sales Channel not found")
  const defaultSalesChannelId = salesChannels[0].id

  const shippingProfiles = await fulfillmentService.listShippingProfiles({ type: "default" })
  if (!shippingProfiles.length) throw new Error("Default shipping profile not found")
  const shippingProfileId = shippingProfiles[0].id

  // Stock location for AS Colour-managed stock
  let asColourLocationId: string | null = null
  const existingLocations = await stockLocationService.listStockLocations({
    name: AS_COLOUR_LOCATION_NAME,
  })
  if (existingLocations.length) {
    asColourLocationId = existingLocations[0].id
  } else if (!dryRun) {
    const created = await stockLocationService.createStockLocations({
      name: AS_COLOUR_LOCATION_NAME,
    })
    asColourLocationId = Array.isArray(created) ? created[0].id : created.id
    logger.info(`Created stock location ${AS_COLOUR_LOCATION_NAME} (${asColourLocationId})`)
  }

  // 1. Fetch catalogue + price list
  logger.info("Fetching AS Colour catalogue...")
  let products = await ascolour.fetchAllProducts()
  if (limit) products = products.slice(0, limit)
  logger.info(`Got ${products.length} products from AS Colour.`)

  logger.info("Fetching AS Colour price list (trade prices)...")
  const priceList = await ascolour.fetchAllPriceList()
  const costBySku = new Map<string, number>()
  for (const entry of priceList) {
    const price = Number(entry.price)
    if (entry.sku && Number.isFinite(price)) {
      costBySku.set(entry.sku, price)
    }
  }
  logger.info(`Got ${costBySku.size} price-list entries.`)

  // 2. Enrich each style with variants + images (sequential to be polite to the API)
  const enriched: EnrichedStyle[] = []
  for (const product of products) {
    try {
      const variants =
        product.variants?.length
          ? product.variants
          : extractArray<AsColourVariant>(await ascolour.getClient().getProductVariants(product.styleCode))
      const images =
        product.images?.length
          ? product.images
          : extractArray<AsColourImage>(await ascolour.getClient().getProductImages(product.styleCode))
      enriched.push({ product, variants, images })
    } catch (err: any) {
      logger.warn(`Failed to enrich style ${product.styleCode}: ${err?.message ?? err}`)
    }
  }

  // 3. Determine which styles already exist (idempotency by handle)
  const targetHandles = enriched.map(({ product }) => handleForStyle(product))
  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: targetHandles },
  })
  const existingByHandle = new Map<string, string>(
    (existing ?? []).map((p: any) => [p.handle, p.id])
  )

  // 3b. Resolve (or create) the AS Colour Brand entity. Brand is the
  // single source of truth for brand identity (see CLAUDE.md "Brands");
  // we link products to it after creation, NOT via product tags or
  // metadata.
  const brandService = container.resolve(BRAND_MODULE) as any
  const existingBrands = await brandService.listBrands({})
  let asColourBrand = (existingBrands as any[]).find(
    (b) =>
      (b.external_code ?? "").toUpperCase() === AS_COLOUR_BRAND_EXTERNAL_CODE ||
      (b.handle ?? "").toLowerCase() === AS_COLOUR_BRAND_HANDLE ||
      (b.name ?? "").toLowerCase() === AS_COLOUR_BRAND_NAME.toLowerCase()
  )
  if (!asColourBrand && !dryRun) {
    const [created] = await brandService.createBrands([
      {
        name: AS_COLOUR_BRAND_NAME,
        handle: AS_COLOUR_BRAND_HANDLE,
        external_code: AS_COLOUR_BRAND_EXTERNAL_CODE,
        is_active: true,
      },
    ])
    asColourBrand = created
    logger.info(`Created brand "${AS_COLOUR_BRAND_NAME}" (${asColourBrand.id}).`)
  } else if (!asColourBrand && dryRun) {
    logger.info(
      `[DRY] Would create brand "${AS_COLOUR_BRAND_NAME}" (handle ${AS_COLOUR_BRAND_HANDLE}, external_code ${AS_COLOUR_BRAND_EXTERNAL_CODE}).`
    )
  } else {
    logger.info(`Reusing existing brand "${asColourBrand.name}" (${asColourBrand.id}).`)
  }

  // 4. Build product create payloads
  const toCreate: any[] = []
  const skuToInventory: { sku: string; styleCode: string }[] = []

  for (const { product, variants, images } of enriched) {
    const handle = handleForStyle(product)
    if (existingByHandle.has(handle)) {
      logger.info(`Skipping existing handle ${handle} (id ${existingByHandle.get(handle)})`)
      continue
    }

    // Field names per the real AS Colour API shape (see probe-ascolour-product.ts):
    //   variant: { sku, styleCode, name, colour, sizeCode, weight, imageUrl, GTIN12, ... }
    //   image:   { styleCode, imageType, urlStandard, urlThumbnail, urlTiny, urlZoom }
    //   product: { styleCode, styleName, description, composition, productType, productWeight, ... }
    const sizes = new Set<string>()
    const colours = new Set<string>()
    for (const v of variants as any[]) {
      if (v.sizeCode) sizes.add(v.sizeCode)
      if (v.colour) colours.add(v.colour)
    }
    const hasSize = sizes.size > 1 || (sizes.size === 1 && !sizes.has("OS"))
    const hasColour = colours.size > 0

    const options: { title: string; values: string[] }[] = []
    if (hasColour) options.push({ title: "Colour", values: Array.from(colours) })
    if (hasSize) options.push({ title: "Size", values: Array.from(sizes) })
    if (!options.length) options.push({ title: "Default", values: ["Default"] })

    const productImages: { url: string }[] = []
    const seen = new Set<string>()
    for (const img of images as any[]) {
      // Prefer the largest non-zoom render. AS Colour returns urlStandard
      // (~386px), urlThumbnail (~220px), urlTiny (~44px), urlZoom (~1280px).
      // urlZoom is the print-quality master; urlStandard is the catalog tile.
      const url = img.urlStandard || img.urlZoom || img.urlThumbnail || img.urlTiny
      if (url && !seen.has(url)) {
        seen.add(url)
        productImages.push({ url })
      }
    }
    const thumbnail = productImages[0]?.url

    const productVariants = (variants as any[]).map((v) => {
      const variantOptions: Record<string, string> = {}
      if (hasColour && v.colour) variantOptions["Colour"] = v.colour
      if (hasSize && v.sizeCode) variantOptions["Size"] = v.sizeCode
      if (!hasColour && !hasSize) variantOptions["Default"] = "Default"

      const cost = costBySku.get(v.sku)
      const ladder = cost !== undefined ? buildPriceLadder(cost) : null
      const amount = ladder ? ladder.base : 0

      const titleParts = [v.colour, v.sizeCode].filter(Boolean)
      const variantTitle = titleParts.join(" / ") || v.name || v.sku

      // AS Colour `weight` on variants is a string (e.g. "320 GSM" / "Heavy
      // Weight"), not a number. Skip — Medusa expects grams as a number.
      const weight = undefined

      if (cost !== undefined) {
        skuToInventory.push({ sku: v.sku, styleCode: product.styleCode })
      }

      return {
        title: variantTitle,
        sku: v.sku,
        barcode: v.GTIN12 ?? undefined,
        weight,
        manage_inventory: true,
        allow_backorder: false,
        options: variantOptions,
        prices: [{ amount, currency_code: PRICE_CURRENCY_CODE }],
        metadata: {
          ascolour: {
            styleCode: product.styleCode,
            sku: v.sku,
            colour: v.colour,
            sizeCode: v.sizeCode,
          },
          ...(ladder ? { bulk_pricing: buildBulkPricingMetadata(ladder) } : {}),
        },
      }
    })

    // AS Colour `styleName` often comes through as "Parcel Tote | 1000" —
    // strip the trailing "| <code>" if present so titles read naturally.
    const rawStyleName = (product as any).styleName ?? ""
    const cleanedName = rawStyleName.replace(/\s*\|\s*\d+[A-Z]*\s*$/, "").trim()
    const title = cleanedName
      ? titleCase(cleanedName)
      : `AS Colour ${product.styleCode}`

    toCreate.push({
      title,
      handle,
      status: ProductStatus.PUBLISHED,
      description: (product as any).description ?? undefined,
      thumbnail,
      // AS Colour's `productWeight` is a string ("Heavy Weight"), not grams — skip.
      material: (product as any).composition ?? undefined,
      images: productImages,
      options,
      variants: productVariants,
      shipping_profile_id: shippingProfileId,
      sales_channels: [{ id: defaultSalesChannelId }],
      // Brand identity comes from the linked Brand entity (see CLAUDE.md
      // "Brands"). No product tag for brand — we link below after create.
      metadata: {
        source: "ascolour",
        ascolour: {
          styleCode: product.styleCode,
          lastSync: new Date().toISOString(),
        },
      },
    })
  }

  logger.info(`Prepared ${toCreate.length} products for creation.`)
  if (dryRun) {
    logger.info("Dry run — skipping createProductsWorkflow + inventory seed.")
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

  // 5b. Link each new product to the AS Colour Brand entity via the
  // product↔brand Module Link (defined in src/links/product-brand.ts).
  if (asColourBrand && createdProducts.length) {
    const link = container.resolve(ContainerRegistrationKeys.LINK) as any
    let linkOk = 0
    let linkFail = 0
    for (const p of createdProducts) {
      try {
        await link.create({
          [Modules.PRODUCT]: { product_id: p.id },
          [BRAND_MODULE]: { brand_id: asColourBrand.id },
        })
        linkOk++
      } catch (err: any) {
        linkFail++
        logger.warn(`Failed to link product ${p.id} to brand: ${err?.message ?? err}`)
      }
    }
    logger.info(`Linked ${linkOk} product(s) to AS Colour brand (${linkFail} failed).`)
  }

  // 6. Seed initial inventory at the AS Colour location
  if (!asColourLocationId) {
    logger.warn("AS Colour stock location not available; skipping inventory seed.")
    return
  }

  logger.info("Seeding initial inventory levels...")
  const allInventory = await ascolour.fetchInventoryDelta()
  const stockBySku = new Map<string, number>()
  for (const item of allInventory) {
    const total = item.warehouses?.length
      ? item.warehouses.reduce((a, w) => a + (w.available ?? 0), 0)
      : (item.available ?? 0)
    if (item.sku) stockBySku.set(item.sku, total)
  }

  // Look up the inventory items Medusa just created for our SKUs.
  const targetSkus = skuToInventory.map((s) => s.sku)
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
    filters: { sku: targetSkus },
  })

  const updates: { inventory_item_id: string; location_id: string; stocked_quantity: number }[] = []
  const creates: { inventory_item_id: string; location_id: string; stocked_quantity: number }[] = []

  // Find which already have a level at this location
  const inventoryIds = (inventoryItems ?? []).map((i: any) => i.id)
  const { data: existingLevels } = await query.graph({
    entity: "inventory_level",
    fields: ["id", "inventory_item_id", "location_id"],
    filters: {
      inventory_item_id: inventoryIds,
      location_id: asColourLocationId,
    },
  })
  const existingLevelKey = new Set(
    (existingLevels ?? []).map((l: any) => `${l.inventory_item_id}:${l.location_id}`)
  )

  for (const item of inventoryItems ?? []) {
    const qty = stockBySku.get(item.sku) ?? 0
    const key = `${item.id}:${asColourLocationId}`
    if (existingLevelKey.has(key)) {
      updates.push({
        inventory_item_id: item.id,
        location_id: asColourLocationId,
        stocked_quantity: qty,
      })
    } else {
      creates.push({
        inventory_item_id: item.id,
        location_id: asColourLocationId,
        stocked_quantity: qty,
      })
    }
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

  logger.info("AS Colour API import complete.")
}
