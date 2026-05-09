import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { buildSeoSummary } from "../../../../services/seo-analytics/build-summary"
import { writeSummary } from "../../../../services/seo-analytics/cache"

/**
 * POST /admin/seo-analytics/refresh
 *
 * Runs the same workload as the daily cron synchronously and writes to cache,
 * so the "Refresh now" button on the admin page returns the new payload.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const summary = await buildSeoSummary()
  await writeSummary(req.scope, summary)

  if (summary.errors.length) {
    for (const err of summary.errors) {
      logger.warn(`seo-analytics refresh: ${err.source} failed — ${err.message}`)
    }
  }

  return res.json({ status: summary.status, summary })
}
