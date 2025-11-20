import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { FieldMapping } from "../../../../../modules/xml-product-importer/types"
import { getService } from "../../storage"

/**
 * GET /admin/xml-importer/mappings/:id
 * Get specific saved mapping
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const service = getService(req)

    const mapping = await service.findFieldMappingById(id)

    if (!mapping) {
      res.status(404).json({ message: "Mapping not found" })
      return
    }

    res.json({ mapping })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * PUT /admin/xml-importer/mappings/:id
 * Update saved mapping
 */
export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const body = req.body as Partial<FieldMapping>
    const service = getService(req)

    const existingMapping = await service.findFieldMappingById(id)

    if (!existingMapping) {
      res.status(404).json({ message: "Mapping not found" })
      return
    }

    // Validate mappings if provided
    if (body.mappings) {
      if (!Array.isArray(body.mappings)) {
        res.status(400).json({
          message: "mappings must be an array",
        })
        return
      }

      if (body.mappings.length === 0) {
        res.status(400).json({
          message: "At least one field mapping is required",
        })
        return
      }

      // Validate each mapping rule
      for (const mapping of body.mappings) {
        if (!mapping.xmlPath || !mapping.medusaField) {
          res.status(400).json({
            message: "Each mapping must have xmlPath and medusaField",
          })
          return
        }
      }
    }

    const updateData: any = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description || null
    if (body.xmlUrl !== undefined) updateData.xml_url = body.xmlUrl || null
    if (body.mappings !== undefined) {
      // Ensure all mapping properties are preserved
      updateData.mappings = body.mappings.map((m: any) => ({
        ...m, // Preserve all properties including categoryDelimiter, imageDelimiter, etc.
      }))
    }

    console.log('Updating mapping with data:', JSON.stringify(updateData, null, 2))
    const updatedMapping = await service.updateFieldMapping(id, updateData)
    console.log('Updated mapping result:', JSON.stringify(updatedMapping, null, 2))

    res.json({ mapping: updatedMapping })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * DELETE /admin/xml-importer/mappings/:id
 * Delete saved mapping
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const service = getService(req)

    const mapping = await service.findFieldMappingById(id)

    if (!mapping) {
      res.status(404).json({ message: "Mapping not found" })
      return
    }

    // TODO: Check if mapping is used by any configs first

    await service.deleteFieldMapping(id)

    res.status(204).send()
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
