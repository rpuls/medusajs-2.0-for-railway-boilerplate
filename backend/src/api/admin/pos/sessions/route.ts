import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

import { POS_SESSION_MODULE } from "../../../../modules/pos-session"
import type POSSessionModuleService from "../../../../modules/pos-session/service"
import { captureEvent } from "../../../../lib/posthog"

const POS_SESSION_TTL_HOURS = Number.parseInt(
  process.env.POS_SESSION_TTL_HOURS ?? "4",
  10
)

const createSchema = z.object({
  customer_id: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * GET /admin/pos/sessions
 *   ?status=active        (csv; default = active)
 *   ?owned_by_me=1        (filter to current admin)
 *   ?limit=20
 *
 * Returns recent POS sessions for the bench-side "resume previous"
 * picker. Day-to-day flow is one session per transaction, but staff
 * occasionally need to pick up an interrupted sale.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(POS_SESSION_MODULE) as POSSessionModuleService
  const q = req.query ?? {}
  const filters: Record<string, unknown> = {}

  const statusList = String(q.status ?? "active")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  if (statusList.length > 0) filters.status = statusList

  const ownedByMe = String(q.owned_by_me ?? "")
  if (ownedByMe === "1" || ownedByMe.toLowerCase() === "true") {
    const actor = (req as any).auth_context?.actor_id
    if (actor) filters.created_by_user_id = actor
  }

  const limit = Math.min(Number.parseInt(String(q.limit ?? "20"), 10) || 20, 100)
  const rows = await (service as any).listPosSessions(filters, {
    take: limit,
    order: { created_at: "DESC" },
  })

  return res.json({ pos_sessions: rows })
}

/**
 * POST /admin/pos/sessions
 *   body: { customer_id?, metadata? }
 *   → 201 { pos_session }
 *
 * Always created by the calling admin user. Sessions auto-expire
 * after POS_SESSION_TTL_HOURS (default 4h) — long enough for a
 * customer to step out and return, short enough to garbage-collect
 * abandoned sales.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  let body: z.infer<typeof createSchema>
  try {
    body = createSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }

  const actor = (req as any).auth_context?.actor_id
  if (!actor) {
    return res.status(401).json({ error: "no actor" })
  }

  const service = req.scope.resolve(POS_SESSION_MODULE) as POSSessionModuleService
  const expiresAt = new Date(Date.now() + POS_SESSION_TTL_HOURS * 3600_000)

  let created: any
  try {
    created = await (service as any).createPosSessions({
      created_by_user_id: actor,
      customer_id: body.customer_id ?? null,
      items: [],
      status: "active",
      expires_at: expiresAt,
      metadata: body.metadata ?? {},
    })
  } catch (err: any) {
    // Surface DB / model errors instead of letting a 500 with no body
    // make the admin UI show a generic "Failed to create POS session".
    // Most likely cause if this fires in prod: the pos_session migration
    // didn't run during deploy.
    return res.status(500).json({
      error: err?.message ?? "create failed",
      detail: err?.code ?? null,
    })
  }

  const session = Array.isArray(created) ? created[0] : created

  try {
    captureEvent(actor, "pos_session_created", {
      pos_session_id: session.id,
      has_customer: Boolean(body.customer_id),
    })
  } catch {
    /* best-effort */
  }

  return res.status(201).json({ pos_session: session })
}
