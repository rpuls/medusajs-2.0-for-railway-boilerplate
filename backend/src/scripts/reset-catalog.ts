/**
 * Reset the product catalog — wipes products, product types, and product tags. Preserves
 * everything else (regions, sales channels, stock locations, customers, designs, brands,
 * collections, categories, payment config, etc.).
 *
 * Usage (from `backend/`):
 *   pnpm run reset-catalog                # dry run: counts only
 *   pnpm run reset-catalog -- --apply     # actually delete
 *
 * Flags (combine as needed):
 *   --apply                  Commit the deletes (default: dry-run)
 *   --skip-products          Keep products
 *   --skip-types             Keep product types
 *   --skip-tags              Keep product tags
 *   --also-categories        Also delete product_category rows
 *   --also-collections       Also delete product_collection rows
 *   --also-brands            Also delete brand rows (rarely wanted — they're tiny)
 *
 * Env: RESET_CATALOG_APPLY=1 is equivalent to --apply.
 *
 * Designed for one-off cleanup before a fresh import. Always works against the configured
 * DATABASE_URL — point it at Railway by running through `railway run` or via a Railway
 * one-off shell. **Take a DB backup first.**
 */

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows"

const PAGE_SIZE = 200
const DELETE_BATCH_SIZE = 50

const chunk = <T>(values: T[], size: number): T[][] => {
  const out: T[][] = []
  for (let i = 0; i < values.length; i += size) {
    out.push(values.slice(i, i + size))
  }
  return out
}

export default async function resetCatalog({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: Record<string, unknown>) => Promise<{ data?: Array<{ id: string }> }>
  }
  const productService = container.resolve(Modules.PRODUCT) as {
    deleteProductTypes: (ids: string[]) => Promise<unknown>
    deleteProductTags: (ids: string[]) => Promise<unknown>
    deleteProductCategories?: (ids: string[]) => Promise<unknown>
    deleteProductCollections?: (ids: string[]) => Promise<unknown>
  }

  const all = [...args, ...process.argv.slice(2)]
  const apply = all.includes("--apply") || process.env.RESET_CATALOG_APPLY === "1"
  const skipProducts = all.includes("--skip-products")
  const skipTypes = all.includes("--skip-types")
  const skipTags = all.includes("--skip-tags")
  const alsoCategories = all.includes("--also-categories")
  const alsoCollections = all.includes("--also-collections")
  const alsoBrands = all.includes("--also-brands")

  logger.info(
    `reset-catalog starting (mode: ${apply ? "APPLY" : "DRY-RUN"}; skip-products=${skipProducts}, skip-types=${skipTypes}, skip-tags=${skipTags}, also-categories=${alsoCategories}, also-collections=${alsoCollections}, also-brands=${alsoBrands})`
  )

  const collect = async (entity: string): Promise<string[]> => {
    const ids: string[] = []
    let offset = 0
    while (true) {
      const { data } = await query.graph({
        entity,
        fields: ["id"],
        pagination: { take: PAGE_SIZE, skip: offset },
      })
      const page = data ?? []
      if (!page.length) break
      for (const row of page) ids.push(row.id)
      offset += PAGE_SIZE
    }
    return ids
  }

  // ----- Products (via workflow, handles variants + price-set + links) -----------------------
  if (!skipProducts) {
    const productIds = await collect("product")
    logger.info(`  products: ${productIds.length} found`)
    if (apply && productIds.length) {
      for (const idsChunk of chunk(productIds, DELETE_BATCH_SIZE)) {
        await deleteProductsWorkflow(container).run({ input: { ids: idsChunk } })
      }
      logger.info(`  products: deleted ${productIds.length}`)
    }
  }

  // ----- Categories (optional) ---------------------------------------------------------------
  if (alsoCategories) {
    const ids = await collect("product_category")
    logger.info(`  categories: ${ids.length} found`)
    if (apply && ids.length && productService.deleteProductCategories) {
      for (const c of chunk(ids, DELETE_BATCH_SIZE)) {
        await productService.deleteProductCategories(c)
      }
      logger.info(`  categories: deleted ${ids.length}`)
    }
  }

  // ----- Collections (optional) --------------------------------------------------------------
  if (alsoCollections) {
    const ids = await collect("product_collection")
    logger.info(`  collections: ${ids.length} found`)
    if (apply && ids.length && productService.deleteProductCollections) {
      for (const c of chunk(ids, DELETE_BATCH_SIZE)) {
        await productService.deleteProductCollections(c)
      }
      logger.info(`  collections: deleted ${ids.length}`)
    }
  }

  // ----- Types -------------------------------------------------------------------------------
  if (!skipTypes) {
    const ids = await collect("product_type")
    logger.info(`  types: ${ids.length} found`)
    if (apply && ids.length) {
      for (const c of chunk(ids, DELETE_BATCH_SIZE)) {
        await productService.deleteProductTypes(c)
      }
      logger.info(`  types: deleted ${ids.length}`)
    }
  }

  // ----- Tags --------------------------------------------------------------------------------
  if (!skipTags) {
    const ids = await collect("product_tag")
    logger.info(`  tags: ${ids.length} found`)
    if (apply && ids.length) {
      for (const c of chunk(ids, DELETE_BATCH_SIZE)) {
        await productService.deleteProductTags(c)
      }
      logger.info(`  tags: deleted ${ids.length}`)
    }
  }

  // ----- Brands (optional) -------------------------------------------------------------------
  if (alsoBrands) {
    const ids = await collect("brand")
    logger.info(`  brands: ${ids.length} found`)
    if (apply && ids.length) {
      const brandService = container.resolve("brand") as {
        deleteBrands: (ids: string[]) => Promise<unknown>
      }
      for (const c of chunk(ids, DELETE_BATCH_SIZE)) {
        await brandService.deleteBrands(c)
      }
      logger.info(`  brands: deleted ${ids.length}`)
    }
  }

  if (!apply) {
    logger.info("DRY-RUN complete. Re-run with `-- --apply` to commit.")
  } else {
    logger.info("Reset committed.")
  }
}
