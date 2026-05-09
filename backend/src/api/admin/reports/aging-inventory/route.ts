import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { fetchOrdersForReports } from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/aging-inventory
 *
 * Bucket every variant with `manage_inventory: true` by days since its
 * most-recent line-item sale. Stock that hasn't moved in 90+ days is
 * working capital tied up in shelves — surface it so it can be
 * discounted, bundled, or dropped.
 *
 * Defensive: if the variant↔inventory link query fails (it can shift
 * between Medusa minors), return an empty payload + warning rather than
 * 500. Same pattern as inventory-status/route.ts.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  // 1. Pull all managed variants with stock + price (for stock value).
  let variants: any[] = []
  try {
    const { data } = await query.graph({
      entity: "product_variant",
      fields: [
        "id",
        "title",
        "sku",
        "manage_inventory",
        "product_id",
        "product.title",
        "product.thumbnail",
        "inventory_items.inventory.location_levels.stocked_quantity",
        "inventory_items.inventory.location_levels.reserved_quantity",
      ],
      filters: { manage_inventory: true },
      pagination: { take: 5000, skip: 0 },
    })
    variants = (data as any[]) ?? []
  } catch (err: any) {
    logger.warn?.(
      `[aging-inventory] variant graph failed: ${err?.message ?? err}`
    )
    return res.json({
      data_available: false,
      buckets: [],
      top_aging: [],
      error: String(err?.message ?? err),
    })
  }

  // 2. Pull all orders to compute last-sold-at per variant. fetchOrdersForReports
  //    capped at 5000 — enough history for SC Prints, recalibrate if you
  //    cross that volume.
  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.warn?.(
      `[aging-inventory] order fetch failed: ${err?.message ?? err}`
    )
    // Carry on — without sales data every variant is "never sold".
  }

  const lastSoldByVariant = new Map<string, number>()
  for (const o of orders) {
    if (o?.status === "canceled") continue
    const created = Date.parse(o?.created_at ?? "")
    if (!Number.isFinite(created)) continue
    for (const it of o?.items ?? []) {
      const vid = it?.variant_id
      if (typeof vid !== "string") continue
      const prev = lastSoldByVariant.get(vid) ?? 0
      if (created > prev) lastSoldByVariant.set(vid, created)
    }
  }

  type Row = {
    variant_id: string
    sku: string | null
    title: string
    product_title: string
    product_id: string | null
    in_stock: number
    last_sold_at: string | null
    days_since_sale: number | null
    bucket: "fresh" | "slowing" | "aging" | "dead" | "never"
  }

  const nowMs = Date.now()
  const rows: Row[] = []
  for (const v of variants) {
    if (!v?.manage_inventory) continue
    const items = Array.isArray(v.inventory_items) ? v.inventory_items : []
    let totalStocked = 0
    let totalReserved = 0
    for (const ii of items) {
      const inv = ii?.inventory
      const levels =
        inv && Array.isArray(inv.location_levels) ? inv.location_levels : []
      for (const lvl of levels) {
        totalStocked += Number(lvl?.stocked_quantity ?? 0)
        totalReserved += Number(lvl?.reserved_quantity ?? 0)
      }
    }
    const inStock = totalStocked - totalReserved
    if (inStock <= 0) continue // Out-of-stock isn't aging — different report.

    const lastMs = lastSoldByVariant.get(v.id) ?? null
    const daysSinceSale =
      lastMs != null ? Math.floor((nowMs - lastMs) / 86_400_000) : null

    let bucket: Row["bucket"]
    if (daysSinceSale === null) bucket = "never"
    else if (daysSinceSale <= 30) bucket = "fresh"
    else if (daysSinceSale <= 90) bucket = "slowing"
    else if (daysSinceSale <= 180) bucket = "aging"
    else bucket = "dead"

    rows.push({
      variant_id: v.id,
      sku: typeof v.sku === "string" ? v.sku : null,
      title: typeof v.title === "string" ? v.title : "(no title)",
      product_title: v.product?.title ?? "(unknown product)",
      product_id: typeof v.product_id === "string" ? v.product_id : null,
      in_stock: inStock,
      last_sold_at: lastMs != null ? new Date(lastMs).toISOString() : null,
      days_since_sale: daysSinceSale,
      bucket,
    })
  }

  const BUCKET_ORDER: Row["bucket"][] = [
    "fresh",
    "slowing",
    "aging",
    "dead",
    "never",
  ]
  const buckets = BUCKET_ORDER.map((name) => {
    const inBucket = rows.filter((r) => r.bucket === name)
    const totalStock = inBucket.reduce((s, r) => s + r.in_stock, 0)
    return {
      name,
      variant_count: inBucket.length,
      total_stock_units: totalStock,
    }
  })

  // Top "deserves action" — dead + never buckets, sorted by stock units desc
  // (more units sitting = more capital tied up).
  const topAging = rows
    .filter((r) => r.bucket === "dead" || r.bucket === "never")
    .sort((a, b) => {
      // Prefer "dead" (we know they sold once but stopped) above "never"
      // (might be brand-new SKUs that just haven't been seen yet).
      if (a.bucket !== b.bucket) {
        return a.bucket === "dead" ? -1 : 1
      }
      const aDays = a.days_since_sale ?? 9999
      const bDays = b.days_since_sale ?? 9999
      if (aDays !== bDays) return bDays - aDays
      return b.in_stock - a.in_stock
    })
    .slice(0, 100)

  return res.json({
    data_available: true,
    buckets,
    top_aging: topAging,
    total_variants: rows.length,
  })
}
