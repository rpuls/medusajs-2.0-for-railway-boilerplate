import { model } from "@medusajs/framework/utils"

/**
 * Per-record activity trail. Populated by subscribers on key events
 * (order.production_stage_changed, etc.) and admin routes that take
 * action on behalf of an actor.
 *
 * `entity` + `entity_id` is the polymorphic foreign key. `action` is a
 * canonical verb ("stage_changed", "tag_added", "comment_posted").
 * `actor_id` + `actor_email` snapshot who did it. `details` is a JSON
 * payload for whatever the action requires (from / to stages, tag
 * label, comment body excerpt, etc).
 */
const AuditLog = model
  .define("audit_log", {
    id: model.id({ prefix: "aud" }).primaryKey(),
    entity: model.text(),
    entity_id: model.text(),
    action: model.text(),
    actor_id: model.text().nullable(),
    actor_email: model.text().nullable(),
    details: model.json().nullable(),
  })
  .indexes([{ on: ["entity", "entity_id"] }, { on: ["action"] }])

export default AuditLog
