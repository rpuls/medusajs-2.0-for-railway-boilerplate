import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ulid } from "ulid"
import { z } from "zod"

import { POS_SESSION_MODULE } from "../../../../../../modules/pos-session"
import type POSSessionModuleService from "../../../../../../modules/pos-session/service"

const addItemSchema = z.object({
  kind: z.enum(["standard", "customizer"]),
  variant_id: z.string().nullable(),
  product_id: z.string(),
  product_title: z.string(),
  variant_title: z.string().nullable().optional(),
  quantity: z.number().int().min(1).max(10_000),
  unit_price_cents: z.number().int().min(0).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
})

/**
 * POST /admin/pos/sessions/:id/items
 *   body: POSLineItem (see model docstring)
 *   → 201 { item, pos_session }
 *
 * Appends a single line item to the session's `items` array. Called
 * from the admin POS page directly (standard products) AND from the
 * storefront /api/pos-bridge/items relay (customizer items).
 *
 * The session must be `status = "active"` AND not expired. Posting
 * to a stale session 404s so the customizer popup can show "Session
 * expired — start a new sale" instead of silently dropping work.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const sessionId = req.params.id

  let body: z.infer<typeof addItemSchema>
  try {
    body = addItemSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }

  const service = req.scope.resolve(POS_SESSION_MODULE) as POSSessionModuleService

  let session: any
  try {
    session = await (service as any).retrievePosSession(sessionId)
  } catch {
    return res.status(404).json({ error: "session not found" })
  }

  if (session.status !== "active") {
    return res.status(409).json({ error: `session is ${session.status}` })
  }

  if (session.expires_at && new Date(session.expires_at).getTime() < Date.now()) {
    return res.status(410).json({ error: "session expired" })
  }

  const item = {
    id: ulid(),
    kind: body.kind,
    variant_id: body.variant_id,
    product_id: body.product_id,
    product_title: body.product_title,
    variant_title: body.variant_title ?? null,
    quantity: body.quantity,
    unit_price_cents: body.unit_price_cents ?? null,
    metadata: body.metadata ?? {},
    added_at: new Date().toISOString(),
  }

  const nextItems = [...(Array.isArray(session.items) ? session.items : []), item]

  const updated = await (service as any).updatePosSessions({
    id: sessionId,
    items: nextItems,
  })
  const out = Array.isArray(updated) ? updated[0] : updated

  return res.status(201).json({ item, pos_session: out })
}
