import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"

import { AUTOMATION_EXPANDED_TRIGGERS_ENABLED } from "../lib/constants"
import { runRulesForEvent } from "../services/automation-rules/evaluate"

/**
 * Phase 10. Gated by AUTOMATION_EXPANDED_TRIGGERS_ENABLED so existing
 * rules don't see a new trigger fire unexpectedly.
 *
 * Hydrates a minimal payload so condition fields (`email`,
 * `has_account`) can be evaluated. `customer_id` is set so audit-log
 * mirrors land on the right entity timeline.
 */
export default async function automationOnCustomerCreated({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  if (!AUTOMATION_EXPANDED_TRIGGERS_ENABLED) return
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const customerId = data?.id
  if (!customerId) return

  let customer: any = null
  try {
    const customerModule = container.resolve(Modules.CUSTOMER) as any
    customer = await customerModule.retrieveCustomer(customerId)
  } catch (err: any) {
    logger.warn(
      `automation-on-customer-created: retrieve failed for ${customerId}: ${err?.message ?? err}`
    )
    return
  }

  const payload = {
    customer_id: customerId,
    email: customer?.email ?? null,
    has_account: Boolean(customer?.has_account),
    first_name: customer?.first_name ?? null,
    last_name: customer?.last_name ?? null,
    metadata: customer?.metadata ?? {},
  }

  await runRulesForEvent(container, "customer.created", payload)
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
