import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const NAME = "AS Colour Warehouse"

/**
 * One-shot: creates the "AS Colour Warehouse" stock location idempotently.
 * The hourly inventory cron in src/jobs/sync-ascolour-inventory.ts looks
 * up this location by exact name and silently skips if missing.
 *
 * Address values use AS Colour's main AU distribution centre — they're
 * never shipped to (the location is virtual, mirroring AS Colour's stock
 * inside Medusa) but the Medusa API rejects empty address strings.
 *
 * Run via: `railway run npx medusa exec ./src/scripts/create-ascolour-stock-location.ts`
 * Safe to re-run.
 */
export default async function createAscolourStockLocation({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const stockLocationService = container.resolve(Modules.STOCK_LOCATION) as any

  const existing = await stockLocationService.listStockLocations({ name: NAME })
  if (existing.length) {
    logger.info(`Stock location "${NAME}" already exists (${existing[0].id}). Nothing to do.`)
    return
  }

  const created = await stockLocationService.createStockLocations({
    name: NAME,
    address: {
      address_1: "AS Colour Distribution Centre",
      city: "Sydney",
      country_code: "au",
      postal_code: "2000",
    },
  })
  const id = Array.isArray(created) ? created[0].id : created.id
  logger.info(`Created stock location "${NAME}" (${id}).`)
}
