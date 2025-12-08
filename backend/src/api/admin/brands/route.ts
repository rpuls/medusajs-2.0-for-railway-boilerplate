import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BRAND_MODULE } from "../../../modules/brand"
import BrandModuleService from "../../../modules/brand/service"

/**
 * GET /admin/brands
 * List all brands
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)
    const brands = await brandService.listBrands({})
    res.json({ brands })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to list brands",
    })
  }
}

/**
 * POST /admin/brands
 * Create a new brand
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const body = req.body as { name: string; image_url?: string }

    // Validate required fields
    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      res.status(400).json({
        message: "Missing required field: name",
      })
      return
    }

    const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)
    const brands = await brandService.createBrands([
      {
        name: body.name.trim(),
        image_url: body.image_url || null,
      },
    ])

    const brand = Array.isArray(brands) ? brands[0] : brands
    res.json({ brand })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to create brand",
    })
  }
}

