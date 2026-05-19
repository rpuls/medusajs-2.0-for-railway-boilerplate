import type {
  ICustomerModuleService,
  INotificationModuleService,
  IOrderModuleService,
  MedusaContainer,
} from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

import {
  NPS_MAX_SENDS_PER_RUN,
  SUPPORT_REPLY_TO_EMAIL,
} from "../../lib/constants"
import { tagUrl } from "../../lib/email-utm"
import { getPostHog } from "../../lib/posthog"
import { shouldSendMarketingEmail } from "../../lib/marketing-email"
import { EmailTemplates } from "../../modules/email-notifications/templates"

import { buildNpsCandidates } from "./build-candidates"
import { signNpsRating } from "./sign"

const STOREFRONT_URL = process.env.STOREFRONT_URL?.replace(/\/$/, "")
const STOREFRONT_DEFAULT_COUNTRY_CODE =
  process.env.STOREFRONT_DEFAULT_COUNTRY_CODE?.toLowerCase()

const buildRatingUrl = (orderId: string, score: number): string => {
  if (!STOREFRONT_URL) return ""
  const prefix = STOREFRONT_DEFAULT_COUNTRY_CODE
    ? `/${STOREFRONT_DEFAULT_COUNTRY_CODE}`
    : ""
  const sig = signNpsRating(orderId, score)
  return tagUrl(
    `${STOREFRONT_URL}${prefix}/nps?order=${encodeURIComponent(orderId)}&score=${score}&sig=${sig}`,
    {
      medium: "marketing",
      campaign: "nps_request",
      content: `score_${score}`,
    }
  )
}

export type SendResult = {
  considered: number
  sent: number
  skipped_dry_run: number
  failures: number
}

export async function sendNpsRequests(
  container: MedusaContainer,
  options: { now?: Date; dryRun?: boolean; maxSends?: number } = {}
): Promise<SendResult> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const now = options.now ?? new Date()
  const dryRun = options.dryRun ?? false
  const maxSends = options.maxSends ?? NPS_MAX_SENDS_PER_RUN

  const candidates = await buildNpsCandidates(container, { now })
  if (candidates.length === 0) {
    logger.info("nps-requests: no candidates due.")
    return { considered: 0, sent: 0, skipped_dry_run: 0, failures: 0 }
  }

  const notificationModuleService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )
  const orderModuleService: IOrderModuleService = container.resolve(
    Modules.ORDER
  )
  const customerModuleService: ICustomerModuleService = container.resolve(
    Modules.CUSTOMER
  )

  let sent = 0
  let failures = 0
  let dryRunSkipped = 0
  let skippedNoConsent = 0
  const slice = candidates.slice(0, maxSends)
  for (const c of slice) {
    if (dryRun) {
      dryRunSkipped += 1
      continue
    }

    // Marketing-email gate: per-customer consent + suppression list.
    // NPS is borderline (post-purchase feedback request, not promo)
    // but it goes to the marketing inbox stream so treat it as
    // marketing for opt-out purposes — matches the Phase 8 plan.
    const gate = await shouldSendMarketingEmail({
      container,
      email: c.email,
      customer_id: c.customer_id ?? null,
      template_kind: "nps_request",
    })
    if (!gate.ok) {
      skippedNoConsent += 1
      continue
    }

    try {
      const ratingUrls = [1, 2, 3, 4, 5].map((score) => ({
        score,
        url: buildRatingUrl(c.order_id, score),
      }))

      await notificationModuleService.createNotifications({
        to: c.email,
        channel: "email",
        template: EmailTemplates.NPS_REQUEST,
        data: {
          emailOptions: {
            replyTo: SUPPORT_REPLY_TO_EMAIL,
            subject: `How was your SC Prints order${c.order_display_id ? ` #${c.order_display_id}` : ""}?`,
          },
          nps: {
            firstName: c.first_name,
            orderDisplayId: c.order_display_id,
            ratingUrls,
          },
        },
      })

      const order = await orderModuleService.retrieveOrder(c.order_id)
      const orderMeta = ((order as any).metadata ?? {}) as Record<string, unknown>
      await orderModuleService.updateOrders(c.order_id, {
        metadata: {
          ...orderMeta,
          nps_request_sent_at: now.toISOString(),
        },
      })

      if (c.customer_id) {
        await customerModuleService.updateCustomers(c.customer_id, {
          metadata: {
            last_nps_request_sent_at: now.toISOString(),
          },
        })
      }

      getPostHog()?.capture({
        distinctId: c.customer_id ?? c.email,
        event: "nps request sent",
        properties: {
          order_id: c.order_id,
          email: c.email,
        },
      })

      sent += 1
    } catch (err: any) {
      failures += 1
      logger.warn(
        `nps-requests: send failed for order ${c.order_id}: ${err?.message ?? err}`
      )
    }
  }

  return {
    considered: candidates.length,
    sent,
    skipped_dry_run: dryRunSkipped,
    failures,
  }
}
