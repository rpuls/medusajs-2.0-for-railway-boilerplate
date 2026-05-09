import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { EmptyState } from "./empty-state"
import { Sparkline } from "./sparkline"
import { PALETTE } from "../../lib/reports/palette"

type Response = {
  configured: boolean
  from: string
  to: string
  summary: {
    action_events: number
    action_sessions: number
    started_sessions: number
    carted_sessions: number
    saved_sessions: number
    avg_actions_per_session: number
    actions_per_cart_add: number
    cart_rate_pct: number
  } | null
  trend?: Array<{ date: string; actions: number }>
}

export const CustomizerIterationChart = ({
  fromIso,
  toIso,
}: {
  fromIso: string
  toIso: string
}) => {
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadedAt, setLoadedAt] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ from: fromIso, to: toIso })
    fetch(`/admin/reports/customizer-iteration?${params.toString()}`, {
      credentials: "include",
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((j) => {
        if (!cancelled) {
          setData(j as Response)
          setLoadedAt(Date.now())
        }
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
  }, [fromIso, toIso])

  if (data && !data.configured) {
    return (
      <ReportCard title="Customizer iteration depth">
        <EmptyState
          title="GA4 not configured"
          body="Set GOOGLE_SERVICE_ACCOUNT_JSON + GA4_PROPERTY_ID on the backend for this report."
        />
      </ReportCard>
    )
  }

  const summary = data?.summary
  const trendValues = (data?.trend ?? []).map((t) => t.actions)

  return (
    <ReportCard
      title="Customizer iteration depth"
      caption="How much fiddling each customizer session takes before adding to cart. High actions-per-cart-add ratio = friction in the design experience."
      help="Counts customizer_action_taken events from GA4 (throttled to 1 every 250ms client-side). avg_actions_per_session is the median fiddle count; actions_per_cart_add is the volume per actual conversion. If the second is ≫ the first, drop-off mid-design is the issue."
      loading={loading}
      error={error}
      loadedAt={loadedAt}
    >
      {!summary || summary.action_events === 0 ? (
        <EmptyState
          title="No customizer activity in window"
          body="Either no customers used the customizer yet, or the customizer_action_taken event hasn't propagated to GA4 (24-48h after first deploy). Check the customizer-funnel report for related signals."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
              <Text size="xsmall" className="text-ui-fg-subtle">
                Action events
              </Text>
              <div className="flex items-baseline gap-x-2">
                <Text className="text-2xl font-semibold tabular-nums">
                  {summary.action_events.toLocaleString("en-AU")}
                </Text>
                <Sparkline values={trendValues} width={60} height={20} />
              </div>
            </div>
            <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
              <Text size="xsmall" className="text-ui-fg-subtle">
                Avg actions/session
              </Text>
              <Text className="text-2xl font-semibold tabular-nums">
                {summary.avg_actions_per_session.toFixed(1)}
              </Text>
            </div>
            <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
              <Text size="xsmall" className="text-ui-fg-subtle">
                Actions per cart-add
              </Text>
              <Text
                className="text-2xl font-semibold tabular-nums"
                style={{
                  color:
                    summary.actions_per_cart_add > 100
                      ? PALETTE.amber600
                      : undefined,
                }}
              >
                {summary.actions_per_cart_add.toFixed(0)}
              </Text>
            </div>
            <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
              <Text size="xsmall" className="text-ui-fg-subtle">
                Cart conversion
              </Text>
              <Text
                className="text-2xl font-semibold tabular-nums"
                style={{
                  color:
                    summary.cart_rate_pct < 5
                      ? PALETTE.rose600
                      : summary.cart_rate_pct > 25
                        ? PALETTE.emerald600
                        : undefined,
                }}
              >
                {summary.cart_rate_pct.toFixed(1)}%
              </Text>
            </div>
          </div>
          <Text size="xsmall" className="text-ui-fg-muted block mt-2">
            {summary.started_sessions} sessions started a design ·{" "}
            {summary.carted_sessions} added to cart ·{" "}
            {summary.saved_sessions} saved a design.
          </Text>
        </>
      )}
    </ReportCard>
  )
}
