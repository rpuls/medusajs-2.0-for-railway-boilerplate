import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type Supplier = {
  key: "ascolour" | "other"
  label: string
  orders: number
  revenue: number
  units: number
  order_share: number
  revenue_share: number
  unit_share: number
}

type Response = {
  from: string
  to: string
  currency: string
  suppliers: Supplier[]
  totals: { orders: number; revenue: number; units: number }
}

const SUPPLIER_COLORS: Record<string, string> = {
  ascolour: PALETTE.teal700,
  other: PALETTE.slate500,
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

const StackedBar = ({
  suppliers,
  field,
  totalLabel,
  total,
}: {
  suppliers: Supplier[]
  field: "order_share" | "revenue_share" | "unit_share"
  totalLabel: string
  total: string
}) => {
  return (
    <div className="flex flex-col gap-y-1">
      <div className="flex items-baseline justify-between">
        <Text size="xsmall" className="text-ui-fg-subtle">
          {totalLabel}
        </Text>
        <Text size="small" className="font-semibold tabular-nums">
          {total}
        </Text>
      </div>
      <div className="h-6 w-full rounded overflow-hidden flex border border-ui-border-base">
        {suppliers.every((s) => s[field] === 0) ? (
          <div className="flex-1 bg-ui-bg-subtle flex items-center justify-center">
            <Text size="xsmall" className="text-ui-fg-muted">
              No data
            </Text>
          </div>
        ) : (
          suppliers.map((s) => (
            <div
              key={s.key}
              title={`${s.label}: ${(s[field] * 100).toFixed(1)}%`}
              style={{
                background: SUPPLIER_COLORS[s.key],
                width: `${s[field] * 100}%`,
                minWidth: s[field] > 0 ? "2px" : "0",
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}

export const SupplierMixChart = ({
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
    fetch(`/admin/reports/supplier-mix?${params.toString()}`, {
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

  const suppliers = data?.suppliers ?? []
  const currency = data?.currency ?? "aud"

  return (
    <ReportCard
      title="Garment supplier mix"
      caption="AS Colour vs other suppliers — share by orders, revenue, and units. AS Colour-routed orders are flagged via metadata.ascolour_order_id."
      loading={loading}
      error={error}
      csv={
        suppliers.length === 0
          ? undefined
          : {
              filenameBase: "supplier-mix",
              build: () =>
                buildCsv(
                  [
                    "Supplier",
                    "Orders",
                    "Revenue",
                    "Units",
                    "Order share %",
                    "Revenue share %",
                    "Unit share %",
                  ],
                  suppliers.map((s) => [
                    s.label,
                    s.orders,
                    s.revenue,
                    s.units,
                    (s.order_share * 100).toFixed(1),
                    (s.revenue_share * 100).toFixed(1),
                    (s.unit_share * 100).toFixed(1),
                  ])
                ),
            }
      }
    >
      <div className="flex flex-col gap-y-3">
        <StackedBar
          suppliers={suppliers}
          field="revenue_share"
          totalLabel="Revenue"
          total={formatCurrency(data?.totals.revenue ?? 0, currency)}
        />
        <StackedBar
          suppliers={suppliers}
          field="order_share"
          totalLabel="Orders"
          total={String(data?.totals.orders ?? 0)}
        />
        <StackedBar
          suppliers={suppliers}
          field="unit_share"
          totalLabel="Units"
          total={(data?.totals.units ?? 0).toLocaleString("en-AU")}
        />
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
          {suppliers.map((s) => (
            <div key={s.key} className="flex items-center gap-x-1">
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm"
                style={{ background: SUPPLIER_COLORS[s.key] }}
              />
              <Text size="xsmall" className="text-ui-fg-subtle">
                {s.label}{" "}
                <span className="text-ui-fg-base font-medium tabular-nums">
                  {(s.revenue_share * 100).toFixed(1)}% rev
                </span>
              </Text>
            </div>
          ))}
        </div>
      </div>
    </ReportCard>
  )
}
