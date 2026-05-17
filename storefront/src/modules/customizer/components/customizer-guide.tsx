"use client"

import { phCapture } from "@lib/posthog"
import { useReducedMotion } from "framer-motion"
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react"
import { createPortal } from "react-dom"

type CustomizerGuideProps = {
  pdpStep: 1 | 2 | 3 | 4
  hasStep1: boolean
  stepRefs: {
    step1: RefObject<HTMLDivElement | null>
    step2: RefObject<HTMLDivElement | null>
    step3: RefObject<HTMLDivElement | null>
    step4: RefObject<HTMLDivElement | null>
  }
  sidebarScrollRef: RefObject<HTMLDivElement | null>
  showTriggerPulse: boolean
}

type StepConfig = {
  headline: string
  body: string
}

const STEP_CONFIGS: Record<1 | 2 | 3 | 4, StepConfig> = {
  1: {
    headline: "Pick your colour first",
    body: "Choose the garment colour and any other options, then tap the red 'Customize this product' button to open the design tool.",
  },
  2: {
    headline: "Choose where to print",
    body: "Select which side of the garment you'd like to print on — Front, Back, or a sleeve. You can add artwork to multiple locations.",
  },
  3: {
    headline: "Pick your print size",
    body: "Choose the maximum print area. Larger sizes give more room for detail. Bulk pricing kicks in from 10+ pieces.",
  },
  4: {
    headline: "Set quantities and add to cart",
    body: "Enter how many of each size you need. Discounts apply automatically as your quantity grows. Add to cart when ready.",
  },
}

const SPOTLIGHT_PADDING = 12

export default function CustomizerGuide({
  pdpStep,
  hasStep1,
  stepRefs,
  sidebarScrollRef,
  showTriggerPulse,
}: CustomizerGuideProps) {
  const prefersReducedMotion = useReducedMotion()
  const [active, setActive] = useState(false)
  const [guideStep, setGuideStep] = useState<1 | 2 | 3 | 4>(pdpStep)
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null)
  const [viewport, setViewport] = useState({ w: 0, h: 0 })
  const [tooltipSize, setTooltipSize] = useState({ w: 320, h: 180 })

  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)
  const announcerRef = useRef<HTMLSpanElement | null>(null)
  // Tracks whether we've emitted guide_started for this activation
  const capturedStartRef = useRef(false)

  const activeRef =
    guideStep === 1
      ? stepRefs.step1
      : guideStep === 2
        ? stepRefs.step2
        : guideStep === 3
          ? stepRefs.step3
          : stepRefs.step4

  // ------------------------------------------------------------------
  // Rect tracking
  // ------------------------------------------------------------------
  const updateRect = useCallback(() => {
    const node = activeRef.current
    if (!node) return
    setSpotlightRect(node.getBoundingClientRect())
    setViewport({ w: window.innerWidth, h: window.innerHeight })
  }, [activeRef])

  // After a step change, fire rect updates at several points to catch:
  //   0ms   — immediate (handles simple cases)
  //   150ms — after layout starts settling
  //   350ms — after CSS grid column transition (300ms duration)
  //   550ms — after Framer Motion entrance (400ms + 50ms delay)
  // Without this, measuring immediately after pdpStep advances picks up
  // stale coordinates from before the scroll + layout shift.
  const scheduleRectUpdates = useCallback(() => {
    const ids = [
      setTimeout(updateRect, 0),
      setTimeout(updateRect, 150),
      setTimeout(updateRect, 350),
      setTimeout(updateRect, 550),
    ]
    return () => ids.forEach(clearTimeout)
  }, [updateRect])

  useLayoutEffect(() => {
    if (!active) return
    return scheduleRectUpdates()
  }, [active, guideStep, scheduleRectUpdates])

  useEffect(() => {
    if (!active) return
    const ro = new ResizeObserver(updateRect)
    if (activeRef.current) ro.observe(activeRef.current)
    const sidebar = sidebarScrollRef.current
    sidebar?.addEventListener("scroll", updateRect, { passive: true })
    // Track window scroll too — "Customize this product" scrolls the whole
    // page to the canvas, which invalidates every getBoundingClientRect value.
    window.addEventListener("scroll", updateRect, { passive: true })
    window.addEventListener("resize", updateRect, { passive: true })
    return () => {
      ro.disconnect()
      sidebar?.removeEventListener("scroll", updateRect)
      window.removeEventListener("scroll", updateRect)
      window.removeEventListener("resize", updateRect)
    }
  }, [active, guideStep, updateRect, activeRef, sidebarScrollRef])

  // ------------------------------------------------------------------
  // Auto-advance when pdpStep moves forward
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!active) return
    if (pdpStep > guideStep) {
      const next = pdpStep as 1 | 2 | 3 | 4
      setGuideStep(next)
      // Scroll the newly spotlit card into view, then re-measure rect
      // once the scroll has settled.
      const targetRef =
        next === 1
          ? stepRefs.step1
          : next === 2
            ? stepRefs.step2
            : next === 3
              ? stepRefs.step3
              : stepRefs.step4
      targetRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center",
      })
    }
  }, [pdpStep, guideStep, active, stepRefs, prefersReducedMotion])

  // ------------------------------------------------------------------
  // Announce step to screen readers
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!active || !announcerRef.current) return
    const cfg = STEP_CONFIGS[guideStep]
    announcerRef.current.textContent = `Step ${guideStep} of 4: ${cfg.headline}. ${cfg.body}`
  }, [active, guideStep])

  // ------------------------------------------------------------------
  // Track guide_step_viewed analytics
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!active) return
    phCapture("guide_step_viewed", { step: guideStep })
  }, [active, guideStep])

  // ------------------------------------------------------------------
  // ESC key
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose("esc")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, guideStep])

  // ------------------------------------------------------------------
  // Focus management
  // ------------------------------------------------------------------
  useEffect(() => {
    if (active) {
      // Defer so the portal has rendered
      setTimeout(() => {
        const firstBtn = tooltipRef.current?.querySelector<HTMLButtonElement>("button")
        firstBtn?.focus()
      }, 50)
    } else {
      triggerRef.current?.focus()
    }
  }, [active])

  // Measure tooltip size after render (so we can position it correctly)
  useEffect(() => {
    if (!active || !tooltipRef.current) return
    const { offsetWidth: w, offsetHeight: h } = tooltipRef.current
    if (w && h) setTooltipSize({ w, h })
  }, [active, guideStep])

  // ------------------------------------------------------------------
  // Focus trap inside tooltip
  // ------------------------------------------------------------------
  const handleTooltipKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return
    const focusable = Array.from(
      tooltipRef.current?.querySelectorAll<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      ) ?? []
    )
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------
  const handleOpen = () => {
    const startStep = hasStep1 ? pdpStep : (Math.max(pdpStep, 2) as 2 | 3 | 4)
    setGuideStep(startStep as 1 | 2 | 3 | 4)
    setActive(true)
    capturedStartRef.current = false
  }

  const handleClose = (reason: "skip" | "esc" | "backdrop") => {
    phCapture("guide_dismissed", { at_step: guideStep, reason })
    setActive(false)
  }

  const handleGotIt = () => {
    if (!capturedStartRef.current) {
      phCapture("guide_started")
      capturedStartRef.current = true
    }
    if (guideStep === 4) {
      phCapture("guide_completed")
      setActive(false)
      return
    }
    // Manual advance — move to next step
    const next = (guideStep + 1) as 1 | 2 | 3 | 4
    setGuideStep(next)
  }

  // ------------------------------------------------------------------
  // Tooltip position
  // ------------------------------------------------------------------
  const getTooltipStyle = (): React.CSSProperties => {
    if (!spotlightRect) return { left: 16, top: 16 }
    const PAD = 16
    const isMobile = viewport.w < 1024

    if (isMobile) {
      const top = spotlightRect.bottom + SPOTLIGHT_PADDING + PAD
      const fitsBelow = top + tooltipSize.h < viewport.h - PAD
      return {
        left: PAD,
        right: PAD,
        top: fitsBelow ? top : Math.max(PAD, spotlightRect.top - tooltipSize.h - PAD),
        maxWidth: viewport.w - PAD * 2,
      }
    }

    // Desktop: try left of the spotlight
    const leftX = spotlightRect.left - SPOTLIGHT_PADDING - tooltipSize.w - PAD
    const topY = Math.min(
      Math.max(PAD, spotlightRect.top + spotlightRect.height / 2 - tooltipSize.h / 2),
      viewport.h - tooltipSize.h - PAD
    )

    if (leftX >= PAD) {
      return { left: leftX, top: topY, width: tooltipSize.w }
    }

    // Fall back: right of the spotlight
    const rightX = spotlightRect.right + SPOTLIGHT_PADDING + PAD
    if (rightX + tooltipSize.w <= viewport.w - PAD) {
      return { left: rightX, top: topY, width: tooltipSize.w }
    }

    // Fall back: below spotlight
    return {
      left: Math.max(PAD, spotlightRect.left),
      top: spotlightRect.bottom + SPOTLIGHT_PADDING + PAD,
      width: Math.min(tooltipSize.w, viewport.w - PAD * 2),
    }
  }

  // ------------------------------------------------------------------
  // SVG cutout bounds (spotlight rect + padding)
  // ------------------------------------------------------------------
  const getCutout = () => {
    if (!spotlightRect) return null
    return {
      x: spotlightRect.left - SPOTLIGHT_PADDING,
      y: spotlightRect.top - SPOTLIGHT_PADDING,
      width: spotlightRect.width + SPOTLIGHT_PADDING * 2,
      height: spotlightRect.height + SPOTLIGHT_PADDING * 2,
    }
  }

  const cfg = STEP_CONFIGS[guideStep]
  const cutout = getCutout()

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <>
      {/* Trigger button — wrapper holds the pulse ring outside overflow:hidden context */}
      <div className={`relative shrink-0 ${active ? "invisible pointer-events-none" : ""}`}>
        {showTriggerPulse && (
          <span className="absolute -inset-1.5 rounded-xl animate-ping bg-ui-fg-base/15 pointer-events-none" />
        )}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            phCapture("guide_started")
            capturedStartRef.current = true
            handleOpen()
          }}
          aria-label="Open the step-by-step guide"
          aria-expanded={active}
          className="flex items-center gap-1 rounded-lg border border-ui-border-base bg-ui-bg-base px-2.5 py-1.5 text-xs font-medium text-ui-fg-subtle shadow-sm transition-colors hover:bg-ui-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-fg-base whitespace-nowrap"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
            className="shrink-0"
          >
            <circle cx="6" cy="6" r="5.4" stroke="currentColor" strokeWidth="1.2" />
            <path
              d="M5.1 4.6C5.1 4.1 5.5 3.7 6 3.7s.9.4.9.9c0 .4-.2.7-.6.9L6 5.8v.7"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
            <circle cx="6" cy="7.9" r=".5" fill="currentColor" />
          </svg>
          Need help?
        </button>
      </div>

      {/* Visually-hidden announcer for screen readers */}
      <span
        ref={announcerRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Portal overlay — only rendered in browser and when active */}
      {active &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {/*
              Backdrop dismiss: 4 quadrant divs covering only the dark area,
              leaving the spotlight region uncovered so clicks reach the real
              step cards underneath.
            */}
            {cutout ? (
              <>
                {/* Top strip */}
                <div
                  className="fixed cursor-pointer"
                  style={{ zIndex: 9988, top: 0, left: 0, right: 0, height: cutout.y }}
                  onClick={() => handleClose("backdrop")}
                  aria-hidden="true"
                />
                {/* Bottom strip */}
                <div
                  className="fixed cursor-pointer"
                  style={{ zIndex: 9988, top: cutout.y + cutout.height, left: 0, right: 0, bottom: 0 }}
                  onClick={() => handleClose("backdrop")}
                  aria-hidden="true"
                />
                {/* Left strip (between top and bottom) */}
                <div
                  className="fixed cursor-pointer"
                  style={{ zIndex: 9988, top: cutout.y, height: cutout.height, left: 0, width: cutout.x }}
                  onClick={() => handleClose("backdrop")}
                  aria-hidden="true"
                />
                {/* Right strip (between top and bottom) */}
                <div
                  className="fixed cursor-pointer"
                  style={{ zIndex: 9988, top: cutout.y, height: cutout.height, left: cutout.x + cutout.width, right: 0 }}
                  onClick={() => handleClose("backdrop")}
                  aria-hidden="true"
                />
              </>
            ) : (
              /* Fallback full-screen dismiss before first rect is measured */
              <div
                className="fixed inset-0 cursor-pointer"
                style={{ zIndex: 9988 }}
                onClick={() => handleClose("backdrop")}
                aria-hidden="true"
              />
            )}

            {/* SVG spotlight mask */}
            {cutout && (
              <svg
                className="fixed inset-0 h-full w-full"
                style={{ zIndex: 9989, pointerEvents: "none" }}
                aria-hidden="true"
              >
                <defs>
                  <mask id="guide-spotlight-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <rect
                      x={cutout.x}
                      y={cutout.y}
                      width={cutout.width}
                      height={cutout.height}
                      rx="14"
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill="rgba(0,0,0,0.62)"
                  mask="url(#guide-spotlight-mask)"
                />
              </svg>
            )}

            {/* Spotlight ring — subtle glow around cutout */}
            {cutout && (
              <div
                className="fixed rounded-xl pointer-events-none"
                style={{
                  zIndex: 9989,
                  left: cutout.x,
                  top: cutout.y,
                  width: cutout.width,
                  height: cutout.height,
                  boxShadow: "0 0 0 2px rgba(255,255,255,0.25), 0 8px 32px rgba(0,0,0,0.4)",
                }}
                aria-hidden="true"
              />
            )}

            {/* Tooltip */}
            <div
              ref={tooltipRef}
              role="dialog"
              aria-modal="true"
              aria-label={`Customizer guide — step ${guideStep} of 4`}
              onKeyDown={handleTooltipKeyDown}
              className="fixed flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-2xl"
              style={{
                zIndex: 9990,
                maxWidth: 320,
                ...getTooltipStyle(),
              }}
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ui-fg-subtle">
                  Step {guideStep} of 4
                </span>
                <button
                  type="button"
                  onClick={() => handleClose("skip")}
                  aria-label="Close guide"
                  className="rounded p-0.5 text-ui-fg-muted transition-colors hover:text-ui-fg-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ui-fg-base"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path
                      d="M2 2l10 10M12 2L2 12"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Step heading + body */}
              <div className="space-y-1.5">
                <p className="text-base font-semibold text-ui-fg-base">{cfg.headline}</p>
                <p className="text-sm leading-relaxed text-ui-fg-subtle">{cfg.body}</p>
              </div>

              {/* Step dots */}
              <div className="flex gap-1.5">
                {([1, 2, 3, 4] as const)
                  .filter((s) => (hasStep1 ? true : s !== 1))
                  .map((s) => (
                    <span
                      key={s}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        s === guideStep
                          ? "w-4 bg-ui-fg-base"
                          : s < guideStep
                            ? "w-1.5 bg-ui-fg-muted"
                            : "w-1.5 bg-ui-border-base"
                      }`}
                    />
                  ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-0.5">
                <button
                  type="button"
                  onClick={() => handleClose("skip")}
                  className="text-xs text-ui-fg-muted underline underline-offset-2 transition-colors hover:text-ui-fg-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ui-fg-base rounded"
                >
                  Skip tour
                </button>
                <button
                  type="button"
                  onClick={handleGotIt}
                  className="rounded-lg bg-ui-fg-base px-4 py-2 text-sm font-medium text-ui-bg-base shadow-sm transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-fg-base focus-visible:ring-offset-2"
                >
                  {guideStep === 4 ? "Finish tour" : "Got it →"}
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  )
}
