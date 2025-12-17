import { Modules } from '@medusajs/framework/utils'
import { IProductModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { NotificationSchedulerService } from '../modules/push-notifications/services/notification-scheduler'
import { PushNotificationService } from '../modules/push-notifications/services/push-notification'
import { VapidKeysService } from '../modules/push-notifications/services/vapid-keys'

/**
 * Subscriber for product restock notifications
 * Note: This is a placeholder - actual implementation would require
 * tracking which users are subscribed to product alerts
 */
export default async function productRestockPushNotificationHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const manager = container.resolve(ContainerRegistrationKeys.MANAGER)
  const productModuleService: IProductModuleService = container.resolve(Modules.PRODUCT)

  try {
    // Get product details
    const product = await productModuleService.retrieveProduct(data.id, {
      relations: ['variants', 'variants.inventory_items'],
    })

    // Check if product is now in stock (was out of stock before)
    // This would require tracking previous inventory state
    // For now, this is a placeholder implementation

    const vapidKeysService = new VapidKeysService({ logger, manager })
    const pushNotificationService = new PushNotificationService({
      logger,
      manager,
      vapidKeysService,
    })
    const notificationSchedulerService = new NotificationSchedulerService({
      logger,
      manager,
      pushNotificationService,
    })

    // TODO: Get users subscribed to this product's restock alerts
    // This would require a new table: product_alert_subscriptions
    // For now, skip implementation

    logger.info(`Product restock notification handler called for product ${product.id}`)
  } catch (error) {
    logger.error('Error in product restock push notification handler:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'product.updated', // Listen to product updates
}

