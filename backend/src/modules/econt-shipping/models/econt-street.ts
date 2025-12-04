import { model } from "@medusajs/framework/utils"

export const EcontStreet = model.define("econt_street", {
  id: model.id().primaryKey(),
  city_id: model.number().index(), // Reference to EcontCity.city_id
  name: model.text().index(),
  name_en: model.text().nullable(),
  // created_at, updated_at, and deleted_at are automatically added by MedusaJS
})

