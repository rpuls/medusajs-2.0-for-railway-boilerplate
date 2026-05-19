import { model } from "@medusajs/framework/utils"

/**
 * Admin-managed rotation table for auto-assigning ownership of new
 * customers, orders, and quotes. Each row is one staff member who's
 * "in rotation". `pickNextOwner()` (see `lib/crm-owners.ts`) walks
 * rows in `position` order, prefers the one with the oldest
 * `last_picked_at`, then updates that row's `last_picked_at` to now.
 *
 * Toggling `enabled = false` removes a member from rotation without
 * losing their history (so re-enabling them later picks up where they
 * left off in the cycle).
 */
const CrmOwnerRotation = model
  .define("crm_owner_rotation", {
    id: model.id({ prefix: "crmrot" }).primaryKey(),
    user_id: model.text(),
    enabled: model.boolean().default(true),
    position: model.number().default(100),
    last_picked_at: model.dateTime().nullable(),
  })
  .indexes([
    { on: ["user_id"], unique: true },
    { on: ["enabled", "position"] },
  ])

export default CrmOwnerRotation
