import { Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { ReportCard } from "./report-card"
import { EmptyState } from "./empty-state"
import { PALETTE } from "../../lib/reports/palette"
import { buildCsv } from "../../lib/reports/csv"

type GatewayRow = {
  gateway: string
  orders: number
  revenue: number
  fees_observed: number
  fees_estimated: number
  effective_fee_pct: number
  payments_with_fee_data: number
  payments_total: number
  revenue_share_pct: number
}

type Response = {
  from: string
  to: string
  summary: {
    total_orders: number
    total_revenue: number
    total_fees: number
    effective_fee_pct: number
    net_revenue: number
  }
  gateways: GatewayRow[]
  headline_rates: {
    stripe_pct: number
    stripe_fixed: number
    paypal_pct: number
  }
}

const GATEWAY_COLORS: Record<string, string> = {
  stripe: PALETTE.teal700,
  paypal: PALETTE.amber600,
  manual: PALETTE.stone400,
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

export const PaymentMixChart = ({
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
    fetch(`/admin/reports/payment-mix?${params.toString()}`, {
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
  const gateways = data?.gateways ?? []

  return (
    <ReportCard
      title="Payment mix + gateway fees"
      caption="Stripe vs PayPal vs other — share of orders, revenue, and effective fee %. Surfaces when international cards drag your effective Stripe rate above headline."
      help={{
        title: "Payment mix + gateway fees",
        body: "Share of orders and revenue split by payment gateway, with the effective fee percentage each gateway is actually costing you. Surfaces when international card mix drags your real Stripe rate above the headline rate.",
        bullets: [
          "Effective fee = (observed fees + estimated fees) ÷ revenue. Observed fees count is shown so you can tell which orders' fees are real vs estimated.",
          "Estimates use STRIPE_HEADLINE_FEE_PCT (default 1.7% + $0.30) and PAYPAL_HEADLINE_FEE_PCT (default 2.6%). Override via env vars to match your negotiated rates.",
          "If Stripe's effective rate sits >0.5% above headline, you're seeing a meaningful share of premium / international cards — worth pricing into freight or surcharging.",
        ],
      }}
      loading={loading}
      error={error}
      loadedAt={loadedAt}
      csv={
        gateways.length === 0
          ? undefined
          : {
              filenameBase: "payment-mix",
              build: () =>
                buildCsv(
                  [
                    "Gateway",
                    "Orders",
                    "Revenue",
                    "Revenue share %",
                    "Fees (observed)",
                    "Fees (estimated)",
                    "Effective fee %",
                    "Payments with fee data",
                    "Total payments",
                  ],
                  gateways.map((g) => [
                    g.gateway,
                    g.orders,
                    g.revenue,
                    g.revenue_share_pct,
                    g.fees_observed,
                    g.fees_estimated,
                    g.effective_fee_pct,
                    g.payments_with_fee_data,
                    g.payments_total,
                  ])
                ),
            }
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Gross revenue
          </Text>
          <Text className="text-2xl font-semibold tabular-nums">
            {formatCurrency(summary?.total_revenue ?? 0)}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Total fees
          </Text>
          <Text
            className="text-2xl font-semibold tabular-nums"
            style={{ color: PALETTE.rose600 }}
          >
            −{formatCurrency(summary?.total_fees ?? 0)}
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Effective fee %
          </Text>
          <Text
            className="text-2xl font-semibold tabular-nums"
            style={{
              color:
                (summary?.effective_fee_pct ?? 0) > 3
                  ? PALETTE.amber600
                  : undefined,
            }}
          >
            {(summary?.effective_fee_pct ?? 0).toFixed(2)}%
          </Text>
        </div>
        <div className="px-3 py-2 rounded-md bg-ui-bg-subtle/50">
          <Text size="xsmall" className="text-ui-fg-subtle">
            Net revenue
          </Text>
          <Text
            className="text-2xl font-semibold tabular-nums"
            style={{ color: PALETTE.emerald600 }}
          >
            {formatCurrency(summary?.net_revenue ?? 0)}
          </Text>
        </div>
      </div>

      {gateways.length === 0 ? (
        <EmptyState
          title="No payments in window"
          body="Either no orders shipped in window or your payment data isn't reaching the order graph."
        />
      ) : (
        <>
          {/* Stacked share bar */}
          <div className="h-3 mt-3 rounded overflow-hidden flex">
            {gateways.map((g) => {
              if (g.revenue_share_pct <= 0) return null
              return (
                <div
                  key={g.gateway}
                  style={{
                    width: `${g.revenue_share_pct}%`,
                    background:
                      GATEWAY_COLORS[g.gateway] ?? PALETTE.slate500,
                  }}
                  title={`${g.gateway} · ${g.revenue_share_pct.toFixed(1)}% · ${formatCurrency(g.revenue)}`}
                />
              )
            })}
          </div>
          <div className="overflow-auto mt-3">
            <table className="w-full text-xs">
              <thead className="text-left text-ui-fg-subtle">
                <tr className="border-b border-ui-border-base">
                  <th className="px-2 py-1 font-medium">Gateway</th>
                  <th className="px-2 py-1 font-medium text-right">Orders</th>
                  <th className="px-2 py-1 font-medium text-right">Revenue</th>
                  <th className="px-2 py-1 font-medium text-right">Share</th>
                  <th className="px-2 py-1 font-medium text-right">Effective fee %</th>
                  <th className="px-2 py-1 font-medium text-right">Fee $</th>
                  <th className="px-2 py-1 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {gateways.map((g) => {
                  const allObserved =
                    g.payments_total > 0 &&
                    g.payments_with_fee_data === g.payments_total
                  return (
                    <tr
                      key={g.gateway}
                      className="border-b border-ui-border-base"
                    >
                      <td className="px-2 py-1 font-medium">
                        <span
                          className="inline-block w-2 h-2 rounded-sm mr-1.5"
                          style={{
                            background:
                              GATEWAY_COLORS[g.gateway] ?? PALETTE.slate500,
                          }}
                        />
                        {g.gateway}
                      </td>
                      <td className="px-2 py-1 tabular-nums text-right">
                        {g.orders}
                      </td>
                      <td className="px-2 py-1 tabular-nums text-right">
                        {formatCurrency(g.revenue)}
                      </td>
                      <td className="px-2 py-1 tabular-nums text-right text-ui-fg-muted">
                        {g.revenue_share_pct.toFixed(1)}%
                      </td>
                      <td className="px-2 py-1 tabular-nums text-right font-medium">
                        {g.effective_fee_pct.toFixed(2)}%
                      </td>
                      <td className="px-2 py-1 tabular-nums text-right">
                        {formatCurrency(g.fees_observed + g.fees_estimated)}
                      </td>
                      <td className="px-2 py-1">
                        {allObserved ? (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded text-white"
                            style={{ background: PALETTE.emerald600 }}
                          >
                            observed
                          </span>
                        ) : g.payments_with_fee_data > 0 ? (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded text-white"
                            style={{ background: PALETTE.amber600 }}
                          >
                            partial
                          </span>
                        ) : (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded text-white"
                            style={{ background: PALETTE.stone400 }}
                          >
                            estimated
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Text size="xsmall" className="text-ui-fg-muted block mt-2">
            Headline rates: Stripe {data?.headline_rates.stripe_pct}% +{" "}
            ${data?.headline_rates.stripe_fixed} · PayPal{" "}
            {data?.headline_rates.paypal_pct}%. Override with{" "}
            STRIPE_HEADLINE_FEE_PCT, STRIPE_HEADLINE_FEE_FIXED,
            PAYPAL_HEADLINE_FEE_PCT env vars.
          </Text>
        </>
      )}
    </ReportCard>
  )
}
