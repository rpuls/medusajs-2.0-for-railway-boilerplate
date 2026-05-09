import { model } from "@medusajs/framework/utils"

/**
 * Staff-only comment thread per order. Beats Slack permalinks because
 * the conversation lives where the work does — comments stay attached
 * to the order forever and surface for whoever picks it up next.
 *
 * @mentions are stored as plain text "@email" in the body; the admin
 * UI parses and styles them client-side. Real notification routing
 * (e.g. emailing the @mentioned user) is a follow-up.
 */
const OrderComment = model
  .define("order_comment", {
    id: model.id({ prefix: "ocom" }).primaryKey(),
    order_id: model.text(),
    body: model.text(),
    created_by: model.text().nullable(),
  })
  .indexes([{ on: ["order_id"] }])

export default OrderComment
