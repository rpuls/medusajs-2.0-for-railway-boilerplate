import { Module } from "@medusajs/framework/utils"

import AutomationRuleService from "./service"

export const AUTOMATION_RULE_MODULE = "automation_rule"

export default Module(AUTOMATION_RULE_MODULE, {
  service: AutomationRuleService,
})
