import { google } from "googleapis"

import { buildGoogleJwt } from "./google-auth"
import type { GscRow, GscSummary } from "./types"

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"
const TOP_ROW_LIMIT = 25

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function buildClient() {
  // buildGoogleJwt centralises the JWT construction including the DWD
  // `subject` field — see google-auth.ts.
  const jwt = buildGoogleJwt([SCOPE])
  return google.searchconsole({ version: "v1", auth: jwt })
}

async function queryDimensions(
  searchconsole: ReturnType<typeof buildClient>,
  siteUrl: string,
  startDate: string,
  endDate: string,
  dimensions: string[],
  rowLimit: number
): Promise<GscRow[]> {
  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions,
      rowLimit,
    },
  })
  const rows = res.data.rows ?? []
  return rows.map((r) => ({
    key: (r.keys ?? []).join(" › "),
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    position: r.position ?? 0,
  }))
}

/**
 * Pulls a 28-day (or `days`) window of GSC Search Analytics for a single site.
 * Returns top queries, top pages, daily totals, and overall totals in one shape.
 */
export async function fetchGscSummary(
  siteUrl: string,
  days: number
): Promise<GscSummary> {
  const searchconsole = buildClient()
  const endDate = todayIso()
  const startDate = isoDaysAgo(days)

  const [topQueries, topPages, byDayRaw] = await Promise.all([
    queryDimensions(searchconsole, siteUrl, startDate, endDate, ["query"], TOP_ROW_LIMIT),
    queryDimensions(searchconsole, siteUrl, startDate, endDate, ["page"], TOP_ROW_LIMIT),
    queryDimensions(searchconsole, siteUrl, startDate, endDate, ["date"], days + 5),
  ])

  const byDay = byDayRaw
    .map((r) => ({ date: r.key, clicks: r.clicks, impressions: r.impressions }))
    .sort((a, b) => a.date.localeCompare(b.date))

  let clicks = 0
  let impressions = 0
  let positionWeighted = 0
  for (const r of byDayRaw) {
    clicks += r.clicks
    impressions += r.impressions
    positionWeighted += r.position * r.impressions
  }
  const ctr = impressions > 0 ? clicks / impressions : 0
  const position = impressions > 0 ? positionWeighted / impressions : 0

  return {
    totals: { clicks, impressions, ctr, position },
    topQueries,
    topPages,
    byDay,
  }
}
