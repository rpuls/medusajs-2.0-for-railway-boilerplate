import { Module } from "@medusajs/framework/utils"

import SearchLogModuleService from "./service"

export const SEARCH_LOG_MODULE = "search_log"

export default Module(SEARCH_LOG_MODULE, {
  service: SearchLogModuleService,
})
