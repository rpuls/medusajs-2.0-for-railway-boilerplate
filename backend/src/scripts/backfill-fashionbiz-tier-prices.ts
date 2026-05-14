import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  tierMinorToPriceSetRows,
  tierMinorToBulkPricingMetadata,
  type TierMoneyMinor,
} from "../utils/bulk-tier-prices"

/**
 * Backfill tier-priced price sets + array-shape bulk_pricing metadata onto
 * FashionBiz variants that were imported BEFORE the importer was patched
 * to emit the canonical 5-tier shape via the shared bulk-tier helpers.
 *
 * What the old importer wrote (per FashionBiz variant):
 *   prices:   5 rows derived directly from `ladder.*` (correct band shape)  ← qty bands OK
 *   metadata: { bulk_pricing: {                                              ← legacy: flat keys + a tiers array
 *     base_sale_price, tier_10_to_19_price, tier_20_to_49_price,
 *     tier_50_to_99_price, tier_100_plus_price,
 *     tiers: [{min_quantity, max_quantity, amount}, ...]                    ← added in de534e6
 *   }}
 *
 * What this script writes:
 *   prices:   5 rows via tierMinorToPriceSetRows                            ← byte-identical to current importer
 *   metadata: { bulk_pricing: { source, currency_code, tiers, ladder_note } ← same shape AS Colour writes
 *   }}
 *
 * The 5 tier amounts are recovered from the existing bulk_pricing metadata
 * — preferring the `tiers` array (added in de534e6) and falling back to the
 * legacy flat keys for variants imported before that fix. No external API
 * call is needed and the math stays identical to the original import (no
 * rounding drift).
 *
 * Idempotent — variants that already carry the new-shape bulk_pricing
 * (identified by `metadata.bulk_pricing.source` being one of the
 * "fashionbiz-*" tags this script writes, or any value other than the
 * legacy flat-key shape with no source) are skipped unless FORCE=1 is set.
 *
 * Usage (Railway):
 *   railway ssh
 *   cd /app/.medusa/server
 *   npx medusa exec ./src/scripts/backfill-fashionbiz-tier-prices.js
 *
 * Dry run (no writes, just report what would change):
 *   DRY_RUN=1 npx medusa exec ./src/scripts/backfill-fashionbiz-tier-prices.js
 *
 * Force re-apply even if already on the new shape:
 *   FORCE=1 npx medusa exec ./src/scripts/backfill-fashionbiz-tier-prices.js
 */
export default async function backfillFashionBizTierPrices({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const pricingModuleService = container.resolve(Modules.PRICING) as any
  const productModuleService = container.resolve(Modules.PRODUCT) as any
  const link = container.resolve(ContainerRegistrationKeys.LINK) as any

  const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true"
  const force = process.env.FORCE === "1" || process.env.FORCE === "true"

  // FashionBiz handle prefixes — handleForProduct() in
  // modules/fashionbiz/mapping.ts emits `{brand-slug}-{slug}`. Iterate each
  // prefix because query.graph's $like filter only takes one pattern.
  const FASHIONBIZ_HANDLE_PREFIXES = [
    "biz-collection-",
    "biz-care-",
    "biz-corporates-",
    "syzmik-",
    "good-mates-",
  ]

  const allProducts: any[] = []
  for (const prefix of FASHIONBIZ_HANDLE_PREFIXES) {
    const { data } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "handle",
        "metadata",
        "variants.id",
        "variants.sku",
        "variants.metadata",
        "variants.price_set.id",
      ],
      filters: {
        handle: { $like: `${prefix}%` } as any,
      },
    })
    allProducts.push(...(data ?? []))
  }

  logger.info(
    `Found ${allProducts.length} FashionBiz products to inspect (across ${FASHIONBIZ_HANDLE_PREFIXES.length} brand prefixes).`
  )

  let totalVariants = 0
  let updated = 0
  let skipped = 0
  let failed = 0
  let missingTiers = 0

  // Tags written by the new shape — used to identify already-migrated rows.
  const NEW_SHAPE_SOURCES = new Set([
    "fashionbiz-api",
    "fashionbiz-backfill",
    "spreadsheet-sync",
  ])

  for (const product of allProducts) {
    for (const variant of product.variants ?? []) {
      totalVariants++
      const variantId: string = variant.id
      const meta = (variant.metadata ?? {}) as Record<string, any>
      const bulk = (meta.bulk_pricing ?? {}) as Record<string, any>

      // Already on the new shape (identified by `source` tag)? Skip unless forced.
      // Note: variants imported by the importer between de534e6 and this fix
      // already had a tiers array but no `source` tag — those still need
      // backfill so the metadata object's keys match other importers.
      const hasNewShapeSource = typeof bulk?.source === "string" && NEW_SHAPE_SOURCES.has(bulk.source)
      if (hasNewShapeSource && !force) {
        skipped++
        continue
      }

      // Recover the 5 tier amounts. Prefer the `tiers` array (added in de534e6
      // for FashionBiz) since it's already in the canonical band shape;
      // fall back to legacy flat keys for variants imported before that.
      // Both store amounts in major units (dollars), so we ×100 → minor.
      const toMinor = (n: unknown): number | null => {
        if (typeof n !== "number" || !Number.isFinite(n)) return null
        return Math.round(n * 100)
      }

      let t1_9: number | null = null
      let t10_19: number | null = null
      let t20_49: number | null = null
      let t50_99: number | null = null
      let t100_plus: number | null = null

      if (Array.isArray(bulk?.tiers) && bulk.tiers.length) {
        const findAmt = (minQty: number): number | null => {
          const row = bulk.tiers.find(
            (t: any) => Number(t?.min_quantity) === minQty
          )
          return row ? toMinor(row.amount) : null
        }
        t1_9 = findAmt(1)
        t10_19 = findAmt(10)
        t20_49 = findAmt(20)
        t50_99 = findAmt(50)
        t100_plus = findAmt(100)
      }

      // Fall back to legacy flat keys if any tier is still null.
      if (t1_9 === null) t1_9 = toMinor(bulk.base_sale_price)
      if (t10_19 === null) t10_19 = toMinor(bulk.tier_10_to_19_price)
      if (t20_49 === null) t20_49 = toMinor(bulk.tier_20_to_49_price)
      if (t50_99 === null) t50_99 = toMinor(bulk.tier_50_to_99_price)
      if (t100_plus === null) t100_plus = toMinor(bulk.tier_100_plus_price)

      if (
        t1_9 === null ||
        t10_19 === null ||
        t20_49 === null ||
        t50_99 === null ||
        t100_plus === null
      ) {
        logger.warn(
          `  variant=${variantId} sku=${variant.sku}: missing legacy tier metadata (cannot backfill — fix in admin or re-import).`
        )
        missingTiers++
        continue
      }

      const tierMinor: TierMoneyMinor = {
        t1_9,
        t10_19,
        t20_49,
        t50_99,
        t100_plus,
      }

      const pricesForPriceSet = tierMinorToPriceSetRows(tierMinor)
      const bulkMeta = tierMinorToBulkPricingMetadata(tierMinor, "fashionbiz-backfill")

      if (dryRun) {
        logger.info(
          `  DRY: variant=${variantId} sku=${variant.sku} would set 5 price rows ($${(t1_9 / 100).toFixed(2)} / $${(t10_19 / 100).toFixed(2)} / $${(t20_49 / 100).toFixed(2)} / $${(t50_99 / 100).toFixed(2)} / $${(t100_plus / 100).toFixed(2)}+) and array-shape bulk_pricing.`
        )
        updated++
        continue
      }

      try {
        const priceSetId: string | undefined = variant.price_set?.id

        if (priceSetId) {
          await pricingModuleService.upsertPriceSets([
            { id: priceSetId, prices: pricesForPriceSet },
          ])
        } else {
          const created = await pricingModuleService.upsertPriceSets([
            { prices: pricesForPriceSet },
          ])
          const newId = created[0]?.id
          if (!newId) {
            logger.error(
              `  variant=${variantId} sku=${variant.sku}: failed to create price set.`
            )
            failed++
            continue
          }
          await link.create({
            [Modules.PRODUCT]: { variant_id: variantId },
            [Modules.PRICING]: { price_set_id: newId },
          })
        }

        // Overwrite metadata.bulk_pricing with the array shape, preserving
        // any non-bulk-pricing metadata (fashionbiz, garment_images, etc.).
        const nextMeta = { ...meta, bulk_pricing: bulkMeta }
        await productModuleService.updateProductVariants(variantId, {
          metadata: nextMeta,
        })

        updated++
        if (updated % 50 === 0) {
          logger.info(`  ...updated ${updated} variants`)
        }
      } catch (e: any) {
        logger.error(
          `  variant=${variantId} sku=${variant.sku}: backfill failed (${e?.message ?? e}).`
        )
        failed++
      }
    }
  }

  logger.info(
    `Backfill summary: total_variants=${totalVariants} updated=${updated} skipped_already_correct=${skipped} missing_legacy_tiers=${missingTiers} failed=${failed} dry_run=${dryRun}`
  )
}
