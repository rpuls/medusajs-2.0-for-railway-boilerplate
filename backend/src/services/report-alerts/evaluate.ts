import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"

import {
  PRODUCTION_STAGES,
  STAGE_SLA_DAYS,
  type ProductionStage,
} from "../../lib/production-stage"
import {
  fetchOrdersForReports,
  inRange,
} from "../../lib/reports/orders"

/**
 * Compute the current value for every supported alert metric. Returns a
 * single map so the cron only walks orders + variants once per run.
 *
 * Keep new metrics additive — the alert model stores `metric` as a free
 * text key, so adding entries here is enough to make them available.
 */

export type MetricKey =
  | "sla_breach_pct_7d"
  | "currently_breaching_count"
  | "reprint_rate_7d"
  | "dead_stock_units"
  | "capacity_red"
  | "top10_customer_share"

export const METRIC_LABELS: Record<MetricKey, string> = {
  sla_breach_pct_7d: "SLA breach % (last 7 days)",
  currently_breaching_count: "Open orders past SLA right now",
  reprint_rate_7d: "Reprint rate % (last 7 days)",
  dead_stock_units: "Stocked units unsold 180+ days",
  capacity_red: "Capacity status = red (1 / 0)",
  top10_customer_share: "Top 10 customers' revenue share %",
}

export type MetricSnapshot = Record<MetricKey, number>

const NON_TERMINAL = PRODUCTION_STAGES.filter((s) => s !== "delivered")

const sevenDaysAgo = (now: Date): Date =>
  new Date(now.getTime() - 7 * 86_400_000)

const thirtyDaysAgo = (now: Date): Date =>
  new Date(now.getTime() - 30 * 86_400_000)

export async function evaluateMetrics(
  container: MedusaContainer,
  options: { now?: Date } = {}
): Promise<MetricSnapshot> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const now = options.now ?? new Date()
  const window7Start = sevenDaysAgo(now)
  const window30Start = thirtyDaysAgo(now)
  const nowMs = now.getTime()

  const orders = await fetchOrdersForReports(query)

  // ---- SLA breach %, last 7 days ----
  let slaTransitions = 0
  let slaBreaches = 0
  // ---- Currently breaching open orders ----
  let currentlyBreaching = 0
  // ---- Reprint rate, last 7 days ----
  let reprintEventOrderIds = new Set<string>()
  let ordersWorkedLast7 = new Set<string>()
  // ---- Top-10 concentration over last 30 days ----
  type CustomerAgg = { revenue: number }
  const byCustomer30 = new Map<string, CustomerAgg>()
  let total30 = 0
  // ---- Capacity red signal ----
  let pipelineWorkDays = 0
  let shippedLast30 = 0

  for (const o of orders) {
    if (o?.status === "canceled") continue
    const meta = (o?.metadata ?? {}) as Record<string, unknown>
    const rawHistory = meta.production_stage_history
    const sortedHistory = Array.isArray(rawHistory)
      ? [...rawHistory]
          .filter(
            (e: any) =>
              e &&
              typeof e === "object" &&
              typeof e.stage === "string" &&
              typeof e.changed_at === "string"
          )
          .sort(
            (a: any, b: any) =>
              Date.parse(a.changed_at) - Date.parse(b.changed_at)
          )
      : []

    // SLA + reprint walk
    let touchedLast7 = false
    for (let i = 1; i < sortedHistory.length; i++) {
      const transitionAt = sortedHistory[i].changed_at as string
      const fromStage = sortedHistory[i - 1].stage as ProductionStage
      const toStage = sortedHistory[i].stage as ProductionStage
      if (!inRange(transitionAt, window7Start, now)) continue
      touchedLast7 = true

      // SLA: count completed dwell on `fromStage`
      const enteredMs = Date.parse(sortedHistory[i - 1].changed_at as string)
      const exitedMs = Date.parse(transitionAt)
      const sla = STAGE_SLA_DAYS[fromStage]
      if (
        sla != null &&
        Number.isFinite(enteredMs) &&
        Number.isFinite(exitedMs)
      ) {
        const days = Math.max(0, (exitedMs - enteredMs) / 86_400_000)
        slaTransitions += 1
        if (days > sla) slaBreaches += 1
      }

      // Reprint: rollback transition
      const fromIdx = PRODUCTION_STAGES.indexOf(fromStage)
      const toIdx = PRODUCTION_STAGES.indexOf(toStage)
      if (fromIdx > 0 && toIdx >= 0 && toIdx < fromIdx) {
        reprintEventOrderIds.add(o.id)
      }
    }
    if (touchedLast7) ordersWorkedLast7.add(o.id)

    // Currently breaching + pipeline workload
    const last = sortedHistory[sortedHistory.length - 1]
    if (last) {
      const stage = last.stage as ProductionStage
      const sla = STAGE_SLA_DAYS[stage]
      const enteredMs = Date.parse(last.changed_at as string)
      if (sla != null && Number.isFinite(enteredMs) && stage !== "delivered") {
        const daysAt = Math.max(0, (nowMs - enteredMs) / 86_400_000)
        if (daysAt > sla) currentlyBreaching += 1
        // Pipeline work-days remaining
        const stageIdx = PRODUCTION_STAGES.indexOf(stage)
        let workLeft = Math.max(0, sla - daysAt)
        for (let i = stageIdx + 1; i < PRODUCTION_STAGES.length; i++) {
          const s = PRODUCTION_STAGES[i]
          if (s === "delivered") continue
          const sla2 = STAGE_SLA_DAYS[s]
          if (sla2 != null) workLeft += sla2
        }
        pipelineWorkDays += workLeft
      }
    }

    // Throughput: shipped in last 30 days
    if (Array.isArray(rawHistory)) {
      for (const e of rawHistory as any[]) {
        if (e?.stage === "shipped" && typeof e?.changed_at === "string") {
          const t = Date.parse(e.changed_at)
          if (Number.isFinite(t) && t >= window30Start.getTime()) {
            shippedLast30 += 1
          }
          break
        }
      }
    }

    // Customer concentration: revenue grouped by customer (last 30 days)
    const created = Date.parse(o?.created_at ?? "")
    if (Number.isFinite(created) && created >= window30Start.getTime()) {
      const key = (o.customer_id as string) || (o.email as string) || ""
      if (key) {
        const total = Number(o.total ?? 0)
        const existing = byCustomer30.get(key)
        if (existing) existing.revenue += total
        else byCustomer30.set(key, { revenue: total })
        total30 += total
      }
    }
  }

  const slaBreachPct =
    slaTransitions > 0 ? (slaBreaches / slaTransitions) * 100 : 0

  const reprintRate =
    ordersWorkedLast7.size > 0
      ? (reprintEventOrderIds.size / ordersWorkedLast7.size) * 100
      : 0

  // Top-10 concentration
  const top10Revenue = Array.from(byCustomer30.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .reduce((s, c) => s + c.revenue, 0)
  const top10Share = total30 > 0 ? (top10Revenue / total30) * 100 : 0

  // Capacity red: same logic as /admin/reports/capacity
  const throughputPerDay = shippedLast30 / 30
  const daysOfWork =
    throughputPerDay > 0 ? pipelineWorkDays / throughputPerDay : 0
  const capacityRed = daysOfWork > 14 ? 1 : 0

  // Dead stock
  let deadUnits = 0
  try {
    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: [
        "id",
        "manage_inventory",
        "inventory_items.inventory.location_levels.stocked_quantity",
        "inventory_items.inventory.location_levels.reserved_quantity",
      ],
      filters: { manage_inventory: true },
      pagination: { take: 5000, skip: 0 },
    })
    const lastSoldByVariant = new Map<string, number>()
    for (const o of orders) {
      if (o?.status === "canceled") continue
      const created = Date.parse(o?.created_at ?? "")
      if (!Number.isFinite(created)) continue
      for (const it of (o.items ?? []) as any[]) {
        const vid = it?.variant_id
        if (typeof vid !== "string") continue
        const prev = lastSoldByVariant.get(vid) ?? 0
        if (created > prev) lastSoldByVariant.set(vid, created)
      }
    }
    for (const v of (variants as any[]) ?? []) {
      let stocked = 0
      let reserved = 0
      for (const ii of v.inventory_items ?? []) {
        for (const lvl of ii?.inventory?.location_levels ?? []) {
          stocked += Number(lvl?.stocked_quantity ?? 0)
          reserved += Number(lvl?.reserved_quantity ?? 0)
        }
      }
      const inStock = stocked - reserved
      if (inStock <= 0) continue
      const lastSold = lastSoldByVariant.get(v.id) ?? null
      if (lastSold === null) {
        deadUnits += inStock
        continue
      }
      const days = (nowMs - lastSold) / 86_400_000
      if (days > 180) deadUnits += inStock
    }
  } catch {
    // Defensive: dead-stock signal degrades to 0 if inventory graph is unavailable.
  }

  return {
    sla_breach_pct_7d: Math.round(slaBreachPct * 10) / 10,
    currently_breaching_count: currentlyBreaching,
    reprint_rate_7d: Math.round(reprintRate * 10) / 10,
    dead_stock_units: deadUnits,
    capacity_red: capacityRed,
    top10_customer_share: Math.round(top10Share * 10) / 10,
  }
}

export const compareValue = (
  value: number,
  comparator: string,
  threshold: number
): boolean => {
  switch (comparator) {
    case "gt":
      return value > threshold
    case "gte":
      return value >= threshold
    case "lt":
      return value < threshold
    case "lte":
      return value <= threshold
    case "eq":
      return value === threshold
    default:
      return false
  }
}

