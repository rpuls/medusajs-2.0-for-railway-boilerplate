import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import syncAsColourInventory from "../jobs/sync-ascolour-inventory"

/**
 * Manual trigger for the hourly AS Colour inventory sync cron. Use after
 * fixing parsing bugs or whenever you don't want to wait for the next
 * scheduled run. Idempotent — same effect as the cron firing now.
 *
 * The cron uses a checkpoint cache (key `ascolour:inventory:lastSync`) so
 * incremental runs only fetch items updated since the last successful
 * sync. After a parsing-bug fix, the existing checkpoint is poison — set
 * FORCE_FULL_SYNC=1 to clear it and force a full sweep.
 *
 * Usage (Railway):
 *   cd /app/.medusa/server && npx medusa exec ./src/scripts/sync-ascolour-inventory-now.js
 *   FORCE_FULL_SYNC=1 cd /app/.medusa/server && npx medusa exec ./src/scripts/sync-ascolour-inventory-now.js
 */
export default async function syncAsColourInventoryNow({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const force =
    process.env.FORCE_FULL_SYNC === "1" ||
    process.env.FORCE_FULL_SYNC === "true"

  if (force) {
    try {
      const cache = container.resolve(Modules.CACHE) as any
      await cache.invalidate?.("ascolour:inventory:lastSync")
      // Older Medusa cache modules use .delete() — try both.
      await cache.delete?.("ascolour:inventory:lastSync")
      logger.info("Cleared AS Colour inventory checkpoint → forcing full sweep.")
    } catch (e: any) {
      logger.warn(
        `Could not clear checkpoint cache (${e?.message ?? e}). Sync will run with whatever checkpoint is present.`
      )
    }
  }

  await syncAsColourInventory(container)
}
