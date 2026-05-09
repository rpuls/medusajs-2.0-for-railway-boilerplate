import { Module } from "@medusajs/framework/utils"

import ReportAlertModuleService from "./service"

export const REPORT_ALERT_MODULE = "report_alert"

export default Module(REPORT_ALERT_MODULE, {
  service: ReportAlertModuleService,
})
