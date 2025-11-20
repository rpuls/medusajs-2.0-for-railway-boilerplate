import { MedusaRequest } from "@medusajs/framework"
import XmlProductImporterService from "../../../modules/xml-product-importer/service"
import { XML_PRODUCT_IMPORTER_MODULE } from "../../../modules/xml-product-importer"

/**
 * Get XML Product Importer service from MedusaJS container
 * Uses MedusaJS model system for data persistence
 */
export function getService(req: MedusaRequest): XmlProductImporterService {
  return req.scope.resolve(XML_PRODUCT_IMPORTER_MODULE) as XmlProductImporterService
}

