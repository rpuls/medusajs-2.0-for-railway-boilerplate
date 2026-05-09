import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  PRODUCTION_STAGES,
  type ProductionStage,
} from "../../../../lib/production-stage"
import {
  fetchOrdersForReports,
  matchesRegion,
  parseRegionFilter,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/blanks-forecast
 *
 * Aggregates blanks needed across every active (pre-shipped, non-cancelled)
 * order, compares against current Medusa-tracked stock, and surfaces the
 * deficit per SKU. AS Colour is SC Prints' dominant blanks supplier so
 * the output doubles as a draft purchase-order list — but the report
 * doesn't filter on supplier; it covers every managed-inventory variant.
 *
 * Stages considered "active" for blanks demand:
 *   - received, art_review, awaiting_approval, approved, blanks_ordered,
 *     blanks_arrived, in_production, quality_check.
 *   - shipped + delivered are excluded (blanks already used).
 *
 * `urgency` per line:
 *   - "needed_now"   stage is at/past blanks_arrived (printing imminent)
 *   - "needed_soon"  approved or blanks_ordered (within ~1 week)
 *   - "lead_time_ok" earlier stages (artwork still being designed)
 *
 * Note: this uses Medusa's stock figures, not a live AS Colour API call.
 * If you decorate from blanks AS Colour holds in their warehouse, use
 * `metadata.ascolour_order_id` as a signal that the PO is already
 * placed and exclude that order from the deficit calculation. We do that
 * here.
 */

const STAGE_URGENCY: Record<ProductionStage, "needed_now" | "needed_soon" | "lead_time_ok" | "skip"> = {
  received: "lead_time_ok",
  art_review: "lead_time_ok",
  awaiting_approval: "lead_time_ok",
  approved: "needed_soon",
  blanks_ordered: "needed_soon",
  blanks_arrived: "needed_now",
  in_production: "needed_now",
  quality_check: "needed_now",
  shipped: "skip",
  delivered: "skip",
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console
  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(`[blanks-forecast] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  type OrderDemand = {
    order_id: string
    display_id: number | null
    quantity: number
    urgency: "needed_now" | "needed_soon" | "lead_time_ok"
  }
  type VariantDemand = {
    variant_id: string
    quantity_total: number
    quantity_now: number
    quantity_soon: number
    quantity_lead_time: number
    orders: OrderDemand[]
  }

  const byVariant = new Map<string, VariantDemand>()

  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    if (o?.status === "canceled") continue
    const meta = (o?.metadata ?? {}) as Record<string, unknown>
    // If AS Colour PO already placed for this order, demand is fulfilled
    // outside our stock — exclude from forecast.
    if (typeof meta.ascolour_order_id === "string" && meta.ascolour_order_id.length > 0) {
      continue
    }
    const stage = (meta.production_stage as ProductionStage) ?? null
    if (!stage || !(PRODUCTION_STAGES as readonly string[]).includes(stage)) {
      continue
    }
    const urgencyKey = STAGE_URGENCY[stage]
    if (urgencyKey === "skip") continue

    for (const it of (o?.items ?? []) as any[]) {
      const vid = it?.variant_id
      if (typeof vid !== "string" || vid.length === 0) continue
      const qty = Number(it?.quantity ?? 0)
      if (!Number.isFinite(qty) || qty <= 0) continue
      const existing = byVariant.get(vid) ?? {
        variant_id: vid,
        quantity_total: 0,
        quantity_now: 0,
        quantity_soon: 0,
        quantity_lead_time: 0,
        orders: [],
      }
      existing.quantity_total += qty
      if (urgencyKey === "needed_now") existing.quantity_now += qty
      else if (urgencyKey === "needed_soon") existing.quantity_soon += qty
      else existing.quantity_lead_time += qty
      existing.orders.push({
        order_id: o.id,
        display_id:
          typeof o.display_id === "number" ? o.display_id : null,
        quantity: qty,
        urgency: urgencyKey,
      })
      byVariant.set(vid, existing)
    }
  }

  // Pull current stock for every variant we have demand for.
  const variantIds = Array.from(byVariant.keys())
  type VariantInfo = {
    id: string
    title: string
    sku: string | null
    product_id: string | null
    product_title: string
    in_stock: number
  }
  const variantInfo = new Map<string, VariantInfo>()
  if (variantIds.length > 0) {
    try {
      const { data } = await query.graph({
        entity: "product_variant",
        fields: [
          "id",
          "title",
          "sku",
          "product_id",
          "product.title",
          "manage_inventory",
          "inventory_items.inventory.location_levels.stocked_quantity",
          "inventory_items.inventory.location_levels.reserved_quantity",
        ],
        filters: { id: variantIds },
        pagination: { take: variantIds.length, skip: 0 },
      })
      for (const v of (data as any[]) ?? []) {
        let stocked = 0
        let reserved = 0
        for (const ii of v.inventory_items ?? []) {
          for (const lvl of ii?.inventory?.location_levels ?? []) {
            stocked += Number(lvl?.stocked_quantity ?? 0)
            reserved += Number(lvl?.reserved_quantity ?? 0)
          }
        }
        variantInfo.set(v.id, {
          id: v.id,
          title: typeof v.title === "string" ? v.title : "(no title)",
          sku: typeof v.sku === "string" ? v.sku : null,
          product_id:
            typeof v.product_id === "string" ? v.product_id : null,
          product_title: v?.product?.title ?? "(unknown product)",
          in_stock: stocked - reserved,
        })
      }
    } catch (err: any) {
      logger.warn?.(
        `[blanks-forecast] variant graph failed: ${err?.message ?? err}`
      )
    }
  }

  type ForecastRow = {
    variant_id: string
    sku: string | null
    title: string
    product_title: string
    product_id: string | null
    in_stock: number
    needed_total: number
    needed_now: number
    needed_soon: number
    needed_lead_time: number
    deficit: number
    order_count: number
    blocked_orders: Array<{
      order_id: string
      display_id: number | null
      quantity: number
      urgency: string
    }>
  }

  const rows: ForecastRow[] = []
  for (const [variant_id, demand] of byVariant.entries()) {
    const info = variantInfo.get(variant_id)
    const inStock = info?.in_stock ?? 0
    const deficit = Math.max(0, demand.quantity_total - inStock)
    rows.push({
      variant_id,
      sku: info?.sku ?? null,
      title: info?.title ?? "(unknown variant)",
      product_title: info?.product_title ?? "(unknown product)",
      product_id: info?.product_id ?? null,
      in_stock: inStock,
      needed_total: demand.quantity_total,
      needed_now: demand.quantity_now,
      needed_soon: demand.quantity_soon,
      needed_lead_time: demand.quantity_lead_time,
      deficit,
      order_count: demand.orders.length,
      // Sort blocked orders: needed_now first, then by qty desc.
      blocked_orders: demand.orders
        .sort((a, b) => {
          const order = { needed_now: 0, needed_soon: 1, lead_time_ok: 2 }
          if (order[a.urgency] !== order[b.urgency]) {
            return order[a.urgency] - order[b.urgency]
          }
          return b.quantity - a.quantity
        })
        .slice(0, 10),
    })
  }

  // Sort: deficit-first by needed_now (real urgency), then deficit desc.
  rows.sort((a, b) => {
    const aUrgentDeficit = Math.max(0, a.needed_now - a.in_stock)
    const bUrgentDeficit = Math.max(0, b.needed_now - b.in_stock)
    if (aUrgentDeficit !== bUrgentDeficit) {
      return bUrgentDeficit - aUrgentDeficit
    }
    return b.deficit - a.deficit
  })

  const totals = rows.reduce(
    (acc, r) => {
      acc.units_short_total += r.deficit
      acc.units_short_now += Math.max(0, r.needed_now - r.in_stock)
      acc.skus_short += r.deficit > 0 ? 1 : 0
      acc.units_in_pipeline += r.needed_total
      return acc
    },
    {
      units_in_pipeline: 0,
      units_short_total: 0,
      units_short_now: 0,
      skus_short: 0,
    }
  )

  return res.json({
    summary: totals,
    rows,
  })
}
