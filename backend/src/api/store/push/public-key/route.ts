import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { VapidKeysService } from "../../../../modules/push-notifications/services/vapid-keys"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const vapidKeysService = req.scope.resolve<VapidKeysService>("vapidKeysService")
    const publicKey = await vapidKeysService.getPublicKey()

    res.json({ publicKey })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to get VAPID public key",
    })
  }
}

