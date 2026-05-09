import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"

import {
  PRODUCTION_STAGE_EVENT,
  type ProductionStageChangedEvent,
} from "../lib/production-stage"
import { runRulesForEvent } from "../services/automation-rules/evaluate"

/**
 * Runs automation rules with trigger_event =
 * "order.production_stage_changed". Useful for "when QC fails, post a
 * comment + tag customer" or "when stage hits in_production, send the
 * customer a heads-up" patterns.
 */
export default async function automationOnStageChanged({
  event: { data },
  container,
}: SubscriberArgs<ProductionStageChangedEvent>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  if (!data?.order_id) return
  try {
    const result = await runRulesForEvent(
      container,
      "order.production_stage_changed",
      data
    )
    if (result.fired > 0) {
      logger.info(
        `automation:stage_changed: fired ${result.fired}/${result.evaluated} rules`
      )
    }
  } catch (err: any) {
    logger.warn(`automation:stage_changed: ${err?.message ?? err}`)
  }
}

export const config: SubscriberConfig = {
  event: PRODUCTION_STAGE_EVENT,
}
