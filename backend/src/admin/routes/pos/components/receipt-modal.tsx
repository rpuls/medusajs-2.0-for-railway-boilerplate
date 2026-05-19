import { Button, FocusModal, Heading, Input, Text, toast } from "@medusajs/ui"
import { CheckCircle, ArrowPath } from "@medusajs/icons"
import { useEffect, useState } from "react"

import type { POSCheckoutResult, POSLineItem, POSRegion } from "../types"
import { cartTotalCents, formatMoney, lineSubtotalCents } from "../utils"

type Props = {
  open: boolean
  result: POSCheckoutResult | null
  items: POSLineItem[]
  region: POSRegion | null
  onNewTransaction: () => void
  onClose: () => void
}

/**
 * Receipt + payment-status modal. Cash sales open paid; stripe-link
 * sales poll the order until the webhook flips the link status. Two
 * post-sale shortcuts:
 *
 *  - "Send receipt" — emails the order-placed template to whatever
 *    address staff types (typically the customer's email if it wasn't
 *    captured upfront).
 *  - "Customer walked out with goods" — fast-forwards the order
 *    through every production track to `delivered`, emitting the
 *    stage-changed events so subscribers (emails, automation,
 *    audit) fire as if staff had clicked through stage-by-stage.
 */
export const ReceiptModal = ({
  open,
  result,
  items,
  region,
  onNewTransaction,
  onClose,
}: Props) => {
  const [paid, setPaid] = useState(false)
  const [receiptEmail, setReceiptEmail] = useState("")
  const [sendingReceipt, setSendingReceipt] = useState(false)
  const [fastForwarding, setFastForwarding] = useState(false)
  const [fastForwarded, setFastForwarded] = useState(false)

  // Poll the Stripe Payment Link status while we wait on the customer
  // to scan + pay. The link's `status` flips to `paid` once the
  // webhook (backend/src/api/hooks/stripe-payment-link/route.ts)
  // marks the payment collection.
  useEffect(() => {
    setPaid(result?.payment.status === "paid")
    setFastForwarded(false)
    if (!result || result.payment.status === "paid") return
    if (result.payment.method !== "stripe_link") return

    let cancelled = false
    const tick = async () => {
      try {
        const res = await fetch(
          `/admin/orders/${result.order.id}/payment-link`,
          { credentials: "include" }
        )
        if (!res.ok) return
        const json = await res.json()
        const link = (json.links ?? []).find(
          (l: any) => l.id === result.payment.payment_link_id
        )
        if (!cancelled && link?.status === "paid") setPaid(true)
      } catch {
        /* ignore — poll resumes next tick */
      }
    }
    const id = window.setInterval(tick, 3000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [result])

  const sendReceipt = async () => {
    if (!result) return
    const addr = receiptEmail.trim()
    if (!addr || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) {
      toast.error("Enter a valid email")
      return
    }
    setSendingReceipt(true)
    try {
      const res = await fetch(
        `/admin/pos/orders/${result.order.id}/email-receipt`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: addr }),
        }
      )
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error ?? `Send failed (${res.status})`)
      }
      toast.success(`Receipt sent to ${addr}`)
      setReceiptEmail("")
    } catch (err: any) {
      toast.error(err?.message ?? "Send failed")
    } finally {
      setSendingReceipt(false)
    }
  }

  const fastForward = async () => {
    if (!result) return
    setFastForwarding(true)
    try {
      const res = await fetch(
        `/admin/pos/orders/${result.order.id}/fast-forward`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target: "delivered",
            note: "Walk-in customer collected goods at POS",
          }),
        }
      )
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error ?? `Fast-forward failed (${res.status})`)
      }
      setFastForwarded(true)
      toast.success("Order marked delivered")
    } catch (err: any) {
      toast.error(err?.message ?? "Fast-forward failed")
    } finally {
      setFastForwarding(false)
    }
  }

  if (!result) return null
  const currency =
    result.order.currency_code?.toUpperCase() ??
    region?.currency_code.toUpperCase() ??
    "AUD"
  const total = Math.round(result.order.total * 100)

  return (
    <FocusModal open={open} onOpenChange={(o) => !o && onClose()}>
      <FocusModal.Content>
        <FocusModal.Header>
          <Heading level="h2">
            Order #{result.order.display_id ?? result.order.id.slice(-6)}
          </Heading>
        </FocusModal.Header>

        <FocusModal.Body className="px-8 py-6 overflow-y-auto">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ui-tag-green-bg mb-3">
                {paid ? (
                  <CheckCircle className="text-ui-tag-green-icon" />
                ) : (
                  <ArrowPath className="text-ui-fg-muted animate-pulse" />
                )}
              </div>
              <Heading level="h1">{formatMoney(total, currency)}</Heading>
              <Text className="text-ui-fg-muted">
                {paid
                  ? result.payment.method === "cash"
                    ? "Cash received"
                    : "Payment received"
                  : "Waiting for customer to complete card payment…"}
              </Text>
            </div>

            {result.payment.method === "stripe_link" &&
              result.payment.payment_link_url &&
              !paid && (
                <div className="border border-ui-border-base rounded-lg p-4 text-center">
                  <Text size="small" className="text-ui-fg-muted mb-2">
                    Customer scans this QR to pay
                  </Text>
                  <PaymentQR url={result.payment.payment_link_url} />
                  <Text size="xsmall" className="text-ui-fg-muted mt-2 break-all">
                    {result.payment.payment_link_url}
                  </Text>
                  <Button
                    variant="secondary"
                    size="small"
                    className="mt-2"
                    onClick={() => {
                      void navigator.clipboard.writeText(
                        result.payment.payment_link_url!
                      )
                    }}
                  >
                    Copy link
                  </Button>
                </div>
              )}

            <div className="border-t border-ui-border-base pt-4">
              <Heading level="h3" className="text-sm mb-2">
                Items
              </Heading>
              <ul className="space-y-1">
                {items.map((it) => (
                  <li
                    key={it.id}
                    className="flex justify-between text-sm gap-3"
                  >
                    <span className="truncate flex-1">
                      {it.quantity}× {it.product_title}
                      {it.variant_title && (
                        <span className="text-ui-fg-muted">
                          {" "}
                          — {it.variant_title}
                        </span>
                      )}
                    </span>
                    <span className="text-ui-fg-muted">
                      {formatMoney(lineSubtotalCents(it), currency)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-semibold mt-3 pt-3 border-t border-ui-border-base">
                <span>Total</span>
                <span>{formatMoney(cartTotalCents(items), currency)}</span>
              </div>
            </div>

            <div className="border-t border-ui-border-base pt-4 space-y-3">
              <div>
                <Text size="small" className="font-medium mb-1">
                  Email receipt
                </Text>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="customer@example.com"
                    value={receiptEmail}
                    onChange={(e) => setReceiptEmail(e.target.value)}
                  />
                  <Button
                    size="small"
                    isLoading={sendingReceipt}
                    disabled={sendingReceipt}
                    onClick={sendReceipt}
                  >
                    Send
                  </Button>
                </div>
                <Text size="xsmall" className="text-ui-fg-muted mt-1">
                  Use this if the customer didn&apos;t give you an email upfront.
                </Text>
              </div>

              <div>
                <Button
                  variant={fastForwarded ? "secondary" : "primary"}
                  size="small"
                  className="w-full"
                  isLoading={fastForwarding}
                  disabled={fastForwarding || fastForwarded}
                  onClick={fastForward}
                >
                  {fastForwarded
                    ? "✓ Marked delivered"
                    : "Customer walked out with goods → mark delivered"}
                </Button>
                <Text size="xsmall" className="text-ui-fg-muted mt-1">
                  Fast-forwards through every production stage. Use only for stock-item walk-out pickups.
                </Text>
              </div>
            </div>
          </div>
        </FocusModal.Body>

        <FocusModal.Footer>
          <div className="flex gap-2 w-full justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                window.open(`/app/orders/${result.order.id}`, "_blank")
              }}
            >
              Open order
            </Button>
            <Button onClick={onNewTransaction}>New transaction</Button>
          </div>
        </FocusModal.Footer>
      </FocusModal.Content>
    </FocusModal>
  )
}

const PaymentQR = ({ url }: { url: string }) => {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    url
  )}`
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Payment QR code"
      width={240}
      height={240}
      className="mx-auto"
    />
  )
}
