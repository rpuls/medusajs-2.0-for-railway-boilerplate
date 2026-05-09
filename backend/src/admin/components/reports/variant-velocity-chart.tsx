import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { EmptyState } from "./empty-state"
import { Sparkline } from "./sparkline"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type Row = {
  variant_id: string
  title: string
  product_title: string
  product_id: string | null
  sku: string | null
  in_stock: number
  total_units: number
  avg_per_week: number
  weekly: number[]
  momentum: "hot" | "warm" | "steady" | "cooling" | "cold"
  momentum_ratio: number
}

type Response = {
  weeks: number
  week_starts: string[]
  summary: {
    tracked_variants: number
    hot: number
    cold: number
  }
  rows: Row[]
}

const MOMENTUM_COLORS: Record<Row["momentum"], string> = {
  hot: PALETTE.emerald600,
  warm: PALETTE.teal500,
  steady: PALETTE.slate500,
  cooling: PALETTE.amber600,
  cold: PALETTE.rose600,
}

const MOMENTUM_LABEL: Record<Row["momentum"], string> = {
  hot: "Hot",
  warm: "Warm",
  steady: "Steady",
  cooling: "Cooling",
  cold: "Cold",
}

export const VariantVelocityChart = ({
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
  const [filter, setFilter] = useState<"all" | "hot" | "cold">("all")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams()
    if (regionId) params.set("region_id", regionId)
    fetch(
      `/admin/reports/variant-velocity${params.toString() ? `?${params}` : ""}`,
      { credentials: "include" }
    )
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
  }, [regionId])

  const rows = (data?.rows ?? []).filter((r) =>
    filter === "all"
      ? true
      : filter === "hot"
        ? r.momentum === "hot" || r.momentum === "warm"
        : r.momentum === "cold" || r.momentum === "cooling"
  )

  return (
    <ReportCard
      title="Variant velocity (12-week)"
      caption="Units sold per week per variant, with momentum classification. Hot SKUs need more inventory; cold ones need clearance."
      help={{
        title: "Variant velocity (12-week)",
        body: "Units sold per week per variant over the last 12 weeks, with momentum classification (Hot / Warm / Steady / Cooling / Cold). Tells you which variants are accelerating and which are losing steam — at the variant level, where reorders happen.",
        bullets: [
          "Hot variants (≥2× last 6 weeks vs prior 6) need more inventory before they stock-out and momentum dies.",
          "Cold variants (<0.4×) need clearance — flash sale, bundle, or markdown before the working-capital cost compounds.",
          "Steady is fine; reorder on standard cadence. Warm and Cooling are watch-list — confirm with another data point before acting.",
          "Variants with no sales at all in 12 weeks are excluded from this report — see the aging-inventory report for those.",
        ],
      }}
      loading={loading}
      error={error}
      loadedAt={loadedAt}
      rightAccessory={
        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value as "all" | "hot" | "cold")
          }
          className="text-xs border border-ui-border-base rounded px-2 py-1 bg-ui-bg-base"
        >
          <option value="all">All movers</option>
          <option value="hot">Hot + warm</option>
          <option value="cold">Cooling + cold</option>
        </select>
      }
      csv={
        rows.length === 0
          ? undefined
          : {
              filenameBase: "variant-velocity",
              build: () =>
                buildCsv(
                  [
                    "Product",
                    "Variant",
                    "SKU",
                    "Total units (12w)",
                    "Avg/week",
                    "Momentum",
                    "Ratio",
                    "In stock",
                  ],
                  rows.map((r) => [
                    r.product_title,
                    r.title,
                    r.sku ?? "",
                    r.total_units,
                    r.avg_per_week,
                    r.momentum,
                    r.momentum_ratio,
                    r.in_stock,
                  ])
                ),
            }
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Tracked variants
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {data?.summary.tracked_variants ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Hot
          </Text>
          <Text
            className="text-2xl font-semibold tabular-nums"
            style={{ color: PALETTE.emerald600 }}
          >
            {data?.summary.hot ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Cold
          </Text>
          <Text
            className="text-2xl font-semibold tabular-nums"
            style={{ color: PALETTE.rose600 }}
          >
            {data?.summary.cold ?? 0}
          </Text>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No variants moving in the last 12 weeks"
          body="Either no managed-inventory variants have sold, or your sales data lives outside Medusa. See aging-inventory if you have stock that's never moved."
        />
      ) : (
        <div className="overflow-auto max-h-[480px] mt-3">
          <table className="w-full text-xs">
            <thead className="text-left text-ui-fg-subtle">
              <tr className="border-b border-ui-border-base">
                <th className="px-2 py-1 font-medium">Product</th>
                <th className="px-2 py-1 font-medium">Variant</th>
                <th className="px-2 py-1 font-medium text-center">12-week trend</th>
                <th className="px-2 py-1 font-medium text-right">Total</th>
                <th className="px-2 py-1 font-medium text-right">Avg/wk</th>
                <th className="px-2 py-1 font-medium text-right">Stock</th>
                <th className="px-2 py-1 font-medium">Momentum</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
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
                    style={href ? { cursor: "pointer" } : undefined}
                  >
                    <td className="px-2 py-1 truncate max-w-[200px]">
                      {r.product_title}
                    </td>
                    <td className="px-2 py-1 truncate max-w-[120px] text-ui-fg-muted">
                      {r.title}
                    </td>
                    <td className="px-2 py-1 text-center">
                      <Sparkline
                        values={r.weekly}
                        width={100}
                        height={20}
                        color={MOMENTUM_COLORS[r.momentum]}
                      />
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right font-medium">
                      {r.total_units}
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right text-ui-fg-muted">
                      {r.avg_per_week}
                    </td>
                    <td className="px-2 py-1 tabular-nums text-right text-ui-fg-muted">
                      {r.in_stock}
                    </td>
                    <td className="px-2 py-1">
                      <span
                        className="px-1.5 py-0.5 rounded text-white text-[10px]"
                        style={{ background: MOMENTUM_COLORS[r.momentum] }}
                      >
                        {MOMENTUM_LABEL[r.momentum]}{" "}
                        {r.momentum_ratio < 99
                          ? `${r.momentum_ratio.toFixed(2)}×`
                          : "new"}
                      </span>
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
