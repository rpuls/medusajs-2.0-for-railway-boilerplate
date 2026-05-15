import { createHash } from "node:crypto"

import type {
  ICustomerModuleService,
  MedusaContainer,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { Pool } from "pg"

import { DATABASE_URL } from "../../lib/constants"

const REDACT_STRING = "[redacted]"

const hashEmail = (email: string): string => {
  const digest = createHash("sha256").update(email.toLowerCase()).digest("hex")
  return `redacted-${digest.slice(0, 12)}@anon.invalid`
}

export type AnonymizeResult = {
  customer_id: string
  redacted_email: string
  designs_redacted: number
  addresses_redacted: number
  newsletter_rows_removed: number
  abandoned_cart_rows_removed: number
}

/**
 * Right-to-be-forgotten workflow: anonymises a customer in place
 * without deleting their order history (kept for tax/audit).
 *
 *   - email → "redacted-<hash>@anon.invalid" (deterministic so the
 *     same person re-requesting deletion remains identifiable to us
 *     for audit purposes only).
 *   - first/last name → "[redacted]"
 *   - phone → null
 *   - metadata → wiped, with `anonymized_at` stamped
 *   - addresses → all fields blanked
 *   - designs → name + customizer_metadata + thumbnail_url blanked
 *   - newsletter_subscriptions row deleted
 *   - abandoned_cart_followups rows deleted
 *
 * Idempotent — re-running on an already-anonymized customer is a
 * no-op (the hashed email won't match itself).
 */
export async function anonymizeCustomer(
  container: MedusaContainer,
  customerId: string,
  options: { actorId?: string | null } = {}
): Promise<AnonymizeResult> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const customerModuleService: ICustomerModuleService = container.resolve(
    Modules.CUSTOMER
  )
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const customer = await customerModuleService.retrieveCustomer(customerId, {
    relations: ["addresses"],
  })
  const originalEmail =
    typeof (customer as any).email === "string"
      ? (customer as any).email.toLowerCase()
      : ""
  const redactedEmail = originalEmail.startsWith("redacted-")
    ? originalEmail
    : hashEmail(originalEmail || customerId)

  await customerModuleService.updateCustomers(customerId, {
    email: redactedEmail,
    first_name: REDACT_STRING,
    last_name: REDACT_STRING,
    phone: null,
    company_name: null,
    metadata: {
      anonymized_at: new Date().toISOString(),
      anonymized_by: options.actorId ?? "system",
    },
  })

  const addresses = ((customer as any).addresses ?? []) as Array<{ id: string }>
  let addressesRedacted = 0
  for (const a of addresses) {
    try {
      await customerModuleService.updateCustomerAddresses(a.id, {
        first_name: REDACT_STRING,
        last_name: REDACT_STRING,
        company: null,
        address_1: REDACT_STRING,
        address_2: null,
        city: REDACT_STRING,
        postal_code: REDACT_STRING,
        province: null,
        phone: null,
        metadata: { anonymized_at: new Date().toISOString() },
      })
      addressesRedacted += 1
    } catch (err: any) {
      logger.warn(
        `anonymize: address ${a.id} failed: ${err?.message ?? err}`
      )
    }
  }

  let designsRedacted = 0
  try {
    const { data: designs } = await query.graph({
      entity: "design",
      fields: ["id"],
      filters: { customer_id: customerId },
      pagination: { take: 500, skip: 0 },
    })
    const ids = ((designs as any[]) ?? []).map((d) => d.id as string)
    if (ids.length > 0) {
      const designsService = (container as any).resolve("designs") as any
      for (const id of ids) {
        try {
          await designsService.updateDesigns(id, {
            name: REDACT_STRING,
            thumbnail_url: null,
            customizer_metadata: {},
          })
          designsRedacted += 1
        } catch (err: any) {
          logger.warn(
            `anonymize: design ${id} failed: ${err?.message ?? err}`
          )
        }
      }
    }
  } catch (err: any) {
    logger.warn(
      `anonymize: designs lookup failed for ${customerId}: ${err?.message ?? err}`
    )
  }

  let newsletterRemoved = 0
  let abandonedRemoved = 0
  if (originalEmail) {
    const pool = new Pool({ connectionString: DATABASE_URL })
    try {
      const a = await pool.query(
        `DELETE FROM newsletter_subscriptions WHERE email = $1 OR customer_id = $2`,
        [originalEmail, customerId]
      )
      newsletterRemoved = a.rowCount ?? 0
      const b = await pool.query(
        `DELETE FROM abandoned_cart_followups WHERE email = $1`,
        [originalEmail]
      )
      abandonedRemoved = b.rowCount ?? 0
    } catch (err: any) {
      logger.warn(`anonymize: raw cleanup failed: ${err?.message ?? err}`)
    } finally {
      await pool.end()
    }
  }

  return {
    customer_id: customerId,
    redacted_email: redactedEmail,
    designs_redacted: designsRedacted,
    addresses_redacted: addressesRedacted,
    newsletter_rows_removed: newsletterRemoved,
    abandoned_cart_rows_removed: abandonedRemoved,
  }
}
