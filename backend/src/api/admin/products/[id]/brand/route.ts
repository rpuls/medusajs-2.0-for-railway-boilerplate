import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { BRAND_MODULE } from "../../../../../modules/brand"

/**
 * GET /admin/products/:id/brand
 * Get the brand linked to a product
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

    // Query links to find brand linked to this product
    const links = await link.list({
      [Modules.PRODUCT]: { id },
      [BRAND_MODULE]: {},
    })

    if (!links || links.length === 0) {
      res.json({ brand: null })
      return
    }

    // Get the brand from the link
    const brandLink = links[0]
    const brandId = brandLink[BRAND_MODULE]?.id

    if (!brandId) {
      res.json({ brand: null })
      return
    }

    const brandService = req.scope.resolve<import("../../../../../modules/brand/service").default>(BRAND_MODULE)
    const brand = await brandService.retrieveBrand(brandId)

    res.json({ brand })
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to get product brand",
    })
  }
}

/**
 * PUT /admin/products/:id/brand
 * Link or unlink a brand to/from a product
 */
export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const body = req.body as { brand_id: string | null }
    const link = req.scope.resolve(ContainerRegistrationKeys.LINK)

    // First, remove any existing brand links for this product
    const existingLinks = await link.list({
      [Modules.PRODUCT]: { product_id: id },
      [BRAND_MODULE]: {},
    })

    if (existingLinks && existingLinks.length > 0) {
      for (const existingLink of existingLinks) {
        await link.dismiss({
          [Modules.PRODUCT]: { product_id: id },
          [BRAND_MODULE]: { brand_id: existingLink[BRAND_MODULE]?.id },
        })
      }
    }

    // If a brand_id is provided, create a new link
    if (body.brand_id) {
      await link.create([
        {
          [Modules.PRODUCT]: { product_id: id },
          [BRAND_MODULE]: { brand_id: body.brand_id },
        },
      ])

      const brandService = req.scope.resolve<import("../../../../../modules/brand/service").default>(BRAND_MODULE)
      const brand = await brandService.retrieveBrand(body.brand_id)

      res.json({ brand })
    } else {
      // Brand was unlinked
      res.json({ brand: null })
    }
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to update product brand",
    })
  }
}

