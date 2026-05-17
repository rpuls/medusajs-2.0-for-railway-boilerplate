import type { DownstreamStage } from "./production-stage"

/**
 * Aussie Pacific status normalisation.
 *
 * AP's API documents only `POST /api/v1/order` — there's no documented
 * GET endpoint for an order's status, no shipment endpoint, and no
 * webhooks. We still implement the same status-mapping vocabulary as
 * AS Colour so:
 *   1. The admin widget can display whatever status string `POST /order`
 *      returns (typically "Submitted").
 *   2. If AP later exposes a status endpoint, the polling cron can be
 *      added without touching the widget or the create flow.
 *   3. Manual status updates entered via the admin reconcile against
 *      the same vocabulary.
 */
const TERMINAL_STATUSES = new Set([
  "shipped",
  "cancelled",
  "canceled",
  "complete",
  "delivered",
])

export function normalizeAussiePacificStatus(
  status: string | null | undefined
): string {
  return (status ?? "").trim().toLowerCase()
}

export function isTerminalAussiePacificStatus(
  status: string | null | undefined
): boolean {
  return TERMINAL_STATUSES.has(normalizeAussiePacificStatus(status))
}

/**
 * Map an AP status onto a Medusa downstream production stage. Same shape
 * as the AS Colour mapper.
 */
export function downstreamStageFromAussiePacificStatus(
  status: string | null | undefined
): DownstreamStage | null {
  switch (normalizeAussiePacificStatus(status)) {
    case "shipped":
    case "delivered":
      return "shipped"
    default:
      return null
  }
}

export type AussiePacificShipmentSummary = {
  trackingNumber?: string
  trackingUrl?: string
  carrier?: string
  shippedAt?: string
}

export function summarizeAussiePacificShipments(
  shipments:
    | Array<{
        trackingNumber?: string
        trackingUrl?: string
        carrier?: string
        shippedAt?: string
      }>
    | null
    | undefined
): AussiePacificShipmentSummary[] {
  if (!Array.isArray(shipments)) return []
  return shipments
    .map((s) => ({
      trackingNumber: s.trackingNumber,
      trackingUrl: s.trackingUrl,
      carrier: s.carrier,
      shippedAt: s.shippedAt,
    }))
    .filter((s) => s.trackingNumber || s.trackingUrl || s.shippedAt)
}
