import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

import { BOTTLE_SHOP_MODULE } from "../../../modules/bottle-shop"
import type BottleShopModuleService from "../../../modules/bottle-shop/service"
import { slugifyBrandHandle } from "../../../lib/brand-handle"

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  q: z.string().trim().min(1).optional(),
})

const bottleShopBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  handle: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().nullable().optional(),
  contact_name: z.string().trim().max(120).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  address_line_1: z.string().trim().max(200).nullable().optional(),
  address_line_2: z.string().trim().max(200).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  state: z.string().trim().max(120).nullable().optional(),
  postal_code: z.string().trim().max(20).nullable().optional(),
  country_code: z.string().trim().min(2).max(2).nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
  is_active: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = listQuerySchema.parse(req.query ?? {})
  const service = req.scope.resolve<BottleShopModuleService>(BOTTLE_SHOP_MODULE)

  const filters: Record<string, unknown> = {}
  if (query.q) {
    filters.name = { $ilike: `%${query.q}%` }
  }

  const [shops, count] = await service.listAndCountBottleShops(filters, {
    take: query.limit ?? 100,
    skip: query.offset ?? 0,
    order: { name: "ASC" },
  })

  res.json({
    bottle_shops: shops,
    count,
    limit: query.limit ?? 100,
    offset: query.offset ?? 0,
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = bottleShopBodySchema.parse(req.body ?? {})
  const service = req.scope.resolve<BottleShopModuleService>(BOTTLE_SHOP_MODULE)

  const handle = body.handle?.trim() || slugifyBrandHandle(body.name)
  if (!handle) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Bottle shop handle could not be derived from name. Provide a handle explicitly."
    )
  }

  const [created] = await service.createBottleShops([
    {
      name: body.name,
      handle,
      email: body.email ?? null,
      contact_name: body.contact_name ?? null,
      phone: body.phone ?? null,
      address_line_1: body.address_line_1 ?? null,
      address_line_2: body.address_line_2 ?? null,
      city: body.city ?? null,
      state: body.state ?? null,
      postal_code: body.postal_code ?? null,
      country_code: body.country_code ?? null,
      notes: body.notes ?? null,
      is_active: body.is_active ?? true,
      metadata: body.metadata ?? null,
    },
  ])

  res.status(201).json({ bottle_shop: created })
}
