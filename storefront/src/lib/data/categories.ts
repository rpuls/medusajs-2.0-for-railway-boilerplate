import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"
import { getCacheDirectives } from "./cookies"

// See the note in regions.ts for why these are client.fetch calls rather than
// the sdk.store.* helpers.
//
// A side benefit: the helper typed its query as StoreProductCategoryListParams,
// which declares neither `limit`/`offset` nor `handle`, so two of these calls
// carried a @ts-ignore to get past it. client.fetch takes a plain query bag,
// so the suppressions are gone rather than merely moved.
export const listCategories = cache(async function () {
  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      "/store/product-categories",
      {
        method: "GET",
        query: { fields: "+category_children" },
        ...(await getCacheDirectives("categories")),
      }
    )
    .then(({ product_categories }) => product_categories)
})

export const getCategoriesList = cache(async function (
  offset: number = 0,
  limit: number = 100
) {
  return sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
    "/store/product-categories",
    {
      method: "GET",
      query: { limit, offset },
      ...(await getCacheDirectives("categories")),
    }
  )
})

export const getCategoryByHandle = cache(async function (
  categoryHandle: string[]
) {
  return sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
    "/store/product-categories",
    {
      method: "GET",
      query: { handle: categoryHandle },
      ...(await getCacheDirectives("categories")),
    }
  )
})
