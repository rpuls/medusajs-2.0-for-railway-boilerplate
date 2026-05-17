import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  updateInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows"
import { AUSSIEPACIFIC_MODULE } from "../modules/aussiepacific"
import AussiePacificService from "../modules/aussiepacific/service"
import { normalizeStockLevel, toArray } from "../modules/aussiepacific/mapping"
import type { AussiePacificVariant } from "../modules/aussiepacific/types"
import { withJobContext, getContextLogger } from "../lib/job-context-wrapper"

const AUSSIEPACIFIC_LOCATION_NAME = "Aussie Pacific Warehouse"
const CHECKPOINT_KEY = "aussiepacific:inventory:lastSync"

/**
 * Daily sweep of Aussie Pacific stock into the Aussie Pacific Medusa
 * stock location.
 *
 * Aussie Pacific's API exposes no `updated_at` filter — stock is embedded
 * on variants inside `/api/v1/products`. We walk every page (with
 * `include=variants`) and build a `Map<sku, stock_level>` across the
 * whole catalog. One pass per day at 05:00 UTC (an hour after FashionBiz).
 */
const handler = async function syncAussiePacificInventory(
  container: MedusaContainer
) {
  const logger = getContextLogger(container)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  let ap: AussiePacificService
  try {
    ap = container.resolve(AUSSIEPACIFIC_MODULE) as AussiePacificService
  } catch {
    logger.warn(
      "Aussie Pacific module not registered — skipping inventory sync."
    )
    return
  }

  const stockLocationService = container.resolve(Modules.STOCK_LOCATION) as any
  const locations = await stockLocationService.listStockLocations({
    name: AUSSIEPACIFIC_LOCATION_NAME,
  })
  if (!locations.length) {
    logger.warn(
      `Stock location "${AUSSIEPACIFIC_LOCATION_NAME}" not found — run import-aussie-pacific-from-api first.`
    )
    return
  }
  const locationId = locations[0].id

  const startedAt = new Date()
  logger.info("Aussie Pacific inventory sync starting…")

  // 1. Fetch entire AP catalog with embedded variants + stock.
  let products: Awaited<ReturnType<AussiePacificService["fetchAllProducts"]>>
  try {
    products = await ap.fetchAllProducts()
  } catch (err: any) {
    logger.error(
      `Aussie Pacific catalog fetch failed: ${err?.message ?? err} — leaving inventory untouched.`
    )
    return
  }

  // 2. Build sku -> qty map.
  const stockBySku = new Map<string, number>()
  for (const product of products) {
    for (const v of toArray<AussiePacificVariant>(product.variants)) {
      if (!v?.sku) continue
      stockBySku.set(v.sku, normalizeStockLevel(v.stock_level))
    }
  }

  if (!stockBySku.size) {
    logger.warn("No stock data in AP response. Leaving inventory untouched.")
    await writeCheckpoint(container, startedAt.toISOString())
    return
  }

  // 3. Resolve inventory items + existing levels.
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
    const qty = stockBySku.get(item.sku) ?? 0
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
  }
  if (updates.length) {
    await updateInventoryLevelsWorkflow(container).run({
      input: { updates },
    })
  }

  await writeCheckpoint(container, startedAt.toISOString())
  logger.info(
    `Aussie Pacific inventory sync done — SKUs synced: ${stockBySku.size}, levels created: ${creates.length}, updated: ${updates.length}.`
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
  name: "sync-aussie-pacific-inventory",
  schedule: "0 5 * * *", // daily at 05:00 UTC (an hour after FashionBiz)
}
