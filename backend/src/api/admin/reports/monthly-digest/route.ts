import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { buildMonthlyDigest } from "../../../../services/monthly-digest/build-digest"
import {
  resolveDigestRecipients,
  sendMonthlyDigest,
} from "../../../../services/monthly-digest/send-digest"

/**
 * GET  /admin/reports/monthly-digest?send=1
 *
 * Default: returns the digest payload as JSON so the admin UI can render
 * a preview ("here's what next month's email will look like").
 *
 * With `?send=1`: also triggers an out-of-cycle send to the configured
 * recipients. Useful for the first month after deploy and for ad-hoc
 * board-meeting prep.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const logger = (req.scope as any).resolve?.("logger") ?? console
  const sendNow = req.query.send === "1" || req.query.send === "true"

  try {
    const digest = await buildMonthlyDigest(req.scope as any)
    const recipients = resolveDigestRecipients()
    let sendResult: { sent: number; recipients: string[] } | null = null
    if (sendNow) {
      const r = await sendMonthlyDigest(req.scope as any, { digest })
      sendResult = { sent: r.sent, recipients: r.recipients }
    }
    return res.json({
      digest,
      configured_recipients: recipients,
      sent: sendResult,
    })
  } catch (err: any) {
    logger.error?.(`[monthly-digest] build failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to build digest",
      detail: String(err?.message ?? err),
    })
  }
}
