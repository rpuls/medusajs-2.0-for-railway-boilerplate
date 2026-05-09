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
  side_steps: {
    modal_dismissed: number
    modal_reupload: number
  }
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

export const VectorizationFunnelChart = ({
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
    fetch(`/admin/reports/vectorization-funnel?${params.toString()}`, {
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
  const purchasedStep = funnel.find((f) => f.step === "purchased")

  return (
    <ReportCard
      title="Vectorization upsell funnel"
      caption="Low-DPI modal → Accept → Purchase. Drop-off between Shown and Accepted is a price/copy signal; drop-off between Accepted and Purchased is a checkout-friction signal. GA4 events take 24-48h to first appear after deploy."
      help={{
        title: "Vectorization upsell funnel",
        body: "When a customer uploads low-DPI artwork the customizer shows a modal offering paid vectorisation. This funnel tracks Shown → Accepted → Purchased so you can tell whether the modal is converting.",
        bullets: [
          "Big drop Shown → Accepted = price or copy problem. Try a different price point or rewrite the modal headline to focus on quality risk, not the upsell.",
          "Big drop Accepted → Purchased = checkout-friction. Customer agreed in the modal but bailed at checkout — usually because the line item wasn't where they expected it.",
          "Bridge for both: cleaner copy on what 'low DPI' actually means in practice often lifts both stages.",
          "Empty for ~48h after a fresh deploy while the GA4 events accumulate.",
        ],
      }}
      loading={loading}
      error={error}
      csv={
        funnel.length === 0
          ? undefined
          : {
              filenameBase: "vectorization-funnel",
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
            GA4 isn't configured — funnel steps 1-2 (modal shown / accepted)
            read 0. The "purchased" step still works because it reads from
            order data.
          </Text>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Vectorization purchases
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {data?.purchased_orders ?? 0}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Vectorization revenue
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {formatCurrency(data?.purchased_revenue ?? 0)}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Modal → purchase
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {purchasedStep?.conversion_from_top === null ||
            purchasedStep?.conversion_from_top === undefined
              ? "—"
              : `${purchasedStep.conversion_from_top.toFixed(1)}%`}
          </Text>
        </div>
      </div>

      {/* Funnel bars (horizontal stacked, expand to top width) */}
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
            Side actions: {data.side_steps.modal_reupload.toLocaleString("en-AU")}{" "}
            re-uploaded a higher quality file ·{" "}
            {data.side_steps.modal_dismissed.toLocaleString("en-AU")} dismissed
            without action.
          </Text>
        </div>
      ) : null}
    </ReportCard>
  )
}
