import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { sendMonthlyDigest } from "../services/monthly-digest/send-digest"

/**
 * Sends the monthly performance digest to every configured recipient on
 * the 2nd of each month at 22:00 UTC (≈ 09:00 AEST in summer, 08:00 in
 * winter). The 2nd-of-month timing is intentional: the 1st often has
 * pending stage updates from end-of-month orders that nudge production
 * SLA numbers; waiting a day stabilises the snapshot.
 *
 * Skips quietly when MONTHLY_DIGEST_RECIPIENTS is unset.
 */
export default async function sendMonthlyDigestJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    const result = await sendMonthlyDigest(container)
    if (result.recipients.length === 0) {
      logger.info(
        `send-monthly-digest: ${result.skipped || "no recipients"} — skipped.`
      )
      return
    }
    logger.info(
      `send-monthly-digest: sent ${result.sent}/${result.recipients.length} digest emails.`
    )
  } catch (err: any) {
    logger.error(`send-monthly-digest: ${err?.message ?? err}`)
  }
}

export const config = {
  name: "send-monthly-digest",
  schedule: "0 22 2 * *",
}
