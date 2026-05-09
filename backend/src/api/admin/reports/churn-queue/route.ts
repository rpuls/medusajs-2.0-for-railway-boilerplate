import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { buildChurnQueue } from "../../../../services/churn-queue/build-queue"
import { sendWinbackEmails } from "../../../../services/churn-queue/send-winback"

/**
 * GET /admin/reports/churn-queue
 *   Preview the predicted-churn list (no emails sent).
 *
 * GET /admin/reports/churn-queue?send=1
 *   Trigger the win-back email batch immediately.
 *
 * GET /admin/reports/churn-queue?dry_run=1
 *   Walk the pipeline including email assembly but skip the mailbox writes.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const logger = (req.scope as any).resolve?.("logger") ?? console
  const sendNow = req.query.send === "1" || req.query.send === "true"
  const dryRun = req.query.dry_run === "1" || req.query.dry_run === "true"

  try {
    if (sendNow || dryRun) {
      const result = await sendWinbackEmails(req.scope as any, {
        dryRun,
      })
      return res.json({
        mode: dryRun ? "dry_run" : "send",
        ...result,
      })
    }
    const candidates = await buildChurnQueue(req.scope as any)
    const summary = {
      total: candidates.length,
      drifting: candidates.filter((c) => c.severity === "drifting").length,
      at_risk: candidates.filter((c) => c.severity === "at_risk").length,
      lost: candidates.filter((c) => c.severity === "lost").length,
      total_lifetime_revenue: Math.round(
        candidates.reduce((s, c) => s + c.lifetime_revenue, 0) * 100
      ) / 100,
    }
    return res.json({
      mode: "preview",
      summary,
      candidates,
    })
  } catch (err: any) {
    logger.error?.(`[churn-queue] failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to compute churn queue",
      detail: String(err?.message ?? err),
    })
  }
}
