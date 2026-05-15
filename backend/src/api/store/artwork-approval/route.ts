import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { IOrderModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { z } from "zod"

import {
  ARTWORK_STAGE_EVENT,
  isProductionStage,
  type ProductionStage,
  type ProductionStageChangedEvent,
} from "../../../lib/production-stage"
import { getPostHog } from "../../../lib/posthog"
import { verifyArtworkApproval } from "../../../services/artwork-approval/sign"

const schema = z.object({
  order: z.string().min(1),
  sig: z.string().min(16).max(64),
  approved: z.boolean(),
  approver_name: z.string().max(200).optional(),
  comment: z.string().max(2000).optional(),
})

/**
 * GET  /store/artwork-approval?order=<id>&sig=<sig>
 *   → { order_display_id, status, latest_photo_url, current_artwork_stage }
 *
 * POST /store/artwork-approval
 *   body: { order, sig, approved, approver_name?, comment? }
 *   → { ok, status }
 *
 * The GET response is what the storefront /artwork-approval/[id]
 * page reads to render the proof view. POST records the decision and
 * — if approved — advances `artwork_stage` to `approved` (which fires
 * the existing artwork_stage_changed event for downstream emails/UI).
 *
 * Decisions are idempotent: once approved, subsequent POSTs only
 * update the comment / approver name. Rejection swings the order back
 * to `in_review` so staff know to fix it.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orderId = String((req.query?.order as string) ?? "")
  const sig = String((req.query?.sig as string) ?? "")
  if (!verifyArtworkApproval(orderId, sig)) {
    return res.status(400).json({ error: "invalid_signature" })
  }
  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  let order: any
  try {
    order = await orderModuleService.retrieveOrder(orderId)
  } catch {
    return res.status(404).json({ error: "not_found" })
  }
  const meta = (order.metadata ?? {}) as Record<string, unknown>
  const photos = Array.isArray(meta.production_photos)
    ? (meta.production_photos as Array<{ url?: string; uploaded_at?: string }>)
    : []
  const latestPhotoUrl =
    photos
      .filter((p) => typeof p?.url === "string" && p.url.length > 0)
      .sort((a, b) =>
        (a.uploaded_at ?? "") < (b.uploaded_at ?? "") ? 1 : -1
      )[0]?.url ?? null

  res.json({
    order_id: order.id,
    order_display_id:
      typeof order.display_id === "number" ? order.display_id : null,
    artwork_stage: typeof meta.artwork_stage === "string" ? meta.artwork_stage : null,
    artwork_approved_at:
      typeof meta.artwork_approved_at === "string"
        ? meta.artwork_approved_at
        : null,
    artwork_approver_name:
      typeof meta.artwork_approver_name === "string"
        ? meta.artwork_approver_name
        : null,
    latest_photo_url: latestPhotoUrl,
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  let body: z.infer<typeof schema>
  try {
    body = schema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }
  if (!verifyArtworkApproval(body.order, body.sig)) {
    return res.status(400).json({ error: "invalid_signature" })
  }

  const orderModuleService: IOrderModuleService = req.scope.resolve(Modules.ORDER)
  const eventBus = req.scope.resolve("event_bus") as
    | { emit: (e: { name: string; data: unknown }) => Promise<unknown> }
    | undefined
  let order: any
  try {
    order = await orderModuleService.retrieveOrder(body.order)
  } catch {
    return res.status(404).json({ error: "not_found" })
  }

  const meta = (order.metadata ?? {}) as Record<string, unknown>
  const previousStage =
    typeof meta.artwork_stage === "string" ? (meta.artwork_stage as string) : null
  const now = new Date().toISOString()

  const nextStage: "approved" | "in_review" = body.approved ? "approved" : "in_review"

  const updates: Record<string, unknown> = {
    ...meta,
    artwork_stage: nextStage,
    artwork_stage_changed_at: now,
  }
  if (body.approved) {
    if (typeof meta.artwork_approved_at !== "string") {
      updates.artwork_approved_at = now
    }
    if (body.approver_name) {
      updates.artwork_approver_name = body.approver_name
    }
    if (body.comment) {
      updates.artwork_approver_comment = body.comment
    }
  } else {
    updates.artwork_changes_requested_at = now
    if (body.comment) {
      updates.artwork_changes_requested_comment = body.comment
    }
  }

  await orderModuleService.updateOrders(body.order, { metadata: updates })

  // Fire the existing artwork_stage_changed event so any downstream
  // notification flows (or future automation rules on artwork) react
  // exactly like they would when a staff member changes the stage.
  if (eventBus?.emit && previousStage !== nextStage) {
    try {
      const fromStage: ProductionStage | null = isProductionStage(previousStage)
        ? (previousStage as ProductionStage)
        : null
      const payload: ProductionStageChangedEvent = {
        order_id: body.order,
        from_stage: fromStage,
        to_stage: nextStage as ProductionStage,
        changed_at: now,
        changed_by: body.approver_name ?? "customer",
      }
      await eventBus.emit({ name: ARTWORK_STAGE_EVENT, data: payload })
    } catch {
      // best-effort
    }
  }

  getPostHog()?.capture({
    distinctId: order?.email ?? body.order,
    event: body.approved ? "artwork approved" : "artwork changes requested",
    properties: {
      order_id: body.order,
      approver_name: body.approver_name ?? null,
      has_comment: !!body.comment,
    },
  })

  res.json({ ok: true, status: nextStage })
}
