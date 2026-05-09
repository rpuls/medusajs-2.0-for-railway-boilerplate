import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { parseDateRange, parseRegionFilter } from "../../../../lib/reports/orders"

/**
 * GET /admin/reports/cart-conversion?from=&to=&region_id=
 *
 * The bottom slice of the e-commerce funnel measurable from Medusa
 * data alone: carts created in window vs how many became orders.
 * Doesn't capture pre-cart drop-off (session → PDP → cart) — that
 * requires GA4 ecommerce events and ships with Tier C.
 *
 * Cart classification:
 *   - completed: cart.completed_at is set (cart became an order)
 *   - active: not completed, last_modified within 24h — customer
 *     might still come back
 *   - abandoned: not completed, last_modified > 24h ago
 */

const ABANDONMENT_THRESHOLD_MS = 24 * 60 * 60 * 1000

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console

  const { from, to } = parseDateRange(req.query as Record<string, unknown>)
  const regionFilter = parseRegionFilter(req.query as Record<string, unknown>)

  let carts: any[] = []
  try {
    const { data } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "created_at",
        "updated_at",
        "completed_at",
        "region_id",
        "currency_code",
        "email",
        "items.id",
        "items.unit_price",
        "items.quantity",
      ],
      pagination: { take: 5000, skip: 0 },
    })
    carts = (data as any[]) ?? []
  } catch (err: any) {
    logger.warn?.(
      `[cart-conversion] cart graph failed: ${err?.message ?? err}`
    )
    return res.json({
      from: from.toISOString(),
      to: to.toISOString(),
      summary: {
        total_carts: 0,
        completed_carts: 0,
        active_carts: 0,
        abandoned_carts: 0,
        conversion_rate: 0,
        abandonment_rate: 0,
        median_completed_value: 0,
        median_abandoned_value: 0,
      },
      data_available: false,
      error: String(err?.message ?? err),
    })
  }

  const now = Date.now()
  const fromMs = from.getTime()
  const toMs = to.getTime()

  let total = 0
  let completed = 0
  let active = 0
  let abandoned = 0
  const completedValues: number[] = []
  const abandonedValues: number[] = []

  for (const cart of carts) {
    if (regionFilter && cart.region_id !== regionFilter) continue
    const createdMs = Date.parse(cart.created_at ?? "")
    if (!Number.isFinite(createdMs)) continue
    if (createdMs < fromMs || createdMs > toMs) continue
    // Skip empty carts — abandoned-then-empty isn't a meaningful signal.
    const items = (cart.items ?? []) as Array<{ unit_price?: number; quantity?: number }>
    if (items.length === 0) continue
    const value = items.reduce(
      (sum, it) => sum + Number(it.unit_price ?? 0) * Number(it.quantity ?? 0),
      0
    )

    total += 1

    if (cart.completed_at) {
      completed += 1
      completedValues.push(value)
      continue
    }

    const lastModMs = Date.parse(cart.updated_at ?? cart.created_at ?? "")
    if (Number.isFinite(lastModMs) && now - lastModMs < ABANDONMENT_THRESHOLD_MS) {
      active += 1
    } else {
      abandoned += 1
      abandonedValues.push(value)
    }
  }

  const conversionRate = total > 0 ? completed / total : 0
  const abandonmentRate = total > 0 ? abandoned / total : 0

  const median = (arr: number[]): number => {
    if (arr.length === 0) return 0
    const sorted = [...arr].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]
  }

  const currency =
    carts.find((c) => typeof c.currency_code === "string")?.currency_code ?? "aud"

  return res.json({
    from: from.toISOString(),
    to: to.toISOString(),
    currency: currency.toLowerCase(),
    summary: {
      total_carts: total,
      completed_carts: completed,
      active_carts: active,
      abandoned_carts: abandoned,
      conversion_rate: Math.round(conversionRate * 1000) / 1000,
      abandonment_rate: Math.round(abandonmentRate * 1000) / 1000,
      median_completed_value: Math.round(median(completedValues) * 100) / 100,
      median_abandoned_value: Math.round(median(abandonedValues) * 100) / 100,
    },
    data_available: true,
  })
}
