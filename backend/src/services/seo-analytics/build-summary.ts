import { GA4_PROPERTY_ID, GSC_SITE_URL } from "../../lib/constants"

import { fetchGa4Summary } from "./ga4-client"
import { fetchGscSummary } from "./gsc-client"
import { isSeoConfigured } from "./google-auth"
import type { SeoSourceFailure, SeoSummary } from "./types"

export const SEO_SUMMARY_DAYS = 28

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Calls GSC + GA4 in parallel and merges into a single payload. A failure in
 * one source produces `status: "partial"` (with the other source's data still
 * populated), so a transient API outage doesn't blank the entire dashboard.
 *
 * Returns `status: "error"` only when both sources fail.
 */
export async function buildSeoSummary(days = SEO_SUMMARY_DAYS): Promise<SeoSummary> {
  const errors: SeoSourceFailure[] = []
  const range = { days, start: isoDaysAgo(days), end: todayIso() }

  if (!isSeoConfigured()) {
    return {
      status: "empty",
      generated_at: new Date().toISOString(),
      range,
      gsc: null,
      ga4: null,
      errors: [
        {
          source: "gsc",
          message: "GOOGLE_SERVICE_ACCOUNT_JSON not configured.",
        },
      ],
    }
  }

  const gscPromise = GSC_SITE_URL
    ? fetchGscSummary(GSC_SITE_URL, days).catch((err: any) => {
        errors.push({
          source: "gsc",
          message: err?.message ?? String(err),
        })
        return null
      })
    : Promise.resolve(null).then(() => {
        errors.push({ source: "gsc", message: "GSC_SITE_URL is not set." })
        return null
      })

  const ga4Promise = GA4_PROPERTY_ID
    ? fetchGa4Summary(GA4_PROPERTY_ID, days).catch((err: any) => {
        errors.push({
          source: "ga4",
          message: err?.message ?? String(err),
        })
        return null
      })
    : Promise.resolve(null).then(() => {
        errors.push({ source: "ga4", message: "GA4_PROPERTY_ID is not set." })
        return null
      })

  const [gsc, ga4] = await Promise.all([gscPromise, ga4Promise])

  let status: SeoSummary["status"]
  if (gsc && ga4) status = "ok"
  else if (gsc || ga4) status = "partial"
  else status = "error"

  return {
    status,
    generated_at: new Date().toISOString(),
    range,
    gsc,
    ga4,
    errors,
  }
}
