import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

import { BOTTLE_SHOP_MODULE } from "../../../../modules/bottle-shop"
import type BottleShopModuleService from "../../../../modules/bottle-shop/service"

const paramsSchema = z.object({ id: z.string().min(1) })

const updateBodySchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
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
  const { id } = paramsSchema.parse(req.params ?? {})
  const service = req.scope.resolve<BottleShopModuleService>(BOTTLE_SHOP_MODULE)
  const shop = await service.retrieveBottleShop(id).catch(() => null)
  if (!shop) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Bottle shop "${id}" not found.`)
  }
  res.json({ bottle_shop: shop })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { id } = paramsSchema.parse(req.params ?? {})
  const body = updateBodySchema.parse(req.body ?? {})
  const service = req.scope.resolve<BottleShopModuleService>(BOTTLE_SHOP_MODULE)

  const existing = await service.retrieveBottleShop(id).catch(() => null)
  if (!existing) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Bottle shop "${id}" not found.`)
  }

  const patch: Record<string, unknown> = {}
  for (const key of Object.keys(body) as Array<keyof typeof body>) {
    if (body[key] !== undefined) patch[key] = body[key]
  }

  await service.updateBottleShops({ id, ...patch })
  const updated = await service.retrieveBottleShop(id)
  res.json({ bottle_shop: updated })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = paramsSchema.parse(req.params ?? {})
  const service = req.scope.resolve<BottleShopModuleService>(BOTTLE_SHOP_MODULE)

  await service.deleteBottleShops(id)
  res.json({ id, object: "bottle_shop", deleted: true })
}
