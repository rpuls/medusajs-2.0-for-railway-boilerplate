import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  DECORATION_METHODS,
  fetchOrdersForReports,
  inRange,
  itemMethod,
  parseDateRange,
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

  const revenueByMethod: Record<DecorationMethod, number> = Object.fromEntries(
    ALL_KEYS.map((k) => [k, 0])
  ) as Record<DecorationMethod, number>
  const unitsByMethod: Record<DecorationMethod, number> = Object.fromEntries(
    ALL_KEYS.map((k) => [k, 0])
  ) as Record<DecorationMethod, number>
  let currency = "aud"

  for (const order of orders) {
    if (!inRange(order.created_at, from, to)) continue
    if (order.status === "canceled") continue
    if (typeof order.currency_code === "string") {
      currency = order.currency_code.toLowerCase()
    }

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
      revenueByMethod[method] += lineRevenue
      unitsByMethod[method] += qty
    }
  }

  const totalRevenue = ALL_KEYS.reduce((s, k) => s + revenueByMethod[k], 0)
  const totalUnits = ALL_KEYS.reduce((s, k) => s + unitsByMethod[k], 0)

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
  }))

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    currency,
    total_revenue: Math.round(totalRevenue * 100) / 100,
    total_units: totalUnits,
    segments,
  })
}
