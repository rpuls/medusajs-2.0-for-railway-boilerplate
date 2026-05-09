import type { ProductionStage } from "../production-stage"

/**
 * Shared helpers for the report routes under /admin/reports/*. Pulled into
 * a non-routed `_lib` folder (Medusa's file-based routing only matches
 * `route.{ts,tsx}` — `_lib/*.ts` is just module code).
 */

export const DECORATION_METHODS = [
  "embroidery",
  "dtf",
  "screen",
  "uvdtf_sheet",
  "uvdtf_applied",
  "uv",
] as const

export type DecorationMethod = (typeof DECORATION_METHODS)[number] | "blank"

export const isDecorationMethodOrBlank = (s: string): s is DecorationMethod =>
  s === "blank" || (DECORATION_METHODS as readonly string[]).includes(s)

type LineItemMeta = {
  decorationDesign?: { method?: unknown }
  vectorization_for_order?: unknown
  customizerDesign?: unknown
  reorder_source?: unknown
}

/**
 * Classify a single line item by decoration method. Mirrors the logic
 * in /admin/reports/production-snapshot — change in one place, change
 * in both.
 */
export const itemMethod = (item: { metadata?: unknown }): DecorationMethod => {
  const meta = (item?.metadata ?? {}) as LineItemMeta
  const m = meta?.decorationDesign?.method
  if (typeof m === "string" && (DECORATION_METHODS as readonly string[]).includes(m)) {
    return m as DecorationMethod
  }
  if (meta?.customizerDesign && typeof meta.customizerDesign === "object") {
    return "screen"
  }
  return "blank"
}

export const itemHasReorderSource = (item: { metadata?: unknown }): boolean => {
  const meta = (item?.metadata ?? {}) as LineItemMeta
  return typeof meta.reorder_source === "string" && meta.reorder_source.length > 0
}

/**
 * Parse `?from=ISO&to=ISO` query params into a date window. Defaults to
 * the last 30 days if either side is missing or malformed.
 */
export const parseDateRange = (
  query: Record<string, unknown>
): { from: Date; to: Date } => {
  const fromRaw = typeof query.from === "string" ? query.from : ""
  const toRaw = typeof query.to === "string" ? query.to : ""
  const fromMs = Date.parse(fromRaw)
  const toMs = Date.parse(toRaw)
  const now = Date.now()

  const to = Number.isFinite(toMs) ? new Date(toMs) : new Date(now)
  const from = Number.isFinite(fromMs)
    ? new Date(fromMs)
    : new Date(now - 30 * 86_400_000)
  return { from, to }
}

export const inRange = (
  iso: string | null | undefined,
  from: Date,
  to: Date
): boolean => {
  if (!iso) return false
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return false
  return t >= from.getTime() && t <= to.getTime()
}

/**
 * Bucket a list of dates into weeks (Monday-anchored). Returns an array
 * of `{ start, label }` for every week between `from` and `to`, plus a
 * helper to find which bucket a given date belongs to.
 */
export const buildWeekBuckets = (from: Date, to: Date) => {
  const buckets: Array<{ start: Date; label: string }> = []
  const cursor = startOfWeek(from)
  while (cursor.getTime() <= to.getTime()) {
    const start = new Date(cursor)
    buckets.push({
      start,
      label: start.toISOString().slice(0, 10),
    })
    cursor.setUTCDate(cursor.getUTCDate() + 7)
  }
  const findBucket = (iso: string): number => {
    const t = Date.parse(iso)
    if (!Number.isFinite(t)) return -1
    for (let i = buckets.length - 1; i >= 0; i--) {
      if (t >= buckets[i].start.getTime()) return i
    }
    return -1
  }
  return { buckets, findBucket }
}

const startOfWeek = (d: Date): Date => {
  const x = new Date(d)
  const dow = x.getUTCDay() // 0 = Sunday
  // Monday = 1; back up however many days we are past Monday.
  const diff = (dow + 6) % 7
  x.setUTCDate(x.getUTCDate() - diff)
  x.setUTCHours(0, 0, 0, 0)
  return x
}

/**
 * Production-stage history shape persisted on order metadata. Each entry
 * timestamps when the order entered that stage; combined with `created_at`
 * we can compute time-in-stage for any completed-stage transition.
 */
export type ProductionStageHistoryEntry = {
  stage: ProductionStage
  changed_at: string
  note?: string
}

/**
 * Compute dwell time (in days) for each stage transition the order has
 * recorded in its history. Returns one entry per *completed* stage —
 * i.e. the stage the order has since left. The stage the order is
 * currently in is excluded because its dwell isn't final yet.
 */
export const computeStageDwellDays = (
  order: any
): Array<{ stage: ProductionStage; days: number }> => {
  const meta = (order?.metadata ?? {}) as Record<string, unknown>
  const raw = meta.production_stage_history
  if (!Array.isArray(raw) || raw.length < 2) return []

  // Normalise to ProductionStageHistoryEntry, sort by changed_at asc.
  const entries: ProductionStageHistoryEntry[] = []
  for (const e of raw) {
    if (!e || typeof e !== "object") continue
    const stage = (e as { stage?: unknown }).stage
    const changed_at = (e as { changed_at?: unknown }).changed_at
    if (typeof stage !== "string" || typeof changed_at !== "string") continue
    if (!Number.isFinite(Date.parse(changed_at))) continue
    entries.push({
      stage: stage as ProductionStage,
      changed_at,
    })
  }
  entries.sort(
    (a, b) => Date.parse(a.changed_at) - Date.parse(b.changed_at)
  )

  // Each entry's dwell = next_entry.changed_at - this_entry.changed_at.
  // Last entry has no "next" so its dwell isn't measurable here.
  const dwells: Array<{ stage: ProductionStage; days: number }> = []
  for (let i = 0; i < entries.length - 1; i++) {
    const ms = Date.parse(entries[i + 1].changed_at) - Date.parse(entries[i].changed_at)
    dwells.push({
      stage: entries[i].stage,
      days: Math.max(0, ms / 86_400_000),
    })
  }
  return dwells
}

/**
 * Median + p90 of an array of numbers. Returns 0,0 for an empty input
 * rather than NaN so the frontend doesn't have to special-case empty
 * stages.
 */
export const summarise = (values: number[]): { median: number; p90: number } => {
  if (values.length === 0) return { median: 0, p90: 0 }
  const sorted = [...values].sort((a, b) => a - b)
  const median = percentile(sorted, 0.5)
  const p90 = percentile(sorted, 0.9)
  return {
    median: Math.round(median * 10) / 10,
    p90: Math.round(p90 * 10) / 10,
  }
}

const percentile = (sortedAsc: number[], p: number): number => {
  if (sortedAsc.length === 0) return 0
  const idx = (sortedAsc.length - 1) * p
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sortedAsc[lo]
  return sortedAsc[lo] + (sortedAsc[hi] - sortedAsc[lo]) * (idx - lo)
}

/**
 * Defensive batch-fetch of orders with the fields every report needs.
 * Sets a hard cap (default 5000) to avoid runaway responses if the
 * order count grows unexpectedly. Reports should consider this their
 * working set — for higher volumes we'd materialise a view.
 */
export const fetchOrdersForReports = async (
  query: any,
  options: { take?: number } = {}
): Promise<any[]> => {
  const take = options.take ?? 5000
  const { data } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "created_at",
      "status",
      "metadata",
      "currency_code",
      "total",
      "subtotal",
      "email",
      "customer_id",
      "items.id",
      "items.title",
      "items.quantity",
      "items.unit_price",
      "items.metadata",
    ],
    pagination: { take, skip: 0 },
  })
  return (data as any[]) ?? []
}
