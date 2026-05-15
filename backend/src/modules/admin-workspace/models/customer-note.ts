import { model } from "@medusajs/framework/utils"

/**
 * Internal staff-only note pinned to a customer. The institutional
 * memory most teams keep in Slack DMs: "prefers chunky satin stitch
 * on embroidery", "always provides AI files, never PDF", "wholesale
 * account — give priority", "tricky to please, double-check colours".
 *
 * Surfaced on the customer detail page admin widget.
 */
const CustomerNote = model
  .define("customer_note", {
    id: model.id({ prefix: "cnote" }).primaryKey(),
    customer_id: model.text(),
    body: model.text(),
    pinned: model.boolean().default(false),
    /** Optional follow-up reminder. While `snooze_until` is in the
     *  future the note is dimmed in the UI; once the date passes the
     *  Studio dashboard surfaces it as a "snooze due" task. */
    snooze_until: model.dateTime().nullable(),
    created_by: model.text().nullable(),
  })
  .indexes([{ on: ["customer_id"] }, { on: ["snooze_until"] }])

export default CustomerNote
