import { model } from "@medusajs/framework/utils"

export const ImportConfig = model.define("xml_import_config", {
  id: model.id().primaryKey(),
  name: model.text(),
  description: model.text().nullable(),
  xml_url: model.text(),
  mapping_id: model.text().index(),
  options: model.json(),
  recurring: model.json().nullable(),
  enabled: model.boolean().default(true),
  // created_at, updated_at, and deleted_at are automatically added by MedusaJS
})

