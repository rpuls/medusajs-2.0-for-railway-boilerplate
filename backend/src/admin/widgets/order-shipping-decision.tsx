import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import type { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"
import { Badge, Container, Heading, Text } from "@medusajs/ui"
import { useMemo } from "react"

type ShippingDecision = {
  tier: "flat" | "live"
  total_weight_grams?: number
  items_weight_grams?: number
  packaging_overhead_grams?: number
  threshold_grams?: number
  items_missing_weight?: number
  ship_from_postcode?: string | null
  ship_from_country?: string | null
  computed_at?: string | null
}

const isShippingDecision = (raw: unknown): raw is ShippingDecision => {
  if (!raw || typeof raw !== "object") return false
  const tier = (raw as { tier?: unknown }).tier
  return tier === "flat" || tier === "live"
}

const formatKg = (grams: number | undefined): string => {
  if (typeof grams !== "number" || !Number.isFinite(grams)) return "—"
  if (grams < 1000) return `${Math.round(grams)} g`
  return `${(grams / 1000).toFixed(2).replace(/\.00$/, "")} kg`
}

const formatRelative = (iso: string | null | undefined): string => {
  if (!iso) return "—"
  const ts = Date.parse(iso)
  if (!Number.isFinite(ts)) return "—"
  const date = new Date(ts)
  return date.toLocaleString()
}

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-baseline justify-between gap-x-3 py-1">
    <Text size="small" className="text-ui-fg-subtle">
      {label}
    </Text>
    <div className="text-right">{children}</div>
  </div>
)

const OrderShippingDecisionWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const decision = useMemo<ShippingDecision | null>(() => {
    const metadata = (data?.metadata ?? {}) as Record<string, unknown>
    const raw = metadata.shipping_decision
    return isShippingDecision(raw) ? raw : null
  }, [data?.metadata])

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Shipping decision</Heading>
        {decision ? (
          <Badge color={decision.tier === "flat" ? "blue" : "green"}>
            {decision.tier === "flat" ? "Flat-rate" : "Live ShipStation quote"}
          </Badge>
        ) : null}
      </div>

      <div className="px-6 py-4">
        {!decision ? (
          <Text size="small" className="text-ui-fg-subtle">
            No hybrid-shipping decision recorded for this order.
          </Text>
        ) : (
          <div className="flex flex-col gap-y-1">
            <Row label="Cart weight at checkout">
              <Text size="small" weight="plus">
                {formatKg(decision.total_weight_grams)}
              </Text>
              <Text size="xsmall" className="text-ui-fg-subtle">
                items {formatKg(decision.items_weight_grams)} + packaging{" "}
                {formatKg(decision.packaging_overhead_grams)}
              </Text>
            </Row>
            <Row label="Threshold">
              <Text size="small">{formatKg(decision.threshold_grams)}</Text>
            </Row>
            {typeof decision.items_missing_weight === "number" &&
            decision.items_missing_weight > 0 ? (
              <Row label="Items missing weight">
                <Text size="small" className="text-ui-fg-error">
                  {decision.items_missing_weight}
                </Text>
              </Row>
            ) : null}
            <Row label="Ship-from">
              <Text size="small">
                {[decision.ship_from_postcode, decision.ship_from_country]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </Text>
            </Row>
            <Row label="Computed at">
              <Text size="xsmall" className="text-ui-fg-subtle">
                {formatRelative(decision.computed_at ?? null)}
              </Text>
            </Row>
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default withWidgetBoundary(OrderShippingDecisionWidget, "order-shipping-decision")
