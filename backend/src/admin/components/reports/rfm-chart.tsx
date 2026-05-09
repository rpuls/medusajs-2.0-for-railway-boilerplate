import { Text } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type Customer = {
  customer_id: string | null
  email: string
  recency_days: number
  frequency: number
  monetary: number
  last_order_at: string
  r_score: number
  f_score: number
  m_score: number
  segment: string
}

type Segment = {
  segment: string
  label: string
  customer_count: number
  total_revenue: number
  avg_revenue: number
  customers: Customer[]
}

type Response = {
  from: string
  to: string
  total_customers: number
  segments: Segment[]
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

const SEGMENT_COLORS: Record<string, string> = {
  champions: PALETTE.emerald600,
  loyal: PALETTE.teal700,
  potential_loyalist: PALETTE.teal500,
  new_customer: PALETTE.teal300,
  promising: PALETTE.slate500,
  needs_attention: PALETTE.amber600,
  at_risk: PALETTE.amber600,
  cant_lose: PALETTE.rose600,
  hibernating: PALETTE.stone400,
  lost: PALETTE.stone300,
}

const SEGMENT_BLURB: Record<string, string> = {
  champions: "Bought recently, often, and spent a lot. Reward + ask for reviews.",
  loyal: "Order regularly. Cross-sell upsell candidates.",
  potential_loyalist: "Recent buyers — re-engage with new collections.",
  new_customer: "First order recently. Onboard with a follow-up email.",
  promising: "Mid-recency, low frequency — convert with a targeted offer.",
  needs_attention: "Slipping — bring back with a specific recommendation.",
  at_risk: "Used to spend a lot, hasn't returned. Win-back campaign.",
  cant_lose: "Top spenders going cold. Personal outreach worth it.",
  hibernating: "Long inactive. Low-cost reactivation only.",
  lost: "Single order long ago. Don't spend on these unless cheap.",
}

export const RfmChart = ({
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
  const [openSegment, setOpenSegment] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ from: fromIso, to: toIso })
    if (regionId) params.set("region_id", regionId)
    fetch(`/admin/reports/rfm?${params.toString()}`, { credentials: "include" })
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

  const segments = data?.segments ?? []
  const maxCount = useMemo(
    () => segments.reduce((m, s) => Math.max(m, s.customer_count), 0),
    [segments]
  )
  const totalRevenue = useMemo(
    () => segments.reduce((s, x) => s + x.total_revenue, 0),
    [segments]
  )

  return (
    <ReportCard
      title="RFM segments"
      caption="Customers bucketed by Recency / Frequency / Monetary value. Each segment is a marketing audience — Champions get rewards, At Risk get win-back, Lost get cheap reactivation only."
      help={{
        title: "RFM segments",
        body: "Every customer is scored on three axes — how recently they ordered, how often they order, and how much they spend — and bucketed into a named segment. Each segment is a different marketing audience.",
        bullets: [
          "Champions = recent, frequent, high spend. Worth a personal thank-you, early access, loyalty perk.",
          "At Risk = used to buy often but haven't lately. Send a personalised win-back; offer a discount only if it doesn't trigger.",
          "Lost = haven't ordered in a long time and were never high-value. Cheap, batched reactivation only — don't burn margin on them.",
          "Recency = days since last order. Frequency = order count to date. Monetary = lifetime revenue.",
        ],
      }}
      loading={loading}
      error={error}
      csv={
        segments.length === 0
          ? undefined
          : {
              filenameBase: "rfm-segments",
              build: () => {
                const rows: (string | number)[][] = []
                for (const seg of segments) {
                  for (const c of seg.customers) {
                    rows.push([
                      seg.label,
                      c.email,
                      c.recency_days,
                      c.frequency,
                      c.monetary,
                      c.r_score,
                      c.f_score,
                      c.m_score,
                      c.last_order_at,
                      c.customer_id ?? "",
                    ])
                  }
                }
                return buildCsv(
                  [
                    "Segment",
                    "Email",
                    "Recency (days)",
                    "Frequency",
                    "Monetary",
                    "R",
                    "F",
                    "M",
                    "Last order",
                    "Customer ID",
                  ],
                  rows
                )
              },
            }
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Total customers
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {data?.total_customers ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Total revenue (cohort)
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {formatCurrency(totalRevenue)}
          </Text>
        </div>
      </div>

      <div className="flex flex-col gap-y-1 mt-3">
        {segments.map((seg) => {
          const widthPct =
            maxCount > 0
              ? Math.max(2, Math.round((seg.customer_count / maxCount) * 100))
              : 0
          const isOpen = openSegment === seg.segment
          const color = SEGMENT_COLORS[seg.segment] ?? PALETTE.slate500
          return (
            <div key={seg.segment} className="border-b border-ui-border-base">
              <button
                type="button"
                className="w-full flex items-center gap-x-3 py-1.5 hover:bg-ui-bg-subtle/40 px-1 rounded text-left"
                onClick={() =>
                  setOpenSegment(isOpen ? null : seg.segment)
                }
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ background: color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-x-2">
                    <Text size="small" className="font-medium truncate">
                      {seg.label}
                    </Text>
                    <Text
                      size="xsmall"
                      className="tabular-nums text-ui-fg-muted shrink-0"
                    >
                      {seg.customer_count} ·{" "}
                      {formatCurrency(seg.total_revenue)}
                    </Text>
                  </div>
                  <div className="h-1.5 mt-1 rounded bg-ui-bg-subtle overflow-hidden">
                    <div
                      className="h-full"
                      style={{ width: `${widthPct}%`, background: color }}
                    />
                  </div>
                </div>
                <Text size="xsmall" className="text-ui-fg-muted shrink-0">
                  {isOpen ? "▴" : "▾"}
                </Text>
              </button>
              {isOpen ? (
                <div className="px-2 pb-3 pt-1">
                  <Text
                    size="xsmall"
                    className="text-ui-fg-subtle italic mb-2 block"
                  >
                    {SEGMENT_BLURB[seg.segment]}
                  </Text>
                  {seg.customers.length === 0 ? (
                    <Text size="xsmall" className="text-ui-fg-muted">
                      No customers in this segment.
                    </Text>
                  ) : (
                    <div className="overflow-auto max-h-[280px]">
                      <table className="w-full text-xs">
                        <thead className="text-left text-ui-fg-subtle">
                          <tr className="border-b border-ui-border-base">
                            <th className="px-2 py-1 font-medium">Email</th>
                            <th className="px-2 py-1 font-medium text-right">
                              Spend
                            </th>
                            <th className="px-2 py-1 font-medium text-right">
                              Orders
                            </th>
                            <th className="px-2 py-1 font-medium text-right">
                              Last (d)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {seg.customers.slice(0, 50).map((c) => {
                            const href = c.customer_id
                              ? `/app/customers/${c.customer_id}`
                              : null
                            return (
                              <tr
                                key={c.email + (c.customer_id ?? "")}
                                className="border-b border-ui-border-base"
                                onClick={() => {
                                  if (href) window.location.href = href
                                }}
                                style={
                                  href ? { cursor: "pointer" } : undefined
                                }
                              >
                                <td className="px-2 py-1 truncate max-w-[260px]">
                                  {c.email}
                                </td>
                                <td className="px-2 py-1 tabular-nums text-right font-medium">
                                  {formatCurrency(c.monetary)}
                                </td>
                                <td className="px-2 py-1 tabular-nums text-right">
                                  {c.frequency}
                                </td>
                                <td className="px-2 py-1 tabular-nums text-right text-ui-fg-muted">
                                  {Math.round(c.recency_days)}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                      {seg.customers.length > 50 ? (
                        <Text
                          size="xsmall"
                          className="text-ui-fg-muted px-2 py-2"
                        >
                          Showing 50 of {seg.customers.length} — download CSV
                          for the full list.
                        </Text>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )
        })}
        {segments.length === 0 ? (
          <Text size="xsmall" className="text-ui-fg-muted px-2 py-3">
            No customers in period.
          </Text>
        ) : null}
      </div>
    </ReportCard>
  )
}
