import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const LOOKBACK_DAYS = 90

function isAsColourItem(li: any): boolean {
  const sku: string | undefined = li.variant_sku ?? li.metadata?.ascolour?.sku
  if (!sku) return false
  const meta = li.metadata ?? {}
  return !!(meta?.ascolour || meta?.source === "ascolour" || /^\d{3,5}-/.test(sku))
}

function formatItem(li: any): { sku: string; quantity: number; title: string } {
  return {
    sku: li.variant_sku ?? li.metadata?.ascolour?.sku ?? "—",
    quantity: Number(li.quantity ?? 0),
    title: li.title ?? "",
  }
}

/**
 * GET /admin/dropship/ascolour
 *
 * Returns all recent orders (last 90 days) that contain AS Colour line items,
 * split into "pending" (not yet sent) and "sent" (ascolour_order_id present).
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { data: rawOrders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "created_at",
      "status",
      "metadata",
      "email",
      "shipping_address.first_name",
      "shipping_address.last_name",
      "items.id",
      "items.variant_sku",
      "items.title",
      "items.quantity",
      "items.metadata",
    ],
    pagination: { take: 500, skip: 0, order: { created_at: "DESC" } },
  })

  const orders = (rawOrders as any[]) ?? []

  const pending: any[] = []
  const sent: any[] = []

  for (const order of orders) {
    // Only last 90 days
    const createdAt = order.created_at as string | undefined
    if (createdAt) {
      const t = Date.parse(createdAt)
      if (!Number.isFinite(t) || t < Date.parse(since)) continue
    }

    // Skip cancelled orders
    if (order.status === "canceled" || order.status === "cancelled") continue

    const items: any[] = order.items ?? []
    const ascolourItems = items.filter(isAsColourItem)
    if (!ascolourItems.length) continue

    const meta = (order.metadata ?? {}) as Record<string, any>
    const addr = order.shipping_address ?? {}
    const customerName = [addr.first_name, addr.last_name].filter(Boolean).join(" ") || order.email || ""

    const base = {
      order_id: order.id,
      display_id: order.display_id,
      created_at: order.created_at,
      customer: customerName,
      email: order.email ?? "",
      items: ascolourItems.map(formatItem),
    }

    if (meta.ascolour_order_id) {
      sent.push({
        ...base,
        ascolour_order_id: meta.ascolour_order_id,
        ascolour_status: meta.ascolour_status ?? null,
        ascolour_sent_at: meta.ascolour_sent_at ?? null,
        ascolour_shipments: Array.isArray(meta.ascolour_shipments) ? meta.ascolour_shipments : [],
        ascolour_last_synced_at: meta.ascolour_last_synced_at ?? null,
        ascolour_last_error: meta.ascolour_last_error ?? null,
      })
    } else {
      pending.push(base)
    }
  }

  return res.json({ pending, sent })
}
