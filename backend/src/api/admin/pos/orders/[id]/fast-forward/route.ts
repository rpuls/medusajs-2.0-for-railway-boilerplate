import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import type {
  IEventBusModuleService,
  IOrderModuleService,
} from "@medusajs/framework/types"
import { z } from "zod"

import {
  ARTWORK_STAGE_EVENT,
  BLANKS_STAGE_EVENT,
  PRODUCTION_STAGE_EVENT,
  type ProductionStageChangedEvent,
} from "../../../../../../lib/production-stage"
import { writeAudit } from "../../../../../../lib/audit-log"
import { AUDIT_ACTION, AUDIT_ENTITY } from "../../../../../../lib/audit-entities"
import { captureEvent } from "../../../../../../lib/posthog"

const bodySchema = z.object({
  target: z.enum(["delivered", "shipped", "in_production"]).default("delivered"),
  note: z.string().max(500).optional(),
})

/**
 * POST /admin/pos/orders/:id/fast-forward
 *   body: { target?: "delivered" | "shipped" | "in_production", note? }
 *   → { ok: true, applied: { production, artwork, blanks } }
 *
 * Single-shot "the customer is walking out the door with the goods"
 * shortcut. Stamps all three production tracks to terminal-for-target
 * states and emits the stage-changed events so subscribers (emails,
 * audit, automation rules) fire exactly as they would on a normal
 * advance. The default target is `delivered` which covers stock-item
 * pickup; staff can opt for `shipped` if the courier is coming later,
 * or `in_production` if it's a multi-day custom job they only want to
 * flag as approved + blanks-in-hand.
 *
 * Idempotent at the metadata level: if the order is already at the
 * target, we still re-emit so any missed subscriber (e.g. a freshly
 * added watcher) picks it up — that's typically what the user wants
 * when they click the button twice.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }

  const actor = (req as any).auth_context?.actor_id ?? "system"
  const orderModule = req.scope.resolve(Modules.ORDER) as IOrderModuleService
  const eventBus = req.scope.resolve(Modules.EVENT_BUS) as IEventBusModuleService

  let order: any
  try {
    order = await orderModule.retrieveOrder(orderId)
  } catch {
    return res.status(404).json({ error: "order not found" })
  }

  // Pick the terminal-state triple for the target.
  const targets =
    body.target === "delivered"
      ? {
          artwork: "approved" as const,
          blanks: "blanks_arrived" as const,
          production: "delivered" as const,
        }
      : body.target === "shipped"
        ? {
            artwork: "approved" as const,
            blanks: "blanks_arrived" as const,
            production: "shipped" as const,
          }
        : {
            artwork: "approved" as const,
            blanks: "blanks_arrived" as const,
            production: "in_production" as const,
          }

  const previous = (order.metadata ?? {}) as any
  const fromArtwork = previous.artwork_stage ?? null
  const fromBlanks = previous.blanks_stage ?? null
  const fromProduction =
    previous.production_stage ?? previous.legacy_production_stage ?? null

  const nowIso = new Date().toISOString()
  const newMetadata: Record<string, unknown> = {
    ...previous,
    artwork_stage: targets.artwork,
    blanks_stage: targets.blanks,
    production_stage: targets.production,
    pos_fast_forwarded_at: nowIso,
    pos_fast_forwarded_target: body.target,
  }

  await orderModule.updateOrders([
    { id: orderId, metadata: newMetadata },
  ])

  // Emit each track-event so the existing subscribers (emails,
  // automation rules, audit) fire as if the stages had advanced one
  // at a time. `from_stage` is the previous value so the dedupe logic
  // in `shouldEmailForStageTransition` correctly identifies forward
  // motion.
  const baseEvent = {
    order_id: orderId,
    changed_at: nowIso,
    changed_by: actor,
    note: body.note ?? "POS fast-forward",
  }

  await eventBus.emit({
    name: ARTWORK_STAGE_EVENT,
    data: {
      ...baseEvent,
      from_stage: fromArtwork,
      to_stage: targets.artwork,
      track: "artwork" as const,
    },
  })
  await eventBus.emit({
    name: BLANKS_STAGE_EVENT,
    data: {
      ...baseEvent,
      from_stage: fromBlanks,
      to_stage: targets.blanks,
      track: "blanks" as const,
    },
  })
  const productionEvent: ProductionStageChangedEvent = {
    ...baseEvent,
    from_stage: fromProduction as any,
    to_stage: targets.production as any,
    track: "production",
  }
  await eventBus.emit({
    name: PRODUCTION_STAGE_EVENT,
    data: productionEvent as any,
  })

  await writeAudit({
    container: req.scope as any,
    entity: AUDIT_ENTITY.ORDER,
    entity_id: orderId,
    action: AUDIT_ACTION.STAGE_CHANGED,
    actor_id: actor,
    details: {
      source: "pos_fast_forward",
      target: body.target,
      from: {
        artwork: fromArtwork,
        blanks: fromBlanks,
        production: fromProduction,
      },
      to: targets,
    },
  })

  try {
    captureEvent(actor, "pos_order_fast_forwarded", {
      order_id: orderId,
      target: body.target,
    })
  } catch {
    /* best-effort */
  }

  return res.json({ ok: true, applied: targets })
}
