import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { RESEND_WEBHOOK_SECRET } from "../../../lib/constants"
import { verifyResendWebhook } from "../../../lib/resend-webhook"
import { ADMIN_WORKSPACE_MODULE } from "../../../modules/admin-workspace"
import { writeAudit } from "../../../lib/audit-log"
import { AUDIT_ACTION, AUDIT_ENTITY } from "../../../lib/audit-entities"
import { captureEvent } from "../../../lib/posthog"

/**
 * POST /hooks/resend
 *
 * Resend webhook handler. Subscribed events:
 *   - email.bounced       → auto-suppress (reason: bounce)
 *   - email.complained    → auto-suppress (reason: spam_complaint)
 *   - email.opened        → audit-only (kept for engagement metrics)
 *   - email.clicked       → audit-only
 *
 * Requires `RESEND_WEBHOOK_SECRET`. When unset the route returns 503
 * so dev environments don't accidentally process unsigned payloads.
 *
 * Raw body is required for signature verification — registered as a
 * raw-body matcher in src/api/middlewares.ts.
 *
 * Idempotency: every Svix `svix-id` is inserted into resend_event on
 * first receipt; retries short-circuit on the unique-PK conflict.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER) as any

  if (!RESEND_WEBHOOK_SECRET) {
    logger.warn(
      "hooks/resend: RESEND_WEBHOOK_SECRET not configured — refusing webhook."
    )
    return res.status(503).json({ error: "webhook_not_configured" })
  }

  const rawBody =
    typeof (req as any).rawBody === "string"
      ? (req as any).rawBody
      : Buffer.isBuffer((req as any).rawBody)
        ? (req as any).rawBody.toString("utf8")
        : JSON.stringify(req.body ?? {})

  const verified = verifyResendWebhook({
    id: req.headers["svix-id"] as string | undefined,
    timestamp: req.headers["svix-timestamp"] as string | undefined,
    signatureHeader: req.headers["svix-signature"] as string | undefined,
    rawBody,
    secret: RESEND_WEBHOOK_SECRET,
  })

  if (verified.ok === false) {
    logger.warn(`hooks/resend: signature verification failed (${verified.reason})`)
    return res.status(401).json({ error: verified.reason })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return res.status(400).json({ error: "invalid_json" })
  }

  const eventType: string = String(payload?.type ?? "")
  if (!eventType) {
    return res.status(400).json({ error: "missing_event_type" })
  }

  const eventId = verified.id

  // Idempotency: insert resend_event row; conflict on unique PK = retry
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  try {
    await service.createResendEvents({ id: eventId, event_type: eventType })
  } catch (err: any) {
    // Treat duplicate-key as "already processed" — return 200 so Resend
    // stops retrying.
    if (String(err?.message ?? err).match(/duplicate|unique/i)) {
      return res.status(200).json({ ok: true, idempotent: true })
    }
    logger.warn(`hooks/resend: idempotency insert failed: ${err?.message ?? err}`)
    // Continue — losing a single audit row is better than failing the
    // webhook and accumulating bounces.
  }

  const data = (payload?.data ?? {}) as Record<string, unknown>
  const email = String(data?.to ?? data?.email ?? "").trim().toLowerCase()
  if (!email) {
    return res.status(200).json({ ok: true, no_email: true })
  }

  // Find a matching customer for richer audit context.
  let customerId: string | null = null
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as any
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id"],
      filters: { email },
      pagination: { take: 1 },
    })
    customerId = (customers as any[])?.[0]?.id ?? null
  } catch {
    /* soft fail */
  }

  switch (eventType) {
    case "email.bounced":
    case "email.complained": {
      const reason =
        eventType === "email.bounced" ? "bounce" : "spam_complaint"
      try {
        // Insert global suppression (template_kind: null). Idempotent
        // via the unique (email, template_kind) index — duplicate
        // throws and we swallow.
        await service.createEmailSuppressions({
          email,
          template_kind: null,
          reason,
          source: "resend_webhook",
        })
      } catch (err: any) {
        if (!String(err?.message ?? err).match(/duplicate|unique/i)) {
          logger.warn(
            `hooks/resend: suppression insert failed for ${email}: ${err?.message ?? err}`
          )
        }
      }
      if (customerId) {
        await writeAudit({
          container: req.scope as any,
          entity: AUDIT_ENTITY.CUSTOMER,
          entity_id: customerId,
          action:
            eventType === "email.bounced"
              ? AUDIT_ACTION.EMAIL_BOUNCED
              : AUDIT_ACTION.EMAIL_SUPPRESSED,
          actor_email: email,
          details: { reason, resend_event_id: eventId },
        })
      }
      try {
        captureEvent(email, "marketing_suppression_added", {
          reason,
          source: "resend_webhook",
        })
      } catch {
        /* best-effort */
      }
      break
    }
    case "email.opened":
    case "email.clicked": {
      if (customerId) {
        await writeAudit({
          container: req.scope as any,
          entity: AUDIT_ENTITY.CUSTOMER,
          entity_id: customerId,
          action:
            eventType === "email.opened"
              ? AUDIT_ACTION.EMAIL_OPENED
              : AUDIT_ACTION.EMAIL_CLICKED,
          actor_email: email,
          details: {
            resend_event_id: eventId,
            click_url:
              eventType === "email.clicked"
                ? typeof data?.click === "object" && data?.click
                  ? (data.click as any).link ?? null
                  : null
                : null,
          },
        })
      }
      try {
        captureEvent(
          email,
          eventType === "email.opened" ? "email_opened" : "email_clicked",
          { resend_event_id: eventId }
        )
      } catch {
        /* best-effort */
      }
      break
    }
    default:
      // Unknown event types are accepted (200) so Resend doesn't retry;
      // we just log them for observability.
      logger.info(`hooks/resend: ignored event type "${eventType}"`)
  }

  return res.status(200).json({ ok: true })
}
