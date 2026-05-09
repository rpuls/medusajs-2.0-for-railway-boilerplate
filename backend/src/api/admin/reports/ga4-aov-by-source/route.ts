import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { GA4_PROPERTY_ID } from "../../../../lib/constants"
import { isSeoConfigured } from "../../../../services/seo-analytics/google-auth"
import { fetchGa4Ecommerce } from "../../../../services/seo-analytics/ga4-ecommerce"
import {
  parseDateRange,
  pctDelta,
  priorRange,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/ga4-aov-by-source?from=&to=
 *
 * AOV per `source/medium`, computed as `purchaseRevenue / ecommercePurchases`
 * directly off the existing GA4 ecommerce fetch. Adds a prior-period
 * comparison so each row carries an AOV delta — closes the loop on
 * "where should we put ad spend": high AOV + rising = double down.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)
  const { from: priorFrom, to: priorTo } = priorRange(from, to)

  const configured = isSeoConfigured() && Boolean(GA4_PROPERTY_ID)
  if (!configured) {
    return res.json({
      configured: false,
      from: from.toISOString(),
      to: to.toISOString(),
      channels: [],
    })
  }

  try {
    const [current, prior] = await Promise.all([
      fetchGa4Ecommerce(
        GA4_PROPERTY_ID as string,
        from.toISOString(),
        to.toISOString()
      ),
      fetchGa4Ecommerce(
        GA4_PROPERTY_ID as string,
        priorFrom.toISOString(),
        priorTo.toISOString()
      ),
    ])

    const priorByKey = new Map<string, number>()
    for (const row of prior.channels) {
      const key = `${row.source}|${row.medium}`
      priorByKey.set(
        key,
        row.purchases > 0 ? row.revenue / row.purchases : 0
      )
    }

    const channels = current.channels
      .map((row) => {
        const aov = row.purchases > 0 ? row.revenue / row.purchases : 0
        const priorAov = priorByKey.get(`${row.source}|${row.medium}`) ?? 0
        return {
          source: row.source,
          medium: row.medium,
          sessions: row.sessions,
          purchases: row.purchases,
          revenue: Math.round(row.revenue * 100) / 100,
          aov: Math.round(aov * 100) / 100,
          conversion_rate: row.conversion_rate,
          aov_delta_pct: pctDelta(aov, priorAov),
        }
      })
      // Surface high-AOV first; channels with no purchases sink to bottom.
      .sort((a, b) => b.aov - a.aov)

    return res.json({
      configured: true,
      from: from.toISOString(),
      to: to.toISOString(),
      channels,
    })
  } catch (err: any) {
    logger.error?.(`[ga4-aov-by-source] GA4 query failed: ${err?.message ?? err}`)
    return res.status(502).json({
      configured: true,
      error: "GA4 query failed",
      detail: String(err?.message ?? err),
    })
  }
}
