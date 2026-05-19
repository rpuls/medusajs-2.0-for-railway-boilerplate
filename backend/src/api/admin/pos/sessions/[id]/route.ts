import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

import { POS_SESSION_MODULE } from "../../../../../modules/pos-session"
import type POSSessionModuleService from "../../../../../modules/pos-session/service"

const updateSchema = z.object({
  customer_id: z.string().nullable().optional(),
  items: z.array(z.any()).optional(),
  status: z.enum(["active", "cancelled"]).optional(),
})

/**
 * GET /admin/pos/sessions/:id
 *   → { pos_session }
 *
 * The admin POS page polls this every 2s while the customizer popup is
 * open so freshly-saved customizer items show up in the cart UI
 * without a manual refresh.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  const service = req.scope.resolve(POS_SESSION_MODULE) as POSSessionModuleService

  try {
    const session = await (service as any).retrievePosSession(id)
    return res.json({ pos_session: session })
  } catch {
    return res.status(404).json({ error: "not found" })
  }
}

/**
 * PATCH /admin/pos/sessions/:id
 *   body: { customer_id?, items?, status? }
 *
 * Lets the admin POS page write the full items array back (e.g. after
 * the user removes a line or changes quantity). Items are stored as
 * an opaque JSON array; the contract is enforced client-side because
 * customizer metadata varies in shape per decoration method.
 */
export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id

  let body: z.infer<typeof updateSchema>
  try {
    body = updateSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }

  const service = req.scope.resolve(POS_SESSION_MODULE) as POSSessionModuleService

  const update: Record<string, unknown> = { id }
  if (body.customer_id !== undefined) update.customer_id = body.customer_id
  if (body.items !== undefined) update.items = body.items
  if (body.status !== undefined) update.status = body.status

  try {
    const updated = await (service as any).updatePosSessions(update)
    const session = Array.isArray(updated) ? updated[0] : updated
    return res.json({ pos_session: session })
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "update failed" })
  }
}

/**
 * DELETE /admin/pos/sessions/:id
 *   → 204 (soft-cancel)
 *
 * Marks the session cancelled so it stops appearing in the
 * "owned by me, active" picker. We don't hard-delete so that
 * the customer-journey audit trail can still surface "POS sale
 * cancelled" entries later.
 */
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  const service = req.scope.resolve(POS_SESSION_MODULE) as POSSessionModuleService

  try {
    await (service as any).updatePosSessions({ id, status: "cancelled" })
    return res.status(204).send(undefined)
  } catch (err: any) {
    return res.status(404).json({ error: "not found" })
  }
}
