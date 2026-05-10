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
 * GET /admin/reports/flow-time
 *
 * End-to-end production flow time: time from `received` to `shipped`
 * (or `delivered` if `shipped` is absent) for orders that completed that
 * span within the date window. Returns a histogram + median + p90.
 *
 * Filters: from/to (defaults: last 30 days), region_id.
 */

const BIN_EDGES = [0, 1, 2, 3, 5, 7, 10, 14, 21, 30, 45, Infinity]
const BIN_LABELS = ["0d", "1d", "2d", "3-4d", "5-6d", "7-9d", "10-13d", "14-20d", "21-29d", "30-44d", "45+d"]

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
    logger.error?.(`[flow-time] order fetch failed: ${err?.message ?? err}`)
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

    let receivedAt: string | null = null
    let endAt: string | null = null

    for (const entry of entries) {
      if (entry.stage === "received" && receivedAt === null) {
        receivedAt = entry.changed_at as string
      }
      if (
        (entry.stage === "shipped" || entry.stage === "delivered") &&
        receivedAt !== null
      ) {
        endAt = entry.changed_at as string
        break
      }
    }

    if (receivedAt === null || endAt === null) continue
    if (!inRange(endAt, from, to)) continue

    const ms = Date.parse(endAt) - Date.parse(receivedAt)
    if (ms >= 0) {
      durations.push(ms / 86_400_000)
    }
  }

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
    histogram: bins,
  })
}
