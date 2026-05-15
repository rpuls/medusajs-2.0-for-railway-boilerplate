import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { GROUP_ORDER_MODULE } from "../../../../../modules/group-order"
import type GroupOrderModuleService from "../../../../../modules/group-order/service"

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
  const service = req.scope.resolve<GroupOrderModuleService>(GROUP_ORDER_MODULE)
  const list = await service.listGroupOrders(
    { owner_customer_id: customerId },
    { order: { created_at: "DESC" }, take: 100 }
  )
  res.json({ group_orders: list })
}
