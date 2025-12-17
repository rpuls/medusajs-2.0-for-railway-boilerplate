import { Logger } from '@medusajs/framework/types'
import { NotificationSchedulerService } from './notification-scheduler'

type InjectedDependencies = {
  logger: Logger
  notificationSchedulerService: NotificationSchedulerService
}

export class PromotionNotificationService {
  protected logger_: Logger
  protected notificationSchedulerService_: NotificationSchedulerService

  constructor({ logger, notificationSchedulerService }: InjectedDependencies) {
    this.logger_ = logger
    this.notificationSchedulerService_ = notificationSchedulerService
  }

  /**
   * Send a promotion notification to all users (broadcast)
   */
  async sendPromotion(
    title: string,
    body: string,
    options?: {
      icon?: string
      image?: string
      url?: string
      scheduled_at?: Date | string | null
    }
  ) {
    return this.notificationSchedulerService_.schedule({
      title,
      body,
      icon: options?.icon,
      image: options?.image,
      data: options?.url ? { url: options.url } : undefined,
      scheduled_at: options?.scheduled_at || null,
      target_type: 'broadcast',
    })
  }

  /**
   * Send a targeted promotion to specific users
   */
  async sendTargetedPromotion(
    userIds: string[],
    title: string,
    body: string,
    options?: {
      icon?: string
      image?: string
      url?: string
      scheduled_at?: Date | string | null
    }
  ) {
    return this.notificationSchedulerService_.schedule({
      title,
      body,
      icon: options?.icon,
      image: options?.image,
      data: options?.url ? { url: options.url } : undefined,
      scheduled_at: options?.scheduled_at || null,
      target_type: 'user',
      target_user_ids: userIds,
    })
  }
}

