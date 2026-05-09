import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

import type { SeoSummary } from "./types"

export const SEO_SUMMARY_CACHE_KEY = "seo-analytics:summary:v1"

// 48h TTL — twice the daily refresh interval so a single missed run doesn't blank the page.
const SEO_SUMMARY_TTL_SECONDS = 60 * 60 * 48

export async function readSummary(
  container: MedusaContainer
): Promise<SeoSummary | null> {
  try {
    const cache = container.resolve(Modules.CACHE) as any
    const v = await cache.get(SEO_SUMMARY_CACHE_KEY)
    if (!v) return null
    if (typeof v === "string") {
      try {
        return JSON.parse(v) as SeoSummary
      } catch {
        return null
      }
    }
    if (typeof v === "object") return v as SeoSummary
    return null
  } catch {
    return null
  }
}

export async function writeSummary(
  container: MedusaContainer,
  summary: SeoSummary
): Promise<void> {
  try {
    const cache = container.resolve(Modules.CACHE) as any
    // Cache modules vary in whether they accept objects or strings — stringify
    // for portability across the in-memory + redis-backed implementations.
    await cache.set(SEO_SUMMARY_CACHE_KEY, JSON.stringify(summary), SEO_SUMMARY_TTL_SECONDS)
  } catch {
    // Cache module unavailable — next read returns null and triggers a live refresh.
  }
}
