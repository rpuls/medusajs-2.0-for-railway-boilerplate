import { MedusaContainer } from "@medusajs/framework/types"
import type { IOrderModuleService } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ASCOLOUR_MODULE } from "../modules/ascolour"
import AsColourService from "../modules/ascolour/service"
import {
  AscolourShipmentSummary,
  isTerminalAscolourStatus,
  summarizeShipments,
} from "../lib/ascolour-status"

const MAX_ORDERS_PER_RUN = 200
const LOOKBACK_DAYS = 180

/**
 * Polls AS Colour for order + shipment status on every Medusa order that
 * has been forwarded to them but isn't in a terminal state. Persists the
 * latest status, shipments, and a sync timestamp into order metadata so
 * the admin widget can render without hitting AS Colour itself.
 *
 * AS Colour has no webhooks for order state, so polling is the only
 * option. 15-min cadence balances freshness against API load (the trade
 * API is rate-limited to a few thousand calls per day).
 */
export default async function syncAsColourOrderStatus(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  let ascolour: AsColourService
  try {
    ascolour = container.resolve(ASCOLOUR_MODULE) as AsColourService
  } catch {
    logger.warn("AS Colour module not registered — skipping order-status sync.")
    return
  }

  const orderModuleService = container.resolve<IOrderModuleService>(Modules.ORDER)

  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const { data: candidates } = await query.graph({
    entity: "order",
    fields: ["id", "metadata", "created_at"],
    pagination: { take: 1000, skip: 0, order: { created_at: "DESC" } },
  })

  const pending = ((candidates as any[]) ?? [])
    .filter((o) => {
      const t = Date.parse(o?.created_at ?? "")
      if (!Number.isFinite(t) || t < Date.parse(since)) return false
      const meta = (o?.metadata ?? {}) as Record<string, any>
      if (!meta.ascolour_order_id) return false
      if (isTerminalAscolourStatus(meta.ascolour_status)) return false
      return true
    })
    .slice(0, MAX_ORDERS_PER_RUN)

  if (!pending.length) {
    logger.info("AS Colour order-status sync: no non-terminal orders to refresh.")
    return
  }

  logger.info(`AS Colour order-status sync: refreshing ${pending.length} order(s).`)

  const client = ascolour.getClient()
  let updated = 0
  let failed = 0

  for (const order of pending) {
    const meta = (order.metadata ?? {}) as Record<string, any>
    const ascolourOrderId = String(meta.ascolour_order_id)
    try {
      const remote = await client.getOrder(ascolourOrderId)
      let shipments: AscolourShipmentSummary[] = []
      try {
        const raw = await client.getOrderShipments(ascolourOrderId)
        shipments = summarizeShipments(raw as any)
      } catch (e: any) {
        // Shipment endpoint can 404 before any shipment exists — non-fatal.
        logger.debug?.(
          `AS Colour shipments fetch failed for ${ascolourOrderId}: ${e?.message ?? e}`
        )
      }

      const nextStatus = remote?.status ?? meta.ascolour_status ?? null
      await orderModuleService.updateOrders(order.id, {
        metadata: {
          ...meta,
          ascolour_status: nextStatus,
          ascolour_shipments: shipments,
          ascolour_last_synced_at: new Date().toISOString(),
          ascolour_last_sync_error: null,
        },
      })
      updated += 1
    } catch (err: any) {
      failed += 1
      logger.warn(
        `AS Colour order-status sync failed for ${ascolourOrderId}: ${err?.message ?? err}`
      )
      try {
        await orderModuleService.updateOrders(order.id, {
          metadata: {
            ...meta,
            ascolour_last_sync_error: String(err?.message ?? err),
            ascolour_last_synced_at: new Date().toISOString(),
          },
        })
      } catch {
        // Swallow — we already logged the underlying problem.
      }
    }
  }

  logger.info(
    `AS Colour order-status sync done — refreshed: ${updated}, failed: ${failed}.`
  )
}

export const config = {
  name: "sync-ascolour-order-status",
  schedule: "*/15 * * * *",
}
