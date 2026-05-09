import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { AUTOMATION_RULE_MODULE } from "../../../../../modules/automation-rule"

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  if (!id) return res.status(400).json({ error: "id required" })
  const body = (req.body ?? {}) as any
  const update: Record<string, unknown> = {}
  if (typeof body.enabled === "boolean") update.enabled = body.enabled
  if (typeof body.name === "string") update.name = body.name.trim()
  if (Array.isArray(body.conditions) || body.conditions === null) {
    update.conditions = body.conditions
  }
  if (Array.isArray(body.actions)) update.actions = body.actions
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
