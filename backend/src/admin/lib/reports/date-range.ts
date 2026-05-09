/**
 * Shared date-range presets used by the Reports page filter bar.
 */

export type DateRangePreset =
  | "last_7_days"
  | "last_30_days"
  | "this_month"
  | "last_month"
  | "last_quarter"
  | "custom"

export type DateRange = {
  preset: DateRangePreset
  from: Date
  to: Date
}

const startOfDay = (d: Date) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

const endOfDay = (d: Date) => {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

export const buildPreset = (preset: DateRangePreset, now = new Date()): DateRange => {
  const today = endOfDay(now)
  switch (preset) {
    case "last_7_days":
      return {
        preset,
        from: startOfDay(new Date(now.getTime() - 6 * 86_400_000)),
        to: today,
      }
    case "last_30_days":
      return {
        preset,
        from: startOfDay(new Date(now.getTime() - 29 * 86_400_000)),
        to: today,
      }
    case "this_month":
      return {
        preset,
        from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
        to: today,
      }
    case "last_month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return { preset, from: startOfDay(start), to: endOfDay(end) }
    }
    case "last_quarter": {
      const q = Math.floor(now.getMonth() / 3)
      const startMonth = (q - 1) * 3
      const startYear = startMonth < 0 ? now.getFullYear() - 1 : now.getFullYear()
      const month = startMonth < 0 ? startMonth + 12 : startMonth
      const start = new Date(startYear, month, 1)
      const end = new Date(startYear, month + 3, 0)
      return { preset, from: startOfDay(start), to: endOfDay(end) }
    }
    case "custom":
    default:
      return {
        preset: "last_30_days",
        from: startOfDay(new Date(now.getTime() - 29 * 86_400_000)),
        to: today,
      }
  }
}

export const PRESET_LABELS: Record<DateRangePreset, string> = {
  last_7_days: "Last 7 days",
  last_30_days: "Last 30 days",
  this_month: "This month",
  last_month: "Last month",
  last_quarter: "Last quarter",
  custom: "Custom",
}

export const formatDateRange = (range: DateRange): string => {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-AU", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    })
  return `${fmt(range.from)} – ${fmt(range.to)}`
}
