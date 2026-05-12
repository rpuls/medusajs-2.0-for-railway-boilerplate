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

const initPostHog = () => {
  if (typeof window === "undefined" || !apiKey || (posthog as any).__loaded) {
    return
  }
  posthog.init(apiKey, {
    api_host: apiHost,
    capture_pageview: false,
    person_profiles: "identified_only",
    autocapture: true,
    capture_exceptions: true,
    disable_session_recording: false,
    rate_limiting: { events_per_second: 10 },
  })
}

// Defer initialization until after the page is interactive so PostHog's
// 92 KiB doesn't compete with first-party JS on the critical path. The
// phCapturePageViewWhenReady helper polls until __loaded so the first
// pageview is preserved through the delay.
if (typeof window !== "undefined" && apiKey) {
  const schedule = () => {
    const ric = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined
    if (ric) {
      ric(initPostHog, { timeout: 4000 })
    } else {
      setTimeout(initPostHog, 1500)
    }
  }
  if (document.readyState === "complete") {
    schedule()
  } else {
    window.addEventListener("load", schedule, { once: true })
  }
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
