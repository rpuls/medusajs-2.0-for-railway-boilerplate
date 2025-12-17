import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ScheduledNotification } from "../../../../modules/push-notifications/models/scheduled-notification"
import { NotificationSchedulerService } from "../../../../modules/push-notifications/services/notification-scheduler"
import { PushNotificationService } from "../../../../modules/push-notifications/services/push-notification"
import { VapidKeysService } from "../../../../modules/push-notifications/services/vapid-keys"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const manager = req.scope.resolve("manager") as any
    const dbManager = manager.fork()

    const notification = await dbManager.findOne(ScheduledNotification, { id })

    if (!notification) {
      res.status(404).json({
        message: "Notification not found",
      })
      return
    }

    res.json({ notification })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to get notification",
    })
  }
}

export async function PATCH(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const manager = req.scope.resolve("manager") as any
    const dbManager = manager.fork()

    const notification = await dbManager.findOne(ScheduledNotification, { id })

    if (!notification) {
      res.status(404).json({
        message: "Notification not found",
      })
      return
    }

    if (notification.status !== "pending") {
      res.status(400).json({
        message: "Cannot update notification that is not pending",
      })
      return
    }

    const requestBody = req.body as {
      title?: string
      body?: string
      icon?: string
      badge?: string
      image?: string
      data?: Record<string, any>
      scheduled_at?: string | Date
      target_type?: 'user' | 'broadcast'
      target_user_ids?: string[]
    }
    
    const {
      title,
      body,
      icon,
      badge,
      image,
      data,
      scheduled_at,
      target_type,
      target_user_ids,
    } = requestBody

    if (title) notification.title = title
    if (body) notification.body = body
    if (icon !== undefined) notification.icon = icon
    if (badge !== undefined) notification.badge = badge
    if (image !== undefined) notification.image = image
    if (data !== undefined) notification.data = data
    if (scheduled_at !== undefined) {
      notification.scheduled_at = scheduled_at ? new Date(scheduled_at) : null
    }
    if (target_type) notification.target_type = target_type
    if (target_user_ids !== undefined) notification.target_user_ids = target_user_ids

    await dbManager.persistAndFlush(notification)

    res.json({ notification })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to update notification",
    })
  }
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const { id } = req.params
    const manager = req.scope.resolve("manager") as any
    const logger = req.scope.resolve("logger")
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

    const cancelled = await notificationSchedulerService.cancel(id)

    if (!cancelled) {
      res.status(404).json({
        message: "Notification not found or cannot be cancelled",
      })
      return
    }

    res.json({ message: "Notification cancelled" })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to cancel notification",
    })
  }
}

