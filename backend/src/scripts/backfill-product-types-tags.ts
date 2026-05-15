/**
 * Backfill product_type and tags on existing AS Colour and FashionBiz products.
 *
 * FashionBiz: reads classification data from stored metadata.fashionbiz.*
 *   — no API call needed.
 * AS Colour: re-fetches the full catalog from the AS Colour API to get
 *   category/gender/fit (these were not stored in metadata before this feature).
 *   Also updates metadata.ascolour to add those fields for idempotent future runs.
 *
 * Usage:
 *   # Dry run (log only, no writes)
 *   BACKFILL_DRY_RUN=1 npx medusa exec src/scripts/backfill-product-types-tags.ts
 *
 *   # FashionBiz only
 *   BACKFILL_SOURCE=fashionbiz npx medusa exec src/scripts/backfill-product-types-tags.ts
 *
 *   # AS Colour only (requires AS Colour API credentials in env)
 *   BACKFILL_SOURCE=ascolour npx medusa exec src/scripts/backfill-product-types-tags.ts
 *
 *   # Re-apply even if type_id already set
 *   BACKFILL_FORCE=1 npx medusa exec src/scripts/backfill-product-types-tags.ts
 *
 *   # Cap products per source (for testing)
 *   BACKFILL_LIMIT=10 npx medusa exec src/scripts/backfill-product-types-tags.ts
 *
 * On Railway: cd /app/.medusa/server && npx medusa exec src/scripts/backfill-product-types-tags.js
 */

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ASCOLOUR_MODULE } from "../modules/ascolour"
import AsColourService from "../modules/ascolour/service"
import { FASHIONBIZ_MODULE } from "../modules/fashionbiz"
import { classifyAsColourProduct, classifyFashionBizProduct } from "../lib/product-taxonomy"
import {
  fetchAllProductTypes,
  fetchAllProductTags,
  applyTypeAndTagsToProduct,
  ProductModuleForSync,
} from "../lib/product-type-tag-sync"

const FASHIONBIZ_HANDLE_PREFIXES = [
  "biz-collection-",
  "biz-care-",
  "biz-corporates-",
  "syzmik-",
  "good-mates-",
]

type Counters = {
  scanned: number
  updated: number
  skipped: number
  noData: number
  failed: number
}

function emptyCounters(): Counters {
  return { scanned: 0, updated: 0, skipped: 0, noData: 0, failed: 0 }
}

export default async function backfillProductTypesTags({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule = container.resolve(Modules.PRODUCT) as unknown as ProductModuleForSync

  const dryRun =
    process.env.BACKFILL_DRY_RUN === "1" || process.env.BACKFILL_DRY_RUN === "true"
  const force =
    process.env.BACKFILL_FORCE === "1" || process.env.BACKFILL_FORCE === "true"
  const source = process.env.BACKFILL_SOURCE ?? "all"
  const limit = process.env.BACKFILL_LIMIT ? parseInt(process.env.BACKFILL_LIMIT, 10) : undefined

  logger.info(
    `backfill-product-types-tags: dryRun=${dryRun}, force=${force}, source=${source}, limit=${limit ?? "all"}`
  )

  // Pre-fetch type and tag caches once for the whole run
  const typeCache = await fetchAllProductTypes(productModule)
  const tagCache = await fetchAllProductTags(productModule)
  const unknownTaxonomy: string[] = []

  const fbCounters = emptyCounters()
  const asCounters = emptyCounters()

  // ---------------------------------------------------------------------------
  // FashionBiz: all needed classification data is already in metadata.fashionbiz
  // ---------------------------------------------------------------------------
  if (source === "all" || source === "fashionbiz") {
    logger.info("--- FashionBiz backfill ---")

    // Collect products across all brand handle prefixes
    const allFbProducts: any[] = []
    for (const prefix of FASHIONBIZ_HANDLE_PREFIXES) {
      const { data } = await query.graph({
        entity: "product",
        fields: ["id", "handle", "type_id", "metadata"],
        filters: { handle: { $like: `${prefix}%` } } as any,
      })
      allFbProducts.push(...(data ?? []))
    }
    logger.info(`Found ${allFbProducts.length} FashionBiz products in DB.`)

    let processed = 0
    for (const product of allFbProducts) {
      if (limit !== undefined && processed >= limit) break
      fbCounters.scanned++

      if (product.type_id && !force) {
        fbCounters.skipped++
        continue
      }

      const fb = product.metadata?.fashionbiz
      if (!fb) {
        fbCounters.noData++
        logger.warn(`  ${product.handle}: missing metadata.fashionbiz — skipping`)
        continue
      }

      const partial = {
        slug: fb.slug ?? product.handle,
        tags: Array.isArray(fb.tags) ? fb.tags : [],
        gender: fb.gender ?? undefined,
        fit: fb.fit ?? undefined,
        sleeve: fb.sleeve ?? undefined,
        industry: fb.industry ?? undefined,
        tech: fb.tech ?? undefined,
      }

      const { productType, tags } = classifyFashionBizProduct(partial as any, unknownTaxonomy)

      if (!productType && !tags.length) {
        fbCounters.noData++
        logger.info(`  ${product.handle}: no type or tags derived — skipping`)
        continue
      }

      if (dryRun) {
        logger.info(
          `  DRY: ${product.handle} → type="${productType ?? "(none)"}" tags=[${tags.join(", ")}]`
        )
        fbCounters.updated++
        processed++
        continue
      }

      try {
        await applyTypeAndTagsToProduct({
          productModule,
          productId: product.id,
          productType,
          tags,
          typeCache,
          tagCache,
        })
        fbCounters.updated++
        processed++
        if (fbCounters.updated % 25 === 0) {
          logger.info(`  ...updated ${fbCounters.updated} FashionBiz products`)
        }
      } catch (err: any) {
        fbCounters.failed++
        processed++
        logger.warn(`  ${product.handle}: failed — ${err?.message ?? err}`)
      }
    }

    logger.info(
      `FashionBiz: scanned=${fbCounters.scanned} updated=${fbCounters.updated} ` +
        `skipped=${fbCounters.skipped} noData=${fbCounters.noData} failed=${fbCounters.failed}`
    )
  }

  // ---------------------------------------------------------------------------
  // AS Colour: re-fetch catalog from API (category/gender/fit not in old metadata)
  // Also updates metadata.ascolour to store those fields for future runs.
  // ---------------------------------------------------------------------------
  if (source === "all" || source === "ascolour") {
    logger.info("--- AS Colour backfill ---")

    // Fetch existing AS Colour products from DB
    const { data: asDbProducts } = await query.graph({
      entity: "product",
      fields: ["id", "handle", "type_id", "metadata"],
      filters: { handle: { $like: "as-colour-%" } } as any,
    })

    // Key by styleCode stored in metadata (most reliable; handle is derived from styleName)
    const dbByStyleCode = new Map<string, any>()
    for (const p of asDbProducts ?? []) {
      const styleCode = p.metadata?.ascolour?.styleCode
      if (styleCode) dbByStyleCode.set(String(styleCode), p)
    }
    logger.info(`Found ${dbByStyleCode.size} AS Colour products in DB (keyed by styleCode).`)

    if (!dbByStyleCode.size) {
      logger.info("No AS Colour products in DB — skipping AS Colour backfill.")
    } else {
      // Re-fetch catalog from the API to get category/gender/fit
      logger.info("Fetching AS Colour catalog from API…")
      let apiProducts: Awaited<ReturnType<AsColourService["fetchAllProducts"]>> = []
      try {
        const asColourService = container.resolve(ASCOLOUR_MODULE) as AsColourService
        apiProducts = await asColourService.fetchAllProducts()
        logger.info(`Fetched ${apiProducts.length} products from AS Colour API.`)
      } catch (err: any) {
        logger.error(
          `Failed to fetch AS Colour catalog from API: ${err?.message ?? err}. ` +
            `Skipping AS Colour backfill. (Is ASCOLOUR_MODULE configured?)`
        )
        apiProducts = []
      }

      let processed = 0
      for (const apiProduct of apiProducts) {
        if (limit !== undefined && processed >= limit) break

        const dbProduct = dbByStyleCode.get(apiProduct.styleCode)
        if (!dbProduct) continue
        asCounters.scanned++

        if (dbProduct.type_id && !force) {
          asCounters.skipped++
          continue
        }

        const { productType, tags } = classifyAsColourProduct(apiProduct, unknownTaxonomy)

        if (!productType && !tags.length) {
          asCounters.noData++
          logger.info(
            `  ${dbProduct.handle} (${apiProduct.styleCode}): no category/gender/fit — skipping`
          )
          continue
        }

        if (dryRun) {
          logger.info(
            `  DRY: ${dbProduct.handle} (${apiProduct.styleCode}) → type="${productType ?? "(none)"}" tags=[${tags.join(", ")}]`
          )
          asCounters.updated++
          processed++
          continue
        }

        try {
          await applyTypeAndTagsToProduct({
            productModule,
            productId: dbProduct.id,
            productType,
            tags,
            typeCache,
            tagCache,
          })

          // Also persist category/gender/fit into metadata.ascolour so future
          // backfill runs can skip the API call for already-enriched products.
          const existingMeta: Record<string, any> = dbProduct.metadata ?? {}
          await (productModule as any).updateProducts(dbProduct.id, {
            metadata: {
              ...existingMeta,
              ascolour: {
                ...(existingMeta.ascolour ?? {}),
                styleCode: apiProduct.styleCode,
                category: apiProduct.category ?? null,
                gender: (apiProduct as any).gender ?? null,
                fit: (apiProduct as any).fit ?? null,
                lastSync: new Date().toISOString(),
              },
            },
          })

          asCounters.updated++
          processed++
          if (asCounters.updated % 25 === 0) {
            logger.info(`  ...updated ${asCounters.updated} AS Colour products`)
          }
        } catch (err: any) {
          asCounters.failed++
          processed++
          logger.warn(
            `  ${dbProduct.handle} (${apiProduct.styleCode}): failed — ${err?.message ?? err}`
          )
        }
      }
    }

    logger.info(
      `AS Colour: scanned=${asCounters.scanned} updated=${asCounters.updated} ` +
        `skipped=${asCounters.skipped} noData=${asCounters.noData} failed=${asCounters.failed}`
    )
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  if (unknownTaxonomy.length) {
    logger.warn(
      `=== UNKNOWN TAXONOMY VALUES (${unknownTaxonomy.length}) — add these to product-taxonomy.ts alias maps: ===`
    )
    for (const msg of unknownTaxonomy) logger.warn(`  ${msg}`)
  }

  logger.info(
    `Backfill complete. ` +
      (source === "all" || source === "fashionbiz"
        ? `FashionBiz: scanned=${fbCounters.scanned} updated=${fbCounters.updated} skipped=${fbCounters.skipped} noData=${fbCounters.noData} failed=${fbCounters.failed}. `
        : "") +
      (source === "all" || source === "ascolour"
        ? `AS Colour: scanned=${asCounters.scanned} updated=${asCounters.updated} skipped=${asCounters.skipped} noData=${asCounters.noData} failed=${asCounters.failed}. `
        : "") +
      `dryRun=${dryRun}.`
  )
}
