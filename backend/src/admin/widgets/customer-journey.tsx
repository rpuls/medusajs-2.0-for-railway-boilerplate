import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Badge, Container, Heading, Text } from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

import { HelpTooltip } from "../components/reports/help-tooltip"
import { withWidgetBoundary } from "../components/widget-error-boundary"

type JourneyEvent = {
  source: "order" | "posthog" | "nps" | "tag" | "design"
  at: string
  title: string
  detail?: string | null
  href?: string | null
}

const SOURCE_COLORS: Record<string, "blue" | "green" | "orange" | "grey"> = {
  order: "blue",
  nps: "green",
  tag: "orange",
  design: "blue",
  posthog: "grey",
}

const SOURCE_LABELS: Record<string, string> = {
  order: "Order",
  nps: "NPS",
  tag: "Tag",
  design: "Design",
  posthog: "Browse",
}

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })

const CustomerJourneyWidget = ({ data: customer }: { data: { id: string } }) => {
  const customerId = customer?.id
  const [events, setEvents] = useState<JourneyEvent[]>([])
  const [posthogConfigured, setPosthogConfigured] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!customerId) return
    setLoading(true)
    try {
      const res = await fetch(`/admin/customers/${customerId}/journey`, {
        credentials: "include",
      })
      const json = (await res.json()) as {
        events?: JourneyEvent[]
        posthog_configured?: boolean
      }
      setEvents(json.events ?? [])
      setPosthogConfigured(Boolean(json.posthog_configured))
    } catch {
      // soft fail
    } finally {
      setLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    load()
  }, [load])

  if (!customerId) return null

  return (
    <Container className="p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2" className="flex items-center">
          Customer journey
          <HelpTooltip
            text={{
              title: "Customer journey",
              body: "Every signal we have on this customer in one chronological feed — orders, NPS responses, tag changes, saved designs, and PostHog browsing events.",
              bullets: [
                "PostHog events are pulled live from your PostHog instance via POSTHOG_PERSONAL_API_KEY (already wired for SEO analytics — no extra cost).",
                "PostHog is keyed by the customer's email (matches how phIdentify is called in the storefront).",
                "Default window: last 30 days of PostHog events. Older orders/designs/tags are still included.",
                "If PostHog isn't configured, only Medusa-side events show.",
                "Use this before a sales call — see what the customer's been doing.",
              ],
            }}
          />
        </Heading>
        <Badge color={posthogConfigured ? "green" : "grey"}>
          {posthogConfigured ? "PostHog on" : "PostHog off"}
        </Badge>
      </div>
      <div className="px-6 pb-4">
        {loading ? (
          <Text size="xsmall" className="text-ui-fg-muted">Loading…</Text>
        ) : events.length === 0 ? (
          <Text size="xsmall" className="text-ui-fg-muted">
            No journey events captured yet.
          </Text>
        ) : (
          <ol className="relative border-l border-ui-border-base ml-2 max-h-[400px] overflow-y-auto pr-2">
            {events.map((e, idx) => (
              <li key={`${e.source}:${e.at}:${idx}`} className="pl-4 pb-3 relative">
                <span
                  className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-ui-bg-base border-2"
                  style={{
                    borderColor: {
                      blue: "rgb(59 130 246)",
                      green: "rgb(16 185 129)",
                      orange: "rgb(245 158 11)",
                      grey: "rgb(115 115 115)",
                    }[SOURCE_COLORS[e.source] ?? "grey"],
                  }}
                />
                <div className="flex items-baseline justify-between gap-x-2">
                  <Text size="small" weight="plus">
                    {e.href ? <a href={e.href} className="hover:underline">{e.title}</a> : e.title}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-muted whitespace-nowrap">
                    {fmtTime(e.at)}
                  </Text>
                </div>
                <div className="flex items-center gap-x-2 mt-0.5">
                  <Badge color={SOURCE_COLORS[e.source] ?? "grey"}>
                    {SOURCE_LABELS[e.source] ?? e.source}
                  </Badge>
                  {e.detail ? (
                    <Text size="xsmall" className="text-ui-fg-muted truncate">
                      {e.detail}
                    </Text>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.details.after",
})

export default withWidgetBoundary(CustomerJourneyWidget, "customer-journey")
