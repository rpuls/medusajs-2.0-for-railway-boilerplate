import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PushSubscription } from "../../../../modules/push-notifications/models/push-subscription"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const requestBody = req.body as { endpoint?: string }
    const { endpoint } = requestBody

    if (!endpoint) {
      res.status(400).json({
        message: "Endpoint is required",
      })
      return
    }

    const manager = req.scope.resolve("manager") as any
    const dbManager = manager.fork()

    const subscription = await dbManager.findOne(PushSubscription, {
      endpoint,
      deleted_at: null,
    })

    if (!subscription) {
      res.status(404).json({
        message: "Subscription not found",
      })
      return
    }

    // Soft delete
    subscription.deleted_at = new Date()
    await dbManager.persistAndFlush(subscription)

    res.json({
      message: "Subscription removed",
    })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to remove push subscription",
    })
  }
}

