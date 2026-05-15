import { MedusaService } from "@medusajs/framework/utils"

import Design from "./models/design"
import DesignVersion from "./models/design-version"

class DesignsModuleService extends MedusaService({
  Design,
  DesignVersion,
}) {}

export default DesignsModuleService
