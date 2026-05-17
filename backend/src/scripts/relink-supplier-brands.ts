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
  const brandService = container.resolve(BRAND_MODULE) as any

  const dryRun =
    process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true"

  if (dryRun) {
    logger.info("[relink-supplier-brands] DRY RUN — no links will be created.")
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
        logger.info(`[relink-supplier-brands] Linked ${handle} → ${match.brandHandle}`)
      } catch (err: any) {
        if (err?.message?.includes("Cannot create multiple links")) {
          counts.alreadyLinked++
        } else {
          counts.errors++
          logger.warn(
            `[relink-supplier-brands] Failed to link ${handle}: ${err?.message ?? err}`
          )
        }
      }
    }

    totalProcessed += page.length
    if (page.length < PAGE_SIZE) break
    offset += page.length
  }

  logger.info(
    `[relink-supplier-brands] Done. Scanned ${totalProcessed} products. ` +
      `Linked: ${counts.linked}, Already linked: ${counts.alreadyLinked}, ` +
      `Skipped (non-supplier): ${counts.skipped}, Errors: ${counts.errors}`
  )
}
