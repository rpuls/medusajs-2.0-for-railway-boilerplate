import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../../../modules/brand"

/**
 * GET /store/products/by-brand?brand_id=xxx&brand_id=yyy
 * Get product IDs filtered by brand IDs
 * Returns array of product IDs that are linked to the specified brands
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { brand_id } = req.query
    const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

    // Normalize brand_id to array
    const brandIds = Array.isArray(brand_id)
      ? brand_id.filter(Boolean)
      : brand_id
      ? [brand_id]
      : []

    if (brandIds.length === 0) {
      res.json({ product_ids: [] })
      return
    }

    // Query links to find products linked to these brands
    const productIds = new Set<string>()

    for (const brandId of brandIds) {
      try {
        const links = await link.list({
          [Modules.PRODUCT]: {},
          [BRAND_MODULE]: { id: brandId },
        })

        if (links && Array.isArray(links)) {
          links.forEach((linkItem: any) => {
            if (linkItem[Modules.PRODUCT]?.id) {
              productIds.add(linkItem[Modules.PRODUCT].id)
            }
          })
        }
      } catch (error) {
        // Log error but continue with other brands
        console.error(`Error querying links for brand ${brandId}:`, error)
      }
    }

    res.json({ product_ids: Array.from(productIds) })
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to get products by brand",
    })
  }
}

