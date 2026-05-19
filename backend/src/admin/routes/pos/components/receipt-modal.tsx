import { Button, FocusModal, Heading, Text } from "@medusajs/ui"
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
 * Receipt + payment-status modal. For cash, this is a confirmation.
 * For Stripe Payment Link, it shows the QR + URL and polls the order
 * to flip to "Payment received" the moment the webhook lands.
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

  // Poll order payment status if we're waiting on a Stripe Payment
  // Link. Same /admin/orders/:id/payment-link endpoint the deposit
  // widget uses; the link's `status` flips to `paid` once the
  // webhook (backend/src/api/hooks/stripe-payment-link/route.ts)
  // marks the payment collection.
  useEffect(() => {
    setPaid(result?.payment.status === "paid")
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

/**
 * Self-contained QR renderer. Avoids adding a `qrcode` dep — uses the
 * widely-available `chart.googleapis.com` QR endpoint. (Acceptable
 * for an in-store admin tool; not a third-party leak vector for
 * customer data — only the public Stripe Payment Link URL leaves the
 * box, and the customer's about to open it anyway.)
 */
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
