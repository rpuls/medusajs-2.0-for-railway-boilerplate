import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Container, Heading, Text } from "@medusajs/ui"

import { withWidgetBoundary } from "../components/widget-error-boundary"

type OrderMeta = {
  nps_score?: number
  nps_comment?: string
  nps_recorded_at?: string
  nps_request_sent_at?: string
}

const BADGE: Record<number, "red" | "orange" | "blue" | "green"> = {
  1: "red",
  2: "red",
  3: "orange",
  4: "blue",
  5: "green",
}

const OrderNpsWidget = ({
  data: order,
}: {
  data: { id: string; metadata?: Record<string, unknown> | null }
}) => {
  const meta = (order?.metadata ?? {}) as OrderMeta
  const score = typeof meta.nps_score === "number" ? meta.nps_score : null
  const sentAt = typeof meta.nps_request_sent_at === "string" ? meta.nps_request_sent_at : null

  if (!score && !sentAt) return null

  return (
    <Container className="p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2">NPS</Heading>
        {score ? <Badge color={BADGE[score] ?? "blue"}>{score} / 5</Badge> : null}
      </div>
      <div className="px-6 pb-4 flex flex-col gap-y-2">
        {!score && sentAt ? (
          <Text size="xsmall" className="text-ui-fg-muted">
            Request sent {new Date(sentAt).toLocaleDateString("en-AU")} — no
            response yet.
          </Text>
        ) : null}
        {meta.nps_comment ? (
          <div className="rounded-md border border-ui-border-base bg-ui-bg-subtle p-3">
            <Text size="small" className="whitespace-pre-wrap">
              {meta.nps_comment}
            </Text>
          </div>
        ) : null}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default withWidgetBoundary(OrderNpsWidget, "order-nps")
