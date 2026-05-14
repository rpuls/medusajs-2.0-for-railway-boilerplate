import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
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
import { FASHIONBIZ_MODULE } from "../../../../modules/fashionbiz"
import FashionBizService from "../../../../modules/fashionbiz/service"
import { FashionBizBrandSlug, FashionBizColour } from "../../../../modules/fashionbiz/types"
import { priceLadderFromFashionBiz } from "../../../../modules/fashionbiz/pricing"
import {
  buildGarmentImagesForColour,
  collectImageUrls,
  handleForProduct,
  renderDescription,
  titleCase,
} from "../../../../modules/fashionbiz/mapping"
import {
  tierMinorToPriceSetRows,
  tierMinorToBulkPricingMetadata,
} from "../../../../utils/bulk-tier-prices"
import type { PriceLadder } from "../../../../utils/bulk-price-ladder"
import { BRAND_MODULE } from "../../../../modules/brand"

const PRICE_CURRENCY_CODE = "aud"
const FASHIONBIZ_LOCATION_NAME = "FashionBiz Warehouse"

const BRAND_HANDLE_BY_SLUG: Record<FashionBizBrandSlug, string> = {
  "biz-collection": "biz-collection",
  "biz-care": "biz-care",
  "biz-corporates": "biz-corporates",
  syzmik: "syzmik",
  "good-mates": "good-mates",
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const ladderToTierMinor = (ladder: PriceLadder) => ({
  t1_9: Math.round(ladder.base * 100),
  t10_19: Math.round(ladder.tier10to19 * 100),
  t20_49: Math.round(ladder.tier20to49 * 100),
  t50_99: Math.round(ladder.tier50to99 * 100),
  t100_plus: Math.round(ladder.tier100Plus * 100),
})

/**
 * POST /admin/fashionbiz/import
 *
 * Imports selected FashionBiz products into Medusa. Runs the same logic as
 * the `import-fashionbiz-from-api` script but scoped to the provided slugs.
 *
 * Body: { brand: string, slugs: string[] }
 * Returns: { imported: string[], skipped: string[], errors: Array<{ slug, error }> }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  let fashionbiz: FashionBizService
  try {
    fashionbiz = req.scope.resolve(FASHIONBIZ_MODULE) as FashionBizService
  } catch {
    return res.status(503).json({ error: "FashionBiz module not configured. Set FASHIONBIZ_API_TOKEN." })
  }

  const body = req.body as { brand?: string; slugs?: string[] }
  const brand = body.brand as FashionBizBrandSlug | undefined
  const slugs = body.slugs

  if (!brand || !slugs?.length) {
    return res.status(400).json({ error: "body must contain brand and slugs[]" })
  }

  const costAdjustment = fashionbiz.getCostAdjustment()

  const salesChannelService = req.scope.resolve(Modules.SALES_CHANNEL) as any
  const fulfillmentService = req.scope.resolve(Modules.FULFILLMENT) as any
  const stockLocationService = req.scope.resolve(Modules.STOCK_LOCATION) as any
  const brandService = req.scope.resolve(BRAND_MODULE) as any
  const link = req.scope.resolve(ContainerRegistrationKeys.LINK) as any

  const salesChannels = await salesChannelService.listSalesChannels({ name: "Default Sales Channel" })
  if (!salesChannels.length) return res.status(500).json({ error: "Default Sales Channel not found" })
  const defaultSalesChannelId = salesChannels[0].id

  const shippingProfiles = await fulfillmentService.listShippingProfiles({ type: "default" })
  if (!shippingProfiles.length) return res.status(500).json({ error: "Default shipping profile not found" })
  const shippingProfileId = shippingProfiles[0].id

  // Resolve or create the FashionBiz Warehouse stock location
  let locationId: string | null = null
  const existingLocations = await stockLocationService.listStockLocations({ name: FASHIONBIZ_LOCATION_NAME })
  if (existingLocations.length) {
    locationId = existingLocations[0].id
  } else {
    const created = await stockLocationService.createStockLocations({ name: FASHIONBIZ_LOCATION_NAME })
    locationId = Array.isArray(created) ? created[0].id : created.id
  }

  // Resolve brand entity
  const allBrands = (await brandService.listBrands({})) as Array<{ id: string; handle: string }>
  const targetHandle = BRAND_HANDLE_BY_SLUG[brand]
  const brandEntity = allBrands.find((b) => (b.handle ?? "").toLowerCase() === targetHandle)

  const imported: string[] = []
  const skipped: string[] = []
  const errors: Array<{ slug: string; error: string }> = []

  // Fetch details for all requested slugs
  type ProductContext = {
    slug: string
    payload: any
    colourNames: string[]
  }
  const contexts: ProductContext[] = []

  for (const slug of slugs) {
    try {
      const product = await fashionbiz.fetchProductDetail(brand, slug)
      await sleep(200)

      const handle = handleForProduct(brand, slug)

      // Skip if already imported
      const { data: existing } = await query.graph({
        entity: "product",
        fields: ["id"],
        filters: { handle: [handle] },
      })
      if ((existing ?? []).length > 0) {
        skipped.push(slug)
        continue
      }

      const ladder = priceLadderFromFashionBiz(product.prices, costAdjustment)
      if (!ladder) {
        errors.push({ slug, error: "No usable prices from FashionBiz API" })
        continue
      }
      const tierMinor = ladderToTierMinor(ladder)

      const colours = (product.colors ?? []).filter(
        (c): c is FashionBizColour => !!c && (c.sizes?.length ?? 0) > 0
      )
      if (!colours.length) {
        errors.push({ slug, error: "No colours with sizes" })
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
      const thumbnail =
        productImages.find((img) => img.url.includes("_Talent_"))?.url ??
        productImages[0]?.url

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

          productVariants.push({
            title: [colour.name, size.size].filter(Boolean).join(" / ") || size.sku,
            sku: size.sku,
            manage_inventory: true,
            allow_backorder: false,
            options: variantOptions,
            prices: tierMinorToPriceSetRows(tierMinor, PRICE_CURRENCY_CODE),
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
              bulk_pricing: tierMinorToBulkPricingMetadata(tierMinor, "fashionbiz-api"),
              raw_prices: product.prices ?? [],
              cost_adjustment: costAdjustment,
              garment_images: buildGarmentImagesForColour(colour),
              garment_color: colour.name,
            },
          })
        }
      }

      if (!productVariants.length) {
        errors.push({ slug, error: "No variants after deduplication" })
        continue
      }

      const payload: any = {
        title: product.name ? titleCase(product.name) : `FashionBiz ${product.code}`,
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
            brand_slug: brand,
            sales_status: product.sales_status,
            tags: product.tags ?? [],
            fit: product.fit,
            gender: product.gender,
            sleeve: product.sleeve,
            last_sync: new Date().toISOString(),
          },
        },
      }

      contexts.push({ slug, payload, colourNames: Array.from(colourNames) })
    } catch (err: any) {
      errors.push({ slug, error: err?.message ?? String(err) })
    }
  }

  if (!contexts.length) {
    return res.json({ imported, skipped, errors })
  }

  // Create products
  const { result } = await createProductsWorkflow(req.scope).run({
    input: { products: contexts.map((c) => c.payload) },
  })
  const createdProducts = (result as any[]) ?? []

  // Link to Brand entity
  if (brandEntity) {
    for (const p of createdProducts) {
      try {
        await link.create({
          [Modules.PRODUCT]: { product_id: p.id },
          [BRAND_MODULE]: { brand_id: brandEntity.id },
        })
      } catch (err: any) {
        if (!err?.message?.includes("Cannot create multiple links")) {
          // non-fatal
        }
      }
    }
  }

  // Patch garment_images on any restored variants
  {
    const garmentImagesBySku = new Map<string, any>()
    for (const ctx of contexts) {
      for (const v of ctx.payload.variants ?? []) {
        if (v.sku && v.metadata?.garment_images) {
          garmentImagesBySku.set(v.sku, {
            garment_images: v.metadata.garment_images,
            garment_color: v.metadata.garment_color,
          })
        }
      }
    }
    if (garmentImagesBySku.size > 0) {
      const productModuleService = req.scope.resolve(Modules.PRODUCT) as any
      if (typeof productModuleService.updateProductVariants === "function") {
        const { data: dbVariants } = await query.graph({
          entity: "product_variant",
          fields: ["id", "sku", "metadata"],
          filters: { sku: Array.from(garmentImagesBySku.keys()) },
        })
        for (const dbv of dbVariants ?? []) {
          const patch = garmentImagesBySku.get((dbv as any).sku)
          if (!patch) continue
          const existing = ((dbv as any).metadata ?? {}) as Record<string, any>
          if (existing.garment_images?.front) continue
          await productModuleService.updateProductVariants((dbv as any).id, {
            metadata: { ...existing, ...patch },
          })
        }
      }
    }
  }

  // Seed inventory
  if (locationId) {
    const contextByHandle = new Map(contexts.map((c) => [c.payload.handle, c]))

    const stockBySku = new Map<string, number>()
    for (const p of createdProducts) {
      const ctx = contextByHandle.get(p.handle)
      if (!ctx) continue
      for (const colourName of ctx.colourNames) {
        try {
          const stockResp = await fashionbiz.fetchStock(brand, ctx.slug, colourName)
          for (const item of stockResp.items ?? []) {
            if (!item.sku) continue
            const total = (item.stock ?? []).reduce((a, s) => a + (s.qtyAvailable ?? 0), 0)
            stockBySku.set(item.sku, total)
          }
        } catch {
          // non-fatal
        }
        await sleep(200)
      }
    }

    if (stockBySku.size > 0) {
      const { data: inventoryItems } = await query.graph({
        entity: "inventory_item",
        fields: ["id", "sku"],
        filters: { sku: Array.from(stockBySku.keys()) },
      })
      const inventoryIds = (inventoryItems ?? []).map((i: any) => i.id)
      const { data: existingLevels } = await query.graph({
        entity: "inventory_level",
        fields: ["id", "inventory_item_id"],
        filters: { inventory_item_id: inventoryIds, location_id: locationId },
      })
      const haveLevel = new Set((existingLevels ?? []).map((l: any) => l.inventory_item_id))

      const creates: any[] = []
      const updates: any[] = []
      for (const item of inventoryItems ?? []) {
        const qty = stockBySku.get(item.sku) ?? 0
        const payload = { inventory_item_id: item.id, location_id: locationId, stocked_quantity: qty }
        if (haveLevel.has(item.id)) updates.push(payload)
        else creates.push(payload)
      }
      if (creates.length) {
        await createInventoryLevelsWorkflow(req.scope).run({ input: { inventory_levels: creates } })
      }
      if (updates.length) {
        await updateInventoryLevelsWorkflow(req.scope).run({ input: { updates } })
      }
    }

  }

  for (const ctx of contexts) {
    imported.push(ctx.slug)
  }

  return res.json({ imported, skipped, errors })
}
