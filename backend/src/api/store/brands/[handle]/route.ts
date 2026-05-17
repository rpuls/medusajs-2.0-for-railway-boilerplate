import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

import { BRAND_MODULE } from "../../../../modules/brand"
import type BrandModuleService from "../../../../modules/brand/service"

const paramsSchema = z.object({ handle: z.string().min(1) })

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { handle } = paramsSchema.parse(req.params ?? {})
  const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const [brands] = await brandService.listAndCountBrands(
    { handle, is_active: true },
    { take: 1 }
  )
  const brand = brands[0]
  if (!brand) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Brand "${handle}" not found.`)
  }

  const [children, brandGraph] = await Promise.all([
    brandService.listAndCountBrands(
      { parent_id: brand.id, is_active: true },
      { take: 200, order: { name: "ASC" } }
    ).then(([rows]) => rows),
    query.graph({
      entity: "brand",
      fields: ["id", "product.id"],
      filters: { id: brand.id },
    }),
  ])

  const productIds: string[] = ((brandGraph.data?.[0] as any)?.product ?? []).map(
    (p: any) => p.id as string
  )

  res.json({ brand, children, product_ids: productIds })
}
