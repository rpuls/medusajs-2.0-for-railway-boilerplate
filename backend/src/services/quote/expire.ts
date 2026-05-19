/**
 * Quote expiry — pure selection logic.
 *
 * A quote is eligible for expiry when:
 *   - status === "quoted"  (only quotes that have been actively sent
 *     can expire — `new` quotes stay open indefinitely until staff act
 *     on them; `accepted` / `lost` / `expired` are terminal)
 *   - expires_at is set AND in the past
 *
 * Kept as a pure function so the daily cron and the unit tests can
 * share it.
 */

export type ExpiryCandidate = {
  id: string
  status: string
  expires_at: Date | string | null
}

export function selectExpiredQuotes(
  rows: ExpiryCandidate[],
  now: Date = new Date()
): string[] {
  const cutoff = now.getTime()
  const ids: string[] = []
  for (const row of rows) {
    if (!row?.id) continue
    if (row.status !== "quoted") continue
    if (!row.expires_at) continue
    const ts =
      row.expires_at instanceof Date
        ? row.expires_at.getTime()
        : Date.parse(String(row.expires_at))
    if (!Number.isFinite(ts)) continue
    if (ts >= cutoff) continue
    ids.push(row.id)
  }
  return ids
}
