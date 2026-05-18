/**
 * Deactivate brands that have zero products linked to them (directly OR via active children).
 *
 * Why: the brand-entity seed script creates a canonical list of suppliers we *might* import,
 * but the API importers only populate a subset (AS Colour, Aussie Pacific, the four FashionBiz
 * children). The other seeded brands appear on the storefront /brands page as tiles that link
 * to landing pages with zero products — visual clutter and dead-ends for customers.
 *
 * The storefront route at backend/src/api/store/brands/route.ts already filters to
 * is_active: true, so flipping is_active is the established lever for hiding a brand from the
 * storefront without losing the row (staff can re-activate from admin once products land).
 *
 * Counting rules:
 *   - direct count   = number of products linked to brand.id via product_product_brand_brand
 *   - inherited count = sum of direct counts of all children where parent_id === brand.id
 *   - effective count = direct + inherited
 *   - deactivate when effective count === 0 AND is_active === true
 *
 * The inherited rule protects pure-parent brands (e.g. FashionBiz) whose children carry the
 * products — we don't want to slam the door on a useful family landing page.
 *
 * Re-activation safety: if an *inactive* brand now has products (someone re-ran an importer),
 * the script logs a WOULD-REACTIVATE warning but does NOT flip the flag. Re-activation is a
 * deliberate decision that should stay in the admin UI.
 *
 * Usage (local):
 *   cd backend && npx medusa exec src/scripts/deactivate-empty-brands.ts             # dry-run
 *   cd backend && npx medusa exec src/scripts/deactivate-empty-brands.ts -- --apply  # commit
 *
 * Usage (Railway):
 *   cd /app/.medusa/server && npx medusa exec src/scripts/deactivate-empty-brands.js -- --apply
 *
 * Safe to re-run: idempotent. Already-inactive zero-product brands are skipped.
 */

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { BRAND_MODULE } from "../modules/brand"

const PAGE_SIZE = 200

type BrandRow = {
  id: string
  name: string
  handle: string
  parent_id: string | null
  is_active: boolean
}

export default async function deactivateEmptyBrands({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (a: Record<string, unknown>) => Promise<{ data?: any[] }>
  }
  const brandService = container.resolve(BRAND_MODULE) as {
    listBrands: (filters?: Record<string, unknown>) => Promise<BrandRow[]>
    updateBrands: (data: Record<string, unknown>) => Promise<unknown>
  }

  const args = process.argv.slice(2)
  const apply = args.includes("--apply") || process.env.BRAND_DEACTIVATE_APPLY === "1"

  logger.info(
    `[deactivate-empty-brands] Starting (mode: ${apply ? "APPLY" : "DRY-RUN"})…`
  )

  // ---------- Pass 1: load every brand ------------------------------------------------------
  const brands = await brandService.listBrands({})
  logger.info(`[deactivate-empty-brands] Loaded ${brands.length} brand(s).`)

  // ---------- Pass 2: tally direct product counts per brand --------------------------------
  const directCount = new Map<string, number>()
  for (const b of brands) directCount.set(b.id, 0)

  let offset = 0
  let totalProducts = 0
  while (true) {
    const { data: page } = await query.graph({
      entity: "product",
      fields: ["id", "brand.id"],
      pagination: { take: PAGE_SIZE, skip: offset },
    })
    if (!page?.length) break

    for (const product of page as Array<{ id: string; brand?: unknown }>) {
      // `brand` may be a single object or array (depends on isList on the link side).
      const brandField = Array.isArray(product.brand) ? product.brand[0] : product.brand
      const brandId =
        brandField && typeof brandField === "object" && "id" in brandField
          ? ((brandField as { id?: string }).id ?? null)
          : null
      if (brandId && directCount.has(brandId)) {
        directCount.set(brandId, directCount.get(brandId)! + 1)
      }
    }

    totalProducts += page.length
    if (page.length < PAGE_SIZE) break
    offset += page.length
  }
  logger.info(`[deactivate-empty-brands] Scanned ${totalProducts} product(s).`)

  // ---------- Pass 3: compute effective counts (direct + children) -------------------------
  const childrenByParent = new Map<string, BrandRow[]>()
  for (const b of brands) {
    if (b.parent_id) {
      const list = childrenByParent.get(b.parent_id) ?? []
      list.push(b)
      childrenByParent.set(b.parent_id, list)
    }
  }

  const effectiveCount = new Map<string, number>()
  for (const b of brands) {
    const direct = directCount.get(b.id) ?? 0
    const children = childrenByParent.get(b.id) ?? []
    const childSum = children.reduce((acc, c) => acc + (directCount.get(c.id) ?? 0), 0)
    effectiveCount.set(b.id, direct + childSum)
  }

  // ---------- Pass 4: classify -------------------------------------------------------------
  const toDeactivate: BrandRow[] = []
  const alreadyInactiveEmpty: BrandRow[] = []
  const wouldReactivate: BrandRow[] = []
  const keepActive: BrandRow[] = []

  for (const b of brands) {
    const eff = effectiveCount.get(b.id) ?? 0
    if (b.is_active) {
      if (eff === 0) toDeactivate.push(b)
      else keepActive.push(b)
    } else {
      if (eff === 0) alreadyInactiveEmpty.push(b)
      else wouldReactivate.push(b)
    }
  }

  // ---------- Report -----------------------------------------------------------------------
  const fmtCounts = (b: BrandRow) => {
    const direct = directCount.get(b.id) ?? 0
    const children = childrenByParent.get(b.id) ?? []
    const childSum = children.reduce((acc, c) => acc + (directCount.get(c.id) ?? 0), 0)
    return `direct=${direct} children=${childSum}${children.length ? ` (${children.length} child brand${children.length > 1 ? "s" : ""})` : ""}`
  }

  logger.info("")
  logger.info(`[deactivate-empty-brands] === Summary ===`)
  logger.info(`  Active with products (kept):   ${keepActive.length}`)
  logger.info(`  Active with 0 products:        ${toDeactivate.length}  ← will be deactivated`)
  logger.info(`  Already inactive (empty):      ${alreadyInactiveEmpty.length}`)
  logger.info(`  Inactive but has products:     ${wouldReactivate.length}  ← warnings`)
  logger.info("")

  if (keepActive.length) {
    logger.info(`[deactivate-empty-brands] Keeping active:`)
    for (const b of keepActive) {
      logger.info(`  KEEP   ${b.name.padEnd(28)} /${b.handle}   ${fmtCounts(b)}`)
    }
    logger.info("")
  }

  if (toDeactivate.length) {
    logger.info(
      `[deactivate-empty-brands] ${apply ? "Deactivating" : "Would deactivate"} ${toDeactivate.length} brand(s):`
    )
    for (const b of toDeactivate) {
      logger.info(`  ${apply ? "DEACT " : "DRY   "} ${b.name.padEnd(28)} /${b.handle}   ${fmtCounts(b)}`)
    }
    logger.info("")
  }

  if (alreadyInactiveEmpty.length) {
    logger.info(`[deactivate-empty-brands] Already inactive (no change):`)
    for (const b of alreadyInactiveEmpty) {
      logger.info(`  SKIP   ${b.name.padEnd(28)} /${b.handle}   ${fmtCounts(b)}`)
    }
    logger.info("")
  }

  if (wouldReactivate.length) {
    logger.warn(
      `[deactivate-empty-brands] ${wouldReactivate.length} inactive brand(s) now have products — re-activate manually in admin if appropriate:`
    )
    for (const b of wouldReactivate) {
      logger.warn(`  WOULD-REACTIVATE  ${b.name.padEnd(28)} /${b.handle}   ${fmtCounts(b)}`)
    }
    logger.warn("")
  }

  // ---------- Apply ------------------------------------------------------------------------
  if (!apply) {
    logger.info(
      `[deactivate-empty-brands] DRY-RUN complete. Re-run with \`-- --apply\` to commit.`
    )
    return
  }

  if (toDeactivate.length === 0) {
    logger.info(`[deactivate-empty-brands] Nothing to deactivate. Done.`)
    return
  }

  for (const b of toDeactivate) {
    await brandService.updateBrands({ id: b.id, is_active: false })
    logger.info(`  Deactivated ${b.name} (${b.id}).`)
  }

  logger.info(
    `[deactivate-empty-brands] Done. ${toDeactivate.length} brand(s) deactivated.`
  )
}
