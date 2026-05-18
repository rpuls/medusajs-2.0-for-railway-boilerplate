import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Backfill `variant.metadata.cost_price_ex_gst_minor` (canonical) on every
 * variant that doesn't already have it. The canonical field is the single
 * input the tier-pricing regen job ([regenerate-tier-price-lists.ts]) reads
 * to compute `cost × tier_multiplier`.
 *
 * Resolution order, per variant:
 *   1. metadata.as_colour_cost_price_ex_gst   (minor units, despite the name)
 *   2. metadata.dnc_cost_price_ex_gst_minor   (minor units)
 *   3. Reverse-engineer from metadata.bulk_pricing.tier_100_plus_price
 *      (major-units / GST-inclusive). Math: cost_major = tier100Plus / 1.65;
 *      cost_minor = round(cost_major * 100). This is the ladder formula's
 *      inverse — see `backend/src/utils/bulk-price-ladder.ts` line 7.
 *      Hand-edited prices will produce an inflated cost. Every reverse-
 *      engineered SKU is logged so staff can spot-audit FB/AP variants
 *      before the regen job applies tier pricing.
 *
 * Idempotent — skip variants that already have the canonical field set.
 *
 * Usage:
 *   DRY_RUN=1 npx medusa exec ./src/scripts/backfill-canonical-cost.ts
 *   npx medusa exec ./src/scripts/backfill-canonical-cost.ts
 *
 * Railway:
 *   cd /app/.medusa/server && npx medusa exec ./src/scripts/backfill-canonical-cost.js
 */
export default async function backfillCanonicalCost({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModuleService = container.resolve(Modules.PRODUCT) as any

  const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true"
  const force = process.env.FORCE === "1" || process.env.FORCE === "true"

  logger.info(
    `[backfill-canonical-cost] starting — dryRun=${dryRun}, force=${force}`
  )

  const PAGE_SIZE = 500
  let skip = 0
  let total = 0
  let alreadySet = 0
  let copiedFromAs = 0
  let copiedFromDnc = 0
  let reverseEngineered = 0
  let noCost = 0
  let updated = 0
  let failed = 0

  for (;;) {
    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: ["id", "sku", "metadata"],
      pagination: { skip, take: PAGE_SIZE },
    })
    if (!variants?.length) break

    total += variants.length

    for (const v of variants as Array<any>) {
      const meta = (v.metadata ?? {}) as Record<string, unknown>

      const existing = meta.cost_price_ex_gst_minor
      if (typeof existing === "number" && Number.isFinite(existing) && !force) {
        alreadySet++
        continue
      }

      let costMinor: number | null = null
      let source: "as_colour" | "dnc" | "reverse_engineered" | null = null

      const asCost = meta.as_colour_cost_price_ex_gst
      if (typeof asCost === "number" && Number.isFinite(asCost) && asCost > 0) {
        costMinor = Math.round(asCost)
        source = "as_colour"
      } else {
        const dncCost = meta.dnc_cost_price_ex_gst_minor
        if (
          typeof dncCost === "number" &&
          Number.isFinite(dncCost) &&
          dncCost > 0
        ) {
          costMinor = Math.round(dncCost)
          source = "dnc"
        } else {
          const bulk = (meta.bulk_pricing ?? {}) as Record<string, unknown>
          const t100Major = bulk.tier_100_plus_price
          if (
            typeof t100Major === "number" &&
            Number.isFinite(t100Major) &&
            t100Major > 0
          ) {
            // tier_100_plus_price = cost_major * 1.1 * 1.5 = cost_major * 1.65
            // (see backend/src/utils/bulk-price-ladder.ts line 7)
            const costMajor = t100Major / 1.65
            costMinor = Math.round(costMajor * 100)
            source = "reverse_engineered"
            logger.info(
              `[backfill-canonical-cost] reverse-engineered SKU ${v.sku ?? v.id}: tier100Plus=$${t100Major.toFixed(2)} → cost=${costMinor}c`
            )
          }
        }
      }

      if (costMinor === null || source === null) {
        noCost++
        continue
      }

      if (source === "as_colour") copiedFromAs++
      else if (source === "dnc") copiedFromDnc++
      else if (source === "reverse_engineered") reverseEngineered++

      if (dryRun) {
        updated++
        continue
      }

      try {
        await productModuleService.updateProductVariants(v.id, {
          metadata: {
            ...meta,
            cost_price_ex_gst_minor: costMinor,
          },
        })
        updated++
      } catch (err: any) {
        failed++
        logger.error(
          `[backfill-canonical-cost] failed to update variant ${v.id} (${v.sku}): ${err?.message ?? err}`
        )
      }
    }

    if (variants.length < PAGE_SIZE) break
    skip += PAGE_SIZE
  }

  logger.info(
    `[backfill-canonical-cost] done — scanned ${total}, already set ${alreadySet}, ` +
      `copied from AS Colour ${copiedFromAs}, copied from DNC ${copiedFromDnc}, ` +
      `reverse-engineered ${reverseEngineered}, no cost source ${noCost}, ` +
      `${dryRun ? "would update" : "updated"} ${updated}, failed ${failed}`
  )
}
