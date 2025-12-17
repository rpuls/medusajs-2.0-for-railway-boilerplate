import { Logger } from '@medusajs/framework/types'
import * as webPush from 'web-push'
import { PushSubscription } from '../models/push-subscription'
import { VapidKeysService } from './vapid-keys'

type InjectedDependencies = {
  logger: Logger
  manager: any
  vapidKeysService: VapidKeysService
}

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  data?: Record<string, any>
  tag?: string
  requireInteraction?: boolean
  vibrate?: number[]
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

export class PushNotificationService {
  protected logger_: Logger
  protected manager_: any
  protected vapidKeysService_: VapidKeysService

  constructor({ logger, manager, vapidKeysService }: InjectedDependencies) {
    this.logger_ = logger
    this.manager_ = manager
    this.vapidKeysService_ = vapidKeysService
  }

  /**
   * Initialize web-push with VAPID keys
   */
  async initialize(): Promise<void> {
    const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com'
    const { publicKey, privateKey } = await this.vapidKeysService_.getOrCreateKeys(subject)

    webPush.setVapidDetails(subject, publicKey, privateKey)
  }

  /**
   * Send push notification to a single subscription
   */
  async sendToSubscription(
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      await this.initialize()

      const pushSubscription: webPush.PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      }

      await webPush.sendNotification(pushSubscription, JSON.stringify(payload))
      return true
    } catch (error: any) {
      this.logger_.error('Failed to send push notification:', error)

      // Remove invalid subscriptions
      if (error.statusCode === 410 || error.statusCode === 404) {
        await this.removeInvalidSubscription(subscription.endpoint)
      }

      return false
    }
  }

  /**
   * Send push notification to a user (all their devices)
   */
  async sendToUser(userId: string, payload: NotificationPayload): Promise<number> {
    const manager = this.manager_.fork()
    const subscriptions = await manager.find(PushSubscription, {
      user_id: userId,
      deleted_at: null,
    })

    if (subscriptions.length === 0) {
      this.logger_.warn(`No push subscriptions found for user ${userId}`)
      return 0
    }

    let successCount = 0
    for (const subscription of subscriptions) {
      const success = await this.sendToSubscription(
        {
          endpoint: subscription.endpoint,
          keys: subscription.keys as { p256dh: string; auth: string },
        },
        payload
      )
      if (success) {
        successCount++
      }
    }

    return successCount
  }

  /**
   * Send broadcast notification to all subscriptions
   */
  async sendBroadcast(payload: NotificationPayload): Promise<{ sent: number; failed: number }> {
    const manager = this.manager_.fork()
    const subscriptions = await manager.find(PushSubscription, {
      deleted_at: null,
    })

    let sent = 0
    let failed = 0

    for (const subscription of subscriptions) {
      const success = await this.sendToSubscription(
        {
          endpoint: subscription.endpoint,
          keys: subscription.keys as { p256dh: string; auth: string },
        },
        payload
      )

      if (success) {
        sent++
      } else {
        failed++
      }
    }

    return { sent, failed }
  }

  /**
   * Send notification to multiple users
   */
  async sendToUsers(userIds: string[], payload: NotificationPayload): Promise<number> {
    let totalSent = 0
    for (const userId of userIds) {
      const sent = await this.sendToUser(userId, payload)
      totalSent += sent
    }
    return totalSent
  }

  /**
   * Remove invalid subscription
   */
  private async removeInvalidSubscription(endpoint: string): Promise<void> {
    const manager = this.manager_.fork()
    const subscription = await manager.findOne(PushSubscription, { endpoint })

    if (subscription) {
      subscription.deleted_at = new Date()
      await manager.persistAndFlush(subscription)
      this.logger_.info(`Removed invalid subscription: ${endpoint}`)
    }
  }
}

