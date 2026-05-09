import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  buildWeekBuckets,
  fetchOrdersForReports,
  inRange,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
  pctDelta,
  priorRange,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/new-vs-returning?from=&to=&region_id=
 *
 * Splits orders in window into "new" (customer's first-ever paid order)
 * vs "returning" (customer has at least one earlier order). Returns
 * KPI tiles + a per-week stacked time series.
 *
 * "First order" means first paid order ever — not first in window. So
 * a customer who joined 6 months ago and just placed their first order
 * is "new" today.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)
  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)
  const { from: priorFrom, to: priorTo } = priorRange(from, to)

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(`[new-vs-returning] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  const valid = orders.filter(
    (o) => o?.status !== "canceled" && matchesRegion(o, regionFilter)
  )

  // First, find each customer's earliest paid order across all time.
  const firstOrderMsByCustomer = new Map<string, number>()
  for (const o of valid) {
    const cid = typeof o.customer_id === "string" ? o.customer_id : null
    if (!cid) continue
    const ms = Date.parse(o.created_at)
    if (!Number.isFinite(ms)) continue
    const existing = firstOrderMsByCustomer.get(cid)
    if (existing == null || ms < existing) {
      firstOrderMsByCustomer.set(cid, ms)
    }
  }

  type Bucket = { new_revenue: number; new_orders: number; returning_revenue: number; returning_orders: number }
  const aggregate = (windowFrom: Date, windowTo: Date): Bucket => {
    const out: Bucket = {
      new_revenue: 0,
      new_orders: 0,
      returning_revenue: 0,
      returning_orders: 0,
    }
    for (const o of valid) {
      if (!inRange(o?.created_at, windowFrom, windowTo)) continue
      const cid = typeof o.customer_id === "string" ? o.customer_id : null
      if (!cid) continue
      const firstMs = firstOrderMsByCustomer.get(cid)
      if (firstMs == null) continue
      const isNew = Date.parse(o.created_at) === firstMs
      const revenue = Number(o.total ?? 0)
      if (isNew) {
        out.new_revenue += revenue
        out.new_orders += 1
      } else {
        out.returning_revenue += revenue
        out.returning_orders += 1
      }
    }
    return out
  }

  const main = aggregate(from, to)
  const prior = aggregate(priorFrom, priorTo)

  // Per-week split for the stacked bar.
  const { buckets, findBucket } = buildWeekBuckets(from, to)
  const series = buckets.map((b) => ({
    week_start: b.label,
    new_revenue: 0,
    new_orders: 0,
    returning_revenue: 0,
    returning_orders: 0,
  }))
  for (const o of valid) {
    if (!inRange(o?.created_at, from, to)) continue
    const cid = typeof o.customer_id === "string" ? o.customer_id : null
    if (!cid) continue
    const firstMs = firstOrderMsByCustomer.get(cid)
    if (firstMs == null) continue
    const isNew = Date.parse(o.created_at) === firstMs
    const idx = findBucket(o.created_at)
    if (idx < 0 || idx >= series.length) continue
    const revenue = Number(o.total ?? 0)
    if (isNew) {
      series[idx].new_revenue += revenue
      series[idx].new_orders += 1
    } else {
      series[idx].returning_revenue += revenue
      series[idx].returning_orders += 1
    }
  }
  // Round revenue
  for (const p of series) {
    p.new_revenue = Math.round(p.new_revenue * 100) / 100
    p.returning_revenue = Math.round(p.returning_revenue * 100) / 100
  }

  const totalRevenue = main.new_revenue + main.returning_revenue
  const returningShare =
    totalRevenue > 0 ? main.returning_revenue / totalRevenue : 0

  const currency =
    valid.find((o) => typeof o.currency_code === "string")?.currency_code ??
    "aud"

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    currency: currency.toLowerCase(),
    summary: {
      new_revenue: Math.round(main.new_revenue * 100) / 100,
      new_orders: main.new_orders,
      returning_revenue: Math.round(main.returning_revenue * 100) / 100,
      returning_orders: main.returning_orders,
      total_revenue: Math.round(totalRevenue * 100) / 100,
      returning_revenue_share: Math.round(returningShare * 1000) / 1000,
      // Prior-period for delta tiles
      prior_new_revenue: Math.round(prior.new_revenue * 100) / 100,
      prior_returning_revenue: Math.round(prior.returning_revenue * 100) / 100,
      new_revenue_delta_pct: pctDelta(main.new_revenue, prior.new_revenue),
      returning_revenue_delta_pct: pctDelta(
        main.returning_revenue,
        prior.returning_revenue
      ),
    },
    series,
  })
}
