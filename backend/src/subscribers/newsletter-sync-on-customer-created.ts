import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { ICustomerModuleService } from "@medusajs/framework/types"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { Pool } from "pg"

import { DATABASE_URL } from "../lib/constants"

/**
 * When a brand-new customer registers, propagate any pre-existing
 * newsletter opt-in onto their consent flag. Covers the gap between a
 * guest who submitted the newsletter form weeks ago and the same person
 * registering later — without this, they'd appear as a "no consent"
 * customer to the marketing crons.
 *
 * Idempotent: only acts if `marketing_consent_email` is currently unset.
 * Never overwrites an explicit `false` (impossible at customer.created
 * but coded defensively).
 */

let pool: Pool | null = null
const getPool = () => {
  if (!pool) {
    pool = new Pool({ connectionString: DATABASE_URL })
  }
  return pool
}

export default async function newsletterSyncOnCustomerCreated({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const customerId = data?.id
  if (!customerId) {
    return
  }

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const customerModuleService: ICustomerModuleService = container.resolve(
    Modules.CUSTOMER
  )

  let customer: any
  try {
    customer = await customerModuleService.retrieveCustomer(customerId)
  } catch (error) {
    logger.error(
      `newsletter-sync-on-customer-created: failed to retrieve customer ${customerId}: ${
        (error as Error).message
      }`
    )
    return
  }

  const email = typeof customer?.email === "string" ? customer.email.trim().toLowerCase() : ""
  if (!email) {
    return
  }

  const existingMeta = (customer.metadata ?? {}) as Record<string, unknown>
  if (typeof existingMeta.marketing_consent_email === "boolean") {
    return
  }

  const dbPool = getPool()
  let row: { id: string } | undefined
  try {
    const result = await dbPool.query<{ id: string }>(
      `SELECT id FROM newsletter_subscriptions WHERE email = $1 LIMIT 1`,
      [email]
    )
    row = result.rows[0]
  } catch (error) {
    logger.warn(
      `newsletter-sync-on-customer-created: lookup failed for ${email}: ${
        (error as Error).message
      }`
    )
    return
  }

  if (!row) {
    return
  }

  try {
    await customerModuleService.updateCustomers(customerId, {
      metadata: {
        marketing_consent_email: true,
        marketing_consent_updated_at: new Date().toISOString(),
        marketing_consent_source: "newsletter_migration",
      },
    })
    await dbPool.query(
      `UPDATE newsletter_subscriptions
          SET customer_id = $1, migrated_at = COALESCE(migrated_at, NOW())
        WHERE id = $2`,
      [customerId, row.id]
    )
  } catch (error) {
    logger.warn(
      `newsletter-sync-on-customer-created: stamp failed for ${customerId}: ${
        (error as Error).message
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
