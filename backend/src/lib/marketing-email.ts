import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import type { MedusaContainer } from "@medusajs/framework/types"

import { EMAIL_SUPPRESSION_TABLE_ENABLED } from "./constants"
import { ADMIN_WORKSPACE_MODULE } from "../modules/admin-workspace"
import { captureEvent } from "./posthog"

export type MarketingTemplateKind =
  | "cart_reminder"
  | "reorder_reminder"
  | "winback"
  | "monthly_digest"
  | "nps_request"

export type ShouldSendMarketingEmailInput = {
  container: MedusaContainer
  email: string
  customer_id?: string | null
  template_kind: MarketingTemplateKind
}

export type ShouldSendMarketingEmailResult =
  | { ok: true }
  | { ok: false; reason: "consent_false" | "suppressed_global" | "suppressed_stream" | "no_email" }

/**
 * Single gate every marketing-email send path must pass through. Composes:
 *
 *  1. Suppression-table check (Phase 8 surface) — global row or
 *     per-stream row. Gated by `EMAIL_SUPPRESSION_TABLE_ENABLED` so
 *     this helper is safe to deploy before the table exists.
 *  2. Customer consent — `customer.metadata.marketing_consent_email`.
 *     `false` blocks. `null`/`undefined`/`true` all allow (default-allow
 *     mirrors existing newsletter-sync subscriber semantics).
 *
 * On `ok: false` emits `marketing_email_skipped` PostHog event so the
 * dashboard can surface "we skipped N emails today due to X".
 *
 * Returns `{ ok: true }` when:
 *  - The suppression table is disabled AND no consent override exists.
 *  - The suppression table is enabled, no suppression row found, and
 *    no consent override.
 */
export async function shouldSendMarketingEmail(
  input: ShouldSendMarketingEmailInput
): Promise<ShouldSendMarketingEmailResult> {
  const { container, email, customer_id, template_kind } = input
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  if (!email) {
    return { ok: false, reason: "no_email" }
  }

  const lowered = String(email).trim().toLowerCase()

  // --- 1. Suppression table check (Phase 8 surface) ---
  if (EMAIL_SUPPRESSION_TABLE_ENABLED) {
    try {
      const ws = container.resolve(ADMIN_WORKSPACE_MODULE) as any
      if (typeof ws.listEmailSuppressions === "function") {
        const rows: Array<{ email: string; template_kind: string | null }> =
          await ws.listEmailSuppressions(
            { email: lowered },
            { take: 10 }
          )
        for (const row of rows) {
          if (!row.template_kind) {
            emitSkipped(email, template_kind, "suppressed_global")
            return { ok: false, reason: "suppressed_global" }
          }
          if (row.template_kind === template_kind) {
            emitSkipped(email, template_kind, "suppressed_stream")
            return { ok: false, reason: "suppressed_stream" }
          }
        }
      }
    } catch (err: any) {
      // Soft-fail: a broken suppression query shouldn't block sends.
      // Operator sees the warn line if this fires repeatedly.
      logger.warn(
        `shouldSendMarketingEmail: suppression check failed: ${err?.message ?? err}`
      )
    }
  }

  // --- 2. Customer consent check ---
  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const filters = customer_id
      ? { id: customer_id }
      : { email: lowered }
    const { data } = await query.graph({
      entity: "customer",
      fields: ["id", "metadata"],
      filters,
      pagination: { take: 1 },
    })
    const customer = (data as any[])?.[0]
    const meta = (customer?.metadata ?? {}) as Record<string, unknown>
    if (meta.marketing_consent_email === false) {
      emitSkipped(email, template_kind, "consent_false")
      return { ok: false, reason: "consent_false" }
    }
  } catch (err: any) {
    // Guests (no customer row) land here — allow by default; the
    // suppression table is the kill-switch for guests.
    logger.warn(
      `shouldSendMarketingEmail: consent lookup failed for ${lowered}: ${err?.message ?? err}`
    )
  }

  return { ok: true }
}

function emitSkipped(
  email: string,
  template_kind: MarketingTemplateKind,
  reason: ShouldSendMarketingEmailResult extends { reason: infer R } ? R : string
) {
  try {
    captureEvent(email, "marketing_email_skipped", {
      template_kind,
      reason,
    })
  } catch {
    /* best-effort */
  }
}
