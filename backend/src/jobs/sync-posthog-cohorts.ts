import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { POSTHOG_COHORT_SYNC_ENABLED } from "../lib/constants"
import { syncPostHogCohorts } from "../services/posthog-cohort-sync/sync"

/**
 * Daily PostHog cohort → Medusa customer_tag reconciliation at 03:30 UTC.
 * Opt-in via POSTHOG_COHORT_SYNC_ENABLED — without it the cron is a
 * no-op. Also needs POSTHOG_PERSONAL_API_KEY, POSTHOG_PROJECT_ID, and
 * POSTHOG_COHORT_SYNC_LIST.
 */
export default async function syncPostHogCohortsJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (!POSTHOG_COHORT_SYNC_ENABLED) {
    logger.info(
      "sync-posthog-cohorts: POSTHOG_COHORT_SYNC_ENABLED not 'true' — skipping."
    )
    return
  }
  try {
    const result = await syncPostHogCohorts(container)
    logger.info(
      `sync-posthog-cohorts: cohorts=${result.cohorts_processed} tagged=${result.customers_tagged} untagged=${result.customers_untagged} failures=${result.failures}`
    )
  } catch (err: any) {
    logger.error(`sync-posthog-cohorts: ${err?.message ?? err}`)
  }
}

export const config = {
  name: "sync-posthog-cohorts",
  schedule: "30 3 * * *",
}
