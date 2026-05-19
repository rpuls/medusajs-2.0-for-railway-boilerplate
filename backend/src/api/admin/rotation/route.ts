import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

import { ADMIN_WORKSPACE_MODULE } from "../../../modules/admin-workspace"

/**
 * GET /admin/rotation              — list rotation members
 * POST /admin/rotation { user_id, enabled?, position? }  — add member
 * DELETE /admin/rotation?user_id=  — remove member
 *
 * The rotation table is the source of truth for `pickNextOwner()`.
 * Admin staff toggle who's "in rotation" for new customers/orders.
 */
const addSchema = z.object({
  user_id: z.string().min(1),
  enabled: z.boolean().optional().default(true),
  position: z.number().int().min(0).max(10000).optional().default(100),
})

const patchSchema = z.object({
  enabled: z.boolean().optional(),
  position: z.number().int().min(0).max(10000).optional(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  try {
    const rows = await service.listCrmOwnerRotations({}, { take: 200 })
    rows.sort(
      (a: any, b: any) =>
        (a.position ?? 100) - (b.position ?? 100)
    )
    return res.json({ rotation: rows })
  } catch (err: any) {
    return res.status(500).json({
      error: "failed to list rotation",
      detail: String(err?.message ?? err),
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  let body: z.infer<typeof addSchema>
  try {
    body = addSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any

  // Upsert by user_id — the unique index on user_id makes this safe.
  const existing = await service.listCrmOwnerRotations(
    { user_id: body.user_id },
    { take: 1 }
  )
  if ((existing as any[]).length > 0) {
    const row = (existing as any[])[0]
    const update: Record<string, unknown> = {}
    if (typeof body.enabled === "boolean") update.enabled = body.enabled
    if (typeof body.position === "number") update.position = body.position
    if (Object.keys(update).length > 0) {
      const updated = await service.updateCrmOwnerRotations(row.id, update)
      return res.json({ member: updated, updated: true })
    }
    return res.json({ member: row, updated: false })
  }
  const created = await service.createCrmOwnerRotations({
    user_id: body.user_id,
    enabled: body.enabled,
    position: body.position,
    last_picked_at: null,
  })
  return res.status(201).json({ member: created })
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const userId = String((req.query?.user_id as string) ?? "")
  if (!userId) return res.status(400).json({ error: "user_id query required" })
  let body: z.infer<typeof patchSchema>
  try {
    body = patchSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  const existing = await service.listCrmOwnerRotations(
    { user_id: userId },
    { take: 1 }
  )
  if ((existing as any[]).length === 0) {
    return res.status(404).json({ error: "not found" })
  }
  const updated = await service.updateCrmOwnerRotations(
    (existing as any[])[0].id,
    body
  )
  return res.json({ member: updated })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const userId = String((req.query?.user_id as string) ?? "")
  if (!userId) return res.status(400).json({ error: "user_id query required" })
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  const existing = await service.listCrmOwnerRotations(
    { user_id: userId },
    { take: 1 }
  )
  if ((existing as any[]).length === 0) return res.json({ ok: true })
  await service.deleteCrmOwnerRotations(
    (existing as any[]).map((r: any) => r.id)
  )
  return res.json({ ok: true })
}
