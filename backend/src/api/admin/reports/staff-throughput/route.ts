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
 * GET /admin/reports/staff-throughput
 *
 * Counts how many production-stage transitions each staff member made
 * within the date window. Reads `changed_by` from each entry in
 * `metadata.production_stage_history`.
 *
 * Filters: from/to (defaults: last 30 days), region_id.
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
    logger.error?.(`[staff-throughput] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  // actor_id → { count, stages: { [stage]: count } }
  const actorMap = new Map<string, { count: number; stages: Record<string, number> }>()

  for (const order of orders) {
    if (!matchesRegion(order, regionFilter)) continue

    const meta = (order.metadata ?? {}) as Record<string, unknown>
    const rawHistory = meta.production_stage_history
    if (!Array.isArray(rawHistory)) continue

    for (const entry of rawHistory) {
      if (!entry || typeof entry !== "object") continue
      const changedAt = (entry as any).changed_at
      const changedBy = (entry as any).changed_by
      const stage = (entry as any).stage

      if (typeof changedAt !== "string" || !inRange(changedAt, from, to)) continue
      if (typeof changedBy !== "string" || changedBy.length === 0) continue

      let actor = actorMap.get(changedBy)
      if (!actor) {
        actor = { count: 0, stages: {} }
        actorMap.set(changedBy, actor)
      }
      actor.count++
      if (typeof stage === "string") {
        actor.stages[stage] = (actor.stages[stage] ?? 0) + 1
      }
    }
  }

  const actors = Array.from(actorMap.entries())
    .map(([actor_id, data]) => ({
      actor_id,
      count: data.count,
      stages: data.stages,
    }))
    .sort((a, b) => b.count - a.count)

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    actors,
    total_transitions: actors.reduce((s, a) => s + a.count, 0),
  })
}
