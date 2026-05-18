/**
 * Drift-detection script for the Product ↔ Brand Module Link.
 *
 * Walks the full product catalog and, for every product whose handle starts with a
 * known supplier prefix (as-colour-, aussie-pacific-, biz-collection-, etc.), checks
 * whether a link row exists in `product_product_brand_brand` to the expected brand.
 * Prints a per-brand summary and a final tally of orphans.
 *
 * This intentionally REPLACES a "metadata fallback" that would silently mask drift.
 * If links are missing we want to see it in the log, not paper over it at read time.
 *
 * Usage (local):
 *   pnpm --filter backend medusa exec verify-brand-links
 *
 * Usage (Railway):
 *   cd /app/.medusa/server && npx medusa exec src/scripts/verify-brand-links.js
 *
 * Read-only — never creates or deletes data. To repair, run relink-supplier-brands.
 */

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../modules/brand"

const PAGE_SIZE = 200

// Keep in sync with HANDLE_PREFIX_TO_BRAND in relink-supplier-brands.ts.
const HANDLE_PREFIX_TO_BRAND: Array<{ prefix: string; brandHandle: string }> = [
  { prefix: "as-colour-", brandHandle: "as-colour" },
  { prefix: "syzmik-", brandHandle: "syzmik" },
  { prefix: "biz-collection-", brandHandle: "biz-collection" },
  { prefix: "biz-care-", brandHandle: "biz-care" },
  { prefix: "biz-corporates-", brandHandle: "biz-corporates" },
  { prefix: "aussie-pacific-", brandHandle: "aussie-pacific" },
]

export default async function verifyBrandLinks({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any
  const pgConnection = container.resolve(
    ContainerRegistrationKeys.PG_CONNECTION
  ) as any
  const brandService = container.resolve(BRAND_MODULE) as any

  const allBrands = (await brandService.listBrands({})) as Array<{
    id: string
    name: string
    handle: string
  }>
  const brandByHandle = new Map<string, { id: string; name: string; handle: string }>(
    allBrands.map((b) => [(b.handle ?? "").toLowerCase(), b])
  )

  logger.info(
    `[verify-brand-links] Loaded ${allBrands.length} brand(s). Checking ${HANDLE_PREFIX_TO_BRAND.length} supplier prefixes.`
  )

  // Walk every product, grouping by which brand prefix the handle matches.
  const productsByPrefix = new Map<string, Array<{ id: string; handle: string }>>()
  for (const { prefix } of HANDLE_PREFIX_TO_BRAND) {
    productsByPrefix.set(prefix, [])
  }

  let offset = 0
  let totalScanned = 0
  while (true) {
    const { data: page } = await query.graph({
      entity: "product",
      fields: ["id", "handle"],
      pagination: { take: PAGE_SIZE, skip: offset },
    })
    if (!page?.length) break

    for (const product of page as Array<{ id: string; handle: string }>) {
      const handle = product.handle ?? ""
      for (const { prefix } of HANDLE_PREFIX_TO_BRAND) {
        if (handle.startsWith(prefix)) {
          productsByPrefix.get(prefix)!.push({ id: product.id, handle })
          break
        }
      }
    }
    totalScanned += page.length
    if (page.length < PAGE_SIZE) break
    offset += page.length
  }

  let totalOrphans = 0
  let totalMatched = 0
  let totalMissingBrand = 0

  for (const { prefix, brandHandle } of HANDLE_PREFIX_TO_BRAND) {
    const products = productsByPrefix.get(prefix) ?? []
    const brand = brandByHandle.get(brandHandle)

    if (!brand) {
      logger.warn(
        `[verify-brand-links] ${brandHandle}: brand entity missing. ${products.length} product(s) with prefix "${prefix}" cannot be checked.`
      )
      totalMissingBrand += products.length
      continue
    }

    if (products.length === 0) {
      logger.info(`[verify-brand-links] ${brandHandle}: 0 products with prefix "${prefix}".`)
      continue
    }

    // Count actual link rows for this brand via Knex on the link table — matches the
    // brand-products route's data source, so what we count here is what users see.
    const linkRows: Array<{ product_id: string }> = await pgConnection(
      "product_product_brand_brand"
    )
      .where({ brand_id: brand.id })
      .whereNull("deleted_at")
      .select("product_id")
    const linkedIds = new Set<string>(
      linkRows
        .map((r) => r?.product_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    )

    const orphans = products.filter((p) => !linkedIds.has(p.id))
    const matched = products.length - orphans.length
    totalMatched += matched
    totalOrphans += orphans.length

    if (orphans.length === 0) {
      logger.info(
        `[verify-brand-links] ${brandHandle}: OK — ${matched}/${products.length} products linked.`
      )
    } else {
      logger.warn(
        `[verify-brand-links] ${brandHandle}: ${orphans.length} orphan(s) of ${products.length} (linked: ${matched}, link-table rows: ${linkedIds.size}).`
      )
      const sample = orphans.slice(0, 5).map((p) => p.handle).join(", ")
      logger.warn(
        `[verify-brand-links]   sample orphan handles: ${sample}${orphans.length > 5 ? ` (+${orphans.length - 5} more)` : ""}`
      )
      logger.warn(
        `[verify-brand-links]   to repair: pnpm --filter backend medusa exec relink-supplier-brands  ` +
          `(Railway: cd /app/.medusa/server && npx medusa exec src/scripts/relink-supplier-brands.js)`
      )
    }
  }

  logger.info(
    `[verify-brand-links] Done. Scanned ${totalScanned} products. ` +
      `Linked: ${totalMatched}, Orphan: ${totalOrphans}, Missing brand entity: ${totalMissingBrand}.`
  )
}
