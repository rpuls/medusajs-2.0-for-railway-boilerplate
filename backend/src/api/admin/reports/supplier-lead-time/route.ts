import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  fetchOrdersForReports,
  inRange,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
  summarise,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/supplier-lead-time
 *
 * Measures the time (in days) between `blanks_ordered` and `blanks_arrived`
 * for each order that has completed that transition within the date window.
 * Returns a histogram, median, p90, and a benchmark line (5 business days).
 *
 * Filters: from/to (defaults: last 30 days), region_id.
 */

const BENCHMARK_DAYS = 5

const BIN_EDGES = [0, 1, 2, 3, 4, 5, 6, 7, 9, 11, 14, 21, Infinity]
const BIN_LABELS = ["0d", "1d", "2d", "3d", "4d", "5d", "6d", "7d", "8-9d", "10-11d", "12-14d", "15-21d", "22+d"]

function toBinIndex(days: number): number {
  for (let i = 0; i < BIN_EDGES.length; i++) {
    if (days < BIN_EDGES[i]) return i - 1
  }
  return BIN_EDGES.length - 2
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
    logger.error?.(`[supplier-lead-time] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  const durations: number[] = []

  for (const order of orders) {
    if (!matchesRegion(order, regionFilter)) continue

    const meta = (order.metadata ?? {}) as Record<string, unknown>
    const rawHistory = meta.production_stage_history
    if (!Array.isArray(rawHistory) || rawHistory.length < 2) continue

    const entries = rawHistory
      .filter(
        (e: any) =>
          e &&
          typeof e === "object" &&
          typeof e.stage === "string" &&
          typeof e.changed_at === "string"
      )
      .sort((a: any, b: any) => Date.parse(a.changed_at) - Date.parse(b.changed_at))

    let orderedAt: string | null = null
    for (const entry of entries) {
      if (entry.stage === "blanks_ordered") {
        orderedAt = entry.changed_at as string
      }
      if (entry.stage === "blanks_arrived" && orderedAt !== null) {
        const arrivedAt = entry.changed_at as string
        if (!inRange(arrivedAt, from, to)) {
          orderedAt = null
          continue
        }
        const ms = Date.parse(arrivedAt) - Date.parse(orderedAt)
        if (ms >= 0) {
          durations.push(ms / 86_400_000)
        }
        orderedAt = null
      }
    }
  }

  // Build histogram
  const bins = BIN_LABELS.map((label) => ({ bin_label: label, count: 0 }))
  for (const d of durations) {
    const i = toBinIndex(d)
    if (i >= 0 && i < bins.length) bins[i].count++
  }

  const summary = summarise(durations)

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    sample_size: durations.length,
    median_days: summary.median,
    p90_days: summary.p90,
    benchmark_days: BENCHMARK_DAYS,
    histogram: bins,
  })
}
