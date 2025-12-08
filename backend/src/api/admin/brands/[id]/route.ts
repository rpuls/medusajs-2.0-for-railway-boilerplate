import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BRAND_MODULE } from "../../../../modules/brand"
import BrandModuleService from "../../../../modules/brand/service"

/**
 * GET /admin/brands/:id
 * Get a single brand by ID
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)

    const brand = await brandService.retrieveBrand(id)

    if (!brand) {
      res.status(404).json({
        message: `Brand with id "${id}" not found`,
      })
      return
    }

    res.json({ brand })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to retrieve brand",
    })
  }
}

/**
 * PUT /admin/brands/:id
 * Update a brand
 */
export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const body = req.body as { name?: string; image_url?: string }

    const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)

    // Build update data
    const updateData: any = {}
    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0) {
        res.status(400).json({
          message: "Invalid name: must be a non-empty string",
        })
        return
      }
      updateData.name = body.name.trim()
    }
    if (body.image_url !== undefined) {
      updateData.image_url = body.image_url || null
    }

    const updated = await brandService.updateBrands({ id }, updateData)
    const brand = Array.isArray(updated) && updated.length > 0 ? updated[0] : updated

    res.json({ brand })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to update brand",
    })
  }
}

/**
 * DELETE /admin/brands/:id
 * Delete a brand
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)

    await brandService.deleteBrands({ id })

    res.status(200).json({
      id,
      object: "brand",
      deleted: true,
    })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to delete brand",
    })
  }
}

