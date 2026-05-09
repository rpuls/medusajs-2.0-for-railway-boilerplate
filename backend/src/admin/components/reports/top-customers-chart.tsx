import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type Customer = {
  customer_id: string | null
  name: string
  email: string
  revenue: number
  orders: number
  aov: number
  last_order_at: string
}

type Response = {
  from: string
  to: string
  summary: {
    total_distinct_customers: number
    total_revenue: number
    top10_revenue: number
    top10_revenue_share: number
  }
  customers: Customer[]
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

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("en-AU", {
      month: "short",
      day: "numeric",
    })
  } catch {
    return iso.slice(0, 10)
  }
}

export const TopCustomersChart = ({
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
    fetch(`/admin/reports/top-customers?${params.toString()}`, {
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

  const sharePct = data ? (data.summary.top10_revenue_share * 100).toFixed(1) : "0.0"
  const concentrationBand =
    data && data.summary.top10_revenue_share > 0.6
      ? "high"
      : data && data.summary.top10_revenue_share > 0.4
        ? "moderate"
        : "low"
  const bandColor =
    concentrationBand === "high"
      ? PALETTE.rose600
      : concentrationBand === "moderate"
        ? PALETTE.amber600
        : PALETTE.emerald600

  return (
    <ReportCard
      title="Top customers"
      caption="Top 20 by revenue in period. The concentration figure (top 10 share) flags revenue fragility — above 60% means losing one or two customers would hurt."
      help={{
        title: "Top customers",
        body: "The 20 customers who contributed the most revenue in the window, plus a 'top-10 concentration' figure that tells you how much of total revenue those few accounts represent.",
        bullets: [
          "Top-10 share >60% (red) = revenue fragility. Losing one or two customers would meaningfully hurt the month. Diversify acquisition before scaling spend.",
          "Top-10 share 30–60% (amber) = healthy concentration; you have a power-law revenue distribution but enough breadth to absorb a defection.",
          "Use the list as a personal-outreach roster: a quick thank-you, an early-access offer, or a check-in call lands disproportionately well with these customers.",
        ],
      }}
      loading={loading}
      error={error}
      csv={
        !data || data.customers.length === 0
          ? undefined
          : {
              filenameBase: "top-customers",
              build: () =>
                buildCsv(
                  ["Rank", "Name", "Email", "Revenue", "Orders", "AOV", "Last order"],
                  data.customers.map((c, i) => [
                    i + 1,
                    c.name,
                    c.email,
                    c.revenue,
                    c.orders,
                    c.aov,
                    c.last_order_at,
                  ])
                ),
            }
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Top 10 revenue share
          </Text>
          <div className="flex items-baseline gap-x-2">
            <Text className="text-2xl font-semibold tabular-nums">
              {sharePct}%
            </Text>
            <Text size="xsmall" style={{ color: bandColor }} className="capitalize">
              {concentrationBand} concentration
            </Text>
          </div>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Distinct customers
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {data?.summary.total_distinct_customers ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Top 10 revenue
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {formatCurrency(data?.summary.top10_revenue ?? 0)}
          </Text>
        </div>
      </div>
      <div className="overflow-auto max-h-[400px] mt-2">
        <table className="w-full text-sm">
          <thead className="text-left text-ui-fg-subtle text-xs">
            <tr className="border-b border-ui-border-base">
              <th className="px-2 py-1 font-medium">#</th>
              <th className="px-2 py-1 font-medium">Customer</th>
              <th className="px-2 py-1 font-medium text-right">Revenue</th>
              <th className="px-2 py-1 font-medium text-right">Orders</th>
              <th className="px-2 py-1 font-medium text-right">AOV</th>
              <th className="px-2 py-1 font-medium text-right">Last order</th>
            </tr>
          </thead>
          <tbody>
            {(data?.customers ?? []).map((c, i) => {
              const href = c.customer_id ? `/app/customers/${c.customer_id}` : null
              const inner = (
                <>
                  <td className="px-2 py-1 tabular-nums text-ui-fg-muted">{i + 1}</td>
                  <td className="px-2 py-1">
                    <div className="flex flex-col">
                      <Text size="small" className="font-medium truncate">
                        {c.name}
                      </Text>
                      <Text size="xsmall" className="text-ui-fg-muted truncate">
                        {c.email}
                      </Text>
                    </div>
                  </td>
                  <td className="px-2 py-1 tabular-nums text-right font-medium">
                    {formatCurrency(c.revenue)}
                  </td>
                  <td className="px-2 py-1 tabular-nums text-right">{c.orders}</td>
                  <td className="px-2 py-1 tabular-nums text-right">
                    {formatCurrency(c.aov)}
                  </td>
                  <td className="px-2 py-1 tabular-nums text-right text-ui-fg-muted">
                    {formatDate(c.last_order_at)}
                  </td>
                </>
              )
              if (href) {
                return (
                  <tr
                    key={c.customer_id ?? c.email + i}
                    className="border-b border-ui-border-base hover:bg-ui-bg-subtle cursor-pointer"
                    onClick={() => {
                      window.location.href = href
                    }}
                  >
                    {inner}
                  </tr>
                )
              }
              return (
                <tr
                  key={c.email + i}
                  className="border-b border-ui-border-base"
                >
                  {inner}
                </tr>
              )
            })}
          </tbody>
        </table>
        {(data?.customers ?? []).length === 0 ? (
          <Text size="xsmall" className="text-ui-fg-muted px-2 py-3">
            No customers in period.
          </Text>
        ) : null}
      </div>
    </ReportCard>
  )
}
