import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import {
  IEventBusModuleService,
  IOrderModuleService,
} from "@medusajs/framework/types"

import {
  PRODUCTION_STAGE_EVENT,
  isProductionStage,
  type ProductionStage,
  type ProductionStageChangedEvent,
  type ProductionStageHistoryEntry,
} from "../../../../../lib/production-stage"

/**
 * POST /admin/orders/bulk/production-stage
 *   { order_ids: string[], stage: ProductionStage, note?: string }
 *
 * Move N orders to the same stage in one shot. Same logic as the
 * single-order endpoint per order — same-stage no-ops are skipped, an
 * event is emitted per actually-changed order so subscribers (emails,
 * audit log, alerts) all fire correctly.
 *
 * Caps at 200 orders per call.
 */
const MAX_BATCH = 200

type ResultRow = {
  order_id: string
  changed: boolean
  from_stage: ProductionStage | null
  to_stage: ProductionStage
  error?: string
}

const readCurrentStage = (meta: Record<string, unknown>): ProductionStage | null => {
  const cur = meta?.production_stage
  if (typeof cur === "string" && isProductionStage(cur)) return cur
  return null
}

const readHistory = (
  meta: Record<string, unknown>
): ProductionStageHistoryEntry[] => {
  const raw = meta?.production_stage_history
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (e: any) =>
      e &&
      typeof e === "object" &&
      typeof e.stage === "string" &&
      typeof e.changed_at === "string"
  ) as ProductionStageHistoryEntry[]
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body ?? {}) as any
  if (!Array.isArray(body.order_ids) || body.order_ids.length === 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "order_ids must be a non-empty array"
    )
  }
  if (body.order_ids.length > MAX_BATCH) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Batch too large (${body.order_ids.length}). Max ${MAX_BATCH} per call.`
    )
  }
  if (!isProductionStage(body.stage)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid stage: ${body.stage}`
    )
  }
  const note: string | null =
    typeof body.note === "string" && body.note.trim().length > 0
      ? body.note.trim()
      : null

  const orderModuleService = req.scope.resolve<IOrderModuleService>(Modules.ORDER)
  const eventBus = req.scope.resolve<IEventBusModuleService>(Modules.EVENT_BUS)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const changedAt = new Date().toISOString()
  const changedBy =
    (req as any).auth_context?.actor_id ??
    (req as any).auth_context?.app_metadata?.user_id ??
    null

  const toStage = body.stage as ProductionStage
  const results: ResultRow[] = []
  for (const orderId of body.order_ids as string[]) {
    if (typeof orderId !== "string" || orderId.length === 0) {
      results.push({
        order_id: String(orderId),
        changed: false,
        from_stage: null,
        to_stage: toStage,
        error: "invalid order id",
      })
      continue
    }
    let order: any
    try {
      order = await orderModuleService.retrieveOrder(orderId)
    } catch (err: any) {
      results.push({
        order_id: orderId,
        changed: false,
        from_stage: null,
        to_stage: toStage,
        error: `not found`,
      })
      continue
    }

    const meta = (order.metadata ?? {}) as Record<string, unknown>
    const fromStage = readCurrentStage(meta)
    if (fromStage === toStage) {
      results.push({
        order_id: orderId,
        changed: false,
        from_stage: fromStage,
        to_stage: toStage,
      })
      continue
    }

    const history = readHistory(meta)
    const newEntry: ProductionStageHistoryEntry = {
      stage: toStage,
      changed_at: changedAt,
      changed_by: changedBy,
      note,
    }
    const nextHistory = [...history, newEntry]

    try {
      await orderModuleService.updateOrders(orderId, {
        metadata: {
          ...meta,
          production_stage: toStage,
          production_stage_changed_at: changedAt,
          production_stage_history: nextHistory,
        },
      })
    } catch (err: any) {
      results.push({
        order_id: orderId,
        changed: false,
        from_stage: fromStage,
        to_stage: toStage,
        error: `update failed: ${err?.message ?? err}`,
      })
      continue
    }

    const event: ProductionStageChangedEvent = {
      order_id: orderId,
      from_stage: fromStage,
      to_stage: toStage,
      changed_at: changedAt,
      changed_by: changedBy,
      note,
    }
    try {
      await eventBus.emit({ name: PRODUCTION_STAGE_EVENT, data: event })
    } catch (err: any) {
      logger.warn?.(
        `bulk-production-stage: failed to emit event for ${orderId}: ${err?.message ?? err}`
      )
    }
    results.push({
      order_id: orderId,
      changed: true,
      from_stage: fromStage,
      to_stage: toStage,
    })
  }

  return res.json({
    requested: body.order_ids.length,
    changed: results.filter((r) => r.changed).length,
    skipped: results.filter((r) => !r.changed && !r.error).length,
    failed: results.filter((r) => Boolean(r.error)).length,
    results,
  })
}
