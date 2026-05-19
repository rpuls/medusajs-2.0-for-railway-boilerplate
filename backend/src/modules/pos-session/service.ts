import { MedusaService } from "@medusajs/framework/utils"

import PosSessionModel from "./models/pos-session"

/**
 * Service-record key is `PosSession` (proper PascalCase, not the
 * acronym-heavy `POSSession`). Medusa's MedusaService factory uses
 * the key to derive method names — `lowerCaseFirstLetter(key) +
 * pluralize` — so this becomes `createPosSessions`, `listPosSessions`,
 * `retrievePosSession`, `updatePosSessions`. A key like `POSSession`
 * would have produced `pOSSessions` and broken every call site.
 */
class POSSessionModuleService extends MedusaService({
  PosSession: PosSessionModel,
}) {}

export default POSSessionModuleService
