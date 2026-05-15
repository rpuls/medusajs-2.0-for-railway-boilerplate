import { model } from "@medusajs/framework/utils"

/**
 * Link between an organisation and a customer. One customer can
 * belong to multiple organisations (e.g. a parent at two different
 * schools). Roles:
 *   - owner: can manage members and org settings
 *   - purchaser: can place orders against the org
 *   - viewer: read-only access to org orders
 */
const OrganisationMember = model
  .define("organisation_member", {
    id: model.id({ prefix: "orgm" }).primaryKey(),
    organisation_id: model.text(),
    customer_id: model.text(),
    role: model.enum(["owner", "purchaser", "viewer"]).default("purchaser"),
    invited_by: model.text().nullable(),
    accepted_at: model.dateTime().nullable(),
  })
  .indexes([
    { on: ["organisation_id"] },
    { on: ["customer_id"] },
    { on: ["organisation_id", "customer_id"], unique: true },
  ])

export default OrganisationMember
