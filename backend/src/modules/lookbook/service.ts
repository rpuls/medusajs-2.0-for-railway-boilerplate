import { MedusaService } from "@medusajs/framework/utils"

import LookbookItem from "./models/lookbook-item"

class LookbookModuleService extends MedusaService({
  LookbookItem,
}) {}

export default LookbookModuleService
