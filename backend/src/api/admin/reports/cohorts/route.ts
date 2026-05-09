import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  fetchOrdersForReports,
  matchesRegion,
  parseRegionFilter,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/cohorts?months=12
 *
 * Cohort retention analysis. Customers are grouped by the month of
 * their first paid order; for each cohort we report revenue and
 * order count for month 0 (the cohort month itself), month +1, +2,
 * … up to the requested horizon.
 *
 * Output is rendered as a triangular heatmap on the frontend.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const monthsRaw = (req.query.months as string | undefined)?.trim()
  const horizonMonths = (() => {
    const n = Number(monthsRaw)
    if (!Number.isFinite(n) || n < 1) return 12
    return Math.min(36, Math.floor(n))
  })()
  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(`[cohorts] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  // Filter to non-canceled orders that match region.
  const valid = orders.filter(
    (o) => o?.status !== "canceled" && matchesRegion(o, regionFilter)
  )

  // First, build customer → first-order date.
  const firstOrderByCustomer = new Map<string, { iso: string; ms: number }>()
  for (const o of valid) {
    const cid = typeof o.customer_id === "string" ? o.customer_id : null
    if (!cid) continue
    const ms = Date.parse(o.created_at)
    if (!Number.isFinite(ms)) continue
    const existing = firstOrderByCustomer.get(cid)
    if (!existing || ms < existing.ms) {
      firstOrderByCustomer.set(cid, { iso: o.created_at, ms })
    }
  }

  // Build the cohort horizon — last `horizonMonths` cohorts ending this
  // month. Cohort label is "YYYY-MM" of the first order's calendar month
  // in UTC.
  const now = new Date()
  const cohorts: string[] = []
  for (let i = horizonMonths - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    cohorts.push(d.toISOString().slice(0, 7))
  }
  const cohortIndex = new Map(cohorts.map((c, i) => [c, i]))

  // grid[cohortIdx][monthOffset] = { revenue, orders }
  type Cell = { revenue: number; orders: number }
  const grid: Cell[][] = cohorts.map(() => [])

  // Build per-cohort customer set
  const cohortCustomers: Set<string>[] = cohorts.map(() => new Set<string>())

  for (const [cid, first] of firstOrderByCustomer.entries()) {
    const cohortLabel = first.iso.slice(0, 7)
    const idx = cohortIndex.get(cohortLabel)
    if (idx == null) continue
    cohortCustomers[idx].add(cid)
  }

  // Walk every order and add it to the right (cohort, monthOffset) cell.
  for (const o of valid) {
    const cid = typeof o.customer_id === "string" ? o.customer_id : null
    if (!cid) continue
    const first = firstOrderByCustomer.get(cid)
    if (!first) continue
    const cohortLabel = first.iso.slice(0, 7)
    const idx = cohortIndex.get(cohortLabel)
    if (idx == null) continue

    const orderDate = new Date(Date.parse(o.created_at))
    const firstDate = new Date(first.ms)
    const monthOffset =
      (orderDate.getUTCFullYear() - firstDate.getUTCFullYear()) * 12 +
      (orderDate.getUTCMonth() - firstDate.getUTCMonth())
    if (monthOffset < 0 || monthOffset >= horizonMonths) continue

    const cell = grid[idx][monthOffset] ?? { revenue: 0, orders: 0 }
    cell.revenue += Number(o.total ?? 0)
    cell.orders += 1
    grid[idx][monthOffset] = cell
  }

  // Output: array of cohort rows with cells.
  const rows = cohorts.map((label, i) => {
    const cells: Array<{ month_offset: number; revenue: number; orders: number } | null> = []
    for (let m = 0; m < horizonMonths; m++) {
      const cell = grid[i][m]
      cells.push(
        cell
          ? {
              month_offset: m,
              revenue: Math.round(cell.revenue * 100) / 100,
              orders: cell.orders,
            }
          : null
      )
    }
    return {
      cohort: label,
      customer_count: cohortCustomers[i].size,
      cells,
    }
  })

  return res.json({
    horizon_months: horizonMonths,
    cohorts: rows,
  })
}
