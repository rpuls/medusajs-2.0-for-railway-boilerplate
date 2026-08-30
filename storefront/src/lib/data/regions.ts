import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { cache } from "react"
import { HttpTypes } from "@medusajs/types"
import { getCacheDirectives } from "./cookies"

/**
 * Reads go through sdk.client.fetch rather than the sdk.store.* helpers.
 *
 * Those helpers take headers as their last argument, not fetch options: the
 * SDK feeds every entry to headers.set(). So the `{ next: { tags: [...] } }`
 * this file used to pass was stringified into an HTTP header reading
 * `next: [object Object]` and sent to Medusa, which ignores it. Next never saw
 * a tag, and revalidateTag had nothing to invalidate.
 *
 * The SDK's own ClientHeaders type declares `{ tags: string[] }` as a valid
 * header value and documents it as Next.js caching, which is why this
 * typechecked cleanly and why the docs recommend it. It has never worked.
 * client.fetch takes a real RequestInit, so `next` and `cache` reach fetch.
 */
export const listRegions = cache(async function () {
  return sdk.client
    .fetch<HttpTypes.StoreRegionListResponse>("/store/regions", {
      method: "GET",
      ...(await getCacheDirectives("regions")),
    })
    .then(({ regions }) => regions)
    .catch(medusaError)
})

export const retrieveRegion = cache(async function (id: string) {
  return sdk.client
    .fetch<HttpTypes.StoreRegionResponse>(`/store/regions/${id}`, {
      method: "GET",
      ...(await getCacheDirectives("regions")),
    })
    .then(({ region }) => region)
    .catch(medusaError)
})

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = cache(async function (countryCode: string) {
  try {
    if (regionMap.has(countryCode)) {
      return regionMap.get(countryCode)
    }

    const regions = await listRegions()

    if (!regions) {
      return null
    }

    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        regionMap.set(c?.iso_2 ?? "", region)
      })
    })

    const region = countryCode
      ? regionMap.get(countryCode)
      : regionMap.get("us")

    return region
  } catch (e: any) {
    return null
  }
})
