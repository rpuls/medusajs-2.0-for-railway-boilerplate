import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../../../../modules/brand"
import BrandModuleService from "../../../../../modules/brand/service"

/**
 * GET /admin/brands/:id/products
 * Get products linked to a brand
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

    // Query links to find products linked to this brand
    const links = await link.list({
      [Modules.PRODUCT]: {},
      [BRAND_MODULE]: { id },
    })

    const productIds: string[] = []
    if (links && Array.isArray(links)) {
      links.forEach((linkItem: any) => {
        if (linkItem[Modules.PRODUCT]?.id) {
          productIds.push(linkItem[Modules.PRODUCT].id)
        }
      })
    }

    res.json({ products: productIds.map((id) => ({ id })) })
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to get brand products",
    })
  }
}

/**
 * POST /admin/brands/:id/products
 * Add or remove products from a brand
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const body = req.body as { add?: string[]; remove?: string[] }
    const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

    // Remove products if specified
    if (body.remove && body.remove.length > 0) {
      for (const productId of body.remove) {
        try {
          await link.dismiss({
            [Modules.PRODUCT]: { id: productId },
            [BRAND_MODULE]: { id },
          })
        } catch (error) {
          // Log but continue with other removals
          console.error(`Failed to remove product ${productId} from brand ${id}:`, error)
        }
      }
    }

    // Add products if specified
    if (body.add && body.add.length > 0) {
      const linksToCreate = body.add.map((productId) => ({
        [Modules.PRODUCT]: { id: productId },
        [BRAND_MODULE]: { id },
      }))

      await link.create(linksToCreate)
    }

    // Get updated brand
    const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)
    const brand = await brandService.retrieveBrand(id)

    res.json({ brand })
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to update brand products",
    })
  }
}

