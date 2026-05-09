import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { sendReorderReminders } from "../services/reorder-reminders/send-reminders"

const REORDER_REMINDERS_ENABLED =
  String(process.env.REORDER_REMINDERS_ENABLED).toLowerCase() === "true"

/**
 * Daily reorder-reminder pass at 23:30 UTC (≈ 09:30 / 10:30 AEST). Only
 * runs when `REORDER_REMINDERS_ENABLED=true` is explicitly set — opt-in
 * because this writes to the customer mailbox and the algorithm wants
 * eyes-on calibration before going live.
 *
 * Idempotency lives in `customer.metadata.last_reorder_reminder_sent_at`
 * — the candidate builder skips anyone reminded within their median
 * gap, so re-running the job within a day is a no-op.
 */
export default async function sendReorderRemindersJob(
  container: MedusaContainer
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (!REORDER_REMINDERS_ENABLED) {
    logger.info(
      "send-reorder-reminders: REORDER_REMINDERS_ENABLED not 'true' — skipping."
    )
    return
  }
  try {
    const result = await sendReorderReminders(container)
    logger.info(
      `send-reorder-reminders: considered=${result.considered}, sent=${result.sent}, failures=${result.failures}`
    )
  } catch (err: any) {
    logger.error(`send-reorder-reminders: ${err?.message ?? err}`)
  }
}

export const config = {
  name: "send-reorder-reminders",
  schedule: "30 23 * * *",
}
