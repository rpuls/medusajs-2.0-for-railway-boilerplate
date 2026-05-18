import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

import { BRAND_MODULE } from "../../../../modules/brand"
import type BrandModuleService from "../../../../modules/brand/service"

const paramsSchema = z.object({ handle: z.string().min(1) })

/**
 * Brand metadata + direct children. Product membership lives at the dedicated
 * `/store/brands/:handle/products` route — it's server-side paginated and sales-channel
 * scoped there, so the storefront never has to ship hundreds of product IDs over a
 * query string (which previously broke for AS Colour at ~10KB URLs).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { handle } = paramsSchema.parse(req.params ?? {})
  const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)

  const [brands] = await brandService.listAndCountBrands(
    { handle, is_active: true },
    { take: 1 }
  )
  const brand = brands[0]
  if (!brand) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Brand "${handle}" not found.`)
  }

  const [children] = await brandService.listAndCountBrands(
    { parent_id: brand.id, is_active: true },
    { take: 200, order: { name: "ASC" } }
  )

  res.json({ brand, children })
}
