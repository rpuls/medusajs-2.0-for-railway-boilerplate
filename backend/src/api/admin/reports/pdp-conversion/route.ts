import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { GA4_PROPERTY_ID } from "../../../../lib/constants"
import { isSeoConfigured } from "../../../../services/seo-analytics/google-auth"
import { buildGa4Caller } from "../../../../services/seo-analytics/ga4-caller"
import {
  fetchOrdersForReports,
  inRange,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/pdp-conversion
 *
 * For each product, the ratio of (orders containing any variant) ÷ (GA4
 * page views on its detail page). Surfaces PDPs that get traffic but
 * don't convert — usually a copy / pricing / mockup-quality issue.
 *
 * Page views come from GA4's `pagePath` dimension. We extract a product
 * handle from each path matching `/[country]/products/[handle]`. Orders
 * are matched to products by the line items' `product.handle` (when
 * available) or `product_id`.
 *
 * Limitation: GA4's pagePath has a 14-month retention. Long history
 * isn't available. This report scopes to the configured date window.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)
  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  const ga4Configured = isSeoConfigured() && Boolean(GA4_PROPERTY_ID)
  if (!ga4Configured) {
    return res.json({
      configured: false,
      from: from.toISOString(),
      to: to.toISOString(),
      products: [],
    })
  }

  // ---- 1. GA4 pageviews per /products/[handle] ----
  type ViewsRow = { handle: string; views: number }
  let ga4Rows: ViewsRow[] = []
  try {
    const client = buildGa4Caller()
    const response = await client.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [
        {
          startDate: from.toISOString().slice(0, 10),
          endDate: to.toISOString().slice(0, 10),
        },
      ],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: {
            matchType: "CONTAINS",
            value: "/products/",
          },
        },
      },
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 500,
    })
    const aggByHandle = new Map<string, number>()
    for (const r of response.rows) {
      const path = r.dimensionValues?.[0]?.value ?? ""
      const m = path.match(/\/products\/([^/?#]+)/)
      if (!m) continue
      const handle = decodeURIComponent(m[1])
      const v = Number(r.metricValues?.[0]?.value ?? 0)
      if (!Number.isFinite(v)) continue
      aggByHandle.set(handle, (aggByHandle.get(handle) ?? 0) + v)
    }
    ga4Rows = Array.from(aggByHandle.entries()).map(([handle, views]) => ({
      handle,
      views,
    }))
  } catch (err: any) {
    logger.warn?.(`[pdp-conversion] GA4 query failed: ${err?.message ?? err}`)
    return res.json({
      configured: true,
      from: from.toISOString(),
      to: to.toISOString(),
      products: [],
      error: "GA4 query failed",
      detail: String(err?.message ?? err),
    })
  }

  if (ga4Rows.length === 0) {
    return res.json({
      configured: true,
      from: from.toISOString(),
      to: to.toISOString(),
      products: [],
    })
  }

  // ---- 2. Orders + product graph for handle resolution ----
  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.warn?.(`[pdp-conversion] order fetch failed: ${err?.message ?? err}`)
  }

  // Map product_id → handle via product graph (orders only carry product_id on lines).
  let productInfo = new Map<
    string,
    { id: string; handle: string; title: string }
  >()
  try {
    const { data } = await query.graph({
      entity: "product",
      fields: ["id", "handle", "title"],
      pagination: { take: 5000, skip: 0 },
    })
    for (const p of (data as any[]) ?? []) {
      if (typeof p?.handle === "string") {
        productInfo.set(p.id, {
          id: p.id,
          handle: p.handle,
          title: typeof p?.title === "string" ? p.title : p.handle,
        })
      }
    }
  } catch (err: any) {
    logger.warn?.(`[pdp-conversion] product graph failed: ${err?.message ?? err}`)
  }

  // Per-product order counts (distinct orders containing the product) +
  // total revenue (across the line items for that product).
  type Stat = { orders: Set<string>; revenue: number }
  const byHandle = new Map<string, Stat>()
  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    if (o?.status === "canceled") continue
    if (!inRange(o?.created_at, from, to)) continue
    const seen = new Set<string>()
    for (const it of (o?.items ?? []) as any[]) {
      const pid = it?.product_id
      if (typeof pid !== "string") continue
      const handle = productInfo.get(pid)?.handle
      if (!handle) continue
      seen.add(handle)
      const stat = byHandle.get(handle) ?? {
        orders: new Set<string>(),
        revenue: 0,
      }
      stat.revenue +=
        Number(it?.unit_price ?? 0) * Number(it?.quantity ?? 0)
      byHandle.set(handle, stat)
    }
    for (const handle of seen) {
      byHandle.get(handle)!.orders.add(o.id)
    }
  }

  // Merge GA4 + orders by handle.
  type Row = {
    handle: string
    title: string
    product_id: string | null
    page_views: number
    orders: number
    revenue: number
    conversion_rate_pct: number
    revenue_per_view: number
  }
  const handles = new Set<string>([
    ...ga4Rows.map((r) => r.handle),
    ...byHandle.keys(),
  ])
  const productByHandle = new Map<string, { id: string; title: string }>()
  for (const p of productInfo.values()) {
    productByHandle.set(p.handle, { id: p.id, title: p.title })
  }
  const rows: Row[] = []
  const ga4Map = new Map(ga4Rows.map((r) => [r.handle, r.views]))
  for (const handle of handles) {
    const views = ga4Map.get(handle) ?? 0
    const stat = byHandle.get(handle)
    const orderCount = stat?.orders.size ?? 0
    const revenue = stat?.revenue ?? 0
    const product = productByHandle.get(handle)
    rows.push({
      handle,
      title: product?.title ?? handle,
      product_id: product?.id ?? null,
      page_views: views,
      orders: orderCount,
      revenue: Math.round(revenue * 100) / 100,
      conversion_rate_pct:
        views > 0 ? Math.round((orderCount / views) * 1000) / 10 : 0,
      revenue_per_view:
        views > 0 ? Math.round((revenue / views) * 100) / 100 : 0,
    })
  }
  // Sort by views desc — investigate the high-traffic, low-conversion
  // ones first since those are the highest-potential lift.
  rows.sort((a, b) => b.page_views - a.page_views)

  return res.json({
    configured: true,
    from: from.toISOString(),
    to: to.toISOString(),
    products: rows,
  })
}
