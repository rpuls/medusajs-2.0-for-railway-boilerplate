import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ShoppingCart } from "@medusajs/icons"
import { Heading, Text, toast } from "@medusajs/ui"
import { useCallback, useEffect, useRef, useState } from "react"

import { CartPanel } from "./components/cart-panel"
import { CheckoutPanel } from "./components/checkout-panel"
import { ParkedSalesPicker } from "./components/parked-sales-picker"
import { ProductSearchPanel } from "./components/product-search-panel"
import { ReceiptModal } from "./components/receipt-modal"
import type {
  POSCheckoutResult,
  POSCustomer,
  POSDiscount,
  POSLineItem,
  POSRegion,
  POSSalesChannel,
  POSSession,
} from "./types"
import { ulid } from "./utils"

const EMPTY_DISCOUNT: POSDiscount = {
  promo_codes: [],
  manual_discount_cents: 0,
}

/**
 * /app/pos — Point-of-sale for walk-in transactions.
 *
 * Layout: three vertical panels — products on the left, cart in the
 * middle, checkout on the right. The page owns:
 *   - the active POS session id (auto-created on mount; can be
 *     swapped via the "Parked" dropdown for multi-customer use)
 *   - the cart line items (local state; synced server-side only on
 *     park / customizer-add via polling / on checkout)
 *   - selected customer / walk-in mode / region / sales channel
 *   - discount + promo state
 *   - the receipt modal
 *
 * Park-sale flow: clicking "Park sale" leaves the current session as
 * `active` in the DB (so it shows up in the picker), creates a fresh
 * session, and clears local state. Resuming from the picker swaps the
 * active session and rehydrates its items into the cart.
 *
 * Customizer popup: clicking "Add custom design" opens
 * /[country]/customizer?pos_session=<id>. The customizer's "Add to
 * cart" POSTs to /api/pos-bridge/items which writes to the session.
 * The page polls /admin/pos/sessions/:id every 2s and merges new
 * customizer items into the cart.
 */
const POSPage = () => {
  const [session, setSession] = useState<POSSession | null>(null)
  const [parkedSessions, setParkedSessions] = useState<POSSession[]>([])
  const [items, setItems] = useState<POSLineItem[]>([])
  const [customer, setCustomer] = useState<POSCustomer | null>(null)
  const [walkInMode, setWalkInMode] = useState(false)
  const [discount, setDiscount] = useState<POSDiscount>(EMPTY_DISCOUNT)
  const [regions, setRegions] = useState<POSRegion[]>([])
  const [region, setRegion] = useState<POSRegion | null>(null)
  const [salesChannels, setSalesChannels] = useState<POSSalesChannel[]>([])
  const [salesChannelId, setSalesChannelId] = useState<string | null>(null)
  const [storefrontUrl, setStorefrontUrl] = useState<string | null>(null)
  const [defaultCountry, setDefaultCountry] = useState<string>("au")
  const [receipt, setReceipt] = useState<POSCheckoutResult | null>(null)
  const [bootError, setBootError] = useState<string | null>(null)
  const [bootLoading, setBootLoading] = useState(true)

  const popupRef = useRef<Window | null>(null)
  const polledItemIds = useRef<Set<string>>(new Set())

  // -------- 1. Bootstrap.
  useEffect(() => {
    void bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const bootstrap = async () => {
    setBootLoading(true)
    setBootError(null)
    try {
      const [regionsRes, channelsRes, cfgRes] = await Promise.all([
        fetch("/admin/regions?limit=50&fields=id,name,currency_code", {
          credentials: "include",
        }),
        fetch("/admin/sales-channels?limit=20&fields=id,name", {
          credentials: "include",
        }).catch(() => null),
        fetch("/admin/scp-config", { credentials: "include" }).catch(
          () => null
        ),
      ])

      if (!regionsRes.ok) throw new Error("Failed to load regions")
      const regionsJson = (await regionsRes.json()) as {
        regions: POSRegion[]
      }
      const rs = regionsJson.regions ?? []
      setRegions(rs)
      const aud = rs.find((r) => r.currency_code?.toLowerCase() === "aud")
      setRegion(aud ?? rs[0] ?? null)

      if (channelsRes && channelsRes.ok) {
        const channelsJson = (await channelsRes.json()) as {
          sales_channels: POSSalesChannel[]
        }
        const ch = channelsJson.sales_channels ?? []
        setSalesChannels(ch)
        setSalesChannelId(ch[0]?.id ?? null)
      }

      if (cfgRes && cfgRes.ok) {
        const cfg = await cfgRes.json()
        if (cfg?.storefront_url) setStorefrontUrl(cfg.storefront_url)
        if (cfg?.country_code) setDefaultCountry(cfg.country_code)
      }

      const sessionRes = await fetch("/admin/pos/sessions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (!sessionRes.ok) throw new Error("Failed to create POS session")
      const sJson = (await sessionRes.json()) as { pos_session: POSSession }
      setSession(sJson.pos_session)

      await refreshParkedSessions(sJson.pos_session.id)
    } catch (err: any) {
      setBootError(err?.message ?? "Bootstrap failed")
    } finally {
      setBootLoading(false)
    }
  }

  // -------- Parked sessions list (others owned by me).
  const refreshParkedSessions = useCallback(
    async (currentId: string | null) => {
      try {
        const res = await fetch(
          "/admin/pos/sessions?status=active&owned_by_me=1&limit=20",
          { credentials: "include" }
        )
        if (!res.ok) return
        const json = (await res.json()) as { pos_sessions: POSSession[] }
        const others = (json.pos_sessions ?? []).filter(
          (s) => s.id !== currentId && Array.isArray(s.items) && s.items.length > 0
        )
        setParkedSessions(others)
      } catch {
        /* ignore */
      }
    },
    []
  )

  // -------- 2. Cart manipulation.
  const addItem = useCallback((item: POSLineItem) => {
    setItems((prev) => {
      if (item.kind === "standard" && item.variant_id) {
        const existing = prev.find(
          (p) =>
            p.kind === "standard" &&
            p.variant_id === item.variant_id &&
            p.unit_price_cents === item.unit_price_cents
        )
        if (existing) {
          return prev.map((p) =>
            p.id === existing.id
              ? { ...p, quantity: p.quantity + item.quantity }
              : p
          )
        }
      }
      return [...prev, item]
    })
  }, [])

  const updateItem = useCallback(
    (id: string, patch: Partial<POSLineItem>) => {
      setItems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
      )
    },
    []
  )

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  // -------- 3. Customizer popup + polling.
  const openCustomizer = useCallback(() => {
    if (!session) {
      toast.error("Session not ready")
      return
    }
    if (!storefrontUrl) {
      toast.error(
        "Storefront URL not configured (set STOREFRONT_URL on the backend)"
      )
      return
    }
    const base = storefrontUrl.replace(/\/$/, "")
    const url = `${base}/${defaultCountry}/customizer?pos_session=${session.id}`
    popupRef.current = window.open(
      url,
      "pos-customizer",
      "width=1280,height=900,noopener=false"
    )
    if (!popupRef.current) {
      toast.error("Popup blocked — allow popups for this site")
    }
  }, [session, storefrontUrl, defaultCountry])

  useEffect(() => {
    if (!session) return
    const id = window.setInterval(async () => {
      try {
        const res = await fetch(`/admin/pos/sessions/${session.id}`, {
          credentials: "include",
        })
        if (!res.ok) return
        const json = (await res.json()) as { pos_session: POSSession }
        const incoming = json.pos_session.items ?? []
        for (const it of incoming) {
          if (polledItemIds.current.has(it.id)) continue
          polledItemIds.current.add(it.id)
          if (it.kind === "customizer") {
            setItems((prev) => {
              if (prev.some((p) => p.id === it.id)) return prev
              return [...prev, it]
            })
          }
        }
      } catch {
        /* ignore */
      }
    }, 2000)
    return () => window.clearInterval(id)
  }, [session])

  // -------- 4. Customer / walk-in mode.
  const onCustomerChange = useCallback((c: POSCustomer | null) => {
    setCustomer(c)
    if (c) setWalkInMode(false)
  }, [])

  const onWalkInModeChange = useCallback((on: boolean) => {
    setWalkInMode(on)
    if (on) setCustomer(null)
  }, [])

  // -------- 5. Repeat last order.
  const loadLastOrder = useCallback(async () => {
    if (!customer) return
    try {
      const res = await fetch(
        `/admin/pos/customers/${customer.id}/last-order`,
        { credentials: "include" }
      )
      if (!res.ok) throw new Error(`Lookup failed (${res.status})`)
      const json = (await res.json()) as {
        order: {
          items: Array<{
            variant_id: string
            product_id: string | null
            product_title: string
            variant_title: string | null
            quantity: number
            unit_price_cents: number | null
            kind: "standard" | "customizer-stub"
          }>
        } | null
      }
      if (!json.order || json.order.items.length === 0) {
        toast.info("No past orders to repeat")
        return
      }
      const customizerStubs = json.order.items.filter(
        (it) => it.kind === "customizer-stub"
      ).length
      const newLines = json.order.items
        .filter((it) => it.kind === "standard")
        .map<POSLineItem>((it) => ({
          id: ulid(),
          kind: "standard",
          variant_id: it.variant_id,
          product_id: it.product_id ?? "",
          product_title: it.product_title,
          variant_title: it.variant_title,
          quantity: it.quantity,
          unit_price_cents: it.unit_price_cents,
          metadata: {},
          added_at: new Date().toISOString(),
        }))
      setItems((prev) => [...prev, ...newLines])
      const msg =
        customizerStubs > 0
          ? `Added ${newLines.length} item(s). ${customizerStubs} custom design(s) skipped — re-design via the customizer.`
          : `Added ${newLines.length} item(s) from previous order`
      toast.success(msg)
    } catch (err: any) {
      toast.error(err?.message ?? "Lookup failed")
    }
  }, [customer])

  // -------- 6. Park sale.
  const parkSale = useCallback(async () => {
    if (!session) return
    if (items.length === 0) {
      toast.info("Nothing to park — cart is empty")
      return
    }
    try {
      // Write the current items to the session so they survive the swap.
      await fetch(`/admin/pos/sessions/${session.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customer?.id ?? null,
          items,
        }),
      })
      const res = await fetch("/admin/pos/sessions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (!res.ok) throw new Error("Failed to create new session")
      const json = (await res.json()) as { pos_session: POSSession }
      const previous = session
      setSession(json.pos_session)
      setItems([])
      setCustomer(null)
      setWalkInMode(false)
      setDiscount(EMPTY_DISCOUNT)
      polledItemIds.current.clear()
      toast.success(`Sale parked — ${items.length} item(s) saved`)
      await refreshParkedSessions(json.pos_session.id)
      // Optimistically include the just-parked session for instant UX.
      setParkedSessions((prev) => {
        const merged = [
          { ...previous, items: items as any } as POSSession,
          ...prev.filter((p) => p.id !== previous.id),
        ]
        return merged
      })
    } catch (err: any) {
      toast.error(err?.message ?? "Park failed")
    }
  }, [session, items, customer, refreshParkedSessions])

  // -------- 7. Resume parked sale.
  const resumeSession = useCallback(
    async (target: POSSession) => {
      if (!session) return
      // If the current session has items, park it first so it lands in
      // the picker. If empty, just cancel it so the picker stays tidy.
      try {
        if (items.length > 0) {
          await fetch(`/admin/pos/sessions/${session.id}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customer_id: customer?.id ?? null,
              items,
            }),
          })
        } else {
          await fetch(`/admin/pos/sessions/${session.id}`, {
            method: "DELETE",
            credentials: "include",
          })
        }
        // Re-fetch the target session to pick up any items the bridge
        // added while it was parked.
        const res = await fetch(`/admin/pos/sessions/${target.id}`, {
          credentials: "include",
        })
        const json = (await res.json()) as { pos_session: POSSession }
        const next = json.pos_session
        setSession(next)
        setItems(Array.isArray(next.items) ? next.items : [])
        setCustomer(null)
        setWalkInMode(false)
        setDiscount(EMPTY_DISCOUNT)
        polledItemIds.current = new Set(
          (next.items ?? []).map((it: any) => it.id)
        )
        await refreshParkedSessions(next.id)
        toast.success("Resumed parked sale")
      } catch (err: any) {
        toast.error(err?.message ?? "Resume failed")
      }
    },
    [session, items, customer, refreshParkedSessions]
  )

  // -------- 8. Discard a parked sale.
  const discardParked = useCallback(
    async (id: string) => {
      try {
        await fetch(`/admin/pos/sessions/${id}`, {
          method: "DELETE",
          credentials: "include",
        })
        setParkedSessions((prev) => prev.filter((s) => s.id !== id))
      } catch (err: any) {
        toast.error(err?.message ?? "Discard failed")
      }
    },
    []
  )

  // -------- 9. Checkout success → show receipt.
  const onCheckoutSuccess = (result: POSCheckoutResult) => {
    setReceipt(result)
  }

  const newTransaction = async () => {
    setReceipt(null)
    setItems([])
    setCustomer(null)
    setWalkInMode(false)
    setDiscount(EMPTY_DISCOUNT)
    polledItemIds.current.clear()
    try {
      const res = await fetch("/admin/pos/sessions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const json = (await res.json()) as { pos_session: POSSession }
      setSession(json.pos_session)
      await refreshParkedSessions(json.pos_session.id)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to start new session")
    }
  }

  const onRegionChange = (id: string) => {
    setRegion(regions.find((r) => r.id === id) ?? null)
  }

  if (bootLoading) {
    return (
      <div className="p-6">
        <Text>Loading POS…</Text>
      </div>
    )
  }
  if (bootError) {
    return (
      <div className="p-6">
        <Heading level="h1">POS unavailable</Heading>
        <Text className="text-ui-fg-error mt-2">{bootError}</Text>
      </div>
    )
  }

  return (
    <>
      {parkedSessions.length > 0 && (
        <div className="px-4 py-2 border-b border-ui-border-base flex items-center justify-end bg-ui-bg-subtle">
          <ParkedSalesPicker
            current={session}
            others={parkedSessions}
            onResume={resumeSession}
            onDiscard={discardParked}
          />
        </div>
      )}
      <div
        className="grid h-[calc(100vh-56px)] bg-ui-bg-base"
        style={{ gridTemplateColumns: "minmax(280px, 1fr) minmax(320px, 1.2fr) minmax(280px, 1fr)" }}
      >
        <section className="border-r border-ui-border-base overflow-hidden">
          <ProductSearchPanel
            region={region}
            onAddItem={addItem}
            onOpenCustomizer={openCustomizer}
          />
        </section>

        <section className="border-r border-ui-border-base overflow-hidden">
          <CartPanel
            items={items}
            region={region}
            discount={discount}
            onUpdate={updateItem}
            onRemove={removeItem}
          />
        </section>

        <section className="overflow-hidden">
          {session && (
            <CheckoutPanel
              sessionId={session.id}
              items={items}
              region={region}
              regions={regions}
              salesChannels={salesChannels}
              salesChannelId={salesChannelId}
              customer={customer}
              walkInMode={walkInMode}
              discount={discount}
              onCustomerChange={onCustomerChange}
              onWalkInModeChange={onWalkInModeChange}
              onDiscountChange={setDiscount}
              onRegionChange={onRegionChange}
              onSalesChannelChange={setSalesChannelId}
              onLoadLastOrder={loadLastOrder}
              onParkSale={parkSale}
              onCheckoutSuccess={onCheckoutSuccess}
            />
          )}
        </section>
      </div>

      <ReceiptModal
        open={Boolean(receipt)}
        result={receipt}
        items={items}
        region={region}
        onNewTransaction={newTransaction}
        onClose={() => setReceipt(null)}
      />
    </>
  )
}

export const config = defineRouteConfig({
  label: "POS",
  icon: ShoppingCart,
})

export default POSPage
