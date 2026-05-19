import { MedusaService } from "@medusajs/framework/utils"

import BottleShop from "./models/bottle-shop"

class BottleShopModuleService extends MedusaService({
  BottleShop,
}) {}

export default BottleShopModuleService
