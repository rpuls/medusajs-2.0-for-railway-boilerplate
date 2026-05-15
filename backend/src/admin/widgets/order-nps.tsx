import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Container, Heading, Text } from "@medusajs/ui"

import { HelpTooltip } from "../components/reports/help-tooltip"
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
        <Heading level="h2" className="flex items-center">
          NPS
          <HelpTooltip
            text={{
              title: "Net Promoter Score for this order",
              body: "1-5 rating submitted by the customer via the post-delivery NPS email. The email goes out NPS_REQUEST_DAYS_AFTER_DELIVERED days after this order's production stage transitions to 'delivered' (default 14 days).",
              bullets: [
                "Score 1-2 (red): unhappy customer — surface in Studio's 'recent low NPS' bucket and reach out.",
                "Score 3 (orange): neutral — worth a follow-up if pattern repeats.",
                "Score 4-5 (blue/green): happy customer — consider asking for a public review.",
                "Request-sent date shown when the email has fired but no response came back.",
                "Capture path is HMAC-signed so customers can't tamper with the score by tweaking the URL.",
              ],
            }}
          />
        </Heading>
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
