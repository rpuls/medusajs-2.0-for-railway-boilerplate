import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type FunnelStep = {
  step: string
  label: string
  count: number
  conversion_from_top: number | null
  conversion_from_prev: number | null
}

type Response = {
  from: string
  to: string
  ga4_configured: boolean
  funnel: FunnelStep[]
  side_steps: { design_saved: number }
  purchased_revenue: number
  purchased_orders: number
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

export const CustomizerFunnelChart = ({
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
    fetch(`/admin/reports/customizer-funnel?${params.toString()}`, {
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

  const funnel = data?.funnel ?? []
  const top = funnel[0]?.count ?? 0
  const purchasedStep = funnel.find((f) => f.step === "design_purchased")

  return (
    <ReportCard
      title="Customizer abandonment funnel"
      caption="Design started → Added to cart → Purchased. Drop-off between Started and Cart is your biggest hidden conversion problem; drop-off between Cart and Purchased is checkout friction. Save-to-Designs is shown as a side action since it's a different intent path (saved-then-purchased is a different report)."
      loading={loading}
      error={error}
      csv={
        funnel.length === 0
          ? undefined
          : {
              filenameBase: "customizer-funnel",
              build: () =>
                buildCsv(
                  ["Step", "Count", "% of top", "% of prev"],
                  funnel.map((f) => [
                    f.label,
                    f.count,
                    f.conversion_from_top === null
                      ? ""
                      : f.conversion_from_top.toFixed(1) + "%",
                    f.conversion_from_prev === null
                      ? ""
                      : f.conversion_from_prev.toFixed(1) + "%",
                  ])
                ),
            }
      }
    >
      {data && !data.ga4_configured ? (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 mb-2">
          <Text size="xsmall" className="text-amber-900">
            GA4 isn't configured — funnel steps 1-2 read 0. The "purchased"
            step still works because it reads order metadata.
          </Text>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Customizer purchases
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {data?.purchased_orders ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Customizer revenue
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {formatCurrency(data?.purchased_revenue ?? 0)}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Started → purchase
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {purchasedStep?.conversion_from_top === null ||
            purchasedStep?.conversion_from_top === undefined
              ? "—"
              : `${purchasedStep.conversion_from_top.toFixed(1)}%`}
          </Text>
        </div>
      </div>

      <div className="flex flex-col gap-y-2 mt-4">
        {funnel.map((step) => {
          const widthPct =
            top > 0 ? Math.max(2, Math.round((step.count / top) * 100)) : 0
          return (
            <div key={step.step} className="flex items-center gap-x-3">
              <div className="w-44 shrink-0">
                <Text size="small" className="font-medium truncate">
                  {step.label}
                </Text>
                <Text
                  size="xsmall"
                  className="text-ui-fg-muted tabular-nums"
                >
                  {step.count.toLocaleString("en-AU")}
                  {step.conversion_from_prev !== null
                    ? ` · ${step.conversion_from_prev.toFixed(1)}% of prev`
                    : ""}
                </Text>
              </div>
              <div className="flex-1 min-w-0">
                <div className="h-6 rounded bg-ui-bg-subtle overflow-hidden">
                  <div
                    className="h-full"
                    style={{ width: `${widthPct}%`, background: PALETTE.teal700 }}
                  />
                </div>
              </div>
              <Text
                size="small"
                className="tabular-nums w-16 text-right text-ui-fg-muted"
              >
                {step.conversion_from_top === null
                  ? "—"
                  : `${step.conversion_from_top.toFixed(1)}%`}
              </Text>
            </div>
          )
        })}
      </div>

      {data ? (
        <div className="mt-3 px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Side action:{" "}
            {data.side_steps.design_saved.toLocaleString("en-AU")} design
            {data.side_steps.design_saved === 1 ? " was" : "s were"} saved to
            "My Designs" without immediate cart-add — these come back later via
            the saved-design conversion path.
          </Text>
        </div>
      ) : null}
    </ReportCard>
  )
}
