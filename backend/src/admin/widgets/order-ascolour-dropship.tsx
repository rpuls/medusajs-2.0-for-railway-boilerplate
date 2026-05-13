import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import type { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import { Badge, Button, Container, Heading, Input, Label, Text, Textarea } from "@medusajs/ui"
import { useCallback, useEffect, useMemo, useState } from "react"

const adminPath = (orderId: string) => `/admin/orders/${orderId}/send-to-ascolour`

type PreviewItem = { sku: string; warehouse: string; quantity: number }

type Preview = {
  items?: PreviewItem[]
  shippingAddress?: Record<string, string | undefined>
  defaultShippingMethod?: string | null
  error?: string
}

type Shipment = {
  trackingNumber?: string
  trackingUrl?: string
  carrier?: string
  shippedAt?: string
}

type StatusPayload = {
  sent: boolean
  ascolour_order_id: string | null
  ascolour_status: string | null
  ascolour_sent_at: string | null
  ascolour_shipments: Shipment[]
  ascolour_last_synced_at: string | null
  last_sync_error: string | null
  last_error: string | null
  preview: Preview
}

const formatDate = (iso: string | null) => {
  if (!iso) return "—"
  const ts = Date.parse(iso)
  if (!Number.isFinite(ts)) return "—"
  return new Date(ts).toLocaleString()
}

const OrderAsColourDropshipWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const orderId = data?.id
  const [status, setStatus] = useState<StatusPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shippingMethod, setShippingMethod] = useState("")
  const [orderNotes, setOrderNotes] = useState("")
  const [courierInstructions, setCourierInstructions] = useState("")

  const load = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(adminPath(orderId), {
        credentials: "include",
        headers: { Accept: "application/json" },
      })
      const body = (await res.json().catch(() => ({}))) as StatusPayload & { message?: string }
      if (!res.ok) throw new Error((body as any)?.message || `HTTP ${res.status}`)
      setStatus(body)
      if (body.preview?.defaultShippingMethod && !shippingMethod) {
        setShippingMethod(body.preview.defaultShippingMethod)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load AS Colour status")
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [orderId, shippingMethod])

  useEffect(() => {
    void load()
  }, [load])

  const previewItems = status?.preview?.items ?? []
  const noItems = !loading && !status?.sent && previewItems.length === 0

  const sendOrder = useCallback(async () => {
    if (!orderId) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch(adminPath(orderId), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          shippingMethod: shippingMethod || undefined,
          orderNotes: orderNotes || undefined,
          courierInstructions: courierInstructions || undefined,
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((body as any)?.message || `HTTP ${res.status}`)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send AS Colour order")
    } finally {
      setSending(false)
    }
  }, [orderId, shippingMethod, orderNotes, courierInstructions, load])

  const summaryRow = useMemo(() => {
    if (!status) return null
    if (status.sent) {
      const statusLabel = status.ascolour_status ?? "Sent"
      const isShipped = /shipped|delivered/i.test(statusLabel)
      const isCancelled = /cancel/i.test(statusLabel)
      const badgeColor: "green" | "red" | "blue" | "grey" = isCancelled
        ? "red"
        : isShipped
          ? "green"
          : "blue"
      return (
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <Text size="small" weight="plus">
              AS Colour order #{status.ascolour_order_id}
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Sent {formatDate(status.ascolour_sent_at)}
              {status.ascolour_last_synced_at
                ? ` · Synced ${formatDate(status.ascolour_last_synced_at)}`
                : ""}
            </Text>
          </div>
          <Badge color={badgeColor}>{statusLabel}</Badge>
        </div>
      )
    }
    return (
      <Text size="small" className="text-ui-fg-subtle">
        Not sent yet — review the items and click "Send to AS Colour" once the artwork is ready.
      </Text>
    )
  }, [status])

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">AS Colour dropship</Heading>
        {loading ? <Badge color="grey">Loading…</Badge> : null}
      </div>

      <div className="flex flex-col gap-y-4 px-6 py-4">
        {summaryRow}

        {error ? (
          <Text size="small" className="text-ui-fg-error">
            {error}
          </Text>
        ) : null}
        {status?.last_error ? (
          <Text size="small" className="text-ui-fg-error">
            Previous attempt failed: {status.last_error}
          </Text>
        ) : null}
        {status?.last_sync_error ? (
          <Text size="small" className="text-ui-fg-error">
            Last status sync failed: {status.last_sync_error}
          </Text>
        ) : null}

        {status?.sent && status.ascolour_shipments?.length ? (
          <div className="flex flex-col gap-y-2">
            <Text size="small" weight="plus">
              Shipments ({status.ascolour_shipments.length})
            </Text>
            <ul className="text-ui-fg-subtle text-sm">
              {status.ascolour_shipments.map((s, i) => (
                <li
                  key={`${s.trackingNumber ?? "ship"}-${i}`}
                  className="flex justify-between gap-2"
                >
                  <span>
                    {s.carrier ? `${s.carrier} ` : ""}
                    {s.trackingUrl ? (
                      <a
                        href={s.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        {s.trackingNumber ?? "Track"}
                      </a>
                    ) : (
                      <code>{s.trackingNumber ?? "—"}</code>
                    )}
                  </span>
                  <span>{s.shippedAt ? formatDate(s.shippedAt) : ""}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {!status?.sent && previewItems.length > 0 ? (
          <div className="flex flex-col gap-y-2">
            <Text size="small" weight="plus">
              Items to forward ({previewItems.length})
            </Text>
            <ul className="text-ui-fg-subtle text-sm">
              {previewItems.map((item) => (
                <li key={`${item.sku}-${item.warehouse}`} className="flex justify-between">
                  <span>
                    <code>{item.sku}</code> @ {item.warehouse}
                  </span>
                  <span>× {item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {status?.preview?.error ? (
          <Text size="small" className="text-ui-fg-error">
            Preview problem: {status.preview.error}
          </Text>
        ) : null}

        {noItems ? (
          <Text size="small" className="text-ui-fg-subtle">
            No AS Colour SKUs detected on this order.
          </Text>
        ) : null}

        {!status?.sent && previewItems.length > 0 ? (
          <div className="flex flex-col gap-y-3">
            <div>
              <Label htmlFor="ascolour-shipping-method">Shipping method</Label>
              <Input
                id="ascolour-shipping-method"
                placeholder={status?.preview?.defaultShippingMethod ?? "e.g. Standard"}
                value={shippingMethod}
                onChange={(e) => setShippingMethod(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ascolour-notes">Order notes</Label>
              <Textarea
                id="ascolour-notes"
                placeholder="Visible to AS Colour customer service. e.g. TEST ORDER — please cancel"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="ascolour-courier">Courier instructions</Label>
              <Textarea
                id="ascolour-courier"
                placeholder="Visible to the courier driver only."
                value={courierInstructions}
                onChange={(e) => setCourierInstructions(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex justify-end">
              <Button variant="primary" disabled={sending} onClick={sendOrder}>
                {sending ? "Sending…" : "Send to AS Colour"}
              </Button>
            </div>
          </div>
        ) : null}

        {status?.sent ? (
          <div className="flex justify-end">
            <Button variant="secondary" disabled={loading} onClick={load}>
              Refresh status
            </Button>
          </div>
        ) : null}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default withWidgetBoundary(OrderAsColourDropshipWidget, "order-ascolour-dropship")
