import { Module } from "@medusajs/framework/utils"

import TaskModuleService from "./service"

export const TASK_MODULE = "task"

export default Module(TASK_MODULE, {
  service: TaskModuleService,
})
