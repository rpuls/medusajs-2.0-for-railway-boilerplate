import { model } from "@medusajs/framework/utils"

const BundleItem = model
  .define("bundle_item", {
    id: model.id({ prefix: "bndi" }).primaryKey(),
    bundle_id: model.text(),
    product_handle: model.text(),
    label: model.text(),
    quantity_per_unit: model.number().default(1),
    decoration_type: model.text().default("embroidery"),
    position: model.number().default(0),
  })
  .indexes([
    { on: ["bundle_id"] },
    { on: ["bundle_id", "position"] },
  ])

export default BundleItem
