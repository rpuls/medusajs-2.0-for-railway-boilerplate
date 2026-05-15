import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Calendar } from "@medusajs/icons"
import { Badge, Container, Heading, Text, toast } from "@medusajs/ui"
import { useCallback, useEffect, useMemo, useState } from "react"

import { HelpTooltip } from "../../components/reports/help-tooltip"

type CalendarEntry = {
  order_id: string
  display_id: number | null
  email: string | null
  total: number
  currency_code: string
  stage: string | null
  created_at: string
  deadline_at: string | null
  is_stale: boolean
}

const STAGE_COLORS: Record<string, string> = {
  received: "#94a3b8",
  art_review: "#fbbf24",
  awaiting_approval: "#f97316",
  approved: "#22c55e",
  blanks_ordered: "#06b6d4",
  blanks_arrived: "#22c55e",
  in_production: "#3b82f6",
  quality_check: "#a855f7",
  shipped: "#10b981",
}

const dayMs = 24 * 60 * 60 * 1000

const ProductionCalendarPage = () => {
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/admin/production-calendar", {
        credentials: "include",
      })
      const json = (await res.json()) as { entries?: CalendarEntry[] }
      setEntries(json.entries ?? [])
    } catch {
      toast.error("Failed to load calendar")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Compute the visible date window: earliest order's created_at → latest
  // deadline_at (or now + 14 days if no deadlines).
  const { startMs, endMs, totalDays } = useMemo(() => {
    if (entries.length === 0) {
      const now = Date.now()
      return { startMs: now, endMs: now + 14 * dayMs, totalDays: 14 }
    }
    let start = Infinity
    let end = -Infinity
    for (const e of entries) {
      const c = Date.parse(e.created_at)
      if (Number.isFinite(c) && c < start) start = c
      const d = e.deadline_at ? Date.parse(e.deadline_at) : NaN
      if (Number.isFinite(d) && d > end) end = d
      if (Number.isFinite(c) && c > end) end = c
    }
    if (!Number.isFinite(end)) end = Date.now() + 14 * dayMs
    const padded = end + 2 * dayMs
    const days = Math.max(7, Math.ceil((padded - start) / dayMs))
    return { startMs: start, endMs: padded, totalDays: days }
  }, [entries])

  const xFor = (iso: string | null): number | null => {
    if (!iso) return null
    const t = Date.parse(iso)
    if (!Number.isFinite(t)) return null
    return ((t - startMs) / (endMs - startMs)) * 100
  }

  const dayHeaders = useMemo(() => {
    const out: { left: number; label: string }[] = []
    for (let i = 0; i <= totalDays; i += Math.max(1, Math.ceil(totalDays / 10))) {
      const t = startMs + i * dayMs
      out.push({
        left: ((t - startMs) / (endMs - startMs)) * 100,
        label: new Date(t).toLocaleDateString("en-AU", {
          day: "numeric",
          month: "short",
        }),
      })
    }
    return out
  }, [startMs, endMs, totalDays])

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1" className="flex items-center">
          Production calendar
          <HelpTooltip
            text={{
              title: "Production calendar",
              body: "Every in-flight order plotted against its production timeline. Helps you eyeball capacity at a glance and spot deadlines that need attention.",
              bullets: [
                "Each bar runs from the order's created_at to its deadline (set deadline via order metadata: deadline_at).",
                "Orders without a deadline render as a small dot at created_at.",
                "Bar colour = current production_stage.",
                "Stale orders (no stage change in 3+ days) glow red.",
                "Click a row to open the order detail page.",
              ],
            }}
          />
        </Heading>
        <Badge color="blue">{entries.length} in flight</Badge>
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <Text size="xsmall" className="text-ui-fg-muted">Loading…</Text>
        ) : entries.length === 0 ? (
          <Text size="xsmall" className="text-ui-fg-muted">
            Nothing in production right now.
          </Text>
        ) : (
          <div className="overflow-x-auto">
            <div className="relative min-w-[800px] pb-2">
              {/* Day headers */}
              <div className="relative h-6 border-b border-ui-border-base mb-1">
                {dayHeaders.map((h, idx) => (
                  <span
                    key={idx}
                    className="absolute top-0 text-xs text-ui-fg-muted"
                    style={{ left: `${h.left}%`, transform: "translateX(-50%)" }}
                  >
                    {h.label}
                  </span>
                ))}
              </div>
              {/* Today line */}
              {(() => {
                const todayX = ((Date.now() - startMs) / (endMs - startMs)) * 100
                if (todayX < 0 || todayX > 100) return null
                return (
                  <div
                    className="absolute top-6 bottom-0 w-px bg-rose-400"
                    style={{ left: `${todayX}%` }}
                    aria-label="today"
                  />
                )
              })()}

              <ul className="flex flex-col gap-1">
                {entries.map((e) => {
                  const startX = xFor(e.created_at) ?? 0
                  const endX = e.deadline_at ? xFor(e.deadline_at) ?? null : null
                  const width =
                    endX != null ? Math.max(1, endX - startX) : 1.5
                  const color = STAGE_COLORS[e.stage ?? ""] ?? "#94a3b8"
                  return (
                    <li
                      key={e.order_id}
                      className={`relative h-8 rounded border ${
                        e.is_stale
                          ? "border-rose-400 bg-rose-50"
                          : "border-ui-border-base bg-ui-bg-base"
                      }`}
                    >
                      <a
                        href={`/app/orders/${e.order_id}`}
                        className="absolute inset-0 flex items-center pl-3 pr-2 text-xs hover:bg-ui-bg-subtle"
                      >
                        <span className="truncate font-semibold mr-2">
                          #{e.display_id ?? e.order_id.slice(-6)}
                        </span>
                        <span className="truncate text-ui-fg-muted">
                          {e.email ?? "guest"}
                        </span>
                      </a>
                      <div
                        className="absolute top-1 bottom-1 rounded"
                        style={{
                          left: `${Math.max(0, startX)}%`,
                          width: `${Math.min(width, 100 - Math.max(0, startX))}%`,
                          background: color,
                          opacity: 0.45,
                        }}
                        title={`${e.stage ?? "no stage"} · ${e.is_stale ? "stale" : "on track"}`}
                      />
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Production calendar",
  icon: Calendar,
})

export default ProductionCalendarPage
