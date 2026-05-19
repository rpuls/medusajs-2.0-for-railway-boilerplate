import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { TASK_MODULE } from "../../../../modules/task"
import {
  isDueToday,
  isOverdue,
  type TaskRow,
} from "../../../../services/tasks/build-candidates"

/**
 * GET /admin/tasks/mine?bucket=today|overdue|all
 *
 * Convenience endpoint for the "My tasks" admin page — filters by
 * `assignee_user_id = req.auth_context.actor_id` automatically.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const actor = (req as any).auth_context?.actor_id
  if (!actor) {
    return res.status(401).json({ error: "no actor" })
  }
  const bucket = String(req.query?.bucket ?? "today")
  const service = req.scope.resolve(TASK_MODULE) as any

  // Pull active rows once and split into buckets in JS — small N.
  const all: TaskRow[] = await service.listTasks(
    { assignee_user_id: actor, status: ["open", "in_progress"] },
    { take: 500, order: { due_at: "ASC", created_at: "DESC" } }
  )

  if (bucket === "today") {
    const now = new Date()
    return res.json({
      tasks: all.filter((r) => isDueToday(r, now)),
      bucket,
    })
  }
  if (bucket === "overdue") {
    const now = new Date()
    return res.json({
      tasks: all.filter((r) => isOverdue(r, now)),
      bucket,
    })
  }
  // Default: everything assigned to me, active.
  return res.json({ tasks: all, bucket: "all" })
}
