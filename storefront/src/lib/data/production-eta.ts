import { sdk } from "@lib/config"
import { cache } from "react"

export type ProductionEta = {
  low_days: number
  high_days: number
  baseline_days: number
  queue_days: number
  congested_stages: string[]
}

const ETA_TAG = "production-eta"

const cacheInit = {
  // 15 minutes — ETA changes slowly and live reads on every PDP load
  // would hammer the order table for no real freshness gain.
  next: { tags: [ETA_TAG] as string[], revalidate: 900 },
}

export const getProductionEta = cache(async function (): Promise<ProductionEta | null> {
  try {
    return (await sdk.client.fetch("/store/production-eta", {
      headers: { ...cacheInit },
    })) as ProductionEta
  } catch {
    return null
  }
})
