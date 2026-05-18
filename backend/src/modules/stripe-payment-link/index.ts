import { Module } from "@medusajs/framework/utils"

import StripePaymentLinkModuleService from "./service"

export const STRIPE_PAYMENT_LINK_MODULE = "stripe_payment_link"

export default Module(STRIPE_PAYMENT_LINK_MODULE, {
  service: StripePaymentLinkModuleService,
})
