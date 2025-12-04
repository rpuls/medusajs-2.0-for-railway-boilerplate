import { model } from "@medusajs/framework/utils"

export const EcontOffice = model.define("econt_office", {
  id: model.id().primaryKey(),
  office_code: model.text().index(), // Econt's office code
  name: model.text(),
  name_en: model.text().nullable(),
  address: model.text(),
  address_en: model.text().nullable(),
  city_id: model.number().index(), // Reference to EcontCity.city_id
  city_name: model.text(),
  post_code: model.text(),
  phone: model.text().nullable(),
  working_time: model.text().nullable(),
  working_time_saturday: model.text().nullable(),
  working_time_sunday: model.text().nullable(),
  latitude: model.number().nullable(), // For map display (decimal degrees)
  longitude: model.number().nullable(), // For map display (decimal degrees)
  is_machine: model.boolean().default(false), // APS (Automatic Postal Station)
  // created_at, updated_at, and deleted_at are automatically added by MedusaJS
})

