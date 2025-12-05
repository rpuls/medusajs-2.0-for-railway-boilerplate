import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { cache } from "react"
import { HttpTypes } from "@medusajs/types"

export const listRegions = cache(async function () {
  return sdk.store.region
    .list(
      {},
      {
        next: {
          tags: ["regions"],
          revalidate: 3600, // ISR: revalidate every hour
        },
      }
    )
    .then(({ regions }) => regions)
    .catch(medusaError)
})

export const retrieveRegion = cache(async function (id: string) {
  return sdk.store.region
    .retrieve(id, {}, { next: { tags: ["regions"] } })
    .then(({ region }) => region)
    .catch(medusaError)
})

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = cache(async function (countryCode: string) {
  try {
    // Normalize country code to lowercase for consistent lookup
    const normalizedCode = countryCode?.toLowerCase() || ""
    
    if (regionMap.has(normalizedCode)) {
      return regionMap.get(normalizedCode)
    }

    const regions = await listRegions()

    if (!regions) {
      return null
    }

    // Populate region map with normalized country codes
    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        const iso2 = c?.iso_2?.toLowerCase() ?? ""
        if (iso2) {
          regionMap.set(iso2, region)
        }
      })
    })

    const region = normalizedCode
      ? regionMap.get(normalizedCode)
      : regionMap.get("us")

    return region
  } catch (e: any) {
    return null
  }
})
