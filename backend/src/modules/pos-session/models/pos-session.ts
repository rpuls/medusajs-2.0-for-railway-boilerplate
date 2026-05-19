import { model } from "@medusajs/framework/utils"

/**
 * Temporary cart for an in-store walk-in transaction. Holds line items
 * (standard products + customizer-generated items) until the staff
 * member completes checkout. Lifetime ~4 hours, then auto-expired by
 * the daily housekeeping job.
 *
 * `items` is a JSON array of POSLineItem shapes:
 *   {
 *     id: string                  // ULID, used for delete
 *     kind: "standard" | "customizer"
 *     variant_id: string | null   // null only if `kind = customizer` with no variant
 *     product_id: string
 *     product_title: string
 *     variant_title: string | null
 *     quantity: number
 *     unit_price_cents: number    // optional override; null = use catalog price
 *     metadata: Record<string, unknown>  // CustomizerMetadata for customizer items
 *     added_at: string            // ISO timestamp
 *   }
 *
 * The customizer bridge writes new items here via POST
 * /admin/pos/sessions/:id/items (called from the storefront-side
 * /api/pos-bridge/items relay). The admin POS page polls
 * GET /admin/pos/sessions/:id every 2s to surface them in the cart UI.
 */
const POSSession = model
  .define("pos_session", {
    id: model.id({ prefix: "pos" }).primaryKey(),
    created_by_user_id: model.text(),
    customer_id: model.text().nullable(),
    // `model.json()` infers `Record<string, unknown>` — items is
    // logically an array, but Mikro stores it as JSONB which accepts
    // either shape. The cast lets the model declare an empty-array
    // default while routes/service code treat it as POSLineItem[].
    items: model.json().default([] as unknown as Record<string, unknown>),
    status: model
      .enum(["active", "completed", "cancelled", "expired"])
      .default("active"),
    completed_order_id: model.text().nullable(),
    expires_at: model.dateTime(),
    metadata: model.json().default({}),
  })
  .indexes([
    { on: ["created_by_user_id"] },
    { on: ["status"] },
    { on: ["expires_at"] },
  ])

export default POSSession
