import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"

import { ADMIN_WORKSPACE_MODULE } from "../modules/admin-workspace"
import { captureEvent } from "./posthog"
import type { AuditEntity, AuditAction } from "./audit-entities"

export type WriteAuditInput = {
  container: MedusaContainer
  entity: AuditEntity
  entity_id: string
  action: AuditAction
  actor_id?: string | null
  actor_email?: string | null
  details?: Record<string, unknown> | null
}

/**
 * Append a row to the polymorphic `audit_log` table. Used everywhere a
 * staff or system action needs to surface on the unified per-entity
 * Activity timeline (customer-journey widget, order audit-log endpoint,
 * organisation Activity tab).
 *
 * Failures are swallowed + logged — a missing audit row should never
 * kill the caller's primary action. PostHog mirror is best-effort.
 */
export async function writeAudit(input: WriteAuditInput): Promise<void> {
  const { container, entity, entity_id, action } = input
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  if (!entity_id) {
    logger.warn(`writeAudit: missing entity_id for ${entity}/${action}`)
    return
  }

  try {
    const service = container.resolve(ADMIN_WORKSPACE_MODULE) as any
    await service.createAuditLogs({
      entity,
      entity_id,
      action,
      actor_id: input.actor_id ?? null,
      actor_email: input.actor_email ?? null,
      details: input.details ?? null,
    })
  } catch (err: any) {
    logger.warn(
      `writeAudit: failed to write ${entity}/${entity_id}/${action}: ${err?.message ?? err}`
    )
    return
  }

  try {
    captureEvent(input.actor_id ?? "system", "audit_log_written", {
      entity,
      entity_id,
      action,
    })
  } catch {
    /* PostHog is best-effort */
  }
}
