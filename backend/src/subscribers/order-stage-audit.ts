import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"

import {
  PRODUCTION_STAGE_EVENT,
  type ProductionStageChangedEvent,
} from "../lib/production-stage"
import { ADMIN_WORKSPACE_MODULE } from "../modules/admin-workspace"

/**
 * Mirrors every production_stage_changed event into the audit_log
 * table with `entity = "order"` so the per-order Activity tab can show
 * a unified timeline.
 *
 * The stage history itself lives on order.metadata for performance —
 * audit_log is the human-readable layer on top, populated only for
 * events the operator cares to read back.
 */
export default async function orderStageAuditHandler({
  event: { data },
  container,
}: SubscriberArgs<ProductionStageChangedEvent>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (!data?.order_id) return
  const service = container.resolve(ADMIN_WORKSPACE_MODULE) as any
  try {
    await service.createAuditLogs({
      entity: "order",
      entity_id: data.order_id,
      action: "stage_changed",
      actor_id: data.changed_by ?? null,
      actor_email: null,
      details: {
        from_stage: data.from_stage,
        to_stage: data.to_stage,
        note: data.note ?? null,
        changed_at: data.changed_at,
      },
    })
  } catch (err: any) {
    logger.warn(
      `order-stage-audit: failed to write audit_log for ${data.order_id}: ${err?.message ?? err}`
    )
  }
}

export const config: SubscriberConfig = {
  event: PRODUCTION_STAGE_EVENT,
}
