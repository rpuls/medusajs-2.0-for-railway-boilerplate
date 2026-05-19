import { model } from "@medusajs/framework/utils"

/**
 * Resend webhook idempotency table. Each `svix-id` (Resend uses Svix
 * for signing) is inserted on first receipt; subsequent retries
 * short-circuit on the unique-PK conflict so we don't double-process
 * bounce / spam-complaint events.
 *
 * Mirrors `stripe_payment_link_event` — tiny by design. Retention can
 * be GC'd to ~30 days; Resend stops retrying long before that.
 */
const ResendEvent = model.define("resend_event", {
  id: model.text().primaryKey(),
  event_type: model.text(),
})

export default ResendEvent
