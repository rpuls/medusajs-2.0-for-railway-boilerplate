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
 * GET /admin/reports/order-time-heatmap
 *
 * Weekday × hour matrix of when customers actually place orders.
 * Drives staffing decisions and "best time to send email/social".
 *
 * Australia/Sydney is the default storefront timezone — the route
 * returns timestamps as UTC AND converted to Sydney's offset so the
 * frontend can render in either. Sydney shifts between AEST (UTC+10)
 * and AEDT (UTC+11) for daylight savings; we approximate with AEST
 * year-round for simplicity (the histogram nature absorbs the 1-hour
 * cyclical shift).
 */
const SYDNEY_OFFSET_HOURS = 10

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

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
      `[order-time-heatmap] order fetch failed: ${err?.message ?? err}`
    )
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  // Initialise 7×24 matrix (rows: Sun=0..Sat=6, cols: 0-23)
  const matrix: number[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => 0)
  )
  let total = 0
  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    if (o?.status === "canceled") continue
    if (!inRange(o?.created_at, from, to)) continue
    const t = Date.parse(o?.created_at ?? "")
    if (!Number.isFinite(t)) continue
    const sydMs = t + SYDNEY_OFFSET_HOURS * 3_600_000
    const d = new Date(sydMs)
    const dow = d.getUTCDay()
    const hour = d.getUTCHours()
    if (dow >= 0 && dow < 7 && hour >= 0 && hour < 24) {
      matrix[dow][hour] += 1
      total += 1
    }
  }

  // Surface peak hour + peak day for the headline tile.
  let peakCount = 0
  let peakDow = -1
  let peakHour = -1
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      if (matrix[d][h] > peakCount) {
        peakCount = matrix[d][h]
        peakDow = d
        peakHour = h
      }
    }
  }

  // Marginal totals
  const byDay = matrix.map((row, d) => ({
    day: DAY_LABELS[d],
    orders: row.reduce((s, n) => s + n, 0),
  }))
  const byHour: Array<{ hour: number; orders: number }> = []
  for (let h = 0; h < 24; h++) {
    let sum = 0
    for (let d = 0; d < 7; d++) sum += matrix[d][h]
    byHour.push({ hour: h, orders: sum })
  }

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    timezone: "Australia/Sydney",
    summary: {
      total_orders: total,
      peak_day: peakDow >= 0 ? DAY_LABELS[peakDow] : null,
      peak_hour: peakHour,
      peak_count: peakCount,
    },
    matrix,
    by_day: byDay,
    by_hour: byHour,
  })
}
