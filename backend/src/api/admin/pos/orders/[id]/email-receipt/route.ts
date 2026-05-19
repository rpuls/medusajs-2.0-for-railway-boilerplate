import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import type {
  INotificationModuleService,
  IOrderModuleService,
} from "@medusajs/framework/types"
import { z } from "zod"

import { SUPPORT_REPLY_TO_EMAIL } from "../../../../../../lib/constants"
import { EmailTemplates } from "../../../../../../modules/email-notifications/templates"
import { writeAudit } from "../../../../../../lib/audit-log"
import { AUDIT_ACTION, AUDIT_ENTITY } from "../../../../../../lib/audit-entities"
import { captureEvent } from "../../../../../../lib/posthog"

const bodySchema = z.object({
  email: z.string().email(),
})

/**
 * POST /admin/pos/orders/:id/email-receipt
 *   body: { email }
 *   → { ok: true }
 *
 * Sends the order-placed email to an arbitrary address — for walk-ins
 * who decide *after* paying that they'd like a receipt, or who gave us
 * the wrong email upfront. Reuses the existing ORDER_PLACED template
 * so they get the same look-and-feel as a self-serve online order.
 *
 * Idempotent: Resend dedupes on identical bodies within a short window.
 * No idempotency stamp on the order — staff can intentionally re-send if
 * the customer didn't receive the first one.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const orderId = req.params.id

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(req.body ?? {})
  } catch (err: any) {
    return res.status(400).json({ error: err?.message ?? "invalid email" })
  }

  const actor = (req as any).auth_context?.actor_id ?? null
  const orderModule = req.scope.resolve(Modules.ORDER) as IOrderModuleService
  const notification = req.scope.resolve(
    Modules.NOTIFICATION
  ) as INotificationModuleService

  let order: any
  try {
    order = await orderModule.retrieveOrder(orderId, {
      relations: ["items", "summary", "shipping_address"],
    })
  } catch {
    return res.status(404).json({ error: "order not found" })
  }

  const shippingAddress = order.shipping_address
  if (!shippingAddress) {
    return res
      .status(400)
      .json({ error: "order has no shipping_address; cannot render receipt" })
  }

  const displayId =
    (order as { display_id?: string | number }).display_id ?? orderId

  try {
    await notification.createNotifications({
      to: body.email,
      channel: "email",
      template: EmailTemplates.ORDER_PLACED,
      data: {
        emailOptions: {
          replyTo: SUPPORT_REPLY_TO_EMAIL,
          subject: `Your receipt for order #${displayId}`,
        },
        order,
        shippingAddress,
        audience: "customer",
        preview: "Thanks for your walk-in order — here's your receipt.",
      },
    })
  } catch (err: any) {
    return res
      .status(502)
      .json({ error: err?.message ?? "failed to send receipt" })
  }

  await writeAudit({
    container: req.scope as any,
    entity: AUDIT_ENTITY.ORDER,
    entity_id: orderId,
    action: AUDIT_ACTION.EMAIL_SENT,
    actor_id: actor,
    details: {
      source: "pos_receipt",
      to: body.email,
    },
  })

  try {
    captureEvent(actor ?? "system", "pos_receipt_emailed", {
      order_id: orderId,
      to: body.email,
    })
  } catch {
    /* best-effort */
  }

  return res.json({ ok: true })
}
