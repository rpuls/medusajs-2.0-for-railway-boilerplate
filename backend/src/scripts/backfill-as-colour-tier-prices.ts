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
 * AS Colour variants that were imported BEFORE the importer was patched to
 * emit the canonical 5-tier shape.
 *
 * What the old importer wrote (per AS Colour variant):
 *   prices:   [{ amount: <base>, currency_code: "aud" }]                     ← single price, no qty bands
 *   metadata: { bulk_pricing: {                                              ← legacy flat-key shape
 *     base_sale_price, tier_10_to_19_price, tier_20_to_49_price,
 *     tier_50_to_99_price, tier_100_plus_price
 *   }}
 *
 * What this script writes:
 *   prices:   5 rows with min_quantity / max_quantity bands                  ← same as spreadsheet sync
 *   metadata: { bulk_pricing: { currency_code, tiers: [{min_quantity,        ← storefront-readable
 *     max_quantity?, amount}, ...] } }
 *
 * The 5 tier amounts are recovered from the legacy flat-key metadata that
 * was written at import time, so the script needs no external API calls
 * and the math stays identical to the original import (no rounding drift).
 *
 * Idempotent — variants that already have a `tiers` array in their
 * bulk_pricing metadata are skipped unless FORCE=1 is set.
 *
 * Usage (Railway):
 *   cd /app/.medusa/server && npx medusa exec ./src/scripts/backfill-as-colour-tier-prices.js
 *
 * Dry run (no writes, just report what would change):
 *   DRY_RUN=1 npx medusa exec ./src/scripts/backfill-as-colour-tier-prices.js
 *
 * Force re-apply even if `tiers` already present:
 *   FORCE=1 npx medusa exec ./src/scripts/backfill-as-colour-tier-prices.js
 */
export default async function backfillAsColourTierPrices({
  container,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const pricingModuleService = container.resolve(Modules.PRICING) as any
  const productModuleService = container.resolve(Modules.PRODUCT) as any
  const link = container.resolve(ContainerRegistrationKeys.LINK) as any

  const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true"
  const force = process.env.FORCE === "1" || process.env.FORCE === "true"

  // Resolve all AS Colour variants. We use the product.handle prefix as the
  // primary filter (every importer-created product is `as-colour-*`) plus
  // metadata.source = "ascolour" as a secondary signal.
  const { data: products } = await query.graph({
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
      handle: { $like: "as-colour-%" } as any,
    },
  })

  logger.info(`Found ${products.length} AS Colour products to inspect.`)

  let totalVariants = 0
  let updated = 0
  let skipped = 0
  let failed = 0
  let missingTiers = 0

  for (const product of products as any[]) {
    for (const variant of product.variants ?? []) {
      totalVariants++
      const variantId: string = variant.id
      const meta = (variant.metadata ?? {}) as Record<string, any>
      const bulk = (meta.bulk_pricing ?? {}) as Record<string, any>

      // Already in the new shape? Skip unless forced.
      const alreadyHasTiersArray =
        Array.isArray(bulk?.tiers) && bulk.tiers.length > 0
      if (alreadyHasTiersArray && !force) {
        skipped++
        continue
      }

      // Recover the 5 tier amounts from the legacy flat-key shape.
      // Values are stored as major units (dollars) per buildBulkPricingMetadata,
      // so we convert ×100 to minor units (cents) for TierMoneyMinor.
      const toMinor = (n: unknown): number | null => {
        if (typeof n !== "number" || !Number.isFinite(n)) return null
        return Math.round(n * 100)
      }
      const t1_9 = toMinor(bulk.base_sale_price)
      const t10_19 = toMinor(bulk.tier_10_to_19_price)
      const t20_49 = toMinor(bulk.tier_20_to_49_price)
      const t50_99 = toMinor(bulk.tier_50_to_99_price)
      const t100_plus = toMinor(bulk.tier_100_plus_price)

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
      const bulkMeta = tierMinorToBulkPricingMetadata(tierMinor, "ascolour-backfill")

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
          // Replace the existing price set's prices with the 5-tier list.
          await pricingModuleService.upsertPriceSets([
            { id: priceSetId, prices: pricesForPriceSet },
          ])
        } else {
          // No price set linked yet — create one and link it.
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
        // any non-bulk-pricing metadata (e.g. metadata.ascolour).
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
