import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "zod"

import { TASK_MODULE } from "../../../modules/task"
import { writeAudit } from "../../../lib/audit-log"
import { AUDIT_ACTION, AUDIT_ENTITY } from "../../../lib/audit-entities"
import { captureEvent } from "../../../lib/posthog"

const STATUS = ["open", "in_progress", "done", "cancelled"] as const
const PRIORITY = ["low", "normal", "high", "urgent"] as const

const createSchema = z.object({
  assignee_user_id: z.string().min(1),
  customer_id: z.string().nullable().optional(),
  order_id: z.string().nullable().optional(),
  quote_id: z.string().nullable().optional(),
  organisation_id: z.string().nullable().optional(),
  title: z.string().min(1).max(200),
  body: z.string().max(8000).nullable().optional(),
  due_at: z.string().datetime().nullable().optional(),
  priority: z.enum(PRIORITY).optional().default("normal"),
})

/**
 * GET /admin/tasks — list with rich filters:
 *   ?assignee_user_id=u_xxx
 *   ?status=open,in_progress     (csv, default = active)
 *   ?customer_id=, ?order_id=, ?quote_id=, ?organisation_id=
 *   ?due_before=ISO   (returns rows due before this datetime)
 *   ?owned_by_me=1    (filter by req.auth_context.actor_id)
 *   ?limit=50         (default 200, max 500)
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve(TASK_MODULE) as any
  const q = req.query ?? {}
  const filters: Record<string, unknown> = {}

  const statusList = String(q.status ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  if (statusList.length > 0) filters.status = statusList

  const ownedByMe = String(q.owned_by_me ?? "")
  if (ownedByMe === "1" || ownedByMe.toLowerCase() === "true") {
    const actor = (req as any).auth_context?.actor_id
    if (actor) filters.assignee_user_id = actor
  } else if (q.assignee_user_id) {
    filters.assignee_user_id = String(q.assignee_user_id)
  }

  for (const f of [
    "customer_id",
    "order_id",
    "quote_id",
    "organisation_id",
  ] as const) {
    if (q[f]) filters[f] = String(q[f])
  }

  const limit = Math.min(Number.parseInt(String(q.limit ?? "200"), 10) || 200, 500)
  const rows = await service.listTasks(filters, {
    take: limit,
    order: { due_at: "ASC", created_at: "DESC" },
  })

  // Post-filter on due_before (Mikro filter syntax for nullable datetimes
  // is finicky; cheaper to filter in JS for the small list sizes here).
  const dueBefore = q.due_before ? Date.parse(String(q.due_before)) : NaN
  const filtered = Number.isFinite(dueBefore)
    ? (rows as any[]).filter((r: any) => {
        if (!r.due_at) return false
        const ts =
          r.due_at instanceof Date ? r.due_at.getTime() : Date.parse(String(r.due_at))
        return ts < dueBefore
      })
    : rows
  return res.json({ tasks: filtered })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  let body: z.infer<typeof createSchema>
  try {
    body = createSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }
  const actor = (req as any).auth_context?.actor_id ?? null
  const service = req.scope.resolve(TASK_MODULE) as any

  const created = await service.createTasks({
    assignee_user_id: body.assignee_user_id,
    customer_id: body.customer_id ?? null,
    order_id: body.order_id ?? null,
    quote_id: body.quote_id ?? null,
    organisation_id: body.organisation_id ?? null,
    title: body.title.trim(),
    body: body.body?.trim() ?? null,
    due_at: body.due_at ? new Date(body.due_at) : null,
    status: "open",
    priority: body.priority ?? "normal",
    created_by: actor,
  })

  // Audit on every entity the task is anchored to. The polymorphic
  // entity here is the task itself, but emitting against customer /
  // order etc. surfaces it on those entities' Activity timelines.
  const tk = (created as any)?.id ?? null
  const auditDetails = { task_id: tk, title: body.title, due_at: body.due_at ?? null }
  for (const [entity, id] of [
    [AUDIT_ENTITY.CUSTOMER, body.customer_id],
    [AUDIT_ENTITY.ORDER, body.order_id],
    [AUDIT_ENTITY.QUOTE, body.quote_id],
    [AUDIT_ENTITY.ORGANISATION, body.organisation_id],
  ] as const) {
    if (id) {
      await writeAudit({
        container: req.scope as any,
        entity,
        entity_id: id,
        action: AUDIT_ACTION.CREATED,
        actor_id: actor,
        details: auditDetails,
      })
    }
  }
  try {
    captureEvent(actor ?? "system", "task_created", {
      task_id: tk,
      assignee_user_id: body.assignee_user_id,
      has_due_date: Boolean(body.due_at),
      priority: body.priority ?? "normal",
    })
  } catch {
    /* best-effort */
  }
  return res.status(201).json({ task: created })
}
