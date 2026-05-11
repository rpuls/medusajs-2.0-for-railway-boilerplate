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
 * GET /admin/reports/vectorization-funnel
 *
 * Five-step funnel for the low-DPI → vectorization upsell:
 *   1. modal_shown        ← GA4 (storefront event)
 *   2. modal_reupload     ← GA4
 *   3. modal_dismissed    ← GA4
 *   4. accepted           ← GA4 (clicked "Add vectorization")
 *   5. purchased          ← Medusa orders w/ items.metadata.vectorization_for_order
 *
 * GA4 events take 24-48h to propagate after first deploy. Until they do,
 * steps 1-4 read 0 — but step 5 (purchased) is queryable from day 1
 * because it's derived from order data, not events.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)
  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  // ---- Step 5 (purchased) — read from Medusa orders ----------------
  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(
      `[vectorization-funnel] order fetch failed: ${err?.message ?? err}`
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
    const hasVectorization = items.some(
      (it) =>
        it?.metadata && (it.metadata as any).vectorization_for_order === true
    )
    if (!hasVectorization) continue
    purchasedOrders += 1
    // Revenue counted = the sum of vectorization line items only (not
    // the whole order). The whole-order revenue is already in Sales.
    for (const it of items) {
      if (
        it?.metadata &&
        (it.metadata as any).vectorization_for_order === true
      ) {
        const unit = Number(it?.unit_price ?? 0)
        const qty = Number(it?.quantity ?? 1)
        purchasedRevenue += unit * qty
      }
    }
  }

  // ---- Steps 1-4 — GA4 ---------------------------------------------
  let modalShown = 0
  let modalReupload = 0
  let modalDismissed = 0
  let accepted = 0
  let ga4Configured = isSeoConfigured() && Boolean(GA4_PROPERTY_ID)

  if (ga4Configured) {
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
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            inListFilter: {
              values: [
                "vectorization_modal_shown",
                "vectorization_modal_reupload",
                "vectorization_modal_dismissed",
                "vectorization_accepted",
              ],
            },
          },
        },
        limit: 10,
      })
      for (const r of response.rows) {
        const name = r.dimensionValues?.[0]?.value ?? ""
        const count = Number(r.metricValues?.[0]?.value ?? 0)
        if (!Number.isFinite(count)) continue
        if (name === "vectorization_modal_shown") modalShown = count
        else if (name === "vectorization_modal_reupload") modalReupload = count
        else if (name === "vectorization_modal_dismissed") modalDismissed = count
        else if (name === "vectorization_accepted") accepted = count
      }
    } catch (err: any) {
      logger.warn?.(
        `[vectorization-funnel] GA4 query failed: ${err?.message ?? err}`
      )
      ga4Configured = false
    }
  }

  // Build funnel with conversion rates relative to step 1 + previous step.
  type FunnelStep = {
    step: string
    label: string
    count: number
    conversion_from_top: number | null
    conversion_from_prev: number | null
  }
  const steps: Array<{ step: string; label: string; count: number }> = [
    { step: "modal_shown", label: "Modal shown", count: modalShown },
    { step: "accepted", label: "Vectorization accepted", count: accepted },
    {
      step: "purchased",
      label: "Vectorization purchased",
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
      modal_dismissed: modalDismissed,
      modal_reupload: modalReupload,
    },
    purchased_revenue: Math.round(purchasedRevenue * 100) / 100,
    purchased_orders: purchasedOrders,
  })
}
