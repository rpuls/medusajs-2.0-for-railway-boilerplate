import { MedusaService } from "@medusajs/framework/utils"

import AutomationRule from "./models/automation-rule"

class AutomationRuleService extends MedusaService({
  AutomationRule,
}) {}

export default AutomationRuleService
