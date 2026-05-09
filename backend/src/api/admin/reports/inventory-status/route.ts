import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/reports/inventory-status
 *
 * Out-of-stock + low-stock variant lists. "Low stock" threshold is
 * configurable via `?threshold=N` (default 10 units). Aggregates
 * stocked_quantity − reserved_quantity across all stock locations to
 * compute a single in-stock figure per variant.
 *
 * Defensive: the variant↔inventory link traversal goes through
 * Medusa module links, which can shift between minor versions. If the
 * graph query fails, the route returns empty arrays + a warning so the
 * report card shows "no inventory data" instead of a 500.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const thresholdRaw = (req.query.threshold as string | undefined)?.trim()
  const lowStockThreshold = (() => {
    const n = Number(thresholdRaw)
    if (!Number.isFinite(n) || n < 0) return 10
    return Math.floor(n)
  })()

  // The Medusa graph for variants exposes inventory through the
  // `inventory_items` link. Each inventory_item has `location_levels`
  // (stocked + reserved per location). We sum across locations to get
  // a single in-stock per variant.
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
      `[inventory-status] variant graph failed: ${err?.message ?? err}`
    )
    return res.json({
      threshold: lowStockThreshold,
      summary: {
        total_managed_variants: 0,
        out_of_stock: 0,
        low_stock: 0,
      },
      out_of_stock: [],
      low_stock: [],
      data_available: false,
      error: String(err?.message ?? err),
    })
  }

  type Row = {
    variant_id: string
    sku: string | null
    title: string
    product_title: string
    product_id: string | null
    in_stock: number
  }

  const rows: Row[] = []
  for (const v of variants) {
    if (!v?.manage_inventory) continue

    const items = Array.isArray(v.inventory_items) ? v.inventory_items : []
    let totalStocked = 0
    let totalReserved = 0
    for (const ii of items) {
      const inv = ii?.inventory
      const levels = inv && Array.isArray(inv.location_levels) ? inv.location_levels : []
      for (const lvl of levels) {
        totalStocked += Number(lvl?.stocked_quantity ?? 0)
        totalReserved += Number(lvl?.reserved_quantity ?? 0)
      }
    }
    const inStock = totalStocked - totalReserved

    rows.push({
      variant_id: v.id,
      sku: typeof v.sku === "string" ? v.sku : null,
      title: typeof v.title === "string" ? v.title : "(no title)",
      product_title: v.product?.title ?? "(unknown product)",
      product_id: typeof v.product_id === "string" ? v.product_id : null,
      in_stock: inStock,
    })
  }

  const outOfStock = rows
    .filter((r) => r.in_stock <= 0)
    .sort((a, b) => a.in_stock - b.in_stock)
    .slice(0, 100)

  const lowStock = rows
    .filter((r) => r.in_stock > 0 && r.in_stock < lowStockThreshold)
    .sort((a, b) => a.in_stock - b.in_stock)
    .slice(0, 100)

  return res.json({
    threshold: lowStockThreshold,
    summary: {
      total_managed_variants: rows.length,
      out_of_stock: rows.filter((r) => r.in_stock <= 0).length,
      low_stock: rows.filter((r) => r.in_stock > 0 && r.in_stock < lowStockThreshold)
        .length,
    },
    out_of_stock: outOfStock,
    low_stock: lowStock,
    data_available: true,
  })
}
