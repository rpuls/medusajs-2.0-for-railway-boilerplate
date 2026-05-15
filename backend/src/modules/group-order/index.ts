import { Module } from "@medusajs/framework/utils"

import GroupOrderModuleService from "./service"

export const GROUP_ORDER_MODULE = "group_order"

export default Module(GROUP_ORDER_MODULE, {
  service: GroupOrderModuleService,
})
