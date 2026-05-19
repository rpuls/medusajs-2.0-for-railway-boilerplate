/**
 * One-shot bootstrap for the Shop mega-menu category tree.
 *
 * Creates the four top-level audience categories (Mens / Womens / Kids / Accessories)
 * and their sub-categories (T-Shirts / Hoodies / Polos / Headwear / ...) — idempotently.
 * Then walks every product in the catalog and assigns it to the matching categories
 * based on:
 *
 *   1. The product's `product_type.value` (e.g. "T-Shirts", "Hoodies", "Headwear")
 *      → maps to a sub-category handle.
 *   2. The product title's audience cues ("Womens", "Mens", "Kids", "Youth", ...)
 *      → maps to a top-level audience. Products with no audience cue and an apparel
 *      type are treated as Unisex and assigned to BOTH Mens and Womens.
 *   3. Accessory-typed products (Headwear / Bags / Stickers / Drinkware) ignore the
 *      audience cue and go under the Accessories top-level.
 *
 * Designed to be safe to re-run — existing categories are reused, and only products
 * whose category set needs adjustment are touched. Set `DRY_RUN=1` to log without
 * writing.
 *
 * Local: `cd backend && npx medusa exec src/scripts/setup-shop-categories.ts`
 * Railway: `cd /app/.medusa/server && npx medusa exec src/scripts/setup-shop-categories.js`
 */

import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows"

type CategoryHandle = string

type SubCategoryDef = {
  name: string
  handle: CategoryHandle
}

type AudienceDef = {
  name: string
  handle: CategoryHandle
  children: SubCategoryDef[]
}

const APPAREL_SUBS: SubCategoryDef[] = [
  { name: "T-Shirts", handle: "t-shirts" },
  { name: "Hoodies & Sweatshirts", handle: "hoodies" },
  { name: "Polos", handle: "polos" },
  { name: "Long Sleeves", handle: "long-sleeves" },
  { name: "Tanks & Singlets", handle: "tanks-singlets" },
  { name: "Jackets", handle: "jackets" },
  { name: "Pants & Shorts", handle: "pants-shorts" },
  { name: "Workwear", handle: "workwear" },
  { name: "Activewear", handle: "activewear" },
]

const KIDS_SUBS: SubCategoryDef[] = [
  { name: "T-Shirts", handle: "t-shirts" },
  { name: "Hoodies & Sweatshirts", handle: "hoodies" },
  { name: "Long Sleeves", handle: "long-sleeves" },
  { name: "Tanks & Singlets", handle: "tanks-singlets" },
]

const ACCESSORY_SUBS: SubCategoryDef[] = [
  { name: "Headwear", handle: "headwear" },
  { name: "Bags", handle: "bags" },
  { name: "Drinkware", handle: "drinkware" },
  { name: "Stickers", handle: "stickers" },
  { name: "Other Accessories", handle: "other" },
]

const TREE: AudienceDef[] = [
  { name: "Mens", handle: "mens", children: APPAREL_SUBS },
  { name: "Womens", handle: "womens", children: APPAREL_SUBS },
  { name: "Kids", handle: "kids", children: KIDS_SUBS },
  { name: "Accessories", handle: "accessories", children: ACCESSORY_SUBS },
]

/**
 * product_type.value → sub-category handle (under an audience parent).
 * Unmapped types are left without a sub-category assignment.
 */
const TYPE_TO_SUB_HANDLE: Record<string, CategoryHandle> = {
  "t-shirts": "t-shirts",
  hoodies: "hoodies",
  sweatshirts: "hoodies",
  polos: "polos",
  longsleeves: "long-sleeves",
  "long sleeves": "long-sleeves",
  "singlets / tanks": "tanks-singlets",
  "tanks / singlets": "tanks-singlets",
  singlets: "tanks-singlets",
  tanks: "tanks-singlets",
  jackets: "jackets",
  pants: "pants-shorts",
  shorts: "pants-shorts",
  trackpants: "pants-shorts",
  overalls: "pants-shorts",
  headwear: "headwear",
  bags: "bags",
  drinkware: "drinkware",
  stickers: "stickers",
}

const ACCESSORY_TYPES = new Set(["headwear", "bags", "drinkware", "stickers"])

const KW_WOMENS = /\b(women|womens|woman|women's|ladies|ladie's|lady|female)s?\b/i
const KW_MENS = /\b(mens|men's|gents)\b/i
const KW_KIDS = /\b(kid|kids|youth|child|children|infant|baby|babies|toddler)s?\b/i

type AudienceKey = "mens" | "womens" | "kids" | "accessories"

function inferAudience(title: string, typeValue: string | null): AudienceKey[] {
  const normalizedType = (typeValue ?? "").trim().toLowerCase()
  if (normalizedType && ACCESSORY_TYPES.has(normalizedType)) {
    return ["accessories"]
  }
  // Order matters — check kids first (avoid "kids tee" matching mens), then womens
  // (kw_womens won't match because of word boundaries), then mens.
  if (KW_KIDS.test(title)) return ["kids"]
  if (KW_WOMENS.test(title)) return ["womens"]
  if (KW_MENS.test(title)) return ["mens"]
  // Unisex apparel — surface in both Mens and Womens audience browses.
  return ["mens", "womens"]
}

function inferSubHandle(typeValue: string | null): CategoryHandle | null {
  if (!typeValue) return null
  const key = typeValue.trim().toLowerCase()
  return TYPE_TO_SUB_HANDLE[key] ?? null
}

type CategoryRow = {
  id: string
  name: string
  handle: string
  parent_category_id: string | null
}

async function ensureCategoryTree(
  container: ExecArgs["container"],
  dryRun: boolean
): Promise<Map<string, string>> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // Map<handle, id> for all created/found categories.
  const byHandle = new Map<string, string>()

  // Pre-load every existing category so we can dedupe.
  const { data: existing } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle", "parent_category_id"],
  })
  for (const c of (existing ?? []) as CategoryRow[]) {
    byHandle.set(c.handle, c.id)
  }

  // 1. Top-level (audience) categories — created without parent.
  const topToCreate = TREE.filter((t) => !byHandle.has(t.handle)).map((t) => ({
    name: t.name,
    handle: t.handle,
    is_active: true,
  }))
  if (topToCreate.length) {
    if (dryRun) {
      logger.info(`[dry-run] would create ${topToCreate.length} audience categories: ${topToCreate.map((t) => t.handle).join(", ")}`)
    } else {
      const { result } = await createProductCategoriesWorkflow(container).run({
        input: { product_categories: topToCreate },
      })
      for (const c of result) byHandle.set(c.handle, c.id)
      logger.info(`Created ${result.length} audience categories: ${result.map((c) => c.handle).join(", ")}`)
    }
  }

  // 2. Sub-categories — namespaced by audience to keep handles globally unique.
  //    Handle convention: `{audience}-{sub}` (e.g. "mens-t-shirts").
  const subToCreate: Array<{
    name: string
    handle: string
    is_active: boolean
    parent_category_id: string
  }> = []
  for (const audience of TREE) {
    const parentId = byHandle.get(audience.handle)
    if (!parentId) {
      // Top-level dry-run skipped creating this audience — log and skip its children too.
      if (!dryRun) {
        logger.warn(`Audience category not found after create: ${audience.handle}`)
      }
      continue
    }
    for (const sub of audience.children) {
      const fullHandle = `${audience.handle}-${sub.handle}`
      if (byHandle.has(fullHandle)) continue
      subToCreate.push({
        name: sub.name,
        handle: fullHandle,
        is_active: true,
        parent_category_id: parentId,
      })
    }
  }
  if (subToCreate.length) {
    if (dryRun) {
      logger.info(`[dry-run] would create ${subToCreate.length} sub-categories`)
      for (const s of subToCreate) logger.info(`  ${s.handle} (under ${s.parent_category_id})`)
    } else {
      const { result } = await createProductCategoriesWorkflow(container).run({
        input: { product_categories: subToCreate },
      })
      for (const c of result) byHandle.set(c.handle, c.id)
      logger.info(`Created ${result.length} sub-categories`)
    }
  }

  return byHandle
}

type ProductRow = {
  id: string
  title: string
  type: { value: string | null } | null
  categories: Array<{ id: string; handle: string }> | null
}

async function assignProductsToCategories(
  container: ExecArgs["container"],
  byHandle: Map<string, string>,
  dryRun: boolean
): Promise<void> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule = container.resolve(Modules.PRODUCT) as {
    updateProducts: (id: string, data: { category_ids?: string[] }) => Promise<unknown>
  }

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "type.value", "categories.id", "categories.handle"],
  })

  const productRows = (products ?? []) as ProductRow[]
  logger.info(`Walking ${productRows.length} products for category assignment...`)

  let updated = 0
  let skipped = 0
  let untyped = 0
  const sampleLog: string[] = []

  for (const product of productRows) {
    const typeValue = product.type?.value ?? null
    const subHandle = inferSubHandle(typeValue)
    if (!subHandle) {
      untyped++
      continue
    }

    const audiences = inferAudience(product.title ?? "", typeValue)
    const targetHandles = audiences.map((a) => `${a}-${subHandle}`)
    const targetIds = targetHandles
      .map((h) => byHandle.get(h))
      .filter((id): id is string => !!id)

    if (targetIds.length === 0) {
      untyped++
      continue
    }

    // Existing assignments under our managed scope (everything under any audience handle).
    const existingTargetIds = new Set(
      (product.categories ?? [])
        .filter((c) => {
          const handle = c.handle ?? ""
          return TREE.some((t) => handle.startsWith(`${t.handle}-`))
        })
        .map((c) => c.id)
    )

    // Diff against target — skip if already correct.
    const targetSet = new Set(targetIds)
    const sameSet =
      existingTargetIds.size === targetSet.size &&
      [...targetSet].every((id) => existingTargetIds.has(id))
    if (sameSet) {
      skipped++
      continue
    }

    // Preserve any non-managed categories (collections, brand sub-categories, etc.)
    // by merging them with the new audience-scoped assignments.
    const preservedIds = (product.categories ?? [])
      .map((c) => c.id)
      .filter((id) => !existingTargetIds.has(id))
    const finalIds = Array.from(new Set([...preservedIds, ...targetIds]))

    if (sampleLog.length < 5) {
      sampleLog.push(
        `  ${product.title} → ${targetHandles.join(", ")} (type=${typeValue ?? "—"})`
      )
    }

    if (dryRun) {
      updated++
      continue
    }

    try {
      await productModule.updateProducts(product.id, { category_ids: finalIds })
      updated++
    } catch (err) {
      logger.error(
        `Failed to update product ${product.id} (${product.title}): ${(err as Error)?.message ?? err}`
      )
    }
  }

  logger.info("---")
  logger.info(`Sample of mappings:`)
  for (const line of sampleLog) logger.info(line)
  logger.info("---")
  logger.info(`Assignment summary:`)
  logger.info(`  Updated:    ${updated}${dryRun ? " (dry-run)" : ""}`)
  logger.info(`  Skipped:    ${skipped} (already correct)`)
  logger.info(`  Untyped:    ${untyped} (no product_type or unmapped — left untouched)`)
}

export default async function setupShopCategories({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const dryRun = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true"
  if (dryRun) {
    logger.info("DRY_RUN=1 — no writes will be performed")
  }

  logger.info("Step 1/2 — ensure category tree")
  const byHandle = await ensureCategoryTree(container, dryRun)

  logger.info("Step 2/2 — assign products to categories")
  await assignProductsToCategories(container, byHandle, dryRun)

  logger.info("Done.")
}
