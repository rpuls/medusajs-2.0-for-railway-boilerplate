import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  fetchOrdersForReports,
  inRange,
  parseDateRange,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/top-customers
 *
 * Top 20 customers by total spend in period, plus a concentration KPI:
 * "top 10 customers = X% of revenue." High concentration (>60%) means
 * revenue is fragile — losing one or two customers would hurt.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(`[top-customers] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  type Bucket = {
    customer_id: string | null
    email: string
    revenue: number
    orders: number
    last_order_at: string
  }
  const byKey = new Map<string, Bucket>()

  let totalRevenueAll = 0

  for (const o of orders) {
    if (!inRange(o?.created_at, from, to)) continue
    if (o?.status === "canceled") continue
    // Group by customer_id when present, falling back to email so guest
    // checkouts that re-use the same email still aggregate.
    const key = (o.customer_id as string) || (o.email as string) || "unknown"
    const revenue = Number(o.total ?? 0)
    totalRevenueAll += revenue
    const existing = byKey.get(key)
    if (!existing) {
      byKey.set(key, {
        customer_id: typeof o.customer_id === "string" ? o.customer_id : null,
        email: typeof o.email === "string" ? o.email : "(no email)",
        revenue,
        orders: 1,
        last_order_at: o.created_at,
      })
    } else {
      existing.revenue += revenue
      existing.orders += 1
      if (Date.parse(o.created_at) > Date.parse(existing.last_order_at)) {
        existing.last_order_at = o.created_at
      }
    }
  }

  // Resolve customer names for the top buckets only — keeps the customer
  // graph query small.
  const ranked = Array.from(byKey.values()).sort((a, b) => b.revenue - a.revenue)
  const top20 = ranked.slice(0, 20)
  const customerIds = top20
    .map((b) => b.customer_id)
    .filter((id): id is string => typeof id === "string" && id.length > 0)
  const customerNameMap = new Map<string, string>()
  if (customerIds.length > 0) {
    try {
      const { data: customers } = await query.graph({
        entity: "customer",
        fields: ["id", "first_name", "last_name", "email"],
        filters: { id: customerIds },
        pagination: { take: customerIds.length, skip: 0 },
      })
      for (const c of (customers as any[]) ?? []) {
        const name = [c?.first_name, c?.last_name].filter(Boolean).join(" ").trim()
        if (c?.id) customerNameMap.set(c.id, name || c?.email || "")
      }
    } catch (err: any) {
      logger.warn?.(
        `[top-customers] customer name lookup failed: ${err?.message ?? err}`
      )
    }
  }

  const topRevenue10 = ranked.slice(0, 10).reduce((s, b) => s + b.revenue, 0)
  const top10Share = totalRevenueAll > 0 ? topRevenue10 / totalRevenueAll : 0

  const customers = top20.map((b) => ({
    customer_id: b.customer_id,
    name:
      (b.customer_id && customerNameMap.get(b.customer_id)) || b.email || "(unknown)",
    email: b.email,
    revenue: Math.round(b.revenue * 100) / 100,
    orders: b.orders,
    aov: Math.round((b.revenue / b.orders) * 100) / 100,
    last_order_at: b.last_order_at,
  }))

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    summary: {
      total_distinct_customers: byKey.size,
      total_revenue: Math.round(totalRevenueAll * 100) / 100,
      top10_revenue: Math.round(topRevenue10 * 100) / 100,
      top10_revenue_share: Math.round(top10Share * 1000) / 1000,
    },
    customers,
  })
}
