import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * One-shot diagnostic: finds product_variant rows whose SKU collides
 * with what an AS Colour catalog import wants to insert. Reports both
 * live and soft-deleted rows so we can decide whether the right fix is
 * a hard-delete or a rename strategy.
 *
 * Usage (read-only — does not modify anything):
 *   railway ssh "cd /app/.medusa/server && npx medusa exec ./src/scripts/diagnose-as-colour-sku-conflicts.js"
 */
export default async function diagnoseAsColourSkuConflicts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // Cast a wide net — anything with an AS Colour-shaped SKU pattern
  // (4-digit style code + "-" + colour + ...). withDeleted: true so
  // we also see soft-deleted rows, which still hold the unique constraint.
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "sku", "title", "deleted_at", "product.id", "product.handle", "product.title", "product.deleted_at"],
    pagination: { take: 5000 },
    withDeleted: true,
  } as any)

  const skuPattern = /^\d{3,5}-[A-Z0-9]+/
  const matches = (variants ?? []).filter((v: any) => v?.sku && skuPattern.test(v.sku))

  if (!matches.length) {
    logger.info("No variants with AS Colour-shaped SKUs found (live or deleted).")
    return
  }

  const live = matches.filter((v: any) => !v.deleted_at && !v.product?.deleted_at)
  const softDeleted = matches.filter((v: any) => v.deleted_at || v.product?.deleted_at)

  logger.info(
    `Found ${matches.length} AS Colour-shaped SKUs total: ${live.length} live, ${softDeleted.length} soft-deleted.`
  )

  const sample = (rows: any[], label: string) => {
    if (!rows.length) return
    logger.info(`\n  ${label} (showing first 20):`)
    for (const v of rows.slice(0, 20)) {
      const productLabel = v.product
        ? `${v.product.handle} :: ${v.product.title}${v.product.deleted_at ? " [PRODUCT DELETED]" : ""}`
        : "(no product)"
      const variantState = v.deleted_at ? " [VARIANT DELETED]" : ""
      logger.info(`    ${v.sku}${variantState}  →  ${productLabel}`)
    }
    if (rows.length > 20) logger.info(`    ... and ${rows.length - 20} more`)
  }

  sample(live, "LIVE variants (visible in admin)")
  sample(softDeleted, "SOFT-DELETED variants (hidden in admin, still hold SKU constraint)")
}
