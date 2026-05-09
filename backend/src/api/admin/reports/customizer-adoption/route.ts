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
 * GET /admin/reports/customizer-adoption
 *
 * Weekly stacked counts of customised vs blank orders, plus a
 * current-period KPI of overall % customised.
 *
 * "Customised" = the order has at least one line item with
 * `metadata.decorationDesign` (any of the 6 methods) OR a legacy
 * `metadata.customizerDesign` (pre-decoration-module orders).
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
    logger.error?.(
      `[customizer-adoption] order fetch failed: ${err?.message ?? err}`
    )
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  const { buckets, findBucket } = buildWeekBuckets(from, to)
  const series = buckets.map((b) => ({
    week_start: b.label,
    customized: 0,
    blank: 0,
  }))

  let totalInRange = 0
  let customizedInRange = 0

  for (const order of orders) {
    if (!matchesRegion(order, regionFilter)) continue
    if (!inRange(order.created_at, from, to)) continue
    if (order.status === "canceled") continue

    const items = (order.items ?? []) as Array<{ metadata?: any }>
    const isCustomized = items.some((it) => {
      const meta = (it?.metadata ?? {}) as any
      if (meta?.decorationDesign && typeof meta.decorationDesign === "object") {
        return true
      }
      if (meta?.customizerDesign && typeof meta.customizerDesign === "object") {
        return true
      }
      return false
    })

    const idx = findBucket(order.created_at)
    if (idx >= 0 && idx < series.length) {
      if (isCustomized) series[idx].customized += 1
      else series[idx].blank += 1
    }

    totalInRange += 1
    if (isCustomized) customizedInRange += 1
  }

  // Prior-period comparison so the KPI tile can show "vs last X days".
  const periodMs = to.getTime() - from.getTime()
  const priorTo = new Date(from)
  const priorFrom = new Date(from.getTime() - periodMs)
  let priorTotal = 0
  let priorCustomized = 0
  for (const order of orders) {
    if (!matchesRegion(order, regionFilter)) continue
    if (!inRange(order.created_at, priorFrom, priorTo)) continue
    if (order.status === "canceled") continue
    const items = (order.items ?? []) as Array<{ metadata?: any }>
    const isCustomized = items.some((it) => {
      const meta = (it?.metadata ?? {}) as any
      return (
        (meta?.decorationDesign && typeof meta.decorationDesign === "object") ||
        (meta?.customizerDesign && typeof meta.customizerDesign === "object")
      )
    })
    priorTotal += 1
    if (isCustomized) priorCustomized += 1
  }

  const adoptionRate = totalInRange > 0 ? customizedInRange / totalInRange : 0
  const priorRate = priorTotal > 0 ? priorCustomized / priorTotal : 0

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    series,
    summary: {
      total_orders: totalInRange,
      customized_orders: customizedInRange,
      adoption_rate: Math.round(adoptionRate * 1000) / 1000, // 0..1, 3dp
      prior_total_orders: priorTotal,
      prior_customized_orders: priorCustomized,
      prior_adoption_rate: Math.round(priorRate * 1000) / 1000,
      delta_pct_points: Math.round((adoptionRate - priorRate) * 1000) / 10, // pp
    },
  })
}
