import { model } from "@medusajs/framework/utils"

/**
 * Per-user pinned filter preset. e.g. "My open orders this week",
 * "Embroidery in QC", "AS Colour blanks pending". Surfaces as
 * one-click chips in the orders list / production page.
 *
 * `target` is the route the bookmark applies to ("orders",
 * "production", "reports"). `query` is the URL query string with
 * filters baked in.
 */
const AdminBookmark = model
  .define("admin_bookmark", {
    id: model.id({ prefix: "bkmk" }).primaryKey(),
    user_id: model.text(),
    target: model.text(),
    label: model.text(),
    query: model.text(),
    /** Lower numbers sort first; tie-break by created_at. */
    sort_order: model.number().default(100),
  })
  .indexes([{ on: ["user_id", "target"] }])

export default AdminBookmark
