import { model } from "@medusajs/framework/utils"

const BottleShop = model
  .define("bottle_shop", {
    id: model.id({ prefix: "bsh" }).primaryKey(),
    name: model.text(),
    handle: model.text(),
    email: model.text().nullable(),
    contact_name: model.text().nullable(),
    phone: model.text().nullable(),
    address_line_1: model.text().nullable(),
    address_line_2: model.text().nullable(),
    city: model.text().nullable(),
    state: model.text().nullable(),
    postal_code: model.text().nullable(),
    country_code: model.text().nullable(),
    notes: model.text().nullable(),
    is_active: model.boolean().default(true),
    metadata: model.json().nullable(),
  })
  .indexes([
    { on: ["handle"], unique: true },
    { on: ["name"] },
  ])

export default BottleShop
