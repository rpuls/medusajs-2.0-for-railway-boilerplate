import { Text, Button } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type Candidate = {
  customer_id: string | null
  email: string
  first_name: string | null
  order_count: number
  last_order_id: string
  last_order_display_id: number | null
  last_order_at: string
  last_order_total: number
  median_gap_days: number
  days_since_last: number
  overdue_factor: number
  lifetime_revenue: number
  severity: "drifting" | "at_risk" | "lost"
  country_code: string | null
  currency_code: string
}

type Response = {
  mode: "preview"
  summary: {
    total: number
    drifting: number
    at_risk: number
    lost: number
    total_lifetime_revenue: number
  }
  candidates: Candidate[]
}

const SEVERITY_COLORS: Record<Candidate["severity"], string> = {
  drifting: PALETTE.amber600,
  at_risk: PALETTE.rose600,
  lost: PALETTE.stone400,
}

const SEVERITY_LABEL: Record<Candidate["severity"], string> = {
  drifting: "Drifting",
  at_risk: "At risk",
  lost: "Lost",
}

const formatCurrency = (n: number) => {
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `$${Math.round(n)}`
  }
}

export const ChurnQueueChart = () => {
  // The churn queue is point-in-time and not period-bound, so the standard
  // date-range filter doesn't apply.
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshNonce, setRefreshNonce] = useState(0)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionRunning, setActionRunning] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/admin/reports/churn-queue`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((j) => {
        if (!cancelled) setData(j as Response)
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

  const runAction = async (mode: "dry_run" | "send") => {
    if (mode === "send") {
      const ok = window.confirm(
        `Send win-back emails to up to 25 customers in the queue right now? They'll be marked so they don't receive another for 90 days.`
      )
      if (!ok) return
    }
    setActionRunning(true)
    setActionMessage(null)
    try {
      const params = new URLSearchParams()
      params.set(mode === "send" ? "send" : "dry_run", "1")
      const res = await fetch(
        `/admin/reports/churn-queue?${params.toString()}`,
        { credentials: "include" }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const j = await res.json()
      setActionMessage(
        mode === "dry_run"
          ? `Dry run: would have sent ${j.skipped_dry_run} emails (considered ${j.considered}).`
          : `Sent ${j.sent} emails (${j.failures} failures, ${j.considered} considered total).`
      )
      // Refresh queue after a real send so the just-emailed customers drop off.
      if (mode === "send") setRefreshNonce((n) => n + 1)
    } catch (e: any) {
      setActionMessage(`Action failed: ${e?.message ?? String(e)}`)
    } finally {
      setActionRunning(false)
    }
  }

  const summary = data?.summary

  return (
    <ReportCard
      title="Predicted churn / win-back queue"
      caption="Customers past 2× their typical reorder gap, classified by severity. Highest-LTV customers first — sending in bulk is risky, so the in-app 'Send batch' caps at 25 per run."
      loading={loading}
      error={error}
      rightAccessory={
        data ? (
          <div className="flex gap-x-2">
            <Button
              size="small"
              variant="secondary"
              onClick={() => runAction("dry_run")}
              disabled={actionRunning || data.candidates.length === 0}
            >
              Dry run
            </Button>
            <Button
              size="small"
              variant="primary"
              onClick={() => runAction("send")}
              disabled={actionRunning || data.candidates.length === 0}
            >
              Send batch
            </Button>
          </div>
        ) : null
      }
      csv={
        !data || data.candidates.length === 0
          ? undefined
          : {
              filenameBase: "churn-queue",
              build: () =>
                buildCsv(
                  [
                    "Email",
                    "Severity",
                    "Days since last",
                    "Median gap",
                    "Overdue factor",
                    "Order count",
                    "Lifetime revenue",
                    "Last order",
                    "Customer ID",
                  ],
                  data.candidates.map((c) => [
                    c.email,
                    SEVERITY_LABEL[c.severity],
                    c.days_since_last,
                    c.median_gap_days,
                    c.overdue_factor,
                    c.order_count,
                    c.lifetime_revenue,
                    c.last_order_at,
                    c.customer_id ?? "",
                  ])
                ),
            }
      }
    >
      {actionMessage ? (
        <div className="rounded-md bg-ui-bg-subtle/50 px-3 py-2 mb-2">
          <Text size="xsmall">{actionMessage}</Text>
        </div>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Queue size
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {summary?.total ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Drifting / At-risk / Lost
          </Text>
          <Text className="text-lg font-semibold tabular-nums">
            <span style={{ color: SEVERITY_COLORS.drifting }}>
              {summary?.drifting ?? 0}
            </span>{" "}
            ·{" "}
            <span style={{ color: SEVERITY_COLORS.at_risk }}>
              {summary?.at_risk ?? 0}
            </span>{" "}
            ·{" "}
            <span style={{ color: SEVERITY_COLORS.lost }}>
              {summary?.lost ?? 0}
            </span>
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Combined lifetime revenue
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {formatCurrency(summary?.total_lifetime_revenue ?? 0)}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Send cap per batch
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">25</Text>
        </div>
      </div>

      {data && data.candidates.length === 0 ? (
        <Text size="xsmall" className="text-ui-fg-muted block mt-3">
          No customers in the queue right now. Either no one is overdue past
          2× their cadence, or everyone overdue was emailed in the last 90
          days.
        </Text>
      ) : (
        <div className="overflow-auto max-h-[400px] mt-3">
          <table className="w-full text-sm">
            <thead className="text-left text-ui-fg-subtle text-xs">
              <tr className="border-b border-ui-border-base">
                <th className="px-2 py-1 font-medium">Customer</th>
                <th className="px-2 py-1 font-medium">Severity</th>
                <th className="px-2 py-1 font-medium text-right">Days late</th>
                <th className="px-2 py-1 font-medium text-right">Orders</th>
                <th className="px-2 py-1 font-medium text-right">Lifetime</th>
              </tr>
            </thead>
            <tbody>
              {data?.candidates.map((c) => {
                const href = c.customer_id
                  ? `/app/customers/${c.customer_id}`
                  : null
                return (
                  <tr
                    key={c.customer_id ?? c.email}
                    className="border-b border-ui-border-base hover:bg-ui-bg-subtle"
                    onClick={() => {
                      if (href) window.location.href = href
                    }}
                    style={href ? { cursor: "pointer" } : undefined}
                  >
                    <td className="px-2 py-1 truncate max-w-[280px]">
                      <Text size="small" className="truncate">
                        {c.email}
                      </Text>
                    </td>
                    <td className="px-2 py-1">
                      <span
                        className="px-1.5 py-0.5 rounded text-white text-[10px]"
                        style={{ background: SEVERITY_COLORS[c.severity] }}
                      >
                        {SEVERITY_LABEL[c.severity]}
                      </span>
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right">
                      {Math.round(c.days_since_last)}d
                      <Text
                        size="xsmall"
                        className="text-ui-fg-muted block leading-none"
                      >
                        {c.overdue_factor}× cadence
                      </Text>
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right text-ui-fg-muted">
                      {c.order_count}
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right font-medium">
                      {formatCurrency(c.lifetime_revenue)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </ReportCard>
  )
}
