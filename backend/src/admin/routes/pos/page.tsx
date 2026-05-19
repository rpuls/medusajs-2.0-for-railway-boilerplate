import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ShoppingCart } from "@medusajs/icons"
import { Heading, Text, toast } from "@medusajs/ui"
import { useCallback, useEffect, useRef, useState } from "react"

import { CartPanel } from "./components/cart-panel"
import { CheckoutPanel } from "./components/checkout-panel"
import { ProductSearchPanel } from "./components/product-search-panel"
import { ReceiptModal } from "./components/receipt-modal"
import type {
  POSCheckoutResult,
  POSCustomer,
  POSLineItem,
  POSRegion,
  POSSalesChannel,
  POSSession,
} from "./types"

/**
 * /app/pos — Point-of-sale for walk-in transactions.
 *
 * Layout: three vertical panels — products on the left, cart in the
 * middle, checkout on the right. The page owns:
 *   - the active POS session id (auto-created on mount)
 *   - the cart line items (local state; synced server-side only on
 *     customizer-add via polling + on checkout)
 *   - selected customer / region / sales channel
 *   - the receipt modal
 *
 * The customizer integration is a popup: clicking "Add custom design"
 * opens the storefront customizer at /[country]/customizer?pos_session=
 * <id>&product=<handle>. The customizer's "Save to POS" button POSTs
 * to /api/pos-bridge/items on the storefront, which relays to
 * /store/pos-sessions/:id/items on the backend. This page polls
 * /admin/pos/sessions/:id every 2s while the popup is open and
 * merges new items into the cart.
 */
const POSPage = () => {
  const [session, setSession] = useState<POSSession | null>(null)
  const [items, setItems] = useState<POSLineItem[]>([])
  const [customer, setCustomer] = useState<POSCustomer | null>(null)
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

  // -------- 1. Bootstrap: regions, sales channels, scp-config,
  //             then create a POS session.
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
      // Prefer an AUD region by default for SC Prints; otherwise first.
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

      // Create the session last so retries don't leak sessions.
      const sessionRes = await fetch("/admin/pos/sessions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (!sessionRes.ok) throw new Error("Failed to create POS session")
      const sJson = (await sessionRes.json()) as { pos_session: POSSession }
      setSession(sJson.pos_session)
    } catch (err: any) {
      setBootError(err?.message ?? "Bootstrap failed")
    } finally {
      setBootLoading(false)
    }
  }

  // -------- 2. Cart manipulation (local only until checkout).
  const addItem = useCallback((item: POSLineItem) => {
    setItems((prev) => {
      // Merge same variant if already in cart, kind=standard.
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

  // -------- 3. Customizer popup + polling for new items.
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

  // Poll the session for new customizer items while a popup is open.
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
          // Only merge customizer items via polling — standard items
          // are added directly client-side. This avoids surprising
          // double-adds if a power user posts standard items from a
          // script.
          if (it.kind === "customizer") {
            setItems((prev) => {
              if (prev.some((p) => p.id === it.id)) return prev
              return [...prev, it]
            })
          }
        }
      } catch {
        /* ignore — next tick will retry */
      }
    }, 2000)
    return () => window.clearInterval(id)
  }, [session])

  // -------- 4. Checkout success → show receipt.
  const onCheckoutSuccess = (result: POSCheckoutResult) => {
    setReceipt(result)
  }

  // -------- 5. New transaction — wipe local state + create fresh session.
  const newTransaction = async () => {
    setReceipt(null)
    setItems([])
    setCustomer(null)
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
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to start new session")
    }
  }

  const onRegionChange = (id: string) => {
    setRegion(regions.find((r) => r.id === id) ?? null)
  }

  // -------- Render
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
              onCustomerChange={setCustomer}
              onRegionChange={onRegionChange}
              onSalesChannelChange={setSalesChannelId}
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
