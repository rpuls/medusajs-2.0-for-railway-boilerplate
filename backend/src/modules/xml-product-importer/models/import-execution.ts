import { model } from "@medusajs/framework/utils"

export const ImportExecution = model.define("xml_import_execution", {
  id: model.id().primaryKey(),
  config_id: model.text().index(),
  status: model.text().index(),
  started_at: model.dateTime().index(),
  completed_at: model.dateTime().nullable(),
  total_products: model.number().nullable(),
  processed_products: model.number().default(0),
  successful_products: model.number().default(0),
  failed_products: model.number().default(0),
  error: model.text().nullable(),
  // created_at, updated_at, and deleted_at are automatically added by MedusaJS
})

