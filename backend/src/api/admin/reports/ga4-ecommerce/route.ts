import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { GA4_PROPERTY_ID } from "../../../../lib/constants"
import { isSeoConfigured } from "../../../../services/seo-analytics/google-auth"
import { fetchGa4Ecommerce } from "../../../../services/seo-analytics/ga4-ecommerce"
import { parseDateRange } from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/ga4-ecommerce?from=&to=
 *
 * Returns the e-commerce funnel + conversion-rate-by-channel + totals
 * powered by the storefront's Enhanced Ecommerce events. Returns
 * `configured: false` rather than 500 if GA4 isn't set up. Returns the
 * data even when funnel counts are all zero (the frontend renders an
 * "events haven't propagated yet" state for that case).
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
      funnel: [],
      channels: [],
      totals: { sessions: 0, purchases: 0, revenue: 0, conversion_rate: 0 },
    })
  }

  try {
    const data = await fetchGa4Ecommerce(
      GA4_PROPERTY_ID as string,
      from.toISOString(),
      to.toISOString()
    )
    return res.json({
      configured: true,
      from: from.toISOString(),
      to: to.toISOString(),
      ...data,
    })
  } catch (err: any) {
    logger.error?.(`[ga4-ecommerce] GA4 query failed: ${err?.message ?? err}`)
    return res.status(502).json({
      configured: true,
      error: "GA4 query failed",
      detail: String(err?.message ?? err),
    })
  }
}
