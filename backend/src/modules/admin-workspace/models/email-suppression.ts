import { model } from "@medusajs/framework/utils"

/**
 * Marketing-email suppression list — the hard kill-switch by email
 * address. Guests (no customer record) need to be able to unsubscribe
 * too, so this is a standalone table rather than `customer.metadata`.
 *
 * `template_kind` semantics:
 *   - `null` = global unsubscribe; blocks every marketing template
 *   - any other value = per-stream unsubscribe (e.g. "winback")
 *
 * A single email can have multiple rows (e.g. global + per-stream
 * after the customer toggles streams individually). The
 * `shouldSendMarketingEmail()` helper short-circuits on any matching
 * row.
 */
const EmailSuppression = model
  .define("email_suppression", {
    id: model.id({ prefix: "esup" }).primaryKey(),
    email: model.text(),
    reason: model
      .enum(["user_unsubscribe", "bounce", "spam_complaint", "manual_admin"])
      .default("user_unsubscribe"),
    template_kind: model.text().nullable(),
    source: model.text().nullable(),
    notes: model.text().nullable(),
  })
  .indexes([
    { on: ["email"] },
    { on: ["email", "template_kind"], unique: true },
  ])

export default EmailSuppression
