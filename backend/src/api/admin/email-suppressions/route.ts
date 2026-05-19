import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

import { ADMIN_WORKSPACE_MODULE } from "../../../modules/admin-workspace"
import { captureEvent } from "../../../lib/posthog"

const REASONS = ["user_unsubscribe", "bounce", "spam_complaint", "manual_admin"] as const

const addSchema = z.object({
  email: z.string().email(),
  template_kind: z.string().min(1).nullable().optional(),
  reason: z.enum(REASONS).optional().default("manual_admin"),
  notes: z.string().max(2000).nullable().optional(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  const q = req.query ?? {}
  const filters: Record<string, unknown> = {}
  if (q.email) filters.email = String(q.email).trim().toLowerCase()
  const rows = await service.listEmailSuppressions(filters, {
    take: 500,
    order: { created_at: "DESC" },
  })
  return res.json({ suppressions: rows })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  let body: z.infer<typeof addSchema>
  try {
    body = addSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  const email = body.email.trim().toLowerCase()
  const template_kind = body.template_kind ?? null
  const existing = await service.listEmailSuppressions(
    { email, template_kind },
    { take: 1 }
  )
  if ((existing as any[]).length > 0) {
    return res.json({ suppression: (existing as any[])[0], duplicate: true })
  }
  const created = await service.createEmailSuppressions({
    email,
    template_kind,
    reason: body.reason,
    source: "admin_added",
    notes: body.notes ?? null,
  })
  try {
    captureEvent(
      (req as any).auth_context?.actor_id ?? "admin",
      "marketing_suppression_added",
      {
        email,
        template_kind,
        reason: body.reason,
        source: "admin",
      }
    )
  } catch {
    /* best-effort */
  }
  return res.status(201).json({ suppression: created })
}
