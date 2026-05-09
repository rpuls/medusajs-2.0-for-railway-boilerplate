/**
 * Shared chart palette for the Production and Reports admin pages.
 *
 * Designed as the muted alternative to the Agilo Analytics plugin's
 * default bright recharts palette. Anchored on slate (primary), teal
 * (secondary brand), and stone (neutral context) with semantic accents
 * for warning / positive / negative signals.
 *
 * Hex values are pinned literally rather than referenced from
 * Tailwind tokens because admin pages live outside the storefront's
 * Tailwind preset and we don't want a hard dep.
 */

export const PALETTE = {
  // Primary scale (slate) — used for the "main" series in any chart.
  slate900: "#0f172a",
  slate700: "#334155",
  slate500: "#64748b",
  slate300: "#cbd5e1",
  slate100: "#f1f5f9",

  // Secondary scale (teal) — for series that need to read as
  // "different but related to the primary."
  teal700: "#0f766e",
  teal500: "#14b8a6",
  teal300: "#5eead4",

  // Neutral context (stone) — comparison / non-interactive backdrops.
  stone400: "#a8a29e",
  stone300: "#d6d3d1",
  stone200: "#e7e5e4",
  stone100: "#f5f5f4",
  stone50: "#fafaf9",

  // Semantic — used sparingly so they retain meaning.
  emerald600: "#059669", // good / on-target / shipped
  amber600: "#d97706", // warning / approaching SLA / blocked
  rose600: "#e11d48", // bad / failed / cancelled
} as const

/**
 * One stable color per decoration method. Slate ramp for "print" family,
 * teal ramp for UVDTF family, amber for embroidery (the most distinct
 * decoration type operationally), stone for blanks.
 *
 * Keys map to the `DecorationMethod` union from the storefront's
 * decoration module — keep in sync if methods are added.
 */
export const DECORATION_METHOD_COLORS = {
  screen: PALETTE.slate700,
  dtf: PALETTE.slate500,
  uv: PALETTE.slate300,
  uvdtf_sheet: PALETTE.teal700,
  uvdtf_applied: PALETTE.teal500,
  embroidery: PALETTE.amber600,
  blank: PALETTE.stone400,
} as const

export const DECORATION_METHOD_LABELS = {
  screen: "Screen print",
  dtf: "DTF print",
  uv: "UV print",
  uvdtf_sheet: "UVDTF gang sheet",
  uvdtf_applied: "UVDTF applied",
  embroidery: "Embroidery",
  blank: "Blank",
} as const

export type DecorationMethodKey = keyof typeof DECORATION_METHOD_COLORS

/**
 * Per-stage SLA defaults — re-exported from the backend lib so admin
 * components can import this file without crossing the routes/services
 * boundary. Edit values in `backend/src/lib/production-stage.ts`.
 */
import { STAGE_SLA_DAYS } from "../../../lib/production-stage"
export { STAGE_SLA_DAYS }

/**
 * Color a "days at stage" badge given the stage and the number of days.
 * Returns one of: "ok" (within SLA), "warning" (1-2× SLA), "critical"
 * (>2× SLA), or "neutral" (stage has no SLA).
 */
export type StageHealthBand = "ok" | "warning" | "critical" | "neutral"

export const stageHealthBand = (
  stage: string,
  daysAtStage: number
): StageHealthBand => {
  const sla = (STAGE_SLA_DAYS as Record<string, number | null>)[stage]
  if (sla == null) return "neutral"
  if (daysAtStage <= sla) return "ok"
  if (daysAtStage <= sla * 2) return "warning"
  return "critical"
}

export const STAGE_HEALTH_COLORS: Record<StageHealthBand, string> = {
  ok: PALETTE.emerald600,
  warning: PALETTE.amber600,
  critical: PALETTE.rose600,
  neutral: PALETTE.stone400,
}
