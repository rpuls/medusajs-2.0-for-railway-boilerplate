import { defineLink } from "@medusajs/framework/utils"
import OrderModule from "@medusajs/medusa/order"

import TaskModule from "../modules/task"

/**
 * One order has many tasks. `isList: true` on the order side.
 */
export default defineLink(
  OrderModule.linkable.order,
  {
    linkable: TaskModule.linkable.task,
    isList: true,
  }
)
