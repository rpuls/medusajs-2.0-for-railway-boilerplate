import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  fetchOrdersForReports,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/time-to-purchase?from=&to=&region_id=
 *
 * Two distributions, both useful for retargeting-window decisions:
 *
 *   1. First-purchase delay — for customers whose first-ever paid
 *      order falls in the window, days between customer.created_at
 *      and that first order. Tells you how long signup-to-first-order
 *      typically takes; calibrates the email drip cadence.
 *
 *   2. Time to repeat — for customers whose second order falls in the
 *      window, days between their first and second orders. Calibrates
 *      retargeting ads and "we miss you" emails.
 *
 * Output is bucketed histograms + median + sample size.
 */

const BUCKETS = [
  { id: "same_day", label: "Same day", maxDays: 0 },
  { id: "1_2_days", label: "1–2 days", maxDays: 2 },
  { id: "3_7_days", label: "3–7 days", maxDays: 7 },
  { id: "8_14_days", label: "8–14 days", maxDays: 14 },
  { id: "15_30_days", label: "15–30 days", maxDays: 30 },
  { id: "31_90_days", label: "31–90 days", maxDays: 90 },
  { id: "over_90_days", label: "90+ days", maxDays: Infinity },
] as const

const bucketFor = (days: number): string => {
  for (const b of BUCKETS) {
    if (days <= b.maxDays) return b.id
  }
  return BUCKETS[BUCKETS.length - 1].id
}

const median = (arr: number[]): number => {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
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
    logger.error?.(`[time-to-purchase] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  const valid = orders.filter(
    (o) => o?.status !== "canceled" && matchesRegion(o, regionFilter)
  )

  // Per-customer ordered list of paid orders.
  const ordersByCustomer = new Map<string, Array<{ ms: number; iso: string }>>()
  for (const o of valid) {
    const cid = typeof o.customer_id === "string" ? o.customer_id : null
    if (!cid) continue
    const ms = Date.parse(o.created_at)
    if (!Number.isFinite(ms)) continue
    const arr = ordersByCustomer.get(cid) ?? []
    arr.push({ ms, iso: o.created_at })
    ordersByCustomer.set(cid, arr)
  }
  for (const arr of ordersByCustomer.values()) {
    arr.sort((a, b) => a.ms - b.ms)
  }

  // Customer.created_at lookup — needed for first-purchase delay.
  // Pull customers in batch via graph.
  const customerIds = Array.from(ordersByCustomer.keys())
  const customerCreatedAt = new Map<string, number>()
  if (customerIds.length > 0) {
    try {
      const { data: customers } = await query.graph({
        entity: "customer",
        fields: ["id", "created_at"],
        filters: { id: customerIds },
        pagination: { take: customerIds.length, skip: 0 },
      })
      for (const c of (customers as any[]) ?? []) {
        if (c?.id && c?.created_at) {
          const ms = Date.parse(c.created_at)
          if (Number.isFinite(ms)) customerCreatedAt.set(c.id, ms)
        }
      }
    } catch (err: any) {
      logger.warn?.(
        `[time-to-purchase] customer lookup failed: ${err?.message ?? err}`
      )
    }
  }

  const fromMs = from.getTime()
  const toMs = to.getTime()

  // First-purchase delay: customers whose FIRST order is in window.
  const firstDelays: number[] = []
  // Time to repeat: customers whose SECOND order is in window.
  const repeatDelays: number[] = []

  for (const [cid, arr] of ordersByCustomer.entries()) {
    if (arr.length >= 1) {
      const first = arr[0]
      if (first.ms >= fromMs && first.ms <= toMs) {
        const customerStart = customerCreatedAt.get(cid)
        if (customerStart != null) {
          const days = (first.ms - customerStart) / 86_400_000
          if (days >= 0) firstDelays.push(days)
        }
      }
    }
    if (arr.length >= 2) {
      const second = arr[1]
      if (second.ms >= fromMs && second.ms <= toMs) {
        const days = (second.ms - arr[0].ms) / 86_400_000
        if (days >= 0) repeatDelays.push(days)
      }
    }
  }

  const histogram = (values: number[]) => {
    const counts = Object.fromEntries(BUCKETS.map((b) => [b.id, 0])) as Record<
      string,
      number
    >
    for (const v of values) counts[bucketFor(v)] += 1
    return BUCKETS.map((b) => ({
      bucket_id: b.id,
      label: b.label,
      count: counts[b.id],
    }))
  }

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    first_purchase: {
      sample_size: firstDelays.length,
      median_days: Math.round(median(firstDelays) * 10) / 10,
      histogram: histogram(firstDelays),
    },
    repeat_purchase: {
      sample_size: repeatDelays.length,
      median_days: Math.round(median(repeatDelays) * 10) / 10,
      histogram: histogram(repeatDelays),
    },
  })
}
