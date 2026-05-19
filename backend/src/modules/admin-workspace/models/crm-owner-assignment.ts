import { model } from "@medusajs/framework/utils"

/**
 * One canonical "X is owned by user_id Y" row per assignment.
 * Linked to a `customer` and/or `order` via Module Links (see
 * `backend/src/links/customer-owner.ts` and `order-owner.ts`).
 *
 * Why not put `owner_user_id` directly on the customer or order
 * record? Medusa core entities can't be extended in-place. Modeling
 * ownership as its own entity also gives a clean home for assignment
 * metadata (assigned_at, assigned_by, reason) without bloating the
 * core record.
 */
const CrmOwnerAssignment = model
  .define("crm_owner_assignment", {
    id: model.id({ prefix: "crmown" }).primaryKey(),
    user_id: model.text(),
    assigned_at: model.dateTime(),
    assigned_by: model.text().nullable(),
    reason: model.text().nullable(),
  })
  .indexes([{ on: ["user_id"] }])

export default CrmOwnerAssignment
