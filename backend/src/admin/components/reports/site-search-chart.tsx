import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type Response = {
  from: string
  to: string
  summary: {
    total_searches: number
    distinct_queries: number
    zero_result_searches: number
    zero_result_share: number
  }
  top_queries: Array<{ query: string; count: number; avg_results: number }>
  top_zero_result_queries: Array<{ query: string; count: number }>
  module_available: boolean
}

const KpiTile = ({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: string
}) => (
  <div className="flex flex-col gap-y-0.5 px-3 py-2 rounded-md bg-ui-bg-subtle/50">
    <Text size="xsmall" className="text-ui-fg-subtle">
      {label}
    </Text>
    <Text
      className="text-2xl font-semibold tabular-nums"
      style={color ? { color } : undefined}
    >
      {value}
    </Text>
  </div>
)

export const SiteSearchChart = ({
  fromIso,
  toIso,
  regionId,
}: {
  fromIso: string
  toIso: string
  regionId: string | null
}) => {
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ from: fromIso, to: toIso })
    if (regionId) params.set("region_id", regionId)
    fetch(`/admin/reports/site-search?${params.toString()}`, {
      credentials: "include",
    })
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
  }, [fromIso, toIso, regionId])

  const summary = data?.summary
  const zeroPct = summary
    ? (summary.zero_result_share * 100).toFixed(1)
    : "0.0"

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text)
    }
  }

  return (
    <ReportCard
      title="Internal site search"
      caption="What customers type into the search bar. Zero-result queries are gold for merchandising — they tell you what people want that you don't surface (or don't stock)."
      loading={loading}
      error={error}
      csv={
        !data || data.summary.total_searches === 0
          ? undefined
          : {
              filenameBase: "site-search",
              build: () => {
                const rows: any[] = [
                  ["Top queries", "Count", "Avg results"],
                  ...data.top_queries.map((q) => [
                    q.query,
                    q.count,
                    q.avg_results,
                  ]),
                  [],
                  ["Zero-result queries", "Count"],
                  ...data.top_zero_result_queries.map((q) => [q.query, q.count]),
                ]
                return rows.map((r) => r.join(",")).join("\n")
              },
            }
      }
    >
      {data && !data.module_available ? (
        <Text size="xsmall" className="text-ui-fg-muted">
          Search-event logging isn't available — the search-log module
          may not be registered on this backend yet, or the migration
          hasn't run.
        </Text>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <KpiTile
          label="Total searches"
          value={String(summary?.total_searches ?? 0)}
        />
        <KpiTile
          label="Distinct queries"
          value={String(summary?.distinct_queries ?? 0)}
        />
        <KpiTile
          label="Zero-result rate"
          value={`${zeroPct}%`}
          color={
            summary && summary.zero_result_share > 0.2
              ? PALETTE.amber600
              : undefined
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-2">
        <div className="flex flex-col gap-y-2">
          <Text size="small" className="font-semibold">
            Top queries
          </Text>
          {(data?.top_queries ?? []).length === 0 ? (
            <Text size="xsmall" className="text-ui-fg-muted">
              No searches in period.
            </Text>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {data?.top_queries.map((q, i) => (
                  <tr
                    key={q.query + i}
                    className="border-b border-ui-border-base"
                  >
                    <td className="px-2 py-1 text-ui-fg-muted tabular-nums w-6">
                      {i + 1}
                    </td>
                    <td className="px-2 py-1 truncate font-mono text-xs">
                      {q.query}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums w-12">
                      {q.count}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums w-16 text-ui-fg-muted">
                      {q.avg_results}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex flex-col gap-y-2">
          <Text size="small" className="font-semibold">
            Zero-result queries (always returned 0)
          </Text>
          {(data?.top_zero_result_queries ?? []).length === 0 ? (
            <Text size="xsmall" className="text-ui-fg-muted">
              No zero-result queries — your catalog covers searches well.
            </Text>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {data?.top_zero_result_queries.map((q, i) => (
                  <tr
                    key={q.query + i}
                    className="border-b border-ui-border-base hover:bg-ui-bg-subtle cursor-pointer"
                    onClick={() => copyToClipboard(q.query)}
                    title="Click to copy"
                  >
                    <td className="px-2 py-1 text-ui-fg-muted tabular-nums w-6">
                      {i + 1}
                    </td>
                    <td className="px-2 py-1 truncate font-mono text-xs">
                      {q.query}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums w-12">
                      {q.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ReportCard>
  )
}
