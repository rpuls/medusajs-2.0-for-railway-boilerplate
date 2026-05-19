import type { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

import { STALE_ORDER_ESCALATION_DAYS, STALE_ORDER_MANAGER_EMAIL } from "../../lib/constants"
import { getOwner } from "../../lib/crm-owners"
import { AUDIT_ACTION, AUDIT_ENTITY } from "../../lib/audit-entities"
import { writeAudit } from "../../lib/audit-log"
import { TASK_MODULE } from "../../modules/task"
import { captureEvent } from "../../lib/posthog"

import type { StaleOrderEntry } from "./scan"

export type NotifyResult = {
  tasks_created: number
  owners_notified: number
  managers_escalated: number
}

const PRIORITY_BY_DAYS = (days: number): "high" | "urgent" => (days >= 7 ? "urgent" : "high")

/**
 * Phase 11 side-effects for newly-stale orders:
 *
 *   1. Look up the order's owner (or the customer's owner as a
 *      fallback). Record `audit_log` against the order (so the
 *      Activity tab surfaces it) and create a Task for the owner.
 *   2. If the order is still stale after STALE_ORDER_ESCALATION_DAYS
 *      additional days (so total = THRESHOLD + ESCALATION_DAYS
 *      since the stage changed), and a manager inbox is configured,
 *      flag the row for the manager-escalation channel.
 *
 * The "send email" step is intentionally not wired here — proper
 * staff-alert email templates ship in a follow-up. The PostHog event
 * `stale_order_notified_owner` + audit row + Task creation give
 * staff the surfacing they need today via /app/tasks and the order
 * Activity tab.
 */
export async function notifyStaleOrders(
  container: MedusaContainer,
  entries: StaleOrderEntry[],
  options: { now?: Date } = {}
): Promise<NotifyResult> {
  const now = options.now ?? new Date()
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const orderService = container.resolve(Modules.ORDER) as any
  const taskService = container.resolve(TASK_MODULE) as any

  let tasksCreated = 0
  let ownersNotified = 0
  let managersEscalated = 0

  for (const e of entries) {
    // 1) Resolve owner — order owner first, customer owner as fallback.
    let ownerUserId: string | null = null
    try {
      const ord = await getOwner({
        container,
        entity: AUDIT_ENTITY.ORDER,
        entity_id: e.order_id,
      })
      ownerUserId = ord?.user_id ?? null
    } catch {
      /* soft fail */
    }
    if (!ownerUserId && e.customer_id) {
      try {
        const cust = await getOwner({
          container,
          entity: AUDIT_ENTITY.CUSTOMER,
          entity_id: e.customer_id,
        })
        ownerUserId = cust?.user_id ?? null
      } catch {
        /* soft fail */
      }
    }

    if (ownerUserId) {
      // Create the Phase 7 task. Note: idempotency at the task level
      // would require checking for an existing open task — out of
      // scope. In practice the daily cron only fires "newly stale"
      // so the task lands once per stale streak.
      try {
        await taskService.createTasks({
          assignee_user_id: ownerUserId,
          order_id: e.order_id,
          customer_id: e.customer_id,
          title: `Investigate stale order #${e.display_id ?? e.order_id.slice(-6)}`,
          body: `Order has been in "${e.stage}" for ${e.days_in_stage} days. Move it forward or surface a blocker.`,
          due_at: new Date(now.getTime() + 86400000), // 1 day from now
          status: "open",
          priority: PRIORITY_BY_DAYS(e.days_in_stage),
          created_by: "system_stale_orders",
        })
        tasksCreated += 1
      } catch (err: any) {
        logger.warn(
          `stale-orders/notify: createTask failed for ${e.order_id}: ${err?.message ?? err}`
        )
      }

      await writeAudit({
        container,
        entity: AUDIT_ENTITY.ORDER,
        entity_id: e.order_id,
        action: AUDIT_ACTION.STATUS_CHANGED,
        actor_id: "system",
        details: {
          kind: "stale_order_owner_notified",
          owner_user_id: ownerUserId,
          stage: e.stage,
          days_in_stage: e.days_in_stage,
        },
      })
      try {
        captureEvent(ownerUserId, "stale_order_notified_owner", {
          order_id: e.order_id,
          stage: e.stage,
          days_in_stage: e.days_in_stage,
        })
      } catch {
        /* best-effort */
      }
      ownersNotified += 1
    }

    // 2) Manager escalation — fires once per stale streak. We stamp
    //    `metadata.stale_escalated_at` after the first manager mention
    //    so subsequent runs no-op until the order moves stage and
    //    becomes "newly stale" again (which clears the flag).
    if (STALE_ORDER_MANAGER_EMAIL && e.days_in_stage >= STALE_ORDER_ESCALATION_DAYS) {
      try {
        const order = await orderService.retrieveOrder(e.order_id)
        const meta = (order?.metadata ?? {}) as Record<string, unknown>
        if (!meta.stale_escalated_at) {
          await orderService.updateOrders(e.order_id, {
            metadata: { ...meta, stale_escalated_at: now.toISOString() },
          })
          await writeAudit({
            container,
            entity: AUDIT_ENTITY.ORDER,
            entity_id: e.order_id,
            action: AUDIT_ACTION.STATUS_CHANGED,
            actor_id: "system",
            details: {
              kind: "stale_order_manager_escalated",
              days_in_stage: e.days_in_stage,
              manager_recipients: STALE_ORDER_MANAGER_EMAIL,
            },
          })
          try {
            captureEvent("system", "stale_order_escalated_to_manager", {
              order_id: e.order_id,
              days_in_stage: e.days_in_stage,
            })
          } catch {
            /* best-effort */
          }
          managersEscalated += 1
        }
      } catch (err: any) {
        logger.warn(
          `stale-orders/notify: manager escalation failed for ${e.order_id}: ${err?.message ?? err}`
        )
      }
    }
  }

  return { tasks_created: tasksCreated, owners_notified: ownersNotified, managers_escalated: managersEscalated }
}
