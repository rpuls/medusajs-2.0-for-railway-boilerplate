import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type PromotionRow = {
  code: string
  uses: number
  gross_revenue: number
  discount_amount: number
  cogs: number
  net_margin: number
}

type Response = {
  from: string
  to: string
  promotions: PromotionRow[]
  status: "ok" | "no_data"
  reason?: string
}

const REASON_COPY: Record<string, { title: string; body: string }> = {
  promotions_not_enabled: {
    title: "Promotions not yet active",
    body: "No orders in the selected window carry a promotion or discount code. Once you wire `@medusajs/promotion` in `backend/medusa-config.js` and customers redeem codes, this report auto-populates with usage + margin per code.",
  },
  cogs_not_standardized: {
    title: "Margin data not available yet",
    body: "Orders with promotions exist, but variant cost-of-goods isn't standardized in this codebase yet. Add a `cost_minor` field on every product variant (or expose the existing `dnc_cost_price_ex_gst_minor` metadata uniformly) and this report will calculate net margin per code.",
  },
  order_fetch_failed: {
    title: "Couldn't load orders",
    body: "The order fetch failed. Check backend logs for [discount-profitability]; if it's a Mikro-ORM error after a Medusa upgrade, the field shape may have shifted.",
  },
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

export const DiscountProfitabilityChart = ({
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
    fetch(`/admin/reports/discount-profitability?${params.toString()}`, {
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
    !data || data.status === "no_data" || data.promotions.length === 0

  return (
    <ReportCard
      title="Discount profitability"
      caption="Net margin per promotion code, after subtracting discount and cost-of-goods. Orange margins are unprofitable codes — kill or restrict to specific products."
      loading={loading}
      error={error}
      csv={
        isEmpty
          ? undefined
          : {
              filenameBase: "discount-profitability",
              build: () =>
                buildCsv(
                  ["Code", "Uses", "Revenue", "Discount", "COGS", "Net margin"],
                  data!.promotions.map((p) => [
                    p.code,
                    p.uses,
                    p.gross_revenue,
                    p.discount_amount,
                    p.cogs,
                    p.net_margin,
                  ])
                ),
            }
      }
    >
      {isEmpty ? (
        <div className="rounded-md bg-ui-bg-subtle/40 px-4 py-3">
          <Text size="small" className="font-medium block mb-1">
            {REASON_COPY[data?.reason ?? "promotions_not_enabled"]?.title ??
              "No data yet"}
          </Text>
          <Text size="xsmall" className="text-ui-fg-subtle">
            {REASON_COPY[data?.reason ?? "promotions_not_enabled"]?.body}
          </Text>
        </div>
      ) : (
        <div className="overflow-auto max-h-[360px]">
          <table className="w-full text-sm">
            <thead className="text-left text-ui-fg-subtle text-xs">
              <tr className="border-b border-ui-border-base">
                <th className="px-2 py-1 font-medium">Code</th>
                <th className="px-2 py-1 font-medium text-right">Uses</th>
                <th className="px-2 py-1 font-medium text-right">Revenue</th>
                <th className="px-2 py-1 font-medium text-right">Discount</th>
                <th className="px-2 py-1 font-medium text-right">COGS</th>
                <th className="px-2 py-1 font-medium text-right">Net margin</th>
              </tr>
            </thead>
            <tbody>
              {data!.promotions.map((p) => (
                <tr key={p.code} className="border-b border-ui-border-base">
                  <td className="px-2 py-1 font-mono text-xs font-medium">
                    {p.code}
                  </td>
                  <td className="px-2 py-1 tabular-nums text-right">
                    {p.uses}
                  </td>
                  <td className="px-2 py-1 tabular-nums text-right">
                    {formatCurrency(p.gross_revenue)}
                  </td>
                  <td className="px-2 py-1 tabular-nums text-right text-ui-fg-muted">
                    −{formatCurrency(p.discount_amount)}
                  </td>
                  <td className="px-2 py-1 tabular-nums text-right text-ui-fg-muted">
                    −{formatCurrency(p.cogs)}
                  </td>
                  <td
                    className="px-2 py-1 tabular-nums text-right font-medium"
                    style={{
                      color:
                        p.net_margin < 0 ? PALETTE.rose600 : PALETTE.emerald600,
                    }}
                  >
                    {formatCurrency(p.net_margin)}
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
