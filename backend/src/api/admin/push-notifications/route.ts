import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ScheduledNotification } from "../../../modules/push-notifications/models/scheduled-notification"
import { NotificationSchedulerService } from "../../../modules/push-notifications/services/notification-scheduler"
import { PushNotificationService } from "../../../modules/push-notifications/services/push-notification"
import { VapidKeysService } from "../../../modules/push-notifications/services/vapid-keys"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const manager = req.scope.resolve("manager") as any
    const dbManager = manager.fork()

    const { status, target_type, limit = 50, offset = 0 } = req.query

    const where: any = {}
    if (status) {
      where.status = status
    }
    if (target_type) {
      where.target_type = target_type
    }

    const [notifications, count] = await dbManager.findAndCount(
      ScheduledNotification,
      where,
      {
        limit: Number(limit),
        offset: Number(offset),
        orderBy: { created_at: "DESC" },
      }
    )

    res.json({
      notifications,
      count,
      offset: Number(offset),
      limit: Number(limit),
    })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to list notifications",
    })
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
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

    if (!title || !body || !target_type) {
      res.status(400).json({
        message: "Title, body, and target_type are required",
      })
      return
    }

    if (target_type === "user" && (!target_user_ids || target_user_ids.length === 0)) {
      res.status(400).json({
        message: "target_user_ids is required when target_type is 'user'",
      })
      return
    }

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

    const notification = await notificationSchedulerService.schedule({
      title,
      body,
      icon,
      badge,
      image,
      data,
      scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
      target_type,
      target_user_ids,
    })

    // If scheduled_at is null or in the past, send immediately
    if (!scheduled_at || new Date(scheduled_at) <= new Date()) {
      await notificationSchedulerService.sendScheduledNotification(notification)
    }

    res.json({ notification })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to create notification",
    })
  }
}

