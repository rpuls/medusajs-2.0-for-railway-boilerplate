import { requestContextStore } from "./request-context"
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * Wrap a route handler with request context initialization.
 * Ensures the route runs with a unique requestId and can access context.
 */
export function withRouteContext<
  T extends (req: MedusaRequest, res: MedusaResponse) => Promise<void>
>(handler: T): T {
  return (async (req: MedusaRequest, res: MedusaResponse) => {
    const requestId = requestContextStore.getRequestId()
    const userId = (req as any).auth_context?.actor_id ||
                   (req as any).publishable_key_context?.publishable_key_id

    // Attach context to request for access in route handlers
    ;(req as any).requestContext = {
      requestId,
      userId,
      timestamp: Date.now(),
    }

    // Set response header for external correlation
    res.setHeader("x-request-id", requestId)

    // Run handler within context
    return requestContextStore.run(() => handler(req, res))
  }) as T
}
