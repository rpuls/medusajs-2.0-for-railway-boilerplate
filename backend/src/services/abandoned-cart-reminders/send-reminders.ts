import type {
  INotificationModuleService,
  MedusaContainer,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { Pool } from "pg"

import {
  ABANDONED_CART_MAX_SENDS_PER_RUN,
  DATABASE_URL,
  SUPPORT_REPLY_TO_EMAIL,
} from "../../lib/constants"
import { getPostHog } from "../../lib/posthog"
import { EmailTemplates } from "../../modules/email-notifications/templates"

import { buildAbandonedCartCandidates } from "./build-candidates"

export type SendResult = {
  considered: number
  sent: number
  skipped_dry_run: number
  failures: number
}

export async function sendAbandonedCartReminders(
  container: MedusaContainer,
  options: { now?: Date; dryRun?: boolean; maxSends?: number } = {}
): Promise<SendResult> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const now = options.now ?? new Date()
  const dryRun = options.dryRun ?? false
  const maxSends = options.maxSends ?? ABANDONED_CART_MAX_SENDS_PER_RUN

  const candidates = await buildAbandonedCartCandidates(container, { now })
  if (candidates.length === 0) {
    logger.info("abandoned-cart-reminders: no candidates due.")
    return { considered: 0, sent: 0, skipped_dry_run: 0, failures: 0 }
  }

  const notificationModuleService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )

  const pool = new Pool({ connectionString: DATABASE_URL })

  let sent = 0
  let dryRunSkipped = 0
  let failures = 0
  try {
    const slice = candidates.slice(0, maxSends)
    for (const c of slice) {
      if (dryRun) {
        dryRunSkipped += 1
        continue
      }
      try {
        await notificationModuleService.createNotifications({
          to: c.email,
          channel: "email",
          template: EmailTemplates.CART_REMINDER,
          data: {
            emailOptions: {
              subject: "Your SC PRINTS cart is saved for you",
              replyTo: SUPPORT_REPLY_TO_EMAIL,
            },
            reminder: {
              cartId: c.cart_id,
              email: c.email,
              itemCount: c.item_count,
              currencyCode: c.currency_code,
              cartTotal: c.cart_total,
              countryCode: c.country_code,
              items: c.items_snapshot.map((it) => ({
                title: typeof it?.title === "string" ? it.title : null,
                quantity: typeof it?.quantity === "number" ? it.quantity : null,
              })),
            },
            preview: "Your cart is saved and ready when you are.",
          },
        })

        await pool.query(
          `UPDATE abandoned_cart_followups
              SET reminder_sent_at = $1
            WHERE id = $2`,
          [now.toISOString(), c.id]
        )

        getPostHog()?.capture({
          distinctId: c.customer_id ?? c.email,
          event: "cart reminder sent",
          properties: {
            cart_id: c.cart_id,
            email: c.email,
            item_count: c.item_count,
            cart_total: c.cart_total,
            currency_code: c.currency_code,
          },
        })

        sent += 1
      } catch (err: any) {
        failures += 1
        logger.warn(
          `abandoned-cart-reminders: send failed for cart ${c.cart_id}: ${err?.message ?? err}`
        )
      }
    }
  } finally {
    await pool.end()
  }

  return {
    considered: candidates.length,
    sent,
    skipped_dry_run: dryRunSkipped,
    failures,
  }
}
