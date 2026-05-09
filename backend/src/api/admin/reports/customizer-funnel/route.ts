import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { BetaAnalyticsDataClient } from "@google-analytics/data"

import { GA4_PROPERTY_ID } from "../../../../lib/constants"
import {
  getServiceAccountKey,
  isSeoConfigured,
} from "../../../../services/seo-analytics/google-auth"
import {
  fetchOrdersForReports,
  inRange,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/customizer-funnel
 *
 * Four-step funnel:
 *   1. design_started        ← GA4 (storefront)
 *   2. design_saved          ← GA4
 *   3. design_added_to_cart  ← GA4
 *   4. design_purchased      ← Medusa orders w/ items.metadata.customizerDesign
 *
 * Steps 1-3 read 0 until the storefront deploy with the new events
 * propagates (~24-48h after first event). Step 4 works from day 1
 * because customizer line items have always tagged metadata.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)
  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  // ---- Step 4 (purchased) — read from Medusa orders ----------------
  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(
      `[customizer-funnel] order fetch failed: ${err?.message ?? err}`
    )
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  let purchasedOrders = 0
  let purchasedRevenue = 0
  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    if (o?.status === "canceled") continue
    if (!inRange(o?.created_at, from, to)) continue
    const items = (o?.items ?? []) as any[]
    const customizerLines = items.filter((it) => {
      const meta = it?.metadata
      if (!meta || typeof meta !== "object") return false
      return (
        (meta.customizerDesign && typeof meta.customizerDesign === "object") ||
        (meta.decorationDesign && typeof meta.decorationDesign === "object")
      )
    })
    if (customizerLines.length === 0) continue
    purchasedOrders += 1
    for (const it of customizerLines) {
      const unit = Number(it?.unit_price ?? 0)
      const qty = Number(it?.quantity ?? 1)
      purchasedRevenue += unit * qty
    }
  }

  // ---- Steps 1-3 — GA4 ---------------------------------------------
  let designStarted = 0
  let designSaved = 0
  let designAddedToCart = 0
  let ga4Configured = isSeoConfigured() && Boolean(GA4_PROPERTY_ID)

  if (ga4Configured) {
    try {
      const key = getServiceAccountKey()
      const client = new BetaAnalyticsDataClient({
        credentials: {
          client_email: key.client_email,
          private_key: key.private_key,
        },
      })
      const response = await client.runReport({
        property: `properties/${GA4_PROPERTY_ID}`,
        dateRanges: [
          {
            startDate: from.toISOString().slice(0, 10),
            endDate: to.toISOString().slice(0, 10),
          },
        ],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            inListFilter: {
              values: [
                "customizer_design_started",
                "customizer_design_saved",
                "customizer_design_added_to_cart",
              ],
            },
          },
        },
        limit: 10,
      })
      const rows = response[0]?.rows ?? []
      for (const r of rows) {
        const name = r.dimensionValues?.[0]?.value ?? ""
        const count = Number(r.metricValues?.[0]?.value ?? 0)
        if (!Number.isFinite(count)) continue
        if (name === "customizer_design_started") designStarted = count
        else if (name === "customizer_design_saved") designSaved = count
        else if (name === "customizer_design_added_to_cart")
          designAddedToCart = count
      }
    } catch (err: any) {
      logger.warn?.(
        `[customizer-funnel] GA4 query failed: ${err?.message ?? err}`
      )
      ga4Configured = false
    }
  }

  type FunnelStep = {
    step: string
    label: string
    count: number
    conversion_from_top: number | null
    conversion_from_prev: number | null
  }
  const steps: Array<{ step: string; label: string; count: number }> = [
    { step: "design_started", label: "Design started", count: designStarted },
    {
      step: "design_added_to_cart",
      label: "Added to cart",
      count: designAddedToCart,
    },
    {
      step: "design_purchased",
      label: "Purchased",
      count: purchasedOrders,
    },
  ]

  const top = steps[0]?.count ?? 0
  let prev = top
  const funnel: FunnelStep[] = steps.map((s, i) => {
    const fromTop =
      top > 0 ? Math.round((s.count / top) * 1000) / 10 : null
    const fromPrev =
      i === 0 ? null : prev > 0 ? Math.round((s.count / prev) * 1000) / 10 : null
    prev = s.count
    return {
      ...s,
      conversion_from_top: fromTop,
      conversion_from_prev: fromPrev,
    }
  })

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    ga4_configured: ga4Configured,
    funnel,
    side_steps: {
      design_saved: designSaved,
    },
    purchased_revenue: Math.round(purchasedRevenue * 100) / 100,
    purchased_orders: purchasedOrders,
  })
}
