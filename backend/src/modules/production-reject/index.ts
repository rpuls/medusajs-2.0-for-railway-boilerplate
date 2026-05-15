import { Module } from "@medusajs/framework/utils"

import ProductionRejectModuleService from "./service"

export const PRODUCTION_REJECT_MODULE = "production_reject"

export default Module(PRODUCTION_REJECT_MODULE, {
  service: ProductionRejectModuleService,
})
