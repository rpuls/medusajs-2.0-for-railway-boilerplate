import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { runAlerts } from "../services/report-alerts/run-alerts"

/**
 * Daily threshold-alert pass at 23:45 UTC (≈ 09:45 / 10:45 AEST). Runs
 * after the reorder-reminders job at 23:30 to keep the morning email
 * burst together. No env gate — alerts only fire if there's at least
 * one enabled row in `report_alert`, so a fresh deploy is silent.
 */
export default async function runReportAlertsJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    const result = await runAlerts(container)
    logger.info(
      `run-report-alerts: evaluated=${result.evaluated}, fired=${result.fired}, cooldown_skipped=${result.cooldown_skipped}, failures=${result.failures}`
    )
  } catch (err: any) {
    logger.error(`run-report-alerts: ${err?.message ?? err}`)
  }
}

export const config = {
  name: "run-report-alerts",
  schedule: "45 23 * * *",
}
