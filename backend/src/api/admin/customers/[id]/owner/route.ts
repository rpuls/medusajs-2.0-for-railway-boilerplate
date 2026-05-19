import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

import { clearOwner, getOwner, setOwner } from "../../../../../lib/crm-owners"
import { AUDIT_ENTITY } from "../../../../../lib/audit-entities"

const putSchema = z.object({
  user_id: z.string().min(1),
  reason: z.string().max(200).nullable().optional(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  if (!id) return res.status(400).json({ error: "id required" })
  const owner = await getOwner({
    container: req.scope as any,
    entity: AUDIT_ENTITY.CUSTOMER,
    entity_id: id,
  })
  return res.json({ owner })
}

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  if (!id) return res.status(400).json({ error: "id required" })
  let body: z.infer<typeof putSchema>
  try {
    body = putSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }
  const actor = (req as any).auth_context?.actor_id ?? null
  await setOwner({
    container: req.scope as any,
    entity: AUDIT_ENTITY.CUSTOMER,
    entity_id: id,
    user_id: body.user_id,
    actor,
    reason: body.reason ?? null,
  })
  const owner = await getOwner({
    container: req.scope as any,
    entity: AUDIT_ENTITY.CUSTOMER,
    entity_id: id,
  })
  return res.json({ owner })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  if (!id) return res.status(400).json({ error: "id required" })
  const actor = (req as any).auth_context?.actor_id ?? null
  await clearOwner({
    container: req.scope as any,
    entity: AUDIT_ENTITY.CUSTOMER,
    entity_id: id,
    actor,
  })
  return res.json({ ok: true })
}
