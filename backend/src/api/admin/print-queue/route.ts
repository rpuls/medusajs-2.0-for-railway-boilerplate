import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { getPrintQueue } from "../../../services/print-queue/get-queue"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const buckets = await getPrintQueue(req.scope)
  res.json({ buckets })
}
