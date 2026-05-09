import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  fetchOrdersForReports,
  inRange,
  parseDateRange,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/ascolour-throughput
 *
 * Lead-time histogram + failure rate for orders sent to AS Colour.
 *
 * "Sent to AS Colour" = `metadata.ascolour_order_id` is set on the order.
 * Lead time is computed from `production_stage_history`: time between
 * the first `blanks_ordered` entry and the first `blanks_arrived` entry
 * for the same order. Failure rate is the share of AS-Colour-sent orders
 * with `metadata.ascolour_status === "failed"`.
 */

type LeadBucket = "<2d" | "2-3d" | "3-5d" | "5-7d" | "7-14d" | ">14d"
const LEAD_BUCKETS: LeadBucket[] = ["<2d", "2-3d", "3-5d", "5-7d", "7-14d", ">14d"]

const bucketFor = (days: number): LeadBucket => {
  if (days < 2) return "<2d"
  if (days < 3) return "2-3d"
  if (days < 5) return "3-5d"
  if (days < 7) return "5-7d"
  if (days < 14) return "7-14d"
  return ">14d"
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(`[ascolour-throughput] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  let sent = 0
  let failed = 0
  let pending = 0
  let leadTimes: number[] = []
  const histogram: Record<LeadBucket, number> = {
    "<2d": 0,
    "2-3d": 0,
    "3-5d": 0,
    "5-7d": 0,
    "7-14d": 0,
    ">14d": 0,
  }
  let oldestPending: { order_id: string; display_id: any; days: number } | null = null

  for (const order of orders) {
    const meta = (order.metadata ?? {}) as Record<string, unknown>
    const ascolourId = meta.ascolour_order_id
    if (typeof ascolourId !== "string" || ascolourId.length === 0) continue
    if (!inRange(order?.created_at, from, to)) continue

    sent += 1
    const status = typeof meta.ascolour_status === "string" ? meta.ascolour_status : ""
    if (status === "failed") failed += 1
    else if (status !== "completed" && status !== "shipped") pending += 1

    const history = Array.isArray(meta.production_stage_history)
      ? (meta.production_stage_history as any[])
      : []
    const orderedEntry = history.find(
      (e) =>
        e &&
        typeof e === "object" &&
        e.stage === "blanks_ordered" &&
        typeof e.changed_at === "string"
    )
    const arrivedEntry = history.find(
      (e) =>
        e &&
        typeof e === "object" &&
        e.stage === "blanks_arrived" &&
        typeof e.changed_at === "string"
    )

    if (orderedEntry && arrivedEntry) {
      const ms = Date.parse(arrivedEntry.changed_at) - Date.parse(orderedEntry.changed_at)
      if (Number.isFinite(ms) && ms >= 0) {
        const days = ms / 86_400_000
        leadTimes.push(days)
        histogram[bucketFor(days)] += 1
      }
    } else if (orderedEntry && !arrivedEntry) {
      // Pending — calculate days waiting
      const ms = Date.now() - Date.parse(orderedEntry.changed_at)
      if (Number.isFinite(ms)) {
        const days = ms / 86_400_000
        if (!oldestPending || days > oldestPending.days) {
          oldestPending = {
            order_id: order.id,
            display_id: order.display_id ?? null,
            days: Math.round(days * 10) / 10,
          }
        }
      }
    }
  }

  const sortedLT = [...leadTimes].sort((a, b) => a - b)
  const median =
    sortedLT.length === 0
      ? 0
      : sortedLT.length % 2 === 0
        ? (sortedLT[sortedLT.length / 2 - 1] + sortedLT[sortedLT.length / 2]) / 2
        : sortedLT[Math.floor(sortedLT.length / 2)]
  const average =
    sortedLT.length === 0 ? 0 : sortedLT.reduce((s, v) => s + v, 0) / sortedLT.length

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    summary: {
      sent,
      failed,
      pending,
      failure_rate: sent > 0 ? Math.round((failed / sent) * 1000) / 1000 : 0,
      median_lead_time_days: Math.round(median * 10) / 10,
      average_lead_time_days: Math.round(average * 10) / 10,
      sample_size: leadTimes.length,
      oldest_pending: oldestPending,
    },
    histogram: LEAD_BUCKETS.map((b) => ({ bucket: b, count: histogram[b] })),
  })
}
