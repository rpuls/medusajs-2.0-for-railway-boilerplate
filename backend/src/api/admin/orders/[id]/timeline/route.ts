import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { buildOrderTimeline } from "../../../../../services/order-timeline/build"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id
  if (!orderId) return res.status(400).json({ error: "id required" })
  const entries = await buildOrderTimeline(req.scope, orderId)
  res.json({ entries })
}
