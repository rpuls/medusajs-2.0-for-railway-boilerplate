import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

import { POS_SESSION_MODULE } from "../../../../modules/pos-session"
import type POSSessionModuleService from "../../../../modules/pos-session/service"
import { checkoutPOSSession } from "../../../../services/pos-checkout"
import { writeAudit } from "../../../../lib/audit-log"
import { AUDIT_ACTION, AUDIT_ENTITY } from "../../../../lib/audit-entities"
import { captureEvent } from "../../../../lib/posthog"

const itemSchema = z.object({
  kind: z.enum(["standard", "customizer"]),
  variant_id: z.string().nullable(),
  product_id: z.string(),
  product_title: z.string(),
  variant_title: z.string().nullable().optional(),
  quantity: z.number().int().min(1).max(10_000),
  unit_price_cents: z.number().int().min(0).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

const checkoutSchema = z.object({
  pos_session_id: z.string(),
  items: z.array(itemSchema).min(1),
  customer_id: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  region_id: z.string(),
  sales_channel_id: z.string().nullable().optional(),
  currency_code: z.string().min(3).max(8).nullable().optional(),
  payment_method: z.enum(["cash", "stripe_link"]),
  promo_codes: z.array(z.string().min(1).max(80)).max(10).optional(),
  discount_cents: z.number().int().min(0).max(10_000_000).nullable().optional(),
})

/**
 * POST /admin/pos/checkout
 *   body: { pos_session_id, items[], customer_id?|email?, region_id,
 *           sales_channel_id?, currency_code?, payment_method }
 *   → 200 { order, payment }
 *
 * One round-trip from the POS admin page that:
 *   1. Creates + converts a draft order via core-flows.
 *   2. Applies payment (cash = marks paid; stripe_link = mints a link).
 *   3. Marks the POS session completed and stamps the order id.
 *
 * The session is the system of record for the customizer line metadata
 * — the admin POS page can resend the full items array if a transient
 * failure aborts checkout midway.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  let body: z.infer<typeof checkoutSchema>
  try {
    body = checkoutSchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid" })
  }

  // Customer is optional — cash "scan + go" walk-ins should be able to
  // checkout without capturing details. We always need *something* on
  // the email field for Medusa's draft-order validator, so fall back to
  // the configured walk-in inbox (or a sentinel).
  const walkinEmail =
    process.env.POS_WALKIN_EMAIL ?? "walkin@scprints.com.au"
  const effectiveEmail = body.email ?? (body.customer_id ? null : walkinEmail)

  const actor = (req as any).auth_context?.actor_id
  if (!actor) {
    return res.status(401).json({ error: "no actor" })
  }

  const service = req.scope.resolve(POS_SESSION_MODULE) as POSSessionModuleService

  // Guard: session must still be active. Prevents double-charging if
  // the admin tab is restored from history and a second checkout fires.
  let session: any
  try {
    session = await (service as any).retrievePosSession(body.pos_session_id)
  } catch {
    return res.status(404).json({ error: "session not found" })
  }
  if (session.status !== "active") {
    return res.status(409).json({
      error: `session is ${session.status}`,
      completed_order_id: session.completed_order_id ?? null,
    })
  }

  let result
  try {
    result = await checkoutPOSSession(req.scope as any, {
      items: body.items.map((it) => ({
        kind: it.kind,
        variant_id: it.variant_id,
        product_id: it.product_id,
        product_title: it.product_title,
        quantity: it.quantity,
        variant_title: it.variant_title ?? null,
        unit_price_cents: it.unit_price_cents ?? null,
        metadata: it.metadata ?? {},
      })),
      customer_id: body.customer_id ?? null,
      email: effectiveEmail,
      region_id: body.region_id,
      sales_channel_id: body.sales_channel_id ?? null,
      currency_code: body.currency_code ?? null,
      payment_method: body.payment_method,
      created_by_user_id: actor,
      pos_session_id: body.pos_session_id,
      promo_codes: body.promo_codes ?? undefined,
      discount_cents: body.discount_cents ?? null,
    })
  } catch (err: any) {
    return res.status(500).json({
      error: err?.message ?? "checkout failed",
    })
  }

  await (service as any).updatePosSessions({
    id: body.pos_session_id,
    status: "completed",
    completed_order_id: result.order.id,
    customer_id: body.customer_id ?? null,
  })

  // Audit on the order so the activity timeline surfaces "POS sale —
  // paid cash / awaiting stripe link". The order_id won't appear on
  // any customer-side timeline unless customer_id is set, which is
  // the desired behaviour (guest walk-ins shouldn't pollute random
  // customer feeds).
  try {
    await writeAudit({
      container: req.scope as any,
      entity: AUDIT_ENTITY.ORDER,
      entity_id: result.order.id,
      action: AUDIT_ACTION.CREATED,
      actor_id: actor,
      details: {
        source: "pos",
        payment_method: result.payment.method,
        payment_status: result.payment.status,
        pos_session_id: body.pos_session_id,
      },
    })
    if (body.customer_id) {
      await writeAudit({
        container: req.scope as any,
        entity: AUDIT_ENTITY.CUSTOMER,
        entity_id: body.customer_id,
        action: AUDIT_ACTION.CREATED,
        actor_id: actor,
        details: {
          source: "pos_sale",
          order_id: result.order.id,
          payment_method: result.payment.method,
        },
      })
    }
  } catch {
    /* audit is best-effort */
  }

  try {
    captureEvent(actor, "pos_order_completed", {
      order_id: result.order.id,
      pos_session_id: body.pos_session_id,
      payment_method: result.payment.method,
      payment_status: result.payment.status,
      total: result.order.total,
      currency: result.order.currency_code,
      line_count: body.items.length,
      has_customizer: body.items.some((i) => i.kind === "customizer"),
    })
  } catch {
    /* best-effort */
  }

  return res.json(result)
}
