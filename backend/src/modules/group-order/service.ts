import { MedusaService } from "@medusajs/framework/utils"

import GroupOrder from "./models/group-order"
import GroupOrderParticipant from "./models/group-order-participant"

class GroupOrderModuleService extends MedusaService({
  GroupOrder,
  GroupOrderParticipant,
}) {}

export default GroupOrderModuleService
