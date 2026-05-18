import { model } from "@medusajs/framework/utils"

/**
 * A Stripe Payment Link admins generate for an existing order (or a quote
 * yet to convert) so the customer can pay a deposit, a balance, or the full
 * amount outside of the cart-checkout flow. Each row corresponds to one
 * Stripe Payment Link object.
 *
 * `stripe_link_id` is unique — used by the webhook handler to look up the
 * row when `checkout.session.completed` lands. `order_id`/`quote_id` are
 * the Medusa-side anchors (exactly one is set at creation time; for quote
 * rows, `order_id` is back-filled if the quote later converts).
 *
 * `status` lifecycle:
 *   open        — link created, not paid yet
 *   paid        — webhook received successful payment; payment_collection_id set
 *   deactivated — admin disabled the link before payment
 *   expired     — Stripe expired the link (we currently don't expire links)
 *
 * `amount` is stored in MAJOR units (e.g. 10.50 = $10.50). Mirrors how the
 * rest of the Medusa amount columns work; the Stripe integer-cents conversion
 * happens at the SDK boundary.
 */
const StripePaymentLink = model
  .define("stripe_payment_link", {
    id: model.id({ prefix: "spl" }).primaryKey(),
    stripe_link_id: model.text().unique(),
    stripe_payment_intent_id: model.text().nullable(),
    url: model.text(),
    order_id: model.text().nullable(),
    quote_id: model.text().nullable(),
    amount: model.bigNumber(),
    currency_code: model.text(),
    scenario: model.enum(["deposit", "balance", "quote", "manual", "full"]),
    label: model.text().nullable(),
    status: model
      .enum(["open", "paid", "deactivated", "expired"])
      .default("open"),
    paid_at: model.dateTime().nullable(),
    payment_collection_id: model.text().nullable(),
    created_by_user_id: model.text().nullable(),
    metadata: model.json().nullable(),
  })
  .indexes([{ on: ["order_id"] }, { on: ["quote_id"] }, { on: ["status"] }])

export default StripePaymentLink
