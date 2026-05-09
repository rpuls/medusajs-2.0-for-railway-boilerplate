import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { buildCsv } from "../../lib/reports/csv"

type VariantRow = {
  variant_id: string
  product_title: string
  variant_title: string
  sku: string | null
  return_count: number
  units_sold: number
  return_rate: number
}
type ReasonRow = {
  reason: string
  count: number
}

type Response = {
  from: string
  to: string
  by_variant: VariantRow[]
  by_reason: ReasonRow[]
  summary: {
    total_returns: number
    return_rate: number
  }
  status: "ok" | "no_data"
  reason?: string
}

const REASON_COPY: Record<string, { title: string; body: string }> = {
  rma_not_enabled: {
    title: "RMA workflow not yet active",
    body: "Medusa's returns module isn't running and the storefront has no return-request UI. Once you enable returns and ship a customer return flow under /account/orders/details, this report will surface return rate per variant + reason-code breakdown.",
  },
}

export const ReturnsChart = ({
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
    fetch(`/admin/reports/returns?${params.toString()}`, {
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

  const isEmpty =
    !data || data.status === "no_data" || data.by_variant.length === 0

  return (
    <ReportCard
      title="Returns by variant + reason"
      caption="Variant-level return rates surface sizing-chart bugs (e.g. one size returning 5× more than others) and supplier defects. Reason-code histogram tells you whether to fix sizing, packaging, or fulfillment."
      loading={loading}
      error={error}
      csv={
        isEmpty
          ? undefined
          : {
              filenameBase: "returns",
              build: () =>
                buildCsv(
                  ["Variant", "SKU", "Returns", "Units sold", "Return rate"],
                  data!.by_variant.map((v) => [
                    `${v.product_title} — ${v.variant_title}`,
                    v.sku ?? "",
                    v.return_count,
                    v.units_sold,
                    (v.return_rate * 100).toFixed(2) + "%",
                  ])
                ),
            }
      }
    >
      {isEmpty ? (
        <div className="rounded-md bg-ui-bg-subtle/40 px-4 py-3">
          <Text size="small" className="font-medium block mb-1">
            {REASON_COPY[data?.reason ?? "rma_not_enabled"]?.title ??
              "No returns yet"}
          </Text>
          <Text size="xsmall" className="text-ui-fg-subtle">
            {REASON_COPY[data?.reason ?? "rma_not_enabled"]?.body}
          </Text>
        </div>
      ) : (
        <div className="overflow-auto max-h-[360px]">
          <table className="w-full text-sm">
            <thead className="text-left text-ui-fg-subtle text-xs">
              <tr className="border-b border-ui-border-base">
                <th className="px-2 py-1 font-medium">Variant</th>
                <th className="px-2 py-1 font-medium text-right">Returns</th>
                <th className="px-2 py-1 font-medium text-right">Sold</th>
                <th className="px-2 py-1 font-medium text-right">Return %</th>
              </tr>
            </thead>
            <tbody>
              {data!.by_variant.map((v) => (
                <tr
                  key={v.variant_id}
                  className="border-b border-ui-border-base"
                >
                  <td className="px-2 py-1 truncate">
                    {v.product_title} —{" "}
                    <span className="text-ui-fg-muted">{v.variant_title}</span>
                  </td>
                  <td className="px-2 py-1 tabular-nums text-right">
                    {v.return_count}
                  </td>
                  <td className="px-2 py-1 tabular-nums text-right text-ui-fg-muted">
                    {v.units_sold}
                  </td>
                  <td className="px-2 py-1 tabular-nums text-right font-medium">
                    {(v.return_rate * 100).toFixed(1)}%
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
