import { model } from "@medusajs/framework/utils"

export const VapidKeys = model.define("vapid_keys", {
  id: model.id().primaryKey(),
  public_key: model.text(),
  private_key: model.text(),
  subject: model.text(), // Email address (e.g., mailto:admin@example.com)
  // created_at, updated_at are automatically added by MedusaJS
})

