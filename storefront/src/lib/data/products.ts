import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"
import { getRegion } from "./regions"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { sortProducts } from "@lib/util/sort-products"

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
        fields: "*variants.calculated_price,+variants.inventory_quantity",
      },
      { next: { tags: ["products"] } }
    )
    .then(({ products }) => products)
})

export const getProductByHandle = cache(async function (
  handle: string,
  regionId: string
) {
  return sdk.store.product
    .list(
      {
        handle,
        region_id: regionId,
        fields: "*variants.calculated_price,+variants.inventory_quantity",
      },
      {
        next: {
          tags: ["products", `product-${handle}`],
          revalidate: 3600, // ISR: revalidate every hour
        } as { tags: string[]; revalidate?: number },
      }
    )
    .then(({ products }) => products[0])
})

export const getProductsList = cache(async function ({
  pageParam = 1,
  queryParams,
  countryCode,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams & { brand_id?: string[] }
  countryCode: string
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

  // If brand_id is provided, use custom endpoint for server-side brand filtering
  if (queryParams?.brand_id && queryParams.brand_id.length > 0) {
    const BACKEND_URL =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:9000"

    // Build query params for custom endpoint
    const searchParams = new URLSearchParams()
    searchParams.set("limit", limit.toString())
    searchParams.set("offset", offset.toString())
    searchParams.set("region_id", region.id)
    searchParams.set("fields", "*variants.calculated_price,+variants.inventory_quantity")

    // Add brand_id (can be multiple)
    queryParams.brand_id.forEach((id) => {
      searchParams.append("brand_id", id)
    })

    // Add other filters
    if (queryParams.collection_id) {
      const collectionIds = Array.isArray(queryParams.collection_id)
        ? queryParams.collection_id
        : [queryParams.collection_id]
      collectionIds.forEach((id) => {
        searchParams.append("collection_id", id)
      })
    }

    if (queryParams.category_id) {
      const categoryIds = Array.isArray(queryParams.category_id)
        ? queryParams.category_id
        : [queryParams.category_id]
      categoryIds.forEach((id) => {
        searchParams.append("category_id", id)
      })
    }

    if (queryParams.id) {
      const ids = Array.isArray(queryParams.id)
        ? queryParams.id
        : [queryParams.id]
      ids.forEach((id) => {
        searchParams.append("id", id)
      })
    }

    if (queryParams.order) {
      searchParams.set("order", queryParams.order)
    }

    // Call custom endpoint with publishable API key
    const headers: HeadersInit = {}
    const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
    if (publishableKey) {
      headers["x-publishable-api-key"] = publishableKey
    }

    const response = await fetch(`${BACKEND_URL}/store/products/list?${searchParams.toString()}`, {
      headers,
      next: {
        tags: ["products"],
        revalidate: 3600, // ISR: revalidate every hour
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`)
    }

    const data = await response.json()
    const products = data.products || []
    const count = data.count || 0

    // Note: Products from custom endpoint may not have pricing calculated
    // We'll need to fetch priced products separately if needed
    // For now, return as-is and let the component handle pricing fetch
    const nextPage = count > offset + limit ? pageParam + 1 : null

    return {
      response: {
        products: products as HttpTypes.StoreProduct[],
        count,
      },
      nextPage: nextPage,
      queryParams,
    }
  }

  // Build the request params for standard SDK call (no brand filtering)
  const requestParams: any = {
    limit,
    offset,
    region_id: region.id,
    fields: "*variants.calculated_price,+variants.inventory_quantity",
  }

  // Explicitly add filter params to ensure they're included
  if (queryParams?.collection_id) {
    requestParams.collection_id = queryParams.collection_id
  }
  if (queryParams?.category_id) {
    requestParams.category_id = queryParams.category_id
  }
  if (queryParams?.id) {
    requestParams.id = queryParams.id
  }
  if (queryParams?.order) {
    requestParams.order = queryParams.order
  }

  return sdk.store.product
    .list(
      requestParams,
      {
        next: {
          tags: ["products"],
          revalidate: 3600, // ISR: revalidate every hour
        } as { tags: string[]; revalidate?: number },
      }
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

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const getProductsListWithSort = cache(async function ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> {
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await getProductsList({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const pageParam = (page - 1) * limit

  const nextPage = count > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
})
