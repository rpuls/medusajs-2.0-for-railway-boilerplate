import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { IOrderModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { z } from "zod"

import {
  addWatcher,
  readWatchers,
  removeWatcher,
} from "../../../../../../../lib/order-watchers"

const addSchema = z.object({ email: z.string().min(3).max(200) })

function requireCustomer(req: AuthenticatedMedusaRequest): string {
  const id = req.auth_context?.actor_id
  if (!id) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Not authenticated.")
  }
  return id
}

async function loadOwnedOrder(
  req: AuthenticatedMedusaRequest,
  customerId: string,
  orderId: string
): Promise<any> {
  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  let order: any
  try {
    order = await orderModuleService.retrieveOrder(orderId)
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found.")
  }
  if (order?.customer_id !== customerId) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found.")
  }
  return order
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = requireCustomer(req)
  const order = await loadOwnedOrder(req, customerId, req.params.id)
  res.json({ watchers: readWatchers(order.metadata) })
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = requireCustomer(req)
  let body: z.infer<typeof addSchema>
  try {
    body = addSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }
  const order = await loadOwnedOrder(req, customerId, req.params.id)
  const result = addWatcher(order.metadata, body.email)
  if (result.ok === false) return res.status(400).json({ error: result.error })

  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  await orderModuleService.updateOrders(req.params.id, {
    metadata: { ...(order.metadata ?? {}), watcher_emails: result.watchers },
  })
  res.json({ watchers: result.watchers })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = requireCustomer(req)
  const email = String((req.query?.email as string) ?? "").trim().toLowerCase()
  if (!email) return res.status(400).json({ error: "email query required" })
  const order = await loadOwnedOrder(req, customerId, req.params.id)
  const next = removeWatcher(order.metadata, email)
  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  await orderModuleService.updateOrders(req.params.id, {
    metadata: { ...(order.metadata ?? {}), watcher_emails: next },
  })
  res.json({ watchers: next })
}
