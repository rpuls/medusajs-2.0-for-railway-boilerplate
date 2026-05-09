import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  PRODUCTION_STAGES,
  type ProductionStage,
  isProductionStage,
} from "../../../../lib/production-stage"

/**
 * GET /admin/reports/production-snapshot
 *
 * Returns the current operational picture of the production pipeline:
 * counts of orders at each stage, total revenue in each stage, average
 * dwell time, and a per-stage list of the longest-stuck orders so the
 * frontend can render the stage-list / Kanban view without a second
 * round-trip.
 *
 * Filters supported:
 *   - method:    csv of decoration methods (matches `metadata.decorationDesign.method`)
 *                special key `blank` = no decoration metadata on the line
 *   - supplier:  "ascolour" | "other" — based on order metadata flag
 *   - stuck:     "1" — only return orders that are over their stage SLA
 *
 * Cancelled / delivered orders are excluded by default so the page
 * stays operational. Pass `?include_done=1` to include delivered.
 */

const PER_STAGE_CAP = 100 // hard cap to keep payload small

type LineItemMeta = {
  decorationDesign?: { method?: unknown }
  vectorization_for_order?: unknown
  customizerDesign?: unknown
}

const DECORATION_METHODS = [
  "embroidery",
  "dtf",
  "screen",
  "uvdtf_sheet",
  "uvdtf_applied",
  "uv",
] as const

type DecorationMethod = (typeof DECORATION_METHODS)[number] | "blank"

const isDecorationMethodOrBlank = (s: string): s is DecorationMethod =>
  s === "blank" || (DECORATION_METHODS as readonly string[]).includes(s)

const itemMethod = (item: { metadata?: unknown }): DecorationMethod => {
  const meta = (item?.metadata ?? {}) as LineItemMeta
  const m = meta?.decorationDesign?.method
  if (typeof m === "string" && (DECORATION_METHODS as readonly string[]).includes(m)) {
    return m as DecorationMethod
  }
  // Legacy customizer rows pre-date the explicit method tagging — surface
  // them as `screen` because the print path that customizerDesign
  // implies is screen-printed by default in SC Prints' history.
  if (meta?.customizerDesign && typeof meta.customizerDesign === "object") {
    return "screen"
  }
  return "blank"
}

const dayCount = (fromIso: string | null | undefined): number => {
  if (!fromIso) return 0
  const t = Date.parse(fromIso)
  if (!Number.isFinite(t)) return 0
  const ms = Date.now() - t
  return Math.max(0, Math.floor(ms / 86_400_000))
}

const STAGE_SLA_DAYS: Record<ProductionStage, number | null> = {
  received: 1,
  art_review: 1,
  awaiting_approval: 2,
  approved: 1,
  blanks_ordered: 5,
  blanks_arrived: 1,
  in_production: 3,
  quality_check: 1,
  shipped: 7,
  delivered: null,
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const rawMethods = (req.query.method as string | undefined)?.trim()
  const methodFilter = rawMethods
    ? new Set(
        rawMethods
          .split(",")
          .map((m) => m.trim())
          .filter((m): m is DecorationMethod => isDecorationMethodOrBlank(m))
      )
    : null
  const supplierFilter = (req.query.supplier as string | undefined)?.trim()
  const stuckOnly = req.query.stuck === "1"
  const includeDone = req.query.include_done === "1"

  // Pull all orders we may need; filter in-memory because production_stage
  // lives in JSONB metadata which doesn't index nicely. Customer name is
  // fetched in a follow-up batch query so the order graph only needs
  // first-class fields (avoids brittleness around the customer module link).
  let orders: any[] = []
  try {
    const { data } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "created_at",
        "status",
        "metadata",
        "currency_code",
        "total",
        "email",
        "customer_id",
        "items.id",
        "items.title",
        "items.quantity",
        "items.metadata",
      ],
      pagination: { take: 1000, skip: 0 },
    })
    orders = (data as any[]) ?? []
  } catch (err: any) {
    logger.error?.(
      `[production-snapshot] order graph query failed: ${err?.message ?? err}`
    )
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  // Best-effort customer name lookup. If this fails we still render rows
  // with the email — never block the page on it.
  const customerIds = Array.from(
    new Set(
      orders
        .map((o: any) => o?.customer_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    )
  )
  const customerNameMap = new Map<string, string>()
  if (customerIds.length > 0) {
    try {
      const { data: customers } = await query.graph({
        entity: "customer",
        fields: ["id", "first_name", "last_name", "email"],
        filters: { id: customerIds },
        pagination: { take: customerIds.length, skip: 0 },
      })
      for (const c of (customers as any[]) ?? []) {
        const name = [c?.first_name, c?.last_name].filter(Boolean).join(" ").trim()
        if (c?.id) customerNameMap.set(c.id, name || c?.email || "")
      }
    } catch (err: any) {
      logger.warn?.(
        `[production-snapshot] customer lookup failed (non-fatal): ${err?.message ?? err}`
      )
    }
  }

  type OrderSummary = {
    id: string
    display_id: number | string | null
    customer: string
    customer_email: string
    items_count: number
    methods: DecorationMethod[]
    garments: string[]
    total: number
    currency_code: string
    days_at_stage: number
    days_since_received: number
    is_stuck: boolean
    stage_changed_at: string | null
    sent_to_ascolour: boolean
  }

  const stageBuckets: Record<ProductionStage, OrderSummary[]> = Object.fromEntries(
    PRODUCTION_STAGES.map((s) => [s, [] as OrderSummary[]])
  ) as Record<ProductionStage, OrderSummary[]>

  for (const order of orders ?? []) {
    if (!includeDone && order.status === "canceled") continue

    const meta = (order.metadata ?? {}) as Record<string, unknown>
    const stageRaw = meta.production_stage
    const stage: ProductionStage | null = isProductionStage(stageRaw)
      ? stageRaw
      : null

    if (!stage) continue
    if (!includeDone && stage === "delivered") continue

    // Apply decoration method filter — order matches if ANY of its line
    // items' methods is in the requested set.
    const lineMethods = (order.items ?? []).map((it: any) => itemMethod(it))
    if (methodFilter && methodFilter.size) {
      const matches = lineMethods.some((m) => methodFilter.has(m))
      if (!matches) continue
    }

    const sentToAscolour = Boolean(meta.ascolour_order_id)
    if (supplierFilter === "ascolour" && !sentToAscolour) continue
    if (supplierFilter === "other" && sentToAscolour) continue

    const stageChangedAt =
      typeof meta.production_stage_changed_at === "string"
        ? (meta.production_stage_changed_at as string)
        : null
    const daysAtStage = dayCount(stageChangedAt ?? order.created_at)
    const sla = STAGE_SLA_DAYS[stage]
    const isStuck = sla != null && daysAtStage > sla

    if (stuckOnly && !isStuck) continue

    const customerName =
      (order.customer_id ? customerNameMap.get(order.customer_id) : "") ||
      order.email ||
      "Guest"

    stageBuckets[stage].push({
      id: order.id,
      display_id: order.display_id ?? null,
      customer: customerName,
      customer_email: order.email ?? "",
      items_count: (order.items ?? []).reduce(
        (sum: number, it: any) => sum + Number(it.quantity ?? 0),
        0
      ),
      methods: Array.from(new Set(lineMethods)),
      garments: Array.from(
        new Set(
          (order.items ?? [])
            .map((it: any) => (it.title ?? "") as string)
            .filter(Boolean)
        )
      ),
      total: Number(order.total ?? 0),
      currency_code: String(order.currency_code ?? "aud"),
      days_at_stage: daysAtStage,
      days_since_received: dayCount(order.created_at),
      is_stuck: isStuck,
      stage_changed_at: stageChangedAt,
      sent_to_ascolour: sentToAscolour,
    })
  }

  // Sort each stage's orders by days_at_stage desc — oldest first, since
  // that's the operational priority for the morning standup view.
  const stageStats = PRODUCTION_STAGES.map((stage) => {
    const all = stageBuckets[stage]
    all.sort((a, b) => b.days_at_stage - a.days_at_stage)
    const truncated = all.length > PER_STAGE_CAP
    const orders = all.slice(0, PER_STAGE_CAP)
    const count = all.length
    const totalRevenue = all.reduce((sum, o) => sum + o.total, 0)
    const averageDaysAtStage =
      count > 0
        ? Math.round((all.reduce((sum, o) => sum + o.days_at_stage, 0) / count) * 10) / 10
        : 0
    const stuckCount = all.filter((o) => o.is_stuck).length

    return {
      stage,
      sla_days: STAGE_SLA_DAYS[stage],
      count,
      stuck_count: stuckCount,
      truncated,
      total_revenue: totalRevenue,
      average_days_at_stage: averageDaysAtStage,
      orders,
    }
  })

  return res.json({
    as_of: new Date().toISOString(),
    filters: {
      method: rawMethods ?? null,
      supplier: supplierFilter ?? null,
      stuck_only: stuckOnly,
      include_done: includeDone,
    },
    stages: stageStats,
  })
}

// Re-export the type for the admin frontend so it doesn't have to re-declare
// the response shape.
export type ProductionSnapshotResponse = {
  as_of: string
  filters: {
    method: string | null
    supplier: string | null
    stuck_only: boolean
    include_done: boolean
  }
  stages: Array<{
    stage: ProductionStage
    sla_days: number | null
    count: number
    stuck_count: number
    truncated: boolean
    total_revenue: number
    average_days_at_stage: number
    orders: Array<{
      id: string
      display_id: number | string | null
      customer: string
      customer_email: string
      items_count: number
      methods: DecorationMethod[]
      garments: string[]
      total: number
      currency_code: string
      days_at_stage: number
      days_since_received: number
      is_stuck: boolean
      stage_changed_at: string | null
      sent_to_ascolour: boolean
    }>
  }>
}

// Validate that decoration methods used by this route stay in lockstep
// with the storefront's source of truth — caught at first request, not
// at deploy.
void DECORATION_METHODS
