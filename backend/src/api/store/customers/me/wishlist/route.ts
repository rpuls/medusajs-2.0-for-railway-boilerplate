import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

import { WISHLIST_MODULE } from "../../../../../modules/wishlist"
import type WishlistModuleService from "../../../../../modules/wishlist/service"
import { getPostHog } from "../../../../../lib/posthog"

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})

const createBodySchema = z.object({
  product_id: z.string().min(1),
  variant_id: z.string().min(1).optional(),
  note: z.string().max(500).optional(),
})

function requireCustomer(req: AuthenticatedMedusaRequest): string {
  const id = req.auth_context?.actor_id
  if (!id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Not authenticated.")
  }
  return id
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = requireCustomer(req)
  const query = listQuerySchema.parse(req.query ?? {})
  const wishlistService = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE)

  const [items, count] = await wishlistService.listAndCountWishlistItems(
    { customer_id: customerId },
    {
      take: query.limit ?? 100,
      skip: query.offset ?? 0,
      order: { created_at: "DESC" },
    }
  )

  res.json({ wishlist_items: items, count })
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = requireCustomer(req)
  const body = createBodySchema.parse(req.body ?? {})
  const wishlistService = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE)

  const existing = await wishlistService.listWishlistItems({
    customer_id: customerId,
    product_id: body.product_id,
  })
  if (existing.length > 0) {
    return res.status(200).json({ wishlist_item: existing[0], duplicate: true })
  }

  const [created] = await wishlistService.createWishlistItems([
    {
      customer_id: customerId,
      product_id: body.product_id,
      variant_id: body.variant_id ?? null,
      note: body.note ?? null,
    },
  ])

  getPostHog()?.capture({
    distinctId: customerId,
    event: "wishlist item added",
    properties: { product_id: body.product_id, variant_id: body.variant_id ?? null },
  })

  res.status(201).json({ wishlist_item: created })
}
