import { sdk } from "@lib/config"
import { cache } from "react"
import { nextHeaders } from "./sdk-helpers"

const CATEGORIES_FETCH_INIT = nextHeaders({
  tags: ["categories"],
  revalidate: 600,
})

export const listCategories = cache(async function () {
  return sdk.store.category
    .list({ fields: "+category_children" }, CATEGORIES_FETCH_INIT)
    .then(({ product_categories }) => product_categories)
})

export const getCategoriesList = cache(async function (
  offset: number = 0,
  limit: number = 100
) {
  return sdk.store.category.list(
    // TODO: Look into fixing the type
    // @ts-ignore
    { limit, offset },
    CATEGORIES_FETCH_INIT
  )
})

export const getCategoryByHandle = cache(async function (
  categoryHandle: string[]
) {

  return sdk.store.category.list(
    // TODO: Look into fixing the type
    // @ts-ignore
    { handle: categoryHandle },
    CATEGORIES_FETCH_INIT
  )
})
