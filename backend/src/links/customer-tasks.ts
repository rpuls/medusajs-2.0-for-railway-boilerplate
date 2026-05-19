import { defineLink } from "@medusajs/framework/utils"
import CustomerModule from "@medusajs/medusa/customer"

import TaskModule from "../modules/task"

/**
 * One customer has many tasks. `isList: true` on the customer side
 * (one customer → many task rows). The denormalised `customer_id`
 * column on `task` still drives the hot-path filter ("my open tasks
 * where customer_id = X") — the link adds graph-query traversal
 * (`customer.tasks`) for admin UIs.
 *
 * Run `npx medusa db:sync-links` after adding/changing this file.
 */
export default defineLink(
  CustomerModule.linkable.customer,
  {
    linkable: TaskModule.linkable.task,
    isList: true,
  }
)
