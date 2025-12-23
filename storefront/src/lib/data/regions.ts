"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { cacheLife } from "next/cache"
import { HttpTypes } from "@medusajs/types"

// Regions metadata can be cached - doesn't include prices
export async function listRegions() {
  "use cache"
  cacheLife("hours") // Cache for 1 hour
  
  return sdk.store.region
    .list(
      {},
      {
        next: {
          tags: ["regions"],
        },
      }
    )
    .then(({ regions }) => regions)
    .catch(medusaError)
}

// Regions metadata can be cached - doesn't include prices
export async function retrieveRegion(id: string) {
  "use cache"
  cacheLife("hours") // Cache for 1 hour
  
  return sdk.store.region
    .retrieve(id, {}, { next: { tags: ["regions"] } })
    .then(({ region }) => region)
    .catch(medusaError)
}

// Regions metadata can be cached - doesn't include prices
export async function getRegion(countryCode: string) {
  "use cache"
  cacheLife("hours") // Cache for 1 hour
  
  try {
    // Normalize country code to lowercase for consistent lookup
    const normalizedCode = countryCode?.toLowerCase() || ""
    
    const regions = await listRegions()

    if (!regions) {
      return null
    }

    // Find region by country code
    const region = regions.find((region) =>
      region.countries?.some((c) => c?.iso_2?.toLowerCase() === normalizedCode)
    )

    return region || regions.find((region) =>
      region.countries?.some((c) => c?.iso_2?.toLowerCase() === "us")
    ) || null
  } catch (e: any) {
    return null
  }
}
