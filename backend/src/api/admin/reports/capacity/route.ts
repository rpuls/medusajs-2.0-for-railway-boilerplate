import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  PRODUCTION_STAGES,
  STAGE_SLA_DAYS,
  type ProductionStage,
} from "../../../../lib/production-stage"
import {
  fetchOrdersForReports,
  itemMethod,
  matchesRegion,
  parseRegionFilter,
  type DecorationMethod,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/capacity
 *
 * Operational forecast view: how much work is in the pipeline right now,
 * what's the recent throughput, and when will each open order ship?
 *
 * Methodology:
 *   - Pipeline = orders whose current stage is non-terminal (not delivered).
 *   - Per-order projected ship date = now + sum(STAGE_SLA_DAYS for each
 *     remaining stage including the current one's residual). Residual =
 *     max(0, STAGE_SLA - days_already_at_stage).
 *   - Throughput = orders shipped (entered "shipped" stage) in the last
 *     30 days / 30, days. Capacity status is pipeline_days / throughput_per_day.
 *   - "This week's ships" = projected_ship_date within next 7 days.
 *
 * Operational, not period-bound — date-range filter is intentionally
 * ignored. Region filter still applies.
 */
const NON_TERMINAL_STAGES = PRODUCTION_STAGES.filter(
  (s) => s !== "delivered"
)

const stageIdx = (stage: ProductionStage): number =>
  PRODUCTION_STAGES.indexOf(stage)

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(`[capacity] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  const now = Date.now()
  // ---- Throughput: orders that *entered* "shipped" in last 30 days ----
  const thirtyDaysAgo = now - 30 * 86_400_000
  let shippedLast30 = 0
  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    const meta = (o?.metadata ?? {}) as Record<string, unknown>
    const rawHistory = meta.production_stage_history
    if (!Array.isArray(rawHistory)) continue
    for (const e of rawHistory) {
      if (
        e &&
        typeof e === "object" &&
        (e as any).stage === "shipped" &&
        typeof (e as any).changed_at === "string"
      ) {
        const t = Date.parse((e as any).changed_at)
        if (Number.isFinite(t) && t >= thirtyDaysAgo) shippedLast30 += 1
        break
      }
    }
  }
  const throughputPerDay = shippedLast30 / 30

  // ---- Pipeline: open orders + projected ship dates ----
  type OpenOrder = {
    order_id: string
    display_id: number | null
    customer_email: string | null
    current_stage: ProductionStage
    days_at_current_stage: number
    methods: DecorationMethod[]
    work_days_remaining: number
    projected_ship_at: string
    total: number
    currency_code: string
  }

  const open: OpenOrder[] = []
  let pipelineWorkDays = 0
  const stageLoadCounts = new Map<ProductionStage, number>()
  for (const stage of NON_TERMINAL_STAGES) stageLoadCounts.set(stage, 0)

  for (const order of orders) {
    if (!matchesRegion(order, regionFilter)) continue
    if (order?.status === "canceled") continue
    const meta = (order?.metadata ?? {}) as Record<string, unknown>
    const rawCurrent = meta.production_stage
    const currentStage =
      typeof rawCurrent === "string" &&
      (PRODUCTION_STAGES as readonly string[]).includes(rawCurrent)
        ? (rawCurrent as ProductionStage)
        : null
    if (!currentStage || currentStage === "delivered") continue

    const rawHistory = meta.production_stage_history
    let enteredCurrentMs: number | null = null
    if (Array.isArray(rawHistory)) {
      const sorted = [...rawHistory]
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
      const lastForStage = [...sorted]
        .reverse()
        .find((e: any) => e.stage === currentStage)
      if (lastForStage) {
        const t = Date.parse(lastForStage.changed_at as string)
        if (Number.isFinite(t)) enteredCurrentMs = t
      }
    }
    const daysAtCurrent =
      enteredCurrentMs != null
        ? Math.max(0, (now - enteredCurrentMs) / 86_400_000)
        : 0

    // Compute remaining work: residual SLA on current stage + sum of
    // SLAs for every stage between current+1 and shipped (inclusive).
    // Stages with null SLA contribute 0. "Shipped" is treated as "in
    // transit" so its SLA is the time customer waits before delivery.
    const currentIdx = stageIdx(currentStage)
    const currentSla = STAGE_SLA_DAYS[currentStage] ?? 0
    let workDaysRemaining = Math.max(0, currentSla - daysAtCurrent)
    for (let i = currentIdx + 1; i < PRODUCTION_STAGES.length; i++) {
      const stage = PRODUCTION_STAGES[i]
      if (stage === "delivered") continue
      const sla = STAGE_SLA_DAYS[stage]
      if (sla != null) workDaysRemaining += sla
    }
    pipelineWorkDays += workDaysRemaining
    stageLoadCounts.set(
      currentStage,
      (stageLoadCounts.get(currentStage) ?? 0) + 1
    )

    const projectedShipMs = now + workDaysRemaining * 86_400_000
    const items = (order.items ?? []) as any[]
    const methods = Array.from(new Set(items.map((it) => itemMethod(it))))

    open.push({
      order_id: order.id,
      display_id:
        typeof order.display_id === "number" ? order.display_id : null,
      customer_email:
        typeof order.email === "string" ? order.email : null,
      current_stage: currentStage,
      days_at_current_stage: Math.round(daysAtCurrent * 10) / 10,
      methods,
      work_days_remaining: Math.round(workDaysRemaining * 10) / 10,
      projected_ship_at: new Date(projectedShipMs).toISOString(),
      total: Number(order.total ?? 0),
      currency_code:
        typeof order.currency_code === "string"
          ? order.currency_code.toUpperCase()
          : "AUD",
    })
  }

  open.sort(
    (a, b) =>
      Date.parse(a.projected_ship_at) - Date.parse(b.projected_ship_at)
  )

  // Capacity health: how many days of work is in the pipeline relative
  // to current daily throughput?
  const daysOfWorkInPipeline =
    throughputPerDay > 0 ? pipelineWorkDays / throughputPerDay : null
  let capacityStatus: "green" | "amber" | "red" | "unknown" = "unknown"
  if (daysOfWorkInPipeline === null) {
    capacityStatus = "unknown"
  } else if (daysOfWorkInPipeline <= 7) {
    capacityStatus = "green"
  } else if (daysOfWorkInPipeline <= 14) {
    capacityStatus = "amber"
  } else {
    capacityStatus = "red"
  }

  // Bucket open orders by projected ship week.
  type ShipBucket = { week_start: string; ships: number; revenue: number }
  const bucketByMs = new Map<number, ShipBucket>()
  for (const o of open) {
    const t = Date.parse(o.projected_ship_at)
    if (!Number.isFinite(t)) continue
    // Week starts Monday in UTC.
    const d = new Date(t)
    const dow = d.getUTCDay()
    const diff = (dow + 6) % 7
    const weekStartMs =
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) -
      diff * 86_400_000
    const existing = bucketByMs.get(weekStartMs) ?? {
      week_start: new Date(weekStartMs).toISOString().slice(0, 10),
      ships: 0,
      revenue: 0,
    }
    existing.ships += 1
    existing.revenue += o.total
    bucketByMs.set(weekStartMs, existing)
  }
  const projectedShipsByWeek = Array.from(bucketByMs.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, v]) => v)

  // "Today" / "this week" quick counters.
  const startOfTodayMs = (() => {
    const d = new Date(now)
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  })()
  const endOfTodayMs = startOfTodayMs + 86_400_000
  const sevenDaysMs = startOfTodayMs + 7 * 86_400_000
  const shipsToday = open.filter((o) => {
    const t = Date.parse(o.projected_ship_at)
    return t >= startOfTodayMs && t < endOfTodayMs
  }).length
  const shipsThisWeek = open.filter((o) => {
    const t = Date.parse(o.projected_ship_at)
    return t >= startOfTodayMs && t < sevenDaysMs
  }).length

  return res.json({
    summary: {
      pipeline_orders: open.length,
      pipeline_work_days: Math.round(pipelineWorkDays * 10) / 10,
      throughput_per_day: Math.round(throughputPerDay * 100) / 100,
      shipped_last_30_days: shippedLast30,
      days_of_work_in_pipeline:
        daysOfWorkInPipeline === null
          ? null
          : Math.round(daysOfWorkInPipeline * 10) / 10,
      capacity_status: capacityStatus,
      ships_today: shipsToday,
      ships_this_week: shipsThisWeek,
    },
    stage_load: NON_TERMINAL_STAGES.map((stage) => ({
      stage,
      count: stageLoadCounts.get(stage) ?? 0,
      sla_days: STAGE_SLA_DAYS[stage],
    })),
    projected_ships_by_week: projectedShipsByWeek.slice(0, 12),
    open_orders: open.slice(0, 100),
  })
}
