import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import { Text } from "@medusajs/ui"
import { useEffect, useRef, useState } from "react"

import { PALETTE } from "../lib/reports/palette"

/**
 * Floating Cmd+K (or Ctrl+K) command palette. Fuzzy search across
 * orders, customers, products. Mounted on the orders list page so it
 * loads once when staff arrive at the admin and stays alive across
 * navigations within the SPA.
 *
 * Trigger: ⌘K / Ctrl+K opens, Esc closes, ↑↓ navigates results,
 * Enter opens the highlighted result. Auto-debounced 200ms after
 * keystrokes.
 */
type Hit = {
  type: "order" | "customer" | "product"
  id: string
  title: string
  subtitle?: string | null
  href: string
}

const TYPE_LABEL: Record<Hit["type"], string> = {
  order: "Order",
  customer: "Customer",
  product: "Product",
}

const TYPE_COLOR: Record<Hit["type"], string> = {
  order: PALETTE.teal700,
  customer: PALETTE.amber600,
  product: PALETTE.slate700,
}

const CmdKPalette = () => {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const [hits, setHits] = useState<Hit[]>([])
  const [loading, setLoading] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Open / close keyboard shortcut
  useEffect(() => {
    if (typeof window === "undefined") return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      } else if (e.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Focus input + reset state when palette opens
  useEffect(() => {
    if (open) {
      setQ("")
      setHits([])
      setHighlight(0)
      // Defer so the input exists when we focus it
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.trim().length === 0) {
      setHits([])
      setLoading(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const r = await fetch(
          `/admin/admin-workspace/search?q=${encodeURIComponent(q.trim())}`,
          { credentials: "include" }
        )
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const j = await r.json()
        setHits((j?.hits as Hit[]) ?? [])
        setHighlight(0)
      } catch {
        setHits([])
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [q, open])

  // Result navigation
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setHighlight((h) => Math.min(h + 1, Math.max(0, hits.length - 1)))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setHighlight((h) => Math.max(0, h - 1))
      } else if (e.key === "Enter" && hits[highlight]) {
        e.preventDefault()
        window.location.href = hits[highlight].href
        setOpen(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, hits, highlight])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-start justify-center pt-24 px-4 bg-black/30 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-lg shadow-xl overflow-hidden"
        style={{ background: "white", border: `1px solid ${PALETTE.stone200}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center gap-x-2 px-3 py-2.5 border-b"
          style={{ borderColor: PALETTE.stone200 }}
        >
          <span style={{ color: PALETTE.stone400, fontSize: 14 }}>⌘K</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search orders, customers, products…"
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: "#111" }}
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs"
            style={{ color: PALETTE.stone400 }}
          >
            Esc
          </button>
        </div>
        <div className="max-h-96 overflow-auto">
          {loading ? (
            <div className="p-4 text-center">
              <Text size="xsmall" className="text-ui-fg-muted">
                Searching…
              </Text>
            </div>
          ) : q.trim() === "" ? (
            <div className="p-4">
              <Text size="xsmall" className="text-ui-fg-muted block mb-2">
                Type to search across orders, customers, products.
              </Text>
              <div
                className="flex flex-wrap gap-2 text-[11px]"
                style={{ color: PALETTE.stone400 }}
              >
                <span className="px-1.5 py-0.5 rounded bg-ui-bg-subtle/60">
                  ↑↓ navigate
                </span>
                <span className="px-1.5 py-0.5 rounded bg-ui-bg-subtle/60">
                  Enter to open
                </span>
                <span className="px-1.5 py-0.5 rounded bg-ui-bg-subtle/60">
                  Esc to close
                </span>
              </div>
            </div>
          ) : hits.length === 0 ? (
            <div className="p-4">
              <Text size="xsmall" className="text-ui-fg-muted">
                No results for "{q}". Try a display ID, email, or product
                handle.
              </Text>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: PALETTE.stone200 }}>
              {hits.map((h, i) => (
                <li key={`${h.type}-${h.id}`}>
                  <a
                    href={h.href}
                    onMouseEnter={() => setHighlight(i)}
                    className="flex items-center gap-x-3 px-3 py-2"
                    style={{
                      background:
                        i === highlight
                          ? "rgba(20,184,166,0.08)"
                          : "transparent",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <span
                      className="text-[10px] uppercase tracking-wide font-semibold w-16"
                      style={{ color: TYPE_COLOR[h.type] }}
                    >
                      {TYPE_LABEL[h.type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Text size="small" className="font-medium truncate">
                        {h.title}
                      </Text>
                      {h.subtitle ? (
                        <Text
                          size="xsmall"
                          className="text-ui-fg-muted truncate"
                        >
                          {h.subtitle}
                        </Text>
                      ) : null}
                    </div>
                    {i === highlight ? (
                      <span
                        className="text-[10px]"
                        style={{ color: PALETTE.stone400 }}
                      >
                        ↵
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default withWidgetBoundary(CmdKPalette, "cmd-k-palette")
