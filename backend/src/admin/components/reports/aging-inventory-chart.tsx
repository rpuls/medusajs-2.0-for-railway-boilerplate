import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type Bucket = {
  name: "fresh" | "slowing" | "aging" | "dead" | "never"
  variant_count: number
  total_stock_units: number
}

type AgingRow = {
  variant_id: string
  sku: string | null
  title: string
  product_title: string
  product_id: string | null
  in_stock: number
  last_sold_at: string | null
  days_since_sale: number | null
  bucket: Bucket["name"]
}

type Response = {
  data_available: boolean
  buckets: Bucket[]
  top_aging: AgingRow[]
  total_variants: number
  error?: string
}

const BUCKET_LABELS: Record<Bucket["name"], string> = {
  fresh: "Fresh (≤30d)",
  slowing: "Slowing (31-90d)",
  aging: "Aging (91-180d)",
  dead: "Dead (>180d)",
  never: "Never sold",
}

const BUCKET_COLORS: Record<Bucket["name"], string> = {
  fresh: PALETTE.emerald600,
  slowing: PALETTE.teal500,
  aging: PALETTE.amber600,
  dead: PALETTE.rose600,
  never: PALETTE.stone400,
}

export const AgingInventoryChart = ({
  fromIso: _fromIso,
  toIso: _toIso,
  regionId: _regionId,
}: {
  fromIso: string
  toIso: string
  regionId: string | null
}) => {
  // Aging inventory is point-in-time (current stock × full sales history),
  // not period-bound. The date-range / region filters are accepted to
  // match the shared component signature but aren't passed to the route.
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/admin/reports/aging-inventory`, { credentials: "include" })
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
  }, [])

  const buckets = data?.buckets ?? []
  const totalUnits = buckets.reduce((s, b) => s + b.total_stock_units, 0)
  const deadUnits =
    (buckets.find((b) => b.name === "dead")?.total_stock_units ?? 0) +
    (buckets.find((b) => b.name === "never")?.total_stock_units ?? 0)
  const deadPct = totalUnits > 0 ? (deadUnits / totalUnits) * 100 : 0

  if (data && !data.data_available) {
    return (
      <ReportCard title="Aging inventory">
        <Text size="small" className="text-ui-fg-subtle">
          Inventory data isn't available right now — the variant↔inventory
          link query failed. {data.error ? `(${data.error})` : null}
        </Text>
      </ReportCard>
    )
  }

  return (
    <ReportCard
      title="Aging inventory"
      caption="Stocked variants bucketed by days since last sale. Dead + Never-sold (red + grey) is working capital you should clear via flash sale, bundle, or markdown."
      help={{
        title: "Aging inventory",
        body: "Every variant currently in stock, grouped by how long it's been since the last unit sold. The red and grey buckets — dead stock and never-sold — are working capital sitting idle.",
        bullets: [
          "Dead (>180 days since last sale) = clear via flash sale, free with another order, or charity donate (depending on cost basis).",
          "Never sold = the SKU has stock but has never moved. Either marketing visibility, pricing, or product-fit is the issue. Pull and review.",
          "Tail (90–180 days) = warning zone. Push it through a bundle or campaign before it tips into dead.",
          "Stock levels read from the inventory↔variant link; if a variant is missing, sync the link table.",
        ],
      }}
      loading={loading}
      error={error}
      csv={
        !data || data.top_aging.length === 0
          ? undefined
          : {
              filenameBase: "aging-inventory",
              build: () =>
                buildCsv(
                  [
                    "Bucket",
                    "Product",
                    "Variant",
                    "SKU",
                    "In stock",
                    "Days since sale",
                    "Last sold",
                  ],
                  data.top_aging.map((r) => [
                    BUCKET_LABELS[r.bucket],
                    r.product_title,
                    r.title,
                    r.sku ?? "",
                    r.in_stock,
                    r.days_since_sale ?? "",
                    r.last_sold_at ?? "",
                  ])
                ),
            }
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Variants in stock
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {data?.total_variants ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Total units
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {totalUnits.toLocaleString("en-AU")}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Dead / never-sold
          </Text>
          <Text
            className="text-2xl font-semibold tabular-nums"
            style={{ color: deadPct > 25 ? PALETTE.rose600 : undefined }}
          >
            {deadUnits.toLocaleString("en-AU")}{" "}
            <span className="text-sm text-ui-fg-muted">
              ({deadPct.toFixed(0)}%)
            </span>
          </Text>
        </div>
      </div>

      {/* Stacked bucket distribution */}
      <div className="mt-3">
        <div className="h-4 w-full rounded overflow-hidden flex">
          {buckets.map((b) => {
            const widthPct =
              totalUnits > 0 ? (b.total_stock_units / totalUnits) * 100 : 0
            if (widthPct === 0) return null
            return (
              <div
                key={b.name}
                style={{
                  width: `${widthPct}%`,
                  background: BUCKET_COLORS[b.name],
                }}
                title={`${BUCKET_LABELS[b.name]} · ${b.total_stock_units.toLocaleString("en-AU")} units`}
              />
            )
          })}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {buckets.map((b) => (
            <div key={b.name} className="flex items-center gap-x-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ background: BUCKET_COLORS[b.name] }}
              />
              <Text size="xsmall" className="text-ui-fg-subtle">
                {BUCKET_LABELS[b.name]}
              </Text>
              <Text size="xsmall" className="tabular-nums font-medium">
                {b.variant_count}
              </Text>
            </div>
          ))}
        </div>
      </div>

      {data && data.top_aging.length > 0 ? (
        <div className="mt-4">
          <Text size="small" className="font-medium mb-1 block">
            Top aging stock to clear
          </Text>
          <div className="overflow-auto max-h-[320px]">
            <table className="w-full text-xs">
              <thead className="text-left text-ui-fg-subtle">
                <tr className="border-b border-ui-border-base">
                  <th className="px-2 py-1 font-medium">Product</th>
                  <th className="px-2 py-1 font-medium">Variant</th>
                  <th className="px-2 py-1 font-medium text-right">Stock</th>
                  <th className="px-2 py-1 font-medium text-right">Days</th>
                  <th className="px-2 py-1 font-medium">Bucket</th>
                </tr>
              </thead>
              <tbody>
                {data.top_aging.map((r) => {
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
                      <td className="px-2 py-1 truncate max-w-[280px]">
                        {r.product_title}
                      </td>
                      <td className="px-2 py-1 truncate max-w-[160px] text-ui-fg-muted">
                        {r.title}
                      </td>
                      <td className="px-2 py-1 tabular-nums text-right font-medium">
                        {r.in_stock}
                      </td>
                      <td className="px-2 py-1 tabular-nums text-right text-ui-fg-muted">
                        {r.days_since_sale ?? "—"}
                      </td>
                      <td className="px-2 py-1">
                        <span
                          className="px-1.5 py-0.5 rounded text-white text-[10px]"
                          style={{ background: BUCKET_COLORS[r.bucket] }}
                        >
                          {BUCKET_LABELS[r.bucket]}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </ReportCard>
  )
}
