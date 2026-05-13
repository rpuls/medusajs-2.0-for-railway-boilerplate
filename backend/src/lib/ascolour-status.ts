import type { DownstreamStage } from "./production-stage"

/**
 * AS Colour exposes a free-form status string on /orders/{id}. Statuses
 * we've seen so far in their docs + sandbox: Pending, Submitted, Picking,
 * Picked, Packed, Shipped, Cancelled, OnHold. Treat the comparison as
 * case-insensitive — their casing isn't documented as stable.
 */
const TERMINAL_STATUSES = new Set(["shipped", "cancelled", "canceled", "complete", "delivered"])

export function normalizeAscolourStatus(status: string | null | undefined): string {
  return (status ?? "").trim().toLowerCase()
}

export function isTerminalAscolourStatus(status: string | null | undefined): boolean {
  return TERMINAL_STATUSES.has(normalizeAscolourStatus(status))
}

/**
 * Map an AS Colour status onto a Medusa downstream production stage. Only
 * `Shipped` advances stage today — `Cancelled` is a separate workflow and
 * earlier states (Picking/Packed) are internal AS Colour states the
 * customer doesn't need to see.
 */
export function downstreamStageFromAscolourStatus(
  status: string | null | undefined
): DownstreamStage | null {
  switch (normalizeAscolourStatus(status)) {
    case "shipped":
    case "delivered":
      return "shipped"
    default:
      return null
  }
}

export type AscolourShipmentSummary = {
  trackingNumber?: string
  trackingUrl?: string
  carrier?: string
  shippedAt?: string
}

export function summarizeShipments(
  shipments: Array<{
    trackingNumber?: string
    trackingUrl?: string
    carrier?: string
    shippedAt?: string
  }> | null | undefined
): AscolourShipmentSummary[] {
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
