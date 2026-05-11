/**
 * One-shot migration: seed canonical Brand rows, then walk every product and link it to the
 * right brand via the product↔brand Module Link.
 *
 * Resolution priority per product:
 *   1. metadata.brand        (set by the old backfill script)
 *   2. metadata.supplier     (set by the now-removed PRODUCT_SUPPLIER_METADATA_KEY importer column)
 *   3. metadata.manufacturer (legacy)
 *   4. metadata.label        (legacy)
 *   5. handle prefix         (longest-match in the table below)
 *
 * Unresolvable products are logged and left without a brand link — staff can fix them manually
 * in the admin /app/brands page. We never invent an "Unknown" brand to mop them up; pollution
 * outlives the migration.
 *
 * Usage (from `backend/`):
 *   npx medusa exec ./src/scripts/migrate-products-to-brand-entity.ts             # dry-run by default
 *   npx medusa exec ./src/scripts/migrate-products-to-brand-entity.ts -- --apply  # commit
 *
 * Env (optional):
 *   BRAND_MIGRATION_OVERWRITE=1 — replace an existing brand link if the resolution differs.
 *                                 Default: leave existing links untouched.
 */

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

import { BRAND_MODULE } from "../modules/brand"
import { slugifyBrandHandle, brandValueKey } from "../lib/brand-handle"

type SeedBrand = {
  name: string
  handle: string
  external_code?: string
  parent?: string
}

/**
 * The canonical brand list as of 2026-05-11, matching the historical BRAND_TILES array on
 * the storefront plus the FashionBiz family used for supplier-mix reporting. Staff can edit
 * any of these after the migration (rename, deactivate, add description, change logo URL).
 */
const SEED_BRANDS: SeedBrand[] = [
  { name: "FashionBiz", handle: "fashionbiz", external_code: "FZ" },
  { name: "Biz Care", handle: "biz-care", external_code: "BC", parent: "FashionBiz" },
  { name: "Biz Collection", handle: "biz-collection", external_code: "BIZ", parent: "FashionBiz" },
  { name: "Syzmik", handle: "syzmik", external_code: "SYZ", parent: "FashionBiz" },
  { name: "AS Colour", handle: "as-colour", external_code: "ASC" },
  { name: "DNC Workwear", handle: "dnc-workwear", external_code: "DNC" },
  { name: "Ramo", handle: "ramo", external_code: "RAMO" },
  { name: "Stanley/Stella", handle: "stanley-stella", external_code: "SS" },
  { name: "Gildan", handle: "gildan", external_code: "GIL" },
  { name: "Anvil", handle: "anvil", external_code: "ANV" },
  { name: "Aussie Pacific", handle: "aussie-pacific", external_code: "AP" },
  { name: "Winning Spirit", handle: "winning-spirit", external_code: "WS" },
  { name: "Grace", handle: "grace", external_code: "GRC" },
  { name: "American Apparel", handle: "american-apparel", external_code: "AA" },
  { name: "Next Level", handle: "next-level", external_code: "NL" },
  { name: "Honeybee", handle: "honeybee", external_code: "HB" },
  { name: "Biz Corporates", handle: "biz-corporates", external_code: "BIZCORP", parent: "FashionBiz" },
]

/**
 * Handle-prefix → canonical brand name. Ordered longest-first so `biz-collection-foo` doesn't
 * fall through to `biz-` if we ever add a shorter prefix. Mirror of the storefront helper that's
 * being removed in this same migration.
 */
const HANDLE_PREFIX_TO_BRAND: ReadonlyArray<readonly [string, string]> = [
  ["american-apparel", "American Apparel"],
  ["biz-collection", "Biz Collection"],
  ["biz-corporates", "Biz Corporates"],
  ["next-level", "Next Level"],
  ["stanley-stella", "Stanley/Stella"],
  ["as-colour", "AS Colour"],
  ["aussie-pacific", "Aussie Pacific"],
  ["winning-spirit", "Winning Spirit"],
  ["biz-care", "Biz Care"],
  ["grace", "Grace"],
  ["dnc", "DNC Workwear"],
  ["ramo", "Ramo"],
  ["gildan", "Gildan"],
  ["syzmik", "Syzmik"],
  ["anvil", "Anvil"],
  ["stanley", "Stanley/Stella"],
] as const

function inferBrandFromHandle(handle: string): string | null {
  if (!handle) return null
  const lower = handle.toLowerCase()
  for (const [prefix, name] of HANDLE_PREFIX_TO_BRAND) {
    if (lower === prefix || lower.startsWith(`${prefix}-`)) {
      return name
    }
  }
  return null
}

const LEGACY_METADATA_KEYS = ["brand", "supplier", "manufacturer", "label"] as const

function inferBrandFromProduct(product: {
  handle?: string
  metadata?: Record<string, unknown> | null
}): { value: string; source: string } | null {
  const meta = product.metadata ?? {}
  for (const key of LEGACY_METADATA_KEYS) {
    const v = (meta as Record<string, unknown>)[key]
    if (typeof v === "string" && v.trim()) return { value: v.trim(), source: `metadata.${key}` }
  }
  const fromHandle = inferBrandFromHandle(product.handle ?? "")
  if (fromHandle) return { value: fromHandle, source: "handle" }
  return null
}

export default async function migrateProductsToBrandEntity({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (a: Record<string, unknown>) => Promise<{ data?: any[] }>
  }
  const link = container.resolve(ContainerRegistrationKeys.LINK) as {
    create: (data: Record<string, unknown>) => Promise<unknown>
    dismiss: (data: Record<string, unknown>) => Promise<unknown>
  }
  const brandService = container.resolve(BRAND_MODULE) as {
    listBrands: (filters?: Record<string, unknown>) => Promise<Array<{
      id: string
      name: string
      handle: string
      external_code: string | null
      parent_id: string | null
    }>>
    createBrands: (data: Array<Record<string, unknown>>) => Promise<Array<{ id: string; name: string }>>
    updateBrands: (data: Record<string, unknown>) => Promise<unknown>
  }

  const args = process.argv.slice(2)
  const apply = args.includes("--apply") || process.env.BRAND_MIGRATION_APPLY === "1"
  const overwrite = args.includes("--overwrite") || process.env.BRAND_MIGRATION_OVERWRITE === "1"

  logger.info(
    `Brand migration starting (mode: ${apply ? "APPLY" : "DRY-RUN"}, overwrite-existing-links: ${overwrite})…`
  )

  // ---------- Pass 1: seed brand rows -----------------------------------------------------

  const existingBrands = await brandService.listBrands({})
  const byName = new Map<string, { id: string; name: string; parent_id: string | null }>()
  for (const b of existingBrands) byName.set(brandValueKey(b.name), b)

  let createdCount = 0
  const seedById = new Map<string, { name: string; parent?: string }>()

  /** Parents first so child rows can reference parent_id. */
  const parents = SEED_BRANDS.filter((b) => !b.parent)
  const children = SEED_BRANDS.filter((b) => b.parent)

  for (const seed of [...parents, ...children]) {
    const existing = byName.get(brandValueKey(seed.name))
    if (existing) {
      seedById.set(existing.id, { name: existing.name, parent: seed.parent })
      continue
    }
    const parentId = seed.parent ? byName.get(brandValueKey(seed.parent))?.id ?? null : null
    if (apply) {
      const [created] = await brandService.createBrands([
        {
          name: seed.name,
          handle: seed.handle,
          external_code: seed.external_code ?? null,
          parent_id: parentId,
          is_active: true,
        },
      ])
      byName.set(brandValueKey(created.name), {
        id: created.id,
        name: created.name,
        parent_id: parentId,
      })
      seedById.set(created.id, { name: created.name, parent: seed.parent })
      createdCount++
      logger.info(`  Seeded brand "${created.name}" (id ${created.id})${parentId ? ` under ${seed.parent}` : ""}.`)
    } else {
      logger.info(
        `  [DRY] Would seed brand "${seed.name}" (handle ${seed.handle})${parentId ? ` under ${seed.parent}` : ""}.`
      )
      createdCount++
    }
  }

  logger.info(
    `Seed pass complete: ${createdCount} ${apply ? "created" : "would be created"}, ${existingBrands.length} pre-existing.`
  )

  // ---------- Pass 2: link every product --------------------------------------------------

  const PAGE = 200
  let offset = 0
  let linkedCount = 0
  let skippedExisting = 0
  let unresolved: Array<{ id: string; handle: string }> = []
  let total = 0

  while (true) {
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "handle", "metadata", "brand.id", "brand.name"],
      pagination: { take: PAGE, skip: offset },
    })
    if (!products?.length) break
    total += products.length

    for (const p of products as any[]) {
      const currentBrand = Array.isArray(p.brand) ? p.brand[0] : p.brand
      const inferred = inferBrandFromProduct({ handle: p.handle, metadata: p.metadata })
      if (!inferred) {
        unresolved.push({ id: p.id, handle: p.handle ?? "" })
        continue
      }
      const targetBrand =
        byName.get(brandValueKey(inferred.value)) ??
        // Try matching as a sub-brand of FashionBiz on common variants.
        null
      if (!targetBrand) {
        unresolved.push({ id: p.id, handle: p.handle ?? "" })
        continue
      }
      if (currentBrand?.id === targetBrand.id) {
        skippedExisting++
        continue
      }
      if (currentBrand?.id && !overwrite) {
        skippedExisting++
        continue
      }
      if (apply) {
        if (currentBrand?.id) {
          await link.dismiss({
            [Modules.PRODUCT]: { product_id: p.id },
            [BRAND_MODULE]: { brand_id: currentBrand.id },
          })
        }
        await link.create({
          [Modules.PRODUCT]: { product_id: p.id },
          [BRAND_MODULE]: { brand_id: targetBrand.id },
        })
      }
      linkedCount++
    }

    offset += products.length
    if (products.length < PAGE) break
  }

  logger.info(`Link pass complete on ${total} products:`)
  logger.info(`  ${linkedCount} ${apply ? "linked" : "would be linked"} to brand`)
  logger.info(`  ${skippedExisting} already correct or kept (use --overwrite to replace)`)
  logger.info(`  ${unresolved.length} unresolved (no brand link applied)`)

  if (unresolved.length) {
    const sample = unresolved.slice(0, 30)
    logger.info("First unresolved products:")
    for (const u of sample) {
      logger.info(`    ${u.id}  ${u.handle}`)
    }
    if (unresolved.length > sample.length) {
      logger.info(`    …and ${unresolved.length - sample.length} more. Triage in admin /app/brands.`)
    }
  }

  if (!apply) {
    logger.info("DRY-RUN complete. Re-run with `--apply` to commit.")
  } else {
    logger.info("Migration committed.")
  }

  if (!apply && createdCount === 0 && linkedCount === 0 && unresolved.length === 0) {
    logger.info("Nothing to do — brand layer already migrated.")
  }
}

/**
 * Helper used by the seed pass to slugify a brand name into a handle if a seed entry omits one
 * (we always provide handles in SEED_BRANDS, but the helper stays here for parity with the
 * admin-side handle derivation and for ad-hoc one-offs in the future).
 */
export { slugifyBrandHandle }
