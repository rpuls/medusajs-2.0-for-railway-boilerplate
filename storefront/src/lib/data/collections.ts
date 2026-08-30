import { sdk } from "@lib/config"
import { cache } from "react"
import { getProductsList } from "./products"
import { HttpTypes } from "@medusajs/types"
import { getCacheDirectives } from "./cookies"

// See the note in regions.ts for why these are client.fetch calls rather than
// the sdk.store.* helpers.
export const retrieveCollection = cache(async function (id: string) {
  return sdk.client
    .fetch<HttpTypes.StoreCollectionResponse>(`/store/collections/${id}`, {
      method: "GET",
      ...(await getCacheDirectives("collections")),
    })
    .then(({ collection }) => collection)
})

export const getCollectionsList = cache(async function (
  offset: number = 0,
  limit: number = 100
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> {
  return sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>("/store/collections", {
      method: "GET",
      query: { limit, offset: 0 },
      ...(await getCacheDirectives("collections")),
    })
    .then(({ collections }) => ({ collections, count: collections.length }))
})

// Returns undefined for an unknown handle, so the type has to admit it. It
// was declared as always returning a collection, which hid the null check
// that both the page and its metadata depend on.
export const getCollectionByHandle = cache(async function (
  handle: string
): Promise<HttpTypes.StoreCollection | undefined> {
  return sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>("/store/collections", {
      method: "GET",
      query: { handle },
      ...(await getCacheDirectives("collections")),
    })
    .then(({ collections }) => collections[0])
})

export const getCollectionsWithProducts = cache(
  async (countryCode: string): Promise<HttpTypes.StoreCollection[] | null> => {
    const { collections } = await getCollectionsList(0, 3)

    if (!collections) {
      return null
    }

    const collectionIds = collections
      .map((collection) => collection.id)
      .filter(Boolean) as string[]

    const { response } = await getProductsList({
      queryParams: { collection_id: collectionIds },
      countryCode,
    })

    response.products.forEach((product) => {
      const collection = collections.find(
        (collection) => collection.id === product.collection_id
      )

      if (collection) {
        if (!collection.products) {
          collection.products = []
        }

        collection.products.push(product as any)
      }
    })

    return collections as unknown as HttpTypes.StoreCollection[]
  }
)
