import { ModuleProviderExports } from '@medusajs/types'
import { ResendNotificationService } from './services/resend'

const services = [ResendNotificationService]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport
