import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

import { TIERS } from "../lib/customer-tiers"

/**
 * Seeds the 8 customer-tier groups in Medusa's customer module.
 *
 * Idempotent. For each tier in `TIERS`:
 *   - Find existing CustomerGroup by `name = "Tier: <name>"`
 *   - If missing, create it with `metadata = { tier_slug, tier_multiplier, tier_rank }`
 *   - If present but metadata drifted, update it
 *
 * Usage:
 *   npx medusa exec ./src/scripts/seed-customer-tiers.ts
 *
 * Railway:
 *   cd /app/.medusa/server && npx medusa exec ./src/scripts/seed-customer-tiers.js
 */
export default async function seedCustomerTiers({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const customerModuleService = container.resolve(Modules.CUSTOMER) as any

  logger.info(`[seed-customer-tiers] starting — ${TIERS.length} tiers to ensure`)

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const tier of TIERS) {
    const desiredMetadata = {
      tier_slug: tier.slug,
      tier_multiplier: tier.multiplier,
      tier_rank: tier.rank,
    }

    const { data: existing } = await query.graph({
      entity: "customer_group",
      fields: ["id", "name", "metadata"],
      filters: { name: tier.name } as any,
    })

    const found = (existing as any[])?.[0]

    if (!found) {
      const result = await customerModuleService.createCustomerGroups({
        name: tier.name,
        metadata: desiredMetadata,
      })
      created++
      logger.info(
        `[seed-customer-tiers] created "${tier.name}" (id=${result?.id ?? "?"})`
      )
      continue
    }

    const currentMeta = (found.metadata ?? {}) as Record<string, unknown>
    const drifted =
      currentMeta.tier_slug !== desiredMetadata.tier_slug ||
      currentMeta.tier_multiplier !== desiredMetadata.tier_multiplier ||
      currentMeta.tier_rank !== desiredMetadata.tier_rank

    if (!drifted) {
      unchanged++
      continue
    }

    await customerModuleService.updateCustomerGroups(found.id, {
      metadata: {
        ...currentMeta,
        ...desiredMetadata,
      },
    })
    updated++
    logger.info(
      `[seed-customer-tiers] updated metadata on "${tier.name}" (id=${found.id})`
    )
  }

  logger.info(
    `[seed-customer-tiers] done — created ${created}, updated ${updated}, unchanged ${unchanged}`
  )
}
