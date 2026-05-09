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
 * GET /admin/reports/first-order-affinity
 *
 * For new customers (one order ever, in window), which product did
 * they buy first? Reveals your "front door" SKU — the one to feature
 * for new visitors / cold traffic. Direct merchandising decision.
 *
 * Methodology: walk all orders, group by customer key, identify
 * customers whose ONLY non-cancelled order falls in the window. For
 * those one-order customers, count which product appeared on their
 * first (and only) line.
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
      `[first-order-affinity] order fetch failed: ${err?.message ?? err}`
    )
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  // Group orders per customer to find one-order customers in window.
  type CustomerRecord = {
    key: string
    first_order: { id: string; created_at: number; items: any[] } | null
    order_count: number
  }
  const byCustomer = new Map<string, CustomerRecord>()
  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    if (o?.status === "canceled") continue
    const created = Date.parse(o?.created_at ?? "")
    if (!Number.isFinite(created)) continue
    const key = (o.customer_id as string) || (o.email as string) || ""
    if (!key) continue
    const existing =
      byCustomer.get(key) ??
      ({
        key,
        first_order: null,
        order_count: 0,
      } as CustomerRecord)
    existing.order_count += 1
    if (
      !existing.first_order ||
      created < existing.first_order.created_at
    ) {
      existing.first_order = {
        id: o.id,
        created_at: created,
        items: (o.items ?? []) as any[],
      }
    }
    byCustomer.set(key, existing)
  }

  // First-order-in-window per customer (their FIRST order ever, AND it
  // falls in window — so this is also "new customer acquired in window").
  type Stat = {
    product_id: string | null
    product_title: string
    new_customers: number
    units: number
    revenue: number
  }
  const byProduct = new Map<string, Stat>()
  let newCustomersInWindow = 0
  for (const c of byCustomer.values()) {
    if (!c.first_order) continue
    if (!inRange(new Date(c.first_order.created_at).toISOString(), from, to))
      continue
    newCustomersInWindow += 1

    // Pick the headline product on the first order — by line revenue
    // (so a $200 hoodie wins over a $5 sticker bundle they grabbed too).
    let topLine: any = null
    let topRevenue = 0
    for (const it of c.first_order.items) {
      const rev = Number(it?.unit_price ?? 0) * Number(it?.quantity ?? 0)
      if (rev > topRevenue) {
        topRevenue = rev
        topLine = it
      }
    }
    if (!topLine) continue

    const productId =
      typeof topLine?.product_id === "string" ? topLine.product_id : null
    const productTitle =
      (typeof topLine?.product_title === "string" && topLine.product_title) ||
      (typeof topLine?.title === "string" && topLine.title) ||
      "(unknown)"
    const groupKey = productId ?? productTitle
    const stat = byProduct.get(groupKey) ?? {
      product_id: productId,
      product_title: productTitle,
      new_customers: 0,
      units: 0,
      revenue: 0,
    }
    stat.new_customers += 1
    stat.units += Number(topLine?.quantity ?? 0)
    stat.revenue += topRevenue
    byProduct.set(groupKey, stat)
  }

  const ranked = Array.from(byProduct.values())
    .sort((a, b) => b.new_customers - a.new_customers || b.revenue - a.revenue)
    .slice(0, 20)
    .map((s) => ({
      ...s,
      revenue: Math.round(s.revenue * 100) / 100,
      share_pct:
        newCustomersInWindow > 0
          ? Math.round((s.new_customers / newCustomersInWindow) * 1000) / 10
          : 0,
    }))

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    summary: {
      new_customers_in_window: newCustomersInWindow,
      distinct_front_door_products: byProduct.size,
    },
    front_door_products: ranked,
  })
}
