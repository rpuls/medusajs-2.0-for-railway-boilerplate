import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/pos/customers/:id/last-order
 *   → { order: { id, display_id, items: [{ variant_id, product_id, ... }] } | null }
 *
 * Powers the "Repeat last order" shortcut on the POS customer panel.
 * Returns the most recent non-cancelled order for the given customer
 * with just the line-item info the admin POS needs to rebuild a cart.
 * No item is returned if the customer has no order history (returns
 * `{ order: null }` with 200) — the UI hides the button rather than
 * showing an error.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const customerId = req.params.id
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as any

  const { data: orders } = await query.graph({
    entity: "orders",
    filters: {
      customer_id: customerId,
    } as any,
    fields: [
      "id",
      "display_id",
      "status",
      "currency_code",
      "created_at",
      "items.id",
      "items.title",
      "items.variant_id",
      "items.product_id",
      "items.product_title",
      "items.variant_title",
      "items.quantity",
      "items.unit_price",
      "items.metadata",
    ],
    pagination: {
      take: 5,
      skip: 0,
      order: { created_at: "DESC" } as any,
    },
  })

  const candidates = ((orders ?? []) as any[]).filter(
    (o) => o.status !== "canceled" && o.status !== "cancelled"
  )

  if (candidates.length === 0) {
    return res.json({ order: null })
  }

  const order = candidates[0]
  const items = (order.items ?? [])
    .filter((it: any) => it.variant_id) // skip ad-hoc/discount lines
    .map((it: any) => ({
      variant_id: it.variant_id as string,
      product_id: it.product_id as string | null,
      product_title: it.product_title ?? it.title ?? "Item",
      variant_title: it.variant_title ?? null,
      quantity: Number(it.quantity ?? 1),
      unit_price_cents:
        typeof it.unit_price === "number"
          ? Math.round(it.unit_price * 100)
          : null,
      // Customizer metadata is intentionally NOT copied — POS doesn't
      // know how to re-attach a sanitized CustomizerMetadata to a
      // fresh cart line without going through the customizer popup
      // again. Staff would need to re-design or open the storefront
      // /account/orders flow for full re-order.
      kind:
        ((it.metadata as any) ?? {})?.pos_line_kind === "customizer"
          ? ("customizer-stub" as const)
          : ("standard" as const),
    }))

  return res.json({
    order: {
      id: order.id,
      display_id: order.display_id ?? null,
      created_at: order.created_at,
      currency_code: order.currency_code,
      items,
    },
  })
}
