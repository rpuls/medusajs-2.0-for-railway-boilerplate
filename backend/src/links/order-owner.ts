import { defineLink } from "@medusajs/framework/utils"
import OrderModule from "@medusajs/medusa/order"

import AdminWorkspaceModule from "../modules/admin-workspace"

/**
 * One order can have at most one owner assignment row. `isList: false`
 * on both sides — the assignment is a singleton per order.
 *
 * Run `npx medusa db:sync-links` after adding/changing this file so the
 * link table is materialised in Postgres.
 */
export default defineLink(
  OrderModule.linkable.order,
  {
    linkable: AdminWorkspaceModule.linkable.crmOwnerAssignment,
    isList: false,
  }
)
