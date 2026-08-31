import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"
import { getCacheDirectives } from "./cookies"

// See the note in regions.ts for why this is a client.fetch call rather than
// the sdk.store.* helper.
export const listCartShippingMethods = cache(async function (cartId: string) {
  return sdk.client
    .fetch<HttpTypes.StoreShippingOptionListResponse>(
      "/store/shipping-options",
      {
        method: "GET",
        query: { cart_id: cartId },
        ...(await getCacheDirectives("shipping")),
      }
    )
    .then(({ shipping_options }) => shipping_options)
    .catch(() => {
      return null
    })
})
