"use client"

import { useCallback, useEffect, useState } from "react"

export type ThreeTuning = {
  particleCount: number
  /** World-space radius of cursor influence disk. */
  cursorRadius: number
  /** Dead-zone radius around cursor centre (world units). Particles whose
   * carry target would land closer than this are pushed back to this
   * distance, keeping a clean void under the cursor tip. */
  cursorDisplacement: number
  /** How strongly particles are pulled toward the cursor when inside the
   * disk (0 = no pull, 1 = target snaps to cursor). The inBlend lag then
   * creates the natural comet-tail: particles can't keep up with a fast
   * cursor and trail behind it. Higher = deeper carry, bigger tail. */
  carryStrength: number
  /** @deprecated kept for localStorage backwards-compat, not used in physics. */
  trailDisplacement: number
  /** Cursor speed (world units/sec) at which carry effect saturates.
   * Low values mean even slow movement creates a visible tail. */
  trailSpeedCap: number
  /** Position-blend rate toward target when in cursor disk.
   * alpha = inBlend × dt. At 60fps (dt≈0.016): inBlend=8 → alpha≈0.13
   * → particle chases cursor but lags behind at speed, creating the tail. */
  inBlend: number
  /** Position-blend rate toward home when outside disk.
   * alpha = outBlend × dt. At 60fps: outBlend=0.5 → alpha≈0.008 →
   * particle takes ~2–3 s to drift home = long visible comet tail.
   * Lower = longer tail. */
  outBlend: number
  pointSize: number
  /** Fraction of cursor velocity injected as particle velocity per frame.
   * Creates flow/wake that streams behind the cursor direction. 0 = none. */
  flowStrength: number
  /** Tangential spin force around cursor center as it moves. 0 = none. */
  vortexStrength: number
  /** Exponential velocity decay rate per second.
   * vel *= exp(-velocityDamping * dt). Higher = shorter wake tail. */
  velocityDamping: number
}

export const THREE_TUNING_DEFAULTS: ThreeTuning = {
  particleCount: 140000,
  cursorRadius: 98,
  /** Void zone at cursor tip — keeps a clean hole at the very centre. */
  cursorDisplacement: 20,
  /** Carry strength — how far toward cursor particles are pulled (0–1).
   * 0.75 = targets sit 75% of the way from home to cursor at full falloff. */
  carryStrength: 0.75,
  trailDisplacement: 35,
  trailSpeedCap: 300,
  /** inBlend=8 → alpha≈0.13/frame → particles chase cursor with natural lag. */
  inBlend: 8,
  /** outBlend=0.5 → alpha≈0.008/frame → ~2–3 s visible comet tail. */
  outBlend: 0.5,
  pointSize: 2.5,
  flowStrength: 1.2,
  vortexStrength: 0.06,
  velocityDamping: 1.4,
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
      "Total particles sampled from the wordmark. ~140k is Newmix density. Changing this rebuilds the buffer.",
  },
  {
    key: "cursorRadius",
    label: "Cursor radius",
    min: 30,
    max: 300,
    step: 5,
    format: (v) => `${v.toFixed(0)} px`,
    description:
      "World-space radius of the cursor influence disk. Larger = more particles disturbed per stroke.",
  },
  {
    key: "cursorDisplacement",
    label: "Void radius",
    min: 0,
    max: 60,
    step: 1,
    format: (v) => `${v.toFixed(0)} px`,
    description:
      "Dead-zone radius at cursor tip. Particles pulled closer than this are pushed back to this distance, keeping a clean empty hole under the cursor.",
  },
  {
    key: "carryStrength",
    label: "Carry strength",
    min: 0,
    max: 1,
    step: 0.01,
    format: (v) => v.toFixed(2),
    description:
      "How strongly particles are pulled toward the cursor (0 = no pull, 1 = snap to cursor). The entry-blend lag then creates the comet tail — particles can't keep up with a fast cursor and trail behind it.",
  },
  {
    key: "inBlend",
    label: "Entry blend",
    min: 1,
    max: 60,
    step: 0.5,
    format: (v) => v.toFixed(1),
    description:
      "How fast particles chase the cursor target each frame. Lower = slower chase = longer in-motion tail. inBlend/60 ≈ fraction moved per frame at 60fps.",
  },
  {
    key: "outBlend",
    label: "Return blend",
    min: 0.1,
    max: 10,
    step: 0.1,
    format: (v) => v.toFixed(1),
    description:
      "How fast particles drift back to home after cursor leaves. Lower = longer visible tail. 0.5 = ~2–3s tail. 1.8 = ~1s. 5 = ~0.3s.",
  },
  {
    key: "flowStrength",
    label: "Flow strength",
    min: 0,
    max: 5,
    step: 0.05,
    format: (v) => v.toFixed(2),
    description:
      "How much cursor velocity is injected into nearby particles. Creates a wake that streams in the cursor's direction of travel.",
  },
  {
    key: "vortexStrength",
    label: "Vortex swirl",
    min: 0,
    max: 0.3,
    step: 0.005,
    format: (v) => v.toFixed(3),
    description:
      "Tangential spin force around the cursor. Creates a rolling vortex swirl as the cursor passes.",
  },
  {
    key: "velocityDamping",
    label: "Wake decay",
    min: 0.1,
    max: 8,
    step: 0.1,
    format: (v) => v.toFixed(1),
    description:
      "How fast the wake velocity fades. Higher = shorter-lived trail. 1.4 ≈ 0.7s half-life. 0.5 ≈ 1.4s half-life.",
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

const LS_KEY = "particle-threejs-tuning-v4"

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
                  <span className="font-mono text-white/50">{formatted}</span>
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
