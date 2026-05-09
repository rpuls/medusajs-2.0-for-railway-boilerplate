import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { AUTOMATION_RULE_MODULE } from "../../../../modules/automation-rule"

const VALID_TRIGGERS = new Set([
  "order.placed",
  "order.production_stage_changed",
])
const VALID_OPS = new Set(["eq", "neq", "gt", "gte", "lt", "lte", "contains", "exists"])
const VALID_ACTIONS = new Set([
  "tag_customer",
  "post_order_comment",
  "send_alert_email",
  "set_production_stage",
])

/**
 * GET /admin/admin-workspace/automation-rules — list rules.
 * POST /admin/admin-workspace/automation-rules — create rule.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  try {
    const { data } = await query.graph({
      entity: "automation_rule",
      fields: [
        "id",
        "name",
        "trigger_event",
        "conditions",
        "actions",
        "enabled",
        "last_fired_at",
        "fire_count",
        "created_at",
      ],
      pagination: { take: 200, skip: 0 },
    })
    return res.json({
      rules: (data as any[]) ?? [],
      valid_triggers: Array.from(VALID_TRIGGERS),
      valid_ops: Array.from(VALID_OPS),
      valid_actions: Array.from(VALID_ACTIONS),
    })
  } catch {
    return res.json({
      rules: [],
      valid_triggers: Array.from(VALID_TRIGGERS),
      valid_ops: Array.from(VALID_OPS),
      valid_actions: Array.from(VALID_ACTIONS),
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body ?? {}) as any
  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    return res.status(400).json({ error: "name required" })
  }
  if (!VALID_TRIGGERS.has(body.trigger_event)) {
    return res.status(400).json({
      error: `trigger_event must be one of: ${Array.from(VALID_TRIGGERS).join(", ")}`,
    })
  }
  if (!Array.isArray(body.actions) || body.actions.length === 0) {
    return res.status(400).json({ error: "actions array required" })
  }
  for (const a of body.actions) {
    if (!VALID_ACTIONS.has(a?.kind)) {
      return res
        .status(400)
        .json({ error: `invalid action kind: ${a?.kind}` })
    }
  }
  if (body.conditions && !Array.isArray(body.conditions)) {
    return res.status(400).json({ error: "conditions must be an array" })
  }

  const actor = (req as any).auth_context?.actor_id ?? null
  const service = req.scope.resolve(AUTOMATION_RULE_MODULE) as any
  try {
    const created = await service.createAutomationRules({
      name: body.name.trim(),
      trigger_event: body.trigger_event,
      conditions: body.conditions ?? null,
      actions: body.actions,
      enabled: body.enabled !== false,
      created_by: actor,
    })
    return res.status(201).json({ rule: created })
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to create rule",
      detail: String(err?.message ?? err),
    })
  }
}
