import { defineWidgetConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useCallback, useEffect, useMemo, useState } from "react"

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

type Scenario = "deposit" | "balance" | "manual" | "full"

type StripeLink = {
  id: string
  stripe_link_id: string
  url: string
  amount: number
  currency_code: string
  scenario: Scenario
  label: string | null
  status: "open" | "paid" | "deactivated" | "expired"
  paid_at: string | null
  stripe_payment_intent_id: string | null
  created_at: string
}

type LinksResponse = {
  configured: boolean
  links: StripeLink[]
}

const SCENARIO_OPTIONS: Array<{ value: Scenario; label: string }> = [
  { value: "deposit", label: "Deposit" },
  { value: "balance", label: "Balance" },
  { value: "manual", label: "Manual / one-off" },
  { value: "full", label: "Full payment" },
]

const STATUS_BADGE: Record<StripeLink["status"], { color: any; label: string }> = {
  open: { color: "blue", label: "Open" },
  paid: { color: "green", label: "Paid" },
  deactivated: { color: "grey", label: "Deactivated" },
  expired: { color: "red", label: "Expired" },
}

const OrderDepositWidget = ({ data: order }: { data: { id: string } }) => {
  const orderId = order?.id
  const [data, setData] = useState<Deposit | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [amountDollars, setAmountDollars] = useState("")
  const [balanceDue, setBalanceDue] = useState("")
  const [notes, setNotes] = useState("")

  // Stripe Payment Links state.
  const [links, setLinks] = useState<StripeLink[]>([])
  const [linksConfigured, setLinksConfigured] = useState<boolean>(true)
  const [linksLoading, setLinksLoading] = useState(true)
  const [creatingLink, setCreatingLink] = useState(false)
  const [linkAmount, setLinkAmount] = useState("")
  const [linkScenario, setLinkScenario] = useState<Scenario>("balance")
  const [linkLabel, setLinkLabel] = useState("")

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

  const loadLinks = useCallback(async () => {
    if (!orderId) return
    setLinksLoading(true)
    try {
      const res = await fetch(`/admin/orders/${orderId}/payment-link`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error(await res.text())
      const json = (await res.json()) as LinksResponse
      setLinks(json.links)
      setLinksConfigured(json.configured)
    } catch {
      // soft fail — keep section hidden
      setLinksConfigured(false)
    } finally {
      setLinksLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    load()
    loadLinks()
  }, [load, loadLinks])

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

  const totalLinkAmountPaid = useMemo(
    () =>
      links
        .filter((l) => l.status === "paid")
        .reduce((acc, l) => acc + Number(l.amount ?? 0), 0),
    [links]
  )

  const createLink = async () => {
    const cents = Math.round(Number.parseFloat(linkAmount || "0") * 100)
    if (cents < 50) {
      toast.error("Amount must be at least $0.50")
      return
    }
    setCreatingLink(true)
    try {
      const res = await fetch(`/admin/orders/${orderId}/payment-link`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount_cents: cents,
          scenario: linkScenario,
          label: linkLabel.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? "Failed to create link")
      }
      const json = (await res.json()) as { url: string }
      try {
        await navigator.clipboard.writeText(json.url)
        toast.success("Payment link created and copied to clipboard")
      } catch {
        toast.success("Payment link created")
      }
      setLinkAmount("")
      setLinkLabel("")
      await loadLinks()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create payment link")
    } finally {
      setCreatingLink(false)
    }
  }

  const deactivateLink = async (linkRowId: string) => {
    try {
      const res = await fetch(
        `/admin/orders/${orderId}/payment-link/${linkRowId}`,
        { method: "DELETE", credentials: "include" }
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error ?? "Failed to deactivate")
      }
      toast.success("Payment link deactivated")
      await loadLinks()
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to deactivate")
    }
  }

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied")
    } catch {
      toast.error("Could not copy")
    }
  }

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

      {/* Stripe payment links — auto-link customer payments to this order. */}
      <div className="border-t border-ui-border-base">
        <div className="px-6 py-4 flex items-center justify-between">
          <Heading level="h2" className="flex items-center">
            Stripe payment links
            <HelpTooltip
              text={{
                title: "Auto-linked Stripe payments",
                body: "Generate a Stripe-hosted payment URL for this order. When the customer pays, the webhook automatically records a captured payment against the order — no manual reconciliation.",
                bullets: [
                  "Create a link for the deposit, balance, or full payment.",
                  "Copy the URL and send it via email / Slack / SMS — the customer pays at their leisure.",
                  "On payment, the order's Payments section auto-fills.",
                  "Each link can only be paid once (Stripe enforces this).",
                  "Deactivate any unpaid link before it's used to revoke it.",
                ],
              }}
            />
          </Heading>
          {linksConfigured ? (
            <Badge color={totalLinkAmountPaid > 0 ? "green" : "grey"}>
              {currency} {totalLinkAmountPaid.toFixed(2)} via link
            </Badge>
          ) : null}
        </div>

        <div className="px-6 pb-4 flex flex-col gap-y-3">
          {!linksConfigured ? (
            <Text size="xsmall" className="text-ui-fg-muted">
              Stripe is not configured on this environment — set{" "}
              <code>STRIPE_API_KEY</code> + <code>STRIPE_PAYMENT_LINK_WEBHOOK_SECRET</code>{" "}
              to enable payment links.
            </Text>
          ) : (
            <>
              <div className="grid grid-cols-1 small:grid-cols-4 gap-x-3 gap-y-2 items-end">
                <div className="small:col-span-1">
                  <Label size="xsmall">Amount ({currency})</Label>
                  <Input
                    value={linkAmount}
                    onChange={(e) => setLinkAmount(e.target.value)}
                    placeholder={balanceDollars.toFixed(2)}
                    disabled={creatingLink}
                  />
                </div>
                <div className="small:col-span-1">
                  <Label size="xsmall">Scenario</Label>
                  <Select
                    value={linkScenario}
                    onValueChange={(v) => setLinkScenario(v as Scenario)}
                    disabled={creatingLink}
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {SCENARIO_OPTIONS.map((opt) => (
                        <Select.Item key={opt.value} value={opt.value}>
                          {opt.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
                <div className="small:col-span-2">
                  <Label size="xsmall">Label (optional)</Label>
                  <Input
                    value={linkLabel}
                    onChange={(e) => setLinkLabel(e.target.value)}
                    placeholder="e.g. 50% deposit for August job"
                    disabled={creatingLink}
                  />
                </div>
              </div>

              <div className="flex">
                <span className="flex-1" />
                <Button
                  size="small"
                  variant="primary"
                  onClick={createLink}
                  isLoading={creatingLink}
                  disabled={creatingLink || !linkAmount}
                >
                  Create payment link
                </Button>
              </div>

              <div className="mt-2">
                {linksLoading ? (
                  <Text size="xsmall" className="text-ui-fg-muted">
                    Loading links…
                  </Text>
                ) : links.length === 0 ? (
                  <Text size="xsmall" className="text-ui-fg-muted">
                    No payment links yet. Create one above and copy the URL to send to the customer.
                  </Text>
                ) : (
                  <div className="flex flex-col gap-y-2">
                    {links.map((link) => {
                      const badge = STATUS_BADGE[link.status]
                      const amountStr = `${link.currency_code.toUpperCase()} ${Number(
                        link.amount
                      ).toFixed(2)}`
                      return (
                        <div
                          key={link.id}
                          className="rounded-md border border-ui-border-base p-2 flex flex-col gap-y-1"
                        >
                          <div className="flex items-center gap-x-2 flex-wrap">
                            <Badge color={badge.color}>{badge.label}</Badge>
                            <Text weight="plus" size="small">
                              {amountStr}
                            </Text>
                            <Text size="xsmall" className="text-ui-fg-muted">
                              {SCENARIO_OPTIONS.find(
                                (o) => o.value === link.scenario
                              )?.label ?? link.scenario}
                              {link.label ? ` — ${link.label}` : ""}
                            </Text>
                            <span className="flex-1" />
                            {link.paid_at ? (
                              <Text size="xsmall" className="text-ui-fg-muted">
                                Paid{" "}
                                {new Date(link.paid_at).toLocaleString("en-AU", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                })}
                              </Text>
                            ) : (
                              <Text size="xsmall" className="text-ui-fg-muted">
                                Created{" "}
                                {new Date(link.created_at).toLocaleDateString(
                                  "en-AU"
                                )}
                              </Text>
                            )}
                          </div>
                          <div className="flex items-center gap-x-2">
                            <Input
                              value={link.url}
                              readOnly
                              className="font-mono text-xs"
                            />
                            <Button
                              size="small"
                              variant="secondary"
                              onClick={() => copyUrl(link.url)}
                            >
                              Copy
                            </Button>
                            <Button
                              size="small"
                              variant="secondary"
                              asChild
                            >
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Open
                              </a>
                            </Button>
                            {link.status === "open" ? (
                              <Button
                                size="small"
                                variant="danger"
                                onClick={() => deactivateLink(link.id)}
                              >
                                Deactivate
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default withWidgetBoundary(OrderDepositWidget, "order-deposit")
