import { model } from "@medusajs/framework/utils"

/**
 * Stripe-event idempotency table. Stripe retries webhook deliveries on any
 * non-2xx response, so the handler inserts the event ID at the top of every
 * request and short-circuits on the resulting unique-key violation. One row
 * per Stripe `evt_*` ID we've successfully processed.
 *
 * Kept deliberately tiny — no FK to stripe_payment_link, no JSON payload.
 * Retention can be GC'd to ~30 days; Stripe stops retrying long before that.
 */
const StripePaymentLinkEvent = model.define("stripe_payment_link_event", {
  id: model.text().primaryKey(),
  event_type: model.text(),
})

export default StripePaymentLinkEvent
