import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

import { LOOKBOOK_MODULE } from "../../../../modules/lookbook"
import type LookbookModuleService from "../../../../modules/lookbook/service"

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  attribution: z.string().max(200).nullable().optional(),
  order_id: z.string().max(120).nullable().optional(),
  product_ids: z.array(z.string()).max(20).optional(),
  tags: z.array(z.string().max(40)).max(20).optional(),
  is_published: z.boolean().optional(),
  weight: z.coerce.number().int().optional(),
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  let body: z.infer<typeof updateSchema>
  try {
    body = updateSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }
  const update: Record<string, unknown> = { id }
  for (const k of Object.keys(body) as Array<keyof typeof body>) {
    if (body[k] === undefined) continue
    if (k === "product_ids") {
      update.product_ids = { ids: body.product_ids }
    } else if (k === "tags") {
      update.tags = { values: body.tags }
    } else {
      ;(update as any)[k] = body[k]
    }
  }
  const service = req.scope.resolve<LookbookModuleService>(LOOKBOOK_MODULE)
  await service.updateLookbookItems([update])
  const updated = await service.retrieveLookbookItem(id)
  res.json({ item: updated })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  const service = req.scope.resolve<LookbookModuleService>(LOOKBOOK_MODULE)
  await service.deleteLookbookItems([id])
  res.json({ ok: true })
}
