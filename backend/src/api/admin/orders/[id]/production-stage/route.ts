import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type {
  IEventBusModuleService,
  IOrderModuleService,
} from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { z } from "zod"

import {
  ARTWORK_STAGES,
  ARTWORK_STAGE_EVENT,
  BLANKS_STAGES,
  BLANKS_STAGE_EVENT,
  DOWNSTREAM_STAGES,
  PRODUCTION_STAGES,
  PRODUCTION_STAGE_EVENT,
  deriveTracksFromLegacyStage,
  isArtworkStage,
  isBlanksStage,
  isDownstreamStage,
  isProductionStage,
  type ArtworkStage,
  type BlanksStage,
  type DownstreamStage,
  type ProductionStage,
  type ProductionStageChangedEvent,
  type ProductionStageHistoryEntry,
  type ProductionTrack,
} from "../../../../../lib/production-stage"
import { getPostHog } from "../../../../../lib/posthog"

const paramsSchema = z.object({ id: z.string().min(1) })

/**
 * Accepts the legacy `stage` field (back-compat: routes any value to the right
 * track via derivation) or any combination of the three new track fields. At
 * least one must be present.
 */
const bodySchema = z
  .object({
    stage: z.enum(PRODUCTION_STAGES).optional(),
    artwork_stage: z.enum(ARTWORK_STAGES).optional(),
    blanks_stage: z.enum(BLANKS_STAGES).optional(),
    production_stage: z.enum(DOWNSTREAM_STAGES).optional(),
    note: z.string().trim().max(500).optional(),
  })
  .refine(
    (v) =>
      v.stage !== undefined ||
      v.artwork_stage !== undefined ||
      v.blanks_stage !== undefined ||
      v.production_stage !== undefined,
    { message: "Must provide at least one of: stage, artwork_stage, blanks_stage, production_stage" }
  )

type ProductionStageMetaShape = {
  production_stage?: unknown
  production_stage_changed_at?: unknown
  production_stage_history?: unknown
  artwork_stage?: unknown
  artwork_stage_changed_at?: unknown
  blanks_stage?: unknown
  blanks_stage_changed_at?: unknown
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

function readTracks(meta: Record<string, unknown>): {
  artwork: ArtworkStage
  blanks: BlanksStage
  downstream: DownstreamStage
} {
  const m = meta as ProductionStageMetaShape
  const derived = deriveTracksFromLegacyStage(readCurrentStage(meta))
  return {
    artwork: isArtworkStage(m.artwork_stage) ? m.artwork_stage : derived.artwork_stage,
    blanks: isBlanksStage(m.blanks_stage) ? m.blanks_stage : derived.blanks_stage,
    downstream: isDownstreamStage(readCurrentStage(meta))
      ? (readCurrentStage(meta) as DownstreamStage)
      : derived.production_stage,
  }
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
  const tracks = readTracks(meta)
  return res.json({
    production_stage: readCurrentStage(meta),
    production_stage_changed_at:
      (meta as ProductionStageMetaShape).production_stage_changed_at ?? null,
    production_stage_history: readHistory(meta),
    artwork_stage: tracks.artwork,
    artwork_stage_changed_at:
      typeof (meta as ProductionStageMetaShape).artwork_stage_changed_at === "string"
        ? (meta as ProductionStageMetaShape).artwork_stage_changed_at
        : null,
    blanks_stage: tracks.blanks,
    blanks_stage_changed_at:
      typeof (meta as ProductionStageMetaShape).blanks_stage_changed_at === "string"
        ? (meta as ProductionStageMetaShape).blanks_stage_changed_at
        : null,
    production_due_date:
      typeof meta.production_due_date === "string" ? meta.production_due_date : null,
  })
}

type PlannedTransition = {
  track: ProductionTrack
  from: ProductionStage | null
  to: ProductionStage
}

/**
 * POST /admin/orders/:id/production-stage
 *
 * Accepts a partial body with any combination of artwork_stage / blanks_stage /
 * production_stage. Appends one history entry per changed track and emits the
 * matching event for each. Same-value writes are skipped.
 *
 * Legacy `{ stage }` payloads are routed to the correct track via the
 * derivation table so old admin code keeps working.
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
  const changedAt = new Date().toISOString()
  const changedBy =
    (req as any).auth_context?.actor_id ??
    (req as any).auth_context?.app_metadata?.user_id ??
    null

  const currentTracks = readTracks(meta)

  // Resolve the requested track targets, including the legacy `stage` field.
  let nextArtwork: ArtworkStage = currentTracks.artwork
  let nextBlanks: BlanksStage = currentTracks.blanks
  let nextDownstream: DownstreamStage = currentTracks.downstream

  if (body.artwork_stage) nextArtwork = body.artwork_stage
  if (body.blanks_stage) nextBlanks = body.blanks_stage
  if (body.production_stage) nextDownstream = body.production_stage

  if (body.stage) {
    if (isArtworkStage(body.stage)) {
      nextArtwork = body.stage
    } else if (isBlanksStage(body.stage)) {
      nextBlanks = body.stage
    } else if (isDownstreamStage(body.stage)) {
      nextDownstream = body.stage
    } else {
      // legacy values: route via derivation
      const d = deriveTracksFromLegacyStage(body.stage)
      nextArtwork = d.artwork_stage
      nextBlanks = d.blanks_stage
      nextDownstream = d.production_stage
    }
  }

  const transitions: PlannedTransition[] = []
  if (nextArtwork !== currentTracks.artwork) {
    transitions.push({ track: "artwork", from: currentTracks.artwork, to: nextArtwork })
  }
  if (nextBlanks !== currentTracks.blanks) {
    transitions.push({ track: "blanks", from: currentTracks.blanks, to: nextBlanks })
  }
  if (nextDownstream !== currentTracks.downstream) {
    transitions.push({ track: "production", from: currentTracks.downstream, to: nextDownstream })
  }

  if (transitions.length === 0) {
    return res.json({
      ok: true,
      changed: false,
      production_stage: readCurrentStage(meta),
      production_stage_changed_at:
        (meta as ProductionStageMetaShape).production_stage_changed_at ?? null,
      production_stage_history: readHistory(meta),
      artwork_stage: currentTracks.artwork,
      blanks_stage: currentTracks.blanks,
    })
  }

  const history = readHistory(meta)
  const note = body.note?.length ? body.note : null
  const newEntries: ProductionStageHistoryEntry[] = transitions.map((t) => ({
    stage: t.to,
    changed_at: changedAt,
    changed_by: changedBy,
    note,
    track: t.track,
  }))
  const nextHistory = [...history, ...newEntries]

  // Compute the persisted `production_stage` value. Downstream wins if it
  // changed; otherwise reflect whichever track moved (so the legacy field
  // still tracks the most-recent transition for any consumer that reads it
  // as a single source of truth).
  const downstreamChanged = transitions.find((t) => t.track === "production")
  const persistedStage: ProductionStage = downstreamChanged
    ? downstreamChanged.to
    : transitions[transitions.length - 1].to

  await orderModuleService.updateOrders(order.id, {
    metadata: {
      ...meta,
      production_stage: persistedStage,
      production_stage_changed_at: changedAt,
      production_stage_history: nextHistory,
      artwork_stage: nextArtwork,
      artwork_stage_changed_at:
        transitions.find((t) => t.track === "artwork")?.to
          ? changedAt
          : ((meta as ProductionStageMetaShape).artwork_stage_changed_at ?? null),
      blanks_stage: nextBlanks,
      blanks_stage_changed_at:
        transitions.find((t) => t.track === "blanks")?.to
          ? changedAt
          : ((meta as ProductionStageMetaShape).blanks_stage_changed_at ?? null),
    },
  })

  for (const t of transitions) {
    const eventName =
      t.track === "artwork"
        ? ARTWORK_STAGE_EVENT
        : t.track === "blanks"
          ? BLANKS_STAGE_EVENT
          : PRODUCTION_STAGE_EVENT

    const event: ProductionStageChangedEvent = {
      order_id: order.id,
      from_stage: t.from,
      to_stage: t.to,
      changed_at: changedAt,
      changed_by: changedBy,
      note,
      track: t.track,
    }

    try {
      await eventBus.emit({ name: eventName, data: event })
    } catch (err: any) {
      req.scope
        .resolve("logger")
        .error(
          `production-stage: failed to emit ${eventName} for order ${order.id}: ${
            err?.message ?? err
          }`
        )
    }

    const adminId = changedBy ?? "admin"
    getPostHog()?.capture({
      distinctId: adminId,
      event: "production stage changed",
      properties: {
        order_id: order.id,
        track: t.track,
        from_stage: t.from,
        to_stage: t.to,
        changed_at: changedAt,
        has_note: !!note,
      },
    })
  }

  return res.json({
    ok: true,
    changed: true,
    production_stage: persistedStage,
    production_stage_changed_at: changedAt,
    production_stage_history: nextHistory,
    artwork_stage: nextArtwork,
    blanks_stage: nextBlanks,
  })
}
