import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { z } from "zod"

import { BRAND_MODULE } from "../../../../../modules/brand"

const paramsSchema = z.object({ id: z.string().min(1) })

const bodySchema = z.object({
  brand_id: z.string().min(1).nullable(),
})

type LinkLike = {
  create: (data: Record<string, unknown>) => Promise<unknown>
  dismiss: (data: Record<string, unknown>) => Promise<unknown>
}

type QueryLike = {
  graph: (a: Record<string, unknown>) => Promise<{ data?: any[] }>
}

async function readLinkedBrandId(
  query: QueryLike,
  productId: string
): Promise<string | null> {
  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "brand.id"],
    filters: { id: [productId] },
  })
  const brand = (data?.[0] as any)?.brand
  if (Array.isArray(brand)) {
    return brand[0]?.id ?? null
  }
  return brand?.id ?? null
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = paramsSchema.parse(req.params ?? {})
  const query = req.scope.resolve<QueryLike>(ContainerRegistrationKeys.QUERY)
  const brandId = await readLinkedBrandId(query, id)
  if (!brandId) {
    res.json({ brand: null })
    return
  }
  const { data } = await query.graph({
    entity: "brand",
    fields: ["id", "name", "handle", "external_code", "parent_id", "is_active"],
    filters: { id: [brandId] },
  })
  res.json({ brand: data?.[0] ?? null })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = paramsSchema.parse(req.params ?? {})
  const { brand_id } = bodySchema.parse(req.body ?? {})

  const link = req.scope.resolve<LinkLike>(ContainerRegistrationKeys.LINK)
  const query = req.scope.resolve<QueryLike>(ContainerRegistrationKeys.QUERY)

  if (brand_id) {
    const { data } = await query.graph({
      entity: "brand",
      fields: ["id"],
      filters: { id: [brand_id] },
    })
    if (!data?.[0]) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Brand "${brand_id}" not found.`
      )
    }
  }

  const current = await readLinkedBrandId(query, id)
  if (current === brand_id) {
    res.json({ brand_id, changed: false })
    return
  }

  if (current) {
    await link.dismiss({
      [Modules.PRODUCT]: { product_id: id },
      [BRAND_MODULE]: { brand_id: current },
    })
  }
  if (brand_id) {
    await link.create({
      [Modules.PRODUCT]: { product_id: id },
      [BRAND_MODULE]: { brand_id },
    })
  }

  res.json({ brand_id, changed: true })
}
