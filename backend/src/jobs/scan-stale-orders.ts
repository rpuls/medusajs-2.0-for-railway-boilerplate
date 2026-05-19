import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { STALE_ORDER_ALERTS_ENABLED } from "../lib/constants"
import { scanStaleOrders } from "../services/stale-orders/scan"

/**
 * Daily stale-order scan at 08:00 UTC (~18:00 AEST). Opt-in via
 * STALE_ORDER_ALERTS_ENABLED. Stamps `metadata.is_stale` on orders
 * whose production_stage hasn't advanced in N days; clears the flag
 * when staff move the order forward.
 */
export default async function scanStaleOrdersJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (!STALE_ORDER_ALERTS_ENABLED) {
    logger.info("scan-stale-orders: STALE_ORDER_ALERTS_ENABLED not 'true' — skipping.")
    return
  }
  try {
    const result = await scanStaleOrders(container)
    const notify = result.notify
    const notifyBits = notify
      ? `, tasks_created=${notify.tasks_created}, owners_notified=${notify.owners_notified}, managers_escalated=${notify.managers_escalated}`
      : ""
    logger.info(
      `scan-stale-orders: considered=${result.considered}, newly_stale=${result.newly_stale.length}, cleared=${result.cleared}${notifyBits}`
    )
  } catch (err: any) {
    logger.error(`scan-stale-orders: ${err?.message ?? err}`)
  }
}

export const config = {
  name: "scan-stale-orders",
  schedule: "0 8 * * *",
}
