import { defineRouteConfig } from "@medusajs/admin-sdk"
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
import { ArrowPath } from "@medusajs/icons"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderItem = { sku: string; quantity: number; title: string }

type Shipment = {
  trackingNumber?: string
  trackingUrl?: string
  carrier?: string
  shippedAt?: string
}

type PendingOrder = {
  order_id: string
  display_id: number
  created_at: string
  customer: string
  email: string
  items: OrderItem[]
}

type SentOrder = PendingOrder & {
  ascolour_order_id: string
  ascolour_status: string | null
  ascolour_sent_at: string | null
  ascolour_shipments: Shipment[]
  ascolour_last_synced_at: string | null
  ascolour_last_error: string | null
}

type DropshipData = {
  pending: PendingOrder[]
  sent: SentOrder[]
}

type SendResult = {
  order_id: string
  display_id: number
  status: "queued" | "sending" | "done" | "error"
  error?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const itemsSummary = (items: OrderItem[]) =>
  items.map((i) => `${i.sku} ×${i.quantity}`).join(", ")

const statusBadgeColor = (
  status: string | null
): "green" | "red" | "blue" | "grey" => {
  if (!status) return "grey"
  if (/shipped|delivered/i.test(status)) return "green"
  if (/cancel/i.test(status)) return "red"
  return "blue"
}

// ─── Settings panel ───────────────────────────────────────────────────────────

type Settings = {
  shippingMethod: string
  orderNotes: string
  courierInstructions: string
}

const SettingsPanel = ({
  settings,
  onChange,
}: {
  settings: Settings
  onChange: (s: Settings) => void
}) => {
  const [open, setOpen] = useState(false)
  return (
    <Container className="p-0">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-ui-bg-subtle/30 transition"
        onClick={() => setOpen((v) => !v)}
      >
        <Text size="small" weight="plus">
          Shared send settings
        </Text>
        <Text size="xsmall" className="text-ui-fg-subtle">
          {open ? "▲ hide" : "▼ show"}
        </Text>
      </button>

      {open && (
        <div className="flex flex-col gap-y-3 border-t border-ui-border-base px-4 py-4">
          <div className="flex flex-col gap-y-1">
            <Label htmlFor="drop-shipping-method" className="text-xs">
              Shipping method
            </Label>
            <Input
              id="drop-shipping-method"
              placeholder="e.g. Standard"
              value={settings.shippingMethod}
              onChange={(e) =>
                onChange({ ...settings, shippingMethod: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col gap-y-1">
            <Label htmlFor="drop-notes" className="text-xs">
              Order notes
            </Label>
            <Textarea
              id="drop-notes"
              placeholder="Visible to AS Colour customer service."
              value={settings.orderNotes}
              onChange={(e) =>
                onChange({ ...settings, orderNotes: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-y-1">
            <Label htmlFor="drop-courier" className="text-xs">
              Courier instructions
            </Label>
            <Textarea
              id="drop-courier"
              placeholder="Visible to the courier driver only."
              value={settings.courierInstructions}
              onChange={(e) =>
                onChange({ ...settings, courierInstructions: e.target.value })
              }
              rows={2}
            />
          </div>
        </div>
      )}
    </Container>
  )
}

// ─── Pending tab ──────────────────────────────────────────────────────────────

const PendingTab = ({
  orders,
  onSendComplete,
}: {
  orders: PendingOrder[]
  onSendComplete: () => void
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [settings, setSettings] = useState<Settings>({
    shippingMethod: "",
    orderNotes: "",
    courierInstructions: "",
  })
  const [results, setResults] = useState<SendResult[]>([])
  const [sending, setSending] = useState(false)
  const abortRef = useRef(false)

  // Reset selection when orders list changes (after a send completes)
  useEffect(() => {
    setSelected(new Set())
  }, [orders])

  const allSelected = orders.length > 0 && selected.size === orders.length
  const toggleAll = () =>
    setSelected(
      allSelected ? new Set() : new Set(orders.map((o) => o.order_id))
    )
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const selectedOrders = useMemo(
    () => orders.filter((o) => selected.has(o.order_id)),
    [orders, selected]
  )

  const handleSend = async () => {
    if (!selectedOrders.length) return
    abortRef.current = false
    setSending(true)

    const initial: SendResult[] = selectedOrders.map((o) => ({
      order_id: o.order_id,
      display_id: o.display_id,
      status: "queued",
    }))
    setResults(initial)

    for (let i = 0; i < selectedOrders.length; i++) {
      if (abortRef.current) break
      const order = selectedOrders[i]

      setResults((prev) =>
        prev.map((r) =>
          r.order_id === order.order_id ? { ...r, status: "sending" } : r
        )
      )

      try {
        const res = await fetch(
          `/admin/orders/${order.order_id}/send-to-ascolour`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              shippingMethod: settings.shippingMethod || undefined,
              orderNotes: settings.orderNotes || undefined,
              courierInstructions: settings.courierInstructions || undefined,
            }),
          }
        )
        const body = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error((body as any)?.message || `HTTP ${res.status}`)
        }
        setResults((prev) =>
          prev.map((r) =>
            r.order_id === order.order_id ? { ...r, status: "done" } : r
          )
        )
      } catch (err: any) {
        setResults((prev) =>
          prev.map((r) =>
            r.order_id === order.order_id
              ? { ...r, status: "error", error: err?.message ?? String(err) }
              : r
          )
        )
      }
    }

    setSending(false)
    onSendComplete()
  }

  if (orders.length === 0) {
    return (
      <Container className="flex flex-col items-center gap-y-3 py-12">
        <Text className="text-ui-fg-muted">
          No pending AS Colour orders — all caught up!
        </Text>
      </Container>
    )
  }

  return (
    <div className="flex flex-col gap-y-4">
      <SettingsPanel settings={settings} onChange={setSettings} />

      {/* Progress log */}
      {results.length > 0 && (
        <Container className="p-4">
          <Text size="small" weight="plus" className="mb-2">
            Send progress
          </Text>
          <ul className="flex flex-col gap-y-1 text-sm">
            {results.map((r) => (
              <li key={r.order_id} className="flex items-center gap-x-2">
                {r.status === "queued" && (
                  <Badge color="grey" size="2xsmall">queued</Badge>
                )}
                {r.status === "sending" && (
                  <Badge color="blue" size="2xsmall">sending…</Badge>
                )}
                {r.status === "done" && (
                  <Badge color="green" size="2xsmall">sent ✓</Badge>
                )}
                {r.status === "error" && (
                  <Badge color="red" size="2xsmall">error</Badge>
                )}
                <span>
                  Order #{r.display_id}
                  {r.status === "error" && r.error ? (
                    <span className="text-ui-fg-error ml-2">— {r.error}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </Container>
      )}

      {/* Orders table */}
      <Container className="p-0 overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-x-3 px-4 py-2 border-b border-ui-border-base bg-ui-bg-subtle text-ui-fg-subtle text-xs font-medium uppercase tracking-wide">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="h-4 w-4 rounded cursor-pointer"
          />
          <span className="w-16">Order #</span>
          <span className="w-24">Date</span>
          <span className="w-36">Customer</span>
          <span className="flex-1">Items</span>
        </div>

        {orders.map((order) => {
          const isSelected = selected.has(order.order_id)
          const result = results.find((r) => r.order_id === order.order_id)
          const isSent = result?.status === "done"
          const isError = result?.status === "error"

          return (
            <div
              key={order.order_id}
              className={[
                "flex items-start gap-x-3 px-4 py-3 border-b border-ui-border-base last:border-b-0 transition",
                isSelected ? "bg-ui-bg-highlight" : "hover:bg-ui-bg-subtle/30",
                isSent ? "opacity-50" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleOne(order.order_id)}
                disabled={isSent || sending}
                className="mt-0.5 h-4 w-4 rounded cursor-pointer"
              />
              <div className="w-16 shrink-0">
                <a
                  href={`/orders/${order.order_id}`}
                  className="text-sm text-ui-fg-interactive hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  #{order.display_id}
                </a>
              </div>
              <div className="w-24 shrink-0 text-sm text-ui-fg-subtle">
                {fmtDate(order.created_at)}
              </div>
              <div className="w-36 shrink-0 text-sm truncate">
                {order.customer || order.email || "—"}
              </div>
              <div className="flex-1 text-sm text-ui-fg-subtle break-all">
                {itemsSummary(order.items)}
                {isError && result?.error ? (
                  <div className="text-ui-fg-error mt-0.5 text-xs">
                    {result.error}
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </Container>

      {/* Bulk send button */}
      <div className="flex items-center justify-between">
        <Text size="small" className="text-ui-fg-subtle">
          {selected.size} of {orders.length} order{orders.length !== 1 ? "s" : ""} selected
        </Text>
        <Button
          variant="primary"
          disabled={selected.size === 0 || sending}
          isLoading={sending}
          onClick={handleSend}
        >
          {sending
            ? "Sending…"
            : `Send selected (${selected.size}) to AS Colour`}
        </Button>
      </div>
    </div>
  )
}

// ─── Sent tab ─────────────────────────────────────────────────────────────────

const SentTab = ({ orders }: { orders: SentOrder[] }) => {
  if (orders.length === 0) {
    return (
      <Container className="flex flex-col items-center gap-y-3 py-12">
        <Text className="text-ui-fg-muted">
          No AS Colour orders sent yet.
        </Text>
      </Container>
    )
  }

  return (
    <Container className="p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-x-3 px-4 py-2 border-b border-ui-border-base bg-ui-bg-subtle text-ui-fg-subtle text-xs font-medium uppercase tracking-wide">
        <span className="w-16">Order #</span>
        <span className="w-24">Sent</span>
        <span className="w-32">AS Colour ID</span>
        <span className="w-28">Status</span>
        <span className="w-36">Customer</span>
        <span className="flex-1">Items / Tracking</span>
      </div>

      {orders.map((order) => {
        const color = statusBadgeColor(order.ascolour_status)
        const shipments = order.ascolour_shipments ?? []

        return (
          <div
            key={order.order_id}
            className="flex items-start gap-x-3 px-4 py-3 border-b border-ui-border-base last:border-b-0 hover:bg-ui-bg-subtle/30 transition"
          >
            <div className="w-16 shrink-0">
              <a
                href={`/orders/${order.order_id}`}
                className="text-sm text-ui-fg-interactive hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                #{order.display_id}
              </a>
            </div>
            <div className="w-24 shrink-0 text-sm text-ui-fg-subtle">
              {fmtDate(order.ascolour_sent_at)}
            </div>
            <div className="w-32 shrink-0 text-sm font-mono">
              {order.ascolour_order_id}
            </div>
            <div className="w-28 shrink-0">
              <Badge color={color} size="2xsmall">
                {order.ascolour_status ?? "Sent"}
              </Badge>
            </div>
            <div className="w-36 shrink-0 text-sm truncate">
              {order.customer || order.email || "—"}
            </div>
            <div className="flex-1 text-sm text-ui-fg-subtle">
              <div>{itemsSummary(order.items)}</div>
              {shipments.length > 0 && (
                <ul className="mt-1 text-xs">
                  {shipments.map((s, i) => (
                    <li key={i}>
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
                      {s.shippedAt ? ` · ${fmtDateTime(s.shippedAt)}` : ""}
                    </li>
                  ))}
                </ul>
              )}
              {order.ascolour_last_error && (
                <div className="text-ui-fg-error mt-1 text-xs">
                  Error: {order.ascolour_last_error}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </Container>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const AsColourDropshipPage = () => {
  const [data, setData] = useState<DropshipData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"pending" | "sent">("pending")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/admin/dropship/ascolour", {
        credentials: "include",
        headers: { Accept: "application/json" },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = await res.json()
      setData(body)
    } catch (err: any) {
      setError(err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const pending = data?.pending ?? []
  const sent = data?.sent ?? []

  return (
    <div className="flex flex-col gap-y-4">
      {/* Page header */}
      <Container className="flex items-start justify-between">
        <div>
          <Heading level="h1">AS Colour Orders</Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            All orders with AS Colour items from the past 90 days. Select
            pending orders to send them together.
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={load} disabled={loading}>
          <ArrowPath className="mr-1" />
          Refresh
        </Button>
      </Container>

      {/* Error */}
      {error ? (
        <Container>
          <Text className="text-ui-tag-red-icon">Failed to load: {error}</Text>
        </Container>
      ) : null}

      {/* Tabs */}
      <div className="flex gap-x-1 border-b border-ui-border-base px-1">
        {(["pending", "sent"] as const).map((tab) => {
          const count = tab === "pending" ? pending.length : sent.length
          const active = activeTab === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={[
                "px-4 py-2 text-sm font-medium capitalize transition border-b-2 -mb-px",
                active
                  ? "border-ui-fg-base text-ui-fg-base"
                  : "border-transparent text-ui-fg-subtle hover:text-ui-fg-base",
              ].join(" ")}
            >
              {tab === "pending" ? "Pending" : "Sent"}
              {loading ? null : (
                <span className="ml-2 rounded-full bg-ui-bg-subtle px-1.5 py-0.5 text-xs">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {loading ? (
        <Container>
          <Text className="text-ui-fg-subtle">Loading…</Text>
        </Container>
      ) : activeTab === "pending" ? (
        <PendingTab orders={pending} onSendComplete={load} />
      ) : (
        <SentTab orders={sent} />
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "AS Colour Orders",
  icon: ArrowPath,
})

export default AsColourDropshipPage
