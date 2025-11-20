import XmlProductImporterService from "./service-refactored"
import { Module } from "@medusajs/framework/utils"

export const XML_PRODUCT_IMPORTER_MODULE = "xmlProductImporter"

export default Module(XML_PRODUCT_IMPORTER_MODULE, {
  service: XmlProductImporterService,
})




