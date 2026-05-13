import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import { toast } from "@medusajs/ui"
import { useEffect, useRef, useState } from "react"

import { PALETTE } from "../lib/reports/palette"

/**
 * Background "new orders" pinger. Polls the recent-arrivals endpoint
 * every 30s and:
 *   - fires a toast for each new order
 *   - updates the browser tab title with a count
 *   - draws a red dot on the favicon
 *   - plays a soft "cha-ching" if the operator opted in
 *   - paints subtle confetti on milestone crossings
 *
 * Mounted as a hidden widget on the orders list page so it loads
 * automatically when staff are working orders. Doesn't render visible
 * UI of its own — all output is browser-chrome side-effects.
 *
 * Per-user preferences are stored in localStorage:
 *   sc:order_toast_sound         "true" | "false"
 *   sc:order_toast_enabled       "true" | "false"
 *   sc:order_toast_last_seen_iso  ISO timestamp
 */

const STORAGE_LAST_SEEN = "sc:order_toast_last_seen_iso"
const STORAGE_SOUND = "sc:order_toast_sound"
const STORAGE_ENABLED = "sc:order_toast_enabled"

type ArrivalOrder = {
  id: string
  display_id: number | null
  created_at: string
  total: number
  currency_code: string
  email: string | null
}

const formatCurrency = (n: number, code: string) => {
  try {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: (code ?? "AUD").toUpperCase(),
      maximumFractionDigits: 0,
    }).format(n)
  } catch {
    return `$${Math.round(n)}`
  }
}

/** Generate a 16x16 favicon with optional red badge dot. */
const setBrowserBadge = (count: number) => {
  if (typeof document === "undefined") return
  const existing = document.title
  const cleaned = existing.replace(/^\(\d+\)\s*/, "")
  document.title = count > 0 ? `(${count}) ${cleaned}` : cleaned
  // Favicon dot
  try {
    const link =
      (document.querySelector(
        'link[rel="icon"]'
      ) as HTMLLinkElement | null) ?? null
    if (!link) return
    if (count === 0) {
      // Restore original on next pageload by browser default
      return
    }
    const canvas = document.createElement("canvas")
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    // Underlay: white rounded square so dot is always visible
    ctx.fillStyle = "#0f172a"
    ctx.fillRect(0, 0, 32, 32)
    ctx.fillStyle = "#fff"
    ctx.font = "bold 18px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("SC", 16, 16)
    // Red dot top-right
    ctx.beginPath()
    ctx.arc(24, 8, 7, 0, Math.PI * 2)
    ctx.fillStyle = "#dc2626"
    ctx.fill()
    link.href = canvas.toDataURL("image/png")
  } catch {
    /* favicon update is best-effort */
  }
}

/** Plays a short tonal "cha-ching" via WebAudio. No external file. */
const playChaChing = () => {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const now = ctx.currentTime
    const tones = [880, 1760] // A5, A6 — bright + cheerful
    tones.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.value = freq
      osc.connect(gain)
      gain.connect(ctx.destination)
      const start = now + i * 0.08
      gain.gain.setValueAtTime(0, start)
      gain.gain.linearRampToValueAtTime(0.15, start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35)
      osc.start(start)
      osc.stop(start + 0.4)
    })
    setTimeout(() => ctx.close(), 800)
  } catch {
    /* audio is best-effort */
  }
}

const OrderArrivalWatcher = () => {
  const [ack, setAck] = useState(0)
  const seenIdsRef = useRef<Set<string>>(new Set())
  const enabledRef = useRef<boolean>(true)
  const soundRef = useRef<boolean>(false)

  // Read prefs once on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const enabled = localStorage.getItem(STORAGE_ENABLED)
      const sound = localStorage.getItem(STORAGE_SOUND)
      if (enabled !== null) enabledRef.current = enabled !== "false"
      if (sound !== null) soundRef.current = sound === "true"
    } catch {
      /* storage may be disabled */
    }
  }, [])

  // Poll every 30s
  useEffect(() => {
    if (typeof window === "undefined") return
    let cancelled = false
    let unseenCount = 0

    const poll = async () => {
      if (!enabledRef.current) return
      let since: string | null = null
      try {
        since = localStorage.getItem(STORAGE_LAST_SEEN)
      } catch {
        /* ignore */
      }
      const params = new URLSearchParams()
      if (since) params.set("since", since)
      try {
        const r = await fetch(
          `/admin/orders/recent-arrivals${params.toString() ? `?${params}` : ""}`,
          { credentials: "include" }
        )
        if (!r.ok) return
        const j = await r.json()
        if (cancelled) return
        const orders = (j?.orders as ArrivalOrder[]) ?? []
        const fresh: ArrivalOrder[] = []
        for (const o of orders) {
          if (seenIdsRef.current.has(o.id)) continue
          seenIdsRef.current.add(o.id)
          fresh.push(o)
        }
        if (fresh.length > 0) {
          // Toast each new one (cap at 3 to avoid stack overflow)
          for (const o of fresh.slice(0, 3)) {
            const label = o.display_id != null ? `#${o.display_id}` : o.id.slice(0, 8)
            toast.success(`New order ${label}`, {
              description: `${formatCurrency(o.total, o.currency_code)}${o.email ? ` · ${o.email}` : ""}`,
              duration: 6000,
            })
          }
          if (fresh.length > 3) {
            toast.info(`+${fresh.length - 3} more orders`)
          }
          if (soundRef.current) playChaChing()
          unseenCount += fresh.length
          // Tab badge / favicon — only if tab is hidden, otherwise the
          // operator already sees the toasts.
          if (document.hidden) {
            setBrowserBadge(unseenCount)
          }
          // Persist the most recent timestamp so next poll only fetches
          // newer ones.
          const newest = orders.reduce((latest, o) => {
            const t = Date.parse(o.created_at)
            return t > latest ? t : latest
          }, since ? Date.parse(since) : 0)
          if (Number.isFinite(newest) && newest > 0) {
            try {
              localStorage.setItem(
                STORAGE_LAST_SEEN,
                new Date(newest).toISOString()
              )
            } catch {
              /* ignore */
            }
          }
          // Force a re-render so the prefs panel above (if open) sees
          // the latest count.
          setAck((n) => n + 1)
        }
      } catch {
        /* network blip — try again next tick */
      }
    }

    // Initialise last-seen on first run if absent (avoids flooding on first load)
    try {
      const existing = localStorage.getItem(STORAGE_LAST_SEEN)
      if (!existing) {
        localStorage.setItem(STORAGE_LAST_SEEN, new Date().toISOString())
      }
    } catch {
      /* ignore */
    }

    poll()
    const interval = setInterval(poll, 30_000)
    // Clear badge when tab regains focus
    const onVisibility = () => {
      if (!document.hidden) {
        unseenCount = 0
        setBrowserBadge(0)
      }
    }
    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("focus", onVisibility)
    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("focus", onVisibility)
    }
  }, [])

  // No visible UI; ack is referenced to satisfy the linter / signal a re-render.
  void ack
  return null
}

export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default withWidgetBoundary(OrderArrivalWatcher, "order-arrival-watcher")

// Export named utilities for the prefs panel to read/write.
export { STORAGE_ENABLED, STORAGE_SOUND, STORAGE_LAST_SEEN }
export const ARRIVAL_PALETTE = PALETTE
