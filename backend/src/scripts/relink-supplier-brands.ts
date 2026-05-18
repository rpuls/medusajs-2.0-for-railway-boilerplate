/**
 * One-shot script to repair missing product ↔ Brand module links for all
 * supplier-imported products (AS Colour, FashionBiz brands, Aussie Pacific).
 *
 * Products were created by the import scripts but the brand-link step may
 * have failed or been skipped, so brand-filtered store pages return nothing.
 * This script walks the full product catalog and creates any missing links.
 *
 * Usage (local):
 *   DRY_RUN=1 pnpm --filter backend medusa exec relink-supplier-brands
 *   pnpm --filter backend medusa exec relink-supplier-brands
 *
 * Usage (Railway):
 *   cd /app/.medusa/server && npx medusa exec src/scripts/relink-supplier-brands.js
 *   DRY_RUN=1 cd /app/.medusa/server && npx medusa exec src/scripts/relink-supplier-brands.js
 *
 * Idempotent — safe to re-run. Already-linked products are silently skipped.
 */

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../modules/brand"

const PAGE_SIZE = 200

// Handle prefix → brand handle. Extend this map when new suppliers are added.
const HANDLE_PREFIX_TO_BRAND: Array<{ prefix: string; brandHandle: string }> = [
  { prefix: "as-colour-", brandHandle: "as-colour" },
  { prefix: "syzmik-", brandHandle: "syzmik" },
  { prefix: "biz-collection-", brandHandle: "biz-collection" },
  { prefix: "biz-care-", brandHandle: "biz-care" },
  { prefix: "biz-corporates-", brandHandle: "biz-corporates" },
  { prefix: "aussie-pacific-", brandHandle: "aussie-pacific" },
]

export default async function relinkSupplierBrands({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK) as any
  const pgConnection = container.resolve(
    ContainerRegistrationKeys.PG_CONNECTION
  ) as any
  const brandService = container.resolve(BRAND_MODULE) as any

  const dryRun =
    process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true"

  if (dryRun) {
    logger.info("[relink-supplier-brands] DRY RUN — no links will be created.")
  }

  // Pre-flight: confirm we resolved a real link service. Past runs that "succeeded"
  // produced 0 rows in the DB — likely because `link` was undefined and the calls
  // silently no-op'd. Fail loudly if we can't find the service.
  if (!link || typeof link.create !== "function") {
    logger.error(
      `[relink-supplier-brands] container.resolve(LINK) returned ${typeof link}; ` +
        `link.create is ${typeof link?.create}. Aborting — links cannot be created.`
    )
    return
  }
  logger.info(
    `[relink-supplier-brands] Link service resolved OK. Methods: ${Object.keys(link).join(", ")}`
  )

  // Pre-flight: confirm the link table exists. If sync-links never ran, the table is
  // missing and every create call will fail. Knex throws on missing tables.
  try {
    const countRow: { count?: string } | undefined = await pgConnection(
      "product_product_brand_brand"
    )
      .count({ count: "*" })
      .first()
    logger.info(
      `[relink-supplier-brands] product_product_brand_brand currently has ${countRow?.count ?? "?"} row(s) before run.`
    )
  } catch (err: any) {
    logger.error(
      `[relink-supplier-brands] Cannot read product_product_brand_brand table: ${err?.message ?? err}. ` +
        `Run "npx medusa db:sync-links" then re-run this script.`
    )
    return
  }

  // Build brand-handle → brand-id lookup
  const allBrands = (await brandService.listBrands({})) as Array<{
    id: string
    name: string
    handle: string
  }>
  const brandIdByHandle = new Map<string, string>(
    allBrands.map((b) => [(b.handle ?? "").toLowerCase(), b.id])
  )

  logger.info(
    `[relink-supplier-brands] Loaded ${allBrands.length} brand(s). ` +
      `Watching prefixes: ${HANDLE_PREFIX_TO_BRAND.map((p) => p.prefix).join(", ")}`
  )

  // Verify all target brands exist before walking the catalog
  const missingHandles: string[] = []
  for (const { brandHandle } of HANDLE_PREFIX_TO_BRAND) {
    if (!brandIdByHandle.has(brandHandle)) {
      missingHandles.push(brandHandle)
    }
  }
  if (missingHandles.length) {
    logger.warn(
      `[relink-supplier-brands] Missing brand entities for: ${missingHandles.join(", ")}. ` +
        `Run migrate-products-to-brand-entity first for these handles. Their products will be skipped.`
    )
  }

  const counts = {
    linked: 0,
    alreadyLinked: 0,
    skipped: 0,
    errors: 0,
  }

  let offset = 0
  let totalProcessed = 0

  while (true) {
    const { data: page } = await query.graph({
      entity: "product",
      fields: ["id", "handle"],
      pagination: { take: PAGE_SIZE, skip: offset },
    })

    if (!page?.length) break

    for (const product of page as Array<{ id: string; handle: string }>) {
      const handle = product.handle ?? ""

      const match = HANDLE_PREFIX_TO_BRAND.find((p) =>
        handle.startsWith(p.prefix)
      )
      if (!match) {
        counts.skipped++
        continue
      }

      const brandId = brandIdByHandle.get(match.brandHandle)
      if (!brandId) {
        // Brand entity missing — already warned above
        counts.skipped++
        continue
      }

      if (dryRun) {
        logger.info(
          `[relink-supplier-brands] [DRY RUN] Would link ${handle} → ${match.brandHandle}`
        )
        counts.linked++
        continue
      }

      try {
        await link.create({
          [Modules.PRODUCT]: { product_id: product.id },
          [BRAND_MODULE]: { brand_id: brandId },
        })
        counts.linked++
        if (counts.linked <= 5 || counts.linked % 50 === 0) {
          logger.info(
            `[relink-supplier-brands] Linked ${handle} → ${match.brandHandle} (cumulative: ${counts.linked})`
          )
        }
      } catch (err: any) {
        if (err?.message?.includes("Cannot create multiple links")) {
          counts.alreadyLinked++
        } else {
          counts.errors++
          // Log every error in full — past silent failures are exactly what we're
          // trying to surface here. Stack included for first 5 errors.
          const detail = counts.errors <= 5
            ? err?.stack ?? `${err?.message ?? err}`
            : err?.message ?? err
          logger.warn(
            `[relink-supplier-brands] Failed to link ${handle} → ${match.brandHandle}: ${detail}`
          )
        }
      }
    }

    totalProcessed += page.length
    if (page.length < PAGE_SIZE) break
    offset += page.length
  }

  // Post-run verification: count actual rows in the link table per brand. The previous
  // "Linked: 345" log was misleading because counts.linked was incremented even when
  // link.create() silently no-op'd. This count is from the database directly.
  if (!dryRun) {
    try {
      const rows: Array<{ brand_id: string; count: string }> = await pgConnection(
        "product_product_brand_brand"
      )
        .whereNull("deleted_at")
        .groupBy("brand_id")
        .select("brand_id")
        .count("* as count")
      const total = rows.reduce((s, r) => s + parseInt(r.count ?? "0", 10), 0)
      logger.info(
        `[relink-supplier-brands] Post-run link table state: ${total} total row(s) across ${rows.length} brand(s).`
      )
      const brandNameById = new Map(allBrands.map((b) => [b.id, b.handle]))
      for (const r of rows) {
        logger.info(
          `[relink-supplier-brands]   ${brandNameById.get(r.brand_id) ?? r.brand_id}: ${r.count} link(s)`
        )
      }
    } catch (err: any) {
      logger.warn(
        `[relink-supplier-brands] Post-run verification query failed: ${err?.message ?? err}`
      )
    }
  }

  logger.info(
    `[relink-supplier-brands] Done. Scanned ${totalProcessed} products. ` +
      `Linked: ${counts.linked}, Already linked: ${counts.alreadyLinked}, ` +
      `Skipped (non-supplier): ${counts.skipped}, Errors: ${counts.errors}`
  )
}
