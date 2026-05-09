import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import type {
  ICustomerModuleService,
  INotificationModuleService,
  MedusaContainer,
} from "@medusajs/framework/types"

import { SUPPORT_REPLY_TO_EMAIL } from "../../lib/constants"
import { EmailTemplates } from "../../modules/email-notifications/templates"
import {
  buildReorderCandidates,
  type ReorderCandidate,
} from "./build-candidates"

const STOREFRONT_URL = process.env.STOREFRONT_URL?.replace(/\/$/, "")
const STOREFRONT_DEFAULT_COUNTRY_CODE =
  process.env.STOREFRONT_DEFAULT_COUNTRY_CODE?.toLowerCase()

const buildReorderUrl = (candidate: ReorderCandidate): string | null => {
  if (!STOREFRONT_URL) return null
  const country =
    candidate.country_code ||
    STOREFRONT_DEFAULT_COUNTRY_CODE ||
    null
  const prefix = country ? `/${country}` : ""
  if (candidate.reorder_line_item_id) {
    return `${STOREFRONT_URL}${prefix}/customizer?reorder=${encodeURIComponent(candidate.last_order_id)}:${encodeURIComponent(candidate.reorder_line_item_id)}`
  }
  // Fallback to the order detail page where the customer has per-line
  // "Re-order" buttons.
  return `${STOREFRONT_URL}${prefix}/account/orders/details/${encodeURIComponent(candidate.last_order_id)}`
}

const buildAccountOrdersUrl = (
  candidate: ReorderCandidate
): string | null => {
  if (!STOREFRONT_URL) return null
  const country =
    candidate.country_code ||
    STOREFRONT_DEFAULT_COUNTRY_CODE ||
    null
  const prefix = country ? `/${country}` : ""
  return `${STOREFRONT_URL}${prefix}/account/orders`
}

/**
 * Send reminders to a batch of candidates and stamp
 * `metadata.last_reorder_reminder_sent_at` on each customer record so
 * the next pass doesn't re-target the same person.
 *
 * Caps `maxSends` per run as a safety valve — if `buildReorderCandidates`
 * suddenly produces hundreds of matches (e.g. data quality bug), we'd
 * rather email no one than email everyone.
 */
export async function sendReorderReminders(
  container: MedusaContainer,
  options: { dryRun?: boolean; maxSends?: number; now?: Date } = {}
): Promise<{
  sent: number
  considered: number
  skipped_dry_run: number
  failures: number
}> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const dryRun = options.dryRun === true
  const maxSends = options.maxSends ?? 50
  const now = options.now ?? new Date()

  const candidates = await buildReorderCandidates(container, { now })
  if (candidates.length === 0) {
    logger.info("reorder-reminders: no candidates due.")
    return { sent: 0, considered: 0, skipped_dry_run: 0, failures: 0 }
  }

  const notificationModuleService: INotificationModuleService =
    container.resolve(Modules.NOTIFICATION)
  const customerModuleService: ICustomerModuleService =
    container.resolve(Modules.CUSTOMER)

  let sent = 0
  let failures = 0
  let dryRunSkipped = 0
  const slice = candidates.slice(0, maxSends)
  for (const c of slice) {
    if (dryRun) {
      dryRunSkipped += 1
      continue
    }
    const reorderUrl = buildReorderUrl(c)
    const accountOrdersUrl = buildAccountOrdersUrl(c)

    try {
      await notificationModuleService.createNotifications({
        to: c.email,
        channel: "email",
        template: EmailTemplates.REORDER_REMINDER,
        data: {
          emailOptions: {
            replyTo: SUPPORT_REPLY_TO_EMAIL,
            subject: `Time to reorder?${c.last_order_display_id ? ` (your last was #${c.last_order_display_id})` : ""}`,
          },
          reminder: {
            firstName: c.first_name,
            lastOrderDisplayId: c.last_order_display_id,
            lastOrderTotal: c.last_order_total,
            currencyCode: c.currency_code,
            daysSinceLast: c.days_since_last,
            medianGapDays: c.median_gap_days,
            reorderUrl,
            accountOrdersUrl,
          },
        },
      })
      sent += 1

      if (c.customer_id) {
        try {
          await customerModuleService.updateCustomers(c.customer_id, {
            metadata: {
              last_reorder_reminder_sent_at: now.toISOString(),
            },
          })
        } catch (err: any) {
          logger.warn(
            `reorder-reminders: stamped email for ${c.email} but failed to update customer metadata: ${err?.message ?? err}`
          )
        }
      }
    } catch (err: any) {
      failures += 1
      logger.error(
        `reorder-reminders: send failed for ${c.email}: ${err?.message ?? err}`
      )
    }
  }

  logger.info(
    `reorder-reminders: ${dryRun ? "DRY RUN " : ""}considered=${candidates.length}, sent=${sent}, failures=${failures}, skipped_for_dry_run=${dryRunSkipped}`
  )

  return {
    sent,
    considered: candidates.length,
    skipped_dry_run: dryRunSkipped,
    failures,
  }
}
