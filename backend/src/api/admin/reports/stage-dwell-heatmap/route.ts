import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { PRODUCTION_STAGES, STAGE_SLA_DAYS } from "../../../../lib/production-stage"
import {
  buildWeekBuckets,
  computeStageDwellDays,
  fetchOrdersForReports,
  inRange,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/stage-dwell-heatmap
 *
 * Returns a (stage × week) matrix where each cell is the average dwell
 * time (in days) for orders that *exited* that stage during that week.
 * Also returns each cell's SLA health band ("ok" | "warn" | "breach")
 * so the frontend can colour-code without re-implementing the threshold logic.
 *
 * Filters: from/to (defaults: last 30 days), region_id.
 */

type Health = "ok" | "warn" | "breach" | "none"

function healthBand(avgDays: number, slaDays: number | null | undefined): Health {
  if (!slaDays) return "none"
  if (avgDays <= slaDays * 0.8) return "ok"
  if (avgDays <= slaDays) return "warn"
  return "breach"
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)
  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(`[stage-dwell-heatmap] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  const { buckets, findBucket } = buildWeekBuckets(from, to)

  // (stage, weekIndex) → [dwell_days]
  const matrix = new Map<string, number[][]>(
    PRODUCTION_STAGES.map((stage) => [stage, buckets.map(() => [])])
  )

  for (const order of orders) {
    if (!matchesRegion(order, regionFilter)) continue

    const meta = (order.metadata ?? {}) as Record<string, unknown>
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
      .sort((a: any, b: any) => Date.parse(a.changed_at) - Date.parse(b.changed_at))

    const dwells = computeStageDwellDays(order)

    for (let i = 0; i < sortedHistory.length - 1; i++) {
      const exitedAt = sortedHistory[i + 1].changed_at as string
      if (!inRange(exitedAt, from, to)) continue
      const dwell = dwells[i]
      if (!dwell) continue
      const weekIdx = findBucket(exitedAt)
      if (weekIdx < 0) continue
      const stageMatrix = matrix.get(dwell.stage)
      if (stageMatrix) stageMatrix[weekIdx].push(dwell.days)
    }
  }

  const weeks = buckets.map((b) => b.label)

  const stages = PRODUCTION_STAGES.map((stage) => {
    const stageMatrix = matrix.get(stage) ?? []
    const sla = STAGE_SLA_DAYS[stage]
    const weekCells = stageMatrix.map((values, wi) => {
      const count = values.length
      const avgDays =
        count === 0
          ? null
          : Math.round((values.reduce((s, v) => s + v, 0) / count) * 10) / 10
      return {
        week: weeks[wi],
        count,
        avg_days: avgDays,
        health: avgDays !== null ? healthBand(avgDays, sla) : ("none" as Health),
      }
    })
    return { stage, sla_days: sla ?? null, weeks: weekCells }
  })

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    weeks,
    stages,
  })
}
