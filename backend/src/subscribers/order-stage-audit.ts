import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"

import {
  PRODUCTION_STAGE_EVENT,
  type ProductionStageChangedEvent,
} from "../lib/production-stage"
import { writeAudit } from "../lib/audit-log"
import { AUDIT_ACTION, AUDIT_ENTITY } from "../lib/audit-entities"

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
  if (!data?.order_id) return
  await writeAudit({
    container,
    entity: AUDIT_ENTITY.ORDER,
    entity_id: data.order_id,
    action: AUDIT_ACTION.STAGE_CHANGED,
    actor_id: data.changed_by ?? null,
    actor_email: null,
    details: {
      from_stage: data.from_stage,
      to_stage: data.to_stage,
      note: data.note ?? null,
      changed_at: data.changed_at,
    },
  })
}

export const config: SubscriberConfig = {
  event: PRODUCTION_STAGE_EVENT,
}
