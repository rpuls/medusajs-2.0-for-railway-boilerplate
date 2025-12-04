import { model } from "@medusajs/framework/utils"

export const EcontShipment = model.define("econt_shipment", {
  id: model.id().primaryKey(),
  order_id: model.text().index(), // MedusaJS order ID
  loading_num: model.text().index(), // Econt waybill number
  loading_id: model.text().nullable(),
  pdf_url: model.text().nullable(),
  is_imported: model.boolean().default(false),
  status: model.text().nullable(),
  tracking_data: model.json().nullable(), // Full tracking information
  // created_at, updated_at, and deleted_at are automatically added by MedusaJS
})

