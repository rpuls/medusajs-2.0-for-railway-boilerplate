import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  fetchOrdersForReports,
  matchesRegion,
  parseRegionFilter,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/cohort-ltv
 *
 * Group customers by acquisition month (the month of their first
 * non-cancelled order). For each cohort, plot cumulative revenue per
 * customer at month 0, 1, 2, ... 11 since acquisition. Tells you
 * whether the customers you're acquiring this year are higher- or
 * lower-LTV than last year's.
 *
 * Operational not period-bound — the date-range filter is intentionally
 * ignored. Looks at the full available order history (capped to 5000
 * orders by fetchOrdersForReports).
 */
const MAX_MONTHS = 12

const monthKey = (d: Date): string =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`

const monthsBetween = (a: Date, b: Date): number => {
  return (
    (b.getUTCFullYear() - a.getUTCFullYear()) * 12 +
    (b.getUTCMonth() - a.getUTCMonth())
  )
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(`[cohort-ltv] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  // For each customer, find their first non-cancelled order.
  type CustomerOrders = {
    key: string
    orders: Array<{ created_at: number; total: number }>
  }
  const byCustomer = new Map<string, CustomerOrders>()
  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    if (o?.status === "canceled") continue
    const key = (o.customer_id as string) || (o.email as string) || ""
    if (!key) continue
    const created = Date.parse(o?.created_at ?? "")
    if (!Number.isFinite(created)) continue
    const existing = byCustomer.get(key)
    if (!existing) {
      byCustomer.set(key, {
        key,
        orders: [{ created_at: created, total: Number(o.total ?? 0) }],
      })
    } else {
      existing.orders.push({
        created_at: created,
        total: Number(o.total ?? 0),
      })
    }
  }

  // Bucket customers into cohorts and accumulate revenue per month-since-acquisition.
  type Cohort = {
    cohort_month: string
    cohort_size: number
    cumulative_revenue_per_month: number[] // index = months since acquisition
    cumulative_revenue_total: number
    avg_ltv_to_date: number
    months_observed: number
  }
  const byCohort = new Map<string, Cohort>()

  const now = new Date()
  for (const c of byCustomer.values()) {
    c.orders.sort((a, b) => a.created_at - b.created_at)
    const first = c.orders[0]
    const firstDate = new Date(first.created_at)
    const cohort = monthKey(firstDate)
    const cohortAgeMonths = Math.min(
      MAX_MONTHS - 1,
      monthsBetween(
        new Date(Date.UTC(firstDate.getUTCFullYear(), firstDate.getUTCMonth(), 1)),
        new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
      )
    )

    const existing =
      byCohort.get(cohort) ??
      ({
        cohort_month: cohort,
        cohort_size: 0,
        cumulative_revenue_per_month: Array.from(
          { length: MAX_MONTHS },
          () => 0
        ),
        cumulative_revenue_total: 0,
        avg_ltv_to_date: 0,
        months_observed: cohortAgeMonths,
      } as Cohort)
    existing.cohort_size += 1

    // Walk this customer's orders and add to the appropriate cohort
    // bucket. We track CUMULATIVE so each month index includes everything
    // up to and including that month.
    let runningTotal = 0
    let cursorIdx = 0
    for (let m = 0; m < MAX_MONTHS; m++) {
      const monthEnd = new Date(
        Date.UTC(
          firstDate.getUTCFullYear(),
          firstDate.getUTCMonth() + m + 1,
          1
        )
      ).getTime()
      while (
        cursorIdx < c.orders.length &&
        c.orders[cursorIdx].created_at < monthEnd
      ) {
        runningTotal += c.orders[cursorIdx].total
        cursorIdx += 1
      }
      existing.cumulative_revenue_per_month[m] += runningTotal
    }
    existing.cumulative_revenue_total += runningTotal
    if (cohortAgeMonths > existing.months_observed) {
      existing.months_observed = cohortAgeMonths
    }
    byCohort.set(cohort, existing)
  }

  const cohorts = Array.from(byCohort.values())
    .sort((a, b) => (a.cohort_month < b.cohort_month ? -1 : 1))
    .map((c) => ({
      cohort_month: c.cohort_month,
      cohort_size: c.cohort_size,
      months_observed: c.months_observed,
      avg_ltv_to_date:
        c.cohort_size > 0
          ? Math.round((c.cumulative_revenue_total / c.cohort_size) * 100) / 100
          : 0,
      cumulative_avg_per_month: c.cumulative_revenue_per_month
        .slice(0, c.months_observed + 1)
        .map((v) =>
          c.cohort_size > 0
            ? Math.round((v / c.cohort_size) * 100) / 100
            : 0
        ),
    }))
    // Most recent first so the chart legend shows fresh cohorts on top.
    .reverse()
    .slice(0, 18) // last 18 months of cohorts

  return res.json({ cohorts: cohorts.reverse() })
}
