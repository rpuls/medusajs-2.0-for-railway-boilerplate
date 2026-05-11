/**
 * Thin wrapper over posthog-js so call sites don't have to know about
 * the SDK directly. Mirrors the shape of `@lib/analytics` (the GA4
 * wrapper) so the two libraries can coexist without colliding.
 *
 * Every public function is a no-op when:
 *   - SSR (no window)
 *   - posthog-js hasn't initialised (NEXT_PUBLIC_POSTHOG_KEY missing)
 *   - the user has opted out (PostHog handles this internally)
 *
 * Reach for this module for explicit events PostHog should know about
 * but GA4 doesn't need (e.g. customer login → identify, customizer
 * canvas action). Standard funnel events still flow through GA4.
 */

import posthog from "posthog-js"

const isClient = () => typeof window !== "undefined"

const isReady = (): boolean => {
  if (!isClient()) return false
  // posthog-js sets `__loaded` on its singleton once init() resolved.
  return Boolean((posthog as any).__loaded)
}

export const phIdentify = (
  distinctId: string,
  properties?: Record<string, any>
) => {
  if (!isReady() || !distinctId) return
  try {
    posthog.identify(distinctId, properties)
  } catch {
    // never throw from analytics
  }
}

/**
 * Resets the recording session — call on logout so a returning
 * anonymous visitor doesn't get tied to the previous customer.
 */
export const phReset = () => {
  if (!isReady()) return
  try {
    posthog.reset()
  } catch {
    // intentional silent
  }
}

export const phCapture = (event: string, properties?: Record<string, any>) => {
  if (!isReady() || !event) return
  try {
    posthog.capture(event, properties)
  } catch {
    // intentional silent
  }
}

export const phCaptureException = (
  error: unknown,
  properties?: Record<string, any>
) => {
  if (!isReady()) return
  try {
    posthog.captureException(error, properties)
  } catch {
    // intentional silent
  }
}

/** Manual pageview — App Router doesn't auto-fire on route change. */
export const phCapturePageView = (url?: string) => {
  if (!isReady()) return
  try {
    posthog.capture("$pageview", url ? { $current_url: url } : undefined)
  } catch {
    // intentional silent
  }
}

/**
 * posthog.init can finish slightly after the first route-change effect runs.
 * Retrying avoids missing the initial $pageview (PostHog onboarding / session replay verify).
 */
export const phCapturePageViewWhenReady = (
  url: string,
  opts?: { maxAttempts?: number; intervalMs?: number }
) => {
  if (!isClient() || !url) return
  const maxAttempts = opts?.maxAttempts ?? 50
  const intervalMs = opts?.intervalMs ?? 50
  let attempts = 0
  const tick = () => {
    if (isReady()) {
      phCapturePageView(url)
      return
    }
    attempts += 1
    if (attempts < maxAttempts) {
      window.setTimeout(tick, intervalMs)
    }
  }
  tick()
}
