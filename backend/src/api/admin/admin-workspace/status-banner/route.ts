import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { ADMIN_WORKSPACE_MODULE } from "../../../../modules/admin-workspace"

const VALID_SEVERITIES = new Set(["info", "warning", "critical"])

/**
 * GET /admin/admin-workspace/status-banner — current banner (or null).
 * POST /admin/admin-workspace/status-banner { body, severity?, expires_at? }
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  try {
    const { data } = await query.graph({
      entity: "status_banner",
      fields: ["id", "body", "severity", "expires_at", "created_by", "created_at"],
      pagination: { take: 20, skip: 0, order: { created_at: "DESC" } },
    })
    const now = Date.now()
    const active = ((data as any[]) ?? []).find((b) => {
      if (!b?.expires_at) return true
      const ms = Date.parse(b.expires_at)
      return Number.isFinite(ms) && ms > now
    })
    return res.json({ banner: active ?? null })
  } catch {
    return res.json({ banner: null })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body ?? {}) as any
  if (typeof body.body !== "string" || body.body.trim().length === 0) {
    return res.status(400).json({ error: "body required" })
  }
  if (body.body.length > 280) {
    return res
      .status(400)
      .json({ error: "body too long (max 280 chars — keep banners short)" })
  }
  const severity =
    typeof body.severity === "string" && VALID_SEVERITIES.has(body.severity)
      ? body.severity
      : "info"
  const expiresAt =
    typeof body.expires_at === "string" && body.expires_at.length > 0
      ? body.expires_at
      : null
  const actor = (req as any).auth_context?.actor_id ?? null

  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  try {
    const created = await service.createStatusBanners({
      body: body.body.trim(),
      severity,
      expires_at: expiresAt,
      created_by: actor,
    })
    return res.status(201).json({ banner: created })
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to create banner",
      detail: String(err?.message ?? err),
    })
  }
}
