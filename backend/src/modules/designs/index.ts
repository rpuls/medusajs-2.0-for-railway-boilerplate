import { Module } from "@medusajs/framework/utils"

import DesignsModuleService from "./service"

export const DESIGNS_MODULE = "designs"

export default Module(DESIGNS_MODULE, {
  service: DesignsModuleService,
})
