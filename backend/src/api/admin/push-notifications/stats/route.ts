import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ScheduledNotification } from "../../../../modules/push-notifications/models/scheduled-notification"
import { PushSubscription } from "../../../../modules/push-notifications/models/push-subscription"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const manager = req.scope.resolve("manager") as any
    const dbManager = manager.fork()

    const { start_date, end_date } = req.query

    const where: any = {}
    if (start_date || end_date) {
      where.created_at = {}
      if (start_date) {
        where.created_at.$gte = new Date(start_date as string)
      }
      if (end_date) {
        where.created_at.$lte = new Date(end_date as string)
      }
    }

    // Total subscriptions
    const totalSubscriptions = await dbManager.count(PushSubscription, {
      deleted_at: null,
    })

    // Notification stats
    const [allNotifications, sentNotifications, failedNotifications, pendingNotifications] =
      await Promise.all([
        dbManager.count(ScheduledNotification, where),
        dbManager.count(ScheduledNotification, { ...where, status: "sent" }),
        dbManager.count(ScheduledNotification, { ...where, status: "failed" }),
        dbManager.count(ScheduledNotification, { ...where, status: "pending" }),
      ])

    const successRate =
      allNotifications > 0 ? (sentNotifications / allNotifications) * 100 : 0

    res.json({
      subscriptions: {
        total: totalSubscriptions,
      },
      notifications: {
        total: allNotifications,
        sent: sentNotifications,
        failed: failedNotifications,
        pending: pendingNotifications,
        success_rate: Math.round(successRate * 100) / 100,
      },
    })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to get statistics",
    })
  }
}

