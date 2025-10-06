import { ModuleProviderExports } from '@medusajs/framework/types'
import { ResendNotificationService } from './services/resend'

const services = [ResendNotificationService]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport
