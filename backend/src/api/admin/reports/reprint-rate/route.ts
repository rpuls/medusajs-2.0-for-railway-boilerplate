import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  PRODUCTION_STAGES,
  type ProductionStage,
} from "../../../../lib/production-stage"
import {
  fetchOrdersForReports,
  inRange,
  itemMethod,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
  type DecorationMethod,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/reprint-rate
 *
 * A "reprint" is detected as a stage rollback: a stage_history transition
 * whose destination stage has a lower index than the source in the
 * canonical PRODUCTION_STAGES ordering. e.g. `quality_check → in_production`
 * means QC found a defect and the job is being reprinted.
 *
 * Reports:
 *   - Total reprints in window + reprint rate (reprints / orders shipped)
 *   - Breakdown by source stage (where rollbacks originate — usually
 *     quality_check or shipped)
 *   - Breakdown by decoration method (which technique fails most)
 *   - Orders flagged with vectorization_for_order get tagged so we can
 *     test whether vectorized artwork reduces reprints over time
 *   - Order list (top 50 by recency) for follow-up
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
    logger.error?.(`[reprint-rate] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  type RollbackEvent = {
    order_id: string
    display_id: number | null
    rolled_back_at: string
    from_stage: ProductionStage
    to_stage: ProductionStage
    methods: DecorationMethod[]
    had_vectorization: boolean
    customer_email: string | null
  }

  const events: RollbackEvent[] = []
  let ordersInWindow = 0
  // For rate: ratio against orders that have any production_stage_history
  // recorded in the window (i.e. were actively worked on).
  for (const order of orders) {
    if (!matchesRegion(order, regionFilter)) continue
    const meta = (order?.metadata ?? {}) as Record<string, unknown>
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

    let touchedInWindow = false
    for (let i = 1; i < sortedHistory.length; i++) {
      const transitionAt = sortedHistory[i].changed_at as string
      if (inRange(transitionAt, from, to)) touchedInWindow = true
    }
    if (touchedInWindow) ordersInWindow += 1

    for (let i = 1; i < sortedHistory.length; i++) {
      const fromStage = sortedHistory[i - 1].stage as ProductionStage
      const toStage = sortedHistory[i].stage as ProductionStage
      const transitionAt = sortedHistory[i].changed_at as string
      if (!inRange(transitionAt, from, to)) continue
      const fromIdx = PRODUCTION_STAGES.indexOf(fromStage)
      const toIdx = PRODUCTION_STAGES.indexOf(toStage)
      if (fromIdx < 0 || toIdx < 0) continue
      // A rollback is a backwards transition. Same-stage no-ops are skipped.
      if (toIdx >= fromIdx) continue

      const items = (order.items ?? []) as any[]
      const methods = Array.from(
        new Set(items.map((it) => itemMethod(it)))
      )
      const hadVectorization = items.some((it) => {
        const m = it?.metadata
        return (
          m && typeof m === "object" && (m as any).vectorization_for_order === true
        )
      })

      events.push({
        order_id: order.id,
        display_id:
          typeof order.display_id === "number" ? order.display_id : null,
        rolled_back_at: transitionAt,
        from_stage: fromStage,
        to_stage: toStage,
        methods,
        had_vectorization: hadVectorization,
        customer_email:
          typeof order.email === "string" ? order.email : null,
      })
    }
  }

  // Aggregations
  const byFromStage = new Map<ProductionStage, number>()
  const byMethod = new Map<DecorationMethod, number>()
  let withVectorization = 0
  for (const e of events) {
    byFromStage.set(e.from_stage, (byFromStage.get(e.from_stage) ?? 0) + 1)
    for (const m of e.methods) {
      byMethod.set(m, (byMethod.get(m) ?? 0) + 1)
    }
    if (e.had_vectorization) withVectorization += 1
  }

  const rolledBackOrderIds = new Set(events.map((e) => e.order_id))
  const reprintRate =
    ordersInWindow > 0 ? rolledBackOrderIds.size / ordersInWindow : 0

  events.sort(
    (a, b) => Date.parse(b.rolled_back_at) - Date.parse(a.rolled_back_at)
  )

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    summary: {
      total_rollbacks: events.length,
      affected_orders: rolledBackOrderIds.size,
      orders_worked: ordersInWindow,
      reprint_rate_pct: Math.round(reprintRate * 1000) / 10,
      with_vectorization: withVectorization,
    },
    by_source_stage: Array.from(byFromStage.entries())
      .map(([stage, count]) => ({ stage, count }))
      .sort((a, b) => b.count - a.count),
    by_method: Array.from(byMethod.entries())
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count),
    recent_events: events.slice(0, 50),
  })
}
