import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { EmptyState } from "./empty-state"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type Row = {
  query: string
  impressions_now: number
  clicks_now: number
  ctr_now: number
  impressions_prior: number
  clicks_prior: number
  ctr_prior: number
  ctr_delta_pct: number | null
  position_now: number
  position_prior: number
}

type Response = {
  configured: boolean
  from: string
  to: string
  prior_from?: string
  prior_to?: string
  queries: Row[]
  error?: string
}

export const GscCtrTrendChart = ({
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
  const [filter, setFilter] = useState<"all" | "losing" | "winning">("losing")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ from: fromIso, to: toIso })
    fetch(`/admin/reports/gsc-ctr-trend?${params.toString()}`, {
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
      <ReportCard title="GSC click-through rate trend">
        <EmptyState
          title="Search Console not configured"
          body="Set GOOGLE_SERVICE_ACCOUNT_JSON + GSC_SITE_URL on the backend so this report can read query data."
        />
      </ReportCard>
    )
  }

  const rows = (data?.queries ?? []).filter((r) => {
    if (filter === "all") return true
    if (filter === "losing")
      return r.ctr_delta_pct !== null && r.ctr_delta_pct < -5
    return r.ctr_delta_pct !== null && r.ctr_delta_pct > 5
  })

  return (
    <ReportCard
      title="GSC click-through rate trend"
      caption="Top 100 queries by impressions, with CTR vs the prior equal-length window. Losing queries usually mean stable rank but stale title/meta — a refresh often recovers."
      help={{
        title: "GSC click-through rate trend",
        body: "Top 100 search queries from Google Search Console, with click-through rate vs the prior equal-length window. Catches queries where you're losing clicks even though your ranking hasn't moved.",
        bullets: [
          "Big CTR drop + stable position = competitors changing their snippets / titles. Refresh your meta description and you usually recover.",
          "CTR delta = (current CTR − prior CTR) ÷ prior CTR. Position is the average rank in SERPs over the window.",
          "Queries where position is improving but CTR is dropping = likely cannibalisation; you have two pages competing for the same intent.",
          "GSC data trails real time by 2–3 days, so the most recent window may show partial numbers.",
        ],
      }}
      loading={loading}
      error={error}
      loadedAt={loadedAt}
      rightAccessory={
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="text-xs border border-ui-border-base rounded px-2 py-1 bg-ui-bg-base"
        >
          <option value="losing">Losing CTR (&lt; -5%)</option>
          <option value="winning">Winning CTR (&gt; +5%)</option>
          <option value="all">All queries</option>
        </select>
      }
      csv={
        rows.length === 0
          ? undefined
          : {
              filenameBase: "gsc-ctr-trend",
              build: () =>
                buildCsv(
                  [
                    "Query",
                    "Impr (now)",
                    "Clicks (now)",
                    "CTR % (now)",
                    "Impr (prior)",
                    "Clicks (prior)",
                    "CTR % (prior)",
                    "CTR Δ %",
                    "Pos (now)",
                    "Pos (prior)",
                  ],
                  rows.map((r) => [
                    r.query,
                    r.impressions_now,
                    r.clicks_now,
                    r.ctr_now,
                    r.impressions_prior,
                    r.clicks_prior,
                    r.ctr_prior,
                    r.ctr_delta_pct === null ? "" : r.ctr_delta_pct,
                    r.position_now,
                    r.position_prior,
                  ])
                ),
            }
      }
    >
      {rows.length === 0 ? (
        <EmptyState
          title={
            filter === "losing"
              ? "No queries losing significant CTR"
              : filter === "winning"
                ? "No queries gaining significant CTR"
                : "No GSC data in window"
          }
          body={
            filter !== "all"
              ? "Switch the filter to 'All queries' to see the full list, or extend the date range."
              : "GSC data may be delayed by 24-48h. Try widening the window."
          }
        />
      ) : (
        <div className="overflow-auto max-h-[480px] mt-2">
          <table className="w-full text-xs">
            <thead className="text-left text-ui-fg-subtle">
              <tr className="border-b border-ui-border-base">
                <th className="px-2 py-1 font-medium">Query</th>
                <th className="px-2 py-1 font-medium text-right">Impressions</th>
                <th className="px-2 py-1 font-medium text-right">Clicks</th>
                <th className="px-2 py-1 font-medium text-right">CTR %</th>
                <th className="px-2 py-1 font-medium text-right">Δ vs prior</th>
                <th className="px-2 py-1 font-medium text-right">Position</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.query} className="border-b border-ui-border-base">
                  <td className="px-2 py-1 truncate max-w-[260px]">
                    {r.query}
                  </td>
                  <td className="px-2 py-1 tabular-nums text-right">
                    {r.impressions_now.toLocaleString("en-AU")}
                  </td>
                  <td className="px-2 py-1 tabular-nums text-right">
                    {r.clicks_now.toLocaleString("en-AU")}
                  </td>
                  <td className="px-2 py-1 tabular-nums text-right">
                    {r.ctr_now.toFixed(1)}%
                  </td>
                  <td
                    className="px-2 py-1 tabular-nums text-right font-medium"
                    style={{
                      color:
                        r.ctr_delta_pct === null
                          ? undefined
                          : r.ctr_delta_pct < -5
                            ? PALETTE.rose600
                            : r.ctr_delta_pct > 5
                              ? PALETTE.emerald600
                              : undefined,
                    }}
                  >
                    {r.ctr_delta_pct === null
                      ? "—"
                      : `${r.ctr_delta_pct > 0 ? "+" : ""}${r.ctr_delta_pct.toFixed(1)}%`}
                  </td>
                  <td className="px-2 py-1 tabular-nums text-right text-ui-fg-muted">
                    {r.position_now.toFixed(1)}
                    {r.position_prior > 0 &&
                    Math.abs(r.position_now - r.position_prior) > 0.5 ? (
                      <span
                        className="ml-1 text-[10px]"
                        style={{
                          color:
                            r.position_now < r.position_prior
                              ? PALETTE.emerald600
                              : PALETTE.rose600,
                        }}
                      >
                        {r.position_now < r.position_prior ? "↑" : "↓"}
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ReportCard>
  )
}
