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
import { tagUrl } from "../../lib/email-utm"
import { shouldSendMarketingEmail } from "../../lib/marketing-email"
import { buildUnsubscribeUrl } from "../../lib/unsubscribe-token"
import { EmailTemplates } from "../../modules/email-notifications/templates"
import { buildChurnQueue, type ChurnCandidate } from "./build-queue"

const STOREFRONT_URL = process.env.STOREFRONT_URL?.replace(/\/$/, "")
const STOREFRONT_DEFAULT_COUNTRY_CODE =
  process.env.STOREFRONT_DEFAULT_COUNTRY_CODE?.toLowerCase()

const SUBJECT_BY_SEVERITY: Record<ChurnCandidate["severity"], string> = {
  drifting: "Haven't seen you in a bit — anything we can help with?",
  at_risk: "It's been a while — we'd love to have you back",
  lost: "One last hello from SC Prints",
}

const buildPrefix = (countryCode: string | null): string => {
  const country =
    countryCode || STOREFRONT_DEFAULT_COUNTRY_CODE || null
  return country ? `/${country}` : ""
}

const buildStorefrontUrl = (
  candidate: ChurnCandidate
): string | null => {
  if (!STOREFRONT_URL) return null
  return `${STOREFRONT_URL}${buildPrefix(candidate.country_code)}`
}

const buildCustomizerUrl = (
  candidate: ChurnCandidate
): string | null => {
  if (!STOREFRONT_URL) return null
  return `${STOREFRONT_URL}${buildPrefix(candidate.country_code)}/customizer`
}

const buildOrdersUrl = (candidate: ChurnCandidate): string | null => {
  if (!STOREFRONT_URL) return null
  return `${STOREFRONT_URL}${buildPrefix(candidate.country_code)}/account/orders`
}

/**
 * Send win-back emails to a batch of churn candidates and stamp
 * `customer.metadata.last_winback_sent_at`. `maxSends` defaults conservative
 * — these are inbox writes to long-dormant customers and a poorly-tuned run
 * could trip spam filters.
 */
export async function sendWinbackEmails(
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
  const maxSends = options.maxSends ?? 25
  const now = options.now ?? new Date()

  const candidates = await buildChurnQueue(container, { now })
  if (candidates.length === 0) {
    logger.info("winback: no candidates due.")
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
    // Belt-and-braces marketing gate.  buildChurnQueue already filters
    // out `marketing_consent_email === false`; this adds the suppression-
    // table check (and is the canonical place for future per-stream
    // logic).
    const gate = await shouldSendMarketingEmail({
      container,
      email: c.email,
      customer_id: (c as any).customer_id ?? null,
      template_kind: "winback",
    })
    if (!gate.ok) continue
    const unsubscribeUrl = buildUnsubscribeUrl(c.email, "winback")
    try {
      await notificationModuleService.createNotifications({
        to: c.email,
        channel: "email",
        template: EmailTemplates.WINBACK,
        data: {
          emailOptions: {
            replyTo: SUPPORT_REPLY_TO_EMAIL,
            subject: SUBJECT_BY_SEVERITY[c.severity],
            headers: {
              "List-Unsubscribe": `<${unsubscribeUrl}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          },
          winback: {
            firstName: c.first_name,
            severity: c.severity,
            daysSinceLast: c.days_since_last,
            lastOrderDisplayId: c.last_order_display_id,
            storefrontUrl: tagUrl(buildStorefrontUrl(c), {
              medium: "marketing",
              campaign: `winback_${c.severity}`,
              content: "homepage",
            }),
            storeOrdersUrl: tagUrl(buildOrdersUrl(c), {
              medium: "marketing",
              campaign: `winback_${c.severity}`,
              content: "orders_history",
            }),
            customizerUrl: tagUrl(buildCustomizerUrl(c), {
              medium: "marketing",
              campaign: `winback_${c.severity}`,
              content: "primary_cta",
            }),
          },
          unsubscribeUrl,
        },
      })
      sent += 1

      if (c.customer_id) {
        try {
          await customerModuleService.updateCustomers(c.customer_id, {
            metadata: {
              last_winback_sent_at: now.toISOString(),
            },
          })
        } catch (err: any) {
          logger.warn(
            `winback: sent to ${c.email} but failed to stamp customer metadata: ${err?.message ?? err}`
          )
        }
      }
    } catch (err: any) {
      failures += 1
      logger.error(
        `winback: send failed for ${c.email}: ${err?.message ?? err}`
      )
    }
  }

  logger.info(
    `winback: ${dryRun ? "DRY RUN " : ""}considered=${candidates.length}, sent=${sent}, failures=${failures}, dry_run_skipped=${dryRunSkipped}`
  )

  return {
    sent,
    considered: candidates.length,
    skipped_dry_run: dryRunSkipped,
    failures,
  }
}
