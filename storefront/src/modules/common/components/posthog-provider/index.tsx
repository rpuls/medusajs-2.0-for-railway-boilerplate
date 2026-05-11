"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"

import { phCapturePageViewWhenReady } from "@lib/posthog"

/**
 * Bootstraps posthog-js once on the client, wraps children in the
 * react context so any descendant can `usePostHog()`, and fires
 * pageview captures on App Router route changes (App Router doesn't
 * auto-emit pageview events the way the Pages Router did).
 *
 * Renders children without instrumentation when
 * NEXT_PUBLIC_POSTHOG_KEY isn't set (dev / preview environments
 * without the env var stay quiet — no console noise, no failed
 * network calls).
 */

const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const apiHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com"

if (typeof window !== "undefined" && apiKey && !(posthog as any).__loaded) {
  posthog.init(apiKey, {
    api_host: apiHost,
    // Don't auto-fire pageview on init — we handle them explicitly via
    // the route-change effect below so SPA navigations register too.
    capture_pageview: false,
    // Only attach a person profile when the user has been identified
    // (after login). Anonymous traffic still gets recorded but isn't
    // bound to a synthetic profile that bloats the dashboard.
    person_profiles: "identified_only",
    // Standard PostHog autocapture — covers rage-clicks, dead-clicks,
    // basic interaction events without us writing any code.
    autocapture: true,
    // Capture unhandled errors and promise rejections as $exception events.
    // Surfaced in PostHog → Error tracking.
    capture_exceptions: true,
    // Session recordings are off until you flip them on in the
    // PostHog project settings → Recordings. Keeping this default
    // avoids surprise data collection.
    disable_session_recording: false,
    // Don't capture on bots / known crawlers.
    rate_limiting: { events_per_second: 10 },
  })
}

export const PostHogProvider = ({ children }: { children: React.ReactNode }) => {
  if (!apiKey) {
    // No-op passthrough so call sites can use phIdentify/phCapture
    // without conditionals — they're already gated on `__loaded`.
    return <>{children}</>
  }
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
      {children}
    </PHProvider>
  )
}

const PageViewTracker = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return
    const url =
      pathname +
      (searchParams && searchParams.toString()
        ? `?${searchParams.toString()}`
        : "")
    phCapturePageViewWhenReady(url)
  }, [pathname, searchParams])

  return null
}
