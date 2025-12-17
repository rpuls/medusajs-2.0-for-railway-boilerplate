import { model } from "@medusajs/framework/utils"

export const ScheduledNotification = model.define("scheduled_notification", {
  id: model.id().primaryKey(),
  title: model.text(),
  body: model.text(),
  icon: model.text().nullable(),
  badge: model.text().nullable(),
  image: model.text().nullable(),
  data: model.json().nullable(), // Additional data payload
  scheduled_at: model.dateTime().nullable(), // When to send (null = send immediately) - index created in migration
  sent_at: model.dateTime().nullable(),
  status: model.text().index().default("pending"), // pending, sent, failed, cancelled
  target_type: model.text().index(), // "user" or "broadcast"
  target_user_ids: model.json().nullable(), // Array of user IDs for user-specific notifications
  // created_at, updated_at are automatically added by MedusaJS
})

