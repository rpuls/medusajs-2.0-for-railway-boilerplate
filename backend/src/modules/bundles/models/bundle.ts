import { model } from "@medusajs/framework/utils"

const Bundle = model
  .define("bundle", {
    id: model.id({ prefix: "bndl" }).primaryKey(),
    title: model.text(),
    handle: model.text(),
    subtitle: model.text().nullable(),
    status: model.text().default("active"),
    thumbnail_url: model.text().nullable(),
    quantity_multiplier_label: model.text().nullable(),
  })
  .indexes([
    { on: ["handle"], unique: true },
    { on: ["status"] },
  ])

export default Bundle
