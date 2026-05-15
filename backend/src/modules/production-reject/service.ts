import { MedusaService } from "@medusajs/framework/utils"

import ProductionReject from "./models/production-reject"

class ProductionRejectModuleService extends MedusaService({
  ProductionReject,
}) {}

export default ProductionRejectModuleService
