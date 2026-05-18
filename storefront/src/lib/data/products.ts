import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"
import { getRegion } from "./regions"
import { getBrandProducts } from "./brands"
import { nextHeaders } from "./sdk-helpers"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { ProductFilters } from "@modules/store/components/refinement-list/types"
import { sortProducts } from "@lib/util/sort-products"
import { isHoodieGarmentProduct } from "@modules/products/lib/variant-options"

/**
 * Match a product's brand against the URL `?brand=` filter. The filter value is the brand's
 * handle (URL-friendly) so the storefront filter is stable across renames; we also accept the
 * brand name (case-insensitive) for backwards compatibility with pre-migration links.
 *
 * Returns true if either the resolved brand handle or name matches the filter.
 */
function productBrandMatchesClientFilter(
  product: { brand?: { handle?: string | null; name?: string | null } | Array<{ handle?: string | null; name?: string | null }> | null },
  filterRaw: string
): boolean {
  const f = filterRaw.trim().toLowerCase()
  if (!f) return false
  const brand = Array.isArray(product.brand) ? product.brand[0] : product.brand
  if (!brand) return false
  const handle = (brand.handle ?? "").trim().toLowerCase()
  if (handle && (handle === f || handle.replace(/-/g, "") === f.replace(/-/g, ""))) return true
  const name = (brand.name ?? "").trim().toLowerCase()
  if (name && name === f) return true
  return false
}

/**
 * Field expansion for storefront product queries. `*brand` pulls in the linked Brand row
 * (id, name, handle, parent_id) so the storefront filter and PDP can read it directly.
 */
const STORE_PRODUCT_FIELDS =
  "+metadata,+type,+weight,*variants.calculated_price,*variants.options,+variants.metadata,+variants.sku,+variants.weight,+variants.manage_inventory,+variants.allow_backorder,+variants.inventory_quantity,+tags,*brand"

/**
 * Next.js Data Cache: tag for on-demand `revalidateTag("products", "max")`, plus a max age so catalog
 * changes (e.g. Draft after trim script) are not served forever without a redeploy.
 */
const PRODUCT_LIST_FETCH_INIT = nextHeaders({ tags: ["products"], revalidate: 120 })

export const getProductsById = cache(async function ({
  ids,
  regionId,
}: {
  ids: string[]
  regionId: string
}) {
  return sdk.store.product
    .list(
      {
        id: ids,
        region_id: regionId,
        fields: STORE_PRODUCT_FIELDS,
      },
      PRODUCT_LIST_FETCH_INIT
    )
    .then(({ products }) => products)
})

export async function getProductByHandle(
  handle: string,
  regionId?: string | null
) {
  const normalizedHandle = decodeURIComponent(String(handle ?? "")).trim().toLowerCase()
  if (!normalizedHandle) {
    return null
  }

  // `handle` is accepted at runtime; cast widens the SDK preview type.
  const baseParams = {
    handle: normalizedHandle,
    fields: STORE_PRODUCT_FIELDS,
  } as HttpTypes.FindParams & HttpTypes.StoreProductParams

  if (!regionId) {
    return null
  }

  try {
    const { products } = await sdk.store.product.list(
      {
        ...baseParams,
        region_id: regionId,
      },
      PRODUCT_LIST_FETCH_INIT
    )

    return products[0] ?? null
  } catch {
    return null
  }
}

/**
 * Product listing uses the Store API `limit` + `offset` parameters (cursor pagination is not exposed
 * on `sdk.store.product.list`). Large `page` values increase database work proportional to OFFSET.
 * Complement storefront caching with Postgres indexes — see `backend/scripts/sql/catalog-product-list-index.sql`.
 */
export const getProductsList = cache(async function ({
  pageParam = 1,
  queryParams,
  countryCode,
  brandHandle,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode: string
  /**
   * When set, fetches via the dedicated brand endpoint instead of the generic product list.
   * Avoids the 10KB-URL problem where passing many product IDs as ?id= query params
   * exceeded proxy URL limits for large brands (AS Colour ~250 products).
   */
  brandHandle?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> {
  const limit = queryParams?.limit || 12
  const validPageParam = Math.max(pageParam, 1);
  const offset = (validPageParam - 1) * limit
  const region = await getRegion(countryCode)

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  if (brandHandle) {
    const orderParam = (queryParams as any)?.order as string | undefined
    const typeIdRaw = (queryParams as any)?.type_id as string | string[] | undefined
    const tagIdRaw = (queryParams as any)?.tag_id as string | string[] | undefined
    const { products, count } = await getBrandProducts(brandHandle, {
      limit,
      offset,
      order: orderParam,
      region_id: region.id,
      type_id: typeIdRaw,
      tag_id: tagIdRaw,
    })
    const nextPage = count > offset + products.length ? pageParam + 1 : null
    return {
      response: { products, count },
      nextPage,
      queryParams,
    }
  }

  return sdk.store.product
    .list(
      {
        limit,
        offset,
        region_id: region.id,
        fields: STORE_PRODUCT_FIELDS,
        ...queryParams,
      },
      PRODUCT_LIST_FETCH_INIT
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
})

const HOME_FEATURED_LIMIT = 12
const HOME_FEATURED_SEARCH_FETCH = 48
const HOME_FEATURED_CATALOG_BATCH = 100
const HOME_FEATURED_MAX_CATALOG_PAGES = 40

/**
 * Home “Featured range”: load hoodies via store search (`q`) plus a catalog scan.
 * Newest products alone are often bags/accessories, so a plain `limit` slice misses apparel.
 */
export const getHomeFeaturedRangeProducts = cache(async function ({
  countryCode,
  limit = HOME_FEATURED_LIMIT,
}: {
  countryCode: string
  limit?: number
}): Promise<HttpTypes.StoreProduct[]> {
  const region = await getRegion(countryCode)
  if (!region) {
    return []
  }

  const addHoodies = (
    acc: Map<string, HttpTypes.StoreProduct>,
    list: HttpTypes.StoreProduct[]
  ) => {
    for (const p of list) {
      if (!p.id || acc.has(p.id)) {
        continue
      }
      if (isHoodieGarmentProduct(p)) {
        acc.set(p.id, p)
      }
    }
  }

  const byId = new Map<string, HttpTypes.StoreProduct>()

  for (const q of ["hoodie", "hood", "sweatshirt"]) {
    if (byId.size >= limit) {
      break
    }
    const { response } = await getProductsList({
      countryCode,
      // `q` (full-text search) is accepted at runtime; cast over preview-type drift.
      queryParams: {
        q,
        limit: HOME_FEATURED_SEARCH_FETCH,
      } as Parameters<typeof getProductsList>[0]["queryParams"],
    })
    addHoodies(byId, response.products)
  }

  let page = 1
  while (byId.size < limit && page <= HOME_FEATURED_MAX_CATALOG_PAGES) {
    const { response } = await getProductsList({
      countryCode,
      pageParam: page,
      queryParams: { limit: HOME_FEATURED_CATALOG_BATCH },
    })
    if (!response.products.length) {
      break
    }
    addHoodies(byId, response.products)
    page++
  }

  const hoodies = Array.from(byId.values()).slice(0, limit)
  if (hoodies.length > 0) {
    return hoodies
  }

  const { response } = await getProductsList({
    countryCode,
    queryParams: { limit },
  })
  return response.products
})

const CLIENT_FILTER_PAGE_BATCH = 100
/** Avoid unbounded API loops if `count` is wrong or the catalog is huge */
const CLIENT_FILTER_MAX_PAGES = 80

/**
 * Fetches products for list views.
 * - Default “Latest” (`created_at`) with no client filters: one Medusa page + API `count` so
 *   pagination matches the full catalog (not capped at 100 items / 9 pages).
 * - Price/title sort or brand-fabric-price-stock filters: loads catalog in batches (up to a cap),
 *   then filters/sorts/slices in memory.
 */
export const getProductsListWithSort = cache(async function ({
  page = 1,
  queryParams,
  sortBy = "created_at",
  filters,
  countryCode,
  brandHandle,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  filters?: ProductFilters
  countryCode: string
  brandHandle?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> {
  const limit = queryParams?.limit || 12
  const resolvedPage = !page || page < 1 ? 1 : page

  const getMetadataValue = (product: HttpTypes.StoreProduct, keys: string[]) => {
    const metadata = (product.metadata ?? {}) as Record<string, unknown>

    for (const key of keys) {
      const value = metadata[key]
      if (typeof value === "string" && value.trim()) {
        return value.trim()
      }
    }

    return null
  }

  const hasClientFilters = Boolean(
    filters?.brand ||
      filters?.fabric ||
      typeof filters?.minPrice === "number" ||
      typeof filters?.maxPrice === "number" ||
      filters?.inStock
  )

  const useApiPagination = sortBy === "created_at" && !hasClientFilters

  if (useApiPagination) {
    const { response } = await getProductsList({
      pageParam: resolvedPage,
      queryParams: {
        ...queryParams,
        limit,
      },
      countryCode,
      brandHandle,
    })
    const { products, count } = response
    const offsetStart = (resolvedPage - 1) * limit
    const hasMore = count > offsetStart + products.length
    return {
      response: { products, count },
      nextPage: hasMore ? resolvedPage + 1 : null,
      queryParams,
    }
  }

  let products: HttpTypes.StoreProduct[] = []

  let pageIdx = 1
  while (pageIdx <= CLIENT_FILTER_MAX_PAGES) {
    const batch = await getProductsList({
      pageParam: pageIdx,
      queryParams: {
        ...queryParams,
        limit: CLIENT_FILTER_PAGE_BATCH,
      },
      countryCode,
      brandHandle,
    })
    const batchProducts = batch.response.products
    const total = batch.response.count
    products.push(...batchProducts)
    if (batchProducts.length < CLIENT_FILTER_PAGE_BATCH || products.length >= total) {
      break
    }
    pageIdx++
  }

  const filteredProducts = products.filter((product) => {
    const variantPrices = (product.variants ?? [])
      .map((variant) => variant?.calculated_price?.calculated_amount)
      .filter((price): price is number => typeof price === "number")
    const minVariantPrice = variantPrices.length ? Math.min(...variantPrices) : null
    const hasStock = (product.variants ?? []).some(
      (variant) =>
        (variant as HttpTypes.StoreProductVariant)?.inventory_quantity === undefined ||
        (variant as HttpTypes.StoreProductVariant)?.inventory_quantity === null ||
        (variant as HttpTypes.StoreProductVariant).inventory_quantity! > 0
    )
    const fabric = getMetadataValue(product, [
      "fabric_type",
      "fabric",
      "material",
      "composition",
    ])?.toLowerCase()

    if (typeof filters?.minPrice === "number") {
      if (minVariantPrice === null || minVariantPrice < filters.minPrice) {
        return false
      }
    }

    if (typeof filters?.maxPrice === "number") {
      if (minVariantPrice === null || minVariantPrice > filters.maxPrice) {
        return false
      }
    }

    if (filters?.inStock && !hasStock) {
      return false
    }

    if (filters?.brand) {
      if (!productBrandMatchesClientFilter(product as any, filters.brand)) {
        return false
      }
    }

    if (filters?.fabric && fabric && !fabric.includes(filters.fabric.toLowerCase())) {
      return false
    }

    if (filters?.fabric && !fabric) {
      return false
    }

    return true
  })

  const sortedProducts = sortProducts(filteredProducts, sortBy)

  const sliceStart = (resolvedPage - 1) * limit

  const filteredCount = sortedProducts.length
  const nextPage = filteredCount > sliceStart + limit ? sliceStart + limit : null

  const paginatedProducts = sortedProducts.slice(sliceStart, sliceStart + limit)

  return {
    response: {
      products: paginatedProducts,
      count: filteredCount,
    },
    nextPage,
    queryParams,
  }
})
