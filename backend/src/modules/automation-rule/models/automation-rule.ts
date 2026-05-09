import { model } from "@medusajs/framework/utils"

/**
 * Operator-curated IF/THEN automation. Evaluated whenever the matching
 * `trigger_event` fires. Eliminates 80% of repetitive admin actions.
 *
 * Trigger events (v1):
 *   - "order.placed"                    every new order
 *   - "order.production_stage_changed"  every stage transition
 *
 * Conditions: a JSON expression evaluated against the event payload.
 * Each condition row is { field, op, value } — multiple rows are AND'd.
 *   ops: eq, neq, gt, gte, lt, lte, contains, exists
 *
 * Actions: ordered list of { kind, params } executed in sequence.
 *   kinds: tag_customer, post_order_comment, send_alert_email,
 *          set_production_stage
 *
 * Stored as JSON instead of a relational structure so adding new
 * conditions / actions doesn't require a migration. The evaluator
 * (services/automation-rules/evaluate.ts) is the schema enforcement
 * layer.
 */
const AutomationRule = model
  .define("automation_rule", {
    id: model.id({ prefix: "rule" }).primaryKey(),
    name: model.text(),
    trigger_event: model.text(),
    conditions: model.json().nullable(),
    actions: model.json(),
    enabled: model.boolean().default(true),
    last_fired_at: model.text().nullable(),
    fire_count: model.number().default(0),
    created_by: model.text().nullable(),
  })
  .indexes([
    { on: ["trigger_event"] },
    { on: ["enabled"] },
  ])

export default AutomationRule
