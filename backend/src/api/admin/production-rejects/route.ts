import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/production-rejects?since=YYYY-MM-DD&until=YYYY-MM-DD
 *   → {
 *       rows: [{...reject row...}],
 *       by_reason: { reason: { qty, cost_cents } },
 *       by_supplier_brand: { brand_id: { name, qty, cost_cents } },
 *       totals: { qty, cost_cents }
 *     }
 *
 * Aggregates the production_reject table for the report page. Live read,
 * caches at the route layer if needed later.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const since = (req.query.since as string | undefined)?.trim()
  const until = (req.query.until as string | undefined)?.trim()

  const filters: Record<string, unknown> = {}
  if (since || until) {
    filters.created_at = {}
    if (since) (filters.created_at as any).$gte = new Date(since)
    if (until) (filters.created_at as any).$lte = new Date(until)
  }

  const { data: rows } = await query.graph({
    entity: "production_reject",
    fields: [
      "id",
      "order_id",
      "product_id",
      "variant_id",
      "supplier_brand_id",
      "qty",
      "reason",
      "notes",
      "cost_estimate_cents",
      "currency_code",
      "logged_by",
      "created_at",
    ],
    filters,
    pagination: { take: 5000, skip: 0 },
  })

  const list = ((rows as any[]) ?? []) as Array<{
    qty?: number
    cost_estimate_cents?: number
    reason?: string
    supplier_brand_id?: string | null
  }>

  const byReason: Record<string, { qty: number; cost_cents: number }> = {}
  const bySupplierBrandId: Record<string, { qty: number; cost_cents: number }> = {}
  let totalQty = 0
  let totalCostCents = 0

  for (const r of list) {
    const qty = Number(r.qty ?? 0)
    const cost = Number(r.cost_estimate_cents ?? 0)
    totalQty += qty
    totalCostCents += cost
    const reason = (r.reason ?? "other") as string
    byReason[reason] = {
      qty: (byReason[reason]?.qty ?? 0) + qty,
      cost_cents: (byReason[reason]?.cost_cents ?? 0) + cost,
    }
    if (r.supplier_brand_id) {
      bySupplierBrandId[r.supplier_brand_id] = {
        qty: (bySupplierBrandId[r.supplier_brand_id]?.qty ?? 0) + qty,
        cost_cents:
          (bySupplierBrandId[r.supplier_brand_id]?.cost_cents ?? 0) + cost,
      }
    }
  }

  // Hydrate brand names for nicer display.
  const supplierBrandIds = Object.keys(bySupplierBrandId)
  const supplierBrandById: Record<string, { name: string; qty: number; cost_cents: number }> = {}
  if (supplierBrandIds.length > 0) {
    try {
      const { data: brands } = await query.graph({
        entity: "brand",
        fields: ["id", "name"],
        filters: { id: supplierBrandIds },
        pagination: { take: supplierBrandIds.length, skip: 0 },
      })
      for (const b of (brands as any[]) ?? []) {
        const totals = bySupplierBrandId[b.id]
        if (!totals) continue
        supplierBrandById[b.id] = {
          name: (b.name as string) ?? b.id,
          qty: totals.qty,
          cost_cents: totals.cost_cents,
        }
      }
    } catch {
      // fall back to id-only display in the UI
    }
    for (const id of supplierBrandIds) {
      if (!supplierBrandById[id]) {
        supplierBrandById[id] = { name: id, ...bySupplierBrandId[id] }
      }
    }
  }

  res.json({
    rows: list,
    by_reason: byReason,
    by_supplier_brand: supplierBrandById,
    totals: { qty: totalQty, cost_cents: totalCostCents },
  })
}
