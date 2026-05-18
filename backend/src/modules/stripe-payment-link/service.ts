import { MedusaService } from "@medusajs/framework/utils"

import StripePaymentLink from "./models/stripe-payment-link"
import StripePaymentLinkEvent from "./models/stripe-payment-link-event"

class StripePaymentLinkModuleService extends MedusaService({
  StripePaymentLink,
  StripePaymentLinkEvent,
}) {}

export default StripePaymentLinkModuleService
