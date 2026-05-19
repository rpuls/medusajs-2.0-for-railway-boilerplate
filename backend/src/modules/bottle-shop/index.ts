import { Module } from "@medusajs/framework/utils"

import BottleShopModuleService from "./service"

export const BOTTLE_SHOP_MODULE = "bottle_shop"

export default Module(BOTTLE_SHOP_MODULE, {
  service: BottleShopModuleService,
})
