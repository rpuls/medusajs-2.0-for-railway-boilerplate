"use client"

import { useEffect, useState } from "react"

const VISIT_KEY = "sc-prints:visit-count"
const DISMISSED_KEY = "sc-prints:install-dismissed-at"
/** Don't show until the user has visited the site at least this many times. */
const MIN_VISITS_BEFORE_PROMPT = 2
/** Don't re-show within this many days after a dismissal. */
const DISMISS_COOLDOWN_DAYS = 30

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  const isIos = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua)
  return isIos && isSafari
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  )
}

function dismissedRecently(): boolean {
  if (typeof window === "undefined") return false
  const stamp = window.localStorage.getItem(DISMISSED_KEY)
  if (!stamp) return false
  const ms = Number(stamp)
  if (!Number.isFinite(ms)) return false
  const cooldownMs = DISMISS_COOLDOWN_DAYS * 24 * 60 * 60 * 1000
  return Date.now() - ms < cooldownMs
}

/**
 * Lightweight install-to-home-screen prompt. On Chrome / Edge it captures the
 * `beforeinstallprompt` event and offers a native-style "Install" button. On
 * iOS Safari there's no event API, so we show static add-to-home-screen
 * instructions instead. Only renders on phone, after the customer's 2nd+
 * visit, and respects a 30-day dismiss cooldown.
 */
export default function AddToHomeBanner() {
  const [visible, setVisible] = useState(false)
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [iosMode, setIosMode] = useState(false)

  // Visit counter — increment once per page-load (it'd be once per session if
  // we used sessionStorage, but per visit lets the prompt show on day 2 of
  // browsing rather than only after a hard refresh).
  useEffect(() => {
    if (typeof window === "undefined") return
    const current = Number(window.localStorage.getItem(VISIT_KEY) ?? "0")
    const next = Number.isFinite(current) ? current + 1 : 1
    window.localStorage.setItem(VISIT_KEY, String(next))
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (isStandalone()) return
    if (dismissedRecently()) return
    const visits = Number(window.localStorage.getItem(VISIT_KEY) ?? "0")
    if (!Number.isFinite(visits) || visits < MIN_VISITS_BEFORE_PROMPT) return

    const ios = isIosSafari()
    if (ios) {
      setIosMode(true)
      setVisible(true)
      return
    }

    const handler = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  if (!visible) return null

  const dismiss = () => {
    setVisible(false)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    }
  }

  const install = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === "dismissed") {
      dismiss()
    } else {
      setVisible(false)
    }
    setDeferredPrompt(null)
  }

  return (
    <div className="tablet:hidden fixed inset-x-0 bottom-0 z-40 pointer-events-none">
      <div
        className="pointer-events-auto mx-auto max-w-md px-3 pb-3"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <div className="rounded-2xl border border-ui-border-base bg-white p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-primary)]/5">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--brand-secondary)]"
                aria-hidden
              >
                <path d="M12 3v12" />
                <path d="M7 8l5-5 5 5" />
                <path d="M5 21h14" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ui-fg-base">
                Add SC Prints to your home screen
              </p>
              <p className="mt-0.5 text-xs text-ui-fg-subtle">
                {iosMode
                  ? "Tap the Share button, then 'Add to Home Screen'."
                  : "Faster loads, full-screen browsing, and quick access from your home screen."}
              </p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss install prompt"
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full p-2 text-ui-fg-muted hover:text-ui-fg-base"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {!iosMode && deferredPrompt ? (
            <button
              type="button"
              onClick={install}
              className="mt-3 inline-flex w-full min-h-11 items-center justify-center rounded-lg bg-[var(--brand-secondary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm active:scale-[0.99]"
            >
              Install
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
