import { Module } from "@medusajs/framework/utils"
import FashionBizService from "./service"

export const FASHIONBIZ_MODULE = "fashionbiz"

export default Module(FASHIONBIZ_MODULE, {
  service: FashionBizService,
})

export { FashionBizService }
export * from "./types"
