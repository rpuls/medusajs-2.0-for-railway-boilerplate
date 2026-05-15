import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ASCOLOUR_MODULE } from "../modules/ascolour"
import AsColourService from "../modules/ascolour/service"
import { buildPriceLadder, type PriceLadder } from "../modules/ascolour/pricing"
import {
  tierMinorToPriceSetRows,
  tierMinorToBulkPricingMetadata,
  type TierMoneyMinor,
} from "../utils/bulk-tier-prices"

/**
 * Re-prices already-imported AS Colour products from the live API pricelist.
 *
 * Why this exists: import-as-colour-from-api.ts is create-only and skips
 * existing handles, so fixing the pricelist parser there does not retroactively
 * correct variants already in the DB. This script walks every product whose
 * handle starts `as-colour-`, looks up each variant's SKU in the AS Colour
 * pricelist (taking the 1-pack tier — the max price per SKU, since AS Colour
 * returns multiple rows per SKU at different quantity-break tiers), runs that
 * cost through the shared buildPriceLadder() formula, and upserts the 5-tier
 * retail ladder onto the variant's price set plus metadata.bulk_pricing.
 *
 * Mirrors the variant-side plumbing of `update-as-colour-pricing.ts` so both
 * paths write identical price-set rows and metadata.
 *
 * Usage on Railway (dry-run by default):
 *   cd /app/.medusa/server && npx medusa exec src/scripts/reprice-as-colour-from-api.js
 *   cd /app/.medusa/server && npx medusa exec src/scripts/reprice-as-colour-from-api.js -- --apply
 */

const PRICE_CURRENCY_CODE = "aud"
const BATCH_SIZE = 250

const ladderToTierMinor = (ladder: PriceLadder): TierMoneyMinor => ({
  t1_9: Math.round(ladder.base * 100),
  t10_19: Math.round(ladder.tier10to19 * 100),
  t20_49: Math.round(ladder.tier20to49 * 100),
  t50_99: Math.round(ladder.tier50to99 * 100),
  t100_plus: Math.round(ladder.tier100Plus * 100),
})

const chunk = <T,>(items: T[], size: number) => {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size))
  }
  return out
}

const argvAfterDoubleDash = (): string[] => {
  const i = process.argv.findIndex((a) => a === "--")
  return i >= 0 ? process.argv.slice(i + 1) : []
}

const mergeScriptArgv = (execArgs: unknown): string[] => {
  const fromExec = Array.isArray(execArgs)
    ? execArgs.filter((a): a is string => typeof a === "string")
    : []
  return [...fromExec, ...argvAfterDoubleDash()]
}

const getApplyFlag = (scriptArgs: string[]) =>
  scriptArgs.includes("--apply") ||
  process.argv.includes("--apply") ||
  process.env.AS_COLOUR_REPRICE_APPLY === "1" ||
  process.env.AS_COLOUR_REPRICE_APPLY === "true"

export default async function repriceAsColourFromApi({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (args: Record<string, unknown>) => Promise<{ data?: unknown[] }>
  }
  const link = container.resolve(ContainerRegistrationKeys.LINK) as {
    create: (data: Record<string, unknown>) => Promise<unknown>
  }
  const productModuleService = container.resolve(Modules.PRODUCT) as {
    updateProductVariants: (id: string, data: Record<string, unknown>) => Promise<unknown>
  }
  const pricingModuleService = container.resolve(Modules.PRICING) as {
    upsertPriceSets: (data: Array<Record<string, unknown>>) => Promise<unknown>
  }
  const ascolour = container.resolve(ASCOLOUR_MODULE) as AsColourService

  const apply = getApplyFlag(mergeScriptArgv(args))
  logger.info(`Mode: ${apply ? "APPLY" : "DRY RUN"} (pass -- --apply to write changes)`)

  // 1. Pull the AS Colour pricelist and build a deterministic cost map.
  // Same logic as import-as-colour-from-api.ts: keep the max price per SKU,
  // which corresponds to the 1-pack quantity tier.
  logger.info("Fetching AS Colour pricelist…")
  const priceList = await ascolour.fetchAllPriceList()
  const costBySku = new Map<string, number>()
  for (const entry of priceList) {
    const price = Number((entry as any).price)
    const sku = (entry as any).sku
    if (!sku || !Number.isFinite(price)) continue
    const prev = costBySku.get(sku)
    if (prev === undefined || price > prev) {
      costBySku.set(sku, price)
    }
  }
  logger.info(`Pricelist: ${priceList.length} rows, ${costBySku.size} unique SKUs.`)

  // 2. Find every AS Colour product in the DB (handle prefix `as-colour-`).
  // Medusa Query doesn't support startsWith on string filters, so we pull
  // ids+handles by source metadata via the product graph and filter in JS.
  // The handle filter on the existing update-as-colour-pricing.ts uses an
  // explicit allowlist; here we want all AS Colour products, so we query
  // by metadata.source = "ascolour" stamped by the importer.
  const { data: productsData } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata"],
    filters: {},
  })
  const allProducts = (productsData ?? []) as Array<{
    id: string
    handle: string
    metadata?: Record<string, unknown> | null
  }>
  const asColourProducts = allProducts.filter(
    (p) =>
      (p.handle ?? "").startsWith("as-colour-") ||
      (p.metadata as any)?.source === "ascolour"
  )
  if (!asColourProducts.length) {
    logger.warn("No AS Colour products found in DB.")
    return
  }
  logger.info(`Found ${asColourProducts.length} AS Colour products.`)

  const productHandleById = new Map(asColourProducts.map((p) => [p.id, p.handle]))
  const productIdBatches = chunk(
    asColourProducts.map((p) => p.id),
    BATCH_SIZE
  )

  type VariantRow = {
    id: string
    sku?: string | null
    product_id?: string | null
    metadata?: Record<string, unknown> | null
    price_set?: { id?: string | null; prices?: Array<{ amount: number; min_quantity?: number | null }> | null } | null
  }
  const variantRows: VariantRow[] = []
  for (const batch of productIdBatches) {
    const { data } = await query.graph({
      entity: "product_variant",
      fields: [
        "id",
        "sku",
        "product_id",
        "metadata",
        "price_set.id",
        "price_set.prices.amount",
        "price_set.prices.min_quantity",
      ],
      filters: { product_id: batch },
    })
    for (const row of (data ?? []) as VariantRow[]) {
      variantRows.push(row)
    }
  }
  logger.info(`Loaded ${variantRows.length} AS Colour variants.`)

  // 3. For each variant, compute the new ladder and (optionally) write it.
  let updated = 0
  let skippedNoSku = 0
  let skippedNoCost = 0
  let unchanged = 0
  let createdPriceSets = 0
  const failures: string[] = []

  for (const variant of variantRows) {
    const sku = variant.sku ?? null
    if (!sku) {
      skippedNoSku++
      continue
    }
    const cost = costBySku.get(sku)
    if (cost === undefined) {
      skippedNoCost++
      continue
    }

    const ladder = buildPriceLadder(cost)
    const tierMinor = ladderToTierMinor(ladder)
    const newBase = ladder.base

    const existingPrices = variant.price_set?.prices ?? []
    const existingBase = existingPrices.find(
      (p) => (p?.min_quantity ?? 0) === 1
    )?.amount
    const handle = variant.product_id ? productHandleById.get(variant.product_id) : undefined

    if (typeof existingBase === "number" && Math.abs(existingBase - newBase) < 0.005) {
      unchanged++
      continue
    }

    logger.info(
      `${handle ?? "<no-handle>"} ${sku}: ${
        typeof existingBase === "number" ? existingBase.toFixed(2) : "<none>"
      } → ${newBase.toFixed(2)} (cost ${cost.toFixed(2)})`
    )

    if (!apply) continue

    try {
      const prices = tierMinorToPriceSetRows(tierMinor, PRICE_CURRENCY_CODE)
      const priceSetId = variant.price_set?.id ?? null
      if (priceSetId) {
        await pricingModuleService.upsertPriceSets([
          { id: priceSetId, prices },
        ])
      } else {
        const created = (await pricingModuleService.upsertPriceSets([
          { prices },
        ])) as Array<{ id?: string }>
        const createdId = created[0]?.id
        if (!createdId) {
          throw new Error(`Pricing module did not return an id for new price set`)
        }
        await link.create({
          [Modules.PRODUCT]: { variant_id: variant.id },
          [Modules.PRICING]: { price_set_id: createdId },
        })
        createdPriceSets++
      }

      const existingMetadata = (variant.metadata ?? {}) as Record<string, unknown>
      const nextMetadata: Record<string, unknown> = {
        ...existingMetadata,
        bulk_pricing: tierMinorToBulkPricingMetadata(tierMinor, "ascolour-api-reprice"),
      }
      await productModuleService.updateProductVariants(variant.id, {
        metadata: nextMetadata,
      })
      updated++
    } catch (err: any) {
      failures.push(`${sku}: ${err?.message ?? err}`)
    }
  }

  logger.info(
    `Done. ` +
      `Variants: ${variantRows.length}, ` +
      `${apply ? "updated" : "would update"}: ${apply ? updated : variantRows.length - unchanged - skippedNoSku - skippedNoCost}, ` +
      `unchanged: ${unchanged}, ` +
      `skipped (no sku): ${skippedNoSku}, ` +
      `skipped (sku not in pricelist): ${skippedNoCost}` +
      (apply ? `, new price sets: ${createdPriceSets}` : "")
  )
  if (failures.length) {
    logger.warn(`Failures (${failures.length}):`)
    for (const f of failures) logger.warn(`  ${f}`)
  }
  if (!apply) {
    logger.info("Dry run — re-run with `-- --apply` to persist.")
  }
}
