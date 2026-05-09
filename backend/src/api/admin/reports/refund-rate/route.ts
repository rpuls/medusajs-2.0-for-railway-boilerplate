import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  buildWeekBuckets,
  inRange,
  itemMethod,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
  type DecorationMethod,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/refund-rate
 *
 * % of orders with any refund (full or partial), trended over the
 * window, broken down by decoration method. Reads `order.refunds`
 * directly — works whether or not the RMA workflow is enabled.
 *
 * Refund-amount totals are surfaced separately so the operator can
 * decide whether the rate is dollars-significant or just count-noisy.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)
  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  let orders: any[] = []
  try {
    const { data } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "created_at",
        "status",
        "total",
        "currency_code",
        "region_id",
        "email",
        "items.id",
        "items.metadata",
        "refunds.id",
        "refunds.amount",
        "refunds.created_at",
        "refunds.note",
      ],
      pagination: { take: 5000, skip: 0 },
    })
    orders = (data as any[]) ?? []
  } catch (err: any) {
    logger.error?.(`[refund-rate] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  let totalOrdersInWindow = 0
  let refundedOrders = 0
  let totalRevenue = 0
  let totalRefunded = 0
  const byMethod = new Map<DecorationMethod, { orders: number; refunded: number }>()
  const recent: Array<{
    order_id: string
    display_id: number | null
    refund_amount: number
    refunded_at: string | null
    note: string | null
    methods: DecorationMethod[]
  }> = []

  // Weekly trend buckets
  const { buckets, findBucket } = buildWeekBuckets(from, to)
  const weekBuckets = buckets.map((b) => ({
    week: b.label,
    orders: 0,
    refunded: 0,
  }))

  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    if (o?.status === "canceled") continue
    if (!inRange(o?.created_at, from, to)) continue

    totalOrdersInWindow += 1
    totalRevenue += Number(o.total ?? 0)
    const idx = findBucket(o.created_at)
    if (idx >= 0 && idx < weekBuckets.length) {
      weekBuckets[idx].orders += 1
    }

    const items = (o.items ?? []) as any[]
    const methods = Array.from(
      new Set(items.map((it) => itemMethod(it)))
    ) as DecorationMethod[]
    for (const m of methods) {
      const stat = byMethod.get(m) ?? { orders: 0, refunded: 0 }
      stat.orders += 1
      byMethod.set(m, stat)
    }

    const refunds = Array.isArray(o.refunds) ? o.refunds : []
    if (refunds.length === 0) continue

    refundedOrders += 1
    if (idx >= 0 && idx < weekBuckets.length) {
      weekBuckets[idx].refunded += 1
    }
    for (const m of methods) {
      const stat = byMethod.get(m)!
      stat.refunded += 1
    }
    let orderRefundedAmount = 0
    let mostRecentRefund: any = null
    for (const r of refunds) {
      const amt = Number(r?.amount ?? 0)
      if (Number.isFinite(amt)) orderRefundedAmount += amt
      if (
        !mostRecentRefund ||
        Date.parse(r?.created_at ?? "") >
          Date.parse(mostRecentRefund?.created_at ?? "")
      ) {
        mostRecentRefund = r
      }
    }
    totalRefunded += orderRefundedAmount
    if (recent.length < 50) {
      recent.push({
        order_id: o.id,
        display_id:
          typeof o.display_id === "number" ? o.display_id : null,
        refund_amount: Math.round(orderRefundedAmount * 100) / 100,
        refunded_at:
          typeof mostRecentRefund?.created_at === "string"
            ? mostRecentRefund.created_at
            : null,
        note:
          typeof mostRecentRefund?.note === "string"
            ? mostRecentRefund.note
            : null,
        methods,
      })
    }
  }

  const refundRate =
    totalOrdersInWindow > 0
      ? (refundedOrders / totalOrdersInWindow) * 100
      : 0
  const dollarRate = totalRevenue > 0 ? (totalRefunded / totalRevenue) * 100 : 0

  recent.sort(
    (a, b) =>
      Date.parse(b.refunded_at ?? "0") - Date.parse(a.refunded_at ?? "0")
  )

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    summary: {
      total_orders: totalOrdersInWindow,
      refunded_orders: refundedOrders,
      refund_rate_pct: Math.round(refundRate * 10) / 10,
      total_revenue: Math.round(totalRevenue * 100) / 100,
      total_refunded: Math.round(totalRefunded * 100) / 100,
      dollar_refund_rate_pct: Math.round(dollarRate * 10) / 10,
    },
    by_method: Array.from(byMethod.entries())
      .filter(([, s]) => s.orders > 0)
      .map(([method, s]) => ({
        method,
        orders: s.orders,
        refunded: s.refunded,
        refund_rate_pct:
          s.orders > 0 ? Math.round((s.refunded / s.orders) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.refund_rate_pct - a.refund_rate_pct),
    weekly_trend: weekBuckets.map((b) => ({
      week: b.week,
      orders: b.orders,
      refunded: b.refunded,
      refund_rate_pct:
        b.orders > 0 ? Math.round((b.refunded / b.orders) * 1000) / 10 : 0,
    })),
    recent,
  })
}
