import { defineRouteConfig } from "@medusajs/admin-sdk"
import { HelpTooltip } from "../../../components/reports/help-tooltip"
import { Badge, Button, Container, Heading, Text } from "@medusajs/ui"
import { ArrowPath, BuildingStorefront } from "@medusajs/icons"
import { useCallback, useEffect, useState } from "react"

type LineSummary = {
  productTitle: string
  variantTitle: string | null
  quantity: number
  spiritType: string | null
  bottleShopId: string | null
  bottleShopName: string | null
}

type PendingOrder = {
  order_id: string
  display_id: number
  created_at: string
  customer: string
  email: string
  items: LineSummary[]
}

type SentOrder = PendingOrder & {
  bottle_shop_sent_at: string
  bottle_shop_email_to: string | null
  bottle_shop_last_error: string | null
}

type DropshipData = {
  pending: PendingOrder[]
  sent: SentOrder[]
}

const fmtDate = (iso: string | null | undefined) => {
  if (!iso) return "—"
  const t = Date.parse(iso)
  return Number.isFinite(t) ? new Date(t).toLocaleDateString() : "—"
}

const fmtDateTime = (iso: string | null | undefined) => {
  if (!iso) return "—"
  const t = Date.parse(iso)
  return Number.isFinite(t) ? new Date(t).toLocaleString() : "—"
}

const itemsSummary = (items: LineSummary[]) =>
  items.map((i) => `${i.productTitle}${i.variantTitle ? ` (${i.variantTitle})` : ""} ×${i.quantity}`).join(", ")

const BottleShopDropshipPage = () => {
  const [data, setData] = useState<DropshipData>({ pending: [], sent: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/admin/dropship/bottle-shop", { credentials: "include" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData({ pending: json.pending ?? [], sent: json.sent ?? [] })
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="flex items-start justify-between">
        <div>
          <Heading level="h1" className="flex items-center">
            Bottle shop orders
            <HelpTooltip
              text={{
                title: "Bottle shop orders",
                body: "Snapshot of recent orders (last 90 days) that contain bottle line items, split by whether the partner bottle shop has been emailed. Use the order links to open each order and send (or re-send) via the 'Bottle shop dropship' widget.",
                bullets: [
                  "Pending = bottle lines on the order, but no bottle_shop_sent_at yet.",
                  "Sent = the dropship email has gone out; reconcile shipments via the partner's confirmations.",
                  "Multi-shop orders fan out — one email per distinct bottle_shop_id.",
                ],
              }}
            />
          </Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Bottle line items pending/sent to partner bottle shops.
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={load} disabled={loading}>
          <ArrowPath className="mr-1" /> Refresh
        </Button>
      </Container>

      {error ? (
        <Container>
          <Text className="text-ui-tag-red-icon">{error}</Text>
        </Container>
      ) : null}

      <Container className="p-0">
        <div className="px-4 py-3 border-b border-ui-border-base flex items-center justify-between">
          <Heading level="h2">Pending</Heading>
          <Badge color={data.pending.length ? "orange" : "grey"}>
            {data.pending.length}
          </Badge>
        </div>
        {data.pending.length === 0 ? (
          <div className="px-4 py-6">
            <Text size="small" className="text-ui-fg-subtle">
              No pending bottle-shop orders.
            </Text>
          </div>
        ) : (
          data.pending.map((o) => (
            <div
              key={o.order_id}
              className="px-4 py-3 border-b border-ui-border-base last:border-b-0 flex flex-col gap-y-1"
            >
              <div className="flex items-center justify-between">
                <a
                  href={`/app/orders/${o.order_id}`}
                  className="text-ui-fg-interactive hover:underline"
                >
                  <Text size="small" weight="plus">#{o.display_id}</Text>
                </a>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  {fmtDate(o.created_at)} · {o.customer || o.email}
                </Text>
              </div>
              <Text size="xsmall" className="text-ui-fg-subtle">
                {itemsSummary(o.items)}
              </Text>
            </div>
          ))
        )}
      </Container>

      <Container className="p-0">
        <div className="px-4 py-3 border-b border-ui-border-base flex items-center justify-between">
          <Heading level="h2">Sent</Heading>
          <Badge color={data.sent.length ? "green" : "grey"}>
            {data.sent.length}
          </Badge>
        </div>
        {data.sent.length === 0 ? (
          <div className="px-4 py-6">
            <Text size="small" className="text-ui-fg-subtle">
              No sent bottle-shop orders in the last 90 days.
            </Text>
          </div>
        ) : (
          data.sent.map((o) => (
            <div
              key={o.order_id}
              className="px-4 py-3 border-b border-ui-border-base last:border-b-0 flex flex-col gap-y-1"
            >
              <div className="flex items-center justify-between">
                <a
                  href={`/app/orders/${o.order_id}`}
                  className="text-ui-fg-interactive hover:underline"
                >
                  <Text size="small" weight="plus">#{o.display_id}</Text>
                </a>
                <Text size="xsmall" className="text-ui-fg-subtle">
                  Sent {fmtDateTime(o.bottle_shop_sent_at)}
                </Text>
              </div>
              <Text size="xsmall" className="text-ui-fg-subtle">
                {itemsSummary(o.items)}
                {o.bottle_shop_email_to ? ` · → ${o.bottle_shop_email_to}` : ""}
              </Text>
              {o.bottle_shop_last_error ? (
                <Text size="xsmall" className="text-ui-tag-red-icon">
                  Last issue: {o.bottle_shop_last_error}
                </Text>
              ) : null}
            </div>
          ))
        )}
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Bottle shop orders",
  icon: BuildingStorefront,
})

export default BottleShopDropshipPage
