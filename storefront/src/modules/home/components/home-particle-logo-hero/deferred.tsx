"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import type { ComponentProps } from "react"

import type HomeParticleLogoHeroT from "./index"

type Props = ComponentProps<typeof HomeParticleLogoHeroT>

const DEFAULT_LOGO_SRC = "/branding/sc-prints-logo-transparent.png"

// Mirrors the *first paint* of the real particle hero exactly:
// same wrapper dimensions, same logo image position/sizing/opacity. When
// the dynamic chunk mounts and the canvas takes over, the wordmark stays
// in the identical pixel slot — no DOM tree swap, no layout shift.
const HeroPlaceholder = ({
  bgClassName,
  presentation,
  logoSrc,
}: {
  bgClassName?: string
  presentation: Props["presentation"]
  logoSrc?: string | null
}) => {
  const src = logoSrc ?? DEFAULT_LOGO_SRC
  const isFullscreen = presentation === "fullscreen"
  const sectionClass = isFullscreen
    ? `flex min-h-screen flex-col items-center justify-center ${
        bgClassName ?? "bg-ui-fg-base"
      } text-white`
    : `relative flex min-h-[min(72vh,680px)] w-full flex-col overflow-hidden ${
        bgClassName ?? "bg-black"
      } text-white`

  return (
    <section aria-label="SC Prints" className={sectionClass}>
      <div className="absolute inset-0">
        {/* Plain <img> matches the canvas hero's first-paint positioning
            byte-for-byte (see index.tsx ~line 4520). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          decoding="async"
          fetchPriority="high"
          draggable={false}
          aria-hidden
          className={`pointer-events-none absolute left-1/2 z-[5] max-w-[min(96%,80rem)] -translate-x-1/2 -translate-y-1/2 object-contain ${
            isFullscreen
              ? "top-[48%] max-h-[min(50vh,460px)]"
              : "top-1/2 max-h-[min(58vh,560px)]"
          }`}
        />
      </div>
    </section>
  )
}

const ParticleHero = dynamic(() => import("./index"), {
  ssr: false,
  loading: () => null,
})

// Renders a static-image placeholder that pixel-matches the particle
// hero's first frame (so swapping doesn't shift layout), and only mounts
// the heavy canvas chunk after window.load + idle. Keeps the audit's
// `chunks/16` (~30s of CPU) out of the initial bundle.
export default function DeferredParticleLogoHero(props: Props) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const schedule = () => {
      const ric = (window as any).requestIdleCallback as
        | ((cb: () => void, opts?: { timeout: number }) => number)
        | undefined
      if (ric) {
        ric(() => setReady(true), { timeout: 4000 })
      } else {
        setTimeout(() => setReady(true), 1500)
      }
    }
    if (document.readyState === "complete") {
      schedule()
    } else {
      window.addEventListener("load", schedule, { once: true })
      return () => window.removeEventListener("load", schedule)
    }
  }, [])

  if (!ready) {
    return (
      <HeroPlaceholder
        bgClassName={props.bgClassName}
        presentation={props.presentation}
        logoSrc={props.logoSrc as string | null | undefined}
      />
    )
  }

  return <ParticleHero {...props} />
}
