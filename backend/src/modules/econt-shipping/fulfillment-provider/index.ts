import { ModuleProviderExports } from '@medusajs/framework/types'
import EcontFulfillmentProvider from './fulfillment-provider'

const services = [EcontFulfillmentProvider]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport

