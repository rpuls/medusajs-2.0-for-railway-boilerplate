import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Heading, Text, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { withWidgetBoundary } from "../components/widget-error-boundary"

type LtvResponse = {
  lifetime_value: number
  currency_code: string | null
  order_count: number
  average_order_value: number
  first_order_at: string | null
  last_order_at: string | null
  days_since_last: number | null
  mixed_currency_truncated: boolean
  vip_threshold: number
  vip_suggested: boolean
}

const formatMoney = (amount: number, currency: string | null): string => {
  const cc = (currency ?? "AUD").toUpperCase()
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: cc,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${cc} ${amount.toFixed(2)}`
  }
}

const formatDate = (iso: string | null): string => {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const Stat = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="flex flex-col p-3 border border-ui-border-base rounded-md bg-ui-bg-subtle">
    <Text size="xsmall" className="text-ui-fg-muted uppercase">{label}</Text>
    <Text size="large" weight="plus" className="text-ui-fg-base mt-1">
      {value}
    </Text>
    {hint ? (
      <Text size="xsmall" className="text-ui-fg-muted mt-1">{hint}</Text>
    ) : null}
  </div>
)

const CustomerLtvWidget = ({ data: customer }: { data: { id: string } }) => {
  const customerId = customer?.id
  const [ltv, setLtv] = useState<LtvResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [tagging, setTagging] = useState(false)
  const [bumped, setBumped] = useState(0)

  useEffect(() => {
    if (!customerId) return
    let cancelled = false
    setLoading(true)
    fetch(`/admin/customers/${customerId}/ltv`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: LtvResponse | null) => {
        if (cancelled) return
        setLtv(data)
      })
      .catch(() => {
        if (!cancelled) setLtv(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [customerId, bumped])

  const suggestVip = async () => {
    if (!customerId || tagging) return
    setTagging(true)
    try {
      const res = await fetch(`/admin/customers/${customerId}/tags`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: "VIP", color: "amber" }),
      })
      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail?.error || "Failed to add tag")
      }
      toast.success("Tagged as VIP")
      setBumped((n) => n + 1)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to add tag")
    } finally {
      setTagging(false)
    }
  }

  if (!customerId) return null

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Lifetime value</Heading>
        {ltv?.mixed_currency_truncated ? (
          <Badge color="orange">Mixed currency — showing dominant</Badge>
        ) : null}
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <Text size="xsmall" className="text-ui-fg-muted">Loading…</Text>
        ) : !ltv ? (
          <Text size="xsmall" className="text-ui-fg-muted">No data.</Text>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat
                label="Lifetime value"
                value={formatMoney(ltv.lifetime_value, ltv.currency_code)}
              />
              <Stat label="Orders" value={String(ltv.order_count)} />
              <Stat
                label="Avg order"
                value={
                  ltv.order_count
                    ? formatMoney(ltv.average_order_value, ltv.currency_code)
                    : "—"
                }
              />
              <Stat
                label="Last order"
                value={
                  ltv.days_since_last !== null
                    ? `${ltv.days_since_last}d ago`
                    : "—"
                }
                hint={formatDate(ltv.last_order_at)}
              />
            </div>

            {ltv.vip_suggested ? (
              <div className="mt-4 flex items-center justify-between rounded-md border border-ui-border-base bg-ui-bg-subtle p-3">
                <div className="flex flex-col">
                  <Text size="small" weight="plus">
                    Suggested: tag this customer as VIP
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    Lifetime value exceeds the {formatMoney(ltv.vip_threshold, ltv.currency_code)} threshold.
                  </Text>
                </div>
                <Button
                  size="small"
                  variant="primary"
                  onClick={suggestVip}
                  disabled={tagging}
                >
                  Tag as VIP
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.details.before",
})

export default withWidgetBoundary(CustomerLtvWidget, "customer-ltv")
