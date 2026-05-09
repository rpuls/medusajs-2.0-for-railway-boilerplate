import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  fetchOrdersForReports,
  inRange,
  itemHasReorderSource,
  parseDateRange,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/reorder-rate
 *
 * KPIs:
 *   - repeat_customer_rate: % of distinct customers in period who placed
 *     more than one order
 *   - avg_orders_per_customer: total orders ÷ distinct customers
 *   - reorder_line_share: % of all line items in period that carry
 *     `metadata.reorder_source` (i.e. came from "Re-order from history")
 *
 * Plus top 10 reordered products: line items with reorder_source,
 * grouped by `title`, count by occurrences.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(`[reorder-rate] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  // Collect orders in period.
  const inPeriod = orders.filter(
    (o) => inRange(o?.created_at, from, to) && o?.status !== "canceled"
  )

  const ordersByCustomer = new Map<string, number>()
  let totalLineItems = 0
  let reorderLineItems = 0
  const reorderProductCounts = new Map<string, number>() // title -> count

  for (const o of inPeriod) {
    const cid = typeof o.customer_id === "string" ? o.customer_id : null
    if (cid) {
      ordersByCustomer.set(cid, (ordersByCustomer.get(cid) ?? 0) + 1)
    }
    const items = (o.items ?? []) as Array<{ title?: string; metadata?: any }>
    for (const it of items) {
      totalLineItems += 1
      if (itemHasReorderSource(it)) {
        reorderLineItems += 1
        const title = (it.title ?? "Unknown").trim()
        reorderProductCounts.set(
          title,
          (reorderProductCounts.get(title) ?? 0) + 1
        )
      }
    }
  }

  const distinctCustomers = ordersByCustomer.size
  const totalOrders = inPeriod.length
  const repeatCustomers = Array.from(ordersByCustomer.values()).filter(
    (n) => n > 1
  ).length
  const repeatRate =
    distinctCustomers > 0 ? repeatCustomers / distinctCustomers : 0
  const avgOrdersPerCustomer =
    distinctCustomers > 0 ? totalOrders / distinctCustomers : 0
  const reorderLineShare =
    totalLineItems > 0 ? reorderLineItems / totalLineItems : 0

  const topReordered = Array.from(reorderProductCounts.entries())
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    summary: {
      total_orders: totalOrders,
      distinct_customers: distinctCustomers,
      repeat_customers: repeatCustomers,
      repeat_customer_rate: Math.round(repeatRate * 1000) / 1000,
      avg_orders_per_customer: Math.round(avgOrdersPerCustomer * 100) / 100,
      total_line_items: totalLineItems,
      reorder_line_items: reorderLineItems,
      reorder_line_share: Math.round(reorderLineShare * 1000) / 1000,
    },
    top_reordered_products: topReordered,
  })
}
