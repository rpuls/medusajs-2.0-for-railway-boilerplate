import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { ABANDONED_CART_REMINDERS_ENABLED } from "../lib/constants"
import { sendAbandonedCartReminders } from "../services/abandoned-cart-reminders/send-reminders"

/**
 * Daily abandoned-cart reminder pass at 23:15 UTC (≈ 09:15 AEST). Only
 * runs when ABANDONED_CART_REMINDERS_ENABLED=true is set explicitly —
 * opt-in because this writes to customer inboxes and dry-running the
 * candidate list against prod before going live is essential.
 *
 * Idempotency lives on `abandoned_cart_followups.reminder_sent_at` —
 * once a row is stamped, it's never reconsidered.
 *
 * Consent gating: candidates are filtered out when the matching
 * customer has `marketing_consent_email = false`. Guests (no customer
 * record) are still messaged — they haven't had a chance to opt out.
 */
export default async function sendAbandonedCartRemindersJob(
  container: MedusaContainer
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (!ABANDONED_CART_REMINDERS_ENABLED) {
    logger.info(
      "send-abandoned-cart-reminders: ABANDONED_CART_REMINDERS_ENABLED not 'true' — skipping."
    )
    return
  }
  try {
    const result = await sendAbandonedCartReminders(container)
    logger.info(
      `send-abandoned-cart-reminders: considered=${result.considered}, sent=${result.sent}, failures=${result.failures}`
    )
  } catch (err: any) {
    logger.error(`send-abandoned-cart-reminders: ${err?.message ?? err}`)
  }
}

export const config = {
  name: "send-abandoned-cart-reminders",
  schedule: "15 23 * * *",
}
