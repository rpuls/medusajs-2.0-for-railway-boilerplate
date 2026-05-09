import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { GA4_PROPERTY_ID } from "../../../../lib/constants"
import { isSeoConfigured } from "../../../../services/seo-analytics/google-auth"
import { fetchGa4Acquisition } from "../../../../services/seo-analytics/ga4-acquisition"
import { parseDateRange } from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/ga4-acquisition?from=&to=
 *
 * Returns the three breakdowns the Acquisition tab needs (source/medium,
 * landing pages, device) in one round-trip. GA4 calls run in parallel.
 *
 * If the Google service-account or property-id env isn't set, returns
 * an empty payload with `configured: false` rather than 500. The
 * frontend renders a "configure GA4" empty state.
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
      totals: { sessions: 0, engaged_sessions: 0, bounce_rate: 0 },
      source_medium: [],
      landing_pages: [],
      devices: [],
    })
  }

  try {
    const data = await fetchGa4Acquisition(
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
    logger.error?.(`[ga4-acquisition] GA4 query failed: ${err?.message ?? err}`)
    return res.status(502).json({
      configured: true,
      error: "GA4 query failed",
      detail: String(err?.message ?? err),
    })
  }
}
