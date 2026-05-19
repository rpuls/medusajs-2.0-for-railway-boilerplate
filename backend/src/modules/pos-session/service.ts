import { MedusaService } from "@medusajs/framework/utils"

import POSSession from "./models/pos-session"

class POSSessionModuleService extends MedusaService({
  POSSession,
}) {}

export default POSSessionModuleService
