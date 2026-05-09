import { Select, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type ProductRow = {
  title: string
  variant_id: string | null
  product_id: string | null
  units: number
  revenue: number
  orders: number
}

type Response = {
  from: string
  to: string
  currency: string
  by_units: ProductRow[]
  by_revenue: ProductRow[]
}

const formatCurrency = (n: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: currency.toUpperCase() || "AUD",
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `$${Math.round(n)}`
  }
}

export const TopProductsChart = ({
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
  const [sortBy, setSortBy] = useState<"units" | "revenue">("units")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ from: fromIso, to: toIso })
    if (regionId) params.set("region_id", regionId)
    fetch(`/admin/reports/top-products?${params.toString()}`, {
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

  const rows = sortBy === "units" ? data?.by_units ?? [] : data?.by_revenue ?? []
  const max = sortBy === "units" ? rows[0]?.units ?? 1 : rows[0]?.revenue ?? 1
  const currency = data?.currency ?? "aud"

  return (
    <ReportCard
      title="Top products"
      caption="Top 20 SKUs in period — toggle units vs revenue. A product that's high on revenue but low on units is your premium piece; the opposite is your bulk SKU."
      loading={loading}
      error={error}
      rightAccessory={
        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as "units" | "revenue")}
          size="small"
        >
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="units">By units</Select.Item>
            <Select.Item value="revenue">By revenue</Select.Item>
          </Select.Content>
        </Select>
      }
      csv={
        rows.length === 0
          ? undefined
          : {
              filenameBase: `top-products-by-${sortBy}`,
              build: () =>
                buildCsv(
                  ["Rank", "Title", "Variant ID", "Product ID", "Units", "Revenue", "Orders"],
                  rows.map((r, i) => [
                    i + 1,
                    r.title,
                    r.variant_id ?? "",
                    r.product_id ?? "",
                    r.units,
                    r.revenue,
                    r.orders,
                  ])
                ),
            }
      }
    >
      {rows.length === 0 ? (
        <Text size="xsmall" className="text-ui-fg-muted">
          No product sales in period.
        </Text>
      ) : (
        <div className="flex flex-col gap-y-1">
          {rows.map((r, i) => {
            const value = sortBy === "units" ? r.units : r.revenue
            const widthPct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 0
            const href = r.product_id ? `/app/products/${r.product_id}` : null
            const inner = (
              <>
                <Text size="xsmall" className="w-6 text-ui-fg-muted tabular-nums">
                  {i + 1}.
                </Text>
                <div className="flex-1 min-w-0">
                  <Text size="small" className="truncate">
                    {r.title}
                  </Text>
                  <div className="h-2 mt-1 rounded bg-ui-bg-subtle overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${widthPct}%`,
                        background:
                          sortBy === "units" ? PALETTE.slate700 : PALETTE.teal700,
                      }}
                    />
                  </div>
                </div>
                <Text size="small" className="tabular-nums w-24 text-right font-medium">
                  {sortBy === "units" ? r.units : formatCurrency(r.revenue, currency)}
                </Text>
                <Text
                  size="xsmall"
                  className="tabular-nums w-16 text-right text-ui-fg-muted"
                >
                  {r.orders}{" "}
                  {r.orders === 1 ? "order" : "orders"}
                </Text>
              </>
            )
            if (href) {
              return (
                <a
                  key={r.variant_id ?? r.title + i}
                  href={href}
                  className="flex items-center gap-x-3 px-2 py-1 rounded hover:bg-ui-bg-subtle"
                >
                  {inner}
                </a>
              )
            }
            return (
              <div
                key={r.variant_id ?? r.title + i}
                className="flex items-center gap-x-3 px-2 py-1"
              >
                {inner}
              </div>
            )
          })}
        </div>
      )}
    </ReportCard>
  )
}
