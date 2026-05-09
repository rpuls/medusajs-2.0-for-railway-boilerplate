import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { REPORT_ALERT_MODULE } from "../../../../../modules/report-alert"

const VALID_COMPARATORS = new Set(["gt", "gte", "lt", "lte", "eq"])

/**
 * PATCH /admin/reports/alerts/:id  { enabled?, threshold?, cooldown_days?, name?, recipient_email?, comparator? }
 * DELETE /admin/reports/alerts/:id
 */
export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "id is required" })
  }
  const body = (req.body ?? {}) as any
  const update: Record<string, unknown> = {}
  if (typeof body.name === "string") update.name = body.name.trim()
  if (typeof body.recipient_email === "string")
    update.recipient_email = body.recipient_email.trim()
  if (typeof body.comparator === "string") {
    if (!VALID_COMPARATORS.has(body.comparator)) {
      return res.status(400).json({ error: "invalid comparator" })
    }
    update.comparator = body.comparator
  }
  if (body.threshold !== undefined) {
    const n = Number(body.threshold)
    if (!Number.isFinite(n))
      return res.status(400).json({ error: "threshold must be number" })
    update.threshold = n
  }
  if (body.cooldown_days !== undefined) {
    const n = Number(body.cooldown_days)
    if (!Number.isFinite(n) || n < 1)
      return res.status(400).json({ error: "cooldown_days must be ≥ 1" })
    update.cooldown_days = Math.floor(n)
  }
  if (typeof body.enabled === "boolean") update.enabled = body.enabled

  const service = req.scope.resolve(REPORT_ALERT_MODULE) as any
  try {
    const updated = await service.updateReportAlerts(id, update)
    return res.json({ alert: updated })
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to update alert",
      detail: String(err?.message ?? err),
    })
  }
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const id = req.params.id
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "id is required" })
  }
  const service = req.scope.resolve(REPORT_ALERT_MODULE) as any
  try {
    await service.deleteReportAlerts([id])
    return res.json({ id, deleted: true })
  } catch (err: any) {
    return res.status(500).json({
      error: "Failed to delete alert",
      detail: String(err?.message ?? err),
    })
  }
}
