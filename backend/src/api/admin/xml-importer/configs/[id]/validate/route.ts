import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { XML_PRODUCT_IMPORTER_MODULE } from '../../../../../../modules/xml-product-importer'
import XmlProductImporterService from '../../../../../../modules/xml-product-importer/service'

/**
 * POST /admin/xml-importer/configs/:id/validate
 * Validate XML URL and preview structure
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const { xmlUrl } = req.body as { xmlUrl?: string }

    if (!xmlUrl) {
      res.status(400).json({ message: 'xmlUrl is required' })
      return
    }

    const importerService: XmlProductImporterService = req.scope.resolve(
      XML_PRODUCT_IMPORTER_MODULE
    )

    const validation = await importerService.validateXmlUrl(xmlUrl)

    if (!validation.valid) {
      res.status(400).json({
        valid: false,
        error: validation.error,
      })
      return
    }

    // Parse XML to get structure preview
    const xmlData = importerService.parseXml(validation.content!)
    const products = importerService.extractProducts(xmlData)

    res.json({
      valid: true,
      productCount: products.length,
      sampleStructure: products[0] || null,
      message: `Found ${products.length} products in XML`,
    })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

