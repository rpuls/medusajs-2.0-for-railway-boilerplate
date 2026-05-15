// Reusable helpers for upserting Medusa ProductType and ProductTag entities,
// then patching a product with the resolved IDs.
//
// Usage pattern (mirrors create-product-types.ts and spreadsheet-sync-tags.ts):
//   1. Call fetchAllProductTypes / fetchAllProductTags once per run to pre-populate caches.
//   2. Call applyTypeAndTagsToProduct for each product — cache hits avoid extra DB round-trips.

const PAGE = 500

type ProductTypeRecord = { id: string; value: string }
type ProductTagRecord = { id: string; value: string }

export type ProductModuleForSync = {
  listProductTypes(
    filters: Record<string, unknown>,
    config?: { take?: number | null; skip?: number | null }
  ): Promise<ProductTypeRecord[]>
  createProductTypes(data: { value: string }[]): Promise<ProductTypeRecord[]>
  listProductTags(
    filters: Record<string, unknown>,
    config?: { take?: number | null; skip?: number | null }
  ): Promise<ProductTagRecord[]>
  createProductTags(data: { value: string }[]): Promise<ProductTagRecord[]>
  updateProducts(
    id: string,
    data: Record<string, unknown>
  ): Promise<unknown>
}

/** Fetch all existing product types and return a Map<lowercase_value → id>. */
export async function fetchAllProductTypes(
  productModule: ProductModuleForSync
): Promise<Map<string, string>> {
  const cache = new Map<string, string>()
  let skip = 0
  while (true) {
    const batch = await productModule.listProductTypes({}, { take: PAGE, skip })
    for (const t of batch) cache.set(t.value.toLowerCase(), t.id)
    if (batch.length < PAGE) break
    skip += batch.length
  }
  return cache
}

/** Fetch all existing product tags and return a Map<lowercase_value → id>. */
export async function fetchAllProductTags(
  productModule: ProductModuleForSync
): Promise<Map<string, string>> {
  const cache = new Map<string, string>()
  let skip = 0
  while (true) {
    const batch = await productModule.listProductTags({}, { take: PAGE, skip })
    for (const t of batch) cache.set(t.value.toLowerCase(), t.id)
    if (batch.length < PAGE) break
    skip += batch.length
  }
  return cache
}

/**
 * Ensure a product type with the given canonical value exists.
 * Mutates typeCache on create so subsequent calls are cache hits.
 * Returns the type ID.
 */
export async function ensureProductType(
  productModule: ProductModuleForSync,
  canonicalValue: string,
  typeCache: Map<string, string>
): Promise<string> {
  const key = canonicalValue.toLowerCase()
  const existing = typeCache.get(key)
  if (existing) return existing
  const [created] = await productModule.createProductTypes([{ value: canonicalValue }])
  typeCache.set(key, created.id)
  return created.id
}

/**
 * Ensure product tags exist for all given canonical values.
 * Mutates tagCache on creates. Returns the IDs in input order.
 */
export async function ensureProductTags(
  productModule: ProductModuleForSync,
  canonicalValues: string[],
  tagCache: Map<string, string>
): Promise<string[]> {
  const toCreate = canonicalValues.filter((v) => !tagCache.has(v.toLowerCase()))
  if (toCreate.length) {
    const created = await productModule.createProductTags(
      toCreate.map((value) => ({ value }))
    )
    for (const t of created) tagCache.set(t.value.toLowerCase(), t.id)
  }
  return canonicalValues
    .map((v) => tagCache.get(v.toLowerCase()))
    .filter((id): id is string => id !== undefined)
}

/**
 * Upsert product_type and tags on a Medusa product.
 *
 * typeCache and tagCache should be pre-populated via fetchAllProductTypes /
 * fetchAllProductTags and shared across all products in a single run to
 * avoid repeated round-trips.
 *
 * Note: updateProducts with { tags: [{id}] } replaces the full tag set on
 * the product — acceptable for first-time assignment and backfill.
 */
export async function applyTypeAndTagsToProduct(params: {
  productModule: ProductModuleForSync
  productId: string
  productType: string | null
  tags: string[]
  typeCache: Map<string, string>
  tagCache: Map<string, string>
  dryRun?: boolean
}): Promise<{ typeId: string | null; tagIds: string[] }> {
  const { productModule, productId, productType, tags, typeCache, tagCache, dryRun } = params

  let typeId: string | null = null
  if (productType) {
    typeId = dryRun
      ? "(dry)"
      : await ensureProductType(productModule, productType, typeCache)
  }

  const tagIds = dryRun
    ? tags.map(() => "(dry)")
    : await ensureProductTags(productModule, tags, tagCache)

  if (!dryRun) {
    const patch: Record<string, unknown> = {}
    if (typeId) patch.type_id = typeId
    if (tagIds.length) patch.tags = tagIds.map((id) => ({ id }))
    if (Object.keys(patch).length) {
      await productModule.updateProducts(productId, patch)
    }
  }

  return { typeId, tagIds }
}
