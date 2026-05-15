import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Switch,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useCallback, useEffect, useState } from "react"

import { HelpTooltip } from "../components/reports/help-tooltip"
import { withWidgetBoundary } from "../components/widget-error-boundary"

type Deposit = {
  deposit_amount_cents: number
  deposit_paid: boolean
  deposit_paid_at: string | null
  balance_due_at: string | null
  notes: string | null
  order_total: number | string
  currency_code: string
}

const OrderDepositWidget = ({ data: order }: { data: { id: string } }) => {
  const orderId = order?.id
  const [data, setData] = useState<Deposit | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [amountDollars, setAmountDollars] = useState("")
  const [balanceDue, setBalanceDue] = useState("")
  const [notes, setNotes] = useState("")

  const load = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    try {
      const res = await fetch(`/admin/orders/${orderId}/deposit`, {
        credentials: "include",
      })
      const json = (await res.json()) as Deposit
      setData(json)
      setAmountDollars(
        json.deposit_amount_cents
          ? (json.deposit_amount_cents / 100).toFixed(2)
          : ""
      )
      setBalanceDue(json.balance_due_at ? json.balance_due_at.slice(0, 10) : "")
      setNotes(json.notes ?? "")
    } catch {
      // soft fail
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    load()
  }, [load])

  const save = async (overrides?: { deposit_paid?: boolean }) => {
    setSaving(true)
    try {
      const cents = Math.max(
        0,
        Math.round(Number.parseFloat(amountDollars || "0") * 100)
      )
      const res = await fetch(`/admin/orders/${orderId}/deposit`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deposit_amount_cents: cents,
          balance_due_at: balanceDue ? new Date(balanceDue).toISOString() : null,
          notes: notes.trim() || undefined,
          ...(overrides ?? {}),
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      await load()
      toast.success("Saved")
    } catch (err: any) {
      toast.error(err?.message ?? "Save failed")
    } finally {
      setSaving(false)
    }
  }

  if (!orderId) return null

  const total =
    typeof data?.order_total === "number"
      ? data.order_total
      : typeof data?.order_total === "string"
        ? Number.parseFloat(data.order_total)
        : 0
  const currency = (data?.currency_code ?? "AUD").toUpperCase()
  const depositDollars = (data?.deposit_amount_cents ?? 0) / 100
  const balanceDollars = Math.max(0, total - depositDollars)

  return (
    <Container className="p-0">
      <div className="px-6 py-4 flex items-center justify-between">
        <Heading level="h2" className="flex items-center">
          Deposit & balance
          <HelpTooltip
            text={{
              title: "Multi-step deposit tracking",
              body: "Lightweight bookkeeping for orders paid in stages (deposit upfront, balance on completion). Records the amount paid + when the balance is due. The actual money movement still happens via your normal Stripe / manual flow.",
              bullets: [
                "Set the deposit amount the customer has paid upfront.",
                "Toggle Paid when the deposit clears. The toggle stamps deposit_paid_at automatically.",
                "Set balance_due_at to flag when the rest is owed.",
                "All fields are stored on order.metadata, surfaced on the timeline.",
                "If deposit + balance = total, you're settled.",
              ],
            }}
          />
        </Heading>
        {data?.deposit_paid ? (
          <Badge color="green">Deposit paid</Badge>
        ) : (
          <Badge color="grey">Awaiting deposit</Badge>
        )}
      </div>

      <div className="px-6 pb-4 flex flex-col gap-y-3">
        {loading ? (
          <Text size="xsmall" className="text-ui-fg-muted">Loading…</Text>
        ) : (
          <>
            <div className="grid grid-cols-1 small:grid-cols-3 gap-x-3 gap-y-2 text-sm">
              <div className="rounded-md border border-ui-border-base bg-ui-bg-subtle p-2">
                <Text size="xsmall" className="text-ui-fg-muted uppercase">Total</Text>
                <Text weight="plus">{currency} {total.toFixed(2)}</Text>
              </div>
              <div className="rounded-md border border-ui-border-base bg-ui-bg-subtle p-2">
                <Text size="xsmall" className="text-ui-fg-muted uppercase">Deposit</Text>
                <Text weight="plus">{currency} {depositDollars.toFixed(2)}</Text>
              </div>
              <div className="rounded-md border border-ui-border-base bg-ui-bg-subtle p-2">
                <Text size="xsmall" className="text-ui-fg-muted uppercase">Balance</Text>
                <Text weight="plus">{currency} {balanceDollars.toFixed(2)}</Text>
              </div>
            </div>

            <div className="grid grid-cols-1 small:grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <Label size="xsmall">Deposit amount ({currency})</Label>
                <Input
                  value={amountDollars}
                  onChange={(e) => setAmountDollars(e.target.value)}
                  placeholder="0.00"
                  disabled={saving}
                />
              </div>
              <div>
                <Label size="xsmall">Balance due date</Label>
                <Input
                  type="date"
                  value={balanceDue}
                  onChange={(e) => setBalanceDue(e.target.value)}
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
                placeholder="e.g. 50% upfront via bank transfer, balance on collection"
                disabled={saving}
              />
            </div>

            <div className="flex items-center gap-x-3">
              <Switch
                id="deposit-paid"
                checked={data?.deposit_paid ?? false}
                onCheckedChange={(v) => save({ deposit_paid: v })}
                disabled={saving}
              />
              <Label htmlFor="deposit-paid">Deposit received</Label>
              {data?.deposit_paid_at ? (
                <Text size="xsmall" className="text-ui-fg-muted">
                  {new Date(data.deposit_paid_at).toLocaleDateString("en-AU")}
                </Text>
              ) : null}
              <span className="flex-1" />
              <Button size="small" onClick={() => save()} disabled={saving}>
                Save
              </Button>
            </div>
          </>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default withWidgetBoundary(OrderDepositWidget, "order-deposit")
