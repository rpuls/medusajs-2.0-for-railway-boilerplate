import { ModuleProviderExports } from '@medusajs/framework/types'
import { VapidKeysService } from './services/vapid-keys'
import { PushNotificationService } from './services/push-notification'
import { NotificationSchedulerService } from './services/notification-scheduler'
import { PromotionNotificationService } from './services/promotion-notification'

const services = [
  VapidKeysService,
  PushNotificationService,
  NotificationSchedulerService,
  PromotionNotificationService,
]

const providerExport: ModuleProviderExports = {
  services,
}

export default providerExport
