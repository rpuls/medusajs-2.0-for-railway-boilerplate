import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

import { GROUP_ORDER_MODULE } from "../../../../../../../modules/group-order"
import type GroupOrderModuleService from "../../../../../../../modules/group-order/service"

const schema = z.object({
  status: z.enum(["open", "closed", "converted"]),
})

function requireCustomer(req: AuthenticatedMedusaRequest): string {
  const id = req.auth_context?.actor_id
  if (!id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Not authenticated.")
  }
  return id
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = requireCustomer(req)
  const id = req.params.id
  let body: z.infer<typeof schema>
  try {
    body = schema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }

  const service = req.scope.resolve<GroupOrderModuleService>(GROUP_ORDER_MODULE)
  let groupOrder: any
  try {
    groupOrder = await service.retrieveGroupOrder(id)
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Group order not found.")
  }
  if (groupOrder.owner_customer_id !== customerId) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Group order not found.")
  }

  await service.updateGroupOrders([{ id, status: body.status }])
  const updated = await service.retrieveGroupOrder(id)
  res.json({ group_order: updated })
}
