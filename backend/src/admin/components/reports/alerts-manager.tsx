import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Text,
} from "@medusajs/ui"
import { Trash } from "@medusajs/icons"
import { useEffect, useState } from "react"

import { PALETTE } from "../../lib/reports/palette"
import { HelpTooltip } from "./help-tooltip"

type Metric = {
  key: string
  label: string
  current_value: number
}

type Alert = {
  id: string
  name: string
  metric: string
  comparator: "gt" | "gte" | "lt" | "lte" | "eq"
  threshold: number
  recipient_email: string
  cooldown_days: number
  enabled: boolean
  last_fired_at: string | null
  last_value: number | null
}

type Response = {
  alerts: Alert[]
  metrics: Metric[]
}

const COMPARATORS = [
  { value: "gt", label: "> (greater than)" },
  { value: "gte", label: "≥ (at or above)" },
  { value: "lt", label: "< (less than)" },
  { value: "lte", label: "≤ (at or below)" },
  { value: "eq", label: "= (equal to)" },
] as const

const formatValue = (v: number | null | undefined): string => {
  if (v === null || v === undefined) return "—"
  return Number.isInteger(v) ? String(v) : v.toFixed(1)
}

const formatRelativeTime = (iso: string | null): string => {
  if (!iso) return "never"
  const ms = Date.parse(iso)
  if (!Number.isFinite(ms)) return "never"
  const diff = Date.now() - ms
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} min ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

export const AlertsManager = () => {
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshNonce, setRefreshNonce] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [metric, setMetric] = useState<string>("sla_breach_pct_7d")
  const [comparator, setComparator] = useState<string>("gt")
  const [threshold, setThreshold] = useState<string>("25")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [cooldownDays, setCooldownDays] = useState<string>("7")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/admin/reports/alerts`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { alerts: [], metrics: [] }))
      .then((j) => {
        if (cancelled) return
        setData(j as Response)
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? String(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [refreshNonce])

  const submit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/admin/reports/alerts`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          metric,
          comparator,
          threshold: Number(threshold),
          recipient_email: recipientEmail.trim(),
          cooldown_days: Number(cooldownDays),
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      setName("")
      setRecipientEmail("")
      setShowForm(false)
      setRefreshNonce((n) => n + 1)
    } catch (e: any) {
      setError(e?.message ?? String(e))
    } finally {
      setSubmitting(false)
    }
  }

  const toggleEnabled = async (a: Alert) => {
    try {
      const res = await fetch(`/admin/reports/alerts/${a.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enabled: !a.enabled }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setRefreshNonce((n) => n + 1)
    } catch (e: any) {
      setError(e?.message ?? String(e))
    }
  }

  const remove = async (a: Alert) => {
    if (!window.confirm(`Delete alert "${a.name}"?`)) return
    try {
      const res = await fetch(`/admin/reports/alerts/${a.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setRefreshNonce((n) => n + 1)
    } catch (e: any) {
      setError(e?.message ?? String(e))
    }
  }

  const runNow = async () => {
    setActionMessage(null)
    try {
      const res = await fetch(`/admin/reports/alerts?run=1`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const j = await res.json()
      setActionMessage(
        `Run complete: ${j.fired} fired, ${j.cooldown_skipped} suppressed by cooldown, ${j.failures} failures.`
      )
      setRefreshNonce((n) => n + 1)
    } catch (e: any) {
      setError(e?.message ?? String(e))
    }
  }

  const alerts = data?.alerts ?? []
  const metrics = data?.metrics ?? []
  const metricByKey = new Map(metrics.map((m) => [m.key, m]))

  return (
    <Container className="flex flex-col gap-y-3 p-4">
      <div className="flex items-center justify-between gap-x-3">
        <div>
          <Heading level="h2" className="text-base font-semibold flex items-center">
            Threshold alerts
            <HelpTooltip
              text={{
                title: "Threshold alerts",
                body: "Configure alerts that watch a chosen metric and email you when it crosses a threshold. The daily run-report-alerts cron evaluates every enabled alert at 23:45 UTC; the 'Run now' button fires the same evaluator on demand.",
                bullets: [
                  "Pick a metric (e.g. refund rate, ASCol failure rate, daily revenue), a comparator (above/below), and a threshold value.",
                  "Per-alert cooldown stops the same alert spamming day after day — you'll get one email per breach window, not one per day.",
                  "Alerts go to the email addresses listed in MONTHLY_DIGEST_RECIPIENTS env var. Set this if alerts aren't arriving.",
                  "Use 'Run now' after changing thresholds to confirm the alert fires (or doesn't) right away rather than waiting until tomorrow.",
                ],
              }}
            />
          </Heading>
          <Text size="xsmall" className="text-ui-fg-subtle">
            Daily cron checks each enabled alert against the live metric
            value and emails when the threshold is breached. Per-alert
            cooldown prevents spam.
          </Text>
        </div>
        <div className="flex gap-x-2">
          <Button size="small" variant="secondary" onClick={runNow}>
            Run now
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "Cancel" : "Add alert"}
          </Button>
        </div>
      </div>

      {error ? (
        <Text size="xsmall" className="text-ui-tag-red-icon">
          {error}
        </Text>
      ) : null}

      {actionMessage ? (
        <Text size="xsmall" className="text-ui-fg-subtle">
          {actionMessage}
        </Text>
      ) : null}

      {showForm ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 bg-ui-bg-subtle/50 rounded">
          <div className="lg:col-span-4 flex flex-col gap-y-1">
            <Label className="text-xs text-ui-fg-subtle">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="SLA breach above 25%"
            />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-y-1">
            <Label className="text-xs text-ui-fg-subtle">Metric</Label>
            <Select value={metric} onValueChange={setMetric}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {metrics.map((m) => (
                  <Select.Item key={m.key} value={m.key}>
                    {m.label} (now {formatValue(m.current_value)})
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="lg:col-span-2 flex flex-col gap-y-1">
            <Label className="text-xs text-ui-fg-subtle">Comparator</Label>
            <Select value={comparator} onValueChange={setComparator}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {COMPARATORS.map((c) => (
                  <Select.Item key={c.value} value={c.value}>
                    {c.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="lg:col-span-2 flex flex-col gap-y-1">
            <Label className="text-xs text-ui-fg-subtle">Threshold</Label>
            <Input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>
          <div className="lg:col-span-6 flex flex-col gap-y-1">
            <Label className="text-xs text-ui-fg-subtle">Recipient email</Label>
            <Input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="info@scprints.com.au"
            />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-y-1">
            <Label className="text-xs text-ui-fg-subtle">
              Cooldown (days)
            </Label>
            <Input
              type="number"
              min={1}
              value={cooldownDays}
              onChange={(e) => setCooldownDays(e.target.value)}
            />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-y-1 lg:justify-end">
            <Button
              variant="primary"
              onClick={submit}
              disabled={
                submitting ||
                name.trim().length === 0 ||
                recipientEmail.trim().length === 0
              }
            >
              {submitting ? "Saving…" : "Save alert"}
            </Button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <Text size="xsmall" className="text-ui-fg-muted">
          Loading…
        </Text>
      ) : alerts.length === 0 ? (
        <Text size="xsmall" className="text-ui-fg-muted">
          No alerts configured. Add one to get an email when SLA breach %
          spikes, dead-stock units climb, or capacity goes red.
        </Text>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-ui-fg-subtle text-xs">
              <tr className="border-b border-ui-border-base">
                <th className="px-2 py-1 font-medium">On</th>
                <th className="px-2 py-1 font-medium">Name</th>
                <th className="px-2 py-1 font-medium">Metric</th>
                <th className="px-2 py-1 font-medium text-right">Threshold</th>
                <th className="px-2 py-1 font-medium text-right">Now</th>
                <th className="px-2 py-1 font-medium">Recipient</th>
                <th className="px-2 py-1 font-medium">Last fired</th>
                <th className="px-2 py-1 font-medium" />
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => {
                const m = metricByKey.get(a.metric)
                const currentValue = m?.current_value ?? a.last_value ?? null
                const breached =
                  typeof currentValue === "number" &&
                  ((a.comparator === "gt" && currentValue > a.threshold) ||
                    (a.comparator === "gte" && currentValue >= a.threshold) ||
                    (a.comparator === "lt" && currentValue < a.threshold) ||
                    (a.comparator === "lte" && currentValue <= a.threshold) ||
                    (a.comparator === "eq" && currentValue === a.threshold))
                return (
                  <tr
                    key={a.id}
                    className="border-b border-ui-border-base"
                    style={
                      a.enabled && breached
                        ? { background: "rgba(220,38,38,0.06)" }
                        : undefined
                    }
                  >
                    <td className="px-2 py-1">
                      <Switch
                        checked={a.enabled}
                        onCheckedChange={() => toggleEnabled(a)}
                      />
                    </td>
                    <td className="px-2 py-1 font-medium">{a.name}</td>
                    <td className="px-2 py-1 text-ui-fg-muted">
                      {m?.label ?? a.metric}
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right">
                      {a.comparator} {formatValue(a.threshold)}
                    </td>
                    <td
                      className="px-2 py-1 tabular-nums text-right font-medium"
                      style={
                        a.enabled && breached
                          ? { color: PALETTE.rose600 }
                          : undefined
                      }
                    >
                      {formatValue(currentValue)}
                    </td>
                    <td className="px-2 py-1 text-ui-fg-muted truncate max-w-[200px]">
                      {a.recipient_email}
                    </td>
                    <td className="px-2 py-1 text-ui-fg-muted">
                      {formatRelativeTime(a.last_fired_at)}
                    </td>
                    <td className="px-2 py-1 text-right">
                      <button
                        type="button"
                        onClick={() => remove(a)}
                        className="text-ui-fg-muted hover:text-ui-tag-red-icon"
                        aria-label="Delete alert"
                      >
                        <Trash />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  )
}
