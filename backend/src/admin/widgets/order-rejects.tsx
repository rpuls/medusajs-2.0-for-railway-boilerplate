import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Plus, Trash } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

import { HelpTooltip } from "../components/reports/help-tooltip"
import { withWidgetBoundary } from "../components/widget-error-boundary"

type Reject = {
  id: string
  order_id: string
  qty: number
  reason: string
  notes: string | null
  cost_estimate_cents: number
  currency_code: string
  created_at: string
  logged_by: string | null
}

const REASON_LABELS: Record<string, string> = {
  misprint: "Misprint",
  wrong_size: "Wrong size",
  damaged_blank: "Damaged blank",
  supplier_defect: "Supplier defect",
  artwork_error: "Artwork error",
  other: "Other",
}

const REASONS = Object.keys(REASON_LABELS)

const OrderRejectsWidget = ({ data: order }: { data: { id: string } }) => {
  const orderId = order?.id
  const [rejects, setRejects] = useState<Reject[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [open, setOpen] = useState(false)
  const [qty, setQty] = useState("1")
  const [reason, setReason] = useState<string>("misprint")
  const [costDollars, setCostDollars] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const res = await fetch(`/admin/orders/${orderId}/rejects`, {
        credentials: "include",
      })
      const json = (await res.json()) as { rejects?: Reject[] }
      setRejects(json.rejects ?? [])
    } catch {
      // soft fail
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    load()
  }, [load])

  const submit = async () => {
    const qtyNum = Number.parseInt(qty, 10)
    if (!Number.isFinite(qtyNum) || qtyNum < 1) {
      toast.error("Enter a quantity ≥ 1")
      return
    }
    const costCents =
      costDollars.trim().length > 0
        ? Math.round(Number.parseFloat(costDollars) * 100)
        : 0
    if (Number.isNaN(costCents)) {
      toast.error("Cost must be a number (or blank)")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/admin/orders/${orderId}/rejects`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qty: qtyNum,
          reason,
          cost_estimate_cents: costCents,
          notes: notes.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("Reject logged")
      setOpen(false)
      setQty("1")
      setReason("misprint")
      setCostDollars("")
      setNotes("")
      await load()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to log reject")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this reject entry?")) return
    try {
      const res = await fetch(
        `/admin/orders/${orderId}/rejects?id=${encodeURIComponent(id)}`,
        { method: "DELETE", credentials: "include" }
      )
      if (!res.ok) throw new Error(await res.text())
      await load()
    } catch (err: any) {
      toast.error(err?.message ?? "Delete failed")
    }
  }

  if (!orderId) return null

  const totalQty = rejects.reduce((s, r) => s + r.qty, 0)
  const totalCostCents = rejects.reduce((s, r) => s + r.cost_estimate_cents, 0)

  return (
    <Container className="p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2" className="flex items-center">
          Rejects / spoilage
          <HelpTooltip
            text={{
              title: "Production rejects",
              body: "Log every garment scrapped during production for this order. Drives waste reporting + supplier defect tracking (see /app/production-rejects).",
              bullets: [
                "Reason guides the report: misprints surface operator drift; damaged_blank and supplier_defect surface bad batches to chase.",
                "Cost estimate uses minor units internally (cents) but the form accepts dollars.",
                "Logged-by stamps the staff member so the line is auditable.",
                "Deletes are soft — the row stays in the database; only the active view is affected.",
              ],
            }}
          />
        </Heading>
        <div className="flex items-center gap-x-2">
          {rejects.length > 0 ? (
            <Badge color="red">
              {totalQty} units · ${(totalCostCents / 100).toFixed(2)}
            </Badge>
          ) : (
            <Badge color="grey">No rejects</Badge>
          )}
          <Button size="small" variant="secondary" onClick={() => setOpen((v) => !v)}>
            <Plus className="mr-1" /> {open ? "Cancel" : "Log a reject"}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="px-6 pb-4 flex flex-col gap-y-2 border-b border-ui-border-base">
          <div className="grid grid-cols-1 small:grid-cols-3 gap-x-3 gap-y-2">
            <div>
              <Label size="xsmall">Qty</Label>
              <Input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <Label size="xsmall">Reason</Label>
              <Select value={reason} onValueChange={(v) => setReason(v)}>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {REASONS.map((r) => (
                    <Select.Item key={r} value={r}>
                      {REASON_LABELS[r]}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
            <div>
              <Label size="xsmall">Cost ($AUD, blank = unknown)</Label>
              <Input
                value={costDollars}
                onChange={(e) => setCostDollars(e.target.value)}
                placeholder="e.g. 12.50"
                disabled={saving}
              />
            </div>
          </div>
          <div>
            <Label size="xsmall">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="What happened?"
              disabled={saving}
            />
          </div>
          <div className="flex justify-end">
            <Button size="small" onClick={submit} disabled={saving}>
              Log reject
            </Button>
          </div>
        </div>
      ) : null}

      <div className="px-6 py-4">
        {loading ? (
          <Text size="xsmall" className="text-ui-fg-muted">Loading…</Text>
        ) : rejects.length === 0 ? (
          <Text size="xsmall" className="text-ui-fg-muted">
            No rejects logged for this order.
          </Text>
        ) : (
          <ul className="divide-y">
            {rejects.map((r) => (
              <li key={r.id} className="py-2 flex items-start justify-between">
                <div className="flex flex-col">
                  <Text size="small" weight="plus">
                    {r.qty} × {REASON_LABELS[r.reason] ?? r.reason}
                  </Text>
                  {r.cost_estimate_cents > 0 ? (
                    <Text size="xsmall" className="text-ui-fg-muted">
                      Cost ${(r.cost_estimate_cents / 100).toFixed(2)} · {new Date(r.created_at).toLocaleDateString("en-AU")}
                      {r.logged_by ? ` · ${r.logged_by}` : ""}
                    </Text>
                  ) : (
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {new Date(r.created_at).toLocaleDateString("en-AU")}
                      {r.logged_by ? ` · ${r.logged_by}` : ""}
                    </Text>
                  )}
                  {r.notes ? (
                    <Text size="xsmall" className="whitespace-pre-wrap mt-1">
                      {r.notes}
                    </Text>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => remove(r.id)}
                  className="text-ui-fg-muted hover:text-ui-tag-red-icon"
                  aria-label="Delete"
                >
                  <Trash />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default withWidgetBoundary(OrderRejectsWidget, "order-rejects")
