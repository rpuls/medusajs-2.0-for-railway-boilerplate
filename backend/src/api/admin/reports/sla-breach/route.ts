import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  PRODUCTION_STAGES,
  STAGE_SLA_DAYS,
  type ProductionStage,
} from "../../../../lib/production-stage"
import {
  buildWeekBuckets,
  fetchOrdersForReports,
  inRange,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/sla-breach
 *
 * For every *completed* stage transition that ended within the date
 * window, classify dwell vs SLA into one of three bands:
 *   - on_time      ≤ SLA
 *   - breach       > SLA but ≤ 2× SLA
 *   - severe_breach > 2× SLA
 *
 * Aggregates per stage + a weekly trend of overall breach %. Plus a
 * "currently breaching" list — open orders whose current dwell already
 * exceeds SLA — for immediate triage.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)
  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(`[sla-breach] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  type StageStat = {
    transitions: number
    on_time: number
    breach: number
    severe_breach: number
    overage_days: number[]
  }
  const byStage = new Map<ProductionStage, StageStat>()
  for (const stage of PRODUCTION_STAGES) {
    byStage.set(stage, {
      transitions: 0,
      on_time: 0,
      breach: 0,
      severe_breach: 0,
      overage_days: [],
    })
  }

  // Trend bucket: weekly breach percentage across all stages.
  const { buckets, findBucket } = buildWeekBuckets(from, to)
  type TrendBucket = { breaches: number; total: number }
  const trendBuckets: TrendBucket[] = buckets.map(() => ({
    breaches: 0,
    total: 0,
  }))

  type CurrentlyBreaching = {
    order_id: string
    display_id: number | null
    stage: ProductionStage
    days_at_stage: number
    sla_days: number | null
    customer_email: string | null
    overage: number
  }
  const currentlyBreaching: CurrentlyBreaching[] = []
  const nowMs = Date.now()

  for (const order of orders) {
    if (!matchesRegion(order, regionFilter)) continue
    const meta = (order.metadata ?? {}) as Record<string, unknown>
    const rawHistory = meta.production_stage_history
    if (!Array.isArray(rawHistory) || rawHistory.length === 0) continue

    const sortedHistory = [...rawHistory]
      .filter(
        (e: any) =>
          e &&
          typeof e === "object" &&
          typeof e.stage === "string" &&
          typeof e.changed_at === "string"
      )
      .sort(
        (a: any, b: any) => Date.parse(a.changed_at) - Date.parse(b.changed_at)
      )

    // Completed transitions: dwell = next.changed_at - this.changed_at,
    // bucketed by the *exit* timestamp (i.e. when the dwell ended).
    for (let i = 0; i < sortedHistory.length - 1; i++) {
      const stage = sortedHistory[i].stage as ProductionStage
      const enteredMs = Date.parse(sortedHistory[i].changed_at)
      const exitedMs = Date.parse(sortedHistory[i + 1].changed_at)
      if (!Number.isFinite(enteredMs) || !Number.isFinite(exitedMs)) continue
      const exitedIso = sortedHistory[i + 1].changed_at as string
      if (!inRange(exitedIso, from, to)) continue

      const sla = STAGE_SLA_DAYS[stage]
      if (sla == null) continue // terminal stages have no SLA

      const days = Math.max(0, (exitedMs - enteredMs) / 86_400_000)
      const stat = byStage.get(stage)!
      stat.transitions += 1

      const trendIdx = findBucket(exitedIso)
      const trendBucket = trendIdx >= 0 ? trendBuckets[trendIdx] : null
      if (trendBucket) trendBucket.total += 1

      if (days <= sla) {
        stat.on_time += 1
      } else if (days <= sla * 2) {
        stat.breach += 1
        stat.overage_days.push(days - sla)
        if (trendBucket) trendBucket.breaches += 1
      } else {
        stat.severe_breach += 1
        stat.overage_days.push(days - sla)
        if (trendBucket) trendBucket.breaches += 1
      }
    }

    // Currently breaching: the *last* entry is the current stage. If it's
    // still within the window's "now" and dwell exceeds SLA, surface it.
    const last = sortedHistory[sortedHistory.length - 1]
    if (last) {
      const stage = last.stage as ProductionStage
      const sla = STAGE_SLA_DAYS[stage]
      const enteredMs = Date.parse(last.changed_at)
      if (sla != null && Number.isFinite(enteredMs)) {
        const days = Math.max(0, (nowMs - enteredMs) / 86_400_000)
        if (days > sla) {
          currentlyBreaching.push({
            order_id: order.id,
            display_id:
              typeof order.display_id === "number" ? order.display_id : null,
            stage,
            days_at_stage: Math.round(days * 10) / 10,
            sla_days: sla,
            customer_email:
              typeof order.email === "string" ? order.email : null,
            overage: Math.round((days - sla) * 10) / 10,
          })
        }
      }
    }
  }

  currentlyBreaching.sort((a, b) => b.overage - a.overage)

  const median = (arr: number[]): number => {
    if (arr.length === 0) return 0
    const sorted = [...arr].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    if (sorted.length % 2 === 0) {
      return Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 10) / 10
    }
    return Math.round(sorted[mid] * 10) / 10
  }

  const stages = PRODUCTION_STAGES.filter((s) => STAGE_SLA_DAYS[s] != null).map(
    (stage) => {
      const stat = byStage.get(stage)!
      const breachCount = stat.breach + stat.severe_breach
      return {
        stage,
        sla_days: STAGE_SLA_DAYS[stage],
        transitions: stat.transitions,
        on_time: stat.on_time,
        breach: stat.breach,
        severe_breach: stat.severe_breach,
        breach_pct:
          stat.transitions > 0
            ? Math.round((breachCount / stat.transitions) * 1000) / 10
            : 0,
        severe_pct:
          stat.transitions > 0
            ? Math.round((stat.severe_breach / stat.transitions) * 1000) / 10
            : 0,
        median_overage_days: median(stat.overage_days),
      }
    }
  )

  const trend = buckets.map((b, i) => {
    const tb = trendBuckets[i]
    return {
      week: b.label,
      transitions: tb.total,
      breaches: tb.breaches,
      breach_pct:
        tb.total > 0 ? Math.round((tb.breaches / tb.total) * 1000) / 10 : 0,
    }
  })

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    by_stage: stages,
    trend,
    currently_breaching: currentlyBreaching.slice(0, 50),
    currently_breaching_total: currentlyBreaching.length,
  })
}
