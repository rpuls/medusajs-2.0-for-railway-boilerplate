import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { XML_PRODUCT_IMPORTER_MODULE } from '../../../../modules/xml-product-importer'
import XmlProductImporterService from '../../../../modules/xml-product-importer/service'

/**
 * POST /admin/xml-importer/analyze-xml
 * Analyze XML structure and return available fields
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { xmlUrl } = req.body as { xmlUrl?: string }

    if (!xmlUrl) {
      res.status(400).json({ message: 'xmlUrl is required' })
      return
    }

    const importerService: XmlProductImporterService = req.scope.resolve(
      XML_PRODUCT_IMPORTER_MODULE
    )

    const validation = await importerService.validateXmlUrl(xmlUrl)

    if (!validation.valid || !validation.content) {
      res.status(400).json({
        valid: false,
        error: validation.error || 'Failed to fetch XML',
      })
      return
    }

    // Parse XML to get structure
    const xmlData = importerService.parseXml(validation.content)
    const products = importerService.extractProducts(xmlData)

    // Extract fields from sample product
    const sampleProduct = products[0] || {}
    const fields = extractFields(sampleProduct)

    res.json({
      valid: true,
      productCount: products.length,
      sampleData: sampleProduct,
      fields: fields,
      structure: sampleProduct,
    })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

function extractFields(obj: any, prefix = '', fields: string[] = []): string[] {
  if (Array.isArray(obj) && obj.length > 0) {
    return extractFields(obj[0], prefix, fields)
  }

  if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach((key) => {
      const path = prefix ? `${prefix}.${key}` : key
      fields.push(path)
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        extractFields(obj[key], path, fields)
      }
    })
  }

  return fields
}

