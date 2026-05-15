import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Container,
  Heading,
  Text,
} from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

import { HelpTooltip } from "../components/reports/help-tooltip"
import { withWidgetBoundary } from "../components/widget-error-boundary"

type Entry = {
  type: string
  at: string
  actor: string | null
  title: string
  detail?: string | null
  thumbnail_url?: string | null
}

const TYPE_COLORS: Record<string, "blue" | "green" | "orange" | "red" | "grey"> = {
  created: "blue",
  stage_change: "blue",
  photo_added: "green",
  reject_logged: "red",
  comment: "grey",
  nps_sent: "orange",
  nps_response: "green",
  tax_exempt_stamped: "orange",
  watcher_added: "grey",
}

const fmtTime = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const OrderTimelineWidget = ({ data: order }: { data: { id: string } }) => {
  const orderId = order?.id
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const res = await fetch(`/admin/orders/${orderId}/timeline`, {
        credentials: "include",
      })
      const json = (await res.json()) as { entries?: Entry[] }
      setEntries(json.entries ?? [])
    } catch {
      // soft fail
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    load()
  }, [load])

  if (!orderId) return null

  return (
    <Container className="p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2" className="flex items-center">
          Timeline
          <HelpTooltip
            text={{
              title: "Unified order timeline",
              body: "Every signal we capture about this order in one chronological feed: created → emails sent → staff comments → photos uploaded → stage changes → NPS response → rejects logged.",
              bullets: [
                "Newest first. Reload after taking an action elsewhere on the page to see your event surface here.",
                "Pulled live from order metadata + order_comment + production_reject tables — nothing is duplicated into a separate audit table.",
                "Tax-exempt snapshot entries show when the customer's tax-exempt flag was captured at order placement.",
              ],
            }}
          />
        </Heading>
        <Badge color="grey">{entries.length} events</Badge>
      </div>
      <div className="px-6 pb-4">
        {loading ? (
          <Text size="xsmall" className="text-ui-fg-muted">Loading…</Text>
        ) : entries.length === 0 ? (
          <Text size="xsmall" className="text-ui-fg-muted">No activity yet.</Text>
        ) : (
          <ol className="relative border-l border-ui-border-base ml-2">
            {entries.map((e, idx) => (
              <li key={`${e.type}:${e.at}:${idx}`} className="pl-4 pb-4 relative">
                <span
                  className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-ui-bg-base border-2"
                  style={{
                    borderColor: {
                      blue: "rgb(59 130 246)",
                      green: "rgb(16 185 129)",
                      orange: "rgb(245 158 11)",
                      red: "rgb(239 68 68)",
                      grey: "rgb(115 115 115)",
                    }[TYPE_COLORS[e.type] ?? "grey"],
                  }}
                />
                <div className="flex items-baseline justify-between gap-x-2">
                  <Text size="small" weight="plus">{e.title}</Text>
                  <Text size="xsmall" className="text-ui-fg-muted whitespace-nowrap">
                    {fmtTime(e.at)}
                  </Text>
                </div>
                {e.actor ? (
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {e.actor}
                  </Text>
                ) : null}
                {e.detail ? (
                  <Text size="xsmall" className="text-ui-fg-base mt-1 whitespace-pre-wrap">
                    {e.detail}
                  </Text>
                ) : null}
                {e.thumbnail_url ? (
                  <img
                    src={e.thumbnail_url}
                    alt=""
                    className="mt-2 max-w-[160px] rounded border border-ui-border-base"
                  />
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default withWidgetBoundary(OrderTimelineWidget, "order-timeline")
