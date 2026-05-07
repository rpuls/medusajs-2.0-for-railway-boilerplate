"use client"

import Image from "next/image"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

const STORAGE_KEY = "sc-contact-intro-session"

/** Final zoom scale — 1 keeps logo + tagline within the constrained column (no viewport overflow) */
const ZOOM_END_SCALE = 1
const ZOOM_MS = 2800
/** Pause on the final logo frame before particles spawn */
const PRE_EXPLODE_HOLD_MS = 750
/** Time for particle burst to clear the screen */
const EXPLODE_MS = 7600
/** Max random start delay on particles (must match generateParticles) */
const MAX_PARTICLE_DELAY_MS = 280
/**
 * Approx. fraction of EXPLODE_MS after which a particle has left the viewport
 * (easing is not linear; ~0.68 works well for cubic ease-out motion).
 */
const EDGE_EXIT_FRACTION = 0.68
/** Small buffer after the 75th-percentile “at edge” time before fading */
const POST_BURST_MS = 80
/** Solid backdrop only—fade this quickly so shards sit over the real page */
const BACKDROP_FADE_MS = 280
/** Final fade on the particle layer before unmount */
const PARTICLE_LAYER_FADE_MS = 200
const PARTICLE_MIN = 20
const PARTICLE_MAX = 30

const LOGO_SRC = "/branding/scp-vector.svg"
const LOGO_CLASS =
  "mx-auto w-full max-w-[min(18rem,82vw)] h-auto max-h-[min(32vh,11rem)] object-contain object-center small:max-h-[min(34vh,13rem)]"
const LOGO_W = 832
const LOGO_H = 274

type ParticleSpec = {
  tx: string
  ty: string
  rot: number
  width: number
  delayMs: number
}

/** ms after fly starts until overlay fades—when ~3/4 of particles have cleared the edge */
function msUntilFadeAfterParticlesAtEdge(particles: ParticleSpec[]): number {
  const edgeTimes = particles.map(
    (p) => p.delayMs + EXPLODE_MS * EDGE_EXIT_FRACTION
  )
  edgeTimes.sort((a, b) => a - b)
  const n = edgeTimes.length
  if (n === 0) {
    return EXPLODE_MS + MAX_PARTICLE_DELAY_MS + POST_BURST_MS
  }
  const idx = Math.min(n - 1, Math.ceil(0.75 * n) - 1)
  return edgeTimes[idx] + POST_BURST_MS
}

function generateParticles(count: number): ParticleSpec[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const dist = 90 + Math.random() * 110
    const tx = `${Math.cos(angle) * dist}vmin`
    const ty = `${Math.sin(angle) * dist}vmin`
    return {
      tx,
      ty,
      rot: (Math.random() - 0.5) * 900,
      width: 32 + Math.floor(Math.random() * 28),
      delayMs: Math.random() * 280,
    }
  })
}

/** Full-screen brand intro shown once per browser tab session for the wrapping route (e.g. Contact). */
export default function SessionIntro({
  children,
}: {
  children: React.ReactNode
}) {
  const [active, setActive] = useState(false)
  const [phase, setPhase] = useState<"zoom" | "explode" | "fading">("zoom")
  const [zoomScale, setZoomScale] = useState(0.028)
  const [particles, setParticles] = useState<ParticleSpec[] | null>(null)
  const [fly, setFly] = useState(false)
  /** Fade #EEEEEE scrim; particles stay opaque on their own layer */
  const [fadeSolidBackdrop, setFadeSolidBackdrop] = useState(false)
  const [particleLayerFade, setParticleLayerFade] = useState(false)
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const explodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const unmountFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const introUnmountDoneRef = useRef(false)

  useLayoutEffect(() => {
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY)) {
        return
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.sessionStorage.setItem(STORAGE_KEY, "1")
        return
      }
      setActive(true)
    } catch {
      setActive(false)
    }
  }, [])

  useEffect(() => {
    if (!active) {
      return
    }
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [active])

  useEffect(() => {
    if (!active || phase !== "zoom") {
      return
    }
    let cancelled = false
    const frame = window.requestAnimationFrame(() => {
      if (!cancelled) {
        setZoomScale(ZOOM_END_SCALE)
      }
    })
    zoomTimerRef.current = setTimeout(() => {
      if (!cancelled) {
        const n =
          PARTICLE_MIN +
          Math.floor(Math.random() * (PARTICLE_MAX - PARTICLE_MIN + 1))
        setParticles(generateParticles(n))
        setPhase("explode")
      }
    }, ZOOM_MS + PRE_EXPLODE_HOLD_MS)
    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
      if (zoomTimerRef.current) {
        window.clearTimeout(zoomTimerRef.current)
        zoomTimerRef.current = null
      }
    }
  }, [active, phase])

  useEffect(() => {
    if (phase !== "explode" || !particles) {
      return
    }
    let cancelled = false
    const frame = window.requestAnimationFrame(() => {
      if (!cancelled) {
        setFly(true)
      }
    })
    const waitAfterFlyMs = msUntilFadeAfterParticlesAtEdge(particles)
    explodeTimerRef.current = setTimeout(() => {
      if (!cancelled) {
        setParticleLayerFade(true)
        setPhase("fading")
      }
    }, waitAfterFlyMs)
    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
      if (explodeTimerRef.current) {
        window.clearTimeout(explodeTimerRef.current)
        explodeTimerRef.current = null
      }
    }
  }, [phase, particles])

  useEffect(() => {
    if (phase !== "explode" || !fly) {
      return
    }
    const frame = window.requestAnimationFrame(() => {
      setFadeSolidBackdrop(true)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [phase, fly])

  useEffect(() => {
    if (!particleLayerFade) {
      return
    }
    const finish = () => {
      if (introUnmountDoneRef.current) {
        return
      }
      introUnmountDoneRef.current = true
      if (unmountFallbackRef.current) {
        window.clearTimeout(unmountFallbackRef.current)
        unmountFallbackRef.current = null
      }
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "1")
      } catch {
        // ignore
      }
      setActive(false)
    }

    const el = overlayRef.current
    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName !== "opacity") {
        return
      }
      if (e.target !== el) {
        return
      }
      finish()
    }

    if (el) {
      el.addEventListener("transitionend", onTransitionEnd)
    }
    unmountFallbackRef.current = setTimeout(
      finish,
      PARTICLE_LAYER_FADE_MS + 200
    )

    return () => {
      if (el) {
        el.removeEventListener("transitionend", onTransitionEnd)
      }
      if (unmountFallbackRef.current) {
        window.clearTimeout(unmountFallbackRef.current)
        unmountFallbackRef.current = null
      }
    }
  }, [particleLayerFade])

  return (
    <>
      {children}
      {active ? (
        <>
          <div
            aria-hidden
            className={`fixed inset-0 z-[100] bg-[var(--brand-background)] transition-opacity ease-out ${
              fadeSolidBackdrop ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
            style={{
              transitionDuration: `${BACKDROP_FADE_MS}ms`,
            }}
          />

          {phase === "zoom" ? (
            <div className="fixed inset-0 z-[101] flex items-center justify-center overflow-hidden px-3 py-6 small:px-6">
              <div
                className="box-border flex w-full max-w-[min(92vw,26rem)] flex-col items-center gap-5 will-change-transform small:max-w-[min(92vw,28rem)]"
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: "center center",
                  transition: `transform ${ZOOM_MS}ms cubic-bezier(0.2, 0.85, 0.25, 1)`,
                }}
              >
                <Image
                  src={LOGO_SRC}
                  alt=""
                  width={LOGO_W}
                  height={LOGO_H}
                  className={`${LOGO_CLASS} select-none`}
                  priority
                />
                <p className="w-full max-w-[min(100%,20rem)] text-balance text-center text-sm font-semibold uppercase leading-snug tracking-[0.14em] text-ui-fg-base small:max-w-[min(100%,22rem)] small:text-base small:tracking-[0.16em]">
                  Premium custom apparel for Australian teams &amp; brands
                </p>
              </div>
            </div>
          ) : null}

          {phase === "explode" || phase === "fading" ? (
            particles ? (
              <div
                ref={overlayRef}
                aria-hidden
                className={`home-session-intro-particles fixed inset-0 z-[102] overflow-hidden pointer-events-none transition-opacity ease-out ${
                  particleLayerFade ? "opacity-0" : "opacity-100"
                }`}
                style={{
                  transitionDuration: `${PARTICLE_LAYER_FADE_MS}ms`,
                }}
              >
                {particles.map((p, i) => (
                  <Image
                    key={`p-${i}`}
                    src={LOGO_SRC}
                    alt=""
                    width={p.width}
                    height={Math.max(
                      12,
                      Math.round((p.width * LOGO_H) / LOGO_W)
                    )}
                    className="absolute opacity-95"
                    style={{
                      left: "50%",
                      top: "50%",
                      width: p.width,
                      height: "auto",
                      transform: fly
                        ? `translate(calc(-50% + ${p.tx}), calc(-50% + ${p.ty})) rotate(${p.rot}deg)`
                        : "translate(-50%, -50%) rotate(0deg)",
                      transition: fly
                        ? `transform ${EXPLODE_MS}ms cubic-bezier(0.18, 0.75, 0.22, 1) ${p.delayMs}ms`
                        : "none",
                    }}
                    priority={i < 6}
                  />
                ))}
              </div>
            ) : null
          ) : null}
        </>
      ) : null}
    </>
  )
}
