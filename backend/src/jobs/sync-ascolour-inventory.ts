import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  updateInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows"
import { ASCOLOUR_MODULE } from "../modules/ascolour"
import AsColourService from "../modules/ascolour/service"

const AS_COLOUR_LOCATION_NAME = "AS Colour Warehouse"
const CHECKPOINT_KEY = "ascolour:inventory:lastSync"

/**
 * Hourly delta sync of AS Colour stock levels into the AS Colour Medusa stock location.
 * Uses /inventory/items?updatedAt:min=<lastSync> so payloads stay small.
 *
 * Falls back to a full sync the first time it runs (no checkpoint yet).
 */
export default async function syncAsColourInventory(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  let ascolour: AsColourService
  try {
    ascolour = container.resolve(ASCOLOUR_MODULE) as AsColourService
  } catch {
    logger.warn("AS Colour module not registered — skipping inventory sync.")
    return
  }

  const stockLocationService = container.resolve(Modules.STOCK_LOCATION) as any
  const locations = await stockLocationService.listStockLocations({
    name: AS_COLOUR_LOCATION_NAME,
  })
  if (!locations.length) {
    logger.warn(
      `Stock location "${AS_COLOUR_LOCATION_NAME}" not found — run import-as-colour-from-api first.`
    )
    return
  }
  const locationId = locations[0].id

  const checkpoint = await readCheckpoint(container)
  const startedAt = new Date()
  logger.info(
    `AS Colour inventory sync starting (since ${checkpoint ?? "<no checkpoint, full sync>"})`
  )

  const items = await ascolour.fetchInventoryDelta(checkpoint)
  if (!items.length) {
    logger.info("No AS Colour inventory changes since last sync.")
    await writeCheckpoint(container, startedAt.toISOString())
    return
  }

  // AS Colour's real /inventory/items response is one row per (sku, location)
  // with the qty in `quantity` (not `available`) and no `warehouses` array.
  // Sum across rows so multi-warehouse SKUs aggregate correctly. Fall back
  // to the legacy nested shape if the API ever returns it.
  const stockBySku = new Map<string, number>()
  for (const item of items as any[]) {
    if (!item?.sku) continue
    const qty =
      typeof item.quantity === "number"
        ? item.quantity
        : item.warehouses?.length
          ? item.warehouses.reduce((a: number, w: any) => a + (w.available ?? 0), 0)
          : (item.available ?? 0)
    stockBySku.set(item.sku, (stockBySku.get(item.sku) ?? 0) + qty)
  }

  const skus = Array.from(stockBySku.keys())
  if (!skus.length) {
    await writeCheckpoint(container, startedAt.toISOString())
    return
  }

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
    filters: { sku: skus },
  })

  if (!inventoryItems?.length) {
    logger.info(
      `Received ${items.length} delta items but none match Medusa inventory items (have they been imported yet?).`
    )
    await writeCheckpoint(container, startedAt.toISOString())
    return
  }

  const itemIds = inventoryItems.map((i: any) => i.id)
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

  for (const item of inventoryItems) {
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
    `AS Colour inventory sync done — items processed: ${items.length}, levels created: ${creates.length}, updated: ${updates.length}.`
  )
}

async function readCheckpoint(container: MedusaContainer): Promise<string | undefined> {
  // Cache module store; key = ascolour:inventory:lastSync. Best-effort — if absent, return undefined.
  try {
    const cache = container.resolve(Modules.CACHE) as any
    const v = await cache.get(CHECKPOINT_KEY)
    return typeof v === "string" ? v : undefined
  } catch {
    return undefined
  }
}

async function writeCheckpoint(container: MedusaContainer, value: string) {
  try {
    const cache = container.resolve(Modules.CACHE) as any
    await cache.set(CHECKPOINT_KEY, value)
  } catch {
    // Cache module not available — sync will fall back to full each run.
  }
}

export const config = {
  name: "sync-ascolour-inventory",
  schedule: "0 * * * *", // hourly on the hour
}
