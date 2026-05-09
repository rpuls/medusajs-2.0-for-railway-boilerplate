import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

import { PALETTE } from "../lib/reports/palette"

/**
 * Localstorage-backed recently-viewed list. Captures the last 8 records
 * the operator opened, persists across sessions. Two widgets:
 *   1. tracker (zero UI) — runs on every detail page, pushes to localStorage
 *   2. sidebar (visible) — renders the list on the orders list page
 *
 * Both listen to the same `sc:recently_viewed` key for cross-tab sync.
 */
const STORAGE_KEY = "sc:recently_viewed"
const MAX_ENTRIES = 8

type Entry = {
  type: "order" | "customer" | "product"
  id: string
  title: string
  href: string
  viewed_at: string
}

const TYPE_LABEL: Record<Entry["type"], string> = {
  order: "Order",
  customer: "Customer",
  product: "Product",
}

const TYPE_COLOR: Record<Entry["type"], string> = {
  order: PALETTE.teal700,
  customer: PALETTE.amber600,
  product: PALETTE.slate700,
}

const RecentlyViewedSidebar = () => {
  const [entries, setEntries] = useState<Entry[]>([])

  const loadEntries = () => {
    if (typeof window === "undefined") return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        setEntries([])
        return
      }
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setEntries(parsed.slice(0, MAX_ENTRIES))
      }
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    loadEntries()
    if (typeof window === "undefined") return
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) loadEntries()
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  if (entries.length === 0) return null

  const formatRelative = (iso: string): string => {
    const ms = Date.parse(iso ?? "")
    if (!Number.isFinite(ms)) return ""
    const diff = Date.now() - ms
    if (diff < 60_000) return "just now"
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
    return `${Math.floor(diff / 86_400_000)}d ago`
  }

  return (
    <Container className="flex flex-col gap-y-2 p-4">
      <Heading level="h2" className="text-base font-semibold">
        Recently viewed
      </Heading>
      <Text size="xsmall" className="text-ui-fg-subtle">
        Your last {entries.length} record{entries.length === 1 ? "" : "s"} —
        clears when you clear browser storage.
      </Text>
      <ul className="flex flex-col gap-y-1 mt-1">
        {entries.map((e) => (
          <li key={`${e.type}-${e.id}`}>
            <a
              href={e.href}
              className="flex items-center gap-x-2 px-2 py-1.5 rounded hover:bg-ui-bg-subtle"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <span
                className="text-[10px] uppercase tracking-wide font-semibold w-14 shrink-0"
                style={{ color: TYPE_COLOR[e.type] }}
              >
                {TYPE_LABEL[e.type]}
              </span>
              <Text size="small" className="flex-1 truncate">
                {e.title}
              </Text>
              <Text size="xsmall" className="text-ui-fg-muted shrink-0">
                {formatRelative(e.viewed_at)}
              </Text>
            </a>
          </li>
        ))}
      </ul>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default RecentlyViewedSidebar

// Helper exposed for the per-page trackers to push entries.
export const recordRecentlyViewed = (entry: Omit<Entry, "viewed_at">) => {
  if (typeof window === "undefined") return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list: Entry[] = raw ? JSON.parse(raw) : []
    const filtered = list.filter(
      (e) => !(e.type === entry.type && e.id === entry.id)
    )
    const next: Entry[] = [
      { ...entry, viewed_at: new Date().toISOString() },
      ...filtered,
    ].slice(0, MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}
