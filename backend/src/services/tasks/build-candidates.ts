/**
 * Pure selection logic for task queues. Used by both the cron job and
 * the unit tests. Two queries:
 *
 *   - "due today" — open or in_progress, with due_at on the current
 *     calendar day (in UTC for now; localisation deferred).
 *   - "overdue" — open or in_progress, with due_at in the past.
 *
 * Plus an idempotency guard: a row is considered "ready to notify" if
 * (a) it's overdue AND (b) `last_overdue_notified_at` is either null
 * or older than the cron's window (default 23h, so we don't email
 * twice the same day).
 */

export type TaskRow = {
  id: string
  assignee_user_id: string
  status: string
  due_at: Date | string | null
  last_overdue_notified_at: Date | string | null
}

export const ACTIVE_STATUSES = new Set(["open", "in_progress"])

const toMs = (v: Date | string | null | undefined): number | null => {
  if (!v) return null
  if (v instanceof Date) return v.getTime()
  const t = Date.parse(String(v))
  return Number.isFinite(t) ? t : null
}

export function isOverdue(row: TaskRow, now: Date = new Date()): boolean {
  if (!ACTIVE_STATUSES.has(row.status)) return false
  const due = toMs(row.due_at)
  if (due === null) return false
  return due < now.getTime()
}

export function isDueToday(row: TaskRow, now: Date = new Date()): boolean {
  if (!ACTIVE_STATUSES.has(row.status)) return false
  const due = toMs(row.due_at)
  if (due === null) return false
  const start = new Date(now)
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)
  return due >= start.getTime() && due < end.getTime()
}

export function isReadyForOverdueNotification(
  row: TaskRow,
  now: Date = new Date(),
  cooldownMs: number = 23 * 60 * 60 * 1000
): boolean {
  if (!isOverdue(row, now)) return false
  const last = toMs(row.last_overdue_notified_at)
  if (last === null) return true
  return now.getTime() - last >= cooldownMs
}

export function selectOverdueForNotification(
  rows: TaskRow[],
  now: Date = new Date()
): string[] {
  return rows.filter((r) => isReadyForOverdueNotification(r, now)).map((r) => r.id)
}
