import { MedusaService } from "@medusajs/framework/utils"

import Task from "./models/task"

class TaskModuleService extends MedusaService({
  Task,
}) {}

export default TaskModuleService
