import { Badge, Button, Heading, IconButton, Text } from "@medusajs/ui"
import { Trash, Plus, Minus, ShoppingBag } from "@medusajs/icons"

import type { POSLineItem, POSRegion } from "../types"
import { cartTotalCents, formatMoney, lineSubtotalCents } from "../utils"

type Props = {
  items: POSLineItem[]
  region: POSRegion | null
  onUpdate: (id: string, patch: Partial<POSLineItem>) => void
  onRemove: (id: string) => void
}

export const CartPanel = ({ items, region, onUpdate, onRemove }: Props) => {
  const currency = region?.currency_code.toUpperCase() ?? "AUD"
  const total = cartTotalCents(items)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-ui-border-base flex items-center gap-2">
        <ShoppingBag />
        <Heading level="h2">Cart</Heading>
        <Badge size="small" className="ml-auto">
          {items.length} {items.length === 1 ? "item" : "items"}
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {items.length === 0 && (
          <Text size="small" className="text-ui-fg-muted py-6 text-center">
            Add products from the left, or open the customizer for custom work.
          </Text>
        )}

        <ul className="space-y-3">
          {items.map((it) => (
            <li
              key={it.id}
              className="border border-ui-border-base rounded-lg p-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {it.kind === "customizer" && (
                      <Badge size="2xsmall" color="purple">
                        Custom
                      </Badge>
                    )}
                    <Text size="small" className="font-medium truncate">
                      {it.product_title}
                    </Text>
                  </div>
                  {it.variant_title && (
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {it.variant_title}
                    </Text>
                  )}
                </div>
                <IconButton
                  size="small"
                  variant="transparent"
                  onClick={() => onRemove(it.id)}
                  aria-label="Remove line"
                >
                  <Trash />
                </IconButton>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <IconButton
                    size="small"
                    variant="transparent"
                    disabled={it.quantity <= 1}
                    onClick={() =>
                      onUpdate(it.id, {
                        quantity: Math.max(1, it.quantity - 1),
                      })
                    }
                    aria-label="Decrease quantity"
                  >
                    <Minus />
                  </IconButton>
                  <Text size="small" className="w-8 text-center">
                    {it.quantity}
                  </Text>
                  <IconButton
                    size="small"
                    variant="transparent"
                    onClick={() =>
                      onUpdate(it.id, { quantity: it.quantity + 1 })
                    }
                    aria-label="Increase quantity"
                  >
                    <Plus />
                  </IconButton>
                </div>

                <div className="text-right">
                  <Text size="small" className="font-medium">
                    {formatMoney(lineSubtotalCents(it), currency)}
                  </Text>
                  {it.quantity > 1 && it.unit_price_cents !== null && (
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {formatMoney(it.unit_price_cents, currency)} ea
                    </Text>
                  )}
                </div>
              </div>

              {it.kind === "customizer" && (
                <Text size="xsmall" className="text-ui-fg-muted mt-2">
                  Custom design from POS customizer
                </Text>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="px-4 py-4 border-t border-ui-border-base bg-ui-bg-subtle">
        <div className="flex items-center justify-between mb-1">
          <Text size="small" className="text-ui-fg-muted">
            Subtotal (tax-inclusive)
          </Text>
          <Text size="small">{formatMoney(total, currency)}</Text>
        </div>
        <div className="flex items-center justify-between">
          <Text size="base" className="font-semibold">
            Total
          </Text>
          <Heading level="h2">{formatMoney(total, currency)}</Heading>
        </div>
      </div>
    </div>
  )
}
