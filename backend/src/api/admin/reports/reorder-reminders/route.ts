import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { buildReorderCandidates } from "../../../../services/reorder-reminders/build-candidates"
import { sendReorderReminders } from "../../../../services/reorder-reminders/send-reminders"

/**
 * GET /admin/reports/reorder-reminders
 *   Preview today's candidate list (no emails sent).
 *
 * GET /admin/reports/reorder-reminders?send=1
 *   Send the batch immediately (overrides the daily cron schedule + the
 *   REORDER_REMINDERS_ENABLED env gate). Use this for the first manual
 *   pass after deploy and for ad-hoc nudges.
 *
 * GET /admin/reports/reorder-reminders?dry_run=1
 *   Run the full pipeline including subject-line construction but skip
 *   the actual mailbox writes. Useful to verify integration without
 *   spamming customers.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const logger = (req.scope as any).resolve?.("logger") ?? console
  const sendNow = req.query.send === "1" || req.query.send === "true"
  const dryRun = req.query.dry_run === "1" || req.query.dry_run === "true"

  try {
    if (sendNow || dryRun) {
      const result = await sendReorderReminders(req.scope as any, {
        dryRun,
      })
      return res.json({
        mode: dryRun ? "dry_run" : "send",
        ...result,
      })
    }
    const candidates = await buildReorderCandidates(req.scope as any)
    return res.json({
      mode: "preview",
      total: candidates.length,
      candidates,
    })
  } catch (err: any) {
    logger.error?.(
      `[reorder-reminders] failed: ${err?.message ?? err}`
    )
    return res.status(500).json({
      error: "Failed to compute reorder candidates",
      detail: String(err?.message ?? err),
    })
  }
}
