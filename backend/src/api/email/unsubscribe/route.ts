import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { ADMIN_WORKSPACE_MODULE } from "../../../modules/admin-workspace"
import {
  MARKETING_PREFERENCE_CENTER_URL,
} from "../../../lib/constants"
import { verifyUnsubscribe } from "../../../lib/unsubscribe-token"
import { writeAudit } from "../../../lib/audit-log"
import { AUDIT_ACTION, AUDIT_ENTITY } from "../../../lib/audit-entities"
import { captureEvent } from "../../../lib/posthog"

/**
 * GET /email/unsubscribe?email=&kind=&sig=
 *
 * One-click unsubscribe endpoint embedded in marketing email footers.
 * On valid signature:
 *   1. Insert email_suppression row (idempotent — unique on (email, kind))
 *   2. Write audit row entity=customer if a matching customer exists
 *   3. Emit `marketing_unsubscribe_clicked` PostHog event
 *   4. Redirect to the storefront's preference center (or a static
 *      thank-you page if no preference-center URL is configured)
 *
 * Bad signature returns 400 — we don't want to give crawlers a way to
 * mass-unsubscribe by guessing emails.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const q = req.query ?? {}
  const verified = verifyUnsubscribe({
    email: String(q.email ?? ""),
    kind: String(q.kind ?? ""),
    sig: String(q.sig ?? ""),
  })
  if (!verified.ok) {
    return res.status(400).send("Invalid or expired unsubscribe link.")
  }

  const { email, kind } = verified
  const templateKind = kind === "all" ? null : kind

  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER) as any
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any

  // Idempotency: if a row already exists for this (email, template_kind),
  // we still complete the redirect — the customer sees "you're
  // unsubscribed" regardless.
  let alreadyExists = false
  try {
    const existing: any[] = await service.listEmailSuppressions(
      { email, template_kind: templateKind },
      { take: 1 }
    )
    alreadyExists = existing.length > 0
  } catch (err: any) {
    logger.warn?.(
      `email/unsubscribe: list failed for ${email}: ${err?.message ?? err}`
    )
  }

  if (!alreadyExists) {
    try {
      await service.createEmailSuppressions({
        email,
        template_kind: templateKind,
        reason: "user_unsubscribe",
        source: "one_click_email",
      })
    } catch (err: any) {
      logger.warn?.(
        `email/unsubscribe: create failed for ${email}: ${err?.message ?? err}`
      )
      // Keep going — the redirect should still happen so the customer
      // doesn't see a backend error from clicking their unsubscribe link.
    }
  }

  // Audit: try to resolve a customer for richer activity feed.
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as any
    const { data } = await query.graph({
      entity: "customer",
      fields: ["id", "email", "metadata"],
      filters: { email },
      pagination: { take: 1 },
    })
    const customer = (data as any[])?.[0]
    if (customer?.id) {
      await writeAudit({
        container: req.scope as any,
        entity: AUDIT_ENTITY.CUSTOMER,
        entity_id: customer.id,
        action: AUDIT_ACTION.EMAIL_SUPPRESSED,
        actor_id: null,
        actor_email: email,
        details: {
          template_kind: templateKind,
          reason: "user_unsubscribe",
          via: "one_click_email",
        },
      })
      // Also flip the customer-level marketing_consent_email flag when
      // the unsubscribe is global. Per-stream unsubscribe leaves the
      // flag alone so the customer can still receive other streams.
      if (!templateKind) {
        try {
          const meta = (customer.metadata ?? {}) as Record<string, unknown>
          const customerModule = req.scope.resolve("customer") as any
          await customerModule.updateCustomers(customer.id, {
            metadata: {
              ...meta,
              marketing_consent_email: false,
              marketing_consent_updated_at: new Date().toISOString(),
              marketing_consent_source: "one_click_unsubscribe",
            },
          })
        } catch {
          /* metadata update is best-effort; the suppression row is the
           * load-bearing thing */
        }
      }
    }
  } catch (err: any) {
    logger.warn?.(
      `email/unsubscribe: customer audit failed for ${email}: ${err?.message ?? err}`
    )
  }

  try {
    captureEvent(email, "marketing_unsubscribe_clicked", {
      template_kind: templateKind,
      idempotent: alreadyExists,
    })
  } catch {
    /* best-effort */
  }

  // Forward the signed token to the preference center so the customer
  // can re-enable specific streams without needing a separate link.
  const base =
    MARKETING_PREFERENCE_CENTER_URL && MARKETING_PREFERENCE_CENTER_URL.length > 0
      ? MARKETING_PREFERENCE_CENTER_URL
      : "/"
  const target = `${base}${base.includes("?") ? "&" : "?"}email=${encodeURIComponent(email)}&kind=all&sig=${encodeURIComponent(String(q.sig ?? ""))}&unsubscribed=1`
  return res.redirect(303, target)
}
