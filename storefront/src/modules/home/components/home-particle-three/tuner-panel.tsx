"use client"

import { useCallback, useEffect, useState } from "react"

export type ThreeTuning = {
  particleCount: number
  cursorRadius: number
  cursorForce: number
  mouseVelocityScale: number
  springStiffness: number
  friction: number
  pointSize: number
  /** Wake-velocity contribution: how much of cursor velocity gets baked
   * into in-disk particles each frame. 0 = no wake, just radial; 1 =
   * particle picks up nearly full mouse velocity. */
  wakeStrength: number
  /** Tangential side-swirl force. Particles in the cursor disk receive a
   * force PERPENDICULAR to their direction from cursor center, with the
   * sign flipped based on which side of the cursor's motion line they're
   * on. This is what produces the contained orbital curl Newmix shows
   * (rather than straight-line flame trails from pure velocity transfer). */
  sideSwirlForce: number
  /** Wake-history playback duration (ms). When a particle exits the cursor
   * disk and wins the trailingProbability roll, it enters wake state for
   * this many ms. While in wake state, position is driven by the cursor's
   * HISTORICAL position (replayed at wakePace), not by spring/cursor forces.
   * 0 = disabled. 800-1500ms = visible flowing wake behind cursor path. */
  trailFollowMs: number
  /** Probability (0..1) that a particle entering wake-eligible state (was in
   * cursor disk last frame, not now) actually enters wake state. Lower =
   * sparser wake (only some particles trail), more keep their normal
   * spring-back. */
  trailingProbability: number
  /** Wake replay pace. 0 = particle locks to cursor's release position
   * (no path replay). 0.5 = particle traces history at half-speed of real
   * time, falling visibly behind. 1 = particle stays at current cursor (no
   * trail). 0.6-0.8 reads as Newmix-style flowing arc. */
  wakePace: number
  /** Lateral spread of wake offsets (world units). Each particle's wake
   * preserves its release-time offset from cursor PLUS a random lateral
   * offset up to ±this value. Higher = wider, less rope-like wake. */
  wakeLateralSpread: number
  /** Bilateral lateral push — particles in the cursor disk get pushed
   * PERPENDICULAR to the cursor's motion direction (away from the motion
   * line), with sign by side. Creates the two-lobe wake split that
   * Newmix shows: particles flow around the cursor on both sides
   * instead of just being repelled radially. */
  lateralPushForce: number
  /** Karman vortex pair: two counter-rotating vortex centers BEHIND the
   * cursor (one on the left, one on the right). Particles within
   * vortexRadius of either center receive a tangential force around it.
   * This is the "two spinning lobes" Newmix shows in slow-motion. */
  vortexStrength: number
  /** Distance behind cursor (world units) where the Karman vortex pair
   * sits, measured along the negative motion direction. */
  vortexBehindOffset: number
  /** Lateral separation between the two vortex centers (world units).
   * They sit at ±this/2 offset perpendicular to motion. */
  vortexLateralOffset: number
  /** Radius of each vortex's influence zone. */
  vortexRadius: number
  /** Cursor speed at which vortex strength halves. Makes vortices clear
   * at slow/moderate speed, fade smoothly to streaks at high speed —
   * exactly the "disappears as cursor speeds up" Newmix behavior. */
  vortexSpeedHalfLife: number
}

export const THREE_TUNING_DEFAULTS: ThreeTuning = {
  particleCount: 140000,
  cursorRadius: 90,
  cursorForce: 350,
  mouseVelocityScale: 0.5,
  springStiffness: 5,
  friction: 3.5,
  pointSize: 2.5,
  /** Directional velocity inheritance — gentle so it doesn't fling particles. */
  wakeStrength: 0.15,
  /** Side-swirl at low magnitude — provides contained orbital curl. */
  sideSwirlForce: 4,
  trailFollowMs: 1200,
  trailingProbability: 0.55,
  wakePace: 0.65,
  /** Wider bilateral spread so the two-lobe wake is clearly visible. */
  wakeLateralSpread: 20,
  lateralPushForce: 5,
  /** Vortex was never active before (ordering bug). Now active — start
   * at a clearly visible strength so the two-lobe effect is immediately
   * apparent on first load. */
  vortexStrength: 22,
  vortexBehindOffset: 30,
  vortexLateralOffset: 55,
  vortexRadius: 60,
  /** Fade threshold: vortices full-strength below ~400 u/s, halved at 500. */
  vortexSpeedHalfLife: 500,
}

type SliderDef = {
  key: keyof ThreeTuning
  label: string
  min: number
  max: number
  step: number
  format?: (v: number) => string
  description?: string
}

const SLIDERS: SliderDef[] = [
  {
    key: "particleCount",
    label: "Particle count",
    min: 5000,
    max: 300000,
    step: 1000,
    format: (v) => `${(v / 1000).toFixed(0)}k`,
    description:
      "Total particles sampled from the wordmark. Newmix uses ~140k. Changing rebuilds the buffer geometry.",
  },
  {
    key: "cursorRadius",
    label: "Cursor radius",
    min: 30,
    max: 400,
    step: 5,
    format: (v) => `${v.toFixed(0)} px`,
    description: "World-space radius of the cursor's influence disk.",
  },
  {
    key: "cursorForce",
    label: "Radial push",
    min: 0,
    max: 4000,
    step: 50,
    description:
      "Outward radial force from cursor center. Creates the soft void under the cursor.",
  },
  {
    key: "wakeStrength",
    label: "Wake strength",
    min: 0,
    max: 2,
    step: 0.05,
    format: (v) => v.toFixed(2),
    description:
      "How much of the cursor's velocity is transferred to in-disk particles. The directional wake force (linear).",
  },
  {
    key: "sideSwirlForce",
    label: "Side swirl",
    min: 0,
    max: 20,
    step: 0.1,
    format: (v) => v.toFixed(1),
    description:
      "Tangential force around cursor — particles on opposite sides of motion vector swirl in opposite directions. THE force that produces the Newmix-style contained curl. 0 = no swirl. 5-10 = strong orbit.",
  },
  {
    key: "trailFollowMs",
    label: "Trail duration",
    min: 0,
    max: 3000,
    step: 50,
    format: (v) => (v <= 0 ? "off" : `${(v / 1000).toFixed(2)}s`),
    description:
      "How long particles stay in wake-history playback after exiting the cursor disk. While in wake state, particles trace the cursor's HISTORICAL path (rather than springing home). 0 = disabled.",
  },
  {
    key: "trailingProbability",
    label: "Trailing probability",
    min: 0,
    max: 1,
    step: 0.02,
    format: (v) => `${Math.round(v * 100)}%`,
    description:
      "Fraction of particles exiting the cursor disk that enter wake state. Lower = sparser wake (only some particles trail). Newmix-ish: 0.4-0.7.",
  },
  {
    key: "wakePace",
    label: "Wake pace",
    min: 0,
    max: 1.5,
    step: 0.02,
    format: (v) => v.toFixed(2),
    description:
      "How fast wake particles replay the cursor's path. 0 = particle locks to release position. 0.7 = traces path at 70% real-time speed (flowing behind cursor). 1 = stays at current cursor (no trail).",
  },
  {
    key: "wakeLateralSpread",
    label: "Wake lateral spread",
    min: 0,
    max: 50,
    step: 1,
    format: (v) => `${v.toFixed(0)} px`,
    description:
      "How wide the wake spreads sideways. 0 = particles trace cursor exactly (rope). 8-20 = soft band. >30 = diffuse cloud.",
  },
  {
    key: "lateralPushForce",
    label: "Lateral push",
    min: 0,
    max: 30,
    step: 0.2,
    format: (v) => v.toFixed(1),
    description:
      "Sideways push perpendicular to cursor's motion. Particles get pushed AWAY from the motion line, signed by side. Creates the bilateral two-lobe wake split.",
  },
  {
    key: "vortexStrength",
    label: "Vortex strength",
    min: 0,
    max: 40,
    step: 0.5,
    format: (v) => v.toFixed(1),
    description:
      "Strength of the Karman counter-rotating vortex pair behind the cursor. THE force that produces the visible two-lobe spiral Newmix shows in slow motion. 0 = off. 10-20 = clear vortices.",
  },
  {
    key: "vortexBehindOffset",
    label: "Vortex behind offset",
    min: 0,
    max: 200,
    step: 2,
    format: (v) => `${v.toFixed(0)} px`,
    description:
      "Distance behind cursor where the vortex pair sits (along negative motion direction). Larger = trail forms further back.",
  },
  {
    key: "vortexLateralOffset",
    label: "Vortex separation",
    min: 0,
    max: 200,
    step: 2,
    format: (v) => `${v.toFixed(0)} px`,
    description:
      "Lateral spacing between the two vortex centers. Larger = wider bilateral wake.",
  },
  {
    key: "vortexRadius",
    label: "Vortex radius",
    min: 10,
    max: 150,
    step: 2,
    format: (v) => `${v.toFixed(0)} px`,
    description:
      "Radius of each vortex's influence zone. Particles outside don't feel the swirl.",
  },
  {
    key: "vortexSpeedHalfLife",
    label: "Vortex speed fade",
    min: 100,
    max: 3000,
    step: 50,
    format: (v) => `${v.toFixed(0)} u/s`,
    description:
      "Cursor speed (world-units/sec) at which vortex strength halves. Lower = vortices fade faster as cursor speeds up. Newmix-ish: 400-800.",
  },
  {
    key: "mouseVelocityScale",
    label: "Mouse vel scale",
    min: 0,
    max: 2,
    step: 0.05,
    format: (v) => v.toFixed(2),
    description:
      "Multiplier on raw mouse velocity before clamping. Higher = larger wake from same cursor speed.",
  },
  {
    key: "springStiffness",
    label: "Spring stiffness",
    min: 0,
    max: 10,
    step: 0.1,
    format: (v) => v.toFixed(1),
    description:
      "Force pulling each particle back to its home position. Higher = faster recovery.",
  },
  {
    key: "friction",
    label: "Friction",
    min: 0,
    max: 10,
    step: 0.1,
    format: (v) => v.toFixed(1),
    description:
      "Linear damping on particle velocity. Higher = wake dies faster.",
  },
  {
    key: "pointSize",
    label: "Point size",
    min: 0.5,
    max: 8,
    step: 0.1,
    format: (v) => v.toFixed(1),
    description: "Drawn size of each particle.",
  },
]

const LS_KEY = "particle-threejs-tuning-v1"

export function loadStoredTuning(): ThreeTuning {
  if (typeof window === "undefined") return THREE_TUNING_DEFAULTS
  try {
    const raw = window.localStorage.getItem(LS_KEY)
    if (raw == null) return THREE_TUNING_DEFAULTS
    const parsed = JSON.parse(raw) as Partial<ThreeTuning>
    return { ...THREE_TUNING_DEFAULTS, ...parsed }
  } catch {
    return THREE_TUNING_DEFAULTS
  }
}

function saveStoredTuning(t: ThreeTuning) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(t))
  } catch {
    /* quota / private mode — ignore */
  }
}

type Props = {
  tuning: ThreeTuning
  onChange: (next: ThreeTuning) => void
}

export default function ThreeTunerPanel({ tuning, onChange }: Props) {
  const [open, setOpen] = useState(true)

  /** Persist tuning to localStorage whenever it changes. */
  useEffect(() => {
    saveStoredTuning(tuning)
  }, [tuning])

  const update = useCallback(
    (key: keyof ThreeTuning, value: number) => {
      onChange({ ...tuning, [key]: value })
    },
    [onChange, tuning]
  )

  const reset = useCallback(() => {
    onChange({ ...THREE_TUNING_DEFAULTS })
    saveStoredTuning(THREE_TUNING_DEFAULTS)
  }, [onChange])

  return (
    <div className="pointer-events-auto fixed right-4 top-20 z-50 w-72 rounded-lg border border-white/10 bg-black/85 p-3 text-xs text-white/90 backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold">Three.js tuner</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="rounded border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wide hover:border-white/50 hover:bg-white/10"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wide hover:border-white/50 hover:bg-white/10"
          >
            {open ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      {open ? (
        <div className="flex flex-col gap-2.5">
          {SLIDERS.map((def) => {
            const v = tuning[def.key]
            const formatted =
              def.format != null
                ? def.format(v)
                : v % 1 === 0
                  ? String(v)
                  : v.toFixed(2)
            return (
              <label key={def.key} className="block">
                <div className="mb-0.5 flex items-baseline justify-between gap-2">
                  <span className="text-white/80">{def.label}</span>
                  <span className="font-mono text-white/50">
                    {formatted}
                  </span>
                </div>
                <input
                  type="range"
                  min={def.min}
                  max={def.max}
                  step={def.step}
                  value={v}
                  onChange={(e) =>
                    update(def.key, parseFloat(e.target.value))
                  }
                  className="w-full accent-white"
                />
                {def.description != null ? (
                  <p className="mt-0.5 text-[10px] leading-tight text-white/40">
                    {def.description}
                  </p>
                ) : null}
              </label>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
