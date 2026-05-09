import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  fetchOrdersForReports,
  inRange,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/designs-utilization
 *
 * "My Designs" feature signal:
 *   - designs_created: rows in `design` table with created_at in window
 *   - designs_reused: how many of those designs appear on >= 2 orders
 *     (looking at order line item metadata.designId)
 *   - active_customers: distinct customers with at least one design
 *
 * Plus top 10 customers by design count.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)
  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  // 1. Fetch designs in window.
  let designs: any[] = []
  try {
    const { data } = await query.graph({
      entity: "design",
      fields: ["id", "customer_id", "created_at", "updated_at", "title"],
      pagination: { take: 5000, skip: 0 },
    })
    designs = (data as any[]) ?? []
  } catch (err: any) {
    logger.warn?.(
      `[designs-utilization] design entity not graphable: ${err?.message ?? err}`
    )
    // Designs module is optional — return zeros if it's not registered.
    return res.json({
      from: from.toISOString(),
      to: to.toISOString(),
      summary: {
        designs_created: 0,
        designs_reused: 0,
        active_customers: 0,
        reuse_rate: 0,
      },
      top_customers_by_design_count: [],
      module_available: false,
    })
  }

  // 2. Fetch orders to count design references.
  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.warn?.(
      `[designs-utilization] order fetch failed: ${err?.message ?? err}`
    )
  }

  const designsInWindow = designs.filter((d) => inRange(d?.created_at, from, to))
  const designsCreated = designsInWindow.length

  const customerDesignCounts = new Map<string, number>()
  for (const d of designsInWindow) {
    if (typeof d?.customer_id === "string") {
      customerDesignCounts.set(
        d.customer_id,
        (customerDesignCounts.get(d.customer_id) ?? 0) + 1
      )
    }
  }
  const activeCustomers = customerDesignCounts.size

  // Count design reuse — a design is "reused" when its id appears on a
  // line item's metadata.designId across more than one order.
  const designIdToOrderIds = new Map<string, Set<string>>()
  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    if (o?.status === "canceled") continue
    const items = (o.items ?? []) as Array<{ metadata?: any }>
    for (const it of items) {
      const designId = (it?.metadata as any)?.designId
      if (typeof designId !== "string") continue
      const set = designIdToOrderIds.get(designId) ?? new Set<string>()
      set.add(o.id)
      designIdToOrderIds.set(designId, set)
    }
  }
  const designIdsInWindow = new Set(designsInWindow.map((d) => d.id))
  let reused = 0
  for (const id of designIdsInWindow) {
    const orderSet = designIdToOrderIds.get(id)
    if (orderSet && orderSet.size >= 2) reused += 1
  }
  const reuseRate = designsCreated > 0 ? reused / designsCreated : 0

  const topCustomers = Array.from(customerDesignCounts.entries())
    .map(([customer_id, count]) => ({ customer_id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    summary: {
      designs_created: designsCreated,
      designs_reused: reused,
      active_customers: activeCustomers,
      reuse_rate: Math.round(reuseRate * 1000) / 1000,
    },
    top_customers_by_design_count: topCustomers,
    module_available: true,
  })
}
