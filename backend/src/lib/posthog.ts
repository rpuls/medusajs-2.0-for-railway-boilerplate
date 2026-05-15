import { PostHog } from "posthog-node"
import { requestContextStore } from "./request-context"

const apiKey = process.env.POSTHOG_API_KEY ?? ""
const host = process.env.POSTHOG_HOST

let _client: PostHog | null = null

export function getPostHog(): PostHog | null {
  if (!apiKey) return null
  if (!_client) {
    _client = new PostHog(apiKey, {
      ...(host ? { host } : {}),
      enableExceptionAutocapture: true,
    })
  }
  return _client
}

/**
 * Capture an event with automatic request context injection.
 */
export function captureEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, any>
) {
  const ph = getPostHog()
  if (!ph) return

  const context = requestContextStore.get()
  const enrichedProps = {
    ...properties,
    requestId: context?.requestId,
    traceId: context?.traceId,
  }

  ph.capture({
    distinctId,
    event,
    properties: enrichedProps,
  })
}

// Flush on clean shutdown so no events are dropped.
process.on("SIGTERM", async () => {
  await _client?.shutdown()
})
process.on("SIGINT", async () => {
  await _client?.shutdown()
})
