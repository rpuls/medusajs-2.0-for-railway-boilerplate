import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Permanently removes orphaned `inventory_item` rows whose SKU matches
 * the AS Colour pattern but no longer has a backing product_variant.
 *
 * Why this exists: products and inventory_items live in different Medusa
 * modules with no foreign-key cascade between them. Deleting a product
 * (hard or soft) does NOT remove its associated inventory_item rows.
 * Re-importing the same SKUs then fails with:
 *   "Inventory item with sku: <SKU>, already exists."
 * because the unique constraint on inventory_item.sku is still held by
 * the orphan rows.
 *
 * AS Colour SKU pattern: 3-5 digit style code + "-" + colour + ...
 *
 * Safety:
 *  - Only touches rows whose SKU matches the AS Colour regex
 *  - Only touches rows with NO variant_inventory_item linkage (orphans)
 *  - Refuses to run without HARD_DELETE_CONFIRM=1
 *
 * Usage:
 *   railway ssh "cd /app/.medusa/server && npx medusa exec ./src/scripts/hard-delete-orphan-inventory-items.js"                       # dry run
 *   railway ssh "cd /app/.medusa/server && HARD_DELETE_CONFIRM=1 npx medusa exec ./src/scripts/hard-delete-orphan-inventory-items.js" # actually delete
 */
export default async function hardDeleteOrphanInventoryItems({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const confirm =
    process.env.HARD_DELETE_CONFIRM === "1" ||
    process.env.HARD_DELETE_CONFIRM === "true"

  // SKU regex: 3-5 digit style code + "-" + at least one segment.
  // Postgres regex syntax — same as the JS regex used in
  // wipe-as-colour-products.ts SKU_PATTERN.
  const ASCOLOUR_SKU_REGEX = "^[0-9]{3,5}-[A-Z0-9]+"

  // Find inventory_items matching AS Colour SKU pattern that have no
  // matching variant_inventory_item link (orphans). Module Links live in
  // their own table — use a NOT EXISTS for portability.
  const targets: Array<{ id: string; sku: string }> = await pg("inventory_item as ii")
    .select("ii.id", "ii.sku")
    .whereRaw(`ii.sku ~ ?`, [ASCOLOUR_SKU_REGEX])
    .whereNotExists(function () {
      this.select("*")
        .from("product_variant_inventory_item as link")
        .whereRaw("link.inventory_item_id = ii.id")
        .whereNull("link.deleted_at")
    })

  if (!targets.length) {
    logger.info("No orphaned AS Colour-shaped inventory_items found.")
    return
  }

  logger.info(`Found ${targets.length} orphaned inventory_items to hard-delete.`)
  for (const t of targets.slice(0, 10)) {
    logger.info(`  - sku=${t.sku} (id=${t.id})`)
  }
  if (targets.length > 10) logger.info(`  ... and ${targets.length - 10} more`)

  if (!confirm) {
    logger.warn(
      "Dry run only — re-run with HARD_DELETE_CONFIRM=1 to permanently delete these inventory_items."
    )
    return
  }

  const ids = targets.map((t) => t.id)
  const BATCH = 500
  let deleted = 0
  await pg.transaction(async (trx: any) => {
    for (let i = 0; i < ids.length; i += BATCH) {
      const batch = ids.slice(i, i + BATCH)
      // inventory_level rows reference inventory_item_id — clean those first.
      await trx("inventory_level").whereIn("inventory_item_id", batch).del()
      const result = await trx("inventory_item").whereIn("id", batch).del()
      deleted += result
      logger.info(`Hard-deleted ${deleted}/${ids.length} inventory_items...`)
    }
  })

  logger.info(`Hard-delete complete: ${deleted} orphaned inventory_items removed.`)
}
