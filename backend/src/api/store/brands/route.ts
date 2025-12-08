import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BRAND_MODULE } from "../../../modules/brand"
import BrandModuleService from "../../../modules/brand/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)

  try {
    const brands = await brandService.listBrands({})
    res.json({ brands })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to list brands",
    })
  }
}

