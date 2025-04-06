import { ModuleProviderExports } from '@medusajs/framework/types'
import SquarePaymentService from './service'

const services = [SquarePaymentService]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport 