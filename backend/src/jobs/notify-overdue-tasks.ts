import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"

import {
  ADMIN_PUBLIC_URL,
  BACKEND_URL,
  TASKS_OVERDUE_CRON_ENABLED,
} from "../lib/constants"
import { TASK_MODULE } from "../modules/task"
import { writeAudit } from "../lib/audit-log"
import { AUDIT_ACTION, AUDIT_ENTITY } from "../lib/audit-entities"
import {
  selectOverdueForNotification,
  type TaskRow,
} from "../services/tasks/build-candidates"
import { captureEvent } from "../lib/posthog"
import { EmailTemplates } from "../modules/email-notifications/templates"

/**
 * Daily 09:00 UTC. Opt-in via `TASKS_OVERDUE_CRON_ENABLED=true`.
 *
 * For each task that's overdue + outside the 23h notification cooldown:
 *   1. Stamp `last_overdue_notified_at = now` (idempotency)
 *   2. Write an audit row (per entity the task is anchored to)
 *   3. Emit a `task_overdue_notified` PostHog event so the dashboard
 *      can surface "N teammates have overdue work this week"
 *
 * Email/Slack delivery is intentionally deferred to a follow-up — for
 * v1 the audit + studio bucket is enough surfacing (Studio dashboard
 * extension comes in the same Phase 7 follow-up).
 */
export default async function notifyOverdueTasksJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (!TASKS_OVERDUE_CRON_ENABLED) {
    logger.info(
      "notify-overdue-tasks: TASKS_OVERDUE_CRON_ENABLED not 'true' — skipping."
    )
    return
  }

  const service = container.resolve(TASK_MODULE) as any
  const now = new Date()

  let candidates: TaskRow[] = []
  try {
    candidates = await service.listTasks(
      { status: ["open", "in_progress"] },
      { take: 1000 }
    )
  } catch (err: any) {
    logger.warn(`notify-overdue-tasks: list failed: ${err?.message ?? err}`)
    return
  }

  const ids = selectOverdueForNotification(candidates, now)
  if (ids.length === 0) {
    logger.info("notify-overdue-tasks: no candidates.")
    return
  }

  let notified = 0
  for (const id of ids) {
    const task = candidates.find((r) => r.id === id) as any
    if (!task) continue
    try {
      await service.updateTasks(id, { last_overdue_notified_at: now })

      // Audit on every anchored entity so each entity's timeline shows
      // the overdue notification.
      const details = {
        task_id: id,
        assignee_user_id: task.assignee_user_id,
        due_at: task.due_at,
        notified_at: now.toISOString(),
      }
      for (const [entity, entId] of [
        [AUDIT_ENTITY.CUSTOMER, task.customer_id],
        [AUDIT_ENTITY.ORDER, task.order_id],
        [AUDIT_ENTITY.QUOTE, task.quote_id],
        [AUDIT_ENTITY.ORGANISATION, task.organisation_id],
      ] as const) {
        if (entId) {
          await writeAudit({
            container,
            entity,
            entity_id: entId,
            action: AUDIT_ACTION.STATUS_CHANGED,
            actor_id: "system",
            details: { ...details, kind: "task_overdue_notified" },
          })
        }
      }

      const daysOverdue = Math.max(
        0,
        Math.round(
          (now.getTime() -
            (task.due_at ? new Date(task.due_at).getTime() : now.getTime())) /
            86400000
        )
      )

      try {
        captureEvent(task.assignee_user_id, "task_overdue_notified", {
          task_id: id,
          days_overdue: daysOverdue,
        })
      } catch {
        /* best-effort */
      }

      // Resolve assignee email + send the overdue notification email.
      try {
        const userService = container.resolve(Modules.USER) as any
        const user = await userService.retrieveUser(task.assignee_user_id)
        const assigneeEmail =
          typeof user?.email === "string" ? user.email : null
        if (assigneeEmail) {
          const notificationService = container.resolve(
            Modules.NOTIFICATION
          ) as any
          const taskUrl = ADMIN_PUBLIC_URL
            ? `${ADMIN_PUBLIC_URL.replace(/\/$/, "")}/app/tasks`
            : `${BACKEND_URL.replace(/\/$/, "")}/app/tasks`
          await notificationService.createNotifications({
            to: assigneeEmail,
            channel: "email",
            template: EmailTemplates.TASK_OVERDUE,
            data: {
              emailOptions: {
                subject: `Overdue task: ${task.title}`,
              },
              task: {
                title: task.title,
                body: task.body ?? null,
                daysOverdue,
                priority: task.priority ?? "normal",
                dueAt: task.due_at
                  ? new Date(task.due_at).toISOString()
                  : null,
                anchor: task.order_id
                  ? {
                      kind: "order",
                      id: task.order_id,
                      displayId: null,
                      label: null,
                    }
                  : task.customer_id
                    ? {
                        kind: "customer",
                        id: task.customer_id,
                        label: null,
                      }
                    : task.quote_id
                      ? {
                          kind: "quote",
                          id: task.quote_id,
                          publicId: null,
                        }
                      : task.organisation_id
                        ? {
                            kind: "organisation",
                            id: task.organisation_id,
                            name: null,
                          }
                        : { kind: "none" },
                taskUrl,
              },
            },
          })
        }
      } catch (err: any) {
        // Soft-fail: audit + PostHog signals are still surfaced for the
        // /app/tasks page. Email is best-effort.
        logger.warn(
          `notify-overdue-tasks: email send failed for task ${id}: ${err?.message ?? err}`
        )
      }

      notified += 1
    } catch (err: any) {
      logger.warn(
        `notify-overdue-tasks: failed for ${id}: ${err?.message ?? err}`
      )
    }
  }

  logger.info(
    `notify-overdue-tasks: considered=${candidates.length}, notified=${notified}`
  )
}

export const config = {
  name: "notify-overdue-tasks",
  schedule: "0 9 * * *",
}
