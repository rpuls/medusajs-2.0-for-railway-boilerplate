import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Adjustments } from "@medusajs/icons"
import { Badge, Container, Heading, Text, toast } from "@medusajs/ui"
import { useCallback, useEffect, useMemo, useState } from "react"

import { HelpTooltip } from "../../components/reports/help-tooltip"

type Job = {
  order_id: string
  display_id: number | null
  email: string | null
  created_at: string
  deadline_at: string | null
  stage: string | null
  is_stale: boolean
  units: number
  decoration_method: string
  colours: string[]
  recipe_id: string | null
}

type Bucket = {
  key: string
  decoration_method: string
  colours: string[]
  jobs: Job[]
  total_units: number
  has_stale: boolean
}

const METHOD_LABELS: Record<string, string> = {
  screen_print: "Screen print",
  dtf: "DTF",
  embroidery: "Embroidery",
  uv: "UV",
  digital_transfer: "Digital transfer",
  vinyl: "Vinyl",
  unspecified: "Unspecified (review)",
  other: "Other",
}

const PrintQueuePage = () => {
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/admin/print-queue", { credentials: "include" })
      const json = (await res.json()) as { buckets?: Bucket[] }
      setBuckets(json.buckets ?? [])
    } catch {
      toast.error("Failed to load print queue")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const totals = useMemo(() => {
    const orderCount = new Set<string>()
    let units = 0
    let staleBuckets = 0
    for (const b of buckets) {
      units += b.total_units
      if (b.has_stale) staleBuckets += 1
      for (const j of b.jobs) orderCount.add(j.order_id)
    }
    return {
      orderCount: orderCount.size,
      units,
      bucketCount: buckets.length,
      staleBuckets,
    }
  }, [buckets])

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1" className="flex items-center">
          Print queue (suggested run order)
          <HelpTooltip
            text={{
              title: "Print queue optimizer",
              body: "Suggested run order for today's production work. Groups jobs by decoration method + colours so you change setups as few times as possible. Live-recomputed each time you open the page.",
              bullets: [
                "An order with multiple techniques (screen print + embroidery) appears in BOTH buckets.",
                "Stale buckets (red) float to the top — those are already overdue.",
                "Within a bucket, stale jobs first, then earliest deadline, then FIFO by created_at.",
                "'Unspecified (review)' bucket = orders without decoration metadata; spot-check before running.",
                "Recipe IDs link the operator straight to the right tuning notes for each job.",
                "This is a suggestion — feel free to override based on what the press is currently set up for.",
              ],
            }}
          />
        </Heading>
        <div className="flex items-center gap-x-2">
          {totals.staleBuckets > 0 ? (
            <Badge color="red">{totals.staleBuckets} stale</Badge>
          ) : null}
          <Badge color="blue">
            {totals.orderCount} orders · {totals.units} units · {totals.bucketCount} batches
          </Badge>
        </div>
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <Text size="xsmall" className="text-ui-fg-muted">Loading…</Text>
        ) : buckets.length === 0 ? (
          <Text size="xsmall" className="text-ui-fg-muted">
            Nothing queued. Either no in-flight orders, or staff need to advance stages.
          </Text>
        ) : (
          <ul className="flex flex-col gap-y-6">
            {buckets.map((b, idx) => (
              <li
                key={b.key}
                className={`rounded-md border ${
                  b.has_stale
                    ? "border-rose-400 bg-rose-50"
                    : "border-ui-border-base bg-ui-bg-base"
                }`}
              >
                <div className="px-4 py-3 border-b border-ui-border-base flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-x-3">
                    <span className="inline-flex items-center justify-center rounded-full bg-ui-bg-subtle text-ui-fg-base font-semibold w-7 h-7 text-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <Heading level="h2" className="text-base">
                        {METHOD_LABELS[b.decoration_method] ?? b.decoration_method}
                      </Heading>
                      <Text size="xsmall" className="text-ui-fg-muted">
                        {b.colours.length > 0
                          ? `Colours: ${b.colours.join(", ")}`
                          : "No colour metadata"}
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-2">
                    {b.has_stale ? <Badge color="red">Has stale</Badge> : null}
                    <Badge color="blue">{b.total_units} units</Badge>
                    <Badge color="grey">{b.jobs.length} jobs</Badge>
                  </div>
                </div>
                <ul className="divide-y divide-ui-border-base">
                  {b.jobs.map((j) => (
                    <li
                      key={`${b.key}:${j.order_id}`}
                      className={`px-4 py-2 ${j.is_stale ? "bg-rose-50" : ""}`}
                    >
                      <div className="flex items-baseline justify-between gap-x-2">
                        <a
                          href={`/app/orders/${j.order_id}`}
                          className="text-sm font-semibold hover:underline"
                        >
                          #{j.display_id ?? j.order_id.slice(-6)}
                        </a>
                        <div className="flex items-center gap-x-2 text-xs">
                          <span className="text-ui-fg-muted">{j.units} units</span>
                          {j.deadline_at ? (
                            <span className="text-ui-fg-base">
                              Due {new Date(j.deadline_at).toLocaleDateString("en-AU")}
                            </span>
                          ) : (
                            <span className="text-ui-fg-muted">No deadline</span>
                          )}
                          {j.is_stale ? <Badge color="red">Stale</Badge> : null}
                        </div>
                      </div>
                      <Text size="xsmall" className="text-ui-fg-muted">
                        {j.email ?? "guest"}
                        {j.stage ? ` · ${j.stage}` : ""}
                        {j.recipe_id ? ` · recipe ${j.recipe_id.slice(-6)}` : ""}
                      </Text>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Print queue",
  icon: Adjustments,
})

export default PrintQueuePage
