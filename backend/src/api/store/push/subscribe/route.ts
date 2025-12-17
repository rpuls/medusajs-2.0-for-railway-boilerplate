import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PushSubscription } from "../../../../modules/push-notifications/models/push-subscription"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const requestBody = req.body as {
      subscription?: {
        endpoint?: string
        keys?: { p256dh: string; auth: string }
      }
      device_info?: Record<string, any>
    }
    
    const { subscription, device_info } = requestBody

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      res.status(400).json({
        message: "Invalid subscription data",
      })
      return
    }

    const manager = req.scope.resolve("manager") as any
    const dbManager = manager.fork()

    // Check if subscription already exists
    const existing = await dbManager.findOne(PushSubscription, {
      endpoint: subscription.endpoint,
      deleted_at: null,
    })

    // Get user ID from session if authenticated (store routes don't have auth_context)
    const userId = null // TODO: Get from customer session if available

    if (existing) {
      // Update existing subscription
      existing.user_id = userId
      existing.keys = subscription.keys
      existing.device_info = device_info || null
      existing.updated_at = new Date()
      await dbManager.persistAndFlush(existing)

      res.json({
        id: existing.id,
        message: "Subscription updated",
      })
    } else {
      // Create new subscription
      const pushSubscription = dbManager.create(PushSubscription, {
        id: `push_sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        device_info: device_info || null,
      })

      await dbManager.persistAndFlush(pushSubscription)

      res.json({
        id: pushSubscription.id,
        message: "Subscription created",
      })
    }
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to store push subscription",
    })
  }
}

