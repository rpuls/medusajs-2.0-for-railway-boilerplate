import { model } from "@medusajs/framework/utils"

export const ImportExecutionLog = model.define("xml_import_execution_log", {
  id: model.id().primaryKey(),
  execution_id: model.text().index(),
  level: model.text(),
  message: model.text(),
  product_index: model.number().nullable(),
  product_data: model.json().nullable(),
  error: model.json().nullable(),
  timestamp: model.dateTime(),
  // created_at, updated_at, and deleted_at are automatically added by MedusaJS
})

