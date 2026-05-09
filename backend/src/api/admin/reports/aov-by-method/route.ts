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
  const buckets: Record<DecorationMethod, Bucket> = Object.fromEntries(
    ALL_KEYS.map((m) => [m, { method: m, revenue: 0, orders: 0 }])
  ) as Record<DecorationMethod, Bucket>

  let currency = "aud"
  for (const order of orders) {
    if (!inRange(order?.created_at, from, to)) continue
    if (order?.status === "canceled") continue
    if (typeof order.currency_code === "string") currency = order.currency_code

    const items = (order.items ?? []) as Array<{
      unit_price?: number
      quantity?: number
      metadata?: any
    }>
    if (items.length === 0) {
      buckets.blank.orders += 1
      buckets.blank.revenue += Number(order.total ?? 0)
      continue
    }

    // Determine primary method by highest line revenue.
    let topMethod: DecorationMethod = "blank"
    let topLineRevenue = -1
    for (const it of items) {
      const lineRev = Number(it.unit_price ?? 0) * Number(it.quantity ?? 0)
      if (lineRev > topLineRevenue) {
        topLineRevenue = lineRev
        topMethod = itemMethod(it)
      }
    }

    buckets[topMethod].orders += 1
    buckets[topMethod].revenue += Number(order.total ?? 0)
  }

  const rows = ALL_KEYS.map((m) => {
    const b = buckets[m]
    return {
      method: m,
      orders: b.orders,
      revenue: Math.round(b.revenue * 100) / 100,
      aov: b.orders > 0 ? Math.round((b.revenue / b.orders) * 100) / 100 : 0,
    }
  })

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    currency: currency.toLowerCase(),
    rows,
  })
}
