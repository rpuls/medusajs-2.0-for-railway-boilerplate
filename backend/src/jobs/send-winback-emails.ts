import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { WINBACK_EMAILS_ENABLED } from "../lib/constants"
import { sendWinbackEmails } from "../services/churn-queue/send-winback"

/**
 * Weekly win-back pass — Mondays 00:00 UTC (~10:00 AEST). Pings
 * customers whose typical reorder cadence has been exceeded by ≥ 2×
 * via the existing `services/churn-queue` pipeline. Each customer is
 * eligible at most once every 90 days (enforced by build-queue).
 *
 * Idempotency: stamped onto `customer.metadata.last_winback_sent_at`
 * after a successful send.
 *
 * Consent gating: build-queue.ts filters out customers with
 * `marketing_consent_email = false`. Customers with consent unset
 * (legacy) are still eligible.
 */
export default async function sendWinbackEmailsJob(
  container: MedusaContainer
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (!WINBACK_EMAILS_ENABLED) {
    logger.info(
      "send-winback-emails: WINBACK_EMAILS_ENABLED not 'true' — skipping."
    )
    return
  }
  try {
    const result = await sendWinbackEmails(container)
    logger.info(
      `send-winback-emails: considered=${result.considered}, sent=${result.sent}, failures=${result.failures}`
    )
  } catch (err: any) {
    logger.error(`send-winback-emails: ${err?.message ?? err}`)
  }
}

export const config = {
  name: "send-winback-emails",
  schedule: "0 0 * * 1",
}
