/**
 * Script to create Econt shipping option
 * Run with: pnpm medusa exec ./src/scripts/create-econt-shipping.ts
 */

import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"

export default async function createEcontShipping({ container }: any) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)
  const regionModuleService = container.resolve(Modules.REGION)

  try {
    logger.info("Creating Econt shipping option...")

    // Get the first region (you may need to adjust this)
    const regions = await regionModuleService.listRegions({})
    if (!regions || regions.length === 0) {
      throw new Error("No regions found. Please create a region first.")
    }
    const region = regions[0]
    logger.info(`Using region: ${region.name} (${region.id})`)

    // Get fulfillment sets and service zones
    const fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({})
    if (!fulfillmentSets || fulfillmentSets.length === 0) {
      throw new Error("No fulfillment sets found. Please run the seed script first.")
    }
    const fulfillmentSet = fulfillmentSets[0]
    
    if (!fulfillmentSet.service_zones || fulfillmentSet.service_zones.length === 0) {
      throw new Error("No service zones found. Please run the seed script first.")
    }
    const serviceZone = fulfillmentSet.service_zones[0]

    // Get shipping profiles
    const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({})
    if (!shippingProfiles || shippingProfiles.length === 0) {
      throw new Error("No shipping profiles found. Please run the seed script first.")
    }
    const shippingProfile = shippingProfiles[0]

    // Get shipping option type (if it exists)
    const shippingOptionTypes = await fulfillmentModuleService.listShippingOptionTypes({})
    const econtType = shippingOptionTypes?.find((t: any) => 
      t.code === "econt_shipping" || t.code === "econt" || t.label?.toLowerCase().includes("econt")
    )

    // Create Econt shipping option
    // Set useCalculatedPricing to true for dynamic pricing, false for flat rate
    const useCalculatedPricing = process.env.ECONT_USE_CALCULATED_PRICING !== "false" // Default to calculated
    
    const baseOption = {
      name: "Econt Shipping", // Name must contain "econt" for the component to detect it
      service_zone_id: serviceZone.id,
      shipping_profile_id: shippingProfile.id,
      type_id: econtType?.id, // Use existing type if found
      type: econtType ? undefined : {
        label: "Econt",
        description: "Ship with Econt Express",
        code: "econt",
      },
      rules: [
        {
          attribute: "enabled_in_store",
          value: "true",
          operator: "eq" as const,
        },
        {
          attribute: "is_return",
          value: "false",
          operator: "eq" as const,
        },
      ],
    }

    if (useCalculatedPricing) {
      // Calculated pricing - use Econt provider
      await createShippingOptionsWorkflow(container).run({
        input: [
          {
            ...baseOption,
            price_type: "calculated" as const,
            provider_id: "econt_econt", // Use Econt provider for calculated pricing
          },
        ],
      })
    } else {
      // Flat pricing - use manual provider with fixed prices
      await createShippingOptionsWorkflow(container).run({
        input: [
          {
            ...baseOption,
            price_type: "flat" as const,
            provider_id: "manual_manual", // Use manual provider for flat pricing
            prices: [
              {
                currency_code: region.currency_code || "eur",
                amount: 1000, // Price in cents (10.00 EUR)
              },
              {
                region_id: region.id,
                amount: 1000,
              },
            ],
          },
        ],
      })
    }

    logger.info("✅ Econt shipping option created successfully!")
    logger.info(`Price type: ${useCalculatedPricing ? "Calculated (dynamic)" : "Flat (fixed)"}`)
    logger.info("You can now see 'Econt Shipping' in the checkout delivery options.")
  } catch (error: any) {
    logger.error("Error creating Econt shipping option:", error)
    throw error
  }
}

