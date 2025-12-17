import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ScheduledNotification } from "../../../../modules/push-notifications/models/scheduled-notification"
import { NotificationSchedulerService } from "../../../../modules/push-notifications/services/notification-scheduler"
import { PushNotificationService } from "../../../../modules/push-notifications/services/push-notification"
import { VapidKeysService } from "../../../../modules/push-notifications/services/vapid-keys"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const requestBody = req.body as {
      notification_id?: string
      title?: string
      body?: string
      icon?: string
      badge?: string
      image?: string
      data?: Record<string, any>
      target_type?: 'user' | 'broadcast'
      target_user_ids?: string[]
    }
    
    const { notification_id, ...notificationPayload } = requestBody

    const manager = req.scope.resolve("manager") as any
    const logger = req.scope.resolve("logger")
    const dbManager = manager.fork()
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

    if (notification_id) {
      // Send existing scheduled notification
      const notification = await dbManager.findOne(ScheduledNotification, {
        id: notification_id,
      })

      if (!notification) {
        res.status(404).json({
          message: "Notification not found",
        })
        return
      }

      const success = await notificationSchedulerService.sendScheduledNotification(notification)

      res.json({
        success,
        notification,
      })
    } else if (notificationPayload.title && notificationPayload.body) {
      // Send new notification immediately
      const notification = await notificationSchedulerService.schedule({
        title: notificationPayload.title,
        body: notificationPayload.body,
        icon: notificationPayload.icon,
        badge: notificationPayload.badge,
        image: notificationPayload.image,
        data: notificationPayload.data,
        scheduled_at: null, // Send immediately
        target_type: notificationPayload.target_type || "broadcast",
        target_user_ids: notificationPayload.target_user_ids,
      })

      const success = await notificationSchedulerService.sendScheduledNotification(notification)

      res.json({
        success,
        notification,
      })
    } else {
      res.status(400).json({
        message: "Either notification_id or notification payload is required",
      })
    }
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to send notification",
    })
  }
}

