import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"

import { TASK_MODULE } from "../../../../modules/task"
import { captureEvent } from "../../../../lib/posthog"

const STATUS = ["open", "in_progress", "done", "cancelled"] as const
const PRIORITY = ["low", "normal", "high", "urgent"] as const

const patchSchema = z.object({
  assignee_user_id: z.string().min(1).optional(),
  title: z.string().min(1).max(200).optional(),
  body: z.string().max(8000).nullable().optional(),
  due_at: z.string().datetime().nullable().optional(),
  status: z.enum(STATUS).optional(),
  priority: z.enum(PRIORITY).optional(),
})

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  const service = req.scope.resolve(TASK_MODULE) as any
  try {
    const task = await service.retrieveTask(id)
    return res.json({ task })
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Task not found")
  }
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  let body: z.infer<typeof patchSchema>
  try {
    body = patchSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }
  const actor = (req as any).auth_context?.actor_id ?? null
  const service = req.scope.resolve(TASK_MODULE) as any

  let previous: any
  try {
    previous = await service.retrieveTask(id)
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Task not found")
  }

  const update: Record<string, unknown> = {}
  for (const field of ["assignee_user_id", "title", "priority"] as const) {
    if (body[field] !== undefined && body[field] !== previous[field]) {
      update[field] = body[field]
    }
  }
  if (body.body !== undefined) update.body = body.body ?? null
  if (body.due_at !== undefined) {
    update.due_at = body.due_at ? new Date(body.due_at) : null
  }
  if (body.status !== undefined && body.status !== previous.status) {
    update.status = body.status
    if (body.status === "done" || body.status === "cancelled") {
      if (!previous.completed_at) {
        update.completed_at = new Date()
        update.completed_by = actor
      }
    } else {
      // Reverting to open / in_progress clears completion stamps.
      update.completed_at = null
      update.completed_by = null
    }
  }

  if (Object.keys(update).length === 0) {
    return res.json({ task: previous, noop: true })
  }

  const updated = await service.updateTasks(id, update)

  if (body.status === "done") {
    try {
      const createdAt = previous?.created_at
        ? new Date(previous.created_at).getTime()
        : Date.now()
      captureEvent(actor ?? "system", "task_completed", {
        task_id: id,
        days_open: Math.max(
          0,
          Math.round((Date.now() - createdAt) / 86400000)
        ),
      })
    } catch {
      /* best-effort */
    }
  }

  return res.json({ task: updated })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  const service = req.scope.resolve(TASK_MODULE) as any
  try {
    await service.deleteTasks([id])
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Task not found")
  }
  return res.json({ id, deleted: true })
}
