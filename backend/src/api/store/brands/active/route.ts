import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../../../modules/brand"

import BrandModuleService from "../../../../modules/brand/service"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)
  const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

  try {
    // Get all brands
    const allBrands = await brandService.listBrands({})

    // Count products per brand using link queries
    const brandsWithCounts = await Promise.all(
      allBrands.map(async (brand: any) => {
        try {
          // Query links to find products linked to this brand
          const links = await link.list({
            [Modules.PRODUCT]: {},
            [BRAND_MODULE]: { brand: brand.id },
          })

          const productCount = links?.length || 0

          return {
            ...brand,
            product_count: productCount,
          }
        } catch (error) {
          // If link query fails, return brand with 0 count
          return {
            ...brand,
            product_count: 0,
          }
        }
      })
    )

    // Filter to only brands with products (active brands)
    const activeBrands = brandsWithCounts.filter(
      (brand: any) => brand.product_count > 0
    )

    res.json({ brands: activeBrands })
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to list active brands",
    })
  }
}

