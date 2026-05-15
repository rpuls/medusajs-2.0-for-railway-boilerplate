import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { INBOUND_EMAIL_SECRET } from "../../../lib/constants"
import { parseOrderInboxAlias } from "../../../lib/order-inbox-alias"
import { ADMIN_WORKSPACE_MODULE } from "../../../modules/admin-workspace"

/**
 * POST /hooks/inbound-email
 *
 * Generic shape accepted from inbound-email providers (Postmark,
 * SendGrid Inbound Parse, Resend Inbound Routing, etc.):
 *
 *   {
 *     "to": "inbox+ord<id>@<domain>",
 *     "from": "customer@example.com",
 *     "subject": "Re: your order #...",
 *     "text": "...",
 *     "html": "..."
 *   }
 *
 * Auth: requires header `x-inbound-secret: ${INBOUND_EMAIL_SECRET}`.
 *
 * Behaviour:
 *   - Extracts the order id suffix from the alias.
 *   - Looks up the actual order whose id ends with that suffix.
 *   - Creates an order_comment with the email's text body so the
 *     reply appears in the admin order timeline.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  if (INBOUND_EMAIL_SECRET) {
    const provided = req.headers["x-inbound-secret"]
    if (provided !== INBOUND_EMAIL_SECRET) {
      return res.status(401).json({ error: "unauthorised" })
    }
  }

  const body = (req.body ?? {}) as Record<string, unknown>
  const to = typeof body.to === "string" ? body.to : ""
  const from = typeof body.from === "string" ? body.from : null
  const subject = typeof body.subject === "string" ? body.subject : null
  const text = typeof body.text === "string" ? body.text : null
  const html = typeof body.html === "string" ? body.html : null

  const aliasSuffix = parseOrderInboxAlias(to)
  if (!aliasSuffix) {
    return res
      .status(400)
      .json({ error: "to_address_not_recognised", to })
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  // Find the order whose id ends with the alias suffix. Since IDs are
  // ULIDs (sortable, prefixed), suffix-match is unique within a project.
  let orderId: string | null = null
  try {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id"],
      pagination: { take: 5000, skip: 0 },
    })
    const match = ((orders as any[]) ?? []).find(
      (o) =>
        typeof o?.id === "string" &&
        o.id.toLowerCase().endsWith(aliasSuffix.toLowerCase())
    )
    orderId = match?.id ?? null
  } catch (err) {
    // fallthrough
  }
  if (!orderId) {
    return res.status(404).json({ error: "order_not_found", alias: aliasSuffix })
  }

  // Compose the comment body. Prefer plain text; strip simple HTML
  // if that's all we received.
  let commentBody = text?.trim()
  if (!commentBody && html) {
    commentBody = html
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }
  if (!commentBody) commentBody = "(empty)"

  const header = `From: ${from ?? "unknown"}${subject ? ` · Subject: ${subject}` : ""}`
  const finalBody = `${header}\n\n${commentBody}`.slice(0, 8000)

  const service = req.scope.resolve(ADMIN_WORKSPACE_MODULE) as any
  await service.createOrderComments({
    order_id: orderId,
    body: finalBody,
    created_by: from ? `email:${from}` : "email",
  })

  res.json({ ok: true, order_id: orderId })
}
