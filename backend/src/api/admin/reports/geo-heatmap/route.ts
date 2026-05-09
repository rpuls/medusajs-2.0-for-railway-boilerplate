import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  inRange,
  matchesRegion,
  parseDateRange,
  parseRegionFilter,
} from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/geo-heatmap
 *
 * Orders bucketed by `shipping_address.postal_code` + city + state.
 * Drives "where to do a popup", "which suburb has organic
 * word-of-mouth worth amplifying", "where do I send physical
 * postcards / samples".
 *
 * Australia-skewed defaults — postal codes display as 4-digit groups,
 * but the route doesn't enforce — international addresses surface in
 * the same list with their native format.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)
  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  let orders: any[] = []
  try {
    const { data } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "created_at",
        "status",
        "total",
        "currency_code",
        "region_id",
        "customer_id",
        "email",
        "shipping_address.postal_code",
        "shipping_address.city",
        "shipping_address.province",
        "shipping_address.country_code",
      ],
      pagination: { take: 5000, skip: 0 },
    })
    orders = (data as any[]) ?? []
  } catch (err: any) {
    logger.error?.(`[geo-heatmap] order fetch failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }

  type Stat = {
    postal_code: string
    city: string | null
    state: string | null
    country: string
    orders: number
    revenue: number
    distinct_customers: Set<string>
  }
  const byKey = new Map<string, Stat>()
  for (const o of orders) {
    if (!matchesRegion(o, regionFilter)) continue
    if (o?.status === "canceled") continue
    if (!inRange(o?.created_at, from, to)) continue
    const addr = o?.shipping_address ?? {}
    const postal =
      typeof addr.postal_code === "string" && addr.postal_code.trim().length > 0
        ? addr.postal_code.trim()
        : null
    if (!postal) continue
    const key = `${(addr.country_code ?? "??").toUpperCase()}|${postal}`
    const stat = byKey.get(key) ?? {
      postal_code: postal,
      city:
        typeof addr.city === "string" && addr.city.length > 0 ? addr.city : null,
      state:
        typeof addr.province === "string" && addr.province.length > 0
          ? addr.province
          : null,
      country: (addr.country_code ?? "??").toUpperCase(),
      orders: 0,
      revenue: 0,
      distinct_customers: new Set<string>(),
    }
    stat.orders += 1
    stat.revenue += Number(o.total ?? 0)
    const customerKey =
      (o.customer_id as string) || (o.email as string) || ""
    if (customerKey) stat.distinct_customers.add(customerKey)
    byKey.set(key, stat)
  }

  const ranked = Array.from(byKey.values())
    .sort((a, b) => b.orders - a.orders || b.revenue - a.revenue)
    .map((s) => ({
      postal_code: s.postal_code,
      city: s.city,
      state: s.state,
      country: s.country,
      orders: s.orders,
      revenue: Math.round(s.revenue * 100) / 100,
      distinct_customers: s.distinct_customers.size,
    }))

  // Country-level rollup (handy when the AU-only assumption changes)
  const byCountry = new Map<
    string,
    { orders: number; revenue: number; postcodes: number }
  >()
  for (const r of ranked) {
    const c = byCountry.get(r.country) ?? {
      orders: 0,
      revenue: 0,
      postcodes: 0,
    }
    c.orders += r.orders
    c.revenue += r.revenue
    c.postcodes += 1
    byCountry.set(r.country, c)
  }

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    summary: {
      distinct_postcodes: ranked.length,
      total_orders: ranked.reduce((s, r) => s + r.orders, 0),
      total_revenue: Math.round(
        ranked.reduce((s, r) => s + r.revenue, 0) * 100
      ) / 100,
    },
    by_country: Array.from(byCountry.entries())
      .map(([country, s]) => ({
        country,
        orders: s.orders,
        revenue: Math.round(s.revenue * 100) / 100,
        postcodes: s.postcodes,
      }))
      .sort((a, b) => b.orders - a.orders),
    top_postcodes: ranked.slice(0, 100),
  })
}
