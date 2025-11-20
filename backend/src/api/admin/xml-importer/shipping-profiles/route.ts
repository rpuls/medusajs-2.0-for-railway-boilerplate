import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { ModuleRegistrationName } from '@medusajs/framework/utils'
import { IFulfillmentModuleService } from '@medusajs/framework/types'

/**
 * GET /admin/xml-importer/shipping-profiles
 * Get all available shipping profiles
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const fulfillmentModuleService: IFulfillmentModuleService = req.scope.resolve(
      ModuleRegistrationName.FULFILLMENT
    )

    const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({})

    res.json({
      shippingProfiles: shippingProfiles.map((profile) => ({
        id: profile.id,
        name: profile.name,
        type: profile.type,
      })),
      count: shippingProfiles.length,
    })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

