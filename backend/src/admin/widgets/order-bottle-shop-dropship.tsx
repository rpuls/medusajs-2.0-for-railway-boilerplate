import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import type { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import {
  Badge,
  Button,
  Container,
  Heading,
  Label,
  Text,
  Textarea,
} from "@medusajs/ui"
import { HelpTooltip } from "../components/reports/help-tooltip"
import { useCallback, useEffect, useMemo, useState } from "react"

const adminPath = (orderId: string) =>
  `/admin/orders/${orderId}/send-to-bottle-shop`

type PreviewItem = {
  lineItemId: string
  productTitle: string
  variantTitle: string | null
  quantity: number
  spiritType: string | null
  capacityMl: number | null
  externalCode: string | null
  bottleShopId: string | null
}

type ShopSummary = {
  id: string
  name: string
  email: string | null
}

type StatusPayload = {
  sent: boolean
  bottle_shop_sent_at: string | null
  bottle_shop_email_to: string | null
  bottle_shop_last_error: string | null
  preview: {
    items: PreviewItem[]
    shops: ShopSummary[]
    shipTo: Record<string, string | null | undefined> | null
  }
}

const formatDate = (iso: string | null) => {
  if (!iso) return "—"
  const ts = Date.parse(iso)
  if (!Number.isFinite(ts)) return "—"
  return new Date(ts).toLocaleString()
}

const OrderBottleShopDropshipWidget = ({
  data,
}: DetailWidgetProps<AdminOrder>) => {
  const orderId = data?.id
  const [status, setStatus] = useState<StatusPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to load bottle-shop status"
      )
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    void load()
  }, [load])

  const previewItems = status?.preview?.items ?? []
  const previewShops = status?.preview?.shops ?? []
  const noItems = !loading && previewItems.length === 0
  const itemsMissingShop = previewItems.filter((i) => !i.bottleShopId)

  const sendOrder = useCallback(
    async (force = false) => {
      if (!orderId) return
      setSending(true)
      setError(null)
      try {
        const res = await fetch(adminPath(orderId), {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            deliveryNotes: deliveryNotes || undefined,
            force: force || undefined,
          }),
        })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error((body as any)?.message || `HTTP ${res.status}`)
        await load()
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to send bottle-shop order"
        )
      } finally {
        setSending(false)
      }
    },
    [orderId, deliveryNotes, load]
  )

  const summary = useMemo(() => {
    if (!status) return null
    if (status.sent) {
      return (
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <Text size="small" weight="plus">
              Sent {formatDate(status.bottle_shop_sent_at)}
            </Text>
            {status.bottle_shop_email_to ? (
              <Text size="xsmall" className="text-ui-fg-subtle">
                To {status.bottle_shop_email_to}
              </Text>
            ) : null}
          </div>
          <Badge color="green">Sent</Badge>
        </div>
      )
    }
    return (
      <Text size="small" className="text-ui-fg-subtle">
        Not sent yet — review items, then click "Send to bottle shop".
      </Text>
    )
  }, [status])

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2" className="flex items-center">
          Bottle shop dropship
          <HelpTooltip
            text={{
              title: "Bottle shop dropship",
              body: "Forwards this order's bottle line items to the partner bottle shop(s) by email. The shop ships the bottles to the SC Prints workshop; we print the labels and ship to the customer.",
              bullets: [
                "Each bottle product's metadata.bottle_shop_id determines which shop receives the email.",
                "Lines without a bottle_shop_id fall back to BOTTLE_SHOP_DEFAULT_EMAIL if it's set.",
                "Sending is idempotent unless you re-send with force=true (admin only).",
                "Ship-to address reuses ASCOLOUR_WORKSHOP_* env vars — same workshop.",
              ],
            }}
          />
        </Heading>
        {loading ? <Badge color="grey">Loading…</Badge> : null}
      </div>

      <div className="flex flex-col gap-y-4 px-6 py-4">
        {summary}

        {error ? (
          <Text size="small" className="text-ui-fg-error">
            {error}
          </Text>
        ) : null}
        {status?.bottle_shop_last_error ? (
          <Text size="small" className="text-ui-fg-error">
            Previous attempt issues: {status.bottle_shop_last_error}
          </Text>
        ) : null}

        {previewItems.length > 0 ? (
          <div className="flex flex-col gap-y-2">
            <Text size="small" weight="plus">
              Bottle line items ({previewItems.length})
            </Text>
            <ul className="text-ui-fg-subtle text-sm">
              {previewItems.map((item) => {
                const shop = previewShops.find((s) => s.id === item.bottleShopId)
                return (
                  <li key={item.lineItemId} className="flex justify-between gap-2">
                    <span className="min-w-0 truncate">
                      {item.productTitle}
                      {item.variantTitle ? ` · ${item.variantTitle}` : ""}
                      {item.externalCode ? ` · ${item.externalCode}` : ""}
                    </span>
                    <span className="shrink-0">× {item.quantity}</span>
                    <span className="shrink-0 text-xs">
                      {shop?.name ?? (item.bottleShopId ? `(shop ${item.bottleShopId})` : "no shop set")}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}

        {itemsMissingShop.length > 0 ? (
          <div className="rounded border border-ui-tag-orange-border bg-ui-tag-orange-bg px-3 py-2">
            <Text size="xsmall" className="text-ui-tag-orange-text">
              {itemsMissingShop.length} line(s) have no `metadata.bottle_shop_id` set on their product. Set it via the Bottle setup widget on each product page, otherwise BOTTLE_SHOP_DEFAULT_EMAIL is used as a fallback.
            </Text>
          </div>
        ) : null}

        {noItems ? (
          <Text size="small" className="text-ui-fg-subtle">
            No bottle line items on this order. (Products need
            <code> metadata.product_class = "bottle"</code>.)
          </Text>
        ) : null}

        {previewItems.length > 0 ? (
          <div className="flex flex-col gap-y-3">
            <div>
              <Label htmlFor="bs-notes">Delivery notes</Label>
              <Textarea
                id="bs-notes"
                placeholder="Visible to the bottle shop. Max 2000 characters."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                rows={3}
                maxLength={2000}
              />
            </div>
            <div className="flex justify-end gap-x-2">
              {status?.sent ? (
                <Button variant="secondary" disabled={sending} onClick={() => sendOrder(true)}>
                  {sending ? "Sending…" : "Re-send"}
                </Button>
              ) : null}
              {!status?.sent ? (
                <Button variant="primary" disabled={sending} onClick={() => sendOrder(false)}>
                  {sending ? "Sending…" : "Send to bottle shop"}
                </Button>
              ) : null}
              <Button variant="transparent" disabled={loading} onClick={load}>
                Refresh
              </Button>
            </div>
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
  OrderBottleShopDropshipWidget,
  "order-bottle-shop-dropship"
)
