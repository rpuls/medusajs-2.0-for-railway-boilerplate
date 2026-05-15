/**
 * Shared helpers for reading and mutating an order's watcher list.
 * Watchers are stored as `metadata.watcher_emails: string[]` on the
 * order — kept as metadata (rather than a separate table) because
 * the list is bounded (max 5) and only ever read alongside the order.
 */

const MAX_WATCHERS = 5

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export function readWatchers(metadata: Record<string, unknown> | null | undefined): string[] {
  const raw = (metadata ?? {})?.watcher_emails
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (v): v is string => typeof v === "string" && isValidEmail(v)
  )
}

export function addWatcher(
  metadata: Record<string, unknown> | null | undefined,
  email: string
): { ok: true; watchers: string[] } | { ok: false; error: string } {
  const trimmed = email.trim().toLowerCase()
  if (!isValidEmail(trimmed)) {
    return { ok: false, error: "Enter a valid email address." }
  }
  const current = readWatchers(metadata)
  if (current.includes(trimmed)) {
    return { ok: true, watchers: current }
  }
  if (current.length >= MAX_WATCHERS) {
    return {
      ok: false,
      error: `Up to ${MAX_WATCHERS} watcher emails per order.`,
    }
  }
  return { ok: true, watchers: [...current, trimmed] }
}

export function removeWatcher(
  metadata: Record<string, unknown> | null | undefined,
  email: string
): string[] {
  const target = email.trim().toLowerCase()
  return readWatchers(metadata).filter((e) => e !== target)
}

export const ORDER_WATCHER_MAX = MAX_WATCHERS
