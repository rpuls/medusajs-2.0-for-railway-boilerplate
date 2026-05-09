import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  fetchOrdersForReports,
  inRange,
  parseDateRange,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/supplier-mix
 *
 * Garment supplier mix: AS Colour vs everything else.
 *
 * "AS Colour" = order has `metadata.ascolour_order_id` set, indicating
 * the order was routed to AS Colour for blanks. Everything else is
 * lumped into "Other supplier" since we don't have a more granular
 * brand tag at the order level today.
 *
 * Returns counts and revenue split.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(`[supplier-mix] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  let ascolourOrders = 0
  let otherOrders = 0
  let ascolourRevenue = 0
  let otherRevenue = 0
  let ascolourUnits = 0
  let otherUnits = 0
  let currency = "aud"

  for (const order of orders) {
    if (!inRange(order?.created_at, from, to)) continue
    if (order?.status === "canceled") continue
    if (typeof order.currency_code === "string") currency = order.currency_code

    const meta = (order.metadata ?? {}) as Record<string, unknown>
    const isAscolour = typeof meta.ascolour_order_id === "string" && meta.ascolour_order_id.length > 0

    const revenue = Number(order.total ?? 0)
    const units = ((order.items ?? []) as Array<{ quantity?: number }>).reduce(
      (s, it) => s + Number(it.quantity ?? 0),
      0
    )

    if (isAscolour) {
      ascolourOrders += 1
      ascolourRevenue += revenue
      ascolourUnits += units
    } else {
      otherOrders += 1
      otherRevenue += revenue
      otherUnits += units
    }
  }

  const totalOrders = ascolourOrders + otherOrders
  const totalRevenue = ascolourRevenue + otherRevenue
  const totalUnits = ascolourUnits + otherUnits

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    currency: currency.toLowerCase(),
    suppliers: [
      {
        key: "ascolour",
        label: "AS Colour",
        orders: ascolourOrders,
        revenue: Math.round(ascolourRevenue * 100) / 100,
        units: ascolourUnits,
        order_share:
          totalOrders > 0 ? Math.round((ascolourOrders / totalOrders) * 1000) / 1000 : 0,
        revenue_share:
          totalRevenue > 0 ? Math.round((ascolourRevenue / totalRevenue) * 1000) / 1000 : 0,
        unit_share:
          totalUnits > 0 ? Math.round((ascolourUnits / totalUnits) * 1000) / 1000 : 0,
      },
      {
        key: "other",
        label: "Other supplier",
        orders: otherOrders,
        revenue: Math.round(otherRevenue * 100) / 100,
        units: otherUnits,
        order_share:
          totalOrders > 0 ? Math.round((otherOrders / totalOrders) * 1000) / 1000 : 0,
        revenue_share:
          totalRevenue > 0 ? Math.round((otherRevenue / totalRevenue) * 1000) / 1000 : 0,
        unit_share:
          totalUnits > 0 ? Math.round((otherUnits / totalUnits) * 1000) / 1000 : 0,
      },
    ],
    totals: {
      orders: totalOrders,
      revenue: Math.round(totalRevenue * 100) / 100,
      units: totalUnits,
    },
  })
}
