import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { XML_PRODUCT_IMPORTER_MODULE } from '../../../../../modules/xml-product-importer'
import XmlProductImporterService from '../../../../../modules/xml-product-importer/service'
import { PreviewRequest } from '../../../../../modules/xml-product-importer/types'

/**
 * POST /admin/xml-importer/field-mapping/preview
 * Preview field mapping output with sample XML data
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const body = req.body as PreviewRequest

    if (!body.xmlUrl || !body.mapping) {
      res.status(400).json({
        message: 'Missing required fields: xmlUrl, mapping',
      })
      return
    }

    const importerService: XmlProductImporterService = req.scope.resolve(
      XML_PRODUCT_IMPORTER_MODULE
    )

    const preview = await importerService.previewMapping(body)

    res.json(preview)
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

