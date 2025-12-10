import { Module } from "@medusajs/framework/utils"
import BrandModuleService from "./service"
import { Brand } from "./models/brand"

export const BRAND_MODULE = "brand"

const moduleDefinition = Module(BRAND_MODULE, {
  service: BrandModuleService,
  linkable: {
    brand: Brand,
  },
} as any)

export default moduleDefinition

