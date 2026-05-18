import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

import { BRAND_MODULE } from "../../../../modules/brand"
import type BrandModuleService from "../../../../modules/brand/service"

const paramsSchema = z.object({ handle: z.string().min(1) })

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { handle } = paramsSchema.parse(req.params ?? {})
  const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)
  const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION) as any

  const [brands] = await brandService.listAndCountBrands(
    { handle, is_active: true },
    { take: 1 }
  )
  const brand = brands[0]
  if (!brand) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Brand "${handle}" not found.`)
  }

  // query.graph has a default per-brand nested-entity limit that caps returned products at ~15.
  // Knex on the link table returns all rows unconditionally — no Medusa pagination involved.
  const [children, linkRows] = await Promise.all([
    brandService.listAndCountBrands(
      { parent_id: brand.id, is_active: true },
      { take: 200, order: { name: "ASC" } }
    ).then(([rows]) => rows),
    pgConnection("product_product_brand_brand")
      .where({ brand_id: brand.id })
      .whereNull("deleted_at")
      .select("product_id"),
  ])

  const productIds: string[] = linkRows.map((r: any) => r.product_id as string)

  res.json({ brand, children, product_ids: productIds })
}
