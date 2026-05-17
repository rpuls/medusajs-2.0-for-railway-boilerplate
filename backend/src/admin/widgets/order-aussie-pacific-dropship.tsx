import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import type { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Text,
  Textarea,
} from "@medusajs/ui"

import { HelpTooltip } from "../components/reports/help-tooltip"
import { useCallback, useEffect, useMemo, useState } from "react"

const adminPath = (orderId: string) =>
  `/admin/orders/${orderId}/send-to-aussie-pacific`

type PreviewItem = { sku: string; quantity: number }

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
  aussiepacific_order_id: string | null
  aussiepacific_status: string | null
  aussiepacific_sent_at: string | null
  aussiepacific_po_number: string | null
  aussiepacific_shipments: Shipment[]
  aussiepacific_last_synced_at: string | null
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

const OrderAussiePacificDropshipWidget = ({
  data,
}: DetailWidgetProps<AdminOrder>) => {
  const orderId = data?.id
  const [status, setStatus] = useState<StatusPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shippingMethod, setShippingMethod] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")

  const load = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(adminPath(orderId), {
        credentials: "include",
        headers: { Accept: "application/json" },
      })
      const body = (await res.json().catch(() => ({}))) as StatusPayload & {
        message?: string
      }
      if (!res.ok) throw new Error((body as any)?.message || `HTTP ${res.status}`)
      setStatus(body)
      if (body.preview?.defaultShippingMethod && !shippingMethod) {
        setShippingMethod(body.preview.defaultShippingMethod)
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load Aussie Pacific status"
      )
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [orderId, shippingMethod])

  useEffect(() => {
    void load()
  }, [load])

  const previewItems = status?.preview?.items ?? []
  const noItems =
    !loading &&
    !status?.sent &&
    previewItems.length === 0 &&
    !status?.preview?.error

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
          deliveryNotes: deliveryNotes || undefined,
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((body as any)?.message || `HTTP ${res.status}`)
      await load()
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to send Aussie Pacific order"
      )
    } finally {
      setSending(false)
    }
  }, [orderId, shippingMethod, deliveryNotes, load])

  const summaryRow = useMemo(() => {
    if (!status) return null
    if (status.sent) {
      const statusLabel = status.aussiepacific_status ?? "Sent"
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
              Aussie Pacific order #{status.aussiepacific_order_id}
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              Sent {formatDate(status.aussiepacific_sent_at)}
              {status.aussiepacific_po_number
                ? ` · PO ${status.aussiepacific_po_number}`
                : ""}
            </Text>
          </div>
          <Badge color={badgeColor}>{statusLabel}</Badge>
        </div>
      )
    }
    return (
      <Text size="small" className="text-ui-fg-subtle">
        Not sent yet — review the items and click "Send to Aussie Pacific" once
        the artwork is ready.
      </Text>
    )
  }, [status])

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2" className="flex items-center">
          Aussie Pacific dropship
          <HelpTooltip
            text={{
              title: "Aussie Pacific dropship",
              body: "Sends this order's blank garments directly from Aussie Pacific's warehouse to your production address via their dropship programme.",
              bullets: [
                "Review the SKU and quantity summary before submitting — changes require a new dropship request.",
                "AP's API does not expose order-status polling. Reconcile shipment status via their email confirmations or distributor portal.",
              ],
            }}
          />
        </Heading>
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

        {status?.sent ? (
          <div className="rounded border border-ui-border-base bg-ui-bg-subtle px-3 py-2">
            <Text size="xsmall" className="text-ui-fg-subtle">
              Status updates not available via API — reconcile shipment status
              via Aussie Pacific email confirmations or the distributor portal.
            </Text>
          </div>
        ) : null}

        {status?.sent && status.aussiepacific_shipments?.length ? (
          <div className="flex flex-col gap-y-2">
            <Text size="small" weight="plus">
              Shipments ({status.aussiepacific_shipments.length})
            </Text>
            <ul className="text-ui-fg-subtle text-sm">
              {status.aussiepacific_shipments.map((s, i) => (
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
                <li key={item.sku} className="flex justify-between">
                  <span>
                    <code>{item.sku}</code>
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
            No Aussie Pacific SKUs detected on this order.
          </Text>
        ) : null}

        {!status?.sent && previewItems.length > 0 ? (
          <div className="flex flex-col gap-y-3">
            <div>
              <Label htmlFor="ap-shipping-method">Shipping method</Label>
              <Input
                id="ap-shipping-method"
                placeholder={
                  status?.preview?.defaultShippingMethod ?? "e.g. Standard"
                }
                value={shippingMethod}
                onChange={(e) => setShippingMethod(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ap-notes">Delivery notes</Label>
              <Textarea
                id="ap-notes"
                placeholder="Visible to Aussie Pacific. Max 1000 characters."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                rows={2}
                maxLength={1000}
              />
            </div>
            <div className="flex justify-end">
              <Button variant="primary" disabled={sending} onClick={sendOrder}>
                {sending ? "Sending…" : "Send to Aussie Pacific"}
              </Button>
            </div>
          </div>
        ) : null}

        {status?.sent ? (
          <div className="flex justify-end">
            <Button variant="secondary" disabled={loading} onClick={load}>
              Refresh
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

export default withWidgetBoundary(
  OrderAussiePacificDropshipWidget,
  "order-aussie-pacific-dropship"
)
