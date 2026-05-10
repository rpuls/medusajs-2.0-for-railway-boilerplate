"use client"

import { useCallback, useEffect, useState } from "react"

export type ThreeTuning = {
  particleCount: number
  /** World-space radius of cursor influence disk. */
  cursorRadius: number
  /** Max radial displacement at cursor centre (world units).
   * Pushes each particle's HOME outward from the cursor, creating the
   * soft void. Combined with trailDisplacement for rear particles. */
  cursorDisplacement: number
  /** Max backward trail displacement at cursor centre (world units).
   * Applied in the direction OPPOSITE to cursor motion. Particles behind
   * the cursor get this ADDED to their radial offset → strong rearward
   * displacement = comet-tail wake. Particles ahead get opposing offsets
   * → barely disturbed until the cursor reaches them.
   * Scales linearly with cursor speed up to trailSpeedCap. */
  trailDisplacement: number
  /** Cursor speed (world units/sec) at which trail displacement saturates.
   * Stirring slowly → gentle trail. Sweeping fast → full trail. */
  trailSpeedCap: number
  /** Position-blend rate toward target when in cursor disk.
   * alpha = inBlend × dt. At 60fps (dt≈0.016): inBlend=12 → alpha≈0.2
   * → particle reaches ~67% of target in 5 frames. Higher = snappier. */
  inBlend: number
  /** Position-blend rate toward home when outside disk.
   * alpha = outBlend × dt. At 60fps: outBlend=1.8 → alpha≈0.03 →
   * particle decays to 40% of displacement after ~0.5s = visible trail.
   * Lower = longer tail. */
  outBlend: number
  pointSize: number
}

export const THREE_TUNING_DEFAULTS: ThreeTuning = {
  particleCount: 140000,
  cursorRadius: 90,
  /** Radial push — creates a clean void under cursor.
   * ~20 world-units at cursor centre. */
  cursorDisplacement: 20,
  /** Backward trail — particles behind cursor get 20+35=55 units of
   * rearward displacement at cursor centre and full speed. Clearly
   * visible outside letter strokes (~10 units wide). */
  trailDisplacement: 35,
  /** Trail saturates at 300 u/s. Slow stir = subtle; fast sweep = full. */
  trailSpeedCap: 300,
  /** inBlend=12 → alpha≈0.2/frame → reaches target in ~5 frames (0.08s). */
  inBlend: 12,
  /** outBlend=1.8 → alpha≈0.03/frame → trail visible for ~1–1.5 s. */
  outBlend: 1.8,
  pointSize: 2.5,
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
    label: "Radial push",
    min: 0,
    max: 80,
    step: 1,
    format: (v) => `${v.toFixed(0)} px`,
    description:
      "Max outward displacement at cursor centre. Creates the soft void. 15-25 = subtle. 40+ = obvious hole.",
  },
  {
    key: "trailDisplacement",
    label: "Trail depth",
    min: 0,
    max: 120,
    step: 1,
    format: (v) => `${v.toFixed(0)} px`,
    description:
      "Max backward displacement (opposite cursor motion) at full speed. Particles behind cursor get this + radial → the comet tail. 0 = symmetric void only.",
  },
  {
    key: "trailSpeedCap",
    label: "Trail speed cap",
    min: 50,
    max: 1000,
    step: 10,
    format: (v) => `${v.toFixed(0)} u/s`,
    description:
      "Cursor speed at which trail displacement saturates. Lower = trail appears even at slow motion. Higher = only fast sweeps create a trail.",
  },
  {
    key: "inBlend",
    label: "Entry blend",
    min: 1,
    max: 60,
    step: 0.5,
    format: (v) => v.toFixed(1),
    description:
      "How fast particles blend toward their target when the cursor is over them. Higher = snappier displacement. inBlend/60 = fraction moved per frame at 60fps.",
  },
  {
    key: "outBlend",
    label: "Return blend",
    min: 0.2,
    max: 10,
    step: 0.1,
    format: (v) => v.toFixed(1),
    description:
      "How fast particles drift back to home when cursor has passed. Lower = longer visible trail. 1.8 = ~1s trail. 5 = ~0.3s.",
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

const LS_KEY = "particle-threejs-tuning-v2"

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
