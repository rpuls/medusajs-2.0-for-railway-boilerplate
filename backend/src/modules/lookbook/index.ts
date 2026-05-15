import { Module } from "@medusajs/framework/utils"

import LookbookModuleService from "./service"

export const LOOKBOOK_MODULE = "lookbook"

export default Module(LOOKBOOK_MODULE, {
  service: LookbookModuleService,
})
