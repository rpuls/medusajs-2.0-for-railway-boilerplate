import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { FieldMapping } from "../../../../modules/xml-product-importer/types"
import { getService } from "../storage"

/**
 * GET /admin/xml-importer/mappings
 * List all saved field mappings
 */
export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    const service = getService(req)
    const { mappings, count } = await service.listAllFieldMappings()

    console.log('GET mappings response:', { 
      mappingsCount: mappings?.length, 
      count,
      firstMapping: mappings?.[0] 
    })

    res.json({
      mappings,
      count,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

/**
 * POST /admin/xml-importer/mappings
 * Create/save new field mapping
 */
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    const body = req.body as Partial<FieldMapping>

    // Validate required fields
    if (!body.name || !body.mappings || !Array.isArray(body.mappings)) {
      res.status(400).json({
        message: "Missing required fields: name, mappings (array)",
      })
      return
    }

    // Validate that mappings array has at least one mapping
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

    const service = getService(req)
    console.log('Creating mapping with data:', {
      name: body.name,
      description: body.description || null,
      xml_url: body.xmlUrl || null,
      mappingsCount: body.mappings?.length,
    })
    
    const mapping = await service.createNewFieldMapping({
      name: body.name,
      description: body.description || null,
      xml_url: body.xmlUrl || null,
      mappings: body.mappings,
    })

    console.log('Created mapping result:', { 
      id: mapping?.id, 
      name: mapping?.name,
      hasId: !!mapping?.id 
    })

    res.json({ mapping })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
