import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  inRange,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/payment-mix
 *
 * Stripe vs PayPal vs other: share of orders + revenue, with effective
 * gateway fee % when fee data is present in payment_collection metadata.
 *
 * Effective fee detection:
 *   - Reads `order.payment_collection.payments[].provider_id` for the
 *     gateway split.
 *   - For Stripe-tagged payments, looks for `metadata.stripe_fee` or
 *     `metadata.application_fee_amount` (in major units). If those
 *     aren't present, headlinerate is reported via STRIPE_HEADLINE_FEE_PCT
 *     so the operator at least sees a baseline rather than blank.
 *
 * The headline rate is configurable via env in case the merchant has a
 * negotiated rate. Default is Stripe AU's standard 1.7% + 30c domestic.
 */
const STRIPE_HEADLINE_FEE_PCT = (() => {
  const raw = process.env.STRIPE_HEADLINE_FEE_PCT
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 1.7
})()
const STRIPE_HEADLINE_FEE_FIXED = (() => {
  const raw = process.env.STRIPE_HEADLINE_FEE_FIXED
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? n : 0.3
})()
const PAYPAL_HEADLINE_FEE_PCT = (() => {
  const raw = process.env.PAYPAL_HEADLINE_FEE_PCT
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 2.6
})()

const detectGateway = (providerId: string | null | undefined): string => {
  if (!providerId) return "(unknown)"
  const p = providerId.toLowerCase()
  if (p.includes("stripe")) return "stripe"
  if (p.includes("paypal")) return "paypal"
  if (p.includes("manual")) return "manual"
  return p
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)
  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  let orders: any[] = []
  try {
    const { data } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "created_at",
        "status",
        "total",
        "currency_code",
        "region_id",
        "payment_collections.payments.id",
        "payment_collections.payments.amount",
        "payment_collections.payments.provider_id",
        "payment_collections.payments.data",
      ],
      pagination: { take: 5000, skip: 0 },
    })
    orders = (data as any[]) ?? []
  } catch (err: any) {
    logger.warn?.(`[payment-mix] order graph failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  type GatewayStat = {
    gateway: string
    orders: number
    revenue: number
    fees_observed: number
    fees_estimated: number
    /** number of payments with explicit fee data (vs estimated) */
    payments_with_fee_data: number
    payments_total: number
  }
  const byGateway = new Map<string, GatewayStat>()
  let grandTotalRevenue = 0
  let grandTotalOrders = 0

  const extractFee = (
    payment: any,
    gateway: string
  ): { value: number; from_data: boolean } => {
    // Stripe fee can land in a few places depending on which Medusa
    // version + Stripe webhook handler is in play. Try the common ones.
    const data = payment?.data ?? {}
    const fields = [
      "stripe_fee",
      "application_fee_amount",
      "application_fee",
      "balance_transaction.fee",
    ]
    for (const k of fields) {
      const v = (data as any)[k]
      if (typeof v === "number" && Number.isFinite(v) && v >= 0) {
        // Stripe usually returns fees in minor units (cents).
        // Heuristic: if it's > 0 and the order amount is small, divide
        // by 100 to get major units. For very small payments this might
        // misjudge — surface both values for the reader.
        return { value: v >= 1 ? v / 100 : v, from_data: true }
      }
    }
    // No explicit fee — estimate from headline rate.
    const amount = Number(payment?.amount ?? 0)
    if (gateway === "stripe") {
      return {
        value:
          (amount * STRIPE_HEADLINE_FEE_PCT) / 100 + STRIPE_HEADLINE_FEE_FIXED,
        from_data: false,
      }
    }
    if (gateway === "paypal") {
      return {
        value: (amount * PAYPAL_HEADLINE_FEE_PCT) / 100,
        from_data: false,
      }
    }
    return { value: 0, from_data: false }
  }

  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    if (o?.status === "canceled") continue
    if (!inRange(o?.created_at, from, to)) continue
    grandTotalOrders += 1
    grandTotalRevenue += Number(o.total ?? 0)

    const collections = (o?.payment_collections ?? []) as any[]
    if (collections.length === 0) {
      const stat = byGateway.get("(no payment)") ?? {
        gateway: "(no payment)",
        orders: 0,
        revenue: 0,
        fees_observed: 0,
        fees_estimated: 0,
        payments_with_fee_data: 0,
        payments_total: 0,
      }
      stat.orders += 1
      stat.revenue += Number(o.total ?? 0)
      byGateway.set("(no payment)", stat)
      continue
    }

    const seenGateways = new Set<string>()
    for (const c of collections) {
      for (const p of (c?.payments ?? []) as any[]) {
        const gateway = detectGateway(p?.provider_id)
        if (!seenGateways.has(gateway)) {
          seenGateways.add(gateway)
        }
        const stat = byGateway.get(gateway) ?? {
          gateway,
          orders: 0,
          revenue: 0,
          fees_observed: 0,
          fees_estimated: 0,
          payments_with_fee_data: 0,
          payments_total: 0,
        }
        stat.payments_total += 1
        const amount = Number(p?.amount ?? 0)
        const fee = extractFee(p, gateway)
        if (fee.from_data) {
          stat.fees_observed += fee.value
          stat.payments_with_fee_data += 1
        } else {
          stat.fees_estimated += fee.value
        }
        // Order-level revenue is bucketed once per order per gateway it
        // touched, with the payment amount used for the contribution.
        stat.revenue += amount
        byGateway.set(gateway, stat)
      }
    }
    for (const g of seenGateways) {
      const s = byGateway.get(g)!
      s.orders += 1
    }
  }

  const gateways = Array.from(byGateway.values()).map((s) => {
    const totalFees = s.fees_observed + s.fees_estimated
    const effectiveFeePct =
      s.revenue > 0 ? (totalFees / s.revenue) * 100 : 0
    return {
      gateway: s.gateway,
      orders: s.orders,
      revenue: Math.round(s.revenue * 100) / 100,
      fees_observed: Math.round(s.fees_observed * 100) / 100,
      fees_estimated: Math.round(s.fees_estimated * 100) / 100,
      effective_fee_pct: Math.round(effectiveFeePct * 100) / 100,
      payments_with_fee_data: s.payments_with_fee_data,
      payments_total: s.payments_total,
      revenue_share_pct:
        grandTotalRevenue > 0
          ? Math.round((s.revenue / grandTotalRevenue) * 1000) / 10
          : 0,
    }
  })
  gateways.sort((a, b) => b.revenue - a.revenue)

  const totalFees = gateways.reduce(
    (s, g) => s + g.fees_observed + g.fees_estimated,
    0
  )
  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    summary: {
      total_orders: grandTotalOrders,
      total_revenue: Math.round(grandTotalRevenue * 100) / 100,
      total_fees: Math.round(totalFees * 100) / 100,
      effective_fee_pct:
        grandTotalRevenue > 0
          ? Math.round((totalFees / grandTotalRevenue) * 100) / 100
          : 0,
      net_revenue:
        Math.round((grandTotalRevenue - totalFees) * 100) / 100,
    },
    gateways,
    headline_rates: {
      stripe_pct: STRIPE_HEADLINE_FEE_PCT,
      stripe_fixed: STRIPE_HEADLINE_FEE_FIXED,
      paypal_pct: PAYPAL_HEADLINE_FEE_PCT,
    },
  })
}
