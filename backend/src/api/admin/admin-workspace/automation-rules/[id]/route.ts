import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { AUTOMATION_RULE_MODULE } from "../../../../../modules/automation-rule"

const VALID_OPS = new Set(["eq", "neq", "gt", "gte", "lt", "lte", "contains", "exists"])
const VALID_FIELDS = new Set([
  "total", "currency_code", "line_count", "quantity_total",
  "lifetime_value", "order_count",
  "email", "has_account", "from_stage",
])
const VALID_ACTIONS = new Set([
  "tag_customer", "post_order_comment", "send_alert_email", "set_production_stage",
  "create_task", "assign_owner",
])

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  if (!id) return res.status(400).json({ error: "id required" })
  const body = (req.body ?? {}) as any
  const update: Record<string, unknown> = {}
  if (typeof body.enabled === "boolean") update.enabled = body.enabled
  if (typeof body.name === "string") update.name = body.name.trim()
  if (Array.isArray(body.conditions) || body.conditions === null) {
    if (Array.isArray(body.conditions)) {
      for (const c of body.conditions) {
        if (typeof c?.field !== "string" || !VALID_FIELDS.has(c.field)) {
          return res.status(400).json({ error: `unknown condition field: ${c?.field}` })
        }
        if (!VALID_OPS.has(c?.op)) {
          return res.status(400).json({ error: `invalid condition op: ${c?.op}` })
        }
      }
    }
    update.conditions = body.conditions
  }
  if (Array.isArray(body.actions)) {
    for (const a of body.actions) {
      if (!VALID_ACTIONS.has(a?.kind)) {
        return res.status(400).json({ error: `invalid action kind: ${a?.kind}` })
      }
    }
    update.actions = body.actions
  }
  const service = req.scope.resolve(AUTOMATION_RULE_MODULE) as any
  try {
    const updated = await service.updateAutomationRules(id, update)
    return res.json({ rule: updated })
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to update rule",
      detail: String(err?.message ?? err),
    })
  }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  if (!id) return res.status(400).json({ error: "id required" })
  const service = req.scope.resolve(AUTOMATION_RULE_MODULE) as any
  try {
    await service.deleteAutomationRules([id])
    return res.json({ id, deleted: true })
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to delete rule",
      detail: String(err?.message ?? err),
    })
  }
}
