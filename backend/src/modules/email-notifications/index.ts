import { ModuleProviderExports } from '@medusajs/framework/types'
import { ResendNotificationService } from './services/resend'
import { SendGridNotificationService } from './services/sendgrid'

const services = [ResendNotificationService, SendGridNotificationService]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport
