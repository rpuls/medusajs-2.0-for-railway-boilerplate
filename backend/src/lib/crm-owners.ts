import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"

import { ADMIN_WORKSPACE_MODULE } from "../modules/admin-workspace"
import { writeAudit } from "./audit-log"
import {
  AUDIT_ACTION,
  AUDIT_ENTITY,
  type AuditEntity,
} from "./audit-entities"
import { captureEvent } from "./posthog"

export type OwnerEntity = Extract<AuditEntity, "customer" | "order">

export type SetOwnerInput = {
  container: MedusaContainer
  entity: OwnerEntity
  entity_id: string
  user_id: string
  actor?: string | null
  reason?: string | null
}

export type GetOwnerResult = {
  assignment_id: string
  user_id: string
  assigned_at: string
  assigned_by: string | null
  reason: string | null
} | null

/**
 * Set the owner of a customer or order. Idempotent — if the entity
 * already has an assignment row linked via the module link, the row
 * is updated; otherwise a new row + link is created.
 *
 * Writes an `audit_log` row (`action: owner_changed`) and emits a
 * PostHog `owner_assigned` event.
 */
export async function setOwner(input: SetOwnerInput): Promise<void> {
  const { container, entity, entity_id, user_id, actor, reason } = input
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const ws = container.resolve(ADMIN_WORKSPACE_MODULE) as any
  const link = container.resolve(ContainerRegistrationKeys.LINK) as any
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any

  const linkConfig =
    entity === AUDIT_ENTITY.CUSTOMER
      ? { source: Modules.CUSTOMER, sourceField: "customer_id" }
      : { source: Modules.ORDER, sourceField: "order_id" }

  // 1) Look up the existing assignment row (if any) via the link.
  let existingAssignmentId: string | null = null
  let previousUserId: string | null = null
  try {
    const { data } = await query.graph({
      entity: entity === AUDIT_ENTITY.CUSTOMER ? "customer" : "order",
      fields: ["id", "crm_owner_assignment.id", "crm_owner_assignment.user_id"],
      filters: { id: entity_id },
      pagination: { take: 1 },
    })
    const row = (data as any[])?.[0]
    const assignment = row?.crm_owner_assignment
    if (assignment?.id) {
      existingAssignmentId = assignment.id
      previousUserId = assignment.user_id ?? null
    }
  } catch (err: any) {
    logger.warn(
      `setOwner: lookup failed for ${entity}/${entity_id}: ${err?.message ?? err}`
    )
  }

  // 2) Upsert the assignment row.
  let assignmentId = existingAssignmentId
  if (assignmentId) {
    try {
      await ws.updateCrmOwnerAssignments(assignmentId, {
        user_id,
        assigned_at: new Date(),
        assigned_by: actor ?? null,
        reason: reason ?? null,
      })
    } catch (err: any) {
      logger.warn(
        `setOwner: update failed for ${entity}/${entity_id}: ${err?.message ?? err}`
      )
      return
    }
  } else {
    try {
      const created = await ws.createCrmOwnerAssignments({
        user_id,
        assigned_at: new Date(),
        assigned_by: actor ?? null,
        reason: reason ?? null,
      })
      assignmentId = (created as any)?.id ?? null
      if (!assignmentId) {
        logger.warn(
          `setOwner: createCrmOwnerAssignments returned no id for ${entity}/${entity_id}`
        )
        return
      }
      // 3) Create the module link so graph queries can traverse it.
      try {
        await link.create({
          [linkConfig.source]: { [linkConfig.sourceField]: entity_id },
          [ADMIN_WORKSPACE_MODULE]: {
            crm_owner_assignment_id: assignmentId,
          },
        })
      } catch (err: any) {
        logger.warn(
          `setOwner: link.create failed for ${entity}/${entity_id}: ${err?.message ?? err}`
        )
      }
    } catch (err: any) {
      logger.warn(
        `setOwner: create failed for ${entity}/${entity_id}: ${err?.message ?? err}`
      )
      return
    }
  }

  // 4) Audit + PostHog.
  await writeAudit({
    container,
    entity,
    entity_id,
    action: AUDIT_ACTION.OWNER_CHANGED,
    actor_id: actor ?? null,
    details: {
      from_user_id: previousUserId,
      to_user_id: user_id,
      reason: reason ?? null,
    },
  })
  try {
    captureEvent(actor ?? "system", "owner_assigned", {
      entity,
      entity_id,
      user_id,
      previous_user_id: previousUserId,
    })
  } catch {
    /* best-effort */
  }
}

/**
 * Clear the owner of a customer or order. Deletes the assignment row
 * AND the module link.
 */
export async function clearOwner(input: {
  container: MedusaContainer
  entity: OwnerEntity
  entity_id: string
  actor?: string | null
}): Promise<void> {
  const { container, entity, entity_id, actor } = input
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const ws = container.resolve(ADMIN_WORKSPACE_MODULE) as any
  const link = container.resolve(ContainerRegistrationKeys.LINK) as any
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any

  const linkConfig =
    entity === AUDIT_ENTITY.CUSTOMER
      ? { source: Modules.CUSTOMER, sourceField: "customer_id" }
      : { source: Modules.ORDER, sourceField: "order_id" }

  let assignmentId: string | null = null
  let previousUserId: string | null = null
  try {
    const { data } = await query.graph({
      entity: entity === AUDIT_ENTITY.CUSTOMER ? "customer" : "order",
      fields: ["id", "crm_owner_assignment.id", "crm_owner_assignment.user_id"],
      filters: { id: entity_id },
      pagination: { take: 1 },
    })
    const row = (data as any[])?.[0]
    if (row?.crm_owner_assignment?.id) {
      assignmentId = row.crm_owner_assignment.id
      previousUserId = row.crm_owner_assignment.user_id ?? null
    }
  } catch (err: any) {
    logger.warn(`clearOwner: lookup failed: ${err?.message ?? err}`)
  }

  if (!assignmentId) return

  try {
    await link.dismiss({
      [linkConfig.source]: { [linkConfig.sourceField]: entity_id },
      [ADMIN_WORKSPACE_MODULE]: {
        crm_owner_assignment_id: assignmentId,
      },
    })
  } catch (err: any) {
    logger.warn(`clearOwner: link.dismiss failed: ${err?.message ?? err}`)
  }
  try {
    await ws.deleteCrmOwnerAssignments([assignmentId])
  } catch (err: any) {
    logger.warn(`clearOwner: delete failed: ${err?.message ?? err}`)
  }

  await writeAudit({
    container,
    entity,
    entity_id,
    action: AUDIT_ACTION.UNASSIGNED,
    actor_id: actor ?? null,
    details: { from_user_id: previousUserId },
  })
  try {
    captureEvent(actor ?? "system", "owner_cleared", {
      entity,
      entity_id,
      previous_user_id: previousUserId,
    })
  } catch {
    /* best-effort */
  }
}

/**
 * Look up the current owner of a customer or order. Returns `null`
 * when un-owned.
 */
export async function getOwner(input: {
  container: MedusaContainer
  entity: OwnerEntity
  entity_id: string
}): Promise<GetOwnerResult> {
  const { container, entity, entity_id } = input
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any

  try {
    const { data } = await query.graph({
      entity: entity === AUDIT_ENTITY.CUSTOMER ? "customer" : "order",
      fields: [
        "id",
        "crm_owner_assignment.id",
        "crm_owner_assignment.user_id",
        "crm_owner_assignment.assigned_at",
        "crm_owner_assignment.assigned_by",
        "crm_owner_assignment.reason",
      ],
      filters: { id: entity_id },
      pagination: { take: 1 },
    })
    const a = (data as any[])?.[0]?.crm_owner_assignment
    if (!a?.id) return null
    return {
      assignment_id: a.id,
      user_id: a.user_id,
      assigned_at:
        a.assigned_at instanceof Date
          ? a.assigned_at.toISOString()
          : String(a.assigned_at ?? ""),
      assigned_by: a.assigned_by ?? null,
      reason: a.reason ?? null,
    }
  } catch {
    return null
  }
}

/**
 * Pick the next staff user from the rotation table. Returns `null` if
 * no rotation rows are enabled. Updates the picked row's
 * `last_picked_at` so subsequent calls hand off to the next member.
 *
 * Algorithm: of enabled rows, pick the one whose `last_picked_at` is
 * oldest (or null = never picked), with `position` as tiebreaker.
 * This makes rotation order configurable + fair without a strict
 * cursor.
 */
export async function pickNextOwner(input: {
  container: MedusaContainer
}): Promise<{ user_id: string } | null> {
  const { container } = input
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const ws = container.resolve(ADMIN_WORKSPACE_MODULE) as any

  let rows: Array<{
    id: string
    user_id: string
    enabled: boolean
    position: number
    last_picked_at: Date | string | null
  }> = []
  try {
    rows = await ws.listCrmOwnerRotations(
      { enabled: true },
      { take: 100 }
    )
  } catch (err: any) {
    logger.warn(`pickNextOwner: list failed: ${err?.message ?? err}`)
    return null
  }

  if (rows.length === 0) return null

  // Sort: never-picked first, then oldest-picked first, then by position.
  const sorted = [...rows].sort((a, b) => {
    const aTs = a.last_picked_at
      ? new Date(a.last_picked_at as any).getTime()
      : 0
    const bTs = b.last_picked_at
      ? new Date(b.last_picked_at as any).getTime()
      : 0
    if (aTs !== bTs) return aTs - bTs
    return (a.position ?? 100) - (b.position ?? 100)
  })

  const next = sorted[0]
  try {
    await ws.updateCrmOwnerRotations(next.id, {
      last_picked_at: new Date(),
    })
  } catch (err: any) {
    logger.warn(`pickNextOwner: update failed: ${err?.message ?? err}`)
    // Continue — returning the user even without the bookkeeping update
    // is better than returning null and refusing to assign anyone.
  }

  try {
    captureEvent("system", "owner_round_robin_picked", {
      user_id: next.user_id,
      rotation_size: rows.length,
    })
  } catch {
    /* best-effort */
  }

  return { user_id: next.user_id }
}
