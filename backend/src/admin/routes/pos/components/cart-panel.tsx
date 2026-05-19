import { Badge, Heading, IconButton, Input, Text } from "@medusajs/ui"
import { Trash, Plus, Minus, ShoppingBag, PencilSquare } from "@medusajs/icons"
import { useState } from "react"

import type { POSDiscount, POSLineItem, POSRegion } from "../types"
import { cartTotalCents, formatMoney, lineSubtotalCents } from "../utils"

type Props = {
  items: POSLineItem[]
  region: POSRegion | null
  discount: POSDiscount
  onUpdate: (id: string, patch: Partial<POSLineItem>) => void
  onRemove: (id: string) => void
}

export const CartPanel = ({
  items,
  region,
  discount,
  onUpdate,
  onRemove,
}: Props) => {
  const currency = region?.currency_code.toUpperCase() ?? "AUD"
  const subtotal = cartTotalCents(items)
  const discountTotal = Math.max(0, discount.manual_discount_cents)
  const total = Math.max(0, subtotal - discountTotal)

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
            <CartLine
              key={it.id}
              item={it}
              currency={currency}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </ul>
      </div>

      <div className="px-4 py-4 border-t border-ui-border-base bg-ui-bg-subtle">
        <div className="flex items-center justify-between mb-1">
          <Text size="small" className="text-ui-fg-muted">
            Subtotal
          </Text>
          <Text size="small">{formatMoney(subtotal, currency)}</Text>
        </div>
        {discount.promo_codes.length > 0 && (
          <div className="flex items-center justify-between mb-1">
            <Text size="small" className="text-ui-fg-muted">
              Promo: {discount.promo_codes.join(", ")}
            </Text>
            <Text size="small" className="text-ui-fg-muted">
              applied at checkout
            </Text>
          </div>
        )}
        {discountTotal > 0 && (
          <div className="flex items-center justify-between mb-1">
            <Text size="small" className="text-ui-fg-muted">
              Manual discount
            </Text>
            <Text size="small" className="text-ui-fg-muted">
              − {formatMoney(discountTotal, currency)}
            </Text>
          </div>
        )}
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

const CartLine = ({
  item,
  currency,
  onUpdate,
  onRemove,
}: {
  item: POSLineItem
  currency: string
  onUpdate: (id: string, patch: Partial<POSLineItem>) => void
  onRemove: (id: string) => void
}) => {
  const [editingPrice, setEditingPrice] = useState(false)
  const [draftPrice, setDraftPrice] = useState<string>(() =>
    item.unit_price_cents !== null ? (item.unit_price_cents / 100).toFixed(2) : ""
  )

  const commitPrice = () => {
    const trimmed = draftPrice.trim()
    if (trimmed === "") {
      onUpdate(item.id, { unit_price_cents: null })
      setEditingPrice(false)
      return
    }
    const parsed = Number(trimmed)
    if (!Number.isFinite(parsed) || parsed < 0) {
      setEditingPrice(false)
      return
    }
    onUpdate(item.id, { unit_price_cents: Math.round(parsed * 100) })
    setEditingPrice(false)
  }

  return (
    <li className="border border-ui-border-base rounded-lg p-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {item.kind === "customizer" && (
              <Badge size="2xsmall" color="purple">
                Custom
              </Badge>
            )}
            <Text size="small" className="font-medium truncate">
              {item.product_title}
            </Text>
          </div>
          {item.variant_title && (
            <Text size="xsmall" className="text-ui-fg-muted">
              {item.variant_title}
            </Text>
          )}
        </div>
        <IconButton
          size="small"
          variant="transparent"
          onClick={() => onRemove(item.id)}
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
            disabled={item.quantity <= 1}
            onClick={() =>
              onUpdate(item.id, {
                quantity: Math.max(1, item.quantity - 1),
              })
            }
            aria-label="Decrease quantity"
          >
            <Minus />
          </IconButton>
          <Text size="small" className="w-8 text-center">
            {item.quantity}
          </Text>
          <IconButton
            size="small"
            variant="transparent"
            onClick={() =>
              onUpdate(item.id, { quantity: item.quantity + 1 })
            }
            aria-label="Increase quantity"
          >
            <Plus />
          </IconButton>
        </div>

        <div className="text-right">
          {editingPrice ? (
            <div className="flex items-center gap-1 justify-end">
              <Input
                type="number"
                step="0.01"
                min="0"
                className="w-24 text-right"
                value={draftPrice}
                onChange={(e) => setDraftPrice(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitPrice()
                  if (e.key === "Escape") setEditingPrice(false)
                }}
                autoFocus
              />
              <IconButton
                size="small"
                variant="transparent"
                onClick={commitPrice}
                aria-label="Save price"
              >
                <Plus />
              </IconButton>
            </div>
          ) : (
            <button
              type="button"
              className="text-right hover:bg-ui-bg-subtle rounded px-1"
              onClick={() => {
                setDraftPrice(
                  item.unit_price_cents !== null
                    ? (item.unit_price_cents / 100).toFixed(2)
                    : ""
                )
                setEditingPrice(true)
              }}
              title="Click to override unit price"
            >
              <Text size="small" className="font-medium flex items-center gap-1 justify-end">
                {formatMoney(lineSubtotalCents(item), currency)}
                <PencilSquare className="text-ui-fg-muted" />
              </Text>
              {item.quantity > 1 && item.unit_price_cents !== null && (
                <Text size="xsmall" className="text-ui-fg-muted">
                  {formatMoney(item.unit_price_cents, currency)} ea
                </Text>
              )}
            </button>
          )}
        </div>
      </div>

      {item.kind === "customizer" && (
        <Text size="xsmall" className="text-ui-fg-muted mt-2">
          Custom design from POS customizer
        </Text>
      )}
    </li>
  )
}
