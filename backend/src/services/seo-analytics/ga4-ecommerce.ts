import { BetaAnalyticsDataClient } from "@google-analytics/data"

import { getServiceAccountKey } from "./google-auth"

/**
 * GA4 Enhanced Ecommerce queries — only meaningful once the storefront
 * has been deployed with the analytics module wired up (Tier C.0/C.1).
 * Until events accumulate (24-48h after first deploy), these queries
 * return zero counts.
 */

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
  const d = new Date(iso)
  if (!Number.isFinite(d.getTime())) return new Date().toISOString().slice(0, 10)
  return d.toISOString().slice(0, 10)
}

export type Ga4FunnelStep = {
  name: string
  count: number
}

export type Ga4ChannelRow = {
  source: string
  medium: string
  sessions: number
  add_to_carts: number
  begin_checkouts: number
  purchases: number
  revenue: number
  conversion_rate: number
}

export type Ga4Ecommerce = {
  funnel: Ga4FunnelStep[]
  channels: Ga4ChannelRow[]
  totals: {
    sessions: number
    purchases: number
    revenue: number
    conversion_rate: number
  }
}

/**
 * Single shape we render funnel-step counts in. Note that GA4's eventCount
 * counts each fired event — for the funnel we want sessions that triggered
 * at least one of the event, which is what `sessionsWithEvent` would give
 * us. We approximate via the `eventName` dimension + sessions metric.
 */
export async function fetchGa4Ecommerce(
  propertyId: string,
  fromIso: string,
  toIso: string
): Promise<Ga4Ecommerce> {
  const analytics = buildClient()
  const property = `properties/${propertyId}`
  const dateRanges = [
    { startDate: toIsoDate(fromIso), endDate: toIsoDate(toIso) },
  ]

  // 1. Funnel: query sessions for each event name. We grab a single
  //    table grouped by eventName and pull the rows we care about.
  // 2. Channels: source/medium with ecommerce metrics.
  // 3. Totals.
  const [eventsRes, channelsRes, totalsRes] = await Promise.all([
    analytics.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "sessions" }, { name: "eventCount" }],
      limit: 100,
    }),
    analytics.runReport({
      property,
      dateRanges,
      dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
      metrics: [
        { name: "sessions" },
        { name: "addToCarts" },
        { name: "checkouts" },
        { name: "ecommercePurchases" },
        { name: "purchaseRevenue" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 25,
    }),
    analytics.runReport({
      property,
      dateRanges,
      metrics: [
        { name: "sessions" },
        { name: "ecommercePurchases" },
        { name: "purchaseRevenue" },
      ],
    }),
  ])

  // GA4 standard event names
  const FUNNEL_EVENTS = [
    { id: "session_start", label: "Sessions" },
    { id: "view_item", label: "Product views" },
    { id: "add_to_cart", label: "Cart adds" },
    { id: "begin_checkout", label: "Checkouts" },
    { id: "purchase", label: "Purchases" },
  ]
  const sessionsByEvent = new Map<string, number>()
  for (const r of eventsRes[0]?.rows ?? []) {
    const name = r.dimensionValues?.[0]?.value ?? ""
    const sessions = toNum(r.metricValues?.[0]?.value)
    sessionsByEvent.set(name, sessions)
  }
  const funnel: Ga4FunnelStep[] = FUNNEL_EVENTS.map((e) => ({
    name: e.label,
    count: sessionsByEvent.get(e.id) ?? 0,
  }))

  // Channels
  const channels: Ga4ChannelRow[] = (channelsRes[0]?.rows ?? []).map((r) => {
    const sessions = toNum(r.metricValues?.[0]?.value)
    const addToCarts = toNum(r.metricValues?.[1]?.value)
    const beginCheckouts = toNum(r.metricValues?.[2]?.value)
    const purchases = toNum(r.metricValues?.[3]?.value)
    const revenue = toNum(r.metricValues?.[4]?.value)
    return {
      source: r.dimensionValues?.[0]?.value ?? "(direct)",
      medium: r.dimensionValues?.[1]?.value ?? "(none)",
      sessions,
      add_to_carts: addToCarts,
      begin_checkouts: beginCheckouts,
      purchases,
      revenue: Math.round(revenue * 100) / 100,
      conversion_rate:
        sessions > 0 ? Math.round((purchases / sessions) * 1000) / 1000 : 0,
    }
  })

  const totalsRow = totalsRes[0]?.rows?.[0]
  const totalSessions = toNum(totalsRow?.metricValues?.[0]?.value)
  const totalPurchases = toNum(totalsRow?.metricValues?.[1]?.value)
  const totalRevenue = toNum(totalsRow?.metricValues?.[2]?.value)

  return {
    funnel,
    channels,
    totals: {
      sessions: totalSessions,
      purchases: totalPurchases,
      revenue: Math.round(totalRevenue * 100) / 100,
      conversion_rate:
        totalSessions > 0
          ? Math.round((totalPurchases / totalSessions) * 1000) / 1000
          : 0,
    },
  }
}
