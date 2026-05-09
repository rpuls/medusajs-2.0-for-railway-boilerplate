import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { PRODUCTION_STAGES } from "../../../../lib/production-stage"
import {
  computeStageDwellDays,
  fetchOrdersForReports,
  inRange,
  itemMethod,
  parseDateRange,
  summarise,
  isDecorationMethodOrBlank,
  type DecorationMethod,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/time-in-stage
 *
 * Per-stage median and p90 dwell time (in days) computed from
 * `metadata.production_stage_history`. Includes only orders whose
 * dwell on the given stage *completed* within the date window —
 * i.e. the order has since left that stage. The current stage is
 * excluded because its dwell isn't final.
 *
 * Filters: from/to (defaults: last 30 days), method (csv).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)

  const rawMethods = (req.query.method as string | undefined)?.trim()
  const methodFilter = rawMethods
    ? new Set(
        rawMethods
          .split(",")
          .map((m) => m.trim())
          .filter((m): m is DecorationMethod => isDecorationMethodOrBlank(m))
      )
    : null

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(`[time-in-stage] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  // Bucket: stage -> [dwell_days_for_each_completed_pass]
  const buckets = new Map<string, number[]>()
  for (const stage of PRODUCTION_STAGES) buckets.set(stage, [])

  for (const order of orders) {
    if (methodFilter && methodFilter.size) {
      const lineMethods = (order.items ?? []).map((it: any) => itemMethod(it))
      const matches = lineMethods.some((m: DecorationMethod) => methodFilter.has(m))
      if (!matches) continue
    }

    // computeStageDwellDays returns one entry per stage that the order has
    // *left*; pair each with the timestamp of the *next* transition so we
    // can date-window the dwell properly.
    const meta = (order.metadata ?? {}) as Record<string, unknown>
    const rawHistory = meta.production_stage_history
    if (!Array.isArray(rawHistory) || rawHistory.length < 2) continue

    const dwells = computeStageDwellDays(order)
    // Need to align dwells with the changed_at of the *next* entry to know
    // when the dwell completed. Re-walk the history to do that:
    const sortedHistory = [...rawHistory]
      .filter(
        (e: any) =>
          e &&
          typeof e === "object" &&
          typeof e.stage === "string" &&
          typeof e.changed_at === "string"
      )
      .sort((a: any, b: any) => Date.parse(a.changed_at) - Date.parse(b.changed_at))

    for (let i = 0; i < sortedHistory.length - 1; i++) {
      const exitedAt = sortedHistory[i + 1].changed_at as string
      if (!inRange(exitedAt, from, to)) continue
      const dwell = dwells[i]
      if (!dwell) continue
      const arr = buckets.get(dwell.stage)
      if (arr) arr.push(dwell.days)
    }
  }

  const stages = PRODUCTION_STAGES.map((stage) => {
    const values = buckets.get(stage) ?? []
    const summary = summarise(values)
    return {
      stage,
      sample_size: values.length,
      median_days: summary.median,
      p90_days: summary.p90,
    }
  })

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    stages,
  })
}
