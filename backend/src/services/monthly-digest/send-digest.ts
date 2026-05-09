import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import type {
  INotificationModuleService,
  MedusaContainer,
} from "@medusajs/framework/types"

import {
  ADMIN_PUBLIC_URL,
  BACKEND_URL,
  MONTHLY_DIGEST_RECIPIENTS,
  SUPPORT_REPLY_TO_EMAIL,
} from "../../lib/constants"
import { EmailTemplates } from "../../modules/email-notifications/templates"
import { buildMonthlyDigest, type MonthlyDigestPayload } from "./build-digest"

/**
 * Resolve the configured digest recipient list. Returns [] when the env
 * var is unset so the cron logs and exits cleanly.
 */
export const resolveDigestRecipients = (): string[] => {
  const raw = MONTHLY_DIGEST_RECIPIENTS?.trim()
  if (!raw) return []
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.includes("@"))
}

export const buildDigestSubject = (digest: MonthlyDigestPayload): string =>
  `SC Prints monthly digest — ${digest.period.label}`

/**
 * Send the digest to every configured recipient. One notification per
 * inbox so opens / replies are per-recipient. Idempotency lives in the
 * cron schedule, not here — calling this twice in the same month sends
 * twice on purpose (e.g. manual re-send via admin route).
 */
export async function sendMonthlyDigest(
  container: MedusaContainer,
  options: { digest?: MonthlyDigestPayload } = {}
): Promise<{ sent: number; recipients: string[]; skipped: string }> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const recipients = resolveDigestRecipients()
  if (recipients.length === 0) {
    logger.info(
      "monthly-digest: MONTHLY_DIGEST_RECIPIENTS unset — skipping send."
    )
    return { sent: 0, recipients: [], skipped: "no_recipients_configured" }
  }

  const digest = options.digest ?? (await buildMonthlyDigest(container))
  const adminUrl = ADMIN_PUBLIC_URL?.trim() || BACKEND_URL

  const notificationModuleService: INotificationModuleService =
    container.resolve(Modules.NOTIFICATION)

  let sent = 0
  for (const to of recipients) {
    try {
      await notificationModuleService.createNotifications({
        to,
        channel: "email",
        template: EmailTemplates.MONTHLY_DIGEST,
        data: {
          emailOptions: {
            replyTo: SUPPORT_REPLY_TO_EMAIL,
            subject: buildDigestSubject(digest),
          },
          digest,
          adminUrl,
        },
      })
      sent += 1
    } catch (err: any) {
      logger.error(
        `monthly-digest: failed to send to ${to}: ${err?.message ?? err}`
      )
    }
  }

  return { sent, recipients, skipped: "" }
}
