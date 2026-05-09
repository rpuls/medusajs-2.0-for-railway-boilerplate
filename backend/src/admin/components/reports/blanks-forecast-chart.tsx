import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type ForecastRow = {
  variant_id: string
  sku: string | null
  title: string
  product_title: string
  product_id: string | null
  in_stock: number
  needed_total: number
  needed_now: number
  needed_soon: number
  needed_lead_time: number
  deficit: number
  order_count: number
  blocked_orders: Array<{
    order_id: string
    display_id: number | null
    quantity: number
    urgency: string
  }>
}

type Response = {
  summary: {
    units_in_pipeline: number
    units_short_total: number
    units_short_now: number
    skus_short: number
  }
  rows: ForecastRow[]
}

export const BlanksForecastChart = ({
  regionId,
}: {
  fromIso: string
  toIso: string
  regionId: string | null
}) => {
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (regionId) params.set("region_id", regionId)
    fetch(
      `/admin/reports/blanks-forecast${params.toString() ? `?${params}` : ""}`,
      { credentials: "include" }
    )
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
  }, [regionId])

  const rowsToShow = (data?.rows ?? []).filter((r) =>
    showAll ? true : r.deficit > 0
  )

  return (
    <ReportCard
      title="Blanks reorder forecast (AS Colour)"
      caption="Aggregates blanks demand across every active order and compares to current Medusa stock. Use the deficit list as the next AS Colour PO. Orders that already have an ascolour_order_id stamped are excluded — that demand's already in flight."
      loading={loading}
      error={error}
      rightAccessory={
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="text-xs underline text-ui-fg-subtle hover:text-ui-fg-base"
        >
          {showAll ? "Show shortages only" : "Show all variants"}
        </button>
      }
      csv={
        !data || data.rows.length === 0
          ? undefined
          : {
              filenameBase: "blanks-forecast",
              build: () =>
                buildCsv(
                  [
                    "Product",
                    "Variant",
                    "SKU",
                    "In stock",
                    "Needed (now)",
                    "Needed (soon)",
                    "Needed (lead time)",
                    "Needed (total)",
                    "Deficit",
                    "Order count",
                  ],
                  data.rows.map((r) => [
                    r.product_title,
                    r.title,
                    r.sku ?? "",
                    r.in_stock,
                    r.needed_now,
                    r.needed_soon,
                    r.needed_lead_time,
                    r.needed_total,
                    r.deficit,
                    r.order_count,
                  ])
                ),
            }
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Units needed (pipeline)
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {(data?.summary.units_in_pipeline ?? 0).toLocaleString("en-AU")}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Units short (urgent)
          </Text>
          <Text
            className="text-2xl font-semibold tabular-nums"
            style={{
              color:
                (data?.summary.units_short_now ?? 0) > 0
                  ? PALETTE.rose600
                  : undefined,
            }}
          >
            {(data?.summary.units_short_now ?? 0).toLocaleString("en-AU")}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Units short (total)
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {(data?.summary.units_short_total ?? 0).toLocaleString("en-AU")}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            SKUs short
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {data?.summary.skus_short ?? 0}
          </Text>
        </div>
      </div>

      {rowsToShow.length === 0 ? (
        <Text size="xsmall" className="text-ui-fg-muted block mt-3">
          {showAll
            ? "No active orders need blanks right now."
            : "No shortages — current stock covers all active orders."}
        </Text>
      ) : (
        <div className="overflow-auto max-h-[440px] mt-3">
          <table className="w-full text-xs">
            <thead className="text-left text-ui-fg-subtle">
              <tr className="border-b border-ui-border-base">
                <th className="px-2 py-1 font-medium">Product</th>
                <th className="px-2 py-1 font-medium">Variant</th>
                <th className="px-2 py-1 font-medium">SKU</th>
                <th className="px-2 py-1 font-medium text-right">Stock</th>
                <th className="px-2 py-1 font-medium text-right">Now</th>
                <th className="px-2 py-1 font-medium text-right">Soon</th>
                <th className="px-2 py-1 font-medium text-right">Lead</th>
                <th className="px-2 py-1 font-medium text-right">Deficit</th>
                <th className="px-2 py-1 font-medium text-right">Orders</th>
              </tr>
            </thead>
            <tbody>
              {rowsToShow.map((r) => {
                const urgentDeficit = Math.max(0, r.needed_now - r.in_stock)
                const href = r.product_id
                  ? `/app/products/${r.product_id}`
                  : null
                return (
                  <tr
                    key={r.variant_id}
                    className="border-b border-ui-border-base hover:bg-ui-bg-subtle"
                    onClick={() => {
                      if (href) window.location.href = href
                    }}
                    style={
                      urgentDeficit > 0
                        ? {
                            background: "rgba(220,38,38,0.05)",
                            cursor: href ? "pointer" : undefined,
                          }
                        : { cursor: href ? "pointer" : undefined }
                    }
                    title={r.blocked_orders
                      .map(
                        (o) =>
                          `#${o.display_id ?? o.order_id.slice(0, 6)} (${o.quantity})`
                      )
                      .join(", ")}
                  >
                    <td className="px-2 py-1 truncate max-w-[200px]">
                      {r.product_title}
                    </td>
                    <td className="px-2 py-1 truncate max-w-[120px] text-ui-fg-muted">
                      {r.title}
                    </td>
                    <td className="px-2 py-1 font-mono text-[10px] text-ui-fg-muted">
                      {r.sku ?? ""}
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right">
                      {r.in_stock}
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right">
                      {r.needed_now}
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right text-ui-fg-muted">
                      {r.needed_soon}
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right text-ui-fg-muted">
                      {r.needed_lead_time}
                    </td>
                    <td
                      className="px-2 py-1 tabular-nums text-right font-medium"
                      style={
                        r.deficit > 0
                          ? { color: PALETTE.rose600 }
                          : undefined
                      }
                    >
                      {r.deficit > 0 ? `+${r.deficit}` : 0}
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right text-ui-fg-muted">
                      {r.order_count}
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
