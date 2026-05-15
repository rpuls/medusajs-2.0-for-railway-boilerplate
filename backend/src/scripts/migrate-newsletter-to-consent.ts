/**
 * Backfill `customer.metadata.marketing_consent_email = true` for every
 * `newsletter_subscriptions` row that already matches a registered
 * customer by email, and stamp the subscription row with `customer_id`
 * + `migrated_at` so it isn't reprocessed.
 *
 * Idempotent — rerunning is a no-op once every row has `migrated_at`.
 * Never overwrites an explicit `false` consent (preserves opt-outs).
 *
 * Local:    npx medusa exec ./src/scripts/migrate-newsletter-to-consent.ts
 * Railway:  cd /app/.medusa/server && npx medusa exec src/scripts/migrate-newsletter-to-consent.js
 */
import { ExecArgs } from "@medusajs/framework/types"
import type { ICustomerModuleService } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { Pool } from "pg"

import { DATABASE_URL } from "../lib/constants"

type SubscriptionRow = {
  id: string
  email: string
  customer_id: string | null
  migrated_at: string | null
}

export default async function migrateNewsletterToConsent({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const customerModuleService: ICustomerModuleService = container.resolve(
    Modules.CUSTOMER
  )

  const pool = new Pool({ connectionString: DATABASE_URL })

  try {
    await pool.query(`
      ALTER TABLE newsletter_subscriptions
        ADD COLUMN IF NOT EXISTS customer_id TEXT,
        ADD COLUMN IF NOT EXISTS migrated_at TIMESTAMPTZ
    `)

    const { rows } = await pool.query<SubscriptionRow>(`
      SELECT id, email, customer_id, migrated_at
        FROM newsletter_subscriptions
       WHERE migrated_at IS NULL
    `)

    if (rows.length === 0) {
      logger.info("migrate-newsletter-to-consent: nothing to migrate.")
      return
    }

    logger.info(
      `migrate-newsletter-to-consent: processing ${rows.length} subscription(s).`
    )

    let stamped = 0
    let unmatched = 0
    let preserved = 0
    const now = new Date().toISOString()

    for (const row of rows) {
      const { data: matches } = await query.graph({
        entity: "customer",
        fields: ["id", "metadata"],
        filters: { email: row.email },
      })
      const customer = matches?.[0]

      if (!customer) {
        await pool.query(
          `UPDATE newsletter_subscriptions
              SET migrated_at = NOW()
            WHERE id = $1`,
          [row.id]
        )
        unmatched += 1
        continue
      }

      const existingMeta = (customer.metadata as Record<string, unknown>) ?? {}
      const explicit = existingMeta.marketing_consent_email

      if (explicit === false) {
        await pool.query(
          `UPDATE newsletter_subscriptions
              SET customer_id = $1, migrated_at = NOW()
            WHERE id = $2`,
          [customer.id, row.id]
        )
        preserved += 1
        continue
      }

      if (explicit !== true) {
        await customerModuleService.updateCustomers(customer.id, {
          metadata: {
            marketing_consent_email: true,
            marketing_consent_updated_at: now,
            marketing_consent_source: "newsletter_migration",
          },
        })
      }

      await pool.query(
        `UPDATE newsletter_subscriptions
            SET customer_id = $1, migrated_at = NOW()
          WHERE id = $2`,
        [customer.id, row.id]
      )
      stamped += 1
    }

    logger.info(
      `migrate-newsletter-to-consent: stamped=${stamped} preserved_opt_out=${preserved} no_customer=${unmatched}`
    )
  } finally {
    await pool.end()
  }
}
