import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Container, Heading, Text } from "@medusajs/ui"

import { withWidgetBoundary } from "../components/widget-error-boundary"

type AppliedPerk = { perk: string; granted_by_tag: string }

const PERK_LABELS: Record<string, string> = {
  free_shipping: "Free shipping (waive at fulfillment)",
}

const OrderAppliedPerksWidget = ({
  data: order,
}: {
  data: { id: string; metadata?: Record<string, unknown> | null }
}) => {
  const meta = (order?.metadata ?? {}) as Record<string, unknown>
  const perks = Array.isArray(meta.applied_perks)
    ? (meta.applied_perks as AppliedPerk[])
    : []
  if (perks.length === 0) return null

  return (
    <Container className="p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2">Customer perks</Heading>
        <Badge color="orange">Action required</Badge>
      </div>
      <div className="px-6 pb-4 flex flex-col gap-y-2">
        {perks.map((p) => (
          <div
            key={`${p.perk}:${p.granted_by_tag}`}
            className="flex items-center justify-between rounded-md border border-ui-border-base bg-ui-bg-subtle p-3"
          >
            <div className="flex flex-col">
              <Text size="small" weight="plus">
                {PERK_LABELS[p.perk] ?? p.perk}
              </Text>
              <Text size="xsmall" className="text-ui-fg-muted">
                Granted by tag: {p.granted_by_tag}
              </Text>
            </div>
          </div>
        ))}
        <Text size="xsmall" className="text-ui-fg-muted">
          Apply the discount via Order Edit before fulfilling.
        </Text>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.before",
})

export default withWidgetBoundary(OrderAppliedPerksWidget, "order-applied-perks")
