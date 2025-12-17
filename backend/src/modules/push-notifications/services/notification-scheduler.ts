import { Logger } from '@medusajs/framework/types'
import { ScheduledNotification } from '../models/scheduled-notification'
import { PushNotificationService } from './push-notification'

type InjectedDependencies = {
  logger: Logger
  manager: any
  pushNotificationService: PushNotificationService
}

export interface CreateScheduledNotificationInput {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  data?: Record<string, any>
  scheduled_at?: Date | string | null
  target_type: 'user' | 'broadcast'
  target_user_ids?: string[]
}

export class NotificationSchedulerService {
  protected logger_: Logger
  protected manager_: any
  protected pushNotificationService_: PushNotificationService

  constructor({ logger, manager, pushNotificationService }: InjectedDependencies) {
    this.logger_ = logger
    this.manager_ = manager
    this.pushNotificationService_ = pushNotificationService
  }

  /**
   * Schedule a notification for future delivery
   */
  async schedule(input: CreateScheduledNotificationInput): Promise<any> {
    const manager = this.manager_.fork()

    const scheduledNotification = manager.create(ScheduledNotification, {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: input.title,
      body: input.body,
      icon: input.icon || null,
      badge: input.badge || null,
      image: input.image || null,
      data: input.data || null,
      scheduled_at: input.scheduled_at ? new Date(input.scheduled_at) : null,
      status: 'pending',
      target_type: input.target_type,
      target_user_ids: input.target_user_ids || null,
    })

    await manager.persistAndFlush(scheduledNotification)

    this.logger_.info(`Scheduled notification: ${scheduledNotification.id}`)

    return scheduledNotification
  }

  /**
   * Get notifications ready to send
   */
  async getReadyNotifications(): Promise<any[]> {
    const manager = this.manager_.fork()
    const now = new Date()

    const notifications = await manager.find(ScheduledNotification, {
      status: 'pending',
      $or: [
        { scheduled_at: null }, // Immediate
        { scheduled_at: { $lte: now } }, // Past scheduled time
      ],
    })

    return notifications
  }

  /**
   * Send a scheduled notification
   */
  async sendScheduledNotification(notification: any): Promise<boolean> {
    const manager = this.manager_.fork()

    try {
      const payload = {
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        badge: notification.badge,
        image: notification.image,
        data: notification.data as Record<string, any> | undefined,
      }

      let success = false

      if (notification.target_type === 'broadcast') {
        const result = await this.pushNotificationService_.sendBroadcast(payload)
        success = result.sent > 0
      } else if (notification.target_type === 'user' && notification.target_user_ids) {
        const sent = await this.pushNotificationService_.sendToUsers(
          notification.target_user_ids as string[],
          payload
        )
        success = sent > 0
      }

      // Update notification status
      notification.status = success ? 'sent' : 'failed'
      notification.sent_at = new Date()
      await manager.persistAndFlush(notification)

      return success
    } catch (error) {
      this.logger_.error(`Failed to send scheduled notification ${notification.id}:`, error)

      notification.status = 'failed'
      notification.sent_at = new Date()
      await manager.persistAndFlush(notification)

      return false
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancel(notificationId: string): Promise<boolean> {
    const manager = this.manager_.fork()
    const notification = await manager.findOne(ScheduledNotification, { id: notificationId })

    if (!notification) {
      return false
    }

    if (notification.status !== 'pending') {
      throw new Error('Cannot cancel notification that is not pending')
    }

    notification.status = 'cancelled'
    await manager.persistAndFlush(notification)

    return true
  }
}
