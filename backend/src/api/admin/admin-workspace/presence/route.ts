import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { ADMIN_WORKSPACE_MODULE } from "../../../../modules/admin-workspace"

const STALE_MS = 60_000 // anyone who hasn't heartbeated in this long counts as "gone"

const VALID_ENTITIES = new Set(["order", "customer", "product"])

/**
 * POST /admin/admin-workspace/presence
 *   { entity: "order" | "customer" | "product", entity_id: string }
 *
 * Heartbeat from a tab that's currently viewing/editing a record. The
 * frontend hits this every 20s while the page is visible. Upsert
 * semantics: if a row exists for (user, entity, entity_id) we update
 * last_heartbeat_at; otherwise create.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const userId = (req as any).auth_context?.actor_id ?? null
  if (!userId) return res.status(401).json({ error: "auth required" })
  const body = (req.body ?? {}) as any
  if (!VALID_ENTITIES.has(body.entity)) {
    return res.status(400).json({
      error: `entity must be one of: ${Array.from(VALID_ENTITIES).join(", ")}`,
    })
  }
  if (typeof body.entity_id !== "string" || body.entity_id.length === 0) {
    return res.status(400).json({ error: "entity_id required" })
  }
  const userEmail = (req as any).auth_context?.app_metadata?.email ?? null
  const now = new Date().toISOString()

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any

  // Find existing row
  let existing: any = null
  try {
    const { data } = await query.graph({
      entity: "admin_presence",
      fields: ["id"],
      filters: {
        user_id: userId,
        entity: body.entity,
        entity_id: body.entity_id,
      },
      pagination: { take: 1, skip: 0 },
    })
    existing = (data as any[])?.[0] ?? null
  } catch {
    /* swallow */
  }

  try {
    if (existing) {
      await service.updateAdminPresences(existing.id, {
        last_heartbeat_at: now,
        user_email: userEmail,
      })
    } else {
      await service.createAdminPresences({
        user_id: userId,
        user_email: userEmail,
        entity: body.entity,
        entity_id: body.entity_id,
        last_heartbeat_at: now,
      })
    }
    return res.json({ ok: true, last_heartbeat_at: now })
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to heartbeat",
      detail: String(err?.message ?? err),
    })
  }
}

/**
 * GET /admin/admin-workspace/presence?entity=order&entity_ids=<id1>,<id2>,...
 *
 * Returns who's currently editing each requested entity (last 60s of
 * heartbeats). Used by list views to render avatar pills.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const entity =
    typeof req.query.entity === "string" && VALID_ENTITIES.has(req.query.entity)
      ? req.query.entity
      : null
  if (!entity) {
    return res.json({ presence: {} })
  }
  const idsRaw =
    typeof req.query.entity_ids === "string" ? req.query.entity_ids : ""
  const ids = idsRaw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  if (ids.length === 0) {
    return res.json({ presence: {} })
  }

  const callerUserId = (req as any).auth_context?.actor_id ?? null
  const cutoffMs = Date.now() - STALE_MS
  try {
    const { data } = await query.graph({
      entity: "admin_presence",
      fields: ["id", "user_id", "user_email", "entity_id", "last_heartbeat_at"],
      filters: { entity, entity_id: ids },
      pagination: { take: 1000, skip: 0 },
    })
    const presence: Record<string, Array<{ user_id: string; user_email: string | null }>> = {}
    for (const row of (data as any[]) ?? []) {
      const ts = Date.parse(row?.last_heartbeat_at ?? "")
      if (!Number.isFinite(ts) || ts < cutoffMs) continue
      // Skip the caller's own presence — they don't need to see themselves.
      if (row.user_id === callerUserId) continue
      const arr = presence[row.entity_id] ?? []
      // Dedup by user_id within an entity
      if (!arr.some((u) => u.user_id === row.user_id)) {
        arr.push({
          user_id: row.user_id,
          user_email: typeof row.user_email === "string" ? row.user_email : null,
        })
      }
      presence[row.entity_id] = arr
    }
    return res.json({ presence, checked_at: new Date().toISOString() })
  } catch {
    return res.json({ presence: {} })
  }
}
