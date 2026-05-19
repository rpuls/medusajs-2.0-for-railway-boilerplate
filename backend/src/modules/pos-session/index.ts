import { Module } from "@medusajs/framework/utils"

import POSSessionModuleService from "./service"

export const POS_SESSION_MODULE = "pos_session"

export default Module(POS_SESSION_MODULE, {
  service: POSSessionModuleService,
})
