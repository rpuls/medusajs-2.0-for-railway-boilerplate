import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { EmptyState } from "./empty-state"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type Row = {
  product_id: string | null
  product_title: string
  new_customers: number
  units: number
  revenue: number
  share_pct: number
}

type Response = {
  from: string
  to: string
  summary: {
    new_customers_in_window: number
    distinct_front_door_products: number
  }
  front_door_products: Row[]
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

export const FirstOrderAffinityChart = ({
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
    fetch(`/admin/reports/first-order-affinity?${params.toString()}`, {
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

  const rows = data?.front_door_products ?? []
  const max = rows.reduce((m, r) => Math.max(m, r.new_customers), 0)

  return (
    <ReportCard
      title="First-order product affinity"
      caption="For customers whose only order to date fell in this window, which product they bought first. The top of this list is your 'front door' SKU — the one to feature for new visitors and cold ad traffic."
      help={{
        title: "First-order product affinity",
        body: "For customers whose only-ever order falls inside the window, which product they bought first. The top of this list is your 'front door' SKU — what to feature for cold ad traffic and new-visitor PDPs.",
        bullets: [
          "A customer counts as 'new' if their first-ever order falls in the window — repeat customers are excluded.",
          "We group by the highest-revenue line on that first order, so a $200 hoodie wins over a $5 sticker bundle they grabbed alongside.",
          "A short, concentrated list is healthy — too long and your homepage is confusing first-time visitors.",
        ],
      }}
      loading={loading}
      error={error}
      loadedAt={loadedAt}
      csv={
        rows.length === 0
          ? undefined
          : {
              filenameBase: "first-order-affinity",
              build: () =>
                buildCsv(
                  ["Product", "New customers", "Share %", "Units", "Revenue"],
                  rows.map((r) => [
                    r.product_title,
                    r.new_customers,
                    r.share_pct,
                    r.units,
                    r.revenue,
                  ])
                ),
            }
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            New customers in window
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {data?.summary.new_customers_in_window ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Distinct front-door products
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {data?.summary.distinct_front_door_products ?? 0}
          </Text>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No new customers in window"
          body="No first-order-only customers in the selected date range. Try widening the window or wait for traffic to convert."
        />
      ) : (
        <div className="flex flex-col gap-y-1.5 mt-3">
          {rows.map((r, i) => {
            const widthPct =
              max > 0 ? Math.max(4, Math.round((r.new_customers / max) * 100)) : 0
            const href = r.product_id ? `/app/products/${r.product_id}` : null
            const Inner = (
              <>
                <Text size="xsmall" className="w-6 text-ui-fg-muted tabular-nums">
                  {i + 1}.
                </Text>
                <div className="flex-1 min-w-0">
                  <Text size="small" className="truncate">
                    {r.product_title}
                  </Text>
                  <div className="h-2 mt-1 rounded bg-ui-bg-subtle overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${widthPct}%`,
                        background: PALETTE.teal700,
                      }}
                    />
                  </div>
                </div>
                <Text size="small" className="tabular-nums w-20 text-right font-medium">
                  {r.new_customers}
                </Text>
                <Text
                  size="xsmall"
                  className="tabular-nums w-12 text-right text-ui-fg-muted"
                >
                  {r.share_pct.toFixed(1)}%
                </Text>
                <Text
                  size="xsmall"
                  className="tabular-nums w-16 text-right text-ui-fg-muted"
                >
                  {formatCurrency(r.revenue)}
                </Text>
              </>
            )
            return href ? (
              <a
                key={r.product_id ?? r.product_title + i}
                href={href}
                className="flex items-center gap-x-3 px-2 py-1 rounded hover:bg-ui-bg-subtle"
              >
                {Inner}
              </a>
            ) : (
              <div
                key={r.product_title + i}
                className="flex items-center gap-x-3 px-2 py-1"
              >
                {Inner}
              </div>
            )
          })}
        </div>
      )}
    </ReportCard>
  )
}
