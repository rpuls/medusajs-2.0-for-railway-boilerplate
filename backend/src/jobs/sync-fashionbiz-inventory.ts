import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  updateInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows"
import { FASHIONBIZ_MODULE } from "../modules/fashionbiz"
import FashionBizService from "../modules/fashionbiz/service"
import { FashionBizBrandSlug } from "../modules/fashionbiz/types"
import { withJobContext, getContextLogger } from "../lib/job-context-wrapper"

const FASHIONBIZ_LOCATION_NAME = "FashionBiz Warehouse"
const CHECKPOINT_KEY = "fashionbiz:inventory:lastSync"
const THROTTLE_MS = 200 // ~5 req/sec — FashionBiz publishes no rate-limit spec

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Daily sweep of FashionBiz stock into the FashionBiz Medusa stock location.
 *
 * FashionBiz exposes no `updated_at` filter on its stock endpoint, so a
 * full sweep is required. We group variants by (brand, slug, colour) and
 * make one /stock call per group, summing across stock locations.
 *
 * Runs at 04:00 UTC = ~14:00–15:00 AEDT — off-peak for both AU customers
 * and (assumed) FashionBiz API capacity.
 */
const handler = async function syncFashionBizInventory(container: MedusaContainer) {
  const logger = getContextLogger(container)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  let fashionbiz: FashionBizService
  try {
    fashionbiz = container.resolve(FASHIONBIZ_MODULE) as FashionBizService
  } catch {
    logger.warn("FashionBiz module not registered — skipping inventory sync.")
    return
  }

  const stockLocationService = container.resolve(Modules.STOCK_LOCATION) as any
  const locations = await stockLocationService.listStockLocations({
    name: FASHIONBIZ_LOCATION_NAME,
  })
  if (!locations.length) {
    logger.warn(
      `Stock location "${FASHIONBIZ_LOCATION_NAME}" not found — run import-fashionbiz-from-api first.`
    )
    return
  }
  const locationId = locations[0].id

  const startedAt = new Date()
  logger.info("FashionBiz inventory sync starting…")

  // 1. Find every variant we previously imported. Variant metadata.fashionbiz
  //    carries product_slug + color_name + brand (set on the parent product
  //    metadata; we group via variant fields to keep this query flat).
  //
  //    We walk pages to avoid huge result sets.
  type VariantRow = {
    id: string
    sku: string
    metadata: {
      fashionbiz?: {
        product_slug?: string
        color_name?: string
      }
    } | null
    product: { metadata?: Record<string, any> | null } | null
  }
  const variants: VariantRow[] = []
  const PAGE = 500
  let offset = 0
  while (true) {
    const { data: page } = await query.graph({
      entity: "product_variant",
      fields: [
        "id",
        "sku",
        "metadata",
        "product.metadata",
      ],
      pagination: { take: PAGE, skip: offset },
    })
    if (!page?.length) break
    for (const v of page as any[]) {
      if (v?.metadata?.fashionbiz?.product_slug && v?.metadata?.fashionbiz?.color_name) {
        variants.push(v as VariantRow)
      }
    }
    if (page.length < PAGE) break
    offset += page.length
  }

  if (!variants.length) {
    logger.info("No FashionBiz variants found in catalog — nothing to sync.")
    await writeCheckpoint(container, startedAt.toISOString())
    return
  }

  // 2. Group by (brand, slug, colour). brand comes from the parent product's metadata.
  type GroupKey = string
  const groups = new Map<
    GroupKey,
    { brand: FashionBizBrandSlug; slug: string; colour: string; skus: Set<string> }
  >()
  for (const v of variants) {
    const brand = (v.product?.metadata as any)?.fashionbiz?.brand_slug as
      | FashionBizBrandSlug
      | undefined
    const slug = v.metadata?.fashionbiz?.product_slug
    const colour = v.metadata?.fashionbiz?.color_name
    if (!brand || !slug || !colour || !v.sku) continue
    const key = `${brand}|${slug}|${colour}`
    let group = groups.get(key)
    if (!group) {
      group = { brand, slug, colour, skus: new Set() }
      groups.set(key, group)
    }
    group.skus.add(v.sku)
  }
  logger.info(
    `Sweeping ${groups.size} (brand,slug,colour) groups across ${variants.length} variants.`
  )

  // 3. Fetch stock for every group; build sku -> totalQty map.
  const stockBySku = new Map<string, number>()
  let groupErrors = 0
  for (const group of groups.values()) {
    try {
      const resp = await fashionbiz.fetchStock(group.brand, group.slug, group.colour)
      for (const item of resp.items ?? []) {
        if (!item.sku) continue
        const total = (item.stock ?? []).reduce((a, s) => a + (s.qtyAvailable ?? 0), 0)
        stockBySku.set(item.sku, total)
      }
    } catch (err: any) {
      groupErrors++
      logger.warn(
        `Stock fetch failed for ${group.brand}/${group.slug}/${group.colour}: ${err?.message ?? err}`
      )
    }
    await sleep(THROTTLE_MS)
  }

  if (!stockBySku.size) {
    logger.warn(`No stock data returned (${groupErrors} group errors). Leaving levels untouched.`)
    await writeCheckpoint(container, startedAt.toISOString())
    return
  }

  // 4. Resolve inventory items for the SKUs we have data for, then split into create/update.
  const skus = Array.from(stockBySku.keys())
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
    filters: { sku: skus },
  })
  const itemIds = (inventoryItems ?? []).map((i: any) => i.id)
  const { data: existingLevels } = await query.graph({
    entity: "inventory_level",
    fields: ["id", "inventory_item_id", "location_id"],
    filters: { inventory_item_id: itemIds, location_id: locationId },
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
  }
  if (updates.length) {
    await updateInventoryLevelsWorkflow(container).run({
      input: { updates },
    })
  }

  await writeCheckpoint(container, startedAt.toISOString())
  logger.info(
    `FashionBiz inventory sync done — SKUs synced: ${stockBySku.size}, levels created: ${creates.length}, updated: ${updates.length}, group errors: ${groupErrors}.`
  )
}

async function writeCheckpoint(container: MedusaContainer, value: string) {
  try {
    const cache = container.resolve(Modules.CACHE) as any
    await cache.set(CHECKPOINT_KEY, value)
  } catch {
    // Cache module not available — checkpoint is monitoring-only, safe to skip.
  }
}

export default withJobContext(handler)

export const config = {
  name: "sync-fashionbiz-inventory",
  schedule: "0 4 * * *", // daily at 04:00 UTC
}
