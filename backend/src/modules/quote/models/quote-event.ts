import { model } from "@medusajs/framework/utils"

/**
 * Append-only audit log for a Quote. Captures status transitions,
 * assignment changes, message activity, and ad-hoc operator notes.
 * Body is freeform JSON to keep new event types backwards compatible.
 */
const QuoteEvent = model
  .define("quote_event", {
    id: model.id({ prefix: "qte" }).primaryKey(),
    quote_id: model.text(),
    type: model.enum([
      "created",
      "status_changed",
      "assigned",
      "message",
      "note",
      "line_items_updated",
    ]),
    actor: model.text().nullable(),
    body: model.json().default({}),
    // body type is freeform JSON; default `{}` keeps the inferred
    // `Record<string, unknown>` happy.
  })
  .indexes([{ on: ["quote_id"] }, { on: ["type"] }])

export default QuoteEvent
