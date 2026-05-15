import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { IOrderModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { z } from "zod"

import {
  addWatcher,
  readWatchers,
  removeWatcher,
} from "../../../../../lib/order-watchers"

const addSchema = z.object({ email: z.string().min(3).max(200) })

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id
  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  const order = await orderModuleService.retrieveOrder(orderId)
  res.json({ watchers: readWatchers(order?.metadata) })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id
  let body: z.infer<typeof addSchema>
  try {
    body = addSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }
  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  const order = await orderModuleService.retrieveOrder(orderId)
  const result = addWatcher(order?.metadata, body.email)
  if (result.ok === false) return res.status(400).json({ error: result.error })
  await orderModuleService.updateOrders(orderId, {
    metadata: { ...(order?.metadata ?? {}), watcher_emails: result.watchers },
  })
  res.json({ watchers: result.watchers })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id
  const email = String((req.query?.email as string) ?? "").trim().toLowerCase()
  if (!email) return res.status(400).json({ error: "email query required" })
  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  const order = await orderModuleService.retrieveOrder(orderId)
  const next = removeWatcher(order?.metadata, email)
  await orderModuleService.updateOrders(orderId, {
    metadata: { ...(order?.metadata ?? {}), watcher_emails: next },
  })
  res.json({ watchers: next })
}
