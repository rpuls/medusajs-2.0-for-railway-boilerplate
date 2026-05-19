import { defineLink } from "@medusajs/framework/utils"

import OrganisationModule from "../modules/organisation"
import TaskModule from "../modules/task"

/**
 * One organisation has many tasks. `isList: true` on the org side.
 */
export default defineLink(
  OrganisationModule.linkable.organisation,
  {
    linkable: TaskModule.linkable.task,
    isList: true,
  }
)
