import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  fetchOrdersForReports,
  inRange,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/discount-profitability
 *
 * STUB. Today this codebase doesn't use the Medusa Promotions module, and
 * variant cost (COGS) is only sometimes-populated in
 * `variant.metadata.dnc_cost_price_ex_gst_minor`.
 *
 * This route still returns a sensible, well-shaped payload so the chart
 * can render an empty state. Once promotions are wired and COGS is
 * standardized on every variant, swap the inner `for` loop for the
 * actual aggregation — the response shape doesn't need to change.
 *
 * Future inputs needed:
 *  - order.discounts[] / order.promotions[] (or item.adjustments[])
 *  - variant.cost_minor (or whatever COGS field gets standardized)
 *  - shipping cost per order
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
    logger.warn?.(
      `[discount-profitability] order fetch failed: ${err?.message ?? err}`
    )
    return res.json({
      from: from.toISOString(),
      to: to.toISOString(),
      promotions: [],
      status: "no_data",
      reason: "order_fetch_failed",
    })
  }

  // Probe: do any in-window orders carry a non-empty discount/promotion?
  // If none do, we know the prereq isn't in place yet and short-circuit
  // with the empty-state payload.
  let probedAny = false
  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    if (!inRange(o?.created_at, from, to)) continue
    const discounts = (o as any).discounts
    const promotions = (o as any).promotions
    if (Array.isArray(discounts) && discounts.length > 0) probedAny = true
    if (Array.isArray(promotions) && promotions.length > 0) probedAny = true
    if (probedAny) break
  }

  if (!probedAny) {
    return res.json({
      from: from.toISOString(),
      to: to.toISOString(),
      promotions: [],
      status: "no_data",
      reason: "promotions_not_enabled",
    })
  }

  // Intentional fall-through when promotions ARE in use: return a
  // structurally-correct payload but with empty rows. The aggregation
  // logic ships in a follow-up commit once COGS is standardized.
  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    promotions: [],
    status: "no_data",
    reason: "cogs_not_standardized",
  })
}
