import { model } from "@medusajs/framework/utils"

/**
 * Operator-managed tag pinned to a customer. e.g. "VIP", "Tricky",
 * "Wholesale", "Photographer", "Embroidery-only".
 *
 * Stored as a free-form `label` so the team can invent new tags
 * without a code change. Surfaced as small badges in the order list
 * and customer detail page.
 */
const CustomerTag = model
  .define("customer_tag", {
    id: model.id({ prefix: "ctag" }).primaryKey(),
    customer_id: model.text(),
    label: model.text(),
    /** One of slate / teal / amber / rose / emerald — visual only. */
    color: model.text().default("slate"),
    created_by: model.text().nullable(),
  })
  .indexes([{ on: ["customer_id"] }])

export default CustomerTag
