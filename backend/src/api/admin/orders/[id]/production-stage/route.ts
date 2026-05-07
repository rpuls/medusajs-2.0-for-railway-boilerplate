import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type {
  IEventBusModuleService,
  IOrderModuleService,
} from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { z } from "zod"

import {
  PRODUCTION_STAGES,
  PRODUCTION_STAGE_EVENT,
  type ProductionStage,
  type ProductionStageChangedEvent,
  type ProductionStageHistoryEntry,
  isProductionStage,
} from "../../../../../lib/production-stage"

const paramsSchema = z.object({ id: z.string().min(1) })

const bodySchema = z.object({
  stage: z.enum(PRODUCTION_STAGES),
  note: z.string().trim().max(500).optional(),
})

type ProductionStageMetaShape = {
  production_stage?: unknown
  production_stage_changed_at?: unknown
  production_stage_history?: unknown
}

function readCurrentStage(meta: Record<string, unknown>): ProductionStage | null {
  const raw = (meta as ProductionStageMetaShape).production_stage
  return isProductionStage(raw) ? raw : null
}

function readHistory(meta: Record<string, unknown>): ProductionStageHistoryEntry[] {
  const raw = (meta as ProductionStageMetaShape).production_stage_history
  if (!Array.isArray(raw)) return []
  return raw.filter((entry): entry is ProductionStageHistoryEntry => {
    if (!entry || typeof entry !== "object") return false
    const stage = (entry as { stage?: unknown }).stage
    const changed_at = (entry as { changed_at?: unknown }).changed_at
    return isProductionStage(stage) && typeof changed_at === "string"
  })
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const params = paramsSchema.safeParse(req.params ?? {})
  if (!params.success) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, params.error.message)
  }

  const orderModuleService = req.scope.resolve<IOrderModuleService>(Modules.ORDER)
  let order: any
  try {
    order = await orderModuleService.retrieveOrder(params.data.id)
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Order "${params.data.id}" was not found.`
    )
  }

  const meta = (order.metadata ?? {}) as Record<string, unknown>
  return res.json({
    production_stage: readCurrentStage(meta),
    production_stage_changed_at:
      (meta as ProductionStageMetaShape).production_stage_changed_at ?? null,
    production_stage_history: readHistory(meta),
  })
}

/**
 * POST /admin/orders/:id/production-stage
 *
 * Sets the order's production stage, appending a history entry, and emits
 * `order.production_stage_changed` so the email subscriber can decide whether
 * to notify the customer.
 *
 * Re-applying the same stage is a no-op (no history entry, no event).
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const params = paramsSchema.safeParse(req.params ?? {})
  if (!params.success) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, params.error.message)
  }
  const body = bodySchema.parse(req.body ?? {})

  const orderModuleService = req.scope.resolve<IOrderModuleService>(Modules.ORDER)
  const eventBus = req.scope.resolve<IEventBusModuleService>(Modules.EVENT_BUS)

  let order: any
  try {
    order = await orderModuleService.retrieveOrder(params.data.id)
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Order "${params.data.id}" was not found.`
    )
  }

  const meta = (order.metadata ?? {}) as Record<string, unknown>
  const fromStage = readCurrentStage(meta)
  const toStage = body.stage
  const changedAt = new Date().toISOString()
  const changedBy =
    (req as any).auth_context?.actor_id ??
    (req as any).auth_context?.app_metadata?.user_id ??
    null

  if (fromStage === toStage) {
    return res.json({
      ok: true,
      changed: false,
      production_stage: toStage,
      production_stage_changed_at:
        (meta as ProductionStageMetaShape).production_stage_changed_at ?? null,
      production_stage_history: readHistory(meta),
    })
  }

  const history = readHistory(meta)
  const newEntry: ProductionStageHistoryEntry = {
    stage: toStage,
    changed_at: changedAt,
    changed_by: changedBy,
    note: body.note?.length ? body.note : null,
  }
  const nextHistory = [...history, newEntry]

  await orderModuleService.updateOrders(order.id, {
    metadata: {
      ...meta,
      production_stage: toStage,
      production_stage_changed_at: changedAt,
      production_stage_history: nextHistory,
    },
  })

  const event: ProductionStageChangedEvent = {
    order_id: order.id,
    from_stage: fromStage,
    to_stage: toStage,
    changed_at: changedAt,
    changed_by: changedBy,
    note: body.note?.length ? body.note : null,
  }

  try {
    await eventBus.emit({ name: PRODUCTION_STAGE_EVENT, data: event })
  } catch (err: any) {
    req.scope
      .resolve("logger")
      .error(
        `production-stage: failed to emit ${PRODUCTION_STAGE_EVENT} for order ${order.id}: ${
          err?.message ?? err
        }`
      )
  }

  return res.json({
    ok: true,
    changed: true,
    production_stage: toStage,
    production_stage_changed_at: changedAt,
    production_stage_history: nextHistory,
  })
}
