import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { ADMIN_WORKSPACE_MODULE } from "../../../../../../modules/admin-workspace"
import { writeAudit } from "../../../../../../lib/audit-log"
import { AUDIT_ACTION, AUDIT_ENTITY } from "../../../../../../lib/audit-entities"

/**
 * PATCH /admin/customers/:id/notes/:note_id { body?, pinned? }
 * DELETE /admin/customers/:id/notes/:note_id
 */
export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const noteId = req.params.note_id
  const customerId = req.params.id
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
  const actor = (req as any).auth_context?.actor_id ?? null

  let previous: any = null
  try {
    previous = await service.retrieveCustomerNote(noteId)
  } catch {
    /* note may not exist — update will fail downstream */
  }

  try {
    const updated = await service.updateCustomerNotes(noteId, update)

    if (customerId) {
      // Emit a fine-grained audit row for each meaningful field change so
      // the customer-journey timeline can render "Note pinned" / "Note
      // snoozed until 3 Jun" instead of a generic "note_updated".
      if (
        typeof body.pinned === "boolean" &&
        Boolean(previous?.pinned) !== body.pinned
      ) {
        await writeAudit({
          container: req.scope as any,
          entity: AUDIT_ENTITY.CUSTOMER,
          entity_id: customerId,
          action: AUDIT_ACTION.NOTE_PINNED,
          actor_id: actor,
          details: { note_id: noteId, pinned: body.pinned },
        })
      }
      if (
        "snooze_until" in update &&
        previous?.snooze_until !== update.snooze_until
      ) {
        await writeAudit({
          container: req.scope as any,
          entity: AUDIT_ENTITY.CUSTOMER,
          entity_id: customerId,
          action: AUDIT_ACTION.NOTE_SNOOZED,
          actor_id: actor,
          details: {
            note_id: noteId,
            snooze_until:
              update.snooze_until instanceof Date
                ? (update.snooze_until as Date).toISOString()
                : update.snooze_until,
          },
        })
      }
    }

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
  const customerId = req.params.id
  if (!noteId) return res.status(400).json({ error: "note_id required" })
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  const actor = (req as any).auth_context?.actor_id ?? null

  try {
    await service.deleteCustomerNotes([noteId])
    if (customerId) {
      await writeAudit({
        container: req.scope as any,
        entity: AUDIT_ENTITY.CUSTOMER,
        entity_id: customerId,
        action: AUDIT_ACTION.NOTE_DELETED,
        actor_id: actor,
        details: { note_id: noteId },
      })
    }
    return res.json({ id: noteId, deleted: true })
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to delete note",
      detail: String(err?.message ?? err),
    })
  }
}
