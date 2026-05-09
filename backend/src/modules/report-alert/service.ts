import { MedusaService } from "@medusajs/framework/utils"

import ReportAlert from "./models/report-alert"

class ReportAlertModuleService extends MedusaService({
  ReportAlert,
}) {}

export default ReportAlertModuleService
