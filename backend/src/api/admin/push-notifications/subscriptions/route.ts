import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PushSubscription } from "../../../../modules/push-notifications/models/push-subscription"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const manager = req.scope.resolve("manager") as any
    const dbManager = manager.fork()

    const { user_id, limit = 50, offset = 0 } = req.query

    const where: any = {
      deleted_at: null,
    }

    if (user_id) {
      where.user_id = user_id
    }

    const [subscriptions, count] = await dbManager.findAndCount(
      PushSubscription,
      where,
      {
        limit: Number(limit),
        offset: Number(offset),
        orderBy: { created_at: "DESC" },
      }
    )

    res.json({
      subscriptions,
      count,
      offset: Number(offset),
      limit: Number(limit),
    })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to list subscriptions",
    })
  }
}

