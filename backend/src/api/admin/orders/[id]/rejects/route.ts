import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

import { PRODUCTION_REJECT_MODULE } from "../../../../../modules/production-reject"
import type ProductionRejectModuleService from "../../../../../modules/production-reject/service"

const REASONS = [
  "misprint",
  "wrong_size",
  "damaged_blank",
  "supplier_defect",
  "artwork_error",
  "other",
] as const

const createSchema = z.object({
  qty: z.coerce.number().int().min(1).max(10000),
  reason: z.enum(REASONS).default("misprint"),
  order_line_item_id: z.string().max(120).optional(),
  product_id: z.string().max(120).optional(),
  variant_id: z.string().max(120).optional(),
  supplier_brand_id: z.string().max(120).optional(),
  cost_estimate_cents: z.coerce.number().int().min(0).optional(),
  currency_code: z.string().max(8).optional(),
  notes: z.string().max(2000).optional(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id
  const service = req.scope.resolve<ProductionRejectModuleService>(
    PRODUCTION_REJECT_MODULE
  )
  const rejects = await service.listProductionRejects(
    { order_id: orderId },
    { order: { created_at: "DESC" }, take: 200 }
  )
  res.json({ rejects })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id
  let body: z.infer<typeof createSchema>
  try {
    body = createSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }
  const service = req.scope.resolve<ProductionRejectModuleService>(
    PRODUCTION_REJECT_MODULE
  )
  const [created] = await service.createProductionRejects([
    {
      order_id: orderId,
      qty: body.qty,
      reason: body.reason,
      order_line_item_id: body.order_line_item_id ?? null,
      product_id: body.product_id ?? null,
      variant_id: body.variant_id ?? null,
      supplier_brand_id: body.supplier_brand_id ?? null,
      cost_estimate_cents: body.cost_estimate_cents ?? 0,
      currency_code: body.currency_code ?? "aud",
      notes: body.notes ?? null,
      logged_by: (req as any).auth_context?.actor_id ?? null,
    },
  ])
  res.status(201).json({ reject: created })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const id = String((req.query?.id as string) ?? "")
  if (!id) return res.status(400).json({ error: "id query param required" })
  const service = req.scope.resolve<ProductionRejectModuleService>(
    PRODUCTION_REJECT_MODULE
  )
  await service.deleteProductionRejects([id])
  res.json({ ok: true })
}
