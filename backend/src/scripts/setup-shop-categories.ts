/**
 * One-shot bootstrap for the Shop mega-menu category tree.
 *
 * Creates the four top-level audience categories (Mens / Womens / Kids / Accessories)
 * and their sub-categories — then walks every product in the catalog and assigns
 * categories based on `product_type.value` + title-cue inference.
 *
 * Inference rules + tree definition live in `backend/src/lib/shop-categories.ts`
 * so the AS Colour / FashionBiz / Aussie Pacific importers can call the same
 * helpers on freshly-imported batches.
 *
 * Idempotent — re-run any time. Set `DRY_RUN=1` to log without writing.
 *
 * Local: `cd backend && npx medusa exec src/scripts/setup-shop-categories.ts`
 * Railway: `cd /app/.medusa/server && npx medusa exec src/scripts/setup-shop-categories.js`
 */

import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  assignCategoriesToProducts,
  ensureCategoryTree,
} from "../lib/shop-categories"

export default async function setupShopCategories({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true"
  if (dryRun) {
    logger.info("DRY_RUN=1 — no writes will be performed")
  }

  logger.info("Step 1/2 — ensure category tree")
  const byHandle = await ensureCategoryTree(container, { dryRun, logger })

  logger.info("Step 2/2 — assign products to categories")
  const summary = await assignCategoriesToProducts(container, byHandle, {
    dryRun,
    logger,
  })

  logger.info("---")
  logger.info("Sample of mappings:")
  for (const line of summary.sample) logger.info(line)
  logger.info("---")
  logger.info("Assignment summary:")
  logger.info(`  Updated:    ${summary.updated}${dryRun ? " (dry-run)" : ""}`)
  logger.info(`  Skipped:    ${summary.skipped} (already correct)`)
  logger.info(`  Untyped:    ${summary.untyped} (no product_type or unmapped — left untouched)`)
  if (summary.failures > 0) {
    logger.info(`  Failures:   ${summary.failures}`)
  }

  logger.info("Done.")
}
