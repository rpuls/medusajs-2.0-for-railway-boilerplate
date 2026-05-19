import { Button, Heading, Label, Select, Text, toast } from "@medusajs/ui"
import { useState } from "react"

import type {
  POSCheckoutResult,
  POSCustomer,
  POSLineItem,
  POSRegion,
  POSSalesChannel,
} from "../types"
import { cartTotalCents, formatMoney } from "../utils"
import { CustomerLookup } from "./customer-lookup"

type Props = {
  sessionId: string
  items: POSLineItem[]
  region: POSRegion | null
  regions: POSRegion[]
  salesChannels: POSSalesChannel[]
  salesChannelId: string | null
  customer: POSCustomer | null
  onCustomerChange: (c: POSCustomer | null) => void
  onRegionChange: (id: string) => void
  onSalesChannelChange: (id: string) => void
  onCheckoutSuccess: (result: POSCheckoutResult) => void
}

export const CheckoutPanel = ({
  sessionId,
  items,
  region,
  regions,
  salesChannels,
  salesChannelId,
  customer,
  onCustomerChange,
  onRegionChange,
  onSalesChannelChange,
  onCheckoutSuccess,
}: Props) => {
  const [paying, setPaying] = useState<"cash" | "stripe_link" | null>(null)
  const currency = region?.currency_code.toUpperCase() ?? "AUD"
  const total = cartTotalCents(items)
  const canCheckout = items.length > 0 && Boolean(customer) && Boolean(region)

  const checkout = async (paymentMethod: "cash" | "stripe_link") => {
    if (!canCheckout) {
      toast.error("Add items and select a customer first")
      return
    }
    setPaying(paymentMethod)
    try {
      const res = await fetch("/admin/pos/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pos_session_id: sessionId,
          items: items.map((it) => ({
            kind: it.kind,
            variant_id: it.variant_id,
            product_id: it.product_id,
            product_title: it.product_title,
            variant_title: it.variant_title,
            quantity: it.quantity,
            unit_price_cents: it.unit_price_cents,
            metadata: it.metadata,
          })),
          customer_id: customer!.id,
          email: customer!.email,
          region_id: region!.id,
          sales_channel_id: salesChannelId,
          currency_code: region!.currency_code,
          payment_method: paymentMethod,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error ?? `Checkout failed (${res.status})`)
      }
      const result = (await res.json()) as POSCheckoutResult
      onCheckoutSuccess(result)
    } catch (err: any) {
      toast.error(err?.message ?? "Checkout failed")
    } finally {
      setPaying(null)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-ui-border-base">
        <Heading level="h2">Checkout</Heading>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        <div>
          <Label className="text-xs text-ui-fg-muted mb-1 block">
            Customer
          </Label>
          <CustomerLookup customer={customer} onSelect={onCustomerChange} />
        </div>

        <div>
          <Label className="text-xs text-ui-fg-muted mb-1 block">Region</Label>
          <Select value={region?.id ?? ""} onValueChange={onRegionChange}>
            <Select.Trigger>
              <Select.Value placeholder="Select region" />
            </Select.Trigger>
            <Select.Content>
              {regions.map((r) => (
                <Select.Item key={r.id} value={r.id}>
                  {r.name} ({r.currency_code.toUpperCase()})
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>

        {salesChannels.length > 0 && (
          <div>
            <Label className="text-xs text-ui-fg-muted mb-1 block">
              Sales channel
            </Label>
            <Select
              value={salesChannelId ?? ""}
              onValueChange={onSalesChannelChange}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select sales channel" />
              </Select.Trigger>
              <Select.Content>
                {salesChannels.map((s) => (
                  <Select.Item key={s.id} value={s.id}>
                    {s.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        )}
      </div>

      <div className="px-4 py-4 border-t border-ui-border-base bg-ui-bg-subtle">
        <div className="flex items-center justify-between mb-3">
          <Text size="base" className="font-semibold">
            Total
          </Text>
          <Heading level="h2">{formatMoney(total, currency)}</Heading>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="primary"
            isLoading={paying === "cash"}
            disabled={!canCheckout || paying !== null}
            onClick={() => checkout("cash")}
          >
            Pay cash
          </Button>
          <Button
            variant="secondary"
            isLoading={paying === "stripe_link"}
            disabled={!canCheckout || paying !== null}
            onClick={() => checkout("stripe_link")}
          >
            Card (QR link)
          </Button>
        </div>
        {!canCheckout && (
          <Text size="xsmall" className="text-ui-fg-muted mt-2 text-center">
            {items.length === 0
              ? "Add items first"
              : !customer
                ? "Select a customer"
                : !region
                  ? "Select a region"
                  : ""}
          </Text>
        )}
      </div>
    </div>
  )
}
