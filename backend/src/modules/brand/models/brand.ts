import { model } from "@medusajs/framework/utils"

const Brand = model
  .define("brand", {
    id: model.id({ prefix: "brand" }).primaryKey(),
    name: model.text(),
    handle: model.text(),
    description: model.text().nullable(),
    logo_url: model.text().nullable(),
    external_code: model.text().nullable(),
    parent_id: model.text().nullable(),
    is_active: model.boolean().default(true),
    metadata: model.json().nullable(),
  })
  .indexes([
    { on: ["handle"], unique: true },
    { on: ["name"] },
    { on: ["parent_id"] },
    { on: ["external_code"] },
  ])

export default Brand
