import { PostHog } from "posthog-node"

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

// Flush on clean shutdown so no events are dropped.
process.on("SIGTERM", async () => {
  await _client?.shutdown()
})
process.on("SIGINT", async () => {
  await _client?.shutdown()
})
