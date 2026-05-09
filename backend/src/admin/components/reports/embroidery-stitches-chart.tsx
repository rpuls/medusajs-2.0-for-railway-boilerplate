import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { EmptyState } from "./empty-state"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type Tier = {
  label: string
  lines: number
  units: number
  stitches: number
  revenue: number
  revenue_per_1k_stitches: number
  lines_share_pct: number
  revenue_share_pct: number
}

type Response = {
  from: string
  to: string
  summary: {
    total_lines: number
    total_units: number
    total_stitches: number
    total_revenue: number
    avg_stitches_per_unit: number
    median_stitches: number
    revenue_per_1k_stitches: number
  }
  tiers: Tier[]
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

export const EmbroideryStitchesChart = ({
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
    fetch(`/admin/reports/embroidery-stitches?${params.toString()}`, {
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

  const summary = data?.summary
  const tiers = data?.tiers ?? []
  const maxRev = tiers.reduce((m, t) => Math.max(m, t.revenue), 0)

  return (
    <ReportCard
      title="Embroidery stitch-count distribution"
      caption="How embroidery revenue splits across stitch tiers. Pricing decisions trace back to where customer demand actually lives."
      help={{
        title: "Embroidery stitch-count distribution",
        body: "How your embroidery revenue splits across stitch-count tiers. Tells you whether your customers are buying simple logos, dense-fill artwork, or a mix — and which tier earns the best dollars per stitch.",
        bullets: [
          "Revenue per 1k stitches is the variable-cost benchmark. Higher tiers usually return more dollars per 1k stitches = higher margin.",
          "If most demand sits in the cheapest tier, your pricing copy may be discouraging upsell to denser designs. Consider repositioning the price ladder.",
          "Stitch counts read from line.metadata.decorationDesign.stitchCount, set by the embroidery pricing path on add-to-cart.",
        ],
      }}
      loading={loading}
      error={error}
      loadedAt={loadedAt}
      csv={
        tiers.length === 0
          ? undefined
          : {
              filenameBase: "embroidery-stitches",
              build: () =>
                buildCsv(
                  ["Tier", "Lines", "Units", "Stitches", "Revenue", "$/1k stitches", "Lines share %", "Revenue share %"],
                  tiers.map((t) => [
                    t.label,
                    t.lines,
                    t.units,
                    t.stitches,
                    t.revenue,
                    t.revenue_per_1k_stitches,
                    t.lines_share_pct,
                    t.revenue_share_pct,
                  ])
                ),
            }
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Embroidery lines
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {summary?.total_lines ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Median stitch count
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {(summary?.median_stitches ?? 0).toLocaleString("en-AU")}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            $/1k stitches (overall)
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {formatCurrency(summary?.revenue_per_1k_stitches ?? 0)}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Embroidery revenue
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {formatCurrency(summary?.total_revenue ?? 0)}
          </Text>
        </div>
      </div>

      {tiers.every((t) => t.lines === 0) ? (
        <EmptyState
          title="No embroidery lines in window"
          body="Either no embroidery orders fell in window or stitch counts aren't being persisted on cart-add. Check storefront/src/modules/decoration/lib/methods/embroidery.ts."
        />
      ) : (
        <div className="mt-3 flex flex-col gap-y-1.5">
          {tiers.map((t) => {
            const widthPct =
              maxRev > 0
                ? Math.max(2, Math.round((t.revenue / maxRev) * 100))
                : 0
            return (
              <div key={t.label} className="flex items-center gap-x-3">
                <Text size="small" className="w-24 font-medium">
                  {t.label}
                </Text>
                <div className="flex-1 min-w-0">
                  <div className="h-3 rounded bg-ui-bg-subtle overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${widthPct}%`,
                        background: PALETTE.amber600,
                      }}
                    />
                  </div>
                </div>
                <Text size="small" className="tabular-nums w-24 text-right font-medium">
                  {formatCurrency(t.revenue)}
                </Text>
                <Text size="xsmall" className="tabular-nums w-20 text-right text-ui-fg-muted">
                  {t.lines} lines
                </Text>
                <Text size="xsmall" className="tabular-nums w-20 text-right text-ui-fg-muted">
                  {formatCurrency(t.revenue_per_1k_stitches)}/1k
                </Text>
              </div>
            )
          })}
        </div>
      )}
    </ReportCard>
  )
}
