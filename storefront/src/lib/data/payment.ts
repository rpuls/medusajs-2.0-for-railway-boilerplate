import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { cache } from "react"
import { getCacheDirectives } from "./cookies"

// See the note in regions.ts for why this is a client.fetch call rather than
// the sdk.store.* helper.
export const listCartPaymentMethods = cache(async function (regionId: string) {
  return sdk.client
    .fetch<HttpTypes.StorePaymentProviderListResponse>(
      "/store/payment-providers",
      {
        method: "GET",
        query: { region_id: regionId },
        ...(await getCacheDirectives("payment_providers")),
      }
    )
    .then(({ payment_providers }) => payment_providers)
    .catch(() => {
      return null
    })
})
