import { BetaAnalyticsDataClient } from "@google-analytics/data"

import { getServiceAccountKey } from "./google-auth"

/**
 * Acquisition-focused GA4 queries. Distinct from `fetchGa4Summary` (which
 * is for the SEO Analytics page) — these power the Reports page's
 * Acquisition tab. Three breakdowns:
 *
 *   - Source / medium → sessions, engaged sessions, engagement rate
 *   - Landing page → sessions, engaged sessions
 *   - Device → sessions, engaged sessions, bounce rate
 *
 * All run in parallel against the same date window. The window is
 * driven by absolute ISO dates so the report can match Reports'
 * filter-bar selection rather than GA4's "Nd ago" relative offsets.
 */

const TOP_LIMIT = 25

const buildClient = () => {
  const key = getServiceAccountKey()
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: key.client_email,
      private_key: key.private_key,
    },
  })
}

const toNum = (raw: string | null | undefined): number => {
  if (!raw) return 0
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

const toIsoDate = (iso: string): string => {
  // GA4's date-range API expects YYYY-MM-DD strings.
  const d = new Date(iso)
  if (!Number.isFinite(d.getTime())) return new Date().toISOString().slice(0, 10)
  return d.toISOString().slice(0, 10)
}

export type Ga4SourceRow = {
  source: string
  medium: string
  sessions: number
  engaged_sessions: number
  engagement_rate: number
}

export type Ga4LandingRow = {
  path: string
  sessions: number
  engaged_sessions: number
  engagement_rate: number
}

export type Ga4DeviceRow = {
  device: string
  sessions: number
  engaged_sessions: number
  bounce_rate: number
}

export type Ga4Acquisition = {
  totals: {
    sessions: number
    engaged_sessions: number
    bounce_rate: number
  }
  source_medium: Ga4SourceRow[]
  landing_pages: Ga4LandingRow[]
  devices: Ga4DeviceRow[]
}

export async function fetchGa4Acquisition(
  propertyId: string,
  fromIso: string,
  toIso: string
): Promise<Ga4Acquisition> {
  const analytics = buildClient()
  const property = `properties/${propertyId}`
  const dateRanges = [
    {
      startDate: toIsoDate(fromIso),
      endDate: toIsoDate(toIso),
    },
  ]

  const [totalsRes, sourceRes, landingRes, deviceRes] = await Promise.all([
    analytics.runReport({
      property,
      dateRanges,
      metrics: [
        { name: "sessions" },
        { name: "engagedSessions" },
        { name: "bounceRate" },
      ],
    }),
    analytics.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
      metrics: [{ name: "sessions" }, { name: "engagedSessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: TOP_LIMIT,
    }),
    analytics.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "landingPage" }],
      metrics: [{ name: "sessions" }, { name: "engagedSessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: TOP_LIMIT,
    }),
    analytics.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "deviceCategory" }],
      metrics: [
        { name: "sessions" },
        { name: "engagedSessions" },
        { name: "bounceRate" },
      ],
    }),
  ])

  const totalsRow = totalsRes[0]?.rows?.[0]
  const totals = {
    sessions: toNum(totalsRow?.metricValues?.[0]?.value),
    engaged_sessions: toNum(totalsRow?.metricValues?.[1]?.value),
    bounce_rate: toNum(totalsRow?.metricValues?.[2]?.value),
  }

  const source_medium: Ga4SourceRow[] = (sourceRes[0]?.rows ?? []).map((r) => {
    const sessions = toNum(r.metricValues?.[0]?.value)
    const engaged = toNum(r.metricValues?.[1]?.value)
    return {
      source: r.dimensionValues?.[0]?.value ?? "(direct)",
      medium: r.dimensionValues?.[1]?.value ?? "(none)",
      sessions,
      engaged_sessions: engaged,
      engagement_rate:
        sessions > 0 ? Math.round((engaged / sessions) * 1000) / 1000 : 0,
    }
  })

  const landing_pages: Ga4LandingRow[] = (landingRes[0]?.rows ?? []).map((r) => {
    const sessions = toNum(r.metricValues?.[0]?.value)
    const engaged = toNum(r.metricValues?.[1]?.value)
    return {
      path: r.dimensionValues?.[0]?.value ?? "/",
      sessions,
      engaged_sessions: engaged,
      engagement_rate:
        sessions > 0 ? Math.round((engaged / sessions) * 1000) / 1000 : 0,
    }
  })

  const devices: Ga4DeviceRow[] = (deviceRes[0]?.rows ?? []).map((r) => {
    return {
      device: r.dimensionValues?.[0]?.value ?? "unknown",
      sessions: toNum(r.metricValues?.[0]?.value),
      engaged_sessions: toNum(r.metricValues?.[1]?.value),
      bounce_rate: toNum(r.metricValues?.[2]?.value),
    }
  })

  return {
    totals,
    source_medium,
    landing_pages,
    devices,
  }
}
