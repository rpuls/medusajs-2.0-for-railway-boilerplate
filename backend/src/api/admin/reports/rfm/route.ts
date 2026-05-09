import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  fetchOrdersForReports,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/rfm
 *
 * Recency / Frequency / Monetary segmentation. For each customer with at
 * least one non-cancelled order in the window, compute:
 *   - R: days since their most-recent order (lower = more recent = higher score)
 *   - F: count of orders
 *   - M: total spend (currency-blind — single-region storefront)
 *
 * Score each dimension into quintiles 1-5 over the active customer cohort,
 * then map (R,F,M) tuples to named segments using a standard RFM matrix.
 *
 * The customer list per segment is the actionable output — paste into
 * Resend / your email tool to retarget that bucket.
 */

type RfmSegment =
  | "champions"
  | "loyal"
  | "potential_loyalist"
  | "new_customer"
  | "promising"
  | "needs_attention"
  | "at_risk"
  | "cant_lose"
  | "hibernating"
  | "lost"

const SEGMENT_LABELS: Record<RfmSegment, string> = {
  champions: "Champions",
  loyal: "Loyal customers",
  potential_loyalist: "Potential loyalists",
  new_customer: "New customers",
  promising: "Promising",
  needs_attention: "Needs attention",
  at_risk: "At risk",
  cant_lose: "Can't lose them",
  hibernating: "Hibernating",
  lost: "Lost",
}

/**
 * Quintile score for a value in a sorted array. Returns 1..5 where 5 is
 * the most desirable bucket. For recency, callers pass `inverted: true`
 * because a *lower* day count is better.
 */
const quintileScore = (
  sortedAsc: number[],
  value: number,
  inverted = false
): number => {
  if (sortedAsc.length === 0) return 1
  // index of first element >= value
  let idx = sortedAsc.findIndex((v) => v >= value)
  if (idx === -1) idx = sortedAsc.length - 1
  // rank in [0, n-1]; map to 1..5
  const pct = sortedAsc.length === 1 ? 1 : idx / (sortedAsc.length - 1)
  const raw = Math.min(5, Math.max(1, Math.ceil(pct * 5) || 1))
  return inverted ? 6 - raw : raw
}

const classify = (r: number, f: number, m: number): RfmSegment => {
  // Order matters — first matching rule wins. Rules borrowed from the
  // common Putler / Omniconvert RFM matrix (popularised in DTC) and
  // simplified to what's actionable here.
  if (r >= 4 && f >= 4 && m >= 4) return "champions"
  if (f >= 4 && m >= 3) return "loyal"
  if (r <= 2 && f >= 4 && m >= 4) return "cant_lose"
  if (r <= 2 && f >= 3 && m >= 3) return "at_risk"
  if (r >= 4 && f === 1) return "new_customer"
  if (r >= 4 && f <= 3) return "potential_loyalist"
  if (r === 3 && f <= 2) return "promising"
  if (r === 2 && f <= 2) return "needs_attention"
  if (r === 1 && f === 1) return "lost"
  return "hibernating"
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
    logger.error?.(`[rfm] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  // Aggregate per customer. Recency / Frequency / Monetary are computed
  // over the *full* available history, anchored at the window end — this
  // gives a stable picture rather than one that swings with the date
  // picker. The date filter still limits which customers appear (any
  // customer with no order ever-up-to-`to` is excluded).
  type Bucket = {
    customer_id: string | null
    email: string
    orders: number
    monetary: number
    last_order_at: number
    first_order_at: number
  }
  const byKey = new Map<string, Bucket>()

  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    if (o?.status === "canceled") continue
    const created = Date.parse(o.created_at)
    if (!Number.isFinite(created)) continue
    if (created > to.getTime()) continue
    const key = (o.customer_id as string) || (o.email as string) || ""
    if (!key) continue
    const revenue = Number(o.total ?? 0)
    const existing = byKey.get(key)
    if (!existing) {
      byKey.set(key, {
        customer_id: typeof o.customer_id === "string" ? o.customer_id : null,
        email: typeof o.email === "string" ? o.email : "(no email)",
        orders: 1,
        monetary: revenue,
        last_order_at: created,
        first_order_at: created,
      })
    } else {
      existing.orders += 1
      existing.monetary += revenue
      if (created > existing.last_order_at) existing.last_order_at = created
      if (created < existing.first_order_at) existing.first_order_at = created
    }
  }

  const buckets = Array.from(byKey.values())

  // Compute quintile cutoffs over the entire cohort.
  const recencies = buckets
    .map((b) => Math.max(0, (to.getTime() - b.last_order_at) / 86_400_000))
    .sort((a, b) => a - b)
  const frequencies = buckets.map((b) => b.orders).sort((a, b) => a - b)
  const monetaries = buckets.map((b) => b.monetary).sort((a, b) => a - b)

  type CustomerRow = {
    customer_id: string | null
    email: string
    recency_days: number
    frequency: number
    monetary: number
    last_order_at: string
    r_score: number
    f_score: number
    m_score: number
    segment: RfmSegment
  }
  const segmentBuckets = new Map<RfmSegment, CustomerRow[]>()
  for (const b of buckets) {
    const recencyDays =
      Math.max(0, (to.getTime() - b.last_order_at) / 86_400_000)
    // recency: lower = better, so quintileScore with inverted=true flips it
    const r = quintileScore(recencies, recencyDays, true)
    const f = quintileScore(frequencies, b.orders)
    const m = quintileScore(monetaries, b.monetary)
    const segment = classify(r, f, m)
    const list = segmentBuckets.get(segment) ?? []
    list.push({
      customer_id: b.customer_id,
      email: b.email,
      recency_days: Math.round(recencyDays * 10) / 10,
      frequency: b.orders,
      monetary: Math.round(b.monetary * 100) / 100,
      last_order_at: new Date(b.last_order_at).toISOString(),
      r_score: r,
      f_score: f,
      m_score: m,
      segment,
    })
    segmentBuckets.set(segment, list)
  }

  // Sort each segment by monetary desc — most valuable customer in each bucket first.
  for (const arr of segmentBuckets.values()) {
    arr.sort((a, b) => b.monetary - a.monetary)
  }

  // Stable display order: high-value buckets first, recovery buckets last.
  const SEGMENT_ORDER: RfmSegment[] = [
    "champions",
    "loyal",
    "potential_loyalist",
    "new_customer",
    "promising",
    "needs_attention",
    "at_risk",
    "cant_lose",
    "hibernating",
    "lost",
  ]

  const segments = SEGMENT_ORDER.map((seg) => {
    const customers = segmentBuckets.get(seg) ?? []
    const totalRevenue = customers.reduce((s, c) => s + c.monetary, 0)
    return {
      segment: seg,
      label: SEGMENT_LABELS[seg],
      customer_count: customers.length,
      total_revenue: Math.round(totalRevenue * 100) / 100,
      avg_revenue:
        customers.length > 0
          ? Math.round((totalRevenue / customers.length) * 100) / 100
          : 0,
      customers,
    }
  })

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    total_customers: buckets.length,
    segments,
  })
}
