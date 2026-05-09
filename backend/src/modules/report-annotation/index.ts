import { Module } from "@medusajs/framework/utils"

import ReportAnnotationModuleService from "./service"

export const REPORT_ANNOTATION_MODULE = "report_annotation"

export default Module(REPORT_ANNOTATION_MODULE, {
  service: ReportAnnotationModuleService,
})
