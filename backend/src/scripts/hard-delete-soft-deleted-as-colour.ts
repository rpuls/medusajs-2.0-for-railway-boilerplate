import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Permanently removes already-soft-deleted AS Colour products via raw
 * SQL so their variant SKUs free the unique constraint and a fresh
 * import can succeed.
 *
 * Why raw SQL: MedusaService.deleteProducts is the hard-delete API, but
 * its internal find filters skip soft-deleted rows, so calling it with
 * ids of soft-deleted products silently does nothing. Going through the
 * Knex connection bypasses that filter. Product → variant CASCADE FKs
 * clean up the children automatically.
 *
 * Safety:
 *  - Only touches products whose handle starts with "as-colour-"
 *  - Only touches products that are already soft-deleted (deleted_at set)
 *  - Refuses to run without --confirm (or HARD_DELETE_CONFIRM=1)
 *  - Wraps the delete in a transaction
 *
 * Usage:
 *   railway ssh "cd /app/.medusa/server && npx medusa exec ./src/scripts/hard-delete-soft-deleted-as-colour.js"                    # dry run
 *   railway ssh "cd /app/.medusa/server && HARD_DELETE_CONFIRM=1 npx medusa exec ./src/scripts/hard-delete-soft-deleted-as-colour.js"  # actually delete
 */
export default async function hardDeleteSoftDeletedAsColour({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const confirm =
    (args ?? []).includes("--confirm") ||
    process.env.HARD_DELETE_CONFIRM === "1" ||
    process.env.HARD_DELETE_CONFIRM === "true"

  // Find every soft-deleted as-colour-* product directly via SQL.
  const targets: Array<{ id: string; handle: string; title: string }> = await pg("product")
    .select("id", "handle", "title")
    .whereLike("handle", "as-colour-%")
    .whereNotNull("deleted_at")

  if (!targets.length) {
    logger.info("No soft-deleted as-colour-* products to hard-delete.")
    return
  }

  logger.info(
    `Found ${targets.length} soft-deleted as-colour-* products eligible for hard delete.`
  )
  for (const p of targets.slice(0, 10)) {
    logger.info(`  - ${p.handle} :: ${p.title}`)
  }
  if (targets.length > 10) logger.info(`  ... and ${targets.length - 10} more`)

  if (!confirm) {
    logger.warn(
      "Dry run only — re-run with HARD_DELETE_CONFIRM=1 to permanently delete these products + variants."
    )
    return
  }

  const ids = targets.map((p) => p.id)
  const BATCH = 200
  let deleted = 0

  await pg.transaction(async (trx: any) => {
    for (let i = 0; i < ids.length; i += BATCH) {
      const batch = ids.slice(i, i + BATCH)
      // CASCADE FKs on product -> product_variant, product_option, product_image, etc.
      // will clean up the children. price_set + inventory rows are owned by other
      // modules (no FK back to product) — we'll leave their orphans alone; they're
      // harmless and re-import won't collide with them.
      const result = await trx("product").whereIn("id", batch).del()
      deleted += result
      logger.info(`Hard-deleted ${deleted}/${ids.length} products...`)
    }
  })

  logger.info(`Hard-delete complete: ${deleted} products permanently removed.`)
}
