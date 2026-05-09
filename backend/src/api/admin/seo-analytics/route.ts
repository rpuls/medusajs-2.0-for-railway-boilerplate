import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { readSummary } from "../../../services/seo-analytics/cache"

/**
 * GET /admin/seo-analytics
 *
 * Returns the cached SEO summary written by the daily `refresh-seo-analytics` job.
 * Returns `{ status: "empty" }` if the job has not run yet (or cache is unavailable);
 * the admin page surfaces a "Refresh now" button that hits POST /refresh.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const summary = await readSummary(req.scope)
  if (!summary) {
    return res.json({ status: "empty", summary: null })
  }
  return res.json({ status: summary.status, summary })
}
