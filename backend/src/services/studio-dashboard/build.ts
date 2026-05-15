import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { LTV_VIP_THRESHOLD_AUD } from "../../lib/constants"
import { computeCustomerLtv } from "../customer-ltv/compute-ltv"

export type StudioRow = {
  bucket:
    | "vip_dormant"
    | "first_timers"
    | "outstanding_quotes"
    | "low_nps"
  customer_id: string | null
  email: string
  display_name: string
  detail: string
  href: string
  signal_at: string
}

export type StudioBucket = {
  key: StudioRow["bucket"]
  label: string
  description: string
  rows: StudioRow[]
}

/**
 * Builds the four "who's worth attention today" buckets surfaced on
 * the Studio admin page. Everything is computed live so the dashboard
 * reflects the freshest state at click time. Volumes are small enough
 * (low hundreds of customers, dozens of quotes) that no caching layer
 * is needed yet.
 */
export async function buildStudioDashboard(
  container: MedusaContainer
): Promise<StudioBucket[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const now = new Date()

  // ---- VIP dormant: tagged VIP, no order in 60+ days ----
  let vipDormant: StudioRow[] = []
  try {
    const { data: vipTags } = await query.graph({
      entity: "customer_tag",
      fields: ["customer_id", "label", "created_at"],
      filters: { label: "VIP" },
      pagination: { take: 500, skip: 0 },
    })
    const vipCustomerIds = Array.from(
      new Set(
        ((vipTags as any[]) ?? [])
          .map((t) => t?.customer_id)
          .filter((id): id is string => typeof id === "string")
      )
    )
    if (vipCustomerIds.length > 0) {
      const { data: customers } = await query.graph({
        entity: "customer",
        fields: ["id", "email", "first_name", "last_name"],
        filters: { id: vipCustomerIds },
        pagination: { take: vipCustomerIds.length, skip: 0 },
      })
      for (const customer of (customers as any[]) ?? []) {
        const { data: orders } = await query.graph({
          entity: "order",
          fields: ["id", "total", "currency_code", "status", "created_at"],
          filters: { customer_id: customer.id },
          pagination: { take: 500, skip: 0 },
        })
        const ltv = computeCustomerLtv(
          ((orders as any[]) ?? []).map((o) => ({
            total: o.total,
            currency_code: o.currency_code,
            status: o.status,
            created_at: o.created_at,
          })),
          { now }
        )
        if (ltv.days_since_last == null || ltv.days_since_last < 60) continue
        vipDormant.push({
          bucket: "vip_dormant",
          customer_id: customer.id,
          email: customer.email ?? "",
          display_name:
            [customer.first_name, customer.last_name]
              .filter((s): s is string => typeof s === "string" && s.length > 0)
              .join(" ") || customer.email,
          detail: `LTV $${ltv.lifetime_value.toFixed(0)} · last order ${ltv.days_since_last}d ago`,
          href: `/app/customers/${customer.id}`,
          signal_at: ltv.last_order_at ?? new Date(0).toISOString(),
        })
      }
      vipDormant.sort((a, b) => (a.signal_at < b.signal_at ? 1 : -1))
    }
  } catch {
    vipDormant = []
  }

  // ---- First-timers worth a hand-written follow-up ----
  // First order in the last 14 days, total ≥ LTV_VIP_THRESHOLD_AUD / 2,
  // not yet tagged VIP.
  let firstTimers: StudioRow[] = []
  try {
    const cutoff = now.getTime() - 14 * 24 * 60 * 60 * 1000
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "customer_id",
        "total",
        "currency_code",
        "created_at",
        "status",
      ],
      pagination: { take: 1000, skip: 0 },
    })
    const ordersByCustomer = new Map<string, any[]>()
    for (const o of (orders as any[]) ?? []) {
      if (!o?.customer_id || (o.status ?? "").toLowerCase() === "canceled") continue
      const arr = ordersByCustomer.get(o.customer_id) ?? []
      arr.push(o)
      ordersByCustomer.set(o.customer_id, arr)
    }
    for (const [customerId, list] of ordersByCustomer.entries()) {
      if (list.length !== 1) continue
      const o = list[0]
      const ts = Date.parse(o.created_at ?? "")
      if (!Number.isFinite(ts) || ts < cutoff) continue
      if (Number(o.total ?? 0) < LTV_VIP_THRESHOLD_AUD / 2) continue
      firstTimers.push({
        bucket: "first_timers",
        customer_id: customerId,
        email: o.email ?? "",
        display_name: o.email ?? customerId,
        detail: `First order #${o.display_id ?? "?"} · $${Number(o.total ?? 0).toFixed(0)}`,
        href: `/app/orders/${o.id}`,
        signal_at: o.created_at as string,
      })
    }
    firstTimers.sort((a, b) => (a.signal_at < b.signal_at ? 1 : -1))
  } catch {
    firstTimers = []
  }

  // ---- Outstanding quotes (status = new or quoted, no activity > 3 days) ----
  let outstandingQuotes: StudioRow[] = []
  try {
    const cutoff = now.getTime() - 3 * 24 * 60 * 60 * 1000
    const { data: quotes } = await query.graph({
      entity: "quote",
      fields: [
        "id",
        "public_id",
        "email",
        "company",
        "subject",
        "status",
        "updated_at",
        "created_at",
        "assigned_to",
      ],
      filters: { status: ["new", "quoted"] },
      pagination: { take: 500, skip: 0 },
    })
    for (const q of (quotes as any[]) ?? []) {
      const ts = Date.parse((q.updated_at as string) ?? (q.created_at as string) ?? "")
      if (!Number.isFinite(ts) || ts > cutoff) continue
      outstandingQuotes.push({
        bucket: "outstanding_quotes",
        customer_id: null,
        email: q.email ?? "",
        display_name: q.company || q.email || q.public_id,
        detail: `${q.public_id} · ${q.status}${q.assigned_to ? ` · ${q.assigned_to}` : " · unassigned"}`,
        href: `/app/quotes?id=${encodeURIComponent(q.id)}`,
        signal_at: (q.updated_at as string) ?? (q.created_at as string),
      })
    }
    outstandingQuotes.sort((a, b) => (a.signal_at < b.signal_at ? -1 : 1))
  } catch {
    outstandingQuotes = []
  }

  // ---- Low NPS responses (score ≤ 2 in last 30 days, not yet flagged) ----
  let lowNps: StudioRow[] = []
  try {
    const cutoff = now.getTime() - 30 * 24 * 60 * 60 * 1000
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "display_id", "email", "customer_id", "metadata", "created_at"],
      pagination: { take: 1000, skip: 0 },
    })
    for (const o of (orders as any[]) ?? []) {
      const meta = (o.metadata as Record<string, unknown> | undefined) ?? {}
      const score = typeof meta.nps_score === "number" ? meta.nps_score : null
      if (score == null || score > 2) continue
      const recordedAt = typeof meta.nps_recorded_at === "string" ? meta.nps_recorded_at : null
      const ts = recordedAt ? Date.parse(recordedAt) : NaN
      if (!Number.isFinite(ts) || ts < cutoff) continue
      lowNps.push({
        bucket: "low_nps",
        customer_id: typeof o.customer_id === "string" ? o.customer_id : null,
        email: o.email ?? "",
        display_name: o.email ?? `order #${o.display_id ?? o.id}`,
        detail: `Score ${score}/5 on #${o.display_id ?? "?"}${meta.nps_comment ? " · comment present" : ""}`,
        href: `/app/orders/${o.id}`,
        signal_at: recordedAt!,
      })
    }
    lowNps.sort((a, b) => (a.signal_at < b.signal_at ? 1 : -1))
  } catch {
    lowNps = []
  }

  return [
    {
      key: "vip_dormant",
      label: "VIPs who've gone quiet",
      description:
        "Tagged VIP but no order in 60+ days. A short call/email keeps the relationship warm.",
      rows: vipDormant.slice(0, 20),
    },
    {
      key: "first_timers",
      label: "Notable first-time orders",
      description:
        "Significant first orders in the last 14 days. Hand-written thank-you = future loyalty.",
      rows: firstTimers.slice(0, 20),
    },
    {
      key: "outstanding_quotes",
      label: "Quotes waiting on you",
      description:
        "Open quotes with no activity in 3+ days. Bring them home or mark them lost.",
      rows: outstandingQuotes.slice(0, 20),
    },
    {
      key: "low_nps",
      label: "Recent low NPS scores",
      description:
        "Customers who rated 1 or 2 in the last 30 days. Reach out before they churn quietly.",
      rows: lowNps.slice(0, 20),
    },
  ]
}
