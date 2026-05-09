import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /admin/orders/recent-arrivals?since=<iso>
 *
 * Light-touch poll endpoint for the order-arrival toast + browser tab
 * notification. Returns orders created after `since` (default: last 10
 * minutes), capped to 50. Designed to be called every 30s by the
 * frontend "OrderArrivalWatcher" component.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const sinceParam =
    typeof req.query.since === "string" ? req.query.since : null
  const sinceMs = sinceParam
    ? Date.parse(sinceParam)
    : Date.now() - 10 * 60 * 1000
  const since = Number.isFinite(sinceMs)
    ? new Date(sinceMs).toISOString()
    : new Date(Date.now() - 10 * 60 * 1000).toISOString()

  try {
    const { data } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "created_at",
        "status",
        "total",
        "currency_code",
        "email",
      ],
      pagination: { take: 50, skip: 0, order: { created_at: "DESC" } },
    })
    const orders = ((data as any[]) ?? []).filter((o) => {
      if (o?.status === "canceled") return false
      const t = Date.parse(o?.created_at ?? "")
      return Number.isFinite(t) && t > Date.parse(since)
    })
    return res.json({
      since,
      now: new Date().toISOString(),
      orders: orders.map((o) => ({
        id: o.id,
        display_id: typeof o.display_id === "number" ? o.display_id : null,
        created_at: o.created_at,
        total: Number(o.total ?? 0),
        currency_code: o.currency_code,
        email: typeof o.email === "string" ? o.email : null,
      })),
    })
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to load orders",
      detail: String(err?.message ?? err),
    })
  }
}
