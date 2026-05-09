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
 * GET /admin/reports/aov-by-method
 *
 * Average order value broken down by primary decoration method on the
 * order. "Primary method" = the method on the highest-revenue line item;
 * if no line has a decoration, the order is bucketed as `blank`.
 *
 * Useful for pricing/merchandising decisions — embroidery orders may run
 * higher AOV than blanks, signalling premium customers.
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
    logger.error?.(`[aov-by-method] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  type Bucket = { method: DecorationMethod; revenue: number; orders: number }
  const newBuckets = (): Record<DecorationMethod, Bucket> =>
    Object.fromEntries(
      ALL_KEYS.map((m) => [m, { method: m, revenue: 0, orders: 0 }])
    ) as Record<DecorationMethod, Bucket>

  const main = newBuckets()
  const prior = newBuckets()

  let currency = "aud"
  for (const order of orders) {
    if (!matchesRegion(order, regionFilter)) continue
    if (order?.status === "canceled") continue
    if (typeof order.currency_code === "string") currency = order.currency_code

    const inMain = inRange(order?.created_at, from, to)
    const inPrior = !inMain && inRange(order?.created_at, priorFrom, priorTo)
    if (!inMain && !inPrior) continue
    const target = inMain ? main : prior

    const items = (order.items ?? []) as Array<{
      unit_price?: number
      quantity?: number
      metadata?: any
    }>
    if (items.length === 0) {
      target.blank.orders += 1
      target.blank.revenue += Number(order.total ?? 0)
      continue
    }

    let topMethod: DecorationMethod = "blank"
    let topLineRevenue = -1
    for (const it of items) {
      const lineRev = Number(it.unit_price ?? 0) * Number(it.quantity ?? 0)
      if (lineRev > topLineRevenue) {
        topLineRevenue = lineRev
        topMethod = itemMethod(it)
      }
    }

    target[topMethod].orders += 1
    target[topMethod].revenue += Number(order.total ?? 0)
  }

  const rows = ALL_KEYS.map((m) => {
    const b = main[m]
    const p = prior[m]
    const aov = b.orders > 0 ? b.revenue / b.orders : 0
    const priorAov = p.orders > 0 ? p.revenue / p.orders : 0
    return {
      method: m,
      orders: b.orders,
      revenue: Math.round(b.revenue * 100) / 100,
      aov: Math.round(aov * 100) / 100,
      prior_aov: Math.round(priorAov * 100) / 100,
      aov_delta_pct: pctDelta(aov, priorAov),
    }
  })

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    currency: currency.toLowerCase(),
    rows,
  })
}
