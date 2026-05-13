import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import type { AdminOrder } from "@medusajs/framework/types"
import { Button, Container, Text } from "@medusajs/ui"
import { useCallback, useState } from "react"

import { buildCsv, downloadCsv, fetchAllPaginated } from "../lib/csv-export"
import { sdk } from "../lib/sdk"

const ORDER_LIST_FIELDS = [
  "id",
  "display_id",
  "status",
  "payment_status",
  "fulfillment_status",
  "email",
  "created_at",
  "currency_code",
  "total",
  "subtotal",
  "discount_total",
  "shipping_total",
  "tax_total",
  "item_total",
  "customer.first_name",
  "customer.last_name",
  "shipping_address.first_name",
  "shipping_address.last_name",
  "shipping_address.address_1",
  "shipping_address.address_2",
  "shipping_address.city",
  "shipping_address.province",
  "shipping_address.postal_code",
  "shipping_address.country_code",
  "shipping_address.phone",
  "items.id",
  "items.quantity",
].join(",")

const formatNumber = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return ""
  }
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) {
    return ""
  }
  return n.toFixed(2)
}

const formatString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return ""
  }
  return String(value)
}

const fullName = (
  first: unknown,
  last: unknown
): string => {
  const f = formatString(first).trim()
  const l = formatString(last).trim()
  return [f, l].filter(Boolean).join(" ")
}

const sumItemQuantity = (order: AdminOrder): number => {
  const items = (order as unknown as { items?: Array<{ quantity?: unknown }> }).items
  if (!Array.isArray(items)) {
    return 0
  }
  return items.reduce((acc, it) => {
    const q = typeof it?.quantity === "number" ? it.quantity : Number(it?.quantity)
    return acc + (Number.isFinite(q) ? q : 0)
  }, 0)
}

const buildOrderRow = (order: AdminOrder): string[] => {
  const o = order as unknown as Record<string, unknown>
  const customer = (o.customer ?? {}) as Record<string, unknown>
  const shipping = (o.shipping_address ?? {}) as Record<string, unknown>

  return [
    formatString(o.display_id ?? o.id),
    formatString(o.id),
    formatString(o.created_at),
    formatString(o.status),
    formatString(o.payment_status),
    formatString(o.fulfillment_status),
    formatString(o.email),
    fullName(customer.first_name, customer.last_name),
    formatString(o.currency_code).toUpperCase(),
    formatNumber(o.subtotal),
    formatNumber(o.discount_total),
    formatNumber(o.shipping_total),
    formatNumber(o.tax_total),
    formatNumber(o.total),
    String(sumItemQuantity(order)),
    fullName(shipping.first_name, shipping.last_name),
    formatString(shipping.address_1),
    formatString(shipping.address_2),
    formatString(shipping.city),
    formatString(shipping.province),
    formatString(shipping.postal_code),
    formatString(shipping.country_code).toUpperCase(),
    formatString(shipping.phone),
  ]
}

const ORDER_CSV_HEADER = [
  "display_id",
  "order_id",
  "created_at",
  "status",
  "payment_status",
  "fulfillment_status",
  "email",
  "customer_name",
  "currency",
  "subtotal",
  "discount_total",
  "shipping_total",
  "tax_total",
  "total",
  "item_count",
  "shipping_name",
  "shipping_address_1",
  "shipping_address_2",
  "shipping_city",
  "shipping_province",
  "shipping_postal_code",
  "shipping_country",
  "shipping_phone",
]

const todayStamp = (): string => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

const OrdersExportCsv = () => {
  const [exportLoading, setExportLoading] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportSummary, setExportSummary] = useState<string | null>(null)

  const onExport = useCallback(async () => {
    setExportError(null)
    setExportSummary(null)
    setExportLoading(true)
    try {
      const orders = await fetchAllPaginated<AdminOrder, { limit: number; offset: number; fields: string; order: string }>(
        (q) => sdk.admin.order.list(q) as unknown as Promise<{ count?: number } & Record<string, unknown>>,
        "orders",
        { fields: ORDER_LIST_FIELDS, order: "-created_at" }
      )

      if (orders.length === 0) {
        setExportSummary("No orders to export.")
        return
      }

      const csv = buildCsv(ORDER_CSV_HEADER, orders.map(buildOrderRow))
      downloadCsv(`orders-${todayStamp()}.csv`, csv)
      setExportSummary(`Exported ${orders.length} ${orders.length === 1 ? "order" : "orders"}.`)
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Export failed")
    } finally {
      setExportLoading(false)
    }
  }, [])

  return (
    <Container className="mb-4 divide-y p-0">
      <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Text size="small" weight="plus" className="text-ui-fg-base">
            Export orders
          </Text>
          <Text size="small" className="text-ui-fg-muted">
            Download all orders as CSV (totals, customer, and shipping address).
          </Text>
        </div>
        <Button size="small" variant="secondary" disabled={exportLoading} onClick={onExport}>
          {exportLoading ? "Exporting…" : "Export orders (CSV)"}
        </Button>
      </div>
      {exportError ? (
        <div className="px-6 py-3">
          <Text size="small" className="text-ui-fg-error">
            {exportError}
          </Text>
        </div>
      ) : null}
      {exportSummary ? (
        <div className="px-6 py-3">
          <Text size="small" className="text-ui-fg-subtle">
            {exportSummary}
          </Text>
        </div>
      ) : null}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.list.before",
})

export default withWidgetBoundary(OrdersExportCsv, "orders-export-csv")
