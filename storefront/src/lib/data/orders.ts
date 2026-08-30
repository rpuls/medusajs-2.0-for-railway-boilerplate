"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"
import { getAuthHeaders, getCacheDirectives } from "./cookies"

// See the note in regions.ts for why these are client.fetch calls rather than
// the sdk.store.* helpers. As in customer.ts, the old calls mixed the cache tag
// in with the authorization header, so only the auth half ever took effect.
export const retrieveOrder = cache(async function (id: string) {
  return sdk.client
    .fetch<HttpTypes.StoreOrderResponse>(`/store/orders/${id}`, {
      method: "GET",
      query: { fields: "*payment_collections.payments" },
      headers: { ...(await getAuthHeaders()) },
      ...(await getCacheDirectives("orders")),
    })
    .then(({ order }) => order)
    .catch((err) => medusaError(err))
})

export const listOrders = cache(async function (
  limit: number = 10,
  offset: number = 0
) {
  return sdk.client
    .fetch<HttpTypes.StoreOrderListResponse>("/store/orders", {
      method: "GET",
      query: { limit, offset },
      headers: { ...(await getAuthHeaders()) },
      ...(await getCacheDirectives("orders")),
    })
    .then(({ orders }) => orders)
    .catch((err) => medusaError(err))
})
