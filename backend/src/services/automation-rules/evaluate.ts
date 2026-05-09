import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"

import { ADMIN_WORKSPACE_MODULE } from "../../modules/admin-workspace"
import { AUTOMATION_RULE_MODULE } from "../../modules/automation-rule"
import {
  PRODUCTION_STAGE_EVENT,
  isProductionStage,
  type ProductionStageChangedEvent,
  type ProductionStageHistoryEntry,
} from "../../lib/production-stage"

/**
 * Pure rule evaluator. Given an event payload + a list of rules with
 * matching trigger, evaluates each rule's conditions and runs its
 * actions. Side-effecting actions (tag a customer, post a comment,
 * email an alert, advance a stage) are dispatched via the appropriate
 * module services.
 */

type Condition = {
  field: string
  op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains" | "exists"
  value?: any
}

type Action =
  | { kind: "tag_customer"; params: { label: string; color?: string } }
  | { kind: "post_order_comment"; params: { body: string } }
  | { kind: "send_alert_email"; params: { to: string; subject: string; body?: string } }
  | { kind: "set_production_stage"; params: { stage: string; note?: string } }

type Rule = {
  id: string
  name: string
  trigger_event: string
  conditions: Condition[] | null
  actions: Action[]
  enabled: boolean
  fire_count: number
}

const VALID_OPS = new Set([
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "contains",
  "exists",
])

const getField = (obj: any, path: string): any => {
  if (!obj || typeof obj !== "object") return undefined
  const parts = path.split(".")
  let cursor: any = obj
  for (const p of parts) {
    if (cursor == null) return undefined
    cursor = cursor[p]
  }
  return cursor
}

const evalCondition = (event: any, c: Condition): boolean => {
  const v = getField(event, c.field)
  switch (c.op) {
    case "exists":
      return v !== undefined && v !== null
    case "eq":
      return v === c.value
    case "neq":
      return v !== c.value
    case "gt":
      return Number(v) > Number(c.value)
    case "gte":
      return Number(v) >= Number(c.value)
    case "lt":
      return Number(v) < Number(c.value)
    case "lte":
      return Number(v) <= Number(c.value)
    case "contains":
      if (typeof v === "string" && typeof c.value === "string")
        return v.toLowerCase().includes(c.value.toLowerCase())
      if (Array.isArray(v)) return v.includes(c.value)
      return false
    default:
      return false
  }
}

const evalConditions = (event: any, conditions: Condition[] | null): boolean => {
  if (!conditions || conditions.length === 0) return true
  for (const c of conditions) {
    if (!c?.field || !VALID_OPS.has(c.op as string)) return false
    if (!evalCondition(event, c)) return false
  }
  return true
}

/**
 * Run a single action against a resolved order context. Each action
 * needs different module resolutions; rather than wiring every module
 * up-front the dispatcher resolves on demand and silently no-ops if
 * the required module isn't registered (so an action that depends on
 * the admin-workspace tags table doesn't crash on a fresh deploy).
 */
const dispatchAction = async (
  container: MedusaContainer,
  event: any,
  action: Action
): Promise<{ ok: boolean; detail?: string }> => {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    if (action.kind === "tag_customer") {
      const customerId =
        typeof event.customer_id === "string" ? event.customer_id : null
      if (!customerId) {
        return { ok: false, detail: "no customer_id in event" }
      }
      const ws = container.resolve(ADMIN_WORKSPACE_MODULE) as any
      await ws.createCustomerTags({
        customer_id: customerId,
        label: action.params.label,
        color: action.params.color ?? "slate",
        created_by: "automation",
      })
      return { ok: true }
    }
    if (action.kind === "post_order_comment") {
      const orderId =
        typeof event.order_id === "string" ? event.order_id : null
      if (!orderId) return { ok: false, detail: "no order_id in event" }
      const ws = container.resolve(ADMIN_WORKSPACE_MODULE) as any
      await ws.createOrderComments({
        order_id: orderId,
        body: action.params.body,
        created_by: "automation",
      })
      return { ok: true }
    }
    if (action.kind === "send_alert_email") {
      const notification = container.resolve(Modules.NOTIFICATION) as any
      await notification.createNotifications({
        to: action.params.to,
        channel: "email",
        template: "monthly-digest", // existing template — not ideal long-term but avoids new dependency
        data: {
          digest: {
            period: { from: "", to: "", label: action.params.subject },
            prior: { from: "", to: "", label: "" },
            headline: {
              revenue: { current: 0, prior: 0, delta_pct: null },
              orders: { current: 0, prior: 0, delta_pct: null },
              aov: { current: 0, prior: 0, delta_pct: null },
              distinct_customers: { current: 0, prior: 0, delta_pct: null },
              new_customers: { current: 0, prior: 0, delta_pct: null },
            },
            top_products: [],
            rfm_movers: { champions: 0, at_risk: 0, hibernating: 0, new_customer: 0 },
            production: { transitions: 0, breaches: 0, breach_pct: 0, severe_breaches: 0, currently_breaching: 0 },
            inventory: { dead_units: 0, aging_units: 0, out_of_stock_variants: 0 },
            highlights: [action.params.body ?? action.params.subject],
            currency_code: "AUD",
          },
          adminUrl: null,
        },
      })
      return { ok: true }
    }
    if (action.kind === "set_production_stage") {
      const orderId =
        typeof event.order_id === "string" ? event.order_id : null
      if (!orderId) return { ok: false, detail: "no order_id in event" }
      if (!isProductionStage(action.params.stage)) {
        return { ok: false, detail: `invalid stage ${action.params.stage}` }
      }
      const orderModuleService = container.resolve(Modules.ORDER) as any
      const eventBus = container.resolve(Modules.EVENT_BUS) as any
      const order = await orderModuleService.retrieveOrder(orderId)
      const meta = (order.metadata ?? {}) as Record<string, unknown>
      const fromStage =
        typeof meta.production_stage === "string" &&
        isProductionStage(meta.production_stage)
          ? (meta.production_stage as any)
          : null
      if (fromStage === action.params.stage) {
        return { ok: true, detail: "already at stage" }
      }
      const changedAt = new Date().toISOString()
      const newEntry: ProductionStageHistoryEntry = {
        stage: action.params.stage as any,
        changed_at: changedAt,
        changed_by: "automation",
        note: action.params.note ?? null,
      }
      const history = Array.isArray(meta.production_stage_history)
        ? (meta.production_stage_history as ProductionStageHistoryEntry[])
        : []
      await orderModuleService.updateOrders(orderId, {
        metadata: {
          ...meta,
          production_stage: action.params.stage,
          production_stage_changed_at: changedAt,
          production_stage_history: [...history, newEntry],
        },
      })
      const ev: ProductionStageChangedEvent = {
        order_id: orderId,
        from_stage: fromStage,
        to_stage: action.params.stage as any,
        changed_at: changedAt,
        changed_by: "automation",
        note: action.params.note ?? null,
      }
      await eventBus.emit({ name: PRODUCTION_STAGE_EVENT, data: ev })
      return { ok: true }
    }
  } catch (err: any) {
    logger.warn(`automation: action ${action.kind} failed: ${err?.message ?? err}`)
    return { ok: false, detail: String(err?.message ?? err) }
  }
  return { ok: false, detail: "unknown action" }
}

export async function runRulesForEvent(
  container: MedusaContainer,
  triggerEvent: string,
  eventData: any
): Promise<{ evaluated: number; fired: number; failures: number }> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const service = container.resolve(AUTOMATION_RULE_MODULE) as any
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  let rules: Rule[] = []
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
        "fire_count",
      ],
      filters: { trigger_event: triggerEvent, enabled: true },
      pagination: { take: 200, skip: 0 },
    })
    rules = ((data as any[]) ?? []) as Rule[]
  } catch (err: any) {
    logger.warn(
      `automation: rule fetch failed for ${triggerEvent}: ${err?.message ?? err}`
    )
    return { evaluated: 0, fired: 0, failures: 0 }
  }

  let fired = 0
  let failures = 0
  for (const r of rules) {
    if (!evalConditions(eventData, r.conditions)) continue
    const actions = Array.isArray(r.actions) ? r.actions : []
    let allOk = true
    for (const a of actions) {
      const res = await dispatchAction(container, eventData, a)
      if (!res.ok) {
        allOk = false
        failures += 1
      }
    }
    fired += 1
    try {
      await service.updateAutomationRules(r.id, {
        last_fired_at: new Date().toISOString(),
        fire_count: (r.fire_count ?? 0) + 1,
      })
    } catch {
      /* non-fatal */
    }
    void allOk
  }
  return { evaluated: rules.length, fired, failures }
}
