import { model } from "@medusajs/framework/utils"

/**
 * A Quote represents a sales opportunity that started life as a BYO
 * inquiry, a contact-form quote request, or an admin-created lead.
 * The pipeline statuses are intentionally close to a Kanban (`new` →
 * `quoted` → `accepted` / `lost`) so staff can move it left/right with
 * a single click; the more granular events (assignment changes,
 * messages, status changes) live in `quote_event` rows.
 *
 * `line_items` is a freeform JSON shape (title, description, qty,
 * unit_price, total) rather than a relational table because the lines
 * are operator-edited until acceptance — at which point we'd hand off
 * to a real Medusa cart or order. Keeps the data model light.
 */
const Quote = model
  .define("quote", {
    id: model.id({ prefix: "qt" }).primaryKey(),
    public_id: model.text(),
    status: model.enum([
      "new",
      "quoted",
      "accepted",
      "lost",
      "expired",
    ]).default("new"),
    source: model.enum(["byo", "contact", "admin"]).default("byo"),
    customer_id: model.text().nullable(),
    email: model.text(),
    contact_name: model.text().nullable(),
    contact_phone: model.text().nullable(),
    company: model.text().nullable(),
    subject: model.text().nullable(),
    message: model.text().nullable(),
    assigned_to: model.text().nullable(),
    currency_code: model.text().default("aud"),
    total_estimate: model.bigNumber().nullable(),
    // line_items is a JSON blob shaped as `{ items: Array<...> }` at runtime —
    // Medusa's `model.json()` infers `Record<string, unknown>`, so we wrap the
    // array in an object to keep the type and the default in agreement.
    line_items: model.json().default({}),
    metadata: model.json().default({}),
    expires_at: model.dateTime().nullable(),
    quoted_at: model.dateTime().nullable(),
    accepted_at: model.dateTime().nullable(),
    lost_at: model.dateTime().nullable(),
  })
  .indexes([
    { on: ["status"] },
    { on: ["customer_id"] },
    { on: ["assigned_to"] },
    { on: ["public_id"], unique: true },
  ])

export default Quote
