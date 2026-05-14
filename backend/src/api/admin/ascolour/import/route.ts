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
import { ASCOLOUR_MODULE } from "../../../../modules/ascolour"
import AsColourService from "../../../../modules/ascolour/service"
import { AsColourImage, AsColourVariant } from "../../../../modules/ascolour/types"
import { buildPriceLadder } from "../../../../modules/ascolour/pricing"
import {
  tierMinorToPriceSetRows,
  tierMinorToBulkPricingMetadata,
} from "../../../../utils/bulk-tier-prices"
import type { PriceLadder } from "../../../../utils/bulk-price-ladder"
import { BRAND_MODULE } from "../../../../modules/brand"

const PRICE_CURRENCY_CODE = "aud"
const AS_COLOUR_BRAND_HANDLE = "as-colour"
const AS_COLOUR_BRAND_NAME = "AS Colour"
const AS_COLOUR_BRAND_EXTERNAL_CODE = "ASCOLOUR"
const AS_COLOUR_LOCATION_NAME = "AS Colour Warehouse"

const slugify = (s: string) =>
  (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const handleForStyle = (styleCode: string, productName?: string) => {
  const name = productName ?? styleCode
  return `as-colour-${slugify(`${name}-${styleCode}`)}`
}

const titleCase = (s: string | undefined) => {
  if (!s) return ""
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ")
}

const ladderToTierMinor = (ladder: PriceLadder) => ({
  t1_9: Math.round(ladder.base * 100),
  t10_19: Math.round(ladder.tier10to19 * 100),
  t20_49: Math.round(ladder.tier20to49 * 100),
  t50_99: Math.round(ladder.tier50to99 * 100),
  t100_plus: Math.round(ladder.tier100Plus * 100),
})

const extractArray = <T,>(resp: any): T[] => {
  if (!resp) return []
  if (Array.isArray(resp)) return resp as T[]
  return resp.items ?? resp.data ?? resp.results ?? []
}

/**
 * POST /admin/ascolour/import
 *
 * Imports selected AS Colour products into Medusa. Mirrors the
 * `import-as-colour-from-api` script scoped to the requested styleCodes.
 *
 * Body: { styleCodes: string[] }
 * Returns: { imported: string[], skipped: string[], errors: Array<{ styleCode, error }> }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  let ascolour: AsColourService
  try {
    ascolour = req.scope.resolve(ASCOLOUR_MODULE) as AsColourService
  } catch {
    return res.status(503).json({ error: "AS Colour module not configured." })
  }

  const body = req.body as { styleCodes?: string[] }
  const styleCodes = body.styleCodes

  if (!styleCodes?.length) {
    return res.status(400).json({ error: "body must contain styleCodes[]" })
  }

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

  // Resolve or create AS Colour Warehouse stock location
  let locationId: string | null = null
  const existingLocations = await stockLocationService.listStockLocations({ name: AS_COLOUR_LOCATION_NAME })
  if (existingLocations.length) {
    locationId = existingLocations[0].id
  } else {
    const created = await stockLocationService.createStockLocations({ name: AS_COLOUR_LOCATION_NAME })
    locationId = Array.isArray(created) ? created[0].id : created.id
  }

  // Resolve or create the AS Colour Brand entity
  const existingBrands = (await brandService.listBrands({})) as any[]
  let asColourBrand = existingBrands.find(
    (b) =>
      (b.external_code ?? "").toUpperCase() === AS_COLOUR_BRAND_EXTERNAL_CODE ||
      (b.handle ?? "").toLowerCase() === AS_COLOUR_BRAND_HANDLE ||
      (b.name ?? "").toLowerCase() === AS_COLOUR_BRAND_NAME.toLowerCase()
  )
  if (!asColourBrand) {
    const [created] = await brandService.createBrands([{
      name: AS_COLOUR_BRAND_NAME,
      handle: AS_COLOUR_BRAND_HANDLE,
      external_code: AS_COLOUR_BRAND_EXTERNAL_CODE,
      is_active: true,
    }])
    asColourBrand = created
  }

  // Fetch all products from AS Colour to find the requested styleCodes,
  // then enrich with variants + images
  const allProducts = await ascolour.fetchAllProducts()
  const productsByCode = new Map(allProducts.map((p) => [p.styleCode, p]))

  // Fetch price list
  const priceList = await ascolour.fetchAllPriceList()
  const costBySku = new Map<string, number>()
  for (const entry of priceList) {
    const price = Number(entry.price)
    if (entry.sku && Number.isFinite(price)) costBySku.set(entry.sku, price)
  }

  const imported: string[] = []
  const skipped: string[] = []
  const errors: Array<{ styleCode: string; error: string }> = []

  const toCreate: any[] = []
  const skuToInventory: { sku: string }[] = []
  type Context = { styleCode: string }
  const contexts: Context[] = []

  for (const styleCode of styleCodes) {
    try {
      const product = productsByCode.get(styleCode)
      if (!product) {
        errors.push({ styleCode, error: "Product not found in AS Colour catalog" })
        continue
      }

      const handle = handleForStyle(styleCode, (product as any).productName)

      // Idempotency: skip if already imported
      const { data: existing } = await query.graph({
        entity: "product",
        fields: ["id"],
        filters: { handle: [handle] },
      })
      if ((existing ?? []).length > 0) {
        skipped.push(styleCode)
        continue
      }

      // Enrich with variants + images
      const variants: AsColourVariant[] = product.variants?.length
        ? product.variants
        : extractArray<AsColourVariant>(await ascolour.getClient().getProductVariants(styleCode))
      const images: AsColourImage[] = product.images?.length
        ? product.images
        : extractArray<AsColourImage>(await ascolour.getClient().getProductImages(styleCode))

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
        const url = img.urlStandard || img.urlZoom || img.urlThumbnail || img.urlTiny
        if (url && !seen.has(url)) {
          seen.add(url)
          productImages.push({ url })
        }
      }

      const productVariants = (variants as any[]).map((v) => {
        const variantOptions: Record<string, string> = {}
        if (hasColour && v.colour) variantOptions["Colour"] = v.colour
        if (hasSize && v.sizeCode) variantOptions["Size"] = v.sizeCode
        if (!hasColour && !hasSize) variantOptions["Default"] = "Default"

        const cost = costBySku.get(v.sku)
        const ladder = cost !== undefined ? buildPriceLadder(cost) : null
        const tierMinor = ladder ? ladderToTierMinor(ladder) : null

        if (cost !== undefined) skuToInventory.push({ sku: v.sku })

        const prices = tierMinor
          ? tierMinorToPriceSetRows(tierMinor, PRICE_CURRENCY_CODE)
          : [{ amount: 0, currency_code: PRICE_CURRENCY_CODE }]

        return {
          title: [v.colour, v.sizeCode].filter(Boolean).join(" / ") || v.name || v.sku,
          sku: v.sku,
          barcode: v.GTIN12 ?? undefined,
          manage_inventory: true,
          allow_backorder: false,
          options: variantOptions,
          prices,
          metadata: {
            ascolour: { styleCode, sku: v.sku, colour: v.colour, sizeCode: v.sizeCode },
            ...(tierMinor
              ? { bulk_pricing: tierMinorToBulkPricingMetadata(tierMinor, "ascolour-api") }
              : {}),
          },
        }
      })

      const rawStyleName = (product as any).styleName ?? ""
      const cleanedName = rawStyleName.replace(/\s*\|\s*\d+[A-Z]*\s*$/, "").trim()
      const title = cleanedName ? titleCase(cleanedName) : `AS Colour ${styleCode}`

      toCreate.push({
        title,
        handle,
        status: ProductStatus.PUBLISHED,
        description: (product as any).description ?? undefined,
        thumbnail: productImages[0]?.url,
        material: (product as any).composition ?? undefined,
        images: productImages,
        options,
        variants: productVariants,
        shipping_profile_id: shippingProfileId,
        sales_channels: [{ id: defaultSalesChannelId }],
        metadata: {
          source: "ascolour",
          ascolour: { styleCode, lastSync: new Date().toISOString() },
        },
      })

      contexts.push({ styleCode })
    } catch (err: any) {
      errors.push({ styleCode, error: err?.message ?? String(err) })
    }
  }

  if (!toCreate.length) {
    return res.json({ imported, skipped, errors })
  }

  // Create products
  const { result } = await createProductsWorkflow(req.scope).run({
    input: { products: toCreate },
  })
  const createdProducts = (result as any[]) ?? []

  // Link to AS Colour Brand
  if (asColourBrand) {
    for (const p of createdProducts) {
      try {
        await link.create({
          [Modules.PRODUCT]: { product_id: p.id },
          [BRAND_MODULE]: { brand_id: asColourBrand.id },
        })
      } catch (err: any) {
        if (!/already|multiple links|duplicate/i.test(String(err?.message ?? ""))) {
          // non-fatal link failure
        }
      }
    }
  }

  for (const ctx of contexts) {
    imported.push(ctx.styleCode)
  }

  // Seed inventory
  if (locationId && skuToInventory.length > 0) {
    const allInventory = await ascolour.fetchInventoryDelta()
    const stockBySku = new Map<string, number>()
    for (const item of allInventory as any[]) {
      if (!item?.sku) continue
      const qty =
        typeof item.quantity === "number"
          ? item.quantity
          : item.warehouses?.length
            ? item.warehouses.reduce((a: number, w: any) => a + (w.available ?? 0), 0)
            : (item.available ?? 0)
      stockBySku.set(item.sku, (stockBySku.get(item.sku) ?? 0) + qty)
    }

    const targetSkus = skuToInventory.map((s) => s.sku)
    const { data: inventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id", "sku"],
      filters: { sku: targetSkus },
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

  return res.json({ imported, skipped, errors })
}
