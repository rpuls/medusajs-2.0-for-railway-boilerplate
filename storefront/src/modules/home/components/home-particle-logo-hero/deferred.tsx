"use client"

import dynamic from "next/dynamic"
import NextImage from "next/image"
import { useEffect, useState } from "react"
import type { ComponentProps } from "react"

import type HomeParticleLogoHeroT from "./index"

type Props = ComponentProps<typeof HomeParticleLogoHeroT>

const FALLBACK_SRC = "/branding/sc-prints-logo-white.png"

const StaticHero = ({
  presentation,
  bgClassName,
}: {
  presentation: Props["presentation"]
  bgClassName?: string
}) => {
  if (presentation === "fullscreen") {
    return (
      <div
        aria-label="SC Prints"
        className={`flex min-h-screen flex-col items-center justify-center text-white ${
          bgClassName ?? "bg-ui-fg-base"
        }`}
      >
        <NextImage
          src={FALLBACK_SRC}
          alt="SC Prints"
          width={320}
          height={120}
          priority
          className="h-auto w-full max-w-xs object-contain opacity-90"
        />
      </div>
    )
  }
  return (
    <section
      aria-label="SC Prints"
      className={`relative flex min-h-[min(72vh,680px)] flex-col text-white ${
        bgClassName ?? "bg-black"
      }`}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
        <NextImage
          src={FALLBACK_SRC}
          alt="SC Prints"
          width={320}
          height={120}
          priority
          className="h-auto w-full max-w-xs object-contain opacity-90"
        />
      </div>
    </section>
  )
}

const ParticleHero = dynamic(() => import("./index"), {
  ssr: false,
  loading: () => null,
})

// Wraps the heavy canvas particle hero so the homepage can render a static
// wordmark immediately (becomes the LCP element) and only mount the canvas
// after the page is interactive. Keeps the JS chunk out of the initial
// bundle entirely — the audit's `chunks/16` (~30s of CPU) was the particle
// physics shipping on first paint.
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
      <StaticHero
        presentation={props.presentation}
        bgClassName={props.bgClassName}
      />
    )
  }

  return <ParticleHero {...props} />
}
