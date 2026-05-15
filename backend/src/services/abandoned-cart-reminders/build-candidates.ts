import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { Pool } from "pg"

import {
  ABANDONED_CART_AGE_MAX_HOURS,
  ABANDONED_CART_AGE_MIN_HOURS,
  DATABASE_URL,
} from "../../lib/constants"

export type AbandonedCartCandidate = {
  id: string
  cart_id: string
  email: string
  country_code: string | null
  currency_code: string | null
  cart_total: number | null
  item_count: number
  items_snapshot: Array<{ title?: string | null; quantity?: number | null }>
  created_at: string
  customer_id: string | null
}

/**
 * Pulls candidates from `abandoned_cart_followups` that are:
 *   - older than ABANDONED_CART_AGE_MIN_HOURS (give the customer a
 *     chance to come back on their own)
 *   - younger than ABANDONED_CART_AGE_MAX_HOURS (older = lost cause)
 *   - never reminded (`reminder_sent_at IS NULL`)
 *   - never converted (`converted_at IS NULL`)
 *   - have items (`item_count > 0`)
 *
 * Then filters out any whose email matches a registered customer with
 * `marketing_consent_email = false`. Customers with consent unset
 * (legacy) get the benefit of the doubt; the migration script gives
 * existing newsletter subscribers an explicit true. Customers we have
 * never seen are kept (guest carts).
 */
export async function buildAbandonedCartCandidates(
  container: MedusaContainer,
  options: { now?: Date; minAgeHours?: number; maxAgeHours?: number } = {}
): Promise<AbandonedCartCandidate[]> {
  const now = options.now ?? new Date()
  const minAge = options.minAgeHours ?? ABANDONED_CART_AGE_MIN_HOURS
  const maxAge = options.maxAgeHours ?? ABANDONED_CART_AGE_MAX_HOURS
  const minAgeIso = new Date(now.getTime() - minAge * 60 * 60 * 1000).toISOString()
  const maxAgeIso = new Date(now.getTime() - maxAge * 60 * 60 * 1000).toISOString()

  const pool = new Pool({ connectionString: DATABASE_URL })
  let rows: any[] = []
  try {
    const result = await pool.query(
      `
        SELECT id, cart_id, email, country_code, currency_code, cart_total,
               item_count, items_snapshot, created_at
          FROM abandoned_cart_followups
         WHERE created_at <= $1
           AND created_at >= $2
           AND reminder_sent_at IS NULL
           AND converted_at IS NULL
           AND item_count > 0
         ORDER BY created_at ASC
      `,
      [minAgeIso, maxAgeIso]
    )
    rows = result.rows ?? []
  } finally {
    await pool.end()
  }

  if (rows.length === 0) return []

  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const candidates: AbandonedCartCandidate[] = []
  const seenEmails = new Map<string, { allowed: boolean; customerId: string | null }>()

  for (const row of rows) {
    const email = String(row.email).toLowerCase()
    let lookup = seenEmails.get(email)
    if (!lookup) {
      try {
        const { data } = await query.graph({
          entity: "customer",
          fields: ["id", "metadata"],
          filters: { email },
        })
        const customer = (data as any[])?.[0]
        if (!customer) {
          lookup = { allowed: true, customerId: null }
        } else {
          const consent = (customer.metadata as Record<string, unknown>)
            ?.marketing_consent_email
          lookup = {
            allowed: consent !== false,
            customerId: customer.id,
          }
        }
      } catch {
        lookup = { allowed: true, customerId: null }
      }
      seenEmails.set(email, lookup)
    }

    if (!lookup.allowed) continue

    candidates.push({
      id: row.id,
      cart_id: row.cart_id,
      email,
      country_code: row.country_code ?? null,
      currency_code: row.currency_code ?? null,
      cart_total:
        typeof row.cart_total === "number"
          ? row.cart_total
          : row.cart_total === null
            ? null
            : Number(row.cart_total),
      item_count: Number(row.item_count ?? 0),
      items_snapshot: Array.isArray(row.items_snapshot) ? row.items_snapshot : [],
      created_at:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : String(row.created_at),
      customer_id: lookup.customerId,
    })
  }

  return candidates
}
