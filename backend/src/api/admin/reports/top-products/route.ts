import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  fetchOrdersForReports,
  inRange,
  parseDateRange,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/top-products
 *
 * Top 20 SKUs by units sold and revenue in period. Aggregates line
 * items grouped by variant_id (or by title for line items missing a
 * variant link). Returns both the units leaderboard and the revenue
 * leaderboard so the frontend can show whichever is more useful.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(`[top-products] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  type Bucket = {
    key: string
    title: string
    variant_id: string | null
    product_id: string | null
    units: number
    revenue: number
    orders: Set<string>
  }
  const byKey = new Map<string, Bucket>()
  let currency = "aud"

  for (const o of orders) {
    if (!inRange(o?.created_at, from, to)) continue
    if (o?.status === "canceled") continue
    if (typeof o.currency_code === "string") currency = o.currency_code

    const items = (o.items ?? []) as Array<{
      title?: string
      quantity?: number
      unit_price?: number
      product_id?: string
      variant_id?: string
    }>
    for (const it of items) {
      const key = (it.variant_id as string) || (it.title as string) || "unknown"
      const qty = Number(it.quantity ?? 0)
      const rev = Number(it.unit_price ?? 0) * qty
      const existing = byKey.get(key)
      if (!existing) {
        byKey.set(key, {
          key,
          title: it.title ?? "Unknown",
          variant_id: typeof it.variant_id === "string" ? it.variant_id : null,
          product_id: typeof it.product_id === "string" ? it.product_id : null,
          units: qty,
          revenue: rev,
          orders: new Set([o.id]),
        })
      } else {
        existing.units += qty
        existing.revenue += rev
        existing.orders.add(o.id)
      }
    }
  }

  const all = Array.from(byKey.values()).map((b) => ({
    title: b.title,
    variant_id: b.variant_id,
    product_id: b.product_id,
    units: b.units,
    revenue: Math.round(b.revenue * 100) / 100,
    orders: b.orders.size,
  }))

  const byUnits = [...all].sort((a, b) => b.units - a.units).slice(0, 20)
  const byRevenue = [...all].sort((a, b) => b.revenue - a.revenue).slice(0, 20)

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    currency: currency.toLowerCase(),
    by_units: byUnits,
    by_revenue: byRevenue,
  })
}
