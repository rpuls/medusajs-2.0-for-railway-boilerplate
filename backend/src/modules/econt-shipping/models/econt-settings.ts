import { model } from "@medusajs/framework/utils"

export const EcontSettings = model.define("econt_settings", {
  id: model.id().primaryKey(),
  // API Credentials
  username: model.text(),
  password: model.text(),
  live: model.boolean().default(false), // true for production, false for test
  
  // Sender Configuration
  sender_type: model.text().default("OFFICE"), // "OFFICE" or "ADDRESS"
  sender_city: model.text(),
  sender_post_code: model.text(),
  
  // Sender Office (if sender_type = "OFFICE")
  sender_office_code: model.text().nullable(),
  
  // Sender Address (if sender_type = "ADDRESS")
  sender_street: model.text().nullable(),
  sender_street_num: model.text().nullable(),
  sender_quarter: model.text().nullable(),
  sender_building_num: model.text().nullable(),
  sender_entrance_num: model.text().nullable(),
  sender_floor_num: model.text().nullable(),
  sender_apartment_num: model.text().nullable(),
  
  // created_at, updated_at, and deleted_at are automatically added by MedusaJS
})


