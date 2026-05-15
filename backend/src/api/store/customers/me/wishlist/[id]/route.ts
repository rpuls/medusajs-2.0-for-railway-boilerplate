import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { WISHLIST_MODULE } from "../../../../../../modules/wishlist"
import type WishlistModuleService from "../../../../../../modules/wishlist/service"

function requireCustomer(req: AuthenticatedMedusaRequest): string {
  const id = req.auth_context?.actor_id
  if (!id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Not authenticated.")
  }
  return id
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = requireCustomer(req)
  const id = req.params.id
  if (!id) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "id required")
  }
  const wishlistService = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE)

  const [existing] = await wishlistService.listWishlistItems({ id })
  if (!existing || existing.customer_id !== customerId) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Not found")
  }

  await wishlistService.deleteWishlistItems([id])
  res.status(200).json({ ok: true })
}
