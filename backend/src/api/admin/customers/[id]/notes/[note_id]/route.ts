import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { ADMIN_WORKSPACE_MODULE } from "../../../../../../modules/admin-workspace"

/**
 * PATCH /admin/customers/:id/notes/:note_id { body?, pinned? }
 * DELETE /admin/customers/:id/notes/:note_id
 */
export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const noteId = req.params.note_id
  if (!noteId) return res.status(400).json({ error: "note_id required" })
  const body = (req.body ?? {}) as any
  const update: Record<string, unknown> = {}
  if (typeof body.body === "string") update.body = body.body.trim()
  if (typeof body.pinned === "boolean") update.pinned = body.pinned
  if (body.snooze_until === null) {
    update.snooze_until = null
  } else if (typeof body.snooze_until === "string" && body.snooze_until.length > 0) {
    const parsed = new Date(body.snooze_until)
    if (Number.isFinite(parsed.getTime())) update.snooze_until = parsed
  }
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  try {
    const updated = await service.updateCustomerNotes(noteId, update)
    return res.json({ note: updated })
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to update note",
      detail: String(err?.message ?? err),
    })
  }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const noteId = req.params.note_id
  if (!noteId) return res.status(400).json({ error: "note_id required" })
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  try {
    await service.deleteCustomerNotes([noteId])
    return res.json({ id: noteId, deleted: true })
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to delete note",
      detail: String(err?.message ?? err),
    })
  }
}
