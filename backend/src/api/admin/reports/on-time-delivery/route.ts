import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  buildWeekBuckets,
  fetchOrdersForReports,
  inRange,
  itemMethod,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/on-time-delivery
 *
 * Percentage of shipped orders delivered on or before their
 * production_due_date. Only orders with both a due date set AND a
 * "shipped" entry in their stage history are evaluated. Orders without
 * a due date are counted separately so the caller can surface the
 * data-quality gap.
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
    logger.error?.(`[on-time-delivery] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  const { buckets, findBucket } = buildWeekBuckets(from, to)
  const trendBuckets = buckets.map(() => ({ on_time: 0, late: 0 }))

  // method key → { on_time, late }
  const byMethod = new Map<string, { on_time: number; late: number }>()
  // "rush" | "standard" → { on_time, late }
  const byType = new Map<string, { on_time: number; late: number }>()

  let on_time_count = 0
  let late_count = 0
  let no_due_date_count = 0

  for (const order of orders) {
    if (!matchesRegion(order, regionFilter)) continue

    const meta = (order.metadata ?? {}) as Record<string, unknown>
    const rawHistory = meta.production_stage_history
    if (!Array.isArray(rawHistory) || rawHistory.length === 0) continue

    const entries = rawHistory
      .filter(
        (e: any) =>
          e &&
          typeof e === "object" &&
          typeof e.stage === "string" &&
          typeof e.changed_at === "string" &&
          Number.isFinite(Date.parse(e.changed_at))
      )
      .sort((a: any, b: any) => Date.parse(a.changed_at) - Date.parse(b.changed_at))

    // First "shipped" entry in the sorted history
    const shippedEntry = entries.find((e: any) => e.stage === "shipped")
    if (!shippedEntry) continue

    const shippedAt = shippedEntry.changed_at as string
    if (!inRange(shippedAt, from, to)) continue

    // production_due_date must be a valid date string
    const rawDue = meta.production_due_date
    if (typeof rawDue !== "string" || !Number.isFinite(Date.parse(rawDue))) {
      no_due_date_count++
      continue
    }

    const onTime = Date.parse(shippedAt) <= Date.parse(rawDue)
    if (onTime) {
      on_time_count++
    } else {
      late_count++
    }

    // Trend bucket (keyed by ship date)
    const trendIdx = findBucket(shippedAt)
    if (trendIdx >= 0) {
      if (onTime) trendBuckets[trendIdx].on_time++
      else trendBuckets[trendIdx].late++
    }

    // By decoration method — one vote per unique method across all line items
    const items = (order.items ?? []) as any[]
    const seenMethods = new Set<string>()
    for (const item of items) {
      const method = itemMethod(item)
      if (seenMethods.has(method)) continue
      seenMethods.add(method)
      if (!byMethod.has(method)) byMethod.set(method, { on_time: 0, late: 0 })
      const stat = byMethod.get(method)!
      if (onTime) stat.on_time++
      else stat.late++
    }

    // Rush vs standard
    const typeKey = meta.is_rush === true ? "rush" : "standard"
    if (!byType.has(typeKey)) byType.set(typeKey, { on_time: 0, late: 0 })
    const typeStat = byType.get(typeKey)!
    if (onTime) typeStat.on_time++
    else typeStat.late++
  }

  const evaluatedCount = on_time_count + late_count
  const overallRate =
    evaluatedCount > 0
      ? Math.round((on_time_count / evaluatedCount) * 1000) / 10
      : null

  const trend = buckets.map((b, i) => {
    const tb = trendBuckets[i]
    const total = tb.on_time + tb.late
    return {
      week: b.label,
      on_time: tb.on_time,
      late: tb.late,
      total,
      rate: total > 0 ? Math.round((tb.on_time / total) * 1000) / 10 : null,
    }
  })

  const by_method = Array.from(byMethod.entries())
    .map(([method, s]) => {
      const total = s.on_time + s.late
      return {
        method,
        on_time: s.on_time,
        late: s.late,
        rate: total > 0 ? Math.round((s.on_time / total) * 1000) / 10 : null,
      }
    })
    .sort((a, b) => b.on_time + b.late - (a.on_time + a.late))

  const rush_vs_standard = Array.from(byType.entries()).map(([type, s]) => {
    const total = s.on_time + s.late
    return {
      type,
      on_time: s.on_time,
      late: s.late,
      rate: total > 0 ? Math.round((s.on_time / total) * 1000) / 10 : null,
    }
  })

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    overall_rate: overallRate,
    evaluated_count: evaluatedCount,
    on_time_count,
    late_count,
    no_due_date_count,
    trend,
    by_method,
    rush_vs_standard,
  })
}
