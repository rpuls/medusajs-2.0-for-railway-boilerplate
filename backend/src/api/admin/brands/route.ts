import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

import { BRAND_MODULE } from "../../../modules/brand"
import type BrandModuleService from "../../../modules/brand/service"
import { slugifyBrandHandle } from "../../../lib/brand-handle"

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  q: z.string().trim().min(1).optional(),
  parent_id: z.union([z.string().min(1), z.literal("null")]).optional(),
})

const brandBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  handle: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  external_code: z.string().trim().min(1).max(60).nullable().optional(),
  parent_id: z.string().min(1).nullable().optional(),
  is_active: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = listQuerySchema.parse(req.query ?? {})
  const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)

  const filters: Record<string, unknown> = {}
  if (query.q) {
    filters.name = { $ilike: `%${query.q}%` }
  }
  if (query.parent_id === "null") {
    filters.parent_id = null
  } else if (query.parent_id) {
    filters.parent_id = query.parent_id
  }

  const [brands, count] = await brandService.listAndCountBrands(filters, {
    take: query.limit ?? 100,
    skip: query.offset ?? 0,
    order: { name: "ASC" },
  })

  res.json({
    brands,
    count,
    limit: query.limit ?? 100,
    offset: query.offset ?? 0,
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = brandBodySchema.parse(req.body ?? {})
  const brandService = req.scope.resolve<BrandModuleService>(BRAND_MODULE)

  const handle = body.handle?.trim() || slugifyBrandHandle(body.name)
  if (!handle) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Brand handle could not be derived from name. Provide a handle explicitly."
    )
  }

  if (body.parent_id) {
    const parent = await brandService.retrieveBrand(body.parent_id).catch(() => null)
    if (!parent) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Parent brand "${body.parent_id}" not found.`
      )
    }
    if (parent.parent_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Only one level of brand nesting is supported (parent cannot itself have a parent)."
      )
    }
  }

  const [created] = await brandService.createBrands([
    {
      name: body.name,
      handle,
      description: body.description ?? null,
      logo_url: body.logo_url ?? null,
      external_code: body.external_code ?? null,
      parent_id: body.parent_id ?? null,
      is_active: body.is_active ?? true,
      metadata: body.metadata ?? null,
    },
  ])

  res.status(201).json({ brand: created })
}
