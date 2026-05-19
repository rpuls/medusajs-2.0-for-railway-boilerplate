import { defineLink } from "@medusajs/framework/utils"
import CustomerModule from "@medusajs/medusa/customer"

import AdminWorkspaceModule from "../modules/admin-workspace"

/**
 * One customer can have at most one owner assignment row. `isList: false`
 * on both sides — the link table holds one entry per (customer,
 * assignment) pair, and the assignment itself is a singleton for the
 * customer.
 *
 * Run `npx medusa db:sync-links` after adding/changing this file so the
 * link table is materialised in Postgres.
 */
export default defineLink(
  CustomerModule.linkable.customer,
  {
    linkable: AdminWorkspaceModule.linkable.crmOwnerAssignment,
    isList: false,
  }
)
