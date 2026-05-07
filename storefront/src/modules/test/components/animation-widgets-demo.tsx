"use client"

import confetti from "canvas-confetti"
import { AnimatePresence, motion } from "framer-motion"
import dynamic from "next/dynamic"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

import {
  ANIMATION_LAB_PRE_BUTTON_SECTION_COUNT,
  ANIMATION_LAB_SECTIONS_PER_PAGE,
} from "@modules/test/animation-lab-constants"
import { ANIMATION_LAB_RIVE_PRESETS } from "@modules/test/animation-lab-rive-presets"
import { ANIMATION_LAB_SPLINE_PRESETS } from "@modules/test/animation-lab-spline-presets"

import {
  LabGsapScrollTrigger,
  LabScratchOffCanvas,
  LabStartingStyleDemo,
  LabStickyStoryNav,
  LabTossCard,
  LabViewTransitionDemo,
} from "./animation-widgets-lab-advanced-blocks"
import {
  LabAccordion,
  LabAnimatedStat,
  LabAuroraMesh,
  LabBadgePulse,
  LabBlurInWords,
  LabBottomSheet,
  LabCartBump,
  LabCopyMorph,
  LabCrossfadePosters,
  LabDashedBorderCard,
  LabDocumentScrollProgress,
  LabDragCarousel,
  LabElasticDrag,
  LabFakeVideoPoster,
  LabFilmGrain,
  LabGlassSheen,
  LabGradientText,
  LabImageZoomHover,
  LabKenBurns,
  LabLinkUnderline,
  LabMagneticButton,
  LabMarquee,
  LabParallaxScrollBox,
  LabProgressRing,
  LabRippleButton,
  LabScrambleText,
  LabScrollSnapStrip,
  LabSkeletonShimmerReduced,
  LabSliderTicks,
  LabSparklineBars,
  LabSpotlightGlow,
  LabStaggeredReveal,
  LabStarRating,
  LabStepper,
  LabStockMeter,
  LabSvgStrokeDraw,
  LabSwitch,
  LabTabsUnderline,
  LabTiltCard,
  LabToastStack,
} from "./animation-widgets-lab-extra-blocks"
import {
  LabTierCActivityHeatmap,
  LabTierCCascadingContextMenu,
  LabTierCCommandPalette,
  LabTierCCurtainWipeImage,
  LabTierCDirectionalHoverOverlay,
  LabTierCDraggablePip,
  LabTierCDynamicIsland,
  LabTierCFabSpeedDial,
  LabTierCFluidCursorTrail,
  LabTierCFloatingLabelInput,
  LabTierCGaugeNeedle,
  LabTierCGlitchHover,
  LabTierCGridPolkaDrift,
  LabTierCHasSiblingDim,
  LabTierCJellyButton,
  LabTierCLikeParticleBurst,
  LabTierCMarqueeOutlineFill,
  LabTierCMaskImageWipe,
  LabTierCMegaMenuStagger,
  LabTierCNeonFlicker,
  LabTierCNotificationDrawer,
  LabTierCPasswordStrengthMeter,
  LabTierCPiePullOut,
  LabTierCPinchZoomBox,
  LabTierCPullRefreshTeardrop,
  LabTierCScrollDrivenBar,
  LabTierCSidebarSqueeze,
  LabTierCSlotMachineWords,
  LabTierCSwipeDeleteRow,
  LabTierCTextHighlightMarker,
} from "./animation-widgets-lab-tier-c-blocks"
import {
  LabTierDAddressCardExpand,
  LabTierDAsSeenCrossfade,
  LabTierDBreadcrumbMorph,
  LabTierDCartUndoToast,
  LabTierDConfettiShapes,
  LabTierDContentVisibilityDemo,
  LabTierDExpandableTableRow,
  LabTierDFilterChips,
  LabTierDFocusRingMorph,
  LabTierDHeroSplitTextMask,
  LabTierDLogoWallWave,
  LabTierDMiniCartDropdown,
  LabTierDNoiseGradientBorder,
  LabTierDOrderTimeline,
  LabTierDPromoCheckmark,
  LabTierDQtyStepper,
  LabTierDReducedMotionToggleDemo,
  LabTierDReorderList,
  LabTierDReviewCarouselDrag,
  LabTierDScrollbarGutterDemo,
  LabTierDSearchSuggest,
  LabTierDSectionDividerSweep,
  LabTierDSkeletonListShimmer,
  LabTierDStickyCtaScrollDir,
  LabTierDStockCountdownPulse,
  LabTierDSvgBlobMorph,
  LabTierDTrustBadgeCarousel,
  LabTierDUGCMasonry,
  LabTierDViewTransitionScoped,
  LabTierDWillChangeStress,
} from "./animation-widgets-lab-tier-d-blocks"
import { useButtonAnimationsLabSections } from "./button-animations-demo"

const SECTIONS_PER_PAGE = ANIMATION_LAB_SECTIONS_PER_PAGE

const LordiconBlock = dynamic(() => import("./animation-widgets-lordicon-block"), {
  ssr: false,
  loading: () => (
    <div className="flex gap-4">
      {[1, 2, 3].map((k) => (
        <div key={k} className="h-20 w-20 animate-pulse rounded-lg bg-ui-bg-base" />
      ))}
    </div>
  ),
})

const LottieBlock = dynamic(() => import("./animation-widgets-lottie-block"), {
  ssr: false,
  loading: () => <div className="mx-auto h-[200px] max-w-xs animate-pulse rounded-2xl bg-ui-bg-base" />,
})

const ParticlesBlock = dynamic(() => import("./animation-widgets-particles-block"), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] w-full animate-pulse rounded-xl bg-ui-bg-subtle" />
  ),
})

const Snowfall = dynamic(() => import("react-snowfall"), {
  ssr: false,
  loading: () => null,
})

const RivePresetBlock = dynamic(() => import("./animation-widgets-rive-preset-block"), {
  ssr: false,
  loading: () => <div className="h-[220px] w-full animate-pulse rounded-xl bg-ui-bg-subtle" />,
})

const SplinePresetBlock = dynamic(() => import("./animation-widgets-spline-preset-block"), {
  ssr: false,
  loading: () => <div className="h-[280px] w-full animate-pulse rounded-xl bg-ui-bg-subtle" />,
})

const ParticleTextLabBlock = dynamic(() => import("./animation-widgets-particle-text-block"), {
  ssr: false,
  loading: () => <div className="h-[280px] w-full animate-pulse rounded-xl bg-black" />,
})

const ThreeLabBlock = dynamic(() => import("./animation-widgets-three-block"), {
  ssr: false,
  loading: () => <div className="h-[220px] w-full animate-pulse rounded-xl bg-ui-bg-subtle" />,
})

/** Demo countdown target (Australia/Sydney-friendly fixed instant). */
const DEMO_COUNTDOWN_END = new Date("2026-12-31T12:00:00.000Z").getTime()

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = () => setReduced(mq.matches)
    onChange()
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return reduced
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="content-container border-b border-ui-border-base py-12">
      <h2 className="text-xl font-semibold text-ui-fg-base">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-3xl text-sm text-ui-fg-muted">{description}</p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  )
}

function CountdownDisplay() {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const { days, hours, minutes, seconds, ended } = useMemo(() => {
    const diff = Math.max(0, DEMO_COUNTDOWN_END - now)
    if (diff === 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: now >= DEMO_COUNTDOWN_END }
    }
    const s = Math.floor(diff / 1000)
    return {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
      ended: false,
    }
  }, [now])

  const box = "rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-3 text-center min-w-[4.5rem]"
  if (ended) {
    return <p className="text-sm font-medium text-ui-fg-base">Demo target date reached — set a new one in code.</p>
  }

  return (
    <div className="flex flex-wrap gap-3">
      <div className={box}>
        <div className="text-2xl font-bold tabular-nums text-ui-fg-base">{days}</div>
        <div className="text-xs text-ui-fg-muted">days</div>
      </div>
      <div className={box}>
        <div className="text-2xl font-bold tabular-nums text-ui-fg-base">{hours}</div>
        <div className="text-xs text-ui-fg-muted">hours</div>
      </div>
      <div className={box}>
        <div className="text-2xl font-bold tabular-nums text-ui-fg-base">{minutes}</div>
        <div className="text-xs text-ui-fg-muted">min</div>
      </div>
      <div className={box}>
        <div className="text-2xl font-bold tabular-nums text-ui-fg-base">{seconds}</div>
        <div className="text-xs text-ui-fg-muted">sec</div>
      </div>
    </div>
  )
}

function BeforeAfterSlider() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [pct, setPct] = useState(50)
  const dragging = useRef(false)

  const onPointerMove = useCallback((clientX: number) => {
    const el = wrapRef.current
    if (!el) {
      return
    }
    const r = el.getBoundingClientRect()
    const x = Math.min(Math.max(clientX - r.left, 0), r.width)
    setPct(Math.round((x / r.width) * 100))
  }, [])

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto aspect-[5/3] w-full max-w-lg select-none overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-subtle touch-none"
      onPointerDown={(e) => {
        dragging.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
        onPointerMove(e.clientX)
      }}
      onPointerMove={(e) => {
        if (dragging.current) {
          onPointerMove(e.clientX)
        }
      }}
      onPointerUp={(e) => {
        dragging.current = false
        e.currentTarget.releasePointerCapture(e.pointerId)
      }}
      onPointerCancel={() => {
        dragging.current = false
      }}
    >
      {/* After (full background) */}
      <img
        src="https://picsum.photos/seed/afterwidget/800/480"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      {/* Before (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      >
        <img
          src="https://picsum.photos/seed/beforewidget/800/480"
          alt=""
          className="absolute inset-0 h-full w-full object-cover grayscale"
          draggable={false}
        />
      </div>
      <div
        className="absolute bottom-0 top-0 w-1 -translate-x-1/2 bg-white shadow-md"
        style={{ left: `${pct}%` }}
      />
      <div
        className="absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-ui-fg-base text-xs font-bold text-ui-bg-base shadow-lg"
        style={{ left: `${pct}%` }}
      >
        ↔
      </div>
      <p className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
        Before
      </p>
      <p className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
        After
      </p>
    </div>
  )
}

function LoaderOverlayDemo({ reducedMotion }: { reducedMotion: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        className="rounded-full border border-ui-border-base bg-ui-bg-base px-4 py-2 text-sm font-medium text-ui-fg-base hover:bg-ui-bg-subtle"
        onClick={() => setOpen(true)}
      >
        Show loading overlay
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-ui-fg-base/85 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="loader-demo-title"
          >
            <h3 id="loader-demo-title" className="sr-only">
              Demo loading state
            </h3>
            {reducedMotion ? (
              <div className="h-12 w-12 rounded-full border-4 border-ui-bg-base border-t-transparent" />
            ) : (
              <motion.div
                className="h-14 w-14 rounded-full border-4 border-[#FF2E63] border-b-transparent border-l-transparent"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
              />
            )}
            <p className="mt-6 text-sm text-ui-bg-base">Rolling loader (demo only)</p>
            <button
              type="button"
              className="mt-8 rounded-full bg-ui-bg-base px-5 py-2 text-sm font-medium text-ui-fg-base"
              onClick={() => setOpen(false)}
            >
              Dismiss
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

const TYPEWRITER_TEXT = "Motion that guides attention — without stealing it."

function TypewriterHeadline({ reducedMotion }: { reducedMotion: boolean }) {
  const { ref, inView } = useInView({ threshold: 0.35, triggerOnce: false })
  const [len, setLen] = useState(0)
  const [replayKey, setReplayKey] = useState(0)

  const text = TYPEWRITER_TEXT
  const fullLen = text.length

  useEffect(() => {
    if (reducedMotion) {
      setLen(fullLen)
      return
    }
    if (!inView) {
      return
    }

    let cancelled = false
    let current = 0
    let activeId: ReturnType<typeof setTimeout> | undefined
    setLen(0)

    const step = () => {
      if (cancelled) {
        return
      }
      current += 1
      setLen(Math.min(current, fullLen))
      if (current < fullLen) {
        activeId = setTimeout(step, 48)
      }
    }

    activeId = setTimeout(step, 48)
    return () => {
      cancelled = true
      if (activeId !== undefined) {
        window.clearTimeout(activeId)
      }
    }
  }, [fullLen, inView, reducedMotion, replayKey])

  const visible = text.slice(0, len)
  const showCaret = !reducedMotion && inView

  return (
    <div ref={ref} className="space-y-3">
      <p className="font-mono text-base text-ui-fg-base small:text-lg">
        {visible}
        {showCaret ? (
          <span
            className="ml-0.5 inline-block h-[1.1em] w-2 translate-y-[0.08em] bg-[#FF2E63] align-middle motion-safe:animate-pulse"
            aria-hidden
          />
        ) : null}
      </p>
      {!reducedMotion ? (
        <button
          type="button"
          className="text-xs font-medium text-ui-fg-muted underline decoration-ui-border-base underline-offset-2 hover:text-ui-fg-base"
          onClick={() => setReplayKey((k) => k + 1)}
        >
          Replay typing
        </button>
      ) : (
        <p className="text-xs text-ui-fg-muted">Full line shown (prefers reduced motion).</p>
      )}
    </div>
  )
}

function FloatingBlobs({ reducedMotion }: { reducedMotion: boolean }) {
  if (reducedMotion) {
    return (
      <p className="text-sm text-ui-fg-muted">
        Floating blobs disabled when reduced motion is preferred.
      </p>
    )
  }

  return (
    <div className="relative h-52 overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-subtle">
      <motion.div
        className="absolute -left-8 top-6 h-36 w-36 rounded-full bg-[#FF2E63]/25 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 24, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-10 bottom-2 h-40 w-40 rounded-[40%] bg-indigo-400/30 blur-3xl"
        animate={{ x: [0, -32, 0], y: [0, -18, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/3 top-1/4 h-24 w-24 rounded-full bg-emerald-400/20 blur-2xl"
        animate={{ scale: [1, 1.15, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <p className="absolute bottom-3 left-3 right-3 text-center text-xs text-ui-fg-muted">
        CSS blur + Framer Motion (no WebGL).
      </p>
    </div>
  )
}

function CustomCursorPlayground() {
  const [pos, setPos] = useState({ x: 120, y: 80 })
  const [magnetic, setMagnetic] = useState(false)

  return (
    <div
      className="relative h-56 w-full cursor-none overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-subtle"
      onPointerMove={(e) => {
        const b = e.currentTarget.getBoundingClientRect()
        setPos({ x: e.clientX - b.left, y: e.clientY - b.top })
      }}
      onPointerLeave={() => setMagnetic(false)}
    >
      <div
        className="pointer-events-none absolute z-10 border-2 border-[#FF2E63] bg-transparent transition-[width,height,border-radius] duration-150 ease-out"
        style={{
          left: pos.x,
          top: pos.y,
          width: magnetic ? 56 : 30,
          height: magnetic ? 56 : 30,
          transform: "translate(-50%, -50%)",
          borderRadius: magnetic ? "22%" : "9999px",
        }}
      />
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="max-w-sm text-center text-sm text-ui-fg-muted">
          Global dot trail is off on this route. Hover the targets — the ring morphs.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="rounded-full border border-ui-border-base bg-ui-bg-base px-4 py-2 text-sm font-medium text-ui-fg-base"
            onPointerEnter={() => setMagnetic(true)}
            onPointerLeave={() => setMagnetic(false)}
          >
            Magnetic
          </button>
          <a
            href="#embed-social-lab"
            className="rounded-full border border-dashed border-ui-border-base px-4 py-2 text-sm text-ui-fg-subtle"
            onPointerEnter={() => setMagnetic(true)}
            onPointerLeave={() => setMagnetic(false)}
          >
            Link target
          </a>
        </div>
      </div>
    </div>
  )
}

function SocialEmbedSection() {
  const src = process.env.NEXT_PUBLIC_EMBED_SOCIAL_IFRAME_SRC

  if (src) {
    return (
      <iframe
        title="Embedded social feed"
        src={src}
        className="h-[420px] w-full rounded-xl border border-ui-border-base bg-ui-bg-subtle"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    )
  }

  return (
    <div
      id="embed-social-lab"
      className="rounded-xl border border-dashed border-ui-border-base bg-ui-bg-subtle p-6 text-sm text-ui-fg-muted"
    >
      <p className="font-medium text-ui-fg-base">EmbedSocial / iframe placeholder</p>
      <p className="mt-2">
        Set <code className="text-ui-fg-base">NEXT_PUBLIC_EMBED_SOCIAL_IFRAME_SRC</code> to your
        vendor iframe URL (EmbedSocial, Taggbox, etc.). Leave unset for this safe fallback.
      </p>
    </div>
  )
}

function LabPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  if (totalPages <= 1) {
    return null
  }

  const hrefFor = (p: number) =>
    p <= 1 ? "/test/animation-widgets" : `/test/animation-widgets?page=${p}`

  return (
    <nav
      className="content-container border-t border-ui-border-base py-8"
      aria-label="Animation lab pages"
    >
      <div className="flex flex-col items-stretch justify-between gap-4 small:flex-row small:items-center">
        <p className="text-sm text-ui-fg-muted">
          Page <span className="tabular-nums text-ui-fg-base">{currentPage}</span> of{" "}
          <span className="tabular-nums text-ui-fg-base">{totalPages}</span>
          <span className="text-ui-fg-subtle"> — </span>
          {SECTIONS_PER_PAGE} sections per page
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {currentPage <= 1 ? (
            <span
              className="rounded-full border border-ui-border-base bg-ui-bg-base px-3 py-1.5 text-sm font-medium text-ui-fg-muted opacity-50"
              aria-disabled
            >
              Previous
            </span>
          ) : (
            <LocalizedClientLink
              href={hrefFor(currentPage - 1)}
              className="rounded-full border border-ui-border-base bg-ui-bg-base px-3 py-1.5 text-sm font-medium text-ui-fg-base hover:bg-ui-bg-subtle"
            >
              Previous
            </LocalizedClientLink>
          )}
          <ul className="flex flex-wrap gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <li key={p}>
                <LocalizedClientLink
                  href={hrefFor(p)}
                  className={
                    p === currentPage
                      ? "inline-flex min-w-[2.25rem] justify-center rounded-full bg-ui-fg-base px-2 py-1 text-sm font-medium text-ui-bg-base"
                      : "inline-flex min-w-[2.25rem] justify-center rounded-full border border-ui-border-base px-2 py-1 text-sm text-ui-fg-base hover:bg-ui-bg-subtle"
                  }
                  aria-current={p === currentPage ? "page" : undefined}
                >
                  {p}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
          {currentPage >= totalPages ? (
            <span
              className="rounded-full border border-ui-border-base bg-ui-bg-base px-3 py-1.5 text-sm font-medium text-ui-fg-muted opacity-50"
              aria-disabled
            >
              Next
            </span>
          ) : (
            <LocalizedClientLink
              href={hrefFor(currentPage + 1)}
              className="rounded-full border border-ui-border-base bg-ui-bg-base px-3 py-1.5 text-sm font-medium text-ui-fg-base hover:bg-ui-bg-subtle"
            >
              Next
            </LocalizedClientLink>
          )}
        </div>
      </div>
    </nav>
  )
}

export default function AnimationWidgetsDemo() {
  const searchParams = useSearchParams()
  const reducedMotion = usePrefersReducedMotion()
  const [snowOn, setSnowOn] = useState(true)
  const buttonLab = useButtonAnimationsLabSections(Section)

  const fireworkBurst = useCallback(() => {
    if (reducedMotion) {
      return
    }
    const count = 140
    const defaults = { origin: { y: 0.72 }, spread: 88, ticks: 220, gravity: 1.05, decay: 0.92 }

    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.35),
      scalar: 0.9,
      colors: ["#FF2E63", "#EEEEEE", "#fbbf24", "#6366f1"],
    })
    confetti({
      ...defaults,
      particleCount: Math.floor(count * 0.25),
      scalar: 0.75,
      colors: ["#FF2E63", "#f472b6"],
    })
  }, [reducedMotion])

  const animationSectionsOnly = useMemo(
    () => [
      <Section
        key="lordicon"
        title="Lordicon-style animated icons"
        description="Hover or focus each control to replay. JSON is fetched from Lordicon’s CDN (host copies in production if uptime is critical)."
      >
        <LordiconBlock />
      </Section>,

      <Section
        key="lottie"
        title="Lottie (scroll / view)"
        description="Vector animation loaded from a public Lottie JSON URL; playback follows visibility."
      >
        <LottieBlock reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="blobs"
        title="Floating blobs"
        description="Lightweight gradient shapes for depth — no 3D runtime."
      >
        <FloatingBlobs reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="cursor"
        title="Custom cursor playground"
        description="Only on this page the global trail cursor is disabled (see root layout)."
      >
        <CustomCursorPlayground />
      </Section>,

      <Section
        key="countdown"
        title="Countdown"
        description="Fixed demo end date in code — swap for a real launch or sale."
      >
        <CountdownDisplay />
      </Section>,

      <Section
        key="before-after"
        title="Before / after"
        description="Drag anywhere on the frame (pointer capture) to move the divider."
      >
        <BeforeAfterSlider />
      </Section>,

      <Section
        key="loader"
        title="Loading overlay"
        description="Local overlay mock — not a Next.js route loading.tsx."
      >
        <LoaderOverlayDemo reducedMotion={reducedMotion} />
      </Section>,

      <Section key="embed" title="Social embed" description="Optional iframe via environment variable.">
        <SocialEmbedSection />
      </Section>,

      <Section
        key="typewriter"
        title="Typewriter headline"
        description="Characters reveal when this block enters the viewport (so it doesn’t finish before you scroll here). Pink block cursor pulses while visible. Use Replay typing to run again. With prefers reduced motion, the full line shows immediately."
      >
        <TypewriterHeadline reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="particles"
        title="Particle field"
        description="tsParticles (slim) with grab interaction — lazy-loaded with this chunk."
      >
        <ParticlesBlock reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="snow"
        title="Snow + confetti burst"
        description="Snow uses react-snowfall; “fireworks” reuse canvas-confetti (no extra sim library)."
      >
        <div className="relative min-h-[200px] overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-subtle">
          {!reducedMotion && snowOn ? (
            <Snowfall
              snowflakeCount={70}
              speed={[0.6, 1.2]}
              wind={[-0.4, 0.8]}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                top: 0,
                left: 0,
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
          ) : null}
          <div className="relative z-[1] flex flex-col items-start gap-4 p-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ui-fg-base">
              <input
                type="checkbox"
                checked={snowOn}
                onChange={(e) => setSnowOn(e.target.checked)}
                className="rounded border-ui-border-base"
                disabled={reducedMotion}
              />
              Snow {reducedMotion ? "(off — reduced motion)" : ""}
            </label>
            <button
              type="button"
              className="rounded-full bg-[#FF2E63] px-4 py-2 text-sm font-medium text-[#EEEEEE] disabled:opacity-50"
              onClick={fireworkBurst}
              disabled={reducedMotion}
            >
              Confetti burst
            </button>
          </div>
        </div>
      </Section>,

      <Section
        key="stagger-reveal"
        title="Staggered scroll reveal"
        description="Fake product grid: children animate in with stagger when the block enters the viewport."
      >
        <LabStaggeredReveal reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="stat-tick"
        title="Animated stat (spring counter)"
        description="Number springs toward a target once in view — prefers reduced motion shows the final value immediately."
      >
        <LabAnimatedStat reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="marquee"
        title="Marquee ticker"
        description="Infinite horizontal promo strip; pauses as static copy when reduced motion is on."
      >
        <LabMarquee reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="skeleton"
        title="Skeleton + shimmer"
        description="Placeholder card with a moving sheen (disabled under reduced motion)."
      >
        <LabSkeletonShimmerReduced reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="svg-stroke"
        title="SVG stroke draw"
        description="Checkmark path uses pathLength — lightweight alternative to Lottie for line icons."
      >
        <LabSvgStrokeDraw reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="progress-ring"
        title="Progress ring"
        description="SVG circular progress — inline task or checkout step indicator."
      >
        <LabProgressRing reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="parallax-box"
        title="Parallax (scroll container)"
        description="Background layer moves on a slower curve while scrolling inside a fixed-height region."
      >
        <LabParallaxScrollBox reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="spotlight"
        title="Spotlight glow"
        description="Radial highlight follows the pointer inside a dark panel."
      >
        <LabSpotlightGlow />
      </Section>,

      <Section
        key="ripple"
        title="Press ripple"
        description="Material-style ripple from the contact point on a primary button."
      >
        <LabRippleButton />
      </Section>,

      <Section
        key="tilt-card"
        title="3D tilt card"
        description="Pointer-driven rotateX / rotateY with spring; flattened when reduced motion is preferred — compared with legacy bounce vs the default storefront listing (tilt + lift)."
      >
        <LabTiltCard reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="accordion"
        title="Accordion"
        description="FAQ-style expand/collapse with AnimatePresence height."
      >
        <LabAccordion reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tabs"
        title="Tabs + sliding underline"
        description="layoutId shared element for the active tab indicator."
      >
        <LabTabsUnderline />
      </Section>,

      <Section
        key="scroll-snap"
        title="Horizontal scroll snap"
        description="Native scroll-snap chips — good for related products on mobile."
      >
        <LabScrollSnapStrip />
      </Section>,

      <Section
        key="doc-scroll-progress"
        title="Document scroll progress"
        description="Thin Framer Motion bar tied to page scroll — only visible while this demo is mounted on a lab page."
      >
        <LabDocumentScrollProgress />
      </Section>,

      <Section
        key="stepper"
        title="Stepper"
        description="Checkout-style steps with an animated connector."
      >
        <LabStepper />
      </Section>,

      <Section
        key="cart-bump"
        title="Cart icon bump"
        description="Spring scale on fake “add” for feedback without haptics."
      >
        <LabCartBump reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="copy-morph"
        title="Copy button morph"
        description="Label crossfades to “Copied ✓” with aria-live for screen readers."
      >
        <LabCopyMorph />
      </Section>,

      <Section
        key="switch"
        title="Toggle switch"
        description="Spring thumb on an iOS-style switch."
      >
        <LabSwitch reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="stars"
        title="Star rating"
        description="Click stars or use the link to stagger-fill for a reviews UI."
      >
        <LabStarRating reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="badge-pulse"
        title="Pulsing badge"
        description="Subtle attention loop for “live” or status pills."
      >
        <LabBadgePulse reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="elastic-drag"
        title="Elastic drag"
        description="Framer drag with rubber-band constraints inside a playground."
      >
        <LabElasticDrag />
      </Section>,

      <Section
        key="gradient-text"
        title="Animated gradient text"
        description="background-clip text with shifting gradient stops."
      >
        <LabGradientText reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="link-underline"
        title="Link underline draw"
        description="Underline scales in on hover and focus-visible."
      >
        <LabLinkUnderline />
      </Section>,

      <Section
        key="blur-words"
        title="Blur-in words"
        description="Words lose blur as they enter the viewport."
      >
        <LabBlurInWords reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="scramble"
        title="Scramble / decode text"
        description="Decorative decode; reduced motion shows the final string only."
      >
        <LabScrambleText reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="img-zoom"
        title="Image zoom on hover"
        description="Product-tile pattern: overflow hidden + scale on hover."
      >
        <LabImageZoomHover />
      </Section>,

      <Section
        key="ken-burns"
        title="Ken Burns still"
        description="Slow pan and zoom on a still — static when reduced motion is on."
      >
        <LabKenBurns reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="crossfade"
        title="Crossfading posters"
        description="Two stills alternate with opacity — no video asset."
      >
        <LabCrossfadePosters reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="fake-video"
        title="Fake video poster"
        description="Play affordance with pulsing ring; click shows a short “buffering” overlay."
      >
        <LabFakeVideoPoster reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="film-grain"
        title="Film grain overlay"
        description="SVG fractalNoise texture at low opacity over a gradient."
      >
        <LabFilmGrain />
      </Section>,

      <Section
        key="aurora"
        title="Aurora mesh"
        description="Rotating conic gradient with heavy blur — distinct from the floating blobs demo."
      >
        <LabAuroraMesh reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="dashed-border"
        title="Animated dashed border"
        description="SVG stroke-dashoffset marquee around a promo card."
      >
        <LabDashedBorderCard />
      </Section>,

      <Section
        key="glass-sheen"
        title="Glass + sheen"
        description="backdrop-blur panel with a periodic highlight sweep."
      >
        <LabGlassSheen reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="sparkline"
        title="Sparkline bars"
        description="Bars grow with stagger when the chart enters view."
      >
        <LabSparklineBars reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="stock-meter"
        title="Stock meter"
        description="Low-inventory bar with warning color and gentle pulse copy."
      >
        <LabStockMeter reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="slider-ticks"
        title="Range slider + tick pop"
        description="Ticks scale when the thumb passes nearby."
      >
        <LabSliderTicks reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="drag-carousel"
        title="Draggable strip"
        description="Horizontal drag with elastic constraints (mouse-first carousel feel)."
      >
        <LabDragCarousel />
      </Section>,

      <Section
        key="magnetic-btn"
        title="Magnetic button"
        description="CTA subtly pulls toward the pointer within range."
      >
        <LabMagneticButton />
      </Section>,

      <Section
        key="bottom-sheet"
        title="Bottom sheet"
        description="Slide-up panel with backdrop tap to dismiss."
      >
        <LabBottomSheet />
      </Section>,

      <Section
        key="toast"
        title="Toast"
        description="Short status toast from the bottom center with spring motion."
      >
        <LabToastStack />
      </Section>,

      <Section
        key="gsap-scroll"
        title="GSAP ScrollTrigger"
        description="Scroll-linked scrub animation (same stack as brands hero). Static fallback when prefers reduced motion."
      >
        <LabGsapScrollTrigger reducedMotion={reducedMotion} />
      </Section>,

      ...ANIMATION_LAB_RIVE_PRESETS.map((p, i) => (
        <Section key={p.id} title={p.sectionTitle} description={p.sectionDescription}>
          <RivePresetBlock preset={p} envIndex={i + 1} reducedMotion={reducedMotion} />
        </Section>
      )),

      <Section
        key="particle-stipple-type"
        title="Particle stipple typography"
        description="Canvas stippled lettering on black: pointer repels grains; springs return to glyph homes when the cursor leaves (newmix-style). Static under reduced motion."
      >
        <ParticleTextLabBlock reducedMotion={reducedMotion} />
      </Section>,

      ...ANIMATION_LAB_SPLINE_PRESETS.map((p) => (
        <Section key={p.id} title={p.sectionTitle} description={p.sectionDescription}>
          <SplinePresetBlock preset={p} reducedMotion={reducedMotion} />
        </Section>
      )),

      <Section
        key="three-r3f"
        title="WebGL (React Three Fiber)"
        description="Lightweight scene with orbit controls; spin pauses under reduced motion."
      >
        <ThreeLabBlock reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="scratch-off"
        title="Canvas scratch-off"
        description="destination-out brush reveals a photo under a grey overlay."
      >
        <LabScratchOffCanvas reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="toss-card"
        title="Toss / fling card"
        description="High-velocity drag throws the card off-canvas with spring exit."
      >
        <LabTossCard reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="sticky-story"
        title="Sticky chapter label"
        description="Mini storytelling pattern: sticky title + scroll-spied sections inside a panel."
      >
        <LabStickyStoryNav />
      </Section>,

      <Section
        key="view-transition"
        title="View Transition API"
        description="document.startViewTransition for same-document UI swaps where supported."
      >
        <LabViewTransitionDemo reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="starting-style"
        title="CSS @starting-style"
        description="First-paint entrance when a card is mounted (feature-detect in supporting browsers)."
      >
        <LabStartingStyleDemo reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-dynamic-island"
        title="Dynamic island / morphing pill"
        description="Compact badge that expands with layout animation and crossfaded detail."
      >
        <LabTierCDynamicIsland reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-mega-menu"
        title="Mega-menu stagger"
        description="Nested columns and links with staggerChildren inside AnimatePresence."
      >
        <LabTierCMegaMenuStagger reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-sidebar-squeeze"
        title="Sidebar push / squeeze"
        description="Drawer opens by animating gridTemplateColumns so the main column reflows."
      >
        <LabTierCSidebarSqueeze reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-fab-dial"
        title="FAB speed-dial"
        description="Primary button rotates while radial actions stagger in."
      >
        <LabTierCFabSpeedDial reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-swipe-delete"
        title="Swipe-to-delete row"
        description="Horizontal drag reveals trash; exceeds threshold to dismiss."
      >
        <LabTierCSwipeDeleteRow reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-float-label"
        title="Floating label input"
        description="Material-style label driven by :focus-within and :placeholder-shown."
      >
        <LabTierCFloatingLabelInput />
      </Section>,

      <Section
        key="tier-c-like-burst"
        title="Like particle burst"
        description="Heart tap spawns radial dots; reduced motion keeps a simple scale."
      >
        <LabTierCLikeParticleBurst reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-password-meter"
        title="Password strength meter"
        description="Segments spring-fill from derived score."
      >
        <LabTierCPasswordStrengthMeter reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-pull-teardrop"
        title="Pull-to-refresh teardrop"
        description="Stretchy SVG blob from vertical drag (lab mock)."
      >
        <LabTierCPullRefreshTeardrop reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-highlight-pen"
        title="Highlighter marker"
        description="Marker bar scales on X as copy enters view."
      >
        <LabTierCTextHighlightMarker reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-slot-words"
        title="Rotating words (slot machine)"
        description="AnimatePresence mode wait with vertical motion between phrases."
      >
        <LabTierCSlotMachineWords reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-marquee-outline"
        title="Marquee outline fill"
        description="Stroked headline with gradient fill scrolling horizontally."
      >
        <LabTierCMarqueeOutlineFill reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-curtain-wipe"
        title="Image curtain wipe"
        description="Full-bleed shutter unclipped by scroll into view."
      >
        <LabTierCCurtainWipeImage reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-directional-hover"
        title="Directional hover overlay"
        description="Overlay slides from the nearest edge based on pointer entry."
      >
        <LabTierCDirectionalHoverOverlay />
      </Section>,

      <Section
        key="tier-c-glitch"
        title="Glitch (hover)"
        description="Short clipped RGB offset — disabled entirely for prefers-reduced-motion."
      >
        <LabTierCGlitchHover reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-polka-drift"
        title="Polka / grid drift"
        description="Infinite CSS background-position drift on a radial dot grid."
      >
        <LabTierCGridPolkaDrift reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-fluid-trail"
        title="Fluid cursor trail"
        description="Delayed spring follower vs. immediate cursor dot in a sandbox."
      >
        <LabTierCFluidCursorTrail reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-neon-flicker"
        title="Neon tube flicker"
        description="Sequenced drop-shadow keyframes; static copy when reduced motion."
      >
        <LabTierCNeonFlicker reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-gauge"
        title="Gauge needle (SVG)"
        description="Half-circle dial with spring-smoothed needle from a slider."
      >
        <LabTierCGaugeNeedle reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-heatmap"
        title="Activity heatmap stagger"
        description="GitHub-style grid with column-weighted stagger on reveal."
      >
        <LabTierCActivityHeatmap reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-pie-pull"
        title="Pie chart hover pull-out"
        description="SVG slices translate along centroid on hover."
      >
        <LabTierCPiePullOut />
      </Section>,

      <Section
        key="tier-c-jelly-btn"
        title="Jelly button"
        description="Exaggerated squash-and-stretch on tap."
      >
        <LabTierCJellyButton reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-pinch-zoom"
        title="Pinch / ctrl-wheel zoom"
        description="Ctrl+scroll (trackpad pinch) scales content inside a viewport."
      >
        <LabTierCPinchZoomBox reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-pip"
        title="Draggable PiP tile"
        description="Mini panel draggable within dashed bounds."
      >
        <LabTierCDraggablePip reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-cmdk"
        title="Command palette (⌘K)"
        description="Modal with spring scale, backdrop blur, and basic focus on open."
      >
        <LabTierCCommandPalette reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-context-menu"
        title="Cascading context menu"
        description="Menu shell then staggered list items."
      >
        <LabTierCCascadingContextMenu />
      </Section>,

      <Section
        key="tier-c-notif-drawer"
        title="Notification drawer"
        description="Full-height panel slides from the right with scrim."
      >
        <LabTierCNotificationDrawer reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-c-scroll-timeline"
        title="CSS scroll-driven animation"
        description="Progress bar driven by animation-timeline scroll() in a local scroller."
      >
        <LabTierCScrollDrivenBar />
      </Section>,

      <Section
        key="tier-c-has-dim"
        title="CSS :has() sibling dim"
        description="Grid dims non-hovered cards with pure CSS."
      >
        <LabTierCHasSiblingDim />
      </Section>,

      <Section
        key="tier-c-mask-wipe"
        title="CSS mask-image wipe"
        description="Organic reveal via animated mask-position on a gradient block."
      >
        <LabTierCMaskImageWipe reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-mini-cart"
        title="Mini-cart slide-down"
        description="Dropdown with staggered line items and height animation."
      >
        <LabTierDMiniCartDropdown reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-qty-stepper"
        title="Quantity stepper with spring"
        description="Tap bounce and shake when clamped at min/max."
      >
        <LabTierDQtyStepper reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-cart-undo"
        title="Cart line undo toast"
        description="Row exits; thin undo bar pairs with the removal."
      >
        <LabTierDCartUndoToast reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-address-card"
        title="Address card selection"
        description="Selected card scales and pulses border; others fade back."
      >
        <LabTierDAddressCardExpand reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-promo-check"
        title="Promo code success checkmark"
        description="Stroke draw and brief scale on success."
      >
        <LabTierDPromoCheckmark reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-order-timeline"
        title="Order timeline"
        description="Vertical steps; connector grows when the block enters view."
      >
        <LabTierDOrderTimeline reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-trust-row"
        title="Trust badge row"
        description="Slow horizontal crawl; pauses on hover via motion pause."
      >
        <LabTierDTrustBadgeCarousel reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-review-drag"
        title="Review carousel drag"
        description="Horizontal drag with snap to index and dot controls."
      >
        <LabTierDReviewCarouselDrag reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-ugc-masonry"
        title="UGC masonry stagger"
        description="Column-biased stagger for a fake image grid."
      >
        <LabTierDUGCMasonry reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-as-seen"
        title="As seen on crossfade"
        description="Lightweight title opacity cycle."
      >
        <LabTierDAsSeenCrossfade reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-stock-count"
        title="Reservation countdown"
        description="Time-based copy and bar with subtle urgency pulse."
      >
        <LabTierDStockCountdownPulse reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-reorder"
        title="Reorder list"
        description="Vertical drag-and-drop handles reorder local state."
      >
        <LabTierDReorderList reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-expand-row"
        title="Expandable table row"
        description="Detail panel via grid-template-rows 0fr → 1fr."
      >
        <LabTierDExpandableTableRow reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-filter-chips"
        title="Filter chips"
        description="Chips enter with layout; remove animates width away."
      >
        <LabTierDFilterChips reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-typeahead"
        title="Search suggestions"
        description="Fake typeahead with stagger on open."
      >
        <LabTierDSearchSuggest reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-breadcrumb"
        title="Breadcrumb morph"
        description="Long trail vs compact with shared layoutId on the last crumb."
      >
        <LabTierDBreadcrumbMorph reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-divider"
        title="Section divider sweep"
        description="Decorative rule grows on scroll into view."
      >
        <LabTierDSectionDividerSweep reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-sticky-cta"
        title="Sticky CTA scroll direction"
        description="Mini bar hides on downward scroll, returns on upward (local scroller)."
      >
        <LabTierDStickyCtaScrollDir reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-hero-mask"
        title="Hero split text mask"
        description="Per-word clip reveal on Y."
      >
        <LabTierDHeroSplitTextMask reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-logo-wave"
        title="Logo wall wave"
        description="Grid cells breathe with offset timing."
      >
        <LabTierDLogoWallWave reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-blob"
        title="SVG blob toggle"
        description="Two hand-tuned paths swap with a short crossfade."
      >
        <LabTierDSvgBlobMorph reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-confetti-star"
        title="Confetti shape burst"
        description="canvas-confetti with star shapes (distinct from snow lab)."
      >
        <LabTierDConfettiShapes reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-noise-border"
        title="Conic gradient border"
        description="Rotating gradient ring with counter-spun inner card."
      >
        <LabTierDNoiseGradientBorder reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-skeleton-list"
        title="Skeleton list shimmer"
        description="Five rows with staggered shimmer bars."
      >
        <LabTierDSkeletonListShimmer reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-focus-ring"
        title="Focus ring demo"
        description="Contrasting radii on button vs input with focus-visible."
      >
        <LabTierDFocusRingMorph reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-rm-toggle"
        title="Reduced-motion preview toggle"
        description="Local data-motion wrapper to preview simpler motion."
      >
        <LabTierDReducedMotionToggleDemo reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-will-change"
        title="Will-change stress note"
        description="Optional heavy blur layer with rAF fps note."
      >
        <LabTierDWillChangeStress reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-content-vis"
        title="content-visibility"
        description="Tall mock blocks skip work until near the viewport."
      >
        <LabTierDContentVisibilityDemo reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-view-transition"
        title="Scoped view transition"
        description="Pair of cards using view-transition-name where supported."
      >
        <LabTierDViewTransitionScoped reducedMotion={reducedMotion} />
      </Section>,

      <Section
        key="tier-d-scrollbar-gutter"
        title="scrollbar-gutter / scroll-padding"
        description="Stable gutter plus anchor scroll margin under a sticky header."
      >
        <LabTierDScrollbarGutterDemo reducedMotion={reducedMotion} />
      </Section>,
    ],
    [reducedMotion, snowOn, fireworkBurst]
  )

  const allSections = useMemo(
    () => [...animationSectionsOnly, ...buttonLab.sections],
    [animationSectionsOnly, buttonLab.sections]
  )

  useEffect(() => {
    if (
      process.env.NODE_ENV === "development" &&
      animationSectionsOnly.length !== ANIMATION_LAB_PRE_BUTTON_SECTION_COUNT
    ) {
      // Keeps `/test/button-animations` redirect and docs aligned when widgets are added above the merge point.
      console.warn(
        `[animation widgets lab] ANIMATION_LAB_PRE_BUTTON_SECTION_COUNT (${ANIMATION_LAB_PRE_BUTTON_SECTION_COUNT}) does not match animation-only section count (${animationSectionsOnly.length}). Update storefront/src/modules/test/animation-lab-constants.ts`
      )
    }
  }, [animationSectionsOnly.length])

  const totalPages = Math.max(1, Math.ceil(allSections.length / SECTIONS_PER_PAGE))
  const rawPage = parseInt(searchParams.get("page") ?? "1", 10)
  const pageFromUrl = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1
  const currentPage = Math.min(pageFromUrl, totalPages)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [currentPage])

  const start = (currentPage - 1) * SECTIONS_PER_PAGE
  const visibleSections = allSections.slice(start, start + SECTIONS_PER_PAGE)

  const animationOnlyCount = animationSectionsOnly.length
  const pageEndIndex = start + SECTIONS_PER_PAGE - 1
  const lastButtonIdx = animationOnlyCount + buttonLab.sections.length - 1
  const showButtonChrome =
    buttonLab.sections.length > 0 &&
    pageEndIndex >= animationOnlyCount &&
    start <= lastButtonIdx

  return (
    <div className="relative pb-8">
      {showButtonChrome ? (
        <div className="content-container border-b border-ui-border-base py-6 space-y-4">
          {buttonLab.chrome}
        </div>
      ) : null}
      {visibleSections}
      <LabPagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}
