import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BetaAnalyticsDataClient } from "@google-analytics/data"

import { GA4_PROPERTY_ID } from "../../../../lib/constants"
import {
  getServiceAccountKey,
  isSeoConfigured,
} from "../../../../services/seo-analytics/google-auth"
import { parseDateRange } from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/email-channel-roi
 *
 * Aggregates GA4 sessions + ecommerce metrics filtered to traffic with
 * `sessionMedium = "email"`, broken down by `sessionCampaignName`. Tells
 * you which outbound emails (transactional vs marketing, reorder vs
 * winback, etc.) actually drive revenue back to the store.
 *
 * Pre-req: outbound emails must carry UTM params on every link. The
 * `tagUrl` helper in backend/src/lib/email-utm.ts handles this for
 * reorder reminders, winbacks, and production-stage notifications.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const logger = (req.scope as any).resolve?.("logger") ?? console
  const { from, to } = parseDateRange(req.query as Record<string, unknown>)

  const configured = isSeoConfigured() && Boolean(GA4_PROPERTY_ID)
  if (!configured) {
    return res.json({
      configured: false,
      from: from.toISOString(),
      to: to.toISOString(),
      campaigns: [],
      totals: {
        sessions: 0,
        purchases: 0,
        revenue: 0,
        conversion_rate: 0,
        aov: 0,
      },
    })
  }

  try {
    const key = getServiceAccountKey()
    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: key.client_email,
        private_key: key.private_key,
      },
    })
    const property = `properties/${GA4_PROPERTY_ID}`
    const dateRanges = [
      {
        startDate: from.toISOString().slice(0, 10),
        endDate: to.toISOString().slice(0, 10),
      },
    ]

    const [byCampaign, totals] = await Promise.all([
      client.runReport({
        property,
        dateRanges,
        dimensions: [
          { name: "sessionCampaignName" },
          { name: "sessionSource" },
        ],
        metrics: [
          { name: "sessions" },
          { name: "ecommercePurchases" },
          { name: "purchaseRevenue" },
        ],
        dimensionFilter: {
          filter: {
            fieldName: "sessionMedium",
            stringFilter: {
              matchType: "EXACT",
              value: "email",
            },
          },
        },
        orderBys: [
          { metric: { metricName: "purchaseRevenue" }, desc: true },
        ],
        limit: 50,
      }),
      client.runReport({
        property,
        dateRanges,
        metrics: [
          { name: "sessions" },
          { name: "ecommercePurchases" },
          { name: "purchaseRevenue" },
        ],
        dimensionFilter: {
          filter: {
            fieldName: "sessionMedium",
            stringFilter: {
              matchType: "EXACT",
              value: "email",
            },
          },
        },
      }),
    ])

    const toNum = (raw: string | null | undefined): number =>
      raw ? Number(raw) || 0 : 0

    const campaigns = (byCampaign[0]?.rows ?? []).map((r) => {
      const sessions = toNum(r.metricValues?.[0]?.value)
      const purchases = toNum(r.metricValues?.[1]?.value)
      const revenue = toNum(r.metricValues?.[2]?.value)
      return {
        campaign: r.dimensionValues?.[0]?.value ?? "(no campaign)",
        source: r.dimensionValues?.[1]?.value ?? "email",
        sessions,
        purchases,
        revenue: Math.round(revenue * 100) / 100,
        conversion_rate:
          sessions > 0 ? Math.round((purchases / sessions) * 1000) / 1000 : 0,
        aov:
          purchases > 0 ? Math.round((revenue / purchases) * 100) / 100 : 0,
      }
    })

    const totalsRow = totals[0]?.rows?.[0]
    const totalSessions = toNum(totalsRow?.metricValues?.[0]?.value)
    const totalPurchases = toNum(totalsRow?.metricValues?.[1]?.value)
    const totalRevenue = toNum(totalsRow?.metricValues?.[2]?.value)

    return res.json({
      configured: true,
      from: from.toISOString(),
      to: to.toISOString(),
      campaigns,
      totals: {
        sessions: totalSessions,
        purchases: totalPurchases,
        revenue: Math.round(totalRevenue * 100) / 100,
        conversion_rate:
          totalSessions > 0
            ? Math.round((totalPurchases / totalSessions) * 1000) / 1000
            : 0,
        aov:
          totalPurchases > 0
            ? Math.round((totalRevenue / totalPurchases) * 100) / 100
            : 0,
      },
    })
  } catch (err: any) {
    logger.error?.(
      `[email-channel-roi] GA4 query failed: ${err?.message ?? err}`
    )
    return res.status(502).json({
      configured: true,
      error: "GA4 query failed",
      detail: String(err?.message ?? err),
    })
  }
}
