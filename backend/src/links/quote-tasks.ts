import { defineLink } from "@medusajs/framework/utils"

import QuoteModule from "../modules/quote"
import TaskModule from "../modules/task"

/**
 * One quote has many tasks. `isList: true` on the quote side.
 */
export default defineLink(
  QuoteModule.linkable.quote,
  {
    linkable: TaskModule.linkable.task,
    isList: true,
  }
)
