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
 * GET /admin/reports/saved-design-conversion
 *
 * Two questions:
 *   1. Of designs saved to "My Designs" in the date window, what % went
 *      on to be purchased? Tells us whether the design library is a
 *      conversion accelerator or just a vanity feature.
 *   2. Which designs convert best? Top N saved designs by purchase count
 *      — these are the candidates to surface as starter templates for
 *      new visitors hitting the customizer cold.
 *
 * Attribution: an order line is attributed to a design when its metadata
 * carries `source_design_id` (current canonical) or `designId` (legacy
 * pre-fix). Both are checked so older orders aren't missed.
 *
 * The "purchased" count looks at *any* purchase across all time, not
 * just within the window — a design saved in May and purchased in
 * August still counts. The window only filters which *designs* are in
 * the cohort.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)
  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  let designs: any[] = []
  try {
    const { data } = await query.graph({
      entity: "design",
      fields: [
        "id",
        "customer_id",
        "name",
        "thumbnail_url",
        "base_product_id",
        "created_at",
      ],
      pagination: { take: 5000, skip: 0 },
    })
    designs = (data as any[]) ?? []
  } catch (err: any) {
    logger.warn?.(
      `[saved-design-conversion] design entity not graphable: ${err?.message ?? err}`
    )
    return res.json({
      from: from.toISOString(),
      to: to.toISOString(),
      summary: {
        designs_saved: 0,
        designs_purchased: 0,
        conversion_rate: 0,
        purchased_revenue: 0,
      },
      best_converting: [],
      module_available: false,
    })
  }

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.warn?.(
      `[saved-design-conversion] order fetch failed: ${err?.message ?? err}`
    )
  }

  // Map design_id → { purchase_count, units, revenue }
  type Stats = {
    purchase_orders: Set<string>
    units: number
    revenue: number
  }
  const byDesign = new Map<string, Stats>()
  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    if (o?.status === "canceled") continue
    for (const it of (o?.items ?? []) as any[]) {
      const meta = (it?.metadata ?? {}) as any
      const id =
        (typeof meta.source_design_id === "string" && meta.source_design_id) ||
        (typeof meta.designId === "string" && meta.designId) ||
        null
      if (!id) continue
      const stats = byDesign.get(id) ?? {
        purchase_orders: new Set<string>(),
        units: 0,
        revenue: 0,
      }
      stats.purchase_orders.add(o.id)
      stats.units += Number(it?.quantity ?? 0)
      stats.revenue +=
        Number(it?.unit_price ?? 0) * Number(it?.quantity ?? 0)
      byDesign.set(id, stats)
    }
  }

  const designsInWindow = designs.filter((d) =>
    inRange(d?.created_at, from, to)
  )
  const designsSaved = designsInWindow.length
  let designsPurchased = 0
  let totalRevenue = 0
  for (const d of designsInWindow) {
    const stats = byDesign.get(d.id)
    if (stats && stats.purchase_orders.size > 0) {
      designsPurchased += 1
      totalRevenue += stats.revenue
    }
  }
  const conversionRate =
    designsSaved > 0 ? designsPurchased / designsSaved : 0

  // Best converting — across the FULL design table (not just window).
  // This is the merchandising list: which saved designs to feature as
  // starter templates? Sorted by purchase count, not conversion rate,
  // because raw count proxies "people actually like this."
  type BestRow = {
    design_id: string
    name: string
    thumbnail_url: string | null
    base_product_id: string | null
    purchases: number
    units: number
    revenue: number
    saved_at: string | null
  }
  const best: BestRow[] = []
  for (const d of designs) {
    const stats = byDesign.get(d.id)
    if (!stats || stats.purchase_orders.size === 0) continue
    best.push({
      design_id: d.id,
      name: typeof d.name === "string" ? d.name : "(unnamed)",
      thumbnail_url:
        typeof d.thumbnail_url === "string" ? d.thumbnail_url : null,
      base_product_id:
        typeof d.base_product_id === "string" ? d.base_product_id : null,
      purchases: stats.purchase_orders.size,
      units: stats.units,
      revenue: Math.round(stats.revenue * 100) / 100,
      saved_at:
        typeof d.created_at === "string" ? d.created_at : null,
    })
  }
  best.sort((a, b) => b.purchases - a.purchases || b.revenue - a.revenue)

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    summary: {
      designs_saved: designsSaved,
      designs_purchased: designsPurchased,
      conversion_rate: Math.round(conversionRate * 1000) / 10,
      purchased_revenue: Math.round(totalRevenue * 100) / 100,
    },
    best_converting: best.slice(0, 20),
    module_available: true,
  })
}
