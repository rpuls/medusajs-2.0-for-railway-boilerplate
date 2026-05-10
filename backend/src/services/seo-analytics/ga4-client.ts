import { BetaAnalyticsDataClient } from "@google-analytics/data"
import { google } from "googleapis"
import type { analyticsdata_v1beta } from "googleapis"

import { getImpersonationSubject, getServiceAccountKey } from "./google-auth"
import type { Ga4ByDay, Ga4PageRow, Ga4Summary } from "./types"

const SCOPE = "https://www.googleapis.com/auth/analytics.readonly"
const TOP_PAGE_LIMIT = 25

/**
 * GA4's official @google-analytics/data SDK is gRPC-first and breaks in
 * three different ways under Domain-Wide Delegation (subject impersonation):
 *
 *   1. Pass a raw JWT → `this.auth.getUniverseDomain is not a function`
 *   2. Pass a GoogleAuth + gRPC default → `headers.forEach is not a function`
 *   3. Pass a GoogleAuth + fallback: "rest" → `auth.fetch is not a function`
 *
 * Rather than chase compatibility down the gax stack, the impersonation path
 * uses `googleapis.analyticsdata` (a plain REST client that already plays
 * nicely with `google.auth.JWT` + subject — same shape gsc-client uses).
 *
 * The non-DWD path keeps using BetaAnalyticsDataClient so we don't change the
 * working code path for environments without `SEO_IMPERSONATION_USER`.
 */

type Ga4Row = analyticsdata_v1beta.Schema$Row

type Ga4Result = {
  rows: Ga4Row[]
}

interface Ga4Caller {
  runReport(req: {
    property: string
    dateRanges: { startDate: string; endDate: string }[]
    metrics?: { name: string }[]
    dimensions?: { name: string }[]
    orderBys?: any[]
    limit?: number
  }): Promise<Ga4Result>
}

function buildCaller(): Ga4Caller {
  const key = getServiceAccountKey()
  const subject = getImpersonationSubject()

  if (subject) {
    const jwt = new google.auth.JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: [SCOPE],
      subject,
    })
    const analyticsdata = google.analyticsdata({ version: "v1beta", auth: jwt })
    return {
      async runReport(req) {
        const res = await analyticsdata.properties.runReport({
          property: req.property,
          requestBody: {
            dateRanges: req.dateRanges,
            metrics: req.metrics,
            dimensions: req.dimensions,
            orderBys: req.orderBys,
            limit: req.limit ? String(req.limit) : undefined,
          },
        })
        return { rows: res.data.rows ?? [] }
      },
    }
  }

  const client = new BetaAnalyticsDataClient({
    credentials: {
      client_email: key.client_email,
      private_key: key.private_key,
    },
  })
  return {
    async runReport(req) {
      const [res] = await client.runReport(req as any)
      // The gRPC client returns nested objects with the same field names as
      // the REST schema; cast through to share the consumer code.
      return { rows: (res.rows ?? []) as unknown as Ga4Row[] }
    },
  }
}

function toNum(raw: string | null | undefined): number {
  if (!raw) return 0
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

function ga4DateToIso(raw: string): string {
  // GA4 returns dates as YYYYMMDD when the dimension is "date".
  if (raw.length === 8) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
  }
  return raw
}

/**
 * Pulls 28-day (or `days`) GA4 totals, top pages by sessions, and daily session
 * trend for one property. Conversions = total `conversions` event count across
 * the property — adjust the metric here if you want a single named conversion.
 */
export async function fetchGa4Summary(
  propertyId: string,
  days: number
): Promise<Ga4Summary> {
  const caller = buildCaller()
  const dateRanges = [{ startDate: `${days}daysAgo`, endDate: "today" }]
  const property = `properties/${propertyId}`

  const [totalsRes, topPagesRes, byDayRes] = await Promise.all([
    caller.runReport({
      property,
      dateRanges,
      metrics: [
        { name: "sessions" },
        { name: "conversions" },
        { name: "engagedSessions" },
        { name: "averageSessionDuration" },
      ],
    }),
    caller.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "sessions" }, { name: "conversions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: TOP_PAGE_LIMIT,
    }),
    caller.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
  ])

  const totalsRow = totalsRes.rows[0]?.metricValues ?? []
  const totals = {
    sessions: toNum(totalsRow[0]?.value),
    conversions: toNum(totalsRow[1]?.value),
    engagedSessions: toNum(totalsRow[2]?.value),
    averageSessionDuration: toNum(totalsRow[3]?.value),
  }

  const topPages: Ga4PageRow[] = topPagesRes.rows.map((row) => ({
    path: row.dimensionValues?.[0]?.value ?? "",
    sessions: toNum(row.metricValues?.[0]?.value),
    conversions: toNum(row.metricValues?.[1]?.value),
  }))

  const byDay: Ga4ByDay[] = byDayRes.rows.map((row) => ({
    date: ga4DateToIso(row.dimensionValues?.[0]?.value ?? ""),
    sessions: toNum(row.metricValues?.[0]?.value),
  }))

  return { totals, topPages, byDay }
}
