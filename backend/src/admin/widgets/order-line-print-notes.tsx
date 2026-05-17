import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import type { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"
import { Container, Heading, Text } from "@medusajs/ui"

import { HelpTooltip } from "../components/reports/help-tooltip"
import { useCallback, useEffect, useMemo, useState } from "react"

import { sdk } from "../lib/sdk"

type LineItemLike = {
  id?: string
  title?: string
  product_title?: string
  subtitle?: string
  variant_title?: string
  quantity?: number
  metadata?: Record<string, unknown> | null
  variant?: { title?: string | null } | null
}

const getPrintNotes = (
  metadata: Record<string, unknown> | null | undefined
): string | null => {
  const design = metadata?.customizerDesign
  if (!design || typeof design !== "object") {
    return null
  }
  const notes = (design as { printNotes?: unknown }).printNotes
  if (typeof notes !== "string" || !notes.trim()) {
    return null
  }
  return notes.trim()
}

const lineLabel = (item: LineItemLike): string => {
  const product = item.product_title || item.title || "Product"
  const variant =
    item.variant_title || (item.variant && typeof item.variant.title === "string"
      ? item.variant.title
      : null)
  return variant ? `${product} · ${variant}` : product
}

const OrderLinePrintNotesWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const orderId = data?.id
  const [items, setItems] = useState<LineItemLike[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!orderId) {
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await sdk.admin.order.retrieve(orderId, {
        fields:
          "id,+items.id,+items.title,+items.product_title,+items.subtitle,+items.variant_title,+items.quantity,+items.metadata,+items.variant.title",
      })
      const raw = (response?.order as { items?: LineItemLike[] })?.items ?? []
      setItems(Array.isArray(raw) ? raw : [])
    } catch (err) {
      setError((err as Error).message || "Failed to load line items")
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const rows = useMemo(() => {
    return items
      .map((item) => {
        const notes = getPrintNotes(item.metadata ?? undefined)
        if (!notes) {
          return null
        }
        return {
          id: item.id ?? "",
          label: lineLabel(item),
          quantity: typeof item.quantity === "number" ? item.quantity : 1,
          notes,
        }
      })
      .filter((row): row is NonNullable<typeof row> => row !== null)
  }, [items])

  if (!orderId) {
    return null
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2" className="flex items-center">
          Print notes (customer)
          <HelpTooltip
            text={{
              title: "Print notes (customer)",
              body: "Free-text instructions the customer typed during checkout, saved in each line item's metadata. Read-only — these are what the customer asked for.",
              bullets: [
                "Common uses: Pantone colour preferences, placement nudges, 'match our previous order' references.",
                "If a line has no print notes metadata it won't appear here.",
              ],
            }}
          />
        </Heading>
        {rows.length > 0 ? (
          <Text size="xsmall" className="text-ui-fg-subtle">
            {rows.length} {rows.length === 1 ? "line" : "lines"}
          </Text>
        ) : null}
      </div>

      <div className="px-6 py-4">
        {error ? (
          <Text size="small" className="text-ui-fg-error">
            {error}
          </Text>
        ) : loading && items.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            Loading line items…
          </Text>
        ) : rows.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            No production notes on line item metadata for this order.
          </Text>
        ) : (
          <ul className="flex flex-col gap-y-4 list-none p-0 m-0">
            {rows.map((row) => (
              <li key={row.id || row.label} className="border-b border-ui-border-base pb-4 last:border-0 last:pb-0">
                <Text size="small" weight="plus" className="text-ui-fg-base">
                  {row.label}
                </Text>
                <Text size="xsmall" className="text-ui-fg-subtle mt-0.5">
                  Qty {row.quantity}
                </Text>
                <Text
                  size="small"
                  className="mt-2 whitespace-pre-wrap text-ui-fg-base rounded-md bg-ui-bg-subtle px-3 py-2"
                >
                  {row.notes}
                </Text>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default withWidgetBoundary(OrderLinePrintNotesWidget, "order-line-print-notes")
