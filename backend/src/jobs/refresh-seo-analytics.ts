import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { buildSeoSummary } from "../services/seo-analytics/build-summary"
import { writeSummary } from "../services/seo-analytics/cache"
import { isSeoConfigured } from "../services/seo-analytics/google-auth"

/**
 * Daily refresh of GSC + GA4 summary into the container cache. Runs at ~05:00 UTC
 * (≈ 15:00 AEST), after Google's overnight Search Analytics data drop.
 *
 * Skips quietly when SEO env vars are unset so the job is safe to leave registered
 * in dev environments without Google credentials.
 */
export default async function refreshSeoAnalytics(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  if (!isSeoConfigured()) {
    logger.info("refresh-seo-analytics: GOOGLE_SERVICE_ACCOUNT_JSON unset — skipping.")
    return
  }

  const summary = await buildSeoSummary()
  await writeSummary(container, summary)

  const queries = summary.gsc?.topQueries.length ?? 0
  const pages = summary.gsc?.topPages.length ?? 0
  const sessions = summary.ga4?.totals.sessions ?? 0
  if (summary.errors.length) {
    for (const err of summary.errors) {
      logger.warn(`refresh-seo-analytics: ${err.source} failed — ${err.message}`)
    }
  }
  logger.info(
    `refresh-seo-analytics: wrote summary (status=${summary.status}, queries=${queries}, pages=${pages}, ga4_sessions=${sessions}).`
  )
}

export const config = {
  name: "refresh-seo-analytics",
  schedule: "0 5 * * *",
}
