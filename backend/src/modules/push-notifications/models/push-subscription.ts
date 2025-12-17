import { model } from "@medusajs/framework/utils"

export const PushSubscription = model.define("push_subscription", {
  id: model.id().primaryKey(),
  user_id: model.text().nullable(), // Customer ID if authenticated, null for anonymous - index created in migration
  endpoint: model.text().index(), // Push subscription endpoint URL
  keys: model.json(), // { p256dh: string, auth: string }
  device_info: model.json().nullable(), // { type, browser, os, model }
  // created_at, updated_at, and deleted_at are automatically added by MedusaJS
})

