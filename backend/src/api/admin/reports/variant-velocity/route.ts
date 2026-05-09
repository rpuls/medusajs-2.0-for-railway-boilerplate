import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  fetchOrdersForReports,
  matchesRegion,
  parseRegionFilter,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/variant-velocity
 *
 * For each managed-inventory variant, units sold per week over the
 * last 12 ISO-week buckets, plus a momentum score = recent half /
 * older half. Adjacent to the aging-inventory report but
 * forward-looking — spots SKUs going hot vs going cold instead of
 * dead stock.
 *
 * Variants with no sales in the 12-week window are excluded.
 */
const WEEKS = 12

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  let orders: any[] = []
  try {
    orders = await fetchOrdersForReports(query)
  } catch (err: any) {
    logger.error?.(
      `[variant-velocity] order fetch failed: ${err?.message ?? err}`
    )
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  // Build week buckets anchored on UTC Mondays, last WEEKS rolling.
  const now = Date.now()
  const startOfThisWeek = (() => {
    const d = new Date(now)
    const dow = d.getUTCDay()
    const diff = (dow + 6) % 7
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) -
      diff * 86_400_000
  })()
  const buckets: number[] = []
  for (let i = WEEKS - 1; i >= 0; i--) {
    buckets.push(startOfThisWeek - i * 7 * 86_400_000)
  }
  const findBucket = (ms: number): number => {
    if (!Number.isFinite(ms)) return -1
    if (ms < buckets[0]) return -1
    for (let i = buckets.length - 1; i >= 0; i--) {
      if (ms >= buckets[i]) return i
    }
    return -1
  }

  type VariantStat = {
    variant_id: string
    weekly: number[]
  }
  const byVariant = new Map<string, VariantStat>()

  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    if (o?.status === "canceled") continue
    const created = Date.parse(o?.created_at ?? "")
    if (!Number.isFinite(created)) continue
    const idx = findBucket(created)
    if (idx < 0) continue
    for (const it of (o.items ?? []) as any[]) {
      const vid = it?.variant_id
      if (typeof vid !== "string") continue
      const qty = Number(it?.quantity ?? 0)
      if (!Number.isFinite(qty)) continue
      const stat = byVariant.get(vid) ?? {
        variant_id: vid,
        weekly: Array.from({ length: WEEKS }, () => 0),
      }
      stat.weekly[idx] += qty
      byVariant.set(vid, stat)
    }
  }

  // Resolve variant titles + product info for the top movers.
  const variantIds = Array.from(byVariant.keys())
  type VariantInfo = {
    title: string
    product_title: string
    product_id: string | null
    sku: string | null
    in_stock: number
  }
  const info = new Map<string, VariantInfo>()
  if (variantIds.length > 0) {
    try {
      const { data } = await query.graph({
        entity: "product_variant",
        fields: [
          "id",
          "title",
          "sku",
          "product_id",
          "product.title",
          "manage_inventory",
          "inventory_items.inventory.location_levels.stocked_quantity",
          "inventory_items.inventory.location_levels.reserved_quantity",
        ],
        filters: { id: variantIds },
        pagination: { take: variantIds.length, skip: 0 },
      })
      for (const v of (data as any[]) ?? []) {
        let stocked = 0
        let reserved = 0
        for (const ii of v.inventory_items ?? []) {
          for (const lvl of ii?.inventory?.location_levels ?? []) {
            stocked += Number(lvl?.stocked_quantity ?? 0)
            reserved += Number(lvl?.reserved_quantity ?? 0)
          }
        }
        info.set(v.id, {
          title: typeof v.title === "string" ? v.title : "(no title)",
          product_title: v?.product?.title ?? "(unknown product)",
          product_id:
            typeof v.product_id === "string" ? v.product_id : null,
          sku: typeof v.sku === "string" ? v.sku : null,
          in_stock: stocked - reserved,
        })
      }
    } catch (err: any) {
      logger.warn?.(
        `[variant-velocity] variant graph failed: ${err?.message ?? err}`
      )
    }
  }

  type Row = {
    variant_id: string
    title: string
    product_title: string
    product_id: string | null
    sku: string | null
    in_stock: number
    total_units: number
    avg_per_week: number
    weekly: number[]
    momentum: "hot" | "warm" | "steady" | "cooling" | "cold"
    momentum_ratio: number
  }
  const rows: Row[] = []
  const half = Math.floor(WEEKS / 2)
  for (const stat of byVariant.values()) {
    const total = stat.weekly.reduce((s, n) => s + n, 0)
    if (total === 0) continue
    const recentHalf = stat.weekly
      .slice(-half)
      .reduce((s, n) => s + n, 0)
    const olderHalf = stat.weekly
      .slice(0, WEEKS - half)
      .reduce((s, n) => s + n, 0)
    const ratio =
      olderHalf > 0 ? recentHalf / olderHalf : recentHalf > 0 ? Infinity : 0
    let momentum: Row["momentum"] = "steady"
    if (!Number.isFinite(ratio)) momentum = "hot"
    else if (ratio >= 2) momentum = "hot"
    else if (ratio >= 1.25) momentum = "warm"
    else if (ratio >= 0.75) momentum = "steady"
    else if (ratio >= 0.4) momentum = "cooling"
    else momentum = "cold"
    const variantInfo = info.get(stat.variant_id)
    rows.push({
      variant_id: stat.variant_id,
      title: variantInfo?.title ?? "(unknown variant)",
      product_title: variantInfo?.product_title ?? "(unknown product)",
      product_id: variantInfo?.product_id ?? null,
      sku: variantInfo?.sku ?? null,
      in_stock: variantInfo?.in_stock ?? 0,
      total_units: total,
      avg_per_week: Math.round((total / WEEKS) * 10) / 10,
      weekly: stat.weekly,
      momentum,
      momentum_ratio:
        Number.isFinite(ratio) ? Math.round(ratio * 100) / 100 : 99,
    })
  }
  rows.sort((a, b) => {
    // Hot + warm first, then steady, then cooling/cold. Within each
    // group, by total units desc.
    const order = { hot: 0, warm: 1, steady: 2, cooling: 3, cold: 4 }
    if (order[a.momentum] !== order[b.momentum]) {
      return order[a.momentum] - order[b.momentum]
    }
    return b.total_units - a.total_units
  })

  return res.json({
    weeks: WEEKS,
    week_starts: buckets.map((ms) => new Date(ms).toISOString()),
    summary: {
      tracked_variants: rows.length,
      hot: rows.filter((r) => r.momentum === "hot").length,
      cold: rows.filter((r) => r.momentum === "cold").length,
    },
    rows: rows.slice(0, 100),
  })
}
