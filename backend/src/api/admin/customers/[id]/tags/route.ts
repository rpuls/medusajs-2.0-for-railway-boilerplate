import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { ADMIN_WORKSPACE_MODULE } from "../../../../../modules/admin-workspace"

const VALID_COLORS = new Set(["slate", "teal", "amber", "rose", "emerald"])

/**
 * GET /admin/customers/:id/tags — list tags pinned to this customer.
 * POST /admin/customers/:id/tags { label, color? } — add a new tag.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const customerId = req.params.id
  if (!customerId) return res.status(400).json({ error: "id required" })
  try {
    const { data } = await query.graph({
      entity: "customer_tag",
      fields: ["id", "label", "color", "created_by", "created_at"],
      filters: { customer_id: customerId },
      pagination: { take: 200, skip: 0 },
    })
    return res.json({ tags: (data as any[]) ?? [] })
  } catch {
    return res.json({ tags: [] })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const customerId = req.params.id
  const body = (req.body ?? {}) as any
  if (!customerId) return res.status(400).json({ error: "id required" })
  if (typeof body.label !== "string" || body.label.trim().length === 0) {
    return res.status(400).json({ error: "label required" })
  }
  if (body.label.length > 30) {
    return res.status(400).json({ error: "label max 30 chars" })
  }
  const color =
    typeof body.color === "string" && VALID_COLORS.has(body.color)
      ? body.color
      : "slate"
  const actor = (req as any).auth_context?.actor_id ?? null

  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  try {
    const created = await service.createCustomerTags({
      customer_id: customerId,
      label: body.label.trim(),
      color,
      created_by: actor,
    })
    return res.status(201).json({ tag: created })
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: "Failed to add tag", detail: String(err?.message ?? err) })
  }
}
