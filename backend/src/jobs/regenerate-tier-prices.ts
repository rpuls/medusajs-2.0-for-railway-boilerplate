import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import regenerateTierPriceLists from "../scripts/regenerate-tier-price-lists"

/**
 * Daily regen of the 8 customer-tier PriceLists from canonical variant cost.
 *
 * Runs at 06:00 UTC — after the supplier inventory + cost syncs finish:
 *   - AS Colour inventory sync (hourly)
 *   - FashionBiz inventory sync (04:00 UTC)
 *   - Aussie Pacific inventory sync (05:00 UTC)
 *
 * Idempotent. See `backend/src/scripts/regenerate-tier-price-lists.ts` for
 * the actual logic — this job just wraps it for scheduled execution.
 *
 * Safe to run with no tier groups seeded yet: the script bails with a warning
 * when it can't find the 8 CustomerGroups. So a fresh prod deploy can register
 * this job without any setup, and the cron will start doing real work after
 * staff run `seed-customer-tiers`.
 */
export default async function regenerateTierPricesJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  logger.info("[regenerate-tier-prices] starting scheduled run")
  try {
    await regenerateTierPriceLists({ container } as any)
    logger.info("[regenerate-tier-prices] completed")
  } catch (err: any) {
    logger.error(
      `[regenerate-tier-prices] failed — ${err?.message ?? err}\n${err?.stack ?? ""}`
    )
  }
}

export const config = {
  name: "regenerate-tier-prices",
  schedule: "0 6 * * *",
}
