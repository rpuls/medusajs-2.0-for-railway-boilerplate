import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ImportConfig } from "../../../../modules/xml-product-importer/types"
import { getService } from "../storage"

/**
 * GET /admin/xml-importer/configs
 * List all import configurations
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const service = getService(req)
    const { configs, count } = await service.listAllImportConfigs()

    res.json({
      configs,
      count,
    })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * POST /admin/xml-importer/configs
 * Create new import configuration
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const body = req.body as Partial<ImportConfig>

    // Validate required fields
    if (!body.name || !body.xmlUrl || !body.mappingId) {
      res.status(400).json({
        message: 'Missing required fields: name, xmlUrl, mappingId',
      })
      return
    }

    // Validate mapping exists
    const service = getService(req)
    const mapping = await service.findFieldMappingById(body.mappingId)
    if (!mapping) {
      res.status(400).json({
        message: "Mapping not found",
      })
      return
    }

    const config = await service.createNewImportConfig({
      name: body.name,
      description: body.description || null,
      xml_url: body.xmlUrl,
      mapping_id: body.mappingId,
      options: body.options || {
        batchSize: 100,
        updateExisting: false,
        skipErrors: true,
      },
      recurring: body.recurring || null,
      enabled: body.enabled ?? true,
    })

    res.json({ config })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

