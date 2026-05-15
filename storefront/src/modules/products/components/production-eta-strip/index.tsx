import { getProductionEta } from "@lib/data/production-eta"

/**
 * Renders a small "Estimated delivery: X-Y business days" strip on
 * the PDP. The range moves with current production queue depth (see
 * `services/production-eta` on the backend) so customers see
 * realistic timing pre-checkout instead of finding out after.
 *
 * Server component. Returns null when the API is unreachable —
 * blanks out gracefully rather than misleading the customer.
 */
export default async function ProductionEtaStrip() {
  const eta = await getProductionEta()
  if (!eta) return null

  const busy = eta.congested_stages.length > 0
  const heroLine = `${eta.low_days}–${eta.high_days} business days`
  const subLine = busy
    ? "Production is running busy right now — we'll keep you posted at every stage."
    : "Most orders ship within this window. We'll keep you posted at every stage."

  return (
    <div className="mt-3 rounded-md border border-[rgba(26,26,46,0.08)] bg-white/80 px-4 py-3">
      <div className="flex items-baseline justify-between gap-x-3">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-secondary)]">
          Estimated delivery
        </span>
        <span className="text-sm font-semibold text-[var(--brand-primary)]">
          {heroLine}
        </span>
      </div>
      <p className="mt-1 text-xs text-ui-fg-subtle">{subLine}</p>
    </div>
  )
}
