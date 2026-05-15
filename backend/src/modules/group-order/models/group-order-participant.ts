import { model } from "@medusajs/framework/utils"

/**
 * One row per "I want one of these" submission. Free-text size_label
 * (rather than a variant_id) so coaches don't have to know the
 * underlying SKU shape — the owner maps these to real variants when
 * converting to cart.
 */
const GroupOrderParticipant = model
  .define("group_order_participant", {
    id: model.id({ prefix: "gop" }).primaryKey(),
    group_order_id: model.text(),
    name: model.text(),
    size_label: model.text(),
    quantity: model.number().default(1),
    /** Optional. Some sports use names + numbers per garment. */
    player_number: model.text().nullable(),
    custom_notes: model.text().nullable(),
    submitter_email: model.text().nullable(),
  })
  .indexes([{ on: ["group_order_id"] }])

export default GroupOrderParticipant
