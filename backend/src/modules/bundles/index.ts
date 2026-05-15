import { Module } from "@medusajs/framework/utils"

import BundlesModuleService from "./service"

export const BUNDLES_MODULE = "bundles"

export default Module(BUNDLES_MODULE, {
  service: BundlesModuleService,
})
