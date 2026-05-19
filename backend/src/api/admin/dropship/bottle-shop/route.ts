import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const LOOKBACK_DAYS = 90

type BottleShopRow = {
  id: string
  name: string
  email: string | null
}

type BottleLineSummary = {
  productTitle: string
  variantTitle: string | null
  quantity: number
  spiritType: string | null
  bottleShopId: string | null
  bottleShopName: string | null
}

/**
 * GET /admin/dropship/bottle-shop
 *
 * Lists recent orders (last 90 days) that contain bottle line items,
 * split into pending (no bottle_shop_sent_at) and sent. Mirrors the
 * /admin/dropship/aussie-pacific response shape so we can reuse the
 * dashboard UI patterns.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve<any>(ContainerRegistrationKeys.QUERY)

  const since = new Date(
    Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000
  ).toISOString()

  /**
   * Pull every recent order with its line items, then resolve variant→product
   * metadata in a second pass. Doing it in two queries is significantly
   * cheaper than asking graph for every nested field upfront.
   */
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
      "items.title",
      "items.variant_id",
      "items.variant_title",
      "items.variant_sku",
      "items.quantity",
    ],
    pagination: { take: 500, skip: 0, order: { created_at: "DESC" } },
  })

  const orders = (rawOrders as any[]) ?? []
  const candidateOrders = orders.filter((o) => {
    const createdAt = o.created_at as string | undefined
    if (createdAt) {
      const t = Date.parse(createdAt)
      if (!Number.isFinite(t) || t < Date.parse(since)) return false
    }
    if (o.status === "canceled" || o.status === "cancelled") return false
    return Array.isArray(o.items) && o.items.length > 0
  })

  const variantIds = new Set<string>()
  for (const o of candidateOrders) {
    for (const li of o.items ?? []) {
      if (typeof li.variant_id === "string") variantIds.add(li.variant_id)
    }
  }

  let variantToProduct = new Map<string, any>()
  if (variantIds.size) {
    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: ["id", "title", "product.id", "product.title", "product.metadata"],
      filters: { id: Array.from(variantIds) },
    })
    for (const v of variants ?? []) {
      variantToProduct.set(v.id as string, v)
    }
  }

  const shopIds = new Set<string>()
  for (const v of variantToProduct.values()) {
    const meta = (v.product?.metadata ?? {}) as Record<string, unknown>
    if (typeof meta.bottle_shop_id === "string") {
      shopIds.add(meta.bottle_shop_id)
    }
  }

  let shopsById = new Map<string, BottleShopRow>()
  if (shopIds.size) {
    const { data: shops } = await query.graph({
      entity: "bottle_shop",
      fields: ["id", "name", "email"],
      filters: { id: Array.from(shopIds) },
    })
    for (const s of (shops ?? []) as BottleShopRow[]) {
      shopsById.set(s.id, s)
    }
  }

  const pending: any[] = []
  const sent: any[] = []

  for (const order of candidateOrders) {
    const bottleLines: BottleLineSummary[] = []
    for (const li of order.items ?? []) {
      const variant = li.variant_id ? variantToProduct.get(li.variant_id) : null
      const productMeta = (variant?.product?.metadata ?? {}) as Record<string, unknown>
      if (productMeta.product_class !== "bottle") continue
      const shopId =
        typeof productMeta.bottle_shop_id === "string"
          ? productMeta.bottle_shop_id
          : null
      bottleLines.push({
        productTitle: variant?.product?.title ?? li.title ?? "(unknown)",
        variantTitle: variant?.title ?? li.variant_title ?? null,
        quantity: Number(li.quantity ?? 0),
        spiritType:
          typeof productMeta.spirit_type === "string"
            ? productMeta.spirit_type
            : null,
        bottleShopId: shopId,
        bottleShopName: shopId ? shopsById.get(shopId)?.name ?? null : null,
      })
    }
    if (!bottleLines.length) continue

    const meta = (order.metadata ?? {}) as Record<string, any>
    const addr = order.shipping_address ?? {}
    const customerName =
      [addr.first_name, addr.last_name].filter(Boolean).join(" ") ||
      order.email ||
      ""

    const base = {
      order_id: order.id,
      display_id: order.display_id,
      created_at: order.created_at,
      customer: customerName,
      email: order.email ?? "",
      items: bottleLines,
    }

    if (meta.bottle_shop_sent_at) {
      sent.push({
        ...base,
        bottle_shop_sent_at: meta.bottle_shop_sent_at,
        bottle_shop_email_to: meta.bottle_shop_email_to ?? null,
        bottle_shop_last_error: meta.bottle_shop_last_error ?? null,
      })
    } else {
      pending.push(base)
    }
  }

  return res.json({ pending, sent })
}
