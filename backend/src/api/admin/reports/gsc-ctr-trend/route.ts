import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { google } from "googleapis"

import { GSC_SITE_URL } from "../../../../lib/constants"
import {
  buildGoogleJwt,
  isSeoConfigured,
} from "../../../../services/seo-analytics/google-auth"
import { parseDateRange } from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/gsc-ctr-trend
 *
 * Per-query Google Search Console CTR over the configured window vs
 * the same length window immediately preceding. Surfaces queries
 * losing CTR — typically rank stable but click-through drops because
 * the SERP has acquired richer competitors / your title-meta needs a
 * refresh.
 *
 * Limited to top 100 queries by impressions in the current window so
 * the noise floor stays manageable.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const logger = (req.scope as any).resolve?.("logger") ?? console
  const { from, to } = parseDateRange(req.query as Record<string, unknown>)

  const configured = isSeoConfigured() && Boolean(GSC_SITE_URL)
  if (!configured) {
    return res.json({
      configured: false,
      from: from.toISOString(),
      to: to.toISOString(),
      queries: [],
    })
  }

  const periodMs = to.getTime() - from.getTime()
  const priorTo = new Date(from)
  const priorFrom = new Date(from.getTime() - periodMs)
  const dateOnly = (d: Date) => d.toISOString().slice(0, 10)

  try {
    const auth = buildGoogleJwt([
      "https://www.googleapis.com/auth/webmasters.readonly",
    ])
    const webmasters = google.webmasters({ version: "v3", auth })
    const fetchPeriod = async (startDate: string, endDate: string) => {
      const r = await webmasters.searchanalytics.query({
        siteUrl: GSC_SITE_URL,
        requestBody: {
          startDate,
          endDate,
          dimensions: ["query"],
          rowLimit: 250,
        },
      })
      return r.data.rows ?? []
    }
    const [current, prior] = await Promise.all([
      fetchPeriod(dateOnly(from), dateOnly(to)),
      fetchPeriod(dateOnly(priorFrom), dateOnly(priorTo)),
    ])

    type Row = {
      query: string
      impressions_now: number
      clicks_now: number
      ctr_now: number
      impressions_prior: number
      clicks_prior: number
      ctr_prior: number
      ctr_delta_pct: number | null
      position_now: number
      position_prior: number
    }
    const priorByKey = new Map<
      string,
      {
        impressions: number
        clicks: number
        ctr: number
        position: number
      }
    >()
    for (const r of prior) {
      const q = (r.keys ?? [])[0] ?? ""
      priorByKey.set(q, {
        impressions: Number(r.impressions ?? 0),
        clicks: Number(r.clicks ?? 0),
        ctr: Number(r.ctr ?? 0),
        position: Number(r.position ?? 0),
      })
    }
    const rows: Row[] = current.map((r) => {
      const q = (r.keys ?? [])[0] ?? ""
      const priorRow = priorByKey.get(q) ?? {
        impressions: 0,
        clicks: 0,
        ctr: 0,
        position: 0,
      }
      const ctrNow = Number(r.ctr ?? 0)
      const ctrPrior = priorRow.ctr
      const delta =
        ctrPrior > 0
          ? Math.round(((ctrNow - ctrPrior) / ctrPrior) * 1000) / 10
          : null
      return {
        query: q,
        impressions_now: Number(r.impressions ?? 0),
        clicks_now: Number(r.clicks ?? 0),
        ctr_now: Math.round(ctrNow * 10000) / 100, // -> percent
        impressions_prior: priorRow.impressions,
        clicks_prior: priorRow.clicks,
        ctr_prior: Math.round(priorRow.ctr * 10000) / 100,
        ctr_delta_pct: delta,
        position_now: Math.round(Number(r.position ?? 0) * 10) / 10,
        position_prior: Math.round(priorRow.position * 10) / 10,
      }
    })
    // Sort: top 100 by impressions in current window first.
    rows.sort((a, b) => b.impressions_now - a.impressions_now)
    return res.json({
      configured: true,
      from: from.toISOString(),
      to: to.toISOString(),
      prior_from: priorFrom.toISOString(),
      prior_to: priorTo.toISOString(),
      queries: rows.slice(0, 100),
    })
  } catch (err: any) {
    logger.error?.(`[gsc-ctr-trend] GSC query failed: ${err?.message ?? err}`)
    return res.status(502).json({
      configured: true,
      error: "GSC query failed",
      detail: String(err?.message ?? err),
    })
  }
}
