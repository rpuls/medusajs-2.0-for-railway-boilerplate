import { model } from "@medusajs/framework/utils"

export const EcontCity = model.define("econt_city", {
  id: model.id().primaryKey(),
  city_id: model.number().index(), // Econt's city ID
  post_code: model.text().index(),
  type: model.text(), // 'гр.' or 'с.' (city or village)
  name: model.text().index(),
  name_en: model.text().nullable(),
  region: model.text().nullable(),
  region_en: model.text().nullable(),
  zone_id: model.number().default(3), // Zone B
  country_id: model.number().default(1033), // Bulgaria
  office_id: model.number().default(0), // Main office
  country_code: model.text().default("BG"),
  // created_at, updated_at, and deleted_at are automatically added by MedusaJS
})

