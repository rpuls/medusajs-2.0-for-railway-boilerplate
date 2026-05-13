import { sdk } from "@lib/config"
import { cache } from "react"
import { getProductsList } from "./products"
import { HttpTypes } from "@medusajs/types"
import { nextHeaders } from "./sdk-helpers"

const COLLECTIONS_FETCH_INIT = nextHeaders({
  tags: ["collections"],
  revalidate: 600,
})

export const retrieveCollection = cache(async function (id: string) {
  return sdk.store.collection
    .retrieve(id, {}, COLLECTIONS_FETCH_INIT)
    .then(({ collection }) => collection)
})

export const getCollectionsList = cache(async function (
  offset: number = 0,
  limit: number = 100
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> {
  return sdk.store.collection
    .list({ limit, offset: 0 }, COLLECTIONS_FETCH_INIT)
    .then(({ collections }) => ({ collections, count: collections.length }))
})

export const getCollectionByHandle = cache(async function (
  handle: string
): Promise<HttpTypes.StoreCollection> {
  return sdk.store.collection
    .list({ handle }, COLLECTIONS_FETCH_INIT)
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
      // collection_id accepted at runtime; cast over SDK preview type drift.
      queryParams: { collection_id: collectionIds } as Parameters<
        typeof getProductsList
      >[0]["queryParams"],
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
