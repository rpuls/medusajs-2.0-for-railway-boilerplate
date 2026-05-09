import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { REPORT_ALERT_MODULE } from "../../../../modules/report-alert"
import {
  evaluateMetrics,
  METRIC_LABELS,
  type MetricKey,
} from "../../../../services/report-alerts/evaluate"
import { runAlerts } from "../../../../services/report-alerts/run-alerts"

const VALID_COMPARATORS = new Set(["gt", "gte", "lt", "lte", "eq"])

/**
 * GET /admin/reports/alerts
 *   List configured alerts + a current snapshot of all metric values so
 *   the operator can pick a sensible threshold without leaving the page.
 *
 * GET /admin/reports/alerts?run=1
 *   Force a run-alerts pass right now (bypasses cron schedule but still
 *   respects per-alert cooldowns). Used after editing thresholds or
 *   for ad-hoc checks.
 *
 * POST /admin/reports/alerts
 *   { name, metric, comparator, threshold, recipient_email, cooldown_days?, enabled? }
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = (req.scope as any).resolve?.("logger") ?? console
  const runNow = req.query.run === "1" || req.query.run === "true"

  try {
    if (runNow) {
      const result = await runAlerts(req.scope as any)
      return res.json({ mode: "run", ...result })
    }
    const { data } = await query.graph({
      entity: "report_alert",
      fields: [
        "id",
        "name",
        "metric",
        "comparator",
        "threshold",
        "recipient_email",
        "cooldown_days",
        "enabled",
        "last_fired_at",
        "last_value",
        "created_at",
      ],
      pagination: { take: 200, skip: 0 },
    })
    const snapshot = await evaluateMetrics(req.scope as any)
    const metrics = (Object.keys(METRIC_LABELS) as MetricKey[]).map((k) => ({
      key: k,
      label: METRIC_LABELS[k],
      current_value: snapshot[k],
    }))
    return res.json({
      alerts: (data as any[]) ?? [],
      metrics,
      snapshot,
    })
  } catch (err: any) {
    logger.warn?.(
      `[alerts] graph failed (module not migrated yet?): ${err?.message ?? err}`
    )
    return res.json({
      alerts: [],
      metrics: [],
      snapshot: {},
      data_available: false,
    })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = (req.scope as any).resolve?.("logger") ?? console
  const body = (req.body ?? {}) as any

  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    return res.status(400).json({ error: "`name` is required." })
  }
  if (typeof body.metric !== "string" || !(body.metric in METRIC_LABELS)) {
    return res.status(400).json({
      error: `\`metric\` must be one of: ${Object.keys(METRIC_LABELS).join(", ")}.`,
    })
  }
  if (
    typeof body.comparator !== "string" ||
    !VALID_COMPARATORS.has(body.comparator)
  ) {
    return res.status(400).json({
      error: `\`comparator\` must be one of: ${Array.from(VALID_COMPARATORS).join(", ")}.`,
    })
  }
  const threshold = Number(body.threshold)
  if (!Number.isFinite(threshold)) {
    return res.status(400).json({ error: "`threshold` must be a number." })
  }
  if (
    typeof body.recipient_email !== "string" ||
    !body.recipient_email.includes("@")
  ) {
    return res
      .status(400)
      .json({ error: "`recipient_email` must be a valid email." })
  }
  const cooldownDays = Number.isFinite(Number(body.cooldown_days))
    ? Math.max(1, Math.floor(Number(body.cooldown_days)))
    : 7
  const enabled = body.enabled !== false

  const service = req.scope.resolve(REPORT_ALERT_MODULE) as any
  try {
    const created = await service.createReportAlerts({
      name: body.name.trim(),
      metric: body.metric,
      comparator: body.comparator,
      threshold,
      recipient_email: body.recipient_email.trim(),
      cooldown_days: cooldownDays,
      enabled,
    })
    return res.status(201).json({ alert: created })
  } catch (err: any) {
    logger.error?.(`[alerts] create failed: ${err?.message ?? err}`)
    return res.status(500).json({
      error: "Failed to create alert",
      detail: String(err?.message ?? err),
    })
  }
}
