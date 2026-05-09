import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  buildWeekBuckets,
  fetchOrdersForReports,
  inRange,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/sales-overview
 *
 * The headline analytics view that replaces the Agilo Analytics plugin's
 * default tab. Returns:
 *
 *   - KPI tiles: total orders, total sales, average order value, distinct
 *     customers — each with prior-period comparison so the tile can show
 *     "+X% vs prior".
 *   - Daily time-series of orders + sales for the requested window. Daily
 *     granularity for ranges <= 60 days, weekly otherwise.
 *   - Top regions by revenue (top 5).
 *   - Order status breakdown (count of orders per `status`).
 *
 * Filters: from/to (default: last 30 days). No region filter at this
 * level — top regions IS the breakdown.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)
  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(`[sales-overview] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  // Region lookup — orders carry region_id but not region.name in the
  // graph response. Fetch region metadata separately so the frontend
  // doesn't have to.
  const regionIdSet = new Set<string>()
  for (const o of orders) {
    if (typeof o?.region_id === "string") regionIdSet.add(o.region_id)
  }
  const regionNameMap = new Map<string, string>()
  if (regionIdSet.size > 0) {
    try {
      const { data: regions } = await query.graph({
        entity: "region",
        fields: ["id", "name"],
        filters: { id: Array.from(regionIdSet) },
        pagination: { take: regionIdSet.size, skip: 0 },
      })
      for (const r of (regions as any[]) ?? []) {
        if (r?.id) regionNameMap.set(r.id, r.name ?? r.id)
      }
    } catch (err: any) {
      logger.warn?.(`[sales-overview] region lookup failed: ${err?.message ?? err}`)
    }
  }

  // Period + prior-period bookkeeping.
  const periodMs = to.getTime() - from.getTime()
  const priorTo = new Date(from)
  const priorFrom = new Date(from.getTime() - periodMs)
  // Year-on-year window: same window 365 days earlier. Used for the
  // overlay line on the time-series chart so the operator can see
  // "this Tuesday vs Tuesday last year" rather than just rolling 30d.
  const yoyShiftMs = 365 * 86_400_000
  const yoyFrom = new Date(from.getTime() - yoyShiftMs)
  const yoyTo = new Date(to.getTime() - yoyShiftMs)

  const inPeriod: any[] = []
  const inPriorPeriod: any[] = []
  const inYoyPeriod: any[] = []
  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    if (o?.status === "canceled") {
      // canceled still counts in status breakdown but not in KPIs.
    }
    if (inRange(o?.created_at, from, to)) inPeriod.push(o)
    else if (inRange(o?.created_at, priorFrom, priorTo)) inPriorPeriod.push(o)
    if (inRange(o?.created_at, yoyFrom, yoyTo)) inYoyPeriod.push(o)
  }

  const aggregate = (rows: any[]) => {
    let totalRevenue = 0
    let count = 0
    const customers = new Set<string>()
    for (const o of rows) {
      if (o?.status === "canceled") continue
      count += 1
      totalRevenue += Number(o.total ?? 0)
      if (typeof o.customer_id === "string") customers.add(o.customer_id)
    }
    return {
      orders: count,
      revenue: Math.round(totalRevenue * 100) / 100,
      distinct_customers: customers.size,
      aov: count > 0 ? Math.round((totalRevenue / count) * 100) / 100 : 0,
    }
  }

  const period = aggregate(inPeriod)
  const prior = aggregate(inPriorPeriod)

  // Time series — daily for windows <= 60 days, weekly otherwise. Time
  // series excludes canceled orders so the chart matches the KPIs.
  const dayCount = Math.ceil(periodMs / 86_400_000) + 1
  const granularity: "day" | "week" = dayCount <= 60 ? "day" : "week"

  type SeriesPoint = {
    bucket: string
    orders: number
    revenue: number
    yoy_orders: number
    yoy_revenue: number
  }
  let series: SeriesPoint[] = []
  if (granularity === "week") {
    const { buckets, findBucket } = buildWeekBuckets(from, to)
    series = buckets.map((b) => ({
      bucket: b.label,
      orders: 0,
      revenue: 0,
      yoy_orders: 0,
      yoy_revenue: 0,
    }))
    for (const o of inPeriod) {
      if (o.status === "canceled") continue
      const idx = findBucket(o.created_at)
      if (idx >= 0 && idx < series.length) {
        series[idx].orders += 1
        series[idx].revenue += Number(o.total ?? 0)
      }
    }
    // YoY: shift each YoY order's created_at forward by 365 days so it
    // falls in the current-period buckets, then bucket as normal.
    for (const o of inYoyPeriod) {
      if (o.status === "canceled") continue
      const ms = Date.parse(o?.created_at ?? "")
      if (!Number.isFinite(ms)) continue
      const shiftedIso = new Date(ms + yoyShiftMs).toISOString()
      const idx = findBucket(shiftedIso)
      if (idx >= 0 && idx < series.length) {
        series[idx].yoy_orders += 1
        series[idx].yoy_revenue += Number(o.total ?? 0)
      }
    }
  } else {
    // Daily buckets
    const startDay = new Date(from)
    startDay.setUTCHours(0, 0, 0, 0)
    const days: Array<{ start: number; label: string }> = []
    for (let d = 0; d < dayCount; d++) {
      const t = startDay.getTime() + d * 86_400_000
      const label = new Date(t).toISOString().slice(0, 10)
      days.push({ start: t, label })
    }
    const findDailyBucket = (ms: number): number => {
      if (!Number.isFinite(ms)) return -1
      const offsetDays = Math.floor((ms - days[0].start) / 86_400_000)
      if (offsetDays < 0 || offsetDays >= days.length) return -1
      return offsetDays
    }
    series = days.map((d) => ({
      bucket: d.label,
      orders: 0,
      revenue: 0,
      yoy_orders: 0,
      yoy_revenue: 0,
    }))
    for (const o of inPeriod) {
      if (o.status === "canceled") continue
      const idx = findDailyBucket(Date.parse(o.created_at ?? ""))
      if (idx >= 0 && idx < series.length) {
        series[idx].orders += 1
        series[idx].revenue += Number(o.total ?? 0)
      }
    }
    for (const o of inYoyPeriod) {
      if (o.status === "canceled") continue
      const ms = Date.parse(o?.created_at ?? "")
      if (!Number.isFinite(ms)) continue
      const idx = findDailyBucket(ms + yoyShiftMs)
      if (idx >= 0 && idx < series.length) {
        series[idx].yoy_orders += 1
        series[idx].yoy_revenue += Number(o.total ?? 0)
      }
    }
  }
  // Round revenue to 2dp so the JSON stays clean.
  series = series.map((p) => ({
    ...p,
    revenue: Math.round(p.revenue * 100) / 100,
    yoy_revenue: Math.round(p.yoy_revenue * 100) / 100,
  }))

  // Top regions by revenue.
  const revenueByRegion = new Map<string, number>()
  for (const o of inPeriod) {
    if (o.status === "canceled") continue
    const rid = typeof o.region_id === "string" ? o.region_id : null
    if (!rid) continue
    revenueByRegion.set(rid, (revenueByRegion.get(rid) ?? 0) + Number(o.total ?? 0))
  }
  const topRegions = Array.from(revenueByRegion.entries())
    .map(([id, revenue]) => ({
      region_id: id,
      region_name: regionNameMap.get(id) ?? id,
      revenue: Math.round(revenue * 100) / 100,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Order status breakdown — counts every order in period including
  // canceled, so the totals reflect lifecycle reality.
  const statusCounts = new Map<string, number>()
  for (const o of inPeriod) {
    const s = typeof o.status === "string" ? o.status : "unknown"
    statusCounts.set(s, (statusCounts.get(s) ?? 0) + 1)
  }
  const statusBreakdown = Array.from(statusCounts.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count)

  const currency =
    inPeriod.find((o) => typeof o.currency_code === "string")?.currency_code ??
    "aud"

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    granularity,
    currency: currency.toLowerCase(),
    summary: {
      orders: period.orders,
      revenue: period.revenue,
      aov: period.aov,
      distinct_customers: period.distinct_customers,
      prior_orders: prior.orders,
      prior_revenue: prior.revenue,
      prior_aov: prior.aov,
      prior_distinct_customers: prior.distinct_customers,
      orders_delta_pct:
        prior.orders > 0
          ? Math.round(((period.orders - prior.orders) / prior.orders) * 1000) / 10
          : null,
      revenue_delta_pct:
        prior.revenue > 0
          ? Math.round(((period.revenue - prior.revenue) / prior.revenue) * 1000) / 10
          : null,
      aov_delta_pct:
        prior.aov > 0
          ? Math.round(((period.aov - prior.aov) / prior.aov) * 1000) / 10
          : null,
    },
    series,
    top_regions: topRegions,
    status_breakdown: statusBreakdown,
  })
}
