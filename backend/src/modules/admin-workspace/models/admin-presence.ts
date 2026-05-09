import { model } from "@medusajs/framework/utils"

/**
 * Lightweight "who's looking at this" presence record. Each row =
 * (user, target_entity, entity_id, last_heartbeat_at). The frontend
 * heartbeats every 20s while a user has the order page open; the
 * orders list polls a summary endpoint that returns "presence in last
 * 60 seconds" so it can show a small avatar pill on each order being
 * actively viewed.
 *
 * Stale rows (>5 min since last_heartbeat_at) are ignored at read
 * time. A periodic cron prunes them — but since rows are bounded
 * (one per user × order being viewed), the table doesn't grow large
 * even without pruning.
 */
const AdminPresence = model
  .define("admin_presence", {
    id: model.id({ prefix: "pres" }).primaryKey(),
    user_id: model.text(),
    user_email: model.text().nullable(),
    entity: model.text(),
    entity_id: model.text(),
    last_heartbeat_at: model.text(),
  })
  .indexes([
    { on: ["entity", "entity_id"] },
    { on: ["user_id"] },
  ])

export default AdminPresence
