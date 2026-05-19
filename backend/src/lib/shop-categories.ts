/**
 * Shared category-inference logic for the Shop mega-menu.
 *
 * Owns:
 *  - the audience × garment-type category tree definition
 *  - title/type-based inference of which categories a product belongs to
 *  - the idempotent tree-creation + product-assignment helpers used by both the
 *    one-shot bootstrap script and by the per-supplier importers
 *
 * Importers should call `ensureCategoryTree` + `assignCategoriesToProducts` at the
 * end of their flow, passing the IDs of newly-created products so we only re-walk
 * the rows that need a category set.
 */

import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows"

export type CategoryHandle = string
export type AudienceKey = "mens" | "womens" | "kids" | "accessories"

export type SubCategoryDef = {
  name: string
  handle: CategoryHandle
}

export type AudienceDef = {
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

export const TREE: AudienceDef[] = [
  { name: "Mens", handle: "mens", children: APPAREL_SUBS },
  { name: "Womens", handle: "womens", children: APPAREL_SUBS },
  { name: "Kids", handle: "kids", children: KIDS_SUBS },
  { name: "Accessories", handle: "accessories", children: ACCESSORY_SUBS },
]

/**
 * product_type.value → sub-category handle (under an audience parent).
 * Unmapped types yield `null` and the product is left without a Shop category.
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

/**
 * Map a product to its audience cohort(s). Accessory-typed products always land
 * under `accessories`; explicit kids / womens / mens cues route to a single
 * audience; everything else is treated as unisex apparel and assigned to BOTH
 * mens and womens so it surfaces in either drill-down.
 */
export function inferAudience(
  title: string,
  typeValue: string | null
): AudienceKey[] {
  const normalizedType = (typeValue ?? "").trim().toLowerCase()
  if (normalizedType && ACCESSORY_TYPES.has(normalizedType)) {
    return ["accessories"]
  }
  if (KW_KIDS.test(title)) return ["kids"]
  if (KW_WOMENS.test(title)) return ["womens"]
  if (KW_MENS.test(title)) return ["mens"]
  return ["mens", "womens"]
}

export function inferSubHandle(
  typeValue: string | null
): CategoryHandle | null {
  if (!typeValue) return null
  const key = typeValue.trim().toLowerCase()
  return TYPE_TO_SUB_HANDLE[key] ?? null
}

/**
 * Resolve the full handle list (`mens-t-shirts`, `womens-t-shirts`, …) for a
 * product. Empty array means the product has no Shop-category match.
 */
export function resolveCategoryHandles(
  title: string,
  typeValue: string | null
): CategoryHandle[] {
  const sub = inferSubHandle(typeValue)
  if (!sub) return []
  const audiences = inferAudience(title, typeValue)
  return audiences.map((a) => `${a}-${sub}`)
}

type CategoryRow = {
  id: string
  name: string
  handle: string
  parent_category_id: string | null
}

type LoggerLike = {
  info: (msg: string) => void
  warn?: (msg: string) => void
  error?: (msg: string) => void
}

type ContainerLike = {
  resolve: <T = unknown>(key: unknown) => T
}

/** Build a handle → id map for every existing category (including non-Shop ones). */
export async function loadCategoryIdsByHandle(
  container: ContainerLike
): Promise<Map<string, string>> {
  const query = container.resolve<any>(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
  })
  const map = new Map<string, string>()
  for (const c of (data ?? []) as CategoryRow[]) {
    if (c.handle && c.id) map.set(c.handle, c.id)
  }
  return map
}

/**
 * Idempotent — creates any missing audience or sub-category rows and returns
 * the full handle → id map. Safe to call from every importer; only missing
 * rows are inserted.
 */
export async function ensureCategoryTree(
  container: ContainerLike,
  options: { dryRun?: boolean; logger?: LoggerLike } = {}
): Promise<Map<string, string>> {
  const dryRun = !!options.dryRun
  const logger = options.logger ?? {
    info: () => {},
  }

  const byHandle = await loadCategoryIdsByHandle(container)

  const topToCreate = TREE.filter((t) => !byHandle.has(t.handle)).map((t) => ({
    name: t.name,
    handle: t.handle,
    is_active: true,
  }))
  if (topToCreate.length) {
    if (dryRun) {
      logger.info?.(
        `[dry-run] would create ${topToCreate.length} audience categories: ${topToCreate
          .map((t) => t.handle)
          .join(", ")}`
      )
    } else {
      const { result } = await createProductCategoriesWorkflow(
        container as any
      ).run({
        input: { product_categories: topToCreate },
      })
      for (const c of result as CategoryRow[]) byHandle.set(c.handle, c.id)
      logger.info?.(
        `Created ${result.length} audience categories: ${(result as CategoryRow[])
          .map((c) => c.handle)
          .join(", ")}`
      )
    }
  }

  const subToCreate: Array<{
    name: string
    handle: string
    is_active: boolean
    parent_category_id: string
  }> = []
  for (const audience of TREE) {
    const parentId = byHandle.get(audience.handle)
    if (!parentId) continue
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
      logger.info?.(`[dry-run] would create ${subToCreate.length} sub-categories`)
    } else {
      const { result } = await createProductCategoriesWorkflow(
        container as any
      ).run({
        input: { product_categories: subToCreate },
      })
      for (const c of result as CategoryRow[]) byHandle.set(c.handle, c.id)
      logger.info?.(`Created ${result.length} sub-categories`)
    }
  }

  return byHandle
}

export type AssignmentSummary = {
  updated: number
  skipped: number
  untyped: number
  failures: number
  sample: string[]
}

type ProductRow = {
  id: string
  title: string
  type: { value: string | null } | null
  categories: Array<{ id: string; handle: string }> | null
}

/**
 * Walk every product (or just `options.productIds`) and align its Shop-category
 * assignments with what `resolveCategoryHandles` says it should belong to.
 *
 * - Preserves non-Shop categories (collections, brand sub-categories, etc.)
 * - Skips products whose Shop-category set already matches
 * - Leaves untyped / unmapped products alone (no destructive cleanup)
 */
export async function assignCategoriesToProducts(
  container: ContainerLike,
  byHandle: Map<string, string>,
  options: {
    productIds?: string[]
    dryRun?: boolean
    logger?: LoggerLike
  } = {}
): Promise<AssignmentSummary> {
  const dryRun = !!options.dryRun
  const logger = options.logger ?? {
    info: () => {},
  }
  const query = container.resolve<any>(ContainerRegistrationKeys.QUERY)
  const productModule = container.resolve<any>(Modules.PRODUCT) as {
    updateProducts: (
      id: string,
      data: { category_ids?: string[] }
    ) => Promise<unknown>
  }

  const filters = options.productIds
    ? { id: options.productIds }
    : undefined
  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "title", "type.value", "categories.id", "categories.handle"],
    filters,
  })

  const rows = (data ?? []) as ProductRow[]

  const summary: AssignmentSummary = {
    updated: 0,
    skipped: 0,
    untyped: 0,
    failures: 0,
    sample: [],
  }

  for (const product of rows) {
    const typeValue = product.type?.value ?? null
    const targetHandles = resolveCategoryHandles(product.title ?? "", typeValue)
    if (targetHandles.length === 0) {
      summary.untyped++
      continue
    }
    const targetIds = targetHandles
      .map((h) => byHandle.get(h))
      .filter((id): id is string => !!id)
    if (targetIds.length === 0) {
      summary.untyped++
      continue
    }

    const existingShopIds = new Set(
      (product.categories ?? [])
        .filter((c) => {
          const handle = c.handle ?? ""
          return TREE.some((t) => handle.startsWith(`${t.handle}-`))
        })
        .map((c) => c.id)
    )
    const targetSet = new Set(targetIds)
    const sameSet =
      existingShopIds.size === targetSet.size &&
      [...targetSet].every((id) => existingShopIds.has(id))
    if (sameSet) {
      summary.skipped++
      continue
    }

    const preservedIds = (product.categories ?? [])
      .map((c) => c.id)
      .filter((id) => !existingShopIds.has(id))
    const finalIds = Array.from(new Set([...preservedIds, ...targetIds]))

    if (summary.sample.length < 5) {
      summary.sample.push(
        `  ${product.title} → ${targetHandles.join(", ")} (type=${typeValue ?? "—"})`
      )
    }

    if (dryRun) {
      summary.updated++
      continue
    }

    try {
      await productModule.updateProducts(product.id, { category_ids: finalIds })
      summary.updated++
    } catch (err) {
      summary.failures++
      logger.error?.(
        `Failed to update product ${product.id} (${product.title}): ${(err as Error)?.message ?? err}`
      )
    }
  }

  return summary
}
