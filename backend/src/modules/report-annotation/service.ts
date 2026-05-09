import { MedusaService } from "@medusajs/framework/utils"

import ReportAnnotation from "./models/report-annotation"

class ReportAnnotationModuleService extends MedusaService({
  ReportAnnotation,
}) {}

export default ReportAnnotationModuleService
