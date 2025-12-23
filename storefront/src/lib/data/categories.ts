import { sdk } from "@lib/config"
import { cacheLife } from "next/cache"

// Categories metadata can be cached - doesn't include prices
export async function listCategories() {
  "use cache"
  cacheLife("hours") // Cache for 1 hour
  
  return sdk.store.category
    .list({ fields: "+category_children" }, { next: { tags: ["categories"] } })
    .then(({ product_categories }) => product_categories)
}

// Categories metadata can be cached - doesn't include prices
export async function getCategoriesList(
  offset: number = 0,
  limit: number = 100
) {
  "use cache"
  cacheLife("hours") // Cache for 1 hour
  
  return sdk.store.category.list(
    // TODO: Look into fixing the type
    // @ts-ignore
    { limit, offset, fields: "+category_children" },
    { next: { tags: ["categories"] } }
  )
}

// Categories metadata can be cached - doesn't include prices
export async function getCategoryByHandle(
  categoryHandle: string[]
) {
  "use cache"
  cacheLife("hours") // Cache for 1 hour

  return sdk.store.category.list(
    // TODO: Look into fixing the type
    // @ts-ignore
    { handle: categoryHandle },
    { next: { tags: ["categories"] } }
  )
}
