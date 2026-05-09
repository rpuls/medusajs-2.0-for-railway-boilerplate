import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { ADMIN_WORKSPACE_MODULE } from "../../../../modules/admin-workspace"

const VALID_TARGETS = new Set(["orders", "production", "reports", "customers"])

/**
 * GET /admin/admin-workspace/bookmarks?target=orders — list pinned filters
 *   for the calling admin user, scoped to a target page.
 *
 * POST /admin/admin-workspace/bookmarks { target, label, query, sort_order? }
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const userId = (req as any).auth_context?.actor_id ?? null
  const target =
    typeof req.query.target === "string" && VALID_TARGETS.has(req.query.target)
      ? req.query.target
      : null
  if (!userId) return res.json({ bookmarks: [] })
  try {
    const filters: Record<string, any> = { user_id: userId }
    if (target) filters.target = target
    const { data } = await query.graph({
      entity: "admin_bookmark",
      fields: ["id", "target", "label", "query", "sort_order", "created_at"],
      filters,
      pagination: { take: 200, skip: 0, order: { sort_order: "ASC" } },
    })
    return res.json({ bookmarks: (data as any[]) ?? [] })
  } catch {
    return res.json({ bookmarks: [] })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const userId = (req as any).auth_context?.actor_id ?? null
  if (!userId) return res.status(401).json({ error: "auth required" })
  const body = (req.body ?? {}) as any
  if (!VALID_TARGETS.has(body.target)) {
    return res.status(400).json({
      error: `target must be one of: ${Array.from(VALID_TARGETS).join(", ")}`,
    })
  }
  if (typeof body.label !== "string" || body.label.trim().length === 0) {
    return res.status(400).json({ error: "label required" })
  }
  if (typeof body.query !== "string") {
    return res.status(400).json({ error: "query (filter querystring) required" })
  }
  const sortOrder = Number.isFinite(Number(body.sort_order))
    ? Math.floor(Number(body.sort_order))
    : 100
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  try {
    const created = await service.createAdminBookmarks({
      user_id: userId,
      target: body.target,
      label: body.label.trim(),
      query: body.query,
      sort_order: sortOrder,
    })
    return res.status(201).json({ bookmark: created })
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to add bookmark",
      detail: String(err?.message ?? err),
    })
  }
}
