import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  fetchOrdersForReports,
  matchesRegion,
  parseRegionFilter,
} from "../../../../lib/reports/orders"
import {
  PRODUCTION_STAGES,
  STAGE_SLA_DAYS,
  type ProductionStage,
} from "../../../../lib/production-stage"

/**
 * GET /admin/reports/today
 *
 * Heartbeat data for the "Today" sticky widget at the top of the
 * Reports page. Designed for a single fetch every minute or two — keep
 * it light.
 *
 * Returns:
 *   - today's revenue / orders / new customers vs same weekday last week
 *     (so Mondays compare to Mondays — useful for staff cadence)
 *   - this week's projected ships (open orders with projected_ship in next 7 days)
 *   - on-this-day-last-year: revenue + orders + top product
 *   - milestones crossed today (100th order this month, biggest single order,
 *     etc.) so the frontend can fire confetti
 *
 * All times anchored to Australia/Sydney (AEST UTC+10 — DST shift absorbed
 * into the daily bucket).
 */
const SYDNEY_OFFSET_HOURS = 10

const startOfDaySydney = (now: Date): number => {
  const sydMs = now.getTime() + SYDNEY_OFFSET_HOURS * 3_600_000
  const d = new Date(sydMs)
  const startUtc = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate()
  )
  // Convert back to UTC ms
  return startUtc - SYDNEY_OFFSET_HOURS * 3_600_000
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(`[today] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  // DIAGNOSTIC — remove after confirming total unit
  if (orders.length > 0) {
    const o = orders[0]
    logger.info?.(`[today:diag] order[0] total=${JSON.stringify(o.total)} subtotal=${JSON.stringify(o.subtotal)} items[0].unit_price=${JSON.stringify(o.items?.[0]?.unit_price)}`)
  }

  const now = new Date()
  const todayStart = startOfDaySydney(now)
  const todayEnd = todayStart + 86_400_000
  const sameWeekdayLastWeekStart = todayStart - 7 * 86_400_000
  const sameWeekdayLastWeekEnd = sameWeekdayLastWeekStart + 86_400_000

  // Same date one year ago, in Sydney (approximate — DST + leap years).
  const sydDate = new Date(todayStart + SYDNEY_OFFSET_HOURS * 3_600_000)
  const lastYearStart = Date.UTC(
    sydDate.getUTCFullYear() - 1,
    sydDate.getUTCMonth(),
    sydDate.getUTCDate()
  ) - SYDNEY_OFFSET_HOURS * 3_600_000
  const lastYearEnd = lastYearStart + 86_400_000

  // Aggregations
  let todayRevenue = 0
  let todayOrders = 0
  const todayNewCustomers = new Set<string>()
  let priorRevenue = 0
  let priorOrders = 0
  const priorNewCustomers = new Set<string>()
  let lastYearRevenue = 0
  let lastYearOrders = 0
  const lastYearProductTally = new Map<
    string,
    { title: string; units: number; revenue: number }
  >()
  // Today's largest single order (so we can emit a "biggest today" milestone)
  let largestOrderToday = 0
  // Customer-first-order tracking for "new customer" today
  const firstOrderByCustomer = new Map<string, number>()
  for (const o of orders) {
    const created = Date.parse(o?.created_at ?? "")
    if (!Number.isFinite(created)) continue
    const key = (o.customer_id as string) || (o.email as string) || ""
    if (!key) continue
    const existing = firstOrderByCustomer.get(key) ?? Infinity
    if (created < existing) firstOrderByCustomer.set(key, created)
  }

  // Cumulative-this-month for the "100th order this month" milestone.
  const monthStart = (() => {
    const d = new Date(todayStart + SYDNEY_OFFSET_HOURS * 3_600_000)
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1) -
      SYDNEY_OFFSET_HOURS * 3_600_000
  })()
  let monthOrdersBeforeToday = 0
  let monthOrdersThroughToday = 0

  // Top customer today (single largest spender today)
  const todaySpendByCustomer = new Map<
    string,
    { email: string; spend: number }
  >()

  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    if (o?.status === "canceled") continue
    const created = Date.parse(o?.created_at ?? "")
    if (!Number.isFinite(created)) continue
    const total = Number(o.total ?? 0)
    const key = (o.customer_id as string) || (o.email as string) || ""

    if (created >= todayStart && created < todayEnd) {
      todayRevenue += total
      todayOrders += 1
      if (total > largestOrderToday) largestOrderToday = total
      if (key) {
        const existing = todaySpendByCustomer.get(key) ?? {
          email: typeof o.email === "string" ? o.email : "(unknown)",
          spend: 0,
        }
        existing.spend += total
        todaySpendByCustomer.set(key, existing)
        const firstOrder = firstOrderByCustomer.get(key)
        if (firstOrder != null && firstOrder >= todayStart) {
          todayNewCustomers.add(key)
        }
      }
    } else if (
      created >= sameWeekdayLastWeekStart &&
      created < sameWeekdayLastWeekEnd
    ) {
      priorRevenue += total
      priorOrders += 1
      if (key) {
        const firstOrder = firstOrderByCustomer.get(key)
        if (
          firstOrder != null &&
          firstOrder >= sameWeekdayLastWeekStart &&
          firstOrder < sameWeekdayLastWeekEnd
        ) {
          priorNewCustomers.add(key)
        }
      }
    }

    if (created >= lastYearStart && created < lastYearEnd) {
      lastYearRevenue += total
      lastYearOrders += 1
      for (const it of (o.items ?? []) as any[]) {
        const pid = (it?.product_id as string) || (it?.title as string) || ""
        if (!pid) continue
        const t =
          (typeof it?.product_title === "string" && it.product_title) ||
          (typeof it?.title === "string" && it.title) ||
          "(unknown)"
        const stat = lastYearProductTally.get(pid) ?? {
          title: t,
          units: 0,
          revenue: 0,
        }
        stat.units += Number(it?.quantity ?? 0)
        stat.revenue +=
          Number(it?.unit_price ?? 0) * Number(it?.quantity ?? 0)
        lastYearProductTally.set(pid, stat)
      }
    }

    if (created >= monthStart && created < todayStart) {
      monthOrdersBeforeToday += 1
    }
    if (created >= monthStart && created < todayEnd) {
      monthOrdersThroughToday += 1
    }
  }

  // Projected ships in next 7 days
  let shipsThisWeek = 0
  let shipsToday = 0
  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    if (o?.status === "canceled") continue
    const meta = (o?.metadata ?? {}) as Record<string, unknown>
    const stage = meta.production_stage as ProductionStage | undefined
    if (!stage || stage === "delivered") continue
    if (!(PRODUCTION_STAGES as readonly string[]).includes(stage)) continue
    const rawHistory = meta.production_stage_history
    let enteredCurrentMs: number | null = null
    if (Array.isArray(rawHistory)) {
      const reversed = [...rawHistory].reverse()
      const last = reversed.find((e: any) => e?.stage === stage)
      if (last && typeof (last as any).changed_at === "string") {
        const t = Date.parse((last as any).changed_at)
        if (Number.isFinite(t)) enteredCurrentMs = t
      }
    }
    const daysAtCurrent =
      enteredCurrentMs != null
        ? Math.max(0, (now.getTime() - enteredCurrentMs) / 86_400_000)
        : 0
    const currentSla = STAGE_SLA_DAYS[stage] ?? 0
    let workDaysRemaining = Math.max(0, currentSla - daysAtCurrent)
    const idx = PRODUCTION_STAGES.indexOf(stage)
    for (let i = idx + 1; i < PRODUCTION_STAGES.length; i++) {
      const s = PRODUCTION_STAGES[i]
      if (s === "delivered") continue
      const sla = STAGE_SLA_DAYS[s]
      if (sla != null) workDaysRemaining += sla
    }
    const projectedShipMs = now.getTime() + workDaysRemaining * 86_400_000
    if (projectedShipMs >= todayStart && projectedShipMs < todayEnd) {
      shipsToday += 1
    }
    if (projectedShipMs >= todayStart && projectedShipMs < todayStart + 7 * 86_400_000) {
      shipsThisWeek += 1
    }
  }

  const lastYearTopProduct = (() => {
    let top: { title: string; units: number; revenue: number } | null = null
    for (const stat of lastYearProductTally.values()) {
      if (!top || stat.revenue > top.revenue) top = stat
    }
    return top
  })()

  const todayTopCustomer = (() => {
    let top: { email: string; spend: number } | null = null
    for (const stat of todaySpendByCustomer.values()) {
      if (!top || stat.spend > top.spend) top = stat
    }
    return top
  })()

  // Milestones — what changed today that's worth celebrating?
  const milestones: Array<{ kind: string; label: string }> = []
  if (
    monthOrdersBeforeToday < 100 &&
    monthOrdersThroughToday >= 100
  ) {
    milestones.push({
      kind: "month_century",
      label: "100th order this month!",
    })
  }
  if (
    monthOrdersBeforeToday < 50 &&
    monthOrdersThroughToday >= 50 &&
    monthOrdersBeforeToday >= 25
  ) {
    milestones.push({
      kind: "month_half_century",
      label: "50 orders this month",
    })
  }
  if (todayOrders >= 1 && priorOrders === 0 && new Date(todayStart).getUTCDay() % 7 < 6) {
    // First order of a normally-quiet day
    milestones.push({
      kind: "broke_quiet_day",
      label: "First order of a usually-quiet day",
    })
  }

  return res.json({
    today: {
      from: new Date(todayStart).toISOString(),
      to: new Date(todayEnd).toISOString(),
      revenue: Math.round(todayRevenue * 100) / 100,
      orders: todayOrders,
      new_customers: todayNewCustomers.size,
      ships_today: shipsToday,
      ships_this_week: shipsThisWeek,
      largest_order: Math.round(largestOrderToday * 100) / 100,
      top_customer: todayTopCustomer,
    },
    same_weekday_last_week: {
      from: new Date(sameWeekdayLastWeekStart).toISOString(),
      to: new Date(sameWeekdayLastWeekEnd).toISOString(),
      revenue: Math.round(priorRevenue * 100) / 100,
      orders: priorOrders,
      new_customers: priorNewCustomers.size,
    },
    on_this_day_last_year: {
      from: new Date(lastYearStart).toISOString(),
      to: new Date(lastYearEnd).toISOString(),
      revenue: Math.round(lastYearRevenue * 100) / 100,
      orders: lastYearOrders,
      top_product: lastYearTopProduct,
    },
    month_to_date: {
      orders_before_today: monthOrdersBeforeToday,
      orders_through_today: monthOrdersThroughToday,
    },
    milestones,
    timezone: "Australia/Sydney",
    generated_at: now.toISOString(),
  })
}
