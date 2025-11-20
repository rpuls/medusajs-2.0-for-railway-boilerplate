import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ImportConfig } from "../../../../../modules/xml-product-importer/types"
import { getService } from "../../storage"

/**
 * GET /admin/xml-importer/configs/:id
 * Get specific configuration
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const service = getService(req)

    const config = await service.findImportConfigById(id)

    if (!config) {
      res.status(404).json({ message: "Configuration not found" })
      return
    }

    res.json({ config })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * PUT /admin/xml-importer/configs/:id
 * Update configuration
 */
export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const body = req.body as Partial<ImportConfig>
    const service = getService(req)

    const existingConfig = await service.importConfigRepository_.findOne({ where: { id } })

    if (!existingConfig) {
      res.status(404).json({ message: "Configuration not found" })
      return
    }

    // Validate mapping if mappingId is being updated
    if (body.mappingId && body.mappingId !== existingConfig.mapping_id) {
      const mapping = await service.findFieldMappingById(body.mappingId)
      if (!mapping) {
        res.status(400).json({
          message: "Mapping not found",
        })
        return
      }
    }

    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description || null
    if (body.xmlUrl !== undefined) updateData.xml_url = body.xmlUrl
    if (body.mappingId !== undefined) updateData.mapping_id = body.mappingId
    if (body.options !== undefined) updateData.options = body.options
    if (body.recurring !== undefined) updateData.recurring = body.recurring || null
    if (body.enabled !== undefined) updateData.enabled = body.enabled

    const updatedConfig = await service.importConfigRepository_.update({ id }, updateData)

    res.json({ config: updatedConfig })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * DELETE /admin/xml-importer/configs/:id
 * Delete configuration
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const service = getService(req)

    const config = await service.findImportConfigById(id)

    if (!config) {
      res.status(404).json({ message: "Configuration not found" })
      return
    }

    await service.importConfigRepository_.delete({ id })

    res.status(204).send()
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

