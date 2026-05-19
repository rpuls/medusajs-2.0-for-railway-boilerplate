import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "zod"

import { ADMIN_WORKSPACE_MODULE } from "../../../modules/admin-workspace"
import { verifyUnsubscribe } from "../../../lib/unsubscribe-token"
import { writeAudit } from "../../../lib/audit-log"
import { AUDIT_ACTION, AUDIT_ENTITY } from "../../../lib/audit-entities"
import { captureEvent } from "../../../lib/posthog"

/**
 * Email-preference center backend.
 *
 *   GET  /email/preferences?email=&kind=all&sig=
 *     Returns current per-stream suppression state. Token must verify
 *     against `kind=all` (i.e. issued for a global-unsubscribe link).
 *     Used by the storefront /email-preferences page.
 *
 *   POST /email/preferences   body: { email, kind: "all", sig, streams: { cart_reminder: true, ... } }
 *     Idempotent — inserts a suppression row for each stream the
 *     customer turned OFF and deletes any matching row for streams
 *     they turned back ON. Also flips
 *     customer.metadata.marketing_consent_email when "all" is toggled.
 *
 * Both routes accept token-based auth — same shape as the one-click
 * /email/unsubscribe endpoint. No customer-session requirement, so
 * guests (no customer record) can still manage their preferences via
 * the link in their inbox.
 */

const STREAM_KINDS = [
  "cart_reminder",
  "reorder_reminder",
  "winback",
  "nps_request",
  "monthly_digest",
] as const

type StreamKind = (typeof STREAM_KINDS)[number]

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const q = req.query ?? {}
  const verified = verifyUnsubscribe({
    email: String(q.email ?? ""),
    kind: String(q.kind ?? "all"),
    sig: String(q.sig ?? ""),
  })
  if (verified.ok !== true) {
    return res.status(400).json({ error: "invalid_token" })
  }
  const { email } = verified

  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any

  let suppressionRows: Array<{ template_kind: string | null }> = []
  try {
    suppressionRows = await service.listEmailSuppressions(
      { email },
      { take: 50 }
    )
  } catch {
    /* soft fail */
  }

  // Build the state. A row with template_kind=null means global
  // unsubscribe — surfaces as ALL streams off.
  const globallySuppressed = suppressionRows.some(
    (r) => r.template_kind === null
  )
  const perStream = new Set(
    suppressionRows
      .map((r) => r.template_kind)
      .filter((k): k is string => typeof k === "string")
  )

  const state = STREAM_KINDS.reduce<Record<StreamKind, boolean>>(
    (acc, kind) => {
      // true = subscribed (will receive), false = suppressed
      acc[kind] = globallySuppressed ? false : !perStream.has(kind)
      return acc
    },
    {} as Record<StreamKind, boolean>
  )

  return res.json({ email, streams: state, global_unsubscribe: globallySuppressed })
}

const updateSchema = z.object({
  email: z.string().email(),
  kind: z.string().default("all"),
  sig: z.string().min(1),
  streams: z.record(z.string(), z.boolean()),
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  let body: z.infer<typeof updateSchema>
  try {
    body = updateSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }

  const verified = verifyUnsubscribe({
    email: body.email,
    kind: body.kind,
    sig: body.sig,
  })
  if (verified.ok !== true) {
    return res.status(400).json({ error: "invalid_token" })
  }

  const email = verified.email
  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER) as any

  // Diff: existing rows vs. requested state.
  let existing: Array<{ id: string; template_kind: string | null }> = []
  try {
    existing = await service.listEmailSuppressions({ email }, { take: 50 })
  } catch {
    existing = []
  }

  const existingByKind = new Map<string | null, string>()
  for (const row of existing) {
    existingByKind.set(row.template_kind, row.id)
  }

  const wantsAllOn = STREAM_KINDS.every(
    (k) => body.streams[k] === true
  )

  // Walk each stream. If wantsAllOn, also drop the global-null row.
  if (wantsAllOn && existingByKind.has(null)) {
    try {
      await service.deleteEmailSuppressions([existingByKind.get(null)])
    } catch (err: any) {
      logger.warn?.(
        `email/preferences: delete global failed for ${email}: ${err?.message ?? err}`
      )
    }
  }

  for (const kind of STREAM_KINDS) {
    const subscribed = body.streams[kind] === true
    const hasRow = existingByKind.has(kind)
    if (!subscribed && !hasRow) {
      // Insert per-stream suppression.
      try {
        await service.createEmailSuppressions({
          email,
          template_kind: kind,
          reason: "user_unsubscribe",
          source: "preference_center",
        })
      } catch (err: any) {
        if (!String(err?.message ?? err).match(/duplicate|unique/i)) {
          logger.warn?.(
            `email/preferences: insert ${kind} failed for ${email}: ${err?.message ?? err}`
          )
        }
      }
    } else if (subscribed && hasRow) {
      // Remove the per-stream suppression.
      try {
        await service.deleteEmailSuppressions([existingByKind.get(kind)])
      } catch (err: any) {
        logger.warn?.(
          `email/preferences: delete ${kind} failed for ${email}: ${err?.message ?? err}`
        )
      }
    }
  }

  // Mirror the bulk "all off" / "all on" intent onto
  // customer.metadata.marketing_consent_email so the consent flag
  // stays in sync with what the preference page shows.
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as any
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "metadata"],
      filters: { email },
      pagination: { take: 1 },
    })
    const customer = (customers as any[])?.[0]
    if (customer?.id) {
      const customerModule = req.scope.resolve("customer") as any
      const meta = (customer.metadata ?? {}) as Record<string, unknown>
      const wantsAllOff = STREAM_KINDS.every(
        (k) => body.streams[k] === false
      )
      if (wantsAllOff || wantsAllOn) {
        await customerModule.updateCustomers(customer.id, {
          metadata: {
            ...meta,
            marketing_consent_email: wantsAllOn,
            marketing_consent_updated_at: new Date().toISOString(),
            marketing_consent_source: "preference_center",
          },
        })
      }
      await writeAudit({
        container: req.scope as any,
        entity: AUDIT_ENTITY.CUSTOMER,
        entity_id: customer.id,
        action: AUDIT_ACTION.CONSENT_CHANGED,
        actor_email: email,
        details: { streams: body.streams, source: "preference_center" },
      })
    }
  } catch (err: any) {
    logger.warn?.(
      `email/preferences: customer mirror failed for ${email}: ${err?.message ?? err}`
    )
  }

  try {
    captureEvent(email, "marketing_preference_changed", {
      streams: body.streams,
    })
  } catch {
    /* best-effort */
  }

  return res.json({ ok: true, email, streams: body.streams })
}
