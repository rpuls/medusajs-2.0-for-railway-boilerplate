import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  PRODUCTION_STAGES,
  type ProductionStage,
} from "../../../../lib/production-stage"
import {
  fetchOrdersForReports,
  inRange,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/order-edit-frequency
 *
 * Process-maturity proxy: how many stage transitions does the average
 * order go through? More than the canonical 9 = excessive
 * revisions / rollbacks; less = streamlined.
 *
 * Specifically tracks:
 *   - avg_transitions_per_order — across all orders that completed a
 *     stage walk in the window (i.e. their *exit* from any stage fell
 *     in window).
 *   - rollback_rate_pct — % of those transitions that went backwards.
 *   - high_edit_orders — top 20 orders by transition count, surface
 *     for staff review (often staff fixed something multiple times).
 *
 * Trending up over time = onboarding new customers who don't get the
 * brief. Trending down = your PDPs / customizer are getting clearer.
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
      `[order-edit-frequency] order fetch failed: ${err?.message ?? err}`
    )
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  type OrderStat = {
    order_id: string
    display_id: number | null
    transitions: number
    rollbacks: number
    customer_email: string | null
    final_stage: ProductionStage | null
  }
  const stats: OrderStat[] = []
  let totalTransitions = 0
  let totalRollbacks = 0

  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    const meta = (o?.metadata ?? {}) as Record<string, unknown>
    const rawHistory = meta.production_stage_history
    if (!Array.isArray(rawHistory) || rawHistory.length < 2) continue
    const sortedHistory = [...rawHistory]
      .filter(
        (e: any) =>
          e &&
          typeof e === "object" &&
          typeof e.stage === "string" &&
          typeof e.changed_at === "string"
      )
      .sort(
        (a: any, b: any) => Date.parse(a.changed_at) - Date.parse(b.changed_at)
      )

    let transitionsInWindow = 0
    let rollbacksInWindow = 0
    for (let i = 1; i < sortedHistory.length; i++) {
      const exitedAt = sortedHistory[i].changed_at as string
      if (!inRange(exitedAt, from, to)) continue
      transitionsInWindow += 1
      const fromIdx = PRODUCTION_STAGES.indexOf(
        sortedHistory[i - 1].stage as ProductionStage
      )
      const toIdx = PRODUCTION_STAGES.indexOf(
        sortedHistory[i].stage as ProductionStage
      )
      if (fromIdx >= 0 && toIdx >= 0 && toIdx < fromIdx) {
        rollbacksInWindow += 1
      }
    }
    if (transitionsInWindow === 0) continue

    totalTransitions += transitionsInWindow
    totalRollbacks += rollbacksInWindow

    const finalStage = sortedHistory[sortedHistory.length - 1]
      ?.stage as ProductionStage | undefined
    stats.push({
      order_id: o.id,
      display_id: typeof o.display_id === "number" ? o.display_id : null,
      transitions: transitionsInWindow,
      rollbacks: rollbacksInWindow,
      customer_email: typeof o.email === "string" ? o.email : null,
      final_stage:
        finalStage && (PRODUCTION_STAGES as readonly string[]).includes(finalStage)
          ? finalStage
          : null,
    })
  }

  const ordersTouched = stats.length
  const avgTransitions =
    ordersTouched > 0 ? totalTransitions / ordersTouched : 0
  const rollbackRate =
    totalTransitions > 0 ? (totalRollbacks / totalTransitions) * 100 : 0

  // Distribution: how many orders had 1-2 transitions, 3-5, 6-9, 10+?
  const buckets = [
    { range: "1-2", min: 1, max: 2, count: 0 },
    { range: "3-5", min: 3, max: 5, count: 0 },
    { range: "6-9", min: 6, max: 9, count: 0 },
    { range: "10+", min: 10, max: Infinity, count: 0 },
  ]
  for (const s of stats) {
    for (const b of buckets) {
      if (s.transitions >= b.min && s.transitions <= b.max) {
        b.count += 1
        break
      }
    }
  }

  const highEditOrders = [...stats]
    .sort((a, b) => b.transitions - a.transitions)
    .slice(0, 20)

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    summary: {
      orders_touched: ordersTouched,
      total_transitions: totalTransitions,
      avg_transitions_per_order: Math.round(avgTransitions * 10) / 10,
      total_rollbacks: totalRollbacks,
      rollback_rate_pct: Math.round(rollbackRate * 10) / 10,
    },
    distribution: buckets,
    high_edit_orders: highEditOrders,
  })
}
