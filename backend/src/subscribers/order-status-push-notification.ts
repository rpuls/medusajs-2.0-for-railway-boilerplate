import { Modules } from '@medusajs/framework/utils'
import { IOrderModuleService } from '@medusajs/framework/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { NotificationSchedulerService } from '../modules/push-notifications/services/notification-scheduler'
import { PushNotificationService } from '../modules/push-notifications/services/push-notification'
import { VapidKeysService } from '../modules/push-notifications/services/vapid-keys'
import { PushSubscription } from '../modules/push-notifications/models/push-subscription'

export default async function orderStatusPushNotificationHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const manager = container.resolve(ContainerRegistrationKeys.MANAGER)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)

  try {
    const order = await orderModuleService.retrieveOrder(data.id, {
      relations: ['items', 'summary'],
    })

    // Only send notifications for orders with customers
    if (!order.email) {
      return
    }

    // Get customer ID from order (if available)
    const customerId = (order as any).customer_id || null

    if (!customerId) {
      return // Can't send user-specific notification without customer ID
    }

    const dbManager = (manager as any).fork()

    // Check if customer has push subscription
    const subscription = await dbManager.findOne(PushSubscription, {
      user_id: customerId,
      deleted_at: null,
    })

    if (!subscription) {
      return // No push subscription, skip
    }

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

    // Determine notification based on order status
    // Note: The event name is available in the subscriber config, but we'll use order status
    const orderStatus = order.status || 'pending'
    let title = 'Order Update'
    let body = `Your order #${order.display_id} has been updated`

    if (orderStatus.includes('fulfilled') || orderStatus.includes('shipped')) {
      title = 'Order Shipped!'
      body = `Your order #${order.display_id} has been shipped. Track your package in your account.`
    } else if (orderStatus.includes('canceled') || orderStatus.includes('cancelled')) {
      title = 'Order Cancelled'
      body = `Your order #${order.display_id} has been cancelled.`
    }

    // Schedule notification
    await notificationSchedulerService.schedule({
      title,
      body,
      data: {
        url: `/order/confirmed/${order.id}`,
        type: 'order_update',
        order_id: order.id,
        order_display_id: order.display_id,
      },
      scheduled_at: null, // Send immediately
      target_type: 'user',
      target_user_ids: [customerId],
    })

    logger.info(`Order status push notification scheduled for order ${order.id}`)
  } catch (error) {
    logger.error('Error sending order status push notification:', error)
  }
}

export const config: SubscriberConfig = {
  event: ['order.shipment_created', 'order.fulfillment_created', 'order.canceled'],
}

