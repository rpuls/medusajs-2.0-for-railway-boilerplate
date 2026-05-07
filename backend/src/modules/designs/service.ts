import { MedusaService } from "@medusajs/framework/utils"

import Design from "./models/design"

class DesignsModuleService extends MedusaService({
  Design,
}) {}

export default DesignsModuleService
