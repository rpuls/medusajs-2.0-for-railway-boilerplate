export type CohortConfig = {
  cohort_id: number
  tag_label: string
  color: string
}

const VALID_COLORS = new Set(["slate", "teal", "amber", "rose", "emerald"])

/**
 * Parses POSTHOG_COHORT_SYNC_LIST into a typed array. Tolerant of
 * stray whitespace; invalid entries are silently dropped so a
 * malformed entry doesn't disable the whole sync.
 *
 * Format: `cohort_id:tag_label[:color]` separated by commas. Color
 * defaults to "slate" if omitted or unknown.
 *
 * Example: `"123:Engaged:teal,456:At Risk:amber,789:VIP"`.
 */
export function parseCohortConfig(raw: string | null | undefined): CohortConfig[] {
  if (!raw || typeof raw !== "string") return []
  return raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const parts = chunk.split(":").map((p) => p.trim())
      const idStr = parts[0]
      const label = parts[1]
      const color = parts[2]
      const id = Number.parseInt(idStr, 10)
      if (!Number.isFinite(id) || !label) return null
      const resolvedColor = color && VALID_COLORS.has(color) ? color : "slate"
      return { cohort_id: id, tag_label: label, color: resolvedColor }
    })
    .filter((c): c is CohortConfig => c !== null)
}
