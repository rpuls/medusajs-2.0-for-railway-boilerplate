import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Permanently removes already-soft-deleted AS Colour products so their
 * variant SKUs free the unique constraint and a fresh import can succeed.
 *
 * Background: the original wipe-as-colour-products.ts script uses
 * Medusa's deleteProductsWorkflow which is a SOFT delete — the rows stay
 * in the table with `deleted_at` set, and crucially the variant SKU
 * unique constraint is enforced against soft-deleted rows too. So
 * re-running the API import collides on every SKU from the prior import.
 *
 * Safety:
 *  - Only touches products whose handle starts with "as-colour-"
 *  - Only touches products that are already soft-deleted (deleted_at set)
 *  - Refuses to run without --confirm (or HARD_DELETE_CONFIRM=1)
 *
 * Usage:
 *   railway ssh "cd /app/.medusa/server && npx medusa exec ./src/scripts/hard-delete-soft-deleted-as-colour.js"                    # dry run
 *   railway ssh "cd /app/.medusa/server && HARD_DELETE_CONFIRM=1 npx medusa exec ./src/scripts/hard-delete-soft-deleted-as-colour.js"  # actually delete
 */
export default async function hardDeleteSoftDeletedAsColour({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productService = container.resolve(Modules.PRODUCT) as any

  const confirm =
    (args ?? []).includes("--confirm") ||
    process.env.HARD_DELETE_CONFIRM === "1" ||
    process.env.HARD_DELETE_CONFIRM === "true"

  // Find every soft-deleted as-colour-* product (withDeleted to surface them).
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "title", "deleted_at"],
    pagination: { take: 5000 },
    withDeleted: true,
  } as any)

  const targets = (products ?? []).filter(
    (p: any) =>
      p?.deleted_at &&
      typeof p?.handle === "string" &&
      p.handle.startsWith("as-colour-")
  )

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

  // MedusaService.deleteProducts is the hard-delete; softDeleteProducts is the soft one.
  // Variants and other child rows cascade via FK / module ownership.
  const ids = targets.map((p: any) => p.id)
  const BATCH = 200
  let deleted = 0
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH)
    await productService.deleteProducts(batch)
    deleted += batch.length
    logger.info(`Hard-deleted ${deleted}/${ids.length} products...`)
  }
  logger.info(`Hard-delete complete: ${deleted} products permanently removed.`)
}
