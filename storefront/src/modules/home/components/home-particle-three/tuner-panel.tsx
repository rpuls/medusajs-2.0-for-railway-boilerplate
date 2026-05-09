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
}

export const THREE_TUNING_DEFAULTS: ThreeTuning = {
  particleCount: 140000,
  cursorRadius: 150,
  cursorForce: 1200,
  mouseVelocityScale: 0.6,
  springStiffness: 2.5,
  friction: 1.5,
  pointSize: 2.5,
  wakeStrength: 0.6,
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
      "How much of the cursor's velocity is transferred to in-disk particles. The directional wake force.",
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
