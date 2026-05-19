import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ulid } from "ulid"
import { z } from "zod"

import { POS_SESSION_MODULE } from "../../../../../modules/pos-session"
import type POSSessionModuleService from "../../../../../modules/pos-session/service"

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
 * POST /store/pos-sessions/:id/items
 *   body: POSLineItem
 *   → 201 { item }
 *
 * Storefront-callable counterpart of the admin items route. The
 * storefront customizer hits this (via the Next.js /api/pos-bridge
 * relay) when staff clicks "Save to POS" inside a customizer popup.
 *
 * Auth model: the session ID itself is the capability. Sessions are
 * 26-char ULIDs that only exist in memory of the staff member who
 * just opened the customizer, and they expire after a few hours.
 * Worst-case: someone guesses a session ID and spams the cart —
 * staff sees the bogus line on screen and rejects it. Worth
 * revisiting if POS ever runs on a public network.
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

  await (service as any).updatePosSessions({
    id: sessionId,
    items: nextItems,
  })

  return res.status(201).json({ item })
}
