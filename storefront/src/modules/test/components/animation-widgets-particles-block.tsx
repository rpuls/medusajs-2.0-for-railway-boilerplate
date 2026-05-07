"use client"

import Particles, { initParticlesEngine } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"

// `@tsparticles/engine` is installed transitively but not declared as a direct
// dep, so TS can't resolve a top-level import. Reuse its core options shape
// loosely — we only use a handful of fields below.
type ISourceOptions = Record<string, unknown>
import { useEffect, useMemo, useState } from "react"

type Props = {
  reducedMotion: boolean
}

export default function AnimationWidgetsParticlesBlock({ reducedMotion }: Props) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (reducedMotion) {
      return
    }
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    })
      .then(() => setReady(true))
      .catch(() => setReady(false))
  }, [reducedMotion])

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: { enable: true, mode: "grab" },
        },
        modes: {
          grab: {
            distance: 140,
            links: { opacity: 0.35 },
          },
        },
      },
      particles: {
        color: { value: "#6b7280" },
        links: {
          enable: true,
          distance: 130,
          color: "#9ca3af",
          opacity: 0.35,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.45,
        },
        number: { value: 48 },
        opacity: { value: { min: 0.15, max: 0.45 } },
        shape: { type: "circle" },
        size: { value: { min: 1, max: 3 } },
      },
      detectRetina: true,
    }),
    []
  )

  if (reducedMotion || !ready) {
    return (
      <div className="relative h-[280px] w-full overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-subtle">
        <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-ui-fg-muted">
          {reducedMotion
            ? "Particle field hidden (prefers reduced motion)."
            : "Loading particles…"}
        </p>
      </div>
    )
  }

  return (
    <div className="relative h-[280px] w-full overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-subtle">
      <Particles id="animation-widgets-tsparticles" className="h-full w-full" options={options} />
      <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-xs text-ui-fg-muted">
        Move the pointer over the canvas — links respond with grab mode.
      </p>
    </div>
  )
}
