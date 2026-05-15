import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Container, Text } from "@medusajs/ui"

import { HelpTooltip } from "../components/reports/help-tooltip"
import { withWidgetBoundary } from "../components/widget-error-boundary"

const OrderStaleBadgeWidget = ({
  data: order,
}: {
  data: { id: string; metadata?: Record<string, unknown> | null }
}) => {
  const meta = (order?.metadata ?? {}) as Record<string, unknown>
  if (meta.is_stale !== true) return null

  const since = typeof meta.stale_since === "string" ? meta.stale_since : null
  const stage = typeof meta.production_stage === "string" ? meta.production_stage : null

  return (
    <Container className="p-0">
      <div className="px-6 py-3 flex items-center justify-between bg-ui-tag-red-bg border-b border-ui-tag-red-border">
        <div className="flex items-center gap-x-2">
          <Badge color="red">Stale</Badge>
          <Text size="small" weight="plus" className="text-ui-tag-red-text">
            Hasn&apos;t moved in {stage ? `from ${stage} ` : ""}
            {since
              ? Math.max(
                  1,
                  Math.floor((Date.now() - Date.parse(since)) / (24 * 60 * 60 * 1000))
                )
              : "a few"}{" "}
            day(s)
          </Text>
          <HelpTooltip
            text={{
              title: "Stale order",
              body: "The order's production_stage hasn't changed in STALE_ORDER_THRESHOLD_DAYS days (default 3). The badge clears automatically when staff advance the stage.",
              bullets: [
                "Stamped by the daily 08:00 UTC cron.",
                "Also posts a digest to SLACK_PRODUCTION_WEBHOOK_URL when set, so #production sees the same list.",
                "Terminal stages (shipped/delivered) are excluded.",
              ],
            }}
          />
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default withWidgetBoundary(OrderStaleBadgeWidget, "order-stale-badge")
