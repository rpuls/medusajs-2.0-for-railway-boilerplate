import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  ProductStatus,
  QueryContext,
} from "@medusajs/framework/utils"
import { z } from "zod"

import { fetchOrdersForReports } from "../../../../lib/reports/orders"

/**
 * GET /store/products/top-selling
 *
 * Returns the top-N products by line-item count over the last N days.
 *
 * Query params:
 *  - days   (default 30, range 1–365) — rolling window in days
 *  - limit  (default 3, range 1–24)   — number of products to return
 *  - region_id (optional)             — when supplied, products are returned
 *                                       with `variants.calculated_price` in
 *                                       that region's currency, so storefront
 *                                       cards can show "From $X" directly.
 *
 * Used by the storefront menu's "Best Sellers" panel. Defensively built —
 * filters canceled orders, falls back to empty array if the orders fetch
 * fails. The orders scan is capped at 5000 rows via the shared helper, so
 * once volume exceeds that a materialised view becomes worth the work.
 *
 * Response shape mirrors `/store/brands/[handle]/products` so the storefront
 * can reuse its existing card components.
 */

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(30),
  limit: z.coerce.number().int().min(1).max(24).optional().default(3),
  region_id: z.string().optional(),
})

const STORE_PRODUCT_FIELDS = [
  "id",
  "title",
  "subtitle",
  "handle",
  "thumbnail",
  "type_id",
  "type.*",
  "metadata",
  "variants.id",
  "variants.title",
  "variants.calculated_price.*",
  "variants.inventory_quantity",
  "options.*",
  "options.values.*",
  "tags.*",
  "images.*",
]

type OrderRow = {
  id: string
  status?: string
  created_at?: string
  items?: Array<{
    product_id?: string | null
    quantity?: number | null
  }>
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const q = querySchema.parse(req.query ?? {})
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as any
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER) as any

  const windowFromTs = Date.now() - q.days * 24 * 60 * 60 * 1000

  let orders: OrderRow[] = []
  try {
    orders = (await fetchOrdersForReports(query)) as OrderRow[]
  } catch (err: any) {
    logger.error?.(
      `[products/top-selling] order fetch failed: ${err?.message ?? err}`
    )
    res.json({ products: [], count: 0 })
    return
  }

  // Aggregate sold quantity per product_id within the window. Quantity (not row
  // count) better reflects "best selling" — a single order of 50 tees should
  // weigh more than 50 single-item orders.
  const qtyByProductId = new Map<string, number>()
  for (const order of orders) {
    if (!order || order.status === "canceled") continue
    const createdMs = order.created_at ? new Date(order.created_at).getTime() : NaN
    if (!Number.isFinite(createdMs) || createdMs < windowFromTs) continue
    for (const item of order.items ?? []) {
      const productId = item?.product_id
      if (typeof productId !== "string" || !productId) continue
      const qty = typeof item.quantity === "number" ? item.quantity : 1
      qtyByProductId.set(productId, (qtyByProductId.get(productId) ?? 0) + qty)
    }
  }

  if (qtyByProductId.size === 0) {
    res.json({ products: [], count: 0 })
    return
  }

  const rankedProductIds = Array.from(qtyByProductId.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, q.limit)
    .map(([id]) => id)

  // Fetch full product data with region-aware pricing. Mirrors the pattern in
  // /store/brands/[handle]/products so storefront can render cards identically.
  const filters: Record<string, any> = {
    id: rankedProductIds,
    status: ProductStatus.PUBLISHED,
  }
  const salesChannelIds: string[] | undefined = (req as any)
    .publishable_key_context?.sales_channel_ids
  if (Array.isArray(salesChannelIds) && salesChannelIds.length) {
    filters.sales_channels = { id: salesChannelIds }
  }

  const context: Record<string, any> = {}
  if (q.region_id) {
    const regionRes = await query.graph({
      entity: "region",
      fields: ["id", "currency_code"],
      filters: { id: q.region_id },
      pagination: { take: 1, skip: 0 },
    })
    const region = (regionRes.data ?? [])[0]
    if (region) {
      context.variants = {
        calculated_price: QueryContext({
          region_id: region.id,
          currency_code: region.currency_code,
        }),
      }
    }
  }

  const { data: products } = await query.graph({
    entity: "product",
    fields: STORE_PRODUCT_FIELDS,
    filters,
    pagination: { take: q.limit, skip: 0 },
    context,
  })

  // query.graph result order isn't guaranteed to match rankedProductIds — reorder
  // so the response respects the actual best-seller ranking.
  const productsById = new Map<string, any>()
  for (const p of products ?? []) {
    if (p?.id) productsById.set(p.id, p)
  }
  const ordered = rankedProductIds
    .map((id) => productsById.get(id))
    .filter((p): p is NonNullable<typeof p> => p != null)

  res.json({
    products: ordered,
    count: ordered.length,
  })
}
