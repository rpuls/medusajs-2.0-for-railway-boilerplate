import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { buildCustomerJourney } from "../../../../../services/customer-journey/build"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const customerId = req.params.id
  if (!customerId) return res.status(400).json({ error: "id required" })
  const days = Number.parseInt(String(req.query.days ?? "30"), 10)
  const result = await buildCustomerJourney(req.scope, customerId, {
    days: Number.isFinite(days) ? days : 30,
    limit: 200,
  })
  res.json(result)
}
