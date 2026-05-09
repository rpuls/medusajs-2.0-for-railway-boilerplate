import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { ADMIN_WORKSPACE_MODULE } from "../../../../../modules/admin-workspace"

/**
 * GET /admin/orders/:id/comments — list staff comments on this order.
 * POST /admin/orders/:id/comments { body } — add a comment.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const orderId = req.params.id
  if (!orderId) return res.status(400).json({ error: "id required" })
  try {
    const { data } = await query.graph({
      entity: "order_comment",
      fields: ["id", "body", "created_by", "created_at"],
      filters: { order_id: orderId },
      pagination: { take: 200, skip: 0, order: { created_at: "ASC" } },
    })
    return res.json({ comments: (data as any[]) ?? [] })
  } catch {
    return res.json({ comments: [] })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id
  const body = (req.body ?? {}) as any
  if (!orderId) return res.status(400).json({ error: "id required" })
  if (typeof body.body !== "string" || body.body.trim().length === 0) {
    return res.status(400).json({ error: "body required" })
  }
  if (body.body.length > 4000) {
    return res
      .status(400)
      .json({ error: "body too long (max 4000 chars)" })
  }
  const actor = (req as any).auth_context?.actor_id ?? null
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  try {
    const created = await service.createOrderComments({
      order_id: orderId,
      body: body.body.trim(),
      created_by: actor,
    })
    return res.status(201).json({ comment: created })
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to add comment",
      detail: String(err?.message ?? err),
    })
  }
}
