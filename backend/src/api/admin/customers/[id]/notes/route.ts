import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { ADMIN_WORKSPACE_MODULE } from "../../../../../modules/admin-workspace"
import { writeAudit } from "../../../../../lib/audit-log"
import { AUDIT_ACTION, AUDIT_ENTITY } from "../../../../../lib/audit-entities"

/**
 * GET /admin/customers/:id/notes — list notes pinned to this customer.
 * POST /admin/customers/:id/notes { body, pinned? } — add a note.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const customerId = req.params.id
  if (!customerId) return res.status(400).json({ error: "id required" })
  try {
    const { data } = await query.graph({
      entity: "customer_note",
      fields: [
        "id",
        "body",
        "pinned",
        "snooze_until",
        "created_by",
        "created_at",
      ],
      filters: { customer_id: customerId },
      pagination: { take: 200, skip: 0, order: { created_at: "DESC" } },
    })
    const rows = (data as any[]) ?? []
    // Pinned first, then newest-first.
    rows.sort((a, b) => {
      if (Boolean(a.pinned) !== Boolean(b.pinned)) {
        return a.pinned ? -1 : 1
      }
      return Date.parse(b.created_at ?? "") - Date.parse(a.created_at ?? "")
    })
    return res.json({ notes: rows })
  } catch {
    return res.json({ notes: [] })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const customerId = req.params.id
  const body = (req.body ?? {}) as any
  if (!customerId) return res.status(400).json({ error: "id required" })
  if (typeof body.body !== "string" || body.body.trim().length === 0) {
    return res.status(400).json({ error: "body required" })
  }
  if (body.body.length > 4000) {
    return res
      .status(400)
      .json({ error: "body too long (max 4000 chars)" })
  }
  const actor = (req as any).auth_context?.actor_id ?? null
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  let snoozeUntil: Date | null = null
  if (typeof body.snooze_until === "string" && body.snooze_until.length > 0) {
    const parsed = new Date(body.snooze_until)
    if (Number.isFinite(parsed.getTime())) snoozeUntil = parsed
  }
  try {
    const created = await service.createCustomerNotes({
      customer_id: customerId,
      body: body.body.trim(),
      pinned: body.pinned === true,
      snooze_until: snoozeUntil,
      created_by: actor,
    })
    await writeAudit({
      container: req.scope as any,
      entity: AUDIT_ENTITY.CUSTOMER,
      entity_id: customerId,
      action: AUDIT_ACTION.NOTE_ADDED,
      actor_id: actor,
      details: {
        note_id: (created as any)?.id ?? null,
        pinned: body.pinned === true,
        snooze_until: snoozeUntil?.toISOString() ?? null,
        excerpt: body.body.trim().slice(0, 80),
      },
    })
    return res.status(201).json({ note: created })
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to add note",
      detail: String(err?.message ?? err),
    })
  }
}
