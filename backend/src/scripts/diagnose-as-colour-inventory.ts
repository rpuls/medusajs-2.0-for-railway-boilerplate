import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Read-only diagnostic: dumps the full state of AS Colour-shaped
 * inventory_item rows and their link rows so we can see why the
 * cleanup script's "orphan" check missed them.
 *
 * Hypothesis: when products were hard-deleted earlier the cascade
 * killed product_variant rows but left product_variant_inventory_item
 * link rows behind with deleted_at IS NULL, so the orphan-cleanup
 * script's whereNotExists check incorrectly thinks the inventory_item
 * is still linked.
 *
 * Usage (Railway):
 *   railway ssh
 *   cd /app/.medusa/server && npx medusa exec ./src/scripts/diagnose-as-colour-inventory.js
 */
export default async function diagnoseAsColourInventory({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const ASCOLOUR_SKU_REGEX = "^[0-9]{3,5}-[A-Z0-9]+"

  // 1) Which tables reference inventory_item via FK?
  const fkRows = await pg.raw(`
    SELECT DISTINCT tc.table_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu USING (constraint_name)
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_name = 'inventory_item'
    ORDER BY tc.table_name
  `)
  const fkTables = fkRows.rows.map((r: any) => r.table_name)
  logger.info(`FK refs to inventory_item: ${JSON.stringify(fkTables)}`)

  // 2) Find candidate link table(s) by name pattern
  const tablesRows = await pg.raw(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name LIKE '%inventory_item%'
      AND table_name != 'inventory_item'
    ORDER BY table_name
  `)
  const candidateTables = tablesRows.rows.map((r: any) => r.table_name)
  logger.info(`Candidate link tables: ${JSON.stringify(candidateTables)}`)

  // 3) How many inventory_items match the AS Colour regex? (including soft-deleted)
  const totalRows = await pg("inventory_item")
    .whereRaw("sku ~ ?", [ASCOLOUR_SKU_REGEX])
    .count<{ count: string }[]>("id as count")
  const total = Number(totalRows[0]?.count ?? 0)
  logger.info(`Total inventory_items matching AS Colour regex: ${total}`)

  if (!total) {
    logger.warn(
      "Regex matched zero rows. Either the SKUs use a different shape, or there really are no AS Colour inventory_items in the DB."
    )
    // Try a broader probe: look for the specific SKU from the import error
    const specific = await pg("inventory_item")
      .select("id", "sku", "deleted_at")
      .where("sku", "1000-BLACK-P-OS")
    logger.info(`Direct lookup for sku=1000-BLACK-P-OS: ${JSON.stringify(specific)}`)

    // And a LIKE probe in case the SKU format is different
    const likeRows = await pg("inventory_item")
      .select("id", "sku", "deleted_at")
      .whereRaw("sku LIKE '1000-%'")
      .limit(10)
    logger.info(`LIKE '1000-%' sample (up to 10): ${JSON.stringify(likeRows)}`)
    return
  }

  // 4) Sample 5 matched rows and dump full state including link rows + linked variants
  const samples: Array<{ id: string; sku: string; deleted_at: any }> =
    await pg("inventory_item")
      .select("id", "sku", "deleted_at")
      .whereRaw("sku ~ ?", [ASCOLOUR_SKU_REGEX])
      .orderBy("sku")
      .limit(5)

  for (const it of samples) {
    logger.info(`---`)
    logger.info(
      `inventory_item: sku=${it.sku} id=${it.id} deleted_at=${it.deleted_at}`
    )

    for (const tbl of candidateTables) {
      try {
        const links = await pg(tbl).select("*").where("inventory_item_id", it.id)
        if (!links.length) {
          logger.info(`  ${tbl}: 0 rows`)
          continue
        }
        logger.info(`  ${tbl}: ${links.length} rows`)
        for (const l of links) {
          // Try common variant column names
          const variantId =
            (l as any).variant_id ??
            (l as any).product_variant_id ??
            (l as any).variant
          let variantInfo: any = null
          if (variantId) {
            variantInfo = await pg("product_variant")
              .select("id", "sku", "deleted_at")
              .where("id", variantId)
              .first()
          }
          logger.info(
            `    link_row: link.deleted_at=${(l as any).deleted_at} variant_id=${variantId} variant=${
              variantInfo ? `sku=${variantInfo.sku} deleted_at=${variantInfo.deleted_at}` : "MISSING"
            }`
          )
        }
      } catch (e: any) {
        logger.info(`  ${tbl}: query failed (${e.message?.slice(0, 100)})`)
      }
    }
  }

  // 5) Aggregate: count how many of the matched inventory_items have:
  //    (a) no link rows at all
  //    (b) link rows whose variant is missing or soft-deleted
  //    (c) link rows whose variant is alive
  if (candidateTables.includes("product_variant_inventory_item")) {
    const aggRows = await pg.raw(
      `
      WITH matched AS (
        SELECT id FROM inventory_item WHERE sku ~ ?
      ),
      links AS (
        SELECT
          l.inventory_item_id,
          l.variant_id,
          l.deleted_at AS link_deleted_at,
          v.deleted_at AS variant_deleted_at,
          (v.id IS NULL) AS variant_missing
        FROM product_variant_inventory_item l
        LEFT JOIN product_variant v ON v.id = l.variant_id
        WHERE l.inventory_item_id IN (SELECT id FROM matched)
      )
      SELECT
        (SELECT COUNT(*) FROM matched) AS total_matched,
        (SELECT COUNT(*) FROM matched m WHERE NOT EXISTS (
          SELECT 1 FROM links l WHERE l.inventory_item_id = m.id
        )) AS no_link_rows,
        (SELECT COUNT(DISTINCT inventory_item_id) FROM links
          WHERE link_deleted_at IS NULL AND (variant_missing OR variant_deleted_at IS NOT NULL)
        ) AS link_to_dead_variant,
        (SELECT COUNT(DISTINCT inventory_item_id) FROM links
          WHERE link_deleted_at IS NULL AND NOT variant_missing AND variant_deleted_at IS NULL
        ) AS link_to_live_variant
      `,
      [ASCOLOUR_SKU_REGEX]
    )
    logger.info(`Aggregate: ${JSON.stringify(aggRows.rows[0])}`)
  }

  logger.info("Diagnostic complete (read-only, no mutations).")
}
