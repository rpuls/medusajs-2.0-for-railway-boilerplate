import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type BestRow = {
  design_id: string
  name: string
  thumbnail_url: string | null
  base_product_id: string | null
  purchases: number
  units: number
  revenue: number
  saved_at: string | null
}

type Response = {
  from: string
  to: string
  summary: {
    designs_saved: number
    designs_purchased: number
    conversion_rate: number
    purchased_revenue: number
  }
  best_converting: BestRow[]
  module_available: boolean
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

export const SavedDesignConversionChart = ({
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
    fetch(`/admin/reports/saved-design-conversion?${params.toString()}`, {
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

  const summary = data?.summary

  return (
    <ReportCard
      title="Saved-design conversion"
      caption="What share of designs saved to 'My Designs' end up purchased? Top-converting designs are starter-template candidates — feature them on the customizer landing for new visitors and lift conversion."
      help={{
        title: "Saved-design conversion",
        body: "Looks at every design saved to a customer's 'My Designs' library and tracks whether that design ended up in a purchased order. Surfaces the designs that are pulling weight — and the ones gathering dust.",
        bullets: [
          "Top-converting designs are starter-template candidates — feature them on the customizer landing for new visitors and lift conversion across the funnel.",
          "Compare against the saved-designs reuse rate report: high saves + low conversion suggests customers save speculatively but lose interest. Time the reorder-reminder email earlier.",
          "Designs older than ~90 days that have never converted are usually dead intent — fine to deprioritise from any 'inspiration' galleries you build.",
        ],
      }}
      loading={loading}
      error={error}
      csv={
        !data || data.best_converting.length === 0
          ? undefined
          : {
              filenameBase: "best-converting-designs",
              build: () =>
                buildCsv(
                  ["Design", "Purchases", "Units", "Revenue", "Saved", "Design ID"],
                  data.best_converting.map((r) => [
                    r.name,
                    r.purchases,
                    r.units,
                    r.revenue,
                    r.saved_at ?? "",
                    r.design_id,
                  ])
                ),
            }
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Designs saved
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {summary?.designs_saved ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Designs purchased
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {summary?.designs_purchased ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Conversion rate
          </Text>
          <Text
            className="text-2xl font-semibold tabular-nums"
            style={{
              color:
                (summary?.conversion_rate ?? 0) > 30
                  ? PALETTE.emerald600
                  : (summary?.conversion_rate ?? 0) > 10
                    ? undefined
                    : PALETTE.amber600,
            }}
          >
            {(summary?.conversion_rate ?? 0).toFixed(1)}%
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Revenue from saved designs
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {formatCurrency(summary?.purchased_revenue ?? 0)}
          </Text>
        </div>
      </div>

      <Text size="small" className="font-medium block mt-4 mb-2">
        Best-converting designs (all time)
      </Text>

      {data && data.best_converting.length === 0 ? (
        <Text size="xsmall" className="text-ui-fg-muted">
          No saved designs have been purchased yet — once customers start
          buying through the saved-design flow this list shows your
          template candidates.
        </Text>
      ) : (
        <div className="overflow-auto max-h-[420px]">
          <table className="w-full text-sm">
            <thead className="text-left text-ui-fg-subtle text-xs">
              <tr className="border-b border-ui-border-base">
                <th className="px-2 py-1 font-medium">Thumb</th>
                <th className="px-2 py-1 font-medium">Design</th>
                <th className="px-2 py-1 font-medium text-right">Purchases</th>
                <th className="px-2 py-1 font-medium text-right">Units</th>
                <th className="px-2 py-1 font-medium text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data?.best_converting.map((r) => (
                <tr key={r.design_id} className="border-b border-ui-border-base">
                  <td className="px-2 py-1">
                    {r.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.thumbnail_url}
                        alt=""
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: "cover",
                          borderRadius: 4,
                          background: PALETTE.stone100,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 4,
                          background: PALETTE.stone200,
                        }}
                      />
                    )}
                  </td>
                  <td className="px-2 py-1">
                    <Text size="small" className="font-medium truncate">
                      {r.name}
                    </Text>
                    <Text
                      size="xsmall"
                      className="text-ui-fg-muted font-mono text-[10px]"
                    >
                      {r.design_id}
                    </Text>
                  </td>
                  <td className="px-2 py-1 tabular-nums text-right font-medium">
                    {r.purchases}
                  </td>
                  <td className="px-2 py-1 tabular-nums text-right text-ui-fg-muted">
                    {r.units}
                  </td>
                  <td className="px-2 py-1 tabular-nums text-right">
                    {formatCurrency(r.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ReportCard>
  )
}
