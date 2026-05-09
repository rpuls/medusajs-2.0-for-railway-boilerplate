import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import type {
  INotificationModuleService,
  MedusaContainer,
} from "@medusajs/framework/types"

import {
  ADMIN_PUBLIC_URL,
  BACKEND_URL,
  SUPPORT_REPLY_TO_EMAIL,
} from "../../lib/constants"
import { EmailTemplates } from "../../modules/email-notifications/templates"
import { REPORT_ALERT_MODULE } from "../../modules/report-alert"
import {
  compareValue,
  evaluateMetrics,
  METRIC_LABELS,
  type MetricKey,
  type MetricSnapshot,
} from "./evaluate"

export type AlertRunResult = {
  evaluated: number
  fired: number
  cooldown_skipped: number
  disabled_skipped: number
  failures: number
  snapshot: MetricSnapshot
  fired_alerts: Array<{ id: string; name: string; value: number }>
}

/**
 * Walks every enabled alert, evaluates its metric against the current
 * snapshot, fires the email if the threshold is breached AND the
 * cooldown has elapsed since the last fire. Updates `last_fired_at` +
 * `last_value` regardless of whether the alert fired so the admin UI
 * can show "still red" state.
 */
export async function runAlerts(
  container: MedusaContainer,
  options: { dryRun?: boolean; now?: Date } = {}
): Promise<AlertRunResult> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const now = options.now ?? new Date()
  const dryRun = options.dryRun === true

  const service = container.resolve(REPORT_ALERT_MODULE) as any
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  let alerts: any[] = []
  try {
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
      ],
      pagination: { take: 200, skip: 0 },
    })
    alerts = (data as any[]) ?? []
  } catch (err: any) {
    logger.warn(`run-alerts: failed to load alerts: ${err?.message ?? err}`)
    return {
      evaluated: 0,
      fired: 0,
      cooldown_skipped: 0,
      disabled_skipped: 0,
      failures: 0,
      snapshot: {} as MetricSnapshot,
      fired_alerts: [],
    }
  }

  const enabledAlerts = alerts.filter((a) => a.enabled !== false)
  const snapshot = await evaluateMetrics(container, { now })

  const notificationModuleService: INotificationModuleService =
    container.resolve(Modules.NOTIFICATION)

  const adminUrl = ADMIN_PUBLIC_URL?.trim() || BACKEND_URL
  let fired = 0
  let cooldownSkipped = 0
  let failures = 0
  let disabledSkipped = alerts.length - enabledAlerts.length
  const firedAlerts: Array<{ id: string; name: string; value: number }> = []

  for (const a of enabledAlerts) {
    const metric = a.metric as MetricKey
    const value = snapshot[metric]
    if (typeof value !== "number" || !Number.isFinite(value)) {
      logger.warn(
        `run-alerts: unknown metric "${a.metric}" on alert "${a.name}" — skipping.`
      )
      continue
    }
    const threshold = Number(a.threshold)
    const breached = compareValue(value, a.comparator, threshold)

    // Always stamp last_value so the admin UI can show "current value"
    // even when the alert hasn't fired.
    if (!dryRun) {
      try {
        await service.updateReportAlerts(a.id, { last_value: value })
      } catch {
        /* non-fatal */
      }
    }

    if (!breached) continue

    // Cooldown check
    if (a.last_fired_at) {
      const lastMs = Date.parse(a.last_fired_at)
      const cooldownMs = (Number(a.cooldown_days) || 7) * 86_400_000
      if (
        Number.isFinite(lastMs) &&
        now.getTime() - lastMs < cooldownMs
      ) {
        cooldownSkipped += 1
        continue
      }
    }

    if (dryRun) {
      fired += 1
      firedAlerts.push({ id: a.id, name: a.name, value })
      continue
    }

    try {
      await notificationModuleService.createNotifications({
        to: a.recipient_email,
        channel: "email",
        template: EmailTemplates.THRESHOLD_ALERT,
        data: {
          emailOptions: {
            replyTo: SUPPORT_REPLY_TO_EMAIL,
            subject: `⚠ ${a.name}`,
          },
          alert: {
            name: a.name,
            metricLabel: METRIC_LABELS[metric] ?? metric,
            comparator: a.comparator,
            threshold,
            value,
            cooldownDays: Number(a.cooldown_days) || 7,
            adminUrl,
          },
        },
      })
      await service.updateReportAlerts(a.id, {
        last_fired_at: now.toISOString(),
        last_value: value,
      })
      fired += 1
      firedAlerts.push({ id: a.id, name: a.name, value })
    } catch (err: any) {
      failures += 1
      logger.error(
        `run-alerts: send failed for "${a.name}": ${err?.message ?? err}`
      )
    }
  }

  logger.info(
    `run-alerts: evaluated=${enabledAlerts.length}, fired=${fired}, cooldown_skipped=${cooldownSkipped}, failures=${failures}`
  )

  return {
    evaluated: enabledAlerts.length,
    fired,
    cooldown_skipped: cooldownSkipped,
    disabled_skipped: disabledSkipped,
    failures,
    snapshot,
    fired_alerts: firedAlerts,
  }
}
