import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

import {
  TIERS,
  TIER_GROUP_NAME_PREFIX,
  applyTierMultiplier,
  type Tier,
} from "../lib/customer-tiers"

/**
 * Regenerates the 8 tier PriceLists from canonical variant cost.
 *
 * For each tier:
 *   1. Find-or-create a PriceList titled "Tier Pricing: <name>", type=OVERRIDE,
 *      status=ACTIVE, with `metadata.tier_slug` for lookups.
 *   2. Set its single rule to `{ "customer.groups.id": [<tier's group id>] }`.
 *      This is the rule attribute Medusa's set-pricing-context middleware
 *      matches against (verified in the pricing module's
 *      Migration20241212190401, which renamed the legacy `customer_group_id`
 *      attribute to `customer.groups.id`).
 *   3. Walk every variant with `metadata.cost_price_ex_gst_minor` set.
 *      Compute `amount = round(cost_minor × tier.multiplier)`.
 *   4. Replace the PriceList's existing prices with the freshly computed set
 *      (remove old prices first, then addPriceListPrices in batches).
 *
 * Requires `seed-customer-tiers` to have run first (creates the 8 groups).
 *
 * Idempotent. Safe to re-run nightly (this is what the cron job does at 06:00
 * UTC, after AS Colour / FashionBiz / AP nightly stock pulls finish).
 *
 * Usage:
 *   DRY_RUN=1 npx medusa exec ./src/scripts/regenerate-tier-price-lists.ts
 *   npx medusa exec ./src/scripts/regenerate-tier-price-lists.ts
 *
 * Optional env:
 *   TIER_SLUG=gold  — regenerate just this tier (debug / faster retry)
 *
 * Railway:
 *   cd /app/.medusa/server && npx medusa exec ./src/scripts/regenerate-tier-price-lists.js
 */
export default async function regenerateTierPriceLists({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const pricingModuleService = container.resolve(Modules.PRICING) as any

  const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true"
  const filterSlug = process.env.TIER_SLUG?.trim() || null
  const currencyCode = "aud"

  const tiersToProcess: Tier[] = filterSlug
    ? TIERS.filter((t) => t.slug === filterSlug)
    : Array.from(TIERS)

  if (!tiersToProcess.length) {
    logger.warn(
      `[regenerate-tier-price-lists] TIER_SLUG=${filterSlug} matched no tier — aborting`
    )
    return
  }

  logger.info(
    `[regenerate-tier-price-lists] starting — dryRun=${dryRun}, tiers=${tiersToProcess
      .map((t) => t.slug)
      .join(",")}`
  )

  // 1) Resolve the 8 customer groups (one per tier) by name. Bail if any
  // is missing — staff must run `seed-customer-tiers` first.
  const { data: groups } = await query.graph({
    entity: "customer_group",
    fields: ["id", "name", "metadata"],
    filters: {
      name: tiersToProcess.map((t) => t.name) as any,
    } as any,
  })

  const groupBySlug = new Map<string, { id: string; name: string }>()
  for (const g of (groups as any[]) ?? []) {
    const slug =
      typeof g.metadata?.tier_slug === "string"
        ? g.metadata.tier_slug
        : g.name?.startsWith(TIER_GROUP_NAME_PREFIX)
        ? g.name.slice(TIER_GROUP_NAME_PREFIX.length).toLowerCase().replace(/\s+/g, "_")
        : null
    if (slug) groupBySlug.set(slug, { id: g.id, name: g.name })
  }

  const missingGroups = tiersToProcess.filter((t) => !groupBySlug.has(t.slug))
  if (missingGroups.length) {
    logger.error(
      `[regenerate-tier-price-lists] missing customer groups: ${missingGroups
        .map((t) => t.name)
        .join(", ")} — run \`seed-customer-tiers\` first`
    )
    return
  }

  // 2) Pre-fetch variant cost + price_set id in pages. The pricing module
  // needs price_set_id (not variant id) on each PriceListPrice. The link
  // table backs `variant.price_set` — see how other scripts use it
  // (e.g. backfill-as-colour-tier-prices.ts).
  type VariantPrice = { variantId: string; sku: string | null; priceSetId: string; costMinor: number }
  const allVariantPrices: VariantPrice[] = []

  const PAGE_SIZE = 500
  let skip = 0
  let totalScanned = 0
  let totalWithCost = 0
  let totalWithoutPriceSet = 0

  for (;;) {
    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: ["id", "sku", "metadata", "price_set.id"],
      pagination: { skip, take: PAGE_SIZE },
    })
    if (!variants?.length) break

    totalScanned += variants.length

    for (const v of variants as any[]) {
      const meta = (v.metadata ?? {}) as Record<string, unknown>
      const costMinor = meta.cost_price_ex_gst_minor
      if (
        typeof costMinor !== "number" ||
        !Number.isFinite(costMinor) ||
        costMinor <= 0
      ) {
        continue
      }
      totalWithCost++

      const priceSetId = v.price_set?.id
      if (!priceSetId) {
        totalWithoutPriceSet++
        continue
      }

      allVariantPrices.push({
        variantId: v.id,
        sku: v.sku ?? null,
        priceSetId,
        costMinor,
      })
    }

    if (variants.length < PAGE_SIZE) break
    skip += PAGE_SIZE
  }

  logger.info(
    `[regenerate-tier-price-lists] scanned ${totalScanned} variants — ` +
      `${totalWithCost} have cost, ${totalWithoutPriceSet} missing price_set ` +
      `(can't price these), ${allVariantPrices.length} ready to price`
  )

  if (!allVariantPrices.length) {
    logger.warn(
      `[regenerate-tier-price-lists] no variants with cost + price_set — nothing to write`
    )
    return
  }

  // 3) For each tier: find-or-create PriceList → set rules → replace prices.
  for (const tier of tiersToProcess) {
    const group = groupBySlug.get(tier.slug)!
    const title = `Tier Pricing: ${tier.name.slice(TIER_GROUP_NAME_PREFIX.length)}`

    const { data: existingLists } = await query.graph({
      entity: "price_list",
      fields: ["id", "title", "status", "type", "metadata", "prices.id"],
      filters: { title } as any,
    })
    let priceList = (existingLists as any[])?.[0] ?? null

    if (!priceList) {
      if (dryRun) {
        logger.info(
          `[regenerate-tier-price-lists] (dry run) would create PriceList "${title}"`
        )
      } else {
        const created = await pricingModuleService.createPriceLists([
          {
            title,
            description: `Tier pricing for ${tier.name} customers. Auto-generated; do not edit prices manually.`,
            status: "active",
            type: "override",
            metadata: { tier_slug: tier.slug },
            rules: { "customer.groups.id": [group.id] },
          },
        ])
        priceList = created?.[0]
        logger.info(
          `[regenerate-tier-price-lists] created PriceList "${title}" (id=${priceList?.id})`
        )
      }
    } else {
      // Ensure the rule still scopes to the right group + status/type are correct.
      if (!dryRun) {
        await pricingModuleService.updatePriceLists([
          {
            id: priceList.id,
            status: "active",
            type: "override",
            metadata: {
              ...(priceList.metadata ?? {}),
              tier_slug: tier.slug,
            },
          },
        ])
        await pricingModuleService.setPriceListRules({
          price_list_id: priceList.id,
          rules: { "customer.groups.id": [group.id] },
        })
      }
    }

    if (dryRun) {
      const sample = allVariantPrices[0]
      const samplePrice = applyTierMultiplier(sample.costMinor, tier)
      logger.info(
        `[regenerate-tier-price-lists] (dry run) "${title}" would have ${allVariantPrices.length} prices — sample: ${sample.sku ?? sample.variantId} cost=${sample.costMinor}c → ${samplePrice}c`
      )
      continue
    }

    // 4) Replace prices: remove old, add new.
    const oldPriceIds = ((priceList?.prices ?? []) as Array<{ id: string }>).map(
      (p) => p.id
    )
    if (oldPriceIds.length) {
      await pricingModuleService.removePrices(oldPriceIds)
    }

    const newPrices = allVariantPrices.map((vp) => ({
      price_set_id: vp.priceSetId,
      amount: applyTierMultiplier(vp.costMinor, tier),
      currency_code: currencyCode,
    }))

    // Batch additions to keep transactions small.
    const BATCH = 500
    for (let i = 0; i < newPrices.length; i += BATCH) {
      const slice = newPrices.slice(i, i + BATCH)
      await pricingModuleService.addPriceListPrices([
        { price_list_id: priceList.id, prices: slice },
      ])
    }

    logger.info(
      `[regenerate-tier-price-lists] "${title}" — replaced ${oldPriceIds.length} prices with ${newPrices.length} (multiplier=${tier.multiplier})`
    )
  }

  logger.info(`[regenerate-tier-price-lists] done`)
}
