import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Drawer,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Text,
  Textarea,
  Tooltip,
} from "@medusajs/ui"
import { ArrowPath, Trash, PencilSquare, Plus } from "@medusajs/icons"
import { useCallback, useEffect, useState } from "react"

import { PALETTE } from "../../lib/reports/palette"
import { HelpTooltip } from "../../components/reports/help-tooltip"

/* ---------- types --------------------------------------------------------- */

type Condition = {
  field: string
  op: string
  value?: unknown
}

type Action = {
  kind: string
  params: Record<string, unknown>
}

type AutomationRule = {
  id: string
  name: string
  trigger_event: string
  conditions: Condition[] | null
  actions: Action[]
  enabled: boolean
  last_fired_at: string | null
  fire_count: number
  created_at: string
}

type ConditionDraft = { field: string; op: string; value: string }
type ActionDraft = { kind: string; params: Record<string, string> }

type RuleDraft = {
  name: string
  trigger_event: string
  enabled: boolean
  conditions: ConditionDraft[]
  actions: ActionDraft[]
}

/* ---------- constants ----------------------------------------------------- */

const TRIGGER_LABELS: Record<string, string> = {
  "order.placed": "Order placed",
  "order.production_stage_changed": "Production stage changed",
}

const TRIGGER_FIELDS: Record<string, { field: string; hint: string }[]> = {
  "order.placed": [
    { field: "total", hint: "Order total (numeric, major units)" },
    { field: "currency_code", hint: "Currency code, e.g. aud" },
    { field: "line_count", hint: "Number of line items" },
    { field: "quantity_total", hint: "Total item quantity" },
  ],
  "order.production_stage_changed": [
    { field: "to_stage", hint: "Stage being moved into, e.g. in_production" },
    { field: "from_stage", hint: "Stage being moved out of" },
    { field: "changed_by", hint: "Actor ID who made the change" },
  ],
}

const OP_LABELS: Record<string, string> = {
  eq: "equals",
  neq: "not equals",
  gt: "greater than",
  gte: "≥",
  lt: "less than",
  lte: "≤",
  contains: "contains",
  exists: "exists",
}

const ACTION_LABELS: Record<string, string> = {
  tag_customer: "Tag customer",
  post_order_comment: "Post order comment",
  send_alert_email: "Send alert email",
  set_production_stage: "Set production stage",
}

const PRODUCTION_STAGES = [
  "received",
  "art_review",
  "awaiting_approval",
  "approved",
  "blanks_ordered",
  "blanks_arrived",
  "in_production",
  "quality_check",
  "shipped",
  "delivered",
]

const STAGE_LABELS: Record<string, string> = {
  received: "Received",
  art_review: "Artwork review",
  awaiting_approval: "Awaiting approval",
  approved: "Approved",
  blanks_ordered: "Blanks ordered",
  blanks_arrived: "Blanks received",
  in_production: "In production",
  quality_check: "Quality check",
  shipped: "Shipped",
  delivered: "Delivered",
}

const TAG_COLORS = ["slate", "teal", "amber", "rose", "emerald"]

const BLANK_DRAFT: RuleDraft = {
  name: "",
  trigger_event: "order.placed",
  enabled: true,
  conditions: [],
  actions: [],
}

/* ---------- helpers ------------------------------------------------------- */

const parseConditionValue = (value: string, op: string): unknown => {
  if (op === "exists") return undefined
  const num = Number(value)
  return value.trim() !== "" && !isNaN(num) ? num : value
}

const ruleToDraft = (rule: AutomationRule): RuleDraft => ({
  name: rule.name,
  trigger_event: rule.trigger_event,
  enabled: rule.enabled,
  conditions: (rule.conditions ?? []).map((c) => ({
    field: c.field,
    op: c.op,
    value: c.value !== undefined ? String(c.value) : "",
  })),
  actions: rule.actions.map((a) => ({
    kind: a.kind,
    params: Object.fromEntries(
      Object.entries(a.params ?? {}).map(([k, v]) => [k, String(v ?? "")])
    ),
  })),
})

const draftToPayload = (draft: RuleDraft) => ({
  name: draft.name.trim(),
  trigger_event: draft.trigger_event,
  enabled: draft.enabled,
  conditions:
    draft.conditions.length > 0
      ? draft.conditions.map((c) => ({
          field: c.field,
          op: c.op,
          ...(c.op !== "exists" ? { value: parseConditionValue(c.value, c.op) } : {}),
        }))
      : null,
  actions: draft.actions.map((a) => ({
    kind: a.kind,
    params: a.params,
  })),
})

const formatRelative = (iso: string | null): string => {
  if (!iso) return "Never"
  const diff = Date.now() - Date.parse(iso)
  if (diff < 60_000) return "just now"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

/* ---------- ConditionRow -------------------------------------------------- */

const ConditionRow = ({
  condition,
  index,
  validOps,
  triggerEvent,
  onChange,
  onRemove,
}: {
  condition: ConditionDraft
  index: number
  validOps: string[]
  triggerEvent: string
  onChange: (c: ConditionDraft) => void
  onRemove: () => void
}) => {
  const fieldSuggestions = TRIGGER_FIELDS[triggerEvent] ?? []

  return (
    <div className="flex items-start gap-x-2">
      <div className="flex flex-col gap-y-1 flex-1 min-w-0">
        <div className="flex items-center gap-x-2">
          <div className="flex-1">
            <Input
              value={condition.field}
              onChange={(e) => onChange({ ...condition, field: e.currentTarget.value })}
              placeholder="field (e.g. total, to_stage)"
              size="small"
            />
          </div>
          <div className="w-32 shrink-0">
            <Select
              value={condition.op}
              onValueChange={(v) => onChange({ ...condition, op: v })}
            >
              <Select.Trigger size="small">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {validOps.map((op) => (
                  <Select.Item key={op} value={op}>
                    {OP_LABELS[op] ?? op}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          {condition.op !== "exists" ? (
            <div className="flex-1">
              <Input
                value={condition.value}
                onChange={(e) => onChange({ ...condition, value: e.currentTarget.value })}
                placeholder="value"
                size="small"
              />
            </div>
          ) : (
            <div className="flex-1" />
          )}
          <Button
            size="small"
            variant="transparent"
            onClick={onRemove}
            className="shrink-0 text-ui-fg-muted hover:text-ui-tag-red-icon"
          >
            <Trash />
          </Button>
        </div>
        {index === 0 && fieldSuggestions.length > 0 ? (
          <div className="flex flex-wrap gap-1 pl-0.5">
            {fieldSuggestions.map((s) => (
              <Tooltip key={s.field} content={s.hint}>
                <button
                  type="button"
                  onClick={() => onChange({ ...condition, field: s.field })}
                  className="text-[10px] px-1.5 py-0.5 rounded border border-ui-border-base hover:bg-ui-bg-subtle text-ui-fg-muted"
                >
                  {s.field}
                </button>
              </Tooltip>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

/* ---------- ActionRow ----------------------------------------------------- */

const ActionRow = ({
  action,
  validActions,
  onChange,
  onRemove,
}: {
  action: ActionDraft
  validActions: string[]
  onChange: (a: ActionDraft) => void
  onRemove: () => void
}) => {
  const setParam = (key: string, value: string) =>
    onChange({ ...action, params: { ...action.params, [key]: value } })

  const handleKindChange = (kind: string) =>
    onChange({ kind, params: {} })

  return (
    <div className="flex flex-col gap-y-2 p-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle/30">
      <div className="flex items-center gap-x-2">
        <div className="flex-1">
          <Select value={action.kind} onValueChange={handleKindChange}>
            <Select.Trigger size="small">
              <Select.Value placeholder="Select action…" />
            </Select.Trigger>
            <Select.Content>
              {validActions.map((a) => (
                <Select.Item key={a} value={a}>
                  {ACTION_LABELS[a] ?? a}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <Button
          size="small"
          variant="transparent"
          onClick={onRemove}
          className="shrink-0 text-ui-fg-muted hover:text-ui-tag-red-icon"
        >
          <Trash />
        </Button>
      </div>

      {action.kind === "tag_customer" && (
        <div className="flex gap-x-2">
          <div className="flex-1 flex flex-col gap-y-1">
            <Label className="text-xs">Tag label</Label>
            <Input
              value={action.params.label ?? ""}
              onChange={(e) => setParam("label", e.currentTarget.value)}
              placeholder="e.g. VIP, High Value"
              size="small"
            />
          </div>
          <div className="w-32 flex flex-col gap-y-1">
            <Label className="text-xs">Color</Label>
            <Select
              value={action.params.color ?? "slate"}
              onValueChange={(v) => setParam("color", v)}
            >
              <Select.Trigger size="small">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {TAG_COLORS.map((c) => (
                  <Select.Item key={c} value={c}>
                    {c}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </div>
      )}

      {action.kind === "post_order_comment" && (
        <div className="flex flex-col gap-y-1">
          <Label className="text-xs">Comment</Label>
          <Textarea
            value={action.params.body ?? ""}
            onChange={(e) => setParam("body", e.currentTarget.value)}
            placeholder="Comment text to post on the order…"
            rows={2}
          />
        </div>
      )}

      {action.kind === "send_alert_email" && (
        <div className="flex flex-col gap-y-2">
          <div className="flex gap-x-2">
            <div className="flex-1 flex flex-col gap-y-1">
              <Label className="text-xs">To (email)</Label>
              <Input
                value={action.params.to ?? ""}
                onChange={(e) => setParam("to", e.currentTarget.value)}
                placeholder="alerts@example.com"
                size="small"
              />
            </div>
            <div className="flex-1 flex flex-col gap-y-1">
              <Label className="text-xs">Subject</Label>
              <Input
                value={action.params.subject ?? ""}
                onChange={(e) => setParam("subject", e.currentTarget.value)}
                placeholder="Alert: …"
                size="small"
              />
            </div>
          </div>
          <div className="flex flex-col gap-y-1">
            <Label className="text-xs">Body (optional)</Label>
            <Textarea
              value={action.params.body ?? ""}
              onChange={(e) => setParam("body", e.currentTarget.value)}
              placeholder="Email body…"
              rows={2}
            />
          </div>
        </div>
      )}

      {action.kind === "set_production_stage" && (
        <div className="flex gap-x-2">
          <div className="w-48 flex flex-col gap-y-1">
            <Label className="text-xs">Stage</Label>
            <Select
              value={action.params.stage ?? ""}
              onValueChange={(v) => setParam("stage", v)}
            >
              <Select.Trigger size="small">
                <Select.Value placeholder="Select stage…" />
              </Select.Trigger>
              <Select.Content>
                {PRODUCTION_STAGES.map((s) => (
                  <Select.Item key={s} value={s}>
                    {STAGE_LABELS[s] ?? s}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="flex-1 flex flex-col gap-y-1">
            <Label className="text-xs">Note (optional)</Label>
            <Input
              value={action.params.note ?? ""}
              onChange={(e) => setParam("note", e.currentTarget.value)}
              placeholder="Moved by automation rule"
              size="small"
            />
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- RuleFormDrawer ------------------------------------------------ */

const RuleFormDrawer = ({
  open,
  onClose,
  editRule,
  validTriggers,
  validOps,
  validActions,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  editRule: AutomationRule | null
  validTriggers: string[]
  validOps: string[]
  validActions: string[]
  onSaved: () => void
}) => {
  const [draft, setDraft] = useState<RuleDraft>(BLANK_DRAFT)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setDraft(editRule ? ruleToDraft(editRule) : { ...BLANK_DRAFT })
      setError(null)
    }
  }, [open, editRule])

  const updateCondition = (i: number, c: ConditionDraft) =>
    setDraft((d) => ({
      ...d,
      conditions: d.conditions.map((x, idx) => (idx === i ? c : x)),
    }))

  const addCondition = () =>
    setDraft((d) => ({
      ...d,
      conditions: [...d.conditions, { field: "", op: "eq", value: "" }],
    }))

  const removeCondition = (i: number) =>
    setDraft((d) => ({
      ...d,
      conditions: d.conditions.filter((_, idx) => idx !== i),
    }))

  const updateAction = (i: number, a: ActionDraft) =>
    setDraft((d) => ({
      ...d,
      actions: d.actions.map((x, idx) => (idx === i ? a : x)),
    }))

  const addAction = () =>
    setDraft((d) => ({
      ...d,
      actions: [...d.actions, { kind: "", params: {} }],
    }))

  const removeAction = (i: number) =>
    setDraft((d) => ({
      ...d,
      actions: d.actions.filter((_, idx) => idx !== i),
    }))

  const submit = async () => {
    if (!draft.name.trim()) { setError("Rule name is required."); return }
    if (draft.actions.length === 0) { setError("At least one action is required."); return }
    const invalidAction = draft.actions.find((a) => !a.kind)
    if (invalidAction) { setError("All actions must have a kind selected."); return }

    setSaving(true)
    setError(null)
    try {
      const payload = draftToPayload(draft)
      const url = editRule
        ? `/admin/admin-workspace/automation-rules/${editRule.id}`
        : "/admin/admin-workspace/automation-rules"
      const method = editRule ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error ?? `HTTP ${res.status}`)
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <Drawer.Content className="max-w-2xl">
        <Drawer.Header>
          <Drawer.Title>
            {editRule ? "Edit rule" : "New automation rule"}
          </Drawer.Title>
          <Drawer.Description>
            Rules fire automatically when their trigger event occurs and all
            conditions match.
          </Drawer.Description>
        </Drawer.Header>

        <Drawer.Body className="overflow-auto">
          <div className="flex flex-col gap-y-6 p-1">
            {/* Name + trigger + enabled */}
            <div className="flex flex-col gap-y-3">
              <div className="flex flex-col gap-y-1">
                <Label className="text-xs">Rule name</Label>
                <Input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, name: e.currentTarget.value }))
                  }
                  placeholder="e.g. Tag high-value customers"
                />
              </div>

              <div className="flex gap-x-3 items-end">
                <div className="flex-1 flex flex-col gap-y-1">
                  <Label className="text-xs">Trigger event</Label>
                  <Select
                    value={draft.trigger_event}
                    onValueChange={(v) =>
                      setDraft((d) => ({ ...d, trigger_event: v, conditions: [] }))
                    }
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {validTriggers.map((t) => (
                        <Select.Item key={t} value={t}>
                          {TRIGGER_LABELS[t] ?? t}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>

                <div className="flex items-center gap-x-2 pb-2">
                  <Switch
                    checked={draft.enabled}
                    onCheckedChange={(v) => setDraft((d) => ({ ...d, enabled: v }))}
                    id="rule-enabled"
                  />
                  <Label htmlFor="rule-enabled" className="text-sm">
                    Enabled
                  </Label>
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Heading level="h3">Conditions</Heading>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    All conditions must match (AND). Leave empty to match every event.
                  </Text>
                </div>
                <Button size="small" variant="secondary" onClick={addCondition}>
                  <Plus className="mr-1" /> Add
                </Button>
              </div>
              {draft.conditions.length === 0 ? (
                <Text size="xsmall" className="text-ui-fg-muted italic px-1">
                  No conditions — rule fires for every{" "}
                  {TRIGGER_LABELS[draft.trigger_event] ?? draft.trigger_event} event.
                </Text>
              ) : (
                <div className="flex flex-col gap-y-2">
                  {draft.conditions.map((c, i) => (
                    <ConditionRow
                      key={i}
                      condition={c}
                      index={i}
                      validOps={validOps}
                      triggerEvent={draft.trigger_event}
                      onChange={(updated) => updateCondition(i, updated)}
                      onRemove={() => removeCondition(i)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Heading level="h3">Actions</Heading>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    Executed in order when the rule fires.
                  </Text>
                </div>
                <Button size="small" variant="secondary" onClick={addAction}>
                  <Plus className="mr-1" /> Add
                </Button>
              </div>
              {draft.actions.length === 0 ? (
                <Text size="xsmall" className="text-ui-fg-muted italic px-1">
                  Add at least one action.
                </Text>
              ) : (
                <div className="flex flex-col gap-y-2">
                  {draft.actions.map((a, i) => (
                    <ActionRow
                      key={i}
                      action={a}
                      validActions={validActions}
                      onChange={(updated) => updateAction(i, updated)}
                      onRemove={() => removeAction(i)}
                    />
                  ))}
                </div>
              )}
            </div>

            {error ? (
              <Text size="small" className="text-ui-tag-red-icon">
                {error}
              </Text>
            ) : null}
          </div>
        </Drawer.Body>

        <Drawer.Footer>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={saving}>
            {editRule ? "Save changes" : "Create rule"}
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

/* ---------- RuleRow ------------------------------------------------------- */

const RuleRow = ({
  rule,
  onEdit,
  onDelete,
  onToggle,
}: {
  rule: AutomationRule
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) => (
  <div className="flex items-center gap-x-4 px-4 py-3 border-b border-ui-border-base last:border-b-0 hover:bg-ui-bg-subtle/30 transition">
    {/* Enabled toggle */}
    <div className="shrink-0">
      <Switch checked={rule.enabled} onCheckedChange={onToggle} />
    </div>

    {/* Name + trigger */}
    <div className="flex flex-col flex-1 min-w-0">
      <Text size="small" className="font-medium truncate">
        {rule.name}
      </Text>
      <Text size="xsmall" className="text-ui-fg-muted">
        {TRIGGER_LABELS[rule.trigger_event] ?? rule.trigger_event}
        {rule.conditions && rule.conditions.length > 0
          ? ` · ${rule.conditions.length} condition${rule.conditions.length > 1 ? "s" : ""}`
          : " · no conditions"}
        {" · "}
        {rule.actions.length} action{rule.actions.length > 1 ? "s" : ""}
      </Text>
    </div>

    {/* Actions summary pills */}
    <div className="hidden lg:flex flex-wrap gap-1 max-w-[200px]">
      {rule.actions.map((a, i) => (
        <span
          key={i}
          className="text-[10px] px-1.5 py-0.5 rounded border border-ui-border-base text-ui-fg-subtle"
        >
          {ACTION_LABELS[a.kind] ?? a.kind}
        </span>
      ))}
    </div>

    {/* Stats */}
    <div className="flex flex-col items-end shrink-0 w-28 text-right">
      <Tooltip content={`Fired ${rule.fire_count} times`}>
        <Badge size="2xsmall">{rule.fire_count} fires</Badge>
      </Tooltip>
      <Text size="xsmall" className="text-ui-fg-muted mt-0.5">
        {formatRelative(rule.last_fired_at)}
      </Text>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-x-1 shrink-0">
      <Button size="small" variant="transparent" onClick={onEdit}>
        <PencilSquare />
      </Button>
      <Button
        size="small"
        variant="transparent"
        onClick={onDelete}
        className="text-ui-fg-muted hover:text-ui-tag-red-icon"
      >
        <Trash />
      </Button>
    </div>
  </div>
)

/* ---------- AutomationRulesPage ------------------------------------------ */

const AutomationRulesPage = () => {
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [validTriggers, setValidTriggers] = useState<string[]>([])
  const [validOps, setValidOps] = useState<string[]>([])
  const [validActions, setValidActions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editRule, setEditRule] = useState<AutomationRule | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/admin/admin-workspace/automation-rules", {
        credentials: "include",
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setRules(data.rules ?? [])
      setValidTriggers(data.valid_triggers ?? [])
      setValidOps(data.valid_ops ?? [])
      setValidActions(data.valid_actions ?? [])
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const openCreate = () => {
    setEditRule(null)
    setDrawerOpen(true)
  }

  const openEdit = (rule: AutomationRule) => {
    setEditRule(rule)
    setDrawerOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this rule?")) return
    try {
      await fetch(`/admin/admin-workspace/automation-rules/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      setRules((prev) => prev.filter((r) => r.id !== id))
    } catch {
      // non-fatal — rule will still appear until next refresh
    }
  }

  const handleToggle = async (rule: AutomationRule) => {
    const next = !rule.enabled
    setRules((prev) =>
      prev.map((r) => (r.id === rule.id ? { ...r, enabled: next } : r))
    )
    try {
      await fetch(`/admin/admin-workspace/automation-rules/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ enabled: next }),
      })
    } catch {
      // rollback optimistic update
      setRules((prev) =>
        prev.map((r) => (r.id === rule.id ? { ...r, enabled: rule.enabled } : r))
      )
    }
  }

  return (
    <div className="flex flex-col gap-y-4">
      {/* Header */}
      <Container className="flex items-start justify-between">
        <div>
          <Heading level="h1" className="flex items-center">
            Automation Rules
            <HelpTooltip
              text={{
                title: "Automation Rules",
                body: "Tiny no-code automations that watch for an event on the backend and run one or more actions when conditions match. Use them to automate the repetitive stuff that doesn't justify a full feature — labelling orders, posting internal notes, nudging customers, advancing production stages.",
                bullets: [
                  "Triggers fire in real time from the backend event bus — no cron, no polling, no admin tab needed open.",
                  "Conditions are AND-joined: every condition must match for the rule to fire. Leave conditions empty to fire on every trigger event.",
                  "Actions run sequentially in the order you list them. A failed action logs but doesn't block the next one.",
                  "Disabled rules stay listed but skip evaluation — handy for staging a rule before flipping it on.",
                  "Last fired / fire count update live so you can confirm a new rule actually matched.",
                ],
              }}
            />
          </Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Rules fire automatically when their trigger event occurs and all conditions
            match. Evaluated in real time — no cron required.
          </Text>
        </div>
        <div className="flex items-center gap-x-2">
          <Button size="small" variant="secondary" onClick={load} disabled={loading}>
            <ArrowPath className="mr-1" /> Refresh
          </Button>
          <Button size="small" onClick={openCreate}>
            <Plus className="mr-1" /> New rule
          </Button>
        </div>
      </Container>

      {/* Error */}
      {error ? (
        <Container>
          <Text className="text-ui-tag-red-icon">
            Failed to load rules: {error}
          </Text>
        </Container>
      ) : null}

      {/* Empty */}
      {!loading && rules.length === 0 && !error ? (
        <Container className="flex flex-col items-center gap-y-3 py-12">
          <Text className="text-ui-fg-muted">No automation rules yet.</Text>
          <Button size="small" onClick={openCreate}>
            <Plus className="mr-1" /> Create your first rule
          </Button>
        </Container>
      ) : null}

      {/* Rules list */}
      {rules.length > 0 ? (
        <Container className="p-0 overflow-hidden">
          {/* Column headers */}
          <div className="flex items-center gap-x-4 px-4 py-2 border-b border-ui-border-base bg-ui-bg-subtle">
            <div className="w-8 shrink-0" />
            <Text size="xsmall" className="text-ui-fg-subtle flex-1">
              Rule
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle hidden lg:block w-[200px]">
              Actions
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle w-28 text-right">
              Usage
            </Text>
            <div className="w-16 shrink-0" />
          </div>
          {rules.map((rule) => (
            <RuleRow
              key={rule.id}
              rule={rule}
              onEdit={() => openEdit(rule)}
              onDelete={() => handleDelete(rule.id)}
              onToggle={() => handleToggle(rule)}
            />
          ))}
        </Container>
      ) : null}

      {/* Info card */}
      <Container
        className="p-4"
        style={{ background: `${PALETTE.stone100}`, borderColor: PALETTE.stone300 }}
      >
        <Heading level="h3" className="mb-2">
          How rules work
        </Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div>
            <Text size="small" className="font-medium">Triggers</Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              <strong>Order placed</strong> — fires immediately when a new order is
              created. Payload includes total, currency, line count.
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle mt-1">
              <strong>Stage changed</strong> — fires each time an order moves to a
              new production stage. Payload includes from_stage, to_stage, changed_by.
            </Text>
          </div>
          <div>
            <Text size="small" className="font-medium">Available actions</Text>
            <ul className="text-ui-fg-subtle text-xs mt-1 space-y-0.5 list-disc list-inside">
              <li>Tag customer — adds a label to the customer record</li>
              <li>Post order comment — creates a note visible to staff</li>
              <li>Send alert email — sends an email to any address</li>
              <li>Set production stage — auto-advances the order stage</li>
            </ul>
          </div>
        </div>
      </Container>

      {/* Create / Edit drawer */}
      <RuleFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editRule={editRule}
        validTriggers={validTriggers}
        validOps={validOps}
        validActions={validActions}
        onSaved={load}
      />
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Automation Rules",
  icon: ArrowPath,
})

export default AutomationRulesPage
