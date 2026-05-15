import { Pool } from "pg"

import { DATABASE_URL } from "../../lib/constants"

/**
 * Stamps `converted_at = NOW()` on every outstanding abandoned-cart
 * follow-up for the given email. Stops the cron from re-sending once
 * the customer has placed an order. Idempotent.
 *
 * Called from the `order.placed` subscriber. Resolves silently on error
 * so a transient DB blip never blocks the order pipeline.
 */
export async function markAbandonedCartConverted(opts: {
  email?: string | null
}): Promise<void> {
  const email = typeof opts.email === "string" ? opts.email.trim().toLowerCase() : ""
  if (!email) return

  const pool = new Pool({ connectionString: DATABASE_URL })
  try {
    await pool.query(
      `UPDATE abandoned_cart_followups
          SET converted_at = NOW()
        WHERE email = $1
          AND converted_at IS NULL`,
      [email]
    )
  } finally {
    await pool.end()
  }
}
