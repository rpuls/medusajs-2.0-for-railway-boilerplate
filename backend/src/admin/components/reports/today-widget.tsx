import { Container, Heading, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { PALETTE } from "../../lib/reports/palette"
import { Sparkline } from "./sparkline"

type Response = {
  today: {
    from: string
    to: string
    revenue: number
    orders: number
    new_customers: number
    ships_today: number
    ships_this_week: number
    largest_order: number
    top_customer: { email: string; spend: number } | null
  }
  same_weekday_last_week: {
    revenue: number
    orders: number
    new_customers: number
  }
  on_this_day_last_year: {
    revenue: number
    orders: number
    top_product: { title: string; units: number; revenue: number } | null
  }
  month_to_date: {
    orders_before_today: number
    orders_through_today: number
  }
  milestones: Array<{ kind: string; label: string }>
  generated_at: string
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

const greeting = (now: Date, firstName: string | null): string => {
  // Sydney hours
  const sydMs = now.getTime() + 10 * 3_600_000
  const h = new Date(sydMs).getUTCHours()
  let timeOfDay = "Hello"
  if (h >= 5 && h < 12) timeOfDay = "Good morning"
  else if (h >= 12 && h < 18) timeOfDay = "Good afternoon"
  else if (h >= 18 && h < 22) timeOfDay = "Good evening"
  else timeOfDay = "Up late"
  return firstName ? `${timeOfDay}, ${firstName}.` : `${timeOfDay}.`
}

const compareSentence = (
  todayRev: number,
  priorRev: number,
  todayOrders: number,
  priorOrders: number
): string => {
  if (todayOrders === 0 && priorOrders === 0) {
    return "No orders today yet — same as this time last week."
  }
  if (todayOrders === 0) {
    return `Quiet so far. Last week this weekday had ${priorOrders} order${priorOrders === 1 ? "" : "s"}.`
  }
  const revDelta =
    priorRev > 0 ? Math.round(((todayRev - priorRev) / priorRev) * 100) : null
  const orderDelta =
    priorOrders > 0
      ? Math.round(((todayOrders - priorOrders) / priorOrders) * 100)
      : null
  if (revDelta === null && orderDelta === null) {
    return `${todayOrders} order${todayOrders === 1 ? "" : "s"} so far today (no comparable data last week).`
  }
  const direction = (revDelta ?? 0) >= 0 ? "ahead of" : "behind"
  const pct = Math.abs(revDelta ?? 0)
  return `${todayOrders} order${todayOrders === 1 ? "" : "s"}, ${formatCurrency(todayRev)} so far. ${pct}% ${direction} same weekday last week.`
}

const KpiTile = ({
  label,
  value,
  delta,
  deltaColor,
}: {
  label: string
  value: string
  delta?: string | null
  deltaColor?: string
}) => (
  <div className="flex flex-col gap-y-0.5 px-3 py-2 rounded-md bg-ui-bg-subtle/50">
    <Text size="xsmall" className="text-ui-fg-subtle">
      {label}
    </Text>
    <div className="flex items-baseline gap-x-2">
      <Text className="text-2xl font-semibold tabular-nums">{value}</Text>
      {delta ? (
        <Text size="xsmall" style={deltaColor ? { color: deltaColor } : undefined}>
          {delta}
        </Text>
      ) : null}
    </div>
  </div>
)

export const TodayWidget = ({
  firstName,
}: {
  firstName?: string | null
}) => {
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/admin/reports/today`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled) return
        if (j) setData(j as Response)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [tick])

  // Auto-refresh every 90s
  useEffect(() => {
    const interval = setInterval(() => setTick((n) => n + 1), 90_000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !data) {
    return (
      <Container className="p-4">
        <div className="h-16 rounded bg-ui-bg-subtle animate-pulse" />
      </Container>
    )
  }
  if (!data) return null

  const todayRev = data.today.revenue
  const priorRev = data.same_weekday_last_week.revenue
  const todayOrders = data.today.orders
  const priorOrders = data.same_weekday_last_week.orders
  const revDeltaPct =
    priorRev > 0 ? Math.round(((todayRev - priorRev) / priorRev) * 100) : null
  const ordersDeltaPct =
    priorOrders > 0
      ? Math.round(((todayOrders - priorOrders) / priorOrders) * 100)
      : null

  const lastYear = data.on_this_day_last_year

  return (
    <Container className="flex flex-col gap-y-3 p-4">
      <div>
        <Heading level="h2" className="text-base font-semibold">
          {greeting(new Date(), firstName ?? null)}
        </Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {compareSentence(todayRev, priorRev, todayOrders, priorOrders)}
        </Text>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiTile
          label="Today's revenue"
          value={formatCurrency(todayRev)}
          delta={revDeltaPct === null ? null : `${revDeltaPct > 0 ? "+" : ""}${revDeltaPct}% wow`}
          deltaColor={
            revDeltaPct === null
              ? undefined
              : revDeltaPct >= 0
                ? PALETTE.emerald600
                : PALETTE.rose600
          }
        />
        <KpiTile
          label="Orders today"
          value={String(todayOrders)}
          delta={
            ordersDeltaPct === null ? null : `${ordersDeltaPct > 0 ? "+" : ""}${ordersDeltaPct}% wow`
          }
          deltaColor={
            ordersDeltaPct === null
              ? undefined
              : ordersDeltaPct >= 0
                ? PALETTE.emerald600
                : PALETTE.rose600
          }
        />
        <KpiTile
          label="New customers"
          value={String(data.today.new_customers)}
        />
        <KpiTile
          label="Ships today"
          value={String(data.today.ships_today)}
          delta={`${data.today.ships_this_week} this week`}
        />
        <KpiTile
          label="Largest today"
          value={
            data.today.largest_order > 0
              ? formatCurrency(data.today.largest_order)
              : "—"
          }
          delta={
            data.today.top_customer
              ? data.today.top_customer.email.split("@")[0]
              : null
          }
        />
      </div>

      {lastYear.orders > 0 ? (
        <div className="flex items-center gap-x-3 px-3 py-2 rounded-md bg-ui-bg-subtle/30">
          <Sparkline values={[lastYear.revenue, todayRev]} width={40} height={18} />
          <Text size="xsmall" className="text-ui-fg-subtle">
            On this day last year: <strong className="text-ui-fg-base">{formatCurrency(lastYear.revenue)}</strong>{" "}
            from <strong className="text-ui-fg-base">{lastYear.orders}</strong> order{lastYear.orders === 1 ? "" : "s"}
            {lastYear.top_product
              ? ` · top: ${lastYear.top_product.title}`
              : ""}
            .
          </Text>
        </div>
      ) : null}

      {data.milestones.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {data.milestones.map((m) => (
            <span
              key={m.kind}
              className="inline-flex items-center gap-x-1.5 px-2 py-1 rounded-md text-white text-xs"
              style={{ background: PALETTE.emerald600 }}
            >
              🎉 {m.label}
            </span>
          ))}
        </div>
      ) : null}
    </Container>
  )
}
