import { buildGa4Caller } from "./ga4-caller"
import type { Ga4ByDay, Ga4PageRow, Ga4Summary } from "./types"

const TOP_PAGE_LIMIT = 25

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
  const caller = buildGa4Caller()
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
