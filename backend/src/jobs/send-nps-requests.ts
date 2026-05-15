import type { MedusaContainer } from "@medusajs/framework/types"

import { NPS_REQUESTS_ENABLED } from "../lib/constants"
import { sendNpsRequests } from "../services/nps-requests/send-requests"
import { withJobContext, getContextLogger } from "../lib/job-context-wrapper"

/**
 * Daily NPS-request pass at 22:00 UTC (~08:00 AEST). Asks for a
 * 1–5 rating N days after delivery. Per-order + per-customer
 * idempotency lives on metadata stamps. Opt-in via
 * `NPS_REQUESTS_ENABLED=true` — keeps the customer mailbox safe in
 * environments where dry-run hasn't been validated yet.
 */
const handler = async function sendNpsRequestsJob(container: MedusaContainer) {
  const logger = getContextLogger(container)
  if (!NPS_REQUESTS_ENABLED) {
    logger.info("send-nps-requests: NPS_REQUESTS_ENABLED not 'true' — skipping.")
    return
  }
  try {
    const result = await sendNpsRequests(container)
    logger.info(
      `send-nps-requests: considered=${result.considered}, sent=${result.sent}, failures=${result.failures}`
    )
  } catch (err: any) {
    logger.error(`send-nps-requests: ${err?.message ?? err}`)
  }
}

export default withJobContext(handler)

export const config = {
  name: "send-nps-requests",
  schedule: "0 22 * * *",
}
