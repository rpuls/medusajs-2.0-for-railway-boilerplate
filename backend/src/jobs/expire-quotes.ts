import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"

import { QUOTE_EXPIRY_CRON_ENABLED } from "../lib/constants"
import { QUOTE_MODULE } from "../modules/quote"
import { selectExpiredQuotes } from "../services/quote/expire"
import { writeAudit } from "../lib/audit-log"
import { AUDIT_ENTITY, AUDIT_ACTION } from "../lib/audit-entities"
import { captureEvent } from "../lib/posthog"

/**
 * Daily 23:45 UTC. Opt-in via `QUOTE_EXPIRY_CRON_ENABLED=true`.
 *
 * Walks every `quote` whose `status === "quoted"` and `expires_at` is
 * in the past; transitions them to `"expired"` and writes both a
 * `QuoteEvent` (in-quote audit) and an `audit_log` row (cross-entity
 * timeline). Idempotent — a second run after a successful run finds no
 * candidates.
 */
export default async function expireQuotesJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (!QUOTE_EXPIRY_CRON_ENABLED) {
    logger.info(
      "expire-quotes: QUOTE_EXPIRY_CRON_ENABLED not 'true' — skipping."
    )
    return
  }

  const quoteService = container.resolve(QUOTE_MODULE) as any
  const now = new Date()

  let candidates: Array<{ id: string; status: string; expires_at: any }> = []
  try {
    candidates = await quoteService.listQuotes(
      { status: "quoted" },
      { take: 1000, select: ["id", "status", "expires_at"] }
    )
  } catch (err: any) {
    logger.warn(`expire-quotes: list failed: ${err?.message ?? err}`)
    return
  }

  const ids = selectExpiredQuotes(candidates, now)
  if (ids.length === 0) {
    logger.info("expire-quotes: no candidates.")
    return
  }

  let updated = 0
  for (const id of ids) {
    try {
      await quoteService.updateQuotes([
        { id, status: "expired" },
      ])
      await quoteService.createQuoteEvents([
        {
          quote_id: id,
          type: "status_changed",
          actor: "system",
          body: { from: "quoted", to: "expired", reason: "expires_at_past" },
        },
      ])
      await writeAudit({
        container,
        entity: AUDIT_ENTITY.QUOTE,
        entity_id: id,
        action: AUDIT_ACTION.EXPIRED,
        actor_id: "system",
        actor_email: null,
        details: { reason: "expires_at_past", expired_at: now.toISOString() },
      })
      try {
        captureEvent("system", "quote_expired", { quote_id: id })
      } catch {
        /* best-effort */
      }
      updated += 1
    } catch (err: any) {
      logger.warn(
        `expire-quotes: failed to expire ${id}: ${err?.message ?? err}`
      )
    }
  }

  logger.info(
    `expire-quotes: considered=${candidates.length}, expired=${updated}`
  )
}

export const config = {
  name: "expire-quotes",
  schedule: "45 23 * * *",
}
