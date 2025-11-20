import { model } from "@medusajs/framework/utils"

export const FieldMapping = model.define("xml_import_mapping", {
  id: model.id().primaryKey(),
  name: model.text(),
  description: model.text().nullable(),
  xml_url: model.text().nullable(),
  mappings: model.json(),
  // created_at, updated_at, and deleted_at are automatically added by MedusaJS
})




