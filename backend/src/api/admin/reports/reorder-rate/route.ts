import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  fetchOrdersForReports,
  inRange,
  itemHasReorderSource,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
  pctDelta,
  priorRange,
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
  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)
  const { from: priorFrom, to: priorTo } = priorRange(from, to)

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

  type Aggregates = {
    ordersByCustomer: Map<string, number>
    totalLineItems: number
    reorderLineItems: number
    reorderProductCounts: Map<string, number>
    totalOrders: number
  }

  const aggregateForWindow = (windowFrom: Date, windowTo: Date): Aggregates => {
    const inPeriod = orders.filter(
      (o) =>
        matchesRegion(o, regionFilter) &&
        inRange(o?.created_at, windowFrom, windowTo) &&
        o?.status !== "canceled"
    )
    const ordersByCustomer = new Map<string, number>()
    let totalLineItems = 0
    let reorderLineItems = 0
    const reorderProductCounts = new Map<string, number>()
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
    return {
      ordersByCustomer,
      totalLineItems,
      reorderLineItems,
      reorderProductCounts,
      totalOrders: inPeriod.length,
    }
  }

  const main = aggregateForWindow(from, to)
  const prior = aggregateForWindow(priorFrom, priorTo)

  const distinctCustomers = main.ordersByCustomer.size
  const totalOrders = main.totalOrders
  const repeatCustomers = Array.from(main.ordersByCustomer.values()).filter(
    (n) => n > 1
  ).length
  const repeatRate =
    distinctCustomers > 0 ? repeatCustomers / distinctCustomers : 0
  const avgOrdersPerCustomer =
    distinctCustomers > 0 ? totalOrders / distinctCustomers : 0
  const reorderLineShare =
    main.totalLineItems > 0 ? main.reorderLineItems / main.totalLineItems : 0

  const priorDistinctCustomers = prior.ordersByCustomer.size
  const priorRepeatCustomers = Array.from(prior.ordersByCustomer.values()).filter(
    (n) => n > 1
  ).length
  const priorRepeatRate =
    priorDistinctCustomers > 0 ? priorRepeatCustomers / priorDistinctCustomers : 0
  const priorAvgOrders =
    priorDistinctCustomers > 0 ? prior.totalOrders / priorDistinctCustomers : 0
  const priorReorderLineShare =
    prior.totalLineItems > 0 ? prior.reorderLineItems / prior.totalLineItems : 0

  const topReordered = Array.from(main.reorderProductCounts.entries())
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
      total_line_items: main.totalLineItems,
      reorder_line_items: main.reorderLineItems,
      reorder_line_share: Math.round(reorderLineShare * 1000) / 1000,
      // Prior-period mirror for delta tiles.
      prior_total_orders: prior.totalOrders,
      prior_distinct_customers: priorDistinctCustomers,
      prior_repeat_customer_rate: Math.round(priorRepeatRate * 1000) / 1000,
      prior_avg_orders_per_customer: Math.round(priorAvgOrders * 100) / 100,
      prior_reorder_line_share: Math.round(priorReorderLineShare * 1000) / 1000,
      repeat_rate_delta_pp:
        priorDistinctCustomers > 0
          ? Math.round((repeatRate - priorRepeatRate) * 1000) / 10
          : null,
      reorder_share_delta_pp:
        prior.totalLineItems > 0
          ? Math.round((reorderLineShare - priorReorderLineShare) * 1000) / 10
          : null,
      orders_delta_pct: pctDelta(totalOrders, prior.totalOrders),
    },
    top_reordered_products: topReordered,
  })
}
