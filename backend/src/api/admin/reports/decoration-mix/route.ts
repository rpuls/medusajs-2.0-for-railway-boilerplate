import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  DECORATION_METHODS,
  fetchOrdersForReports,
  inRange,
  itemMethod,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
  pctDelta,
  priorRange,
  type DecorationMethod,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/decoration-mix
 *
 * Revenue and unit-volume share by decoration method (6 methods + Blank)
 * over the date window. Single endpoint returning both — the frontend
 * renders side-by-side bars.
 *
 * Revenue is line-item revenue (`unit_price × quantity`), shipping/setup
 * excluded so methods are comparable. Volume is units (sum of
 * `quantity`).
 */

const ALL_KEYS: DecorationMethod[] = [...DECORATION_METHODS, "blank"]

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
    logger.error?.(
      `[decoration-mix] order fetch failed: ${err?.message ?? err}`
    )
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  const newCounter = () =>
    Object.fromEntries(ALL_KEYS.map((k) => [k, 0])) as Record<
      DecorationMethod,
      number
    >

  const revenueByMethod = newCounter()
  const unitsByMethod = newCounter()
  const priorRevenueByMethod = newCounter()
  const priorUnitsByMethod = newCounter()
  let currency = "aud"

  for (const order of orders) {
    if (!matchesRegion(order, regionFilter)) continue
    if (order.status === "canceled") continue
    if (typeof order.currency_code === "string") {
      currency = order.currency_code.toLowerCase()
    }

    const inMain = inRange(order.created_at, from, to)
    const inPrior = !inMain && inRange(order.created_at, priorFrom, priorTo)
    if (!inMain && !inPrior) continue

    const items = (order.items ?? []) as Array<{
      unit_price?: number
      quantity?: number
      metadata?: any
    }>
    for (const it of items) {
      const method = itemMethod(it)
      const qty = Number(it.quantity ?? 0)
      const unitPrice = Number(it.unit_price ?? 0)
      const lineRevenue = unitPrice * qty
      if (inMain) {
        revenueByMethod[method] += lineRevenue
        unitsByMethod[method] += qty
      } else {
        priorRevenueByMethod[method] += lineRevenue
        priorUnitsByMethod[method] += qty
      }
    }
  }

  const totalRevenue = ALL_KEYS.reduce((s, k) => s + revenueByMethod[k], 0)
  const totalUnits = ALL_KEYS.reduce((s, k) => s + unitsByMethod[k], 0)
  const priorTotalRevenue = ALL_KEYS.reduce(
    (s, k) => s + priorRevenueByMethod[k],
    0
  )
  const priorTotalUnits = ALL_KEYS.reduce(
    (s, k) => s + priorUnitsByMethod[k],
    0
  )

  const segments = ALL_KEYS.map((method) => ({
    method,
    revenue: Math.round(revenueByMethod[method] * 100) / 100,
    units: unitsByMethod[method],
    revenue_share:
      totalRevenue > 0
        ? Math.round((revenueByMethod[method] / totalRevenue) * 1000) / 1000
        : 0,
    unit_share:
      totalUnits > 0
        ? Math.round((unitsByMethod[method] / totalUnits) * 1000) / 1000
        : 0,
    prior_revenue: Math.round(priorRevenueByMethod[method] * 100) / 100,
    prior_units: priorUnitsByMethod[method],
    revenue_delta_pct: pctDelta(revenueByMethod[method], priorRevenueByMethod[method]),
    units_delta_pct: pctDelta(unitsByMethod[method], priorUnitsByMethod[method]),
  }))

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    currency,
    total_revenue: Math.round(totalRevenue * 100) / 100,
    total_units: totalUnits,
    prior_total_revenue: Math.round(priorTotalRevenue * 100) / 100,
    prior_total_units: priorTotalUnits,
    revenue_delta_pct: pctDelta(totalRevenue, priorTotalRevenue),
    units_delta_pct: pctDelta(totalUnits, priorTotalUnits),
    segments,
  })
}
