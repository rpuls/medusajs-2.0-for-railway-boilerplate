import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Trash } from "@medusajs/icons"
import {
  Badge,
  Container,
  Heading,
  Input,
  Label,
  Text,
  toast,
} from "@medusajs/ui"
import { useCallback, useEffect, useMemo, useState } from "react"

import { HelpTooltip } from "../../components/reports/help-tooltip"

type RejectRow = {
  id: string
  order_id: string
  product_id?: string | null
  qty: number
  reason: string
  notes?: string | null
  cost_estimate_cents: number
  currency_code: string
  supplier_brand_id?: string | null
  created_at: string
}

type Response = {
  rows: RejectRow[]
  by_reason: Record<string, { qty: number; cost_cents: number }>
  by_supplier_brand: Record<string, { name: string; qty: number; cost_cents: number }>
  totals: { qty: number; cost_cents: number }
}

const REASON_LABELS: Record<string, string> = {
  misprint: "Misprint",
  wrong_size: "Wrong size",
  damaged_blank: "Damaged blank",
  supplier_defect: "Supplier defect",
  artwork_error: "Artwork error",
  other: "Other",
}

const fmtMoney = (cents: number) => `$${(cents / 100).toFixed(2)} AUD`

const ProductionRejectsPage = () => {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const monthAgo = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().slice(0, 10)
  }, [])

  const [since, setSince] = useState(monthAgo)
  const [until, setUntil] = useState(today)
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (since) params.set("since", since)
      if (until) params.set("until", until)
      const res = await fetch(`/admin/production-rejects?${params.toString()}`, {
        credentials: "include",
      })
      const json = (await res.json()) as Response
      setData(json)
    } catch {
      toast.error("Failed to load report")
    } finally {
      setLoading(false)
    }
  }, [since, until])

  useEffect(() => {
    load()
  }, [load])

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1" className="flex items-center">
          Rejects / spoilage
          <HelpTooltip
            text={{
              title: "Rejects & spoilage report",
              body: "Aggregates every reject row logged on order detail pages. Use this to surface drift (rising misprint counts), bad supplier batches (damaged_blank or supplier_defect spikes), and the dollar value of waste over time.",
              bullets: [
                "Date range defaults to the last 30 days. Set it wider for trend analysis.",
                "Reason breakdown highlights what's causing waste — misprint = operator, supplier_defect = supplier, artwork_error = customer.",
                "Supplier breakdown only shows rejects where a brand was attached when logging. Backfill historical rows by editing them.",
                "Totals are units × cost_estimate, summed in AUD (cents internally).",
              ],
            }}
          />
        </Heading>
        <div className="flex items-center gap-x-3">
          <div>
            <Label size="xsmall">From</Label>
            <Input
              type="date"
              value={since}
              onChange={(e) => setSince(e.target.value)}
            />
          </div>
          <div>
            <Label size="xsmall">To</Label>
            <Input
              type="date"
              value={until}
              onChange={(e) => setUntil(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="px-6 py-4 grid grid-cols-1 small:grid-cols-3 gap-3">
        <SummaryTile label="Total units" value={String(data?.totals.qty ?? 0)} />
        <SummaryTile
          label="Total cost"
          value={fmtMoney(data?.totals.cost_cents ?? 0)}
        />
        <SummaryTile
          label="Records"
          value={String(data?.rows.length ?? 0)}
        />
      </div>

      <div className="px-6 py-4 grid grid-cols-1 small:grid-cols-2 gap-6">
        <div>
          <Heading level="h2" className="text-base">By reason</Heading>
          {loading || !data ? (
            <Text size="xsmall" className="text-ui-fg-muted mt-2">Loading…</Text>
          ) : Object.keys(data.by_reason).length === 0 ? (
            <Text size="xsmall" className="text-ui-fg-muted mt-2">No rejects in this window.</Text>
          ) : (
            <ul className="mt-2 divide-y">
              {Object.entries(data.by_reason)
                .sort(([, a], [, b]) => b.qty - a.qty)
                .map(([reason, totals]) => (
                  <li key={reason} className="py-2 flex items-center justify-between">
                    <Text>{REASON_LABELS[reason] ?? reason}</Text>
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {totals.qty} units · {fmtMoney(totals.cost_cents)}
                    </Text>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div>
          <Heading level="h2" className="text-base">By supplier</Heading>
          {loading || !data ? (
            <Text size="xsmall" className="text-ui-fg-muted mt-2">Loading…</Text>
          ) : Object.keys(data.by_supplier_brand).length === 0 ? (
            <Text size="xsmall" className="text-ui-fg-muted mt-2">
              No supplier attribution yet — when logging a reject, add the supplier brand to see this report populate.
            </Text>
          ) : (
            <ul className="mt-2 divide-y">
              {Object.entries(data.by_supplier_brand)
                .sort(([, a], [, b]) => b.qty - a.qty)
                .map(([id, totals]) => (
                  <li key={id} className="py-2 flex items-center justify-between">
                    <Text>{totals.name}</Text>
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {totals.qty} units · {fmtMoney(totals.cost_cents)}
                    </Text>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </Container>
  )
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ui-border-base bg-ui-bg-subtle p-3">
      <Text size="xsmall" className="text-ui-fg-muted uppercase">{label}</Text>
      <Text size="large" weight="plus" className="mt-1">{value}</Text>
    </div>
  )
}

export default ProductionRejectsPage
