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

    if (!id) {
      res.status(400).json({
        message: "Brand ID is required",
      })
      return
    }

    const link = req.scope.resolve(ContainerRegistrationKeys.LINK)
    const logger = req.scope.resolve("logger")

    // Debug: Log the module keys being used
    logger?.info(`Link query debug: productModule=${Modules.PRODUCT}, brandModule=${BRAND_MODULE}, brandId=${id}`)

    // Query links to find products linked to this brand
    // Order must match link definition: Product first, Brand second
    // Use brand_id as the key (from BrandModule.linkable.brand.linkable)
    try {
      const links = await link.list({
        [Modules.PRODUCT]: {},
        [BRAND_MODULE]: { brand_id: id },
      })

      const productIds: string[] = []
      if (links && Array.isArray(links)) {
        links.forEach((linkItem: any) => {
          const productId = linkItem?.[Modules.PRODUCT]?.id
          if (productId) {
            productIds.push(productId)
          }
        })
      }

      logger?.info(`Found ${productIds.length} products linked to brand ${id}`)
      res.json({ products: productIds.map((id) => ({ id })) })
    } catch (linkError) {
      const errorMsg = linkError instanceof Error ? linkError.message : String(linkError)
      const errorStack = linkError instanceof Error ? linkError.stack : undefined
      logger?.error(`Link query error: ${errorMsg} (productModule=${Modules.PRODUCT}, brandModule=${BRAND_MODULE}, brandId=${id})`)
      if (errorStack) {
        logger?.error(`Error stack: ${errorStack}`)
      }
      throw linkError
    }
  } catch (error) {
    const logger = req.scope.resolve("logger")
    logger?.error("Error fetching brand products:", error)
    
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
            [Modules.PRODUCT]: { product_id: productId },
            [BRAND_MODULE]: { brand_id: id },
          })
        } catch (error) {
          // Log but continue with other removals
          console.error(`Failed to remove product ${productId} from brand ${id}:`, error)
        }
      }
    }

    // Add products if specified
    if (body.add && body.add.length > 0) {
      // Check which products are already linked to avoid duplicates
      // Order must match link definition: Product first, Brand second
      // Use brand_id as the key (from BrandModule.linkable.brand.linkable)
      const existingLinks = await link.list({
        [Modules.PRODUCT]: {},
        [BRAND_MODULE]: { brand_id: id },
      })

      const existingProductIds = new Set(
        existingLinks
          ?.map((linkItem: any) => linkItem[Modules.PRODUCT]?.id)
          .filter(Boolean) || []
      )

      // Filter out products that are already linked
      const newProductIds = body.add.filter(
        (productId) => !existingProductIds.has(productId)
      )

      if (newProductIds.length > 0) {
        const linksToCreate = newProductIds.map((productId) => ({
          [Modules.PRODUCT]: { product_id: productId },
          [BRAND_MODULE]: { brand_id: id },
        }))

        await link.create(linksToCreate)
      }
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

