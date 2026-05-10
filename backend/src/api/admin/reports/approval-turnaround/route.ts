import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  buildWeekBuckets,
  fetchOrdersForReports,
  inRange,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
  summarise,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/approval-turnaround
 *
 * Time between entering "awaiting_approval" and the next stage transition
 * (i.e. how long it takes a customer to approve artwork). Only the first
 * awaiting_approval pass is counted per order; rollbacks are not re-tallied.
 * Orders where awaiting_approval is the last history entry are currently
 * waiting and contribute to pending_count only.
 *
 * Date-window filter applies to the exit timestamp (consistent with all
 * other report routes).
 *
 * Filters: from/to (defaults: last 30 days), region_id.
 */

const HIST_BUCKETS = [
  { label: "<4h",  minH: 0,   maxH: 4         },
  { label: "4–8h", minH: 4,   maxH: 8         },
  { label: "8–24h",minH: 8,   maxH: 24        },
  { label: "1–2d", minH: 24,  maxH: 48        },
  { label: "2–3d", minH: 48,  maxH: 72        },
  { label: ">3d",  minH: 72,  maxH: Infinity  },
]

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)
  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(`[approval-turnaround] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  const { buckets, findBucket } = buildWeekBuckets(from, to)
  // Per-week array of dwell hours to compute weekly median
  const trendDwells: number[][] = buckets.map(() => [])

  const dwellHours: number[] = []
  let pending_count = 0

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

    // Only the first awaiting_approval entry
    const aaIdx = entries.findIndex((e: any) => e.stage === "awaiting_approval")
    if (aaIdx === -1) continue

    // Still waiting — no next entry
    if (aaIdx === entries.length - 1) {
      pending_count++
      continue
    }

    const aaEntry = entries[aaIdx] as any
    const nextEntry = entries[aaIdx + 1] as any
    const exitedIso = nextEntry.changed_at as string

    if (!inRange(exitedIso, from, to)) continue

    const aaEnteredMs = Date.parse(aaEntry.changed_at as string)
    const exitedMs = Date.parse(exitedIso)
    const dwellMs = exitedMs - aaEnteredMs

    if (dwellMs < 0) continue // clock skew / data corruption

    const dwell = dwellMs / 3_600_000
    dwellHours.push(dwell)

    const trendIdx = findBucket(exitedIso)
    if (trendIdx >= 0) trendDwells[trendIdx].push(dwell)
  }

  const summary = summarise(dwellHours)

  const histogram = HIST_BUCKETS.map((b) => ({
    bucket: b.label,
    count: dwellHours.filter((h) => h >= b.minH && h < b.maxH).length,
  }))

  const trend = buckets.map((b, i) => {
    const weekDwells = trendDwells[i]
    const { median } = summarise(weekDwells)
    return {
      week: b.label,
      median_hours: weekDwells.length > 0 ? median : null,
      count: weekDwells.length,
    }
  })

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    median_hours: dwellHours.length > 0 ? summary.median : null,
    p90_hours: dwellHours.length > 0 ? summary.p90 : null,
    pending_count,
    evaluated_count: dwellHours.length,
    trend,
    histogram,
  })
}
