import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { EmptyState } from "./empty-state"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type Row = {
  handle: string
  title: string
  product_id: string | null
  page_views: number
  orders: number
  revenue: number
  conversion_rate_pct: number
  revenue_per_view: number
}

type Response = {
  configured: boolean
  from: string
  to: string
  products: Row[]
  error?: string
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

export const PdpConversionChart = ({
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
  const [sortBy, setSortBy] = useState<"views" | "conversion" | "revenue_per_view">("views")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ from: fromIso, to: toIso })
    if (regionId) params.set("region_id", regionId)
    fetch(`/admin/reports/pdp-conversion?${params.toString()}`, {
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

  if (data && !data.configured) {
    return (
      <ReportCard title="PDP conversion rate">
        <EmptyState
          title="GA4 not configured"
          body="Set GOOGLE_SERVICE_ACCOUNT_JSON + GA4_PROPERTY_ID on the backend so this report can read product page views."
        />
      </ReportCard>
    )
  }

  const rows = (data?.products ?? []).slice().sort((a, b) => {
    if (sortBy === "views") return b.page_views - a.page_views
    if (sortBy === "conversion")
      return b.conversion_rate_pct - a.conversion_rate_pct
    return b.revenue_per_view - a.revenue_per_view
  })

  return (
    <ReportCard
      title="PDP conversion rate"
      caption="For each product page, GA4 page-views ÷ orders containing that product. Sort by views to find high-traffic-low-conversion pages — that's where the biggest copy / pricing / mockup wins live."
      help="Conversion rate = (orders containing this product / page-views on /products/[handle]). Revenue per view = total line revenue / page-views. Note that GA4 page paths use the product handle, so renamed products lose history."
      loading={loading}
      error={error}
      loadedAt={loadedAt}
      rightAccessory={
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="text-xs border border-ui-border-base rounded px-2 py-1 bg-ui-bg-base"
        >
          <option value="views">Sort by views</option>
          <option value="conversion">Sort by conversion %</option>
          <option value="revenue_per_view">Sort by $/view</option>
        </select>
      }
      csv={
        rows.length === 0
          ? undefined
          : {
              filenameBase: "pdp-conversion",
              build: () =>
                buildCsv(
                  ["Handle", "Title", "Page views", "Orders", "Conversion %", "Revenue", "$/view"],
                  rows.map((r) => [
                    r.handle,
                    r.title,
                    r.page_views,
                    r.orders,
                    r.conversion_rate_pct,
                    r.revenue,
                    r.revenue_per_view,
                  ])
                ),
            }
      }
    >
      {rows.length === 0 ? (
        <EmptyState
          title="No PDP traffic in window"
          body="GA4 hasn't recorded any /products/[handle] views in the selected window. Wait for traffic or extend the date range."
        />
      ) : (
        <div className="overflow-auto max-h-[480px] mt-3">
          <table className="w-full text-xs">
            <thead className="text-left text-ui-fg-subtle">
              <tr className="border-b border-ui-border-base">
                <th className="px-2 py-1 font-medium">Product</th>
                <th className="px-2 py-1 font-medium text-right">Views</th>
                <th className="px-2 py-1 font-medium text-right">Orders</th>
                <th className="px-2 py-1 font-medium text-right">Conv %</th>
                <th className="px-2 py-1 font-medium text-right">$/view</th>
                <th className="px-2 py-1 font-medium text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 100).map((r) => {
                const lowConv =
                  r.page_views >= 100 && r.conversion_rate_pct < 1
                const href = r.product_id
                  ? `/app/products/${r.product_id}`
                  : null
                return (
                  <tr
                    key={r.handle}
                    className="border-b border-ui-border-base hover:bg-ui-bg-subtle"
                    onClick={() => {
                      if (href) window.location.href = href
                    }}
                    style={
                      lowConv
                        ? {
                            background: "rgba(217,119,6,0.05)",
                            cursor: href ? "pointer" : undefined,
                          }
                        : { cursor: href ? "pointer" : undefined }
                    }
                    title={
                      lowConv
                        ? "High traffic, low conversion — review copy / pricing / mockups"
                        : undefined
                    }
                  >
                    <td className="px-2 py-1 truncate max-w-[280px]">
                      <Text size="small" className="font-medium truncate">
                        {r.title}
                      </Text>
                      <Text
                        size="xsmall"
                        className="text-ui-fg-muted font-mono text-[10px]"
                      >
                        {r.handle}
                      </Text>
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right font-medium">
                      {r.page_views.toLocaleString("en-AU")}
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right">
                      {r.orders}
                    </td>
                    <td
                      className="px-2 py-1 tabular-nums text-right font-medium"
                      style={{
                        color: lowConv
                          ? PALETTE.amber600
                          : r.conversion_rate_pct > 5
                            ? PALETTE.emerald600
                            : undefined,
                      }}
                    >
                      {r.conversion_rate_pct.toFixed(1)}%
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right text-ui-fg-muted">
                      {formatCurrency(r.revenue_per_view)}
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right">
                      {formatCurrency(r.revenue)}
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
