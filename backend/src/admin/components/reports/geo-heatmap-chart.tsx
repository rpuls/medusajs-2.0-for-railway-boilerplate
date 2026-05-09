import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { EmptyState } from "./empty-state"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type PostcodeRow = {
  postal_code: string
  city: string | null
  state: string | null
  country: string
  orders: number
  revenue: number
  distinct_customers: number
}

type Response = {
  from: string
  to: string
  summary: {
    distinct_postcodes: number
    total_orders: number
    total_revenue: number
  }
  by_country: Array<{
    country: string
    orders: number
    revenue: number
    postcodes: number
  }>
  top_postcodes: PostcodeRow[]
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

export const GeoHeatmapChart = ({
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
  const [loadedAt, setLoadedAt] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ from: fromIso, to: toIso })
    if (regionId) params.set("region_id", regionId)
    fetch(`/admin/reports/geo-heatmap?${params.toString()}`, {
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
  }, [fromIso, toIso, regionId])

  const top = data?.top_postcodes ?? []
  const max = top.reduce((m, r) => Math.max(m, r.orders), 0)

  return (
    <ReportCard
      title="Geographic distribution"
      caption="Orders + revenue per postcode. Top of the list is your strongest organic catchment — candidate for popups, postcards, or referral incentives."
      help={{
        title: "Geographic distribution",
        body: "Orders + revenue per shipping postcode in the window. The top of the list is your strongest organic catchment — natural candidate for postcards, popups, or referral incentives.",
        bullets: [
          "Postcodes with one order but high revenue are usually one happy customer worth a personal follow-up.",
          "Heavy concentration in 1–2 postcodes near your shop = local-foot-traffic drives the business; prioritise that geography for shopfront/event marketing.",
          "Pulls shipping_address.postal_code from each in-window order — orders without a shipping address (digital-only or pickup) are excluded.",
        ],
      }}
      loading={loading}
      error={error}
      loadedAt={loadedAt}
      csv={
        top.length === 0
          ? undefined
          : {
              filenameBase: "geo-postcodes",
              build: () =>
                buildCsv(
                  ["Postcode", "City", "State", "Country", "Orders", "Revenue", "Customers"],
                  top.map((r) => [
                    r.postal_code,
                    r.city ?? "",
                    r.state ?? "",
                    r.country,
                    r.orders,
                    r.revenue,
                    r.distinct_customers,
                  ])
                ),
            }
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Distinct postcodes
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {data?.summary.distinct_postcodes ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Orders shipped
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {data?.summary.total_orders ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Total revenue
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {formatCurrency(data?.summary.total_revenue ?? 0)}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Top postcode
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {top[0]?.postal_code ?? "—"}
          </Text>
        </div>
      </div>

      {data && data.by_country.length > 1 ? (
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          {data.by_country.map((c) => (
            <Text
              key={c.country}
              size="xsmall"
              className="text-ui-fg-subtle"
              title={`${c.orders} orders · ${formatCurrency(c.revenue)} · ${c.postcodes} postcodes`}
            >
              <strong className="text-ui-fg-base">{c.country}</strong>{" "}
              {c.orders} orders · {formatCurrency(c.revenue)}
            </Text>
          ))}
        </div>
      ) : null}

      {top.length === 0 ? (
        <EmptyState
          title="No shipping addresses in window"
          body="Either no orders shipped in the selected window or none had a postal code. International orders without a recognised postcode are excluded."
        />
      ) : (
        <div className="mt-3 overflow-auto max-h-[440px]">
          <table className="w-full text-xs">
            <thead className="text-left text-ui-fg-subtle">
              <tr className="border-b border-ui-border-base">
                <th className="px-2 py-1 font-medium">Postcode</th>
                <th className="px-2 py-1 font-medium">City / state</th>
                <th className="px-2 py-1 font-medium text-right">Orders</th>
                <th className="px-2 py-1 font-medium text-right">Customers</th>
                <th className="px-2 py-1 font-medium text-right">Revenue</th>
                <th className="px-2 py-1 font-medium" />
              </tr>
            </thead>
            <tbody>
              {top.slice(0, 30).map((r, i) => {
                const widthPct =
                  max > 0
                    ? Math.max(2, Math.round((r.orders / max) * 100))
                    : 0
                return (
                  <tr
                    key={r.country + r.postal_code + i}
                    className="border-b border-ui-border-base"
                  >
                    <td className="px-2 py-1 font-mono text-[11px] font-medium">
                      {r.country !== "AU" ? `${r.country} ` : ""}
                      {r.postal_code}
                    </td>
                    <td className="px-2 py-1 truncate max-w-[200px] text-ui-fg-muted">
                      {[r.city, r.state].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right font-medium">
                      {r.orders}
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right text-ui-fg-muted">
                      {r.distinct_customers}
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right">
                      {formatCurrency(r.revenue)}
                    </td>
                    <td className="px-2 py-1 w-16">
                      <div
                        className="h-2 rounded"
                        style={{
                          width: `${widthPct}%`,
                          background: PALETTE.teal700,
                        }}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {top.length > 30 ? (
            <Text size="xsmall" className="text-ui-fg-muted px-2 py-2">
              Showing top 30 of {top.length} — download CSV for the full list.
            </Text>
          ) : null}
        </div>
      )}
    </ReportCard>
  )
}
