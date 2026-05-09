import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import {
  DECORATION_METHOD_COLORS,
  DECORATION_METHOD_LABELS,
  type DecorationMethodKey,
} from "../../lib/reports/palette"

type Row = {
  method: DecorationMethodKey
  orders: number
  revenue: number
  aov: number
}

type Response = {
  from: string
  to: string
  currency: string
  rows: Row[]
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

export const AovByMethodChart = ({
  fromIso,
  toIso,
}: {
  fromIso: string
  toIso: string
}) => {
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ from: fromIso, to: toIso })
    fetch(`/admin/reports/aov-by-method?${params.toString()}`, {
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
  }, [fromIso, toIso])

  const rows = (data?.rows ?? []).filter((r) => r.orders > 0)
  const maxAov = rows.reduce((m, r) => Math.max(m, r.aov), 0)
  const currency = data?.currency ?? "aud"

  return (
    <ReportCard
      title="Average order value by decoration method"
      caption="Bucketed by the order's primary decoration method (the line item with the highest revenue). Methods with high AOV but low order count are your premium niche; high count low AOV is your bulk."
      loading={loading}
      error={error}
    >
      {rows.length === 0 ? (
        <Text size="xsmall" className="text-ui-fg-muted">
          No orders in period.
        </Text>
      ) : (
        <div className="flex flex-col gap-y-2">
          {rows
            .sort((a, b) => b.aov - a.aov)
            .map((r) => {
              const widthPct =
                maxAov > 0 ? Math.max(4, Math.round((r.aov / maxAov) * 100)) : 0
              return (
                <div key={r.method} className="flex items-center gap-x-3">
                  <Text size="small" className="w-32 truncate">
                    {DECORATION_METHOD_LABELS[r.method]}
                  </Text>
                  <div className="flex-1 min-w-0">
                    <div className="h-3 rounded bg-ui-bg-subtle overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${widthPct}%`,
                          background: DECORATION_METHOD_COLORS[r.method],
                        }}
                      />
                    </div>
                  </div>
                  <Text size="small" className="tabular-nums w-24 text-right font-medium">
                    {formatCurrency(r.aov, currency)}
                  </Text>
                  <Text
                    size="xsmall"
                    className="tabular-nums w-20 text-right text-ui-fg-muted"
                  >
                    {r.orders} {r.orders === 1 ? "order" : "orders"}
                  </Text>
                </div>
              )
            })}
        </div>
      )}
    </ReportCard>
  )
}
