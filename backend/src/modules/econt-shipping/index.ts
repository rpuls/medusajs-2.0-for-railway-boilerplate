import EcontShippingService from "./service"
import { Module } from "@medusajs/framework/utils"

export const ECONT_SHIPPING_MODULE = "econtShipping"

// Only keep Shipment and Settings models in database (business data)
// Cities, Offices, Streets, Quarters are cached in memory (1 day TTL)
// Models are registered in the MedusaService constructor, not here
export default Module(ECONT_SHIPPING_MODULE, {
  service: EcontShippingService,
})

