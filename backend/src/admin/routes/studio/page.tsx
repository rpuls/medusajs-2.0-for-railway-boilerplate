import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Sparkles } from "@medusajs/icons"
import {
  Badge,
  Container,
  Heading,
  Text,
  toast,
} from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

import { HelpTooltip } from "../../components/reports/help-tooltip"

type StudioRow = {
  bucket: string
  customer_id: string | null
  email: string
  display_name: string
  detail: string
  href: string
  signal_at: string
}

type StudioBucket = {
  key: string
  label: string
  description: string
  rows: StudioRow[]
}

const StudioPage = () => {
  const [buckets, setBuckets] = useState<StudioBucket[] | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/admin/studio", { credentials: "include" })
      const json = (await res.json()) as { buckets?: StudioBucket[] }
      setBuckets(json.buckets ?? [])
    } catch {
      toast.error("Failed to load Studio")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1" className="flex items-center">
            Studio
            <HelpTooltip
              text={{
                title: "Studio",
                body: "A daily action list aggregated from data already in the system. Computed live each time you open the page — no cron, no caching. Designed to surface the customers and quotes most worth a personal touch today.",
                bullets: [
                  "VIPs who've gone quiet: tagged VIP with no order in 60+ days. A short call or hand-written email keeps the relationship warm before they drift to a competitor.",
                  "Notable first-time orders: significant first orders in the last 14 days (threshold = LTV_VIP_THRESHOLD_AUD ÷ 2). Hand-written thank-yous convert better than automated win-back later.",
                  "Quotes waiting on you: open quotes with no activity in 3+ days. Either bring them home or mark lost so the pipeline stays accurate.",
                  "Recent low NPS scores: customers who rated 1 or 2 in the last 30 days. Reach out before they churn quietly.",
                  "Each row clicks through to the underlying customer, order, or quote.",
                  "Top 20 per bucket — refresh by reloading the page.",
                ],
              }}
            />
          </Heading>
          <Text size="xsmall" className="text-ui-fg-muted">
            Customers and quotes worth your attention today.
          </Text>
        </div>
        <Badge color="blue">{buckets?.reduce((s, b) => s + b.rows.length, 0) ?? 0} signals</Badge>
      </div>

      <div className="px-6 py-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading || !buckets ? (
          <Text size="xsmall" className="text-ui-fg-muted">Loading…</Text>
        ) : (
          buckets.map((b) => (
            <div
              key={b.key}
              className="rounded-md border border-ui-border-base bg-ui-bg-base"
            >
              <div className="px-4 py-3 border-b border-ui-border-base">
                <div className="flex items-center justify-between">
                  <Heading level="h2" className="text-base">{b.label}</Heading>
                  <Badge color="grey">{b.rows.length}</Badge>
                </div>
                <Text size="xsmall" className="text-ui-fg-muted mt-1">
                  {b.description}
                </Text>
              </div>
              {b.rows.length === 0 ? (
                <Text size="xsmall" className="text-ui-fg-muted p-4">
                  Nothing right now — nice work.
                </Text>
              ) : (
                <ul className="divide-y">
                  {b.rows.map((r) => (
                    <li key={`${r.bucket}:${r.email}:${r.signal_at}`} className="px-4 py-3">
                      <a
                        href={r.href}
                        className="flex items-center justify-between hover:underline"
                      >
                        <div>
                          <Text weight="plus">{r.display_name}</Text>
                          <Text size="xsmall" className="text-ui-fg-muted">
                            {r.detail}
                          </Text>
                        </div>
                        <Text size="xsmall" className="text-ui-fg-muted">
                          {new Date(r.signal_at).toLocaleDateString("en-AU")}
                        </Text>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Studio",
  icon: Sparkles,
})

export default StudioPage
