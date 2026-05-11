"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  CURATED_PRESETS,
  appendUserPreset,
  applyPreset,
  deleteUserPreset,
  loadUserPresets,
  type Preset,
} from "./presets"

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
  /** @deprecated retained for back-compat in stored payloads. */
  trailDisplacement: number
  /** @deprecated retained for back-compat in stored payloads. */
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
  /** Fraction of particles that enter the wake-playback state when they
   * exit the cursor disk. The rest simply lerp home. 0 = no trail. */
  trailingProbability: number
  /** How long (ms) each released particle traces the cursor path before
   * its wake ends and it springs home. */
  trailFollowMs: number
  /** Playback speed of the cursor-history playhead. < 1 = particle lags
   * behind cursor (longer trail), > 1 = catches up. */
  wakePace: number
  /** ± fraction of per-particle pace jitter — spreads particles along the
   * path so the trail reads as a band rather than a single bead. */
  wakePaceJitter: number
  /** Max per-particle backward time-offset (ms). Biased toward the front
   * of the wake so most particles hug the cursor with a thinning tail. */
  wakeTimeOffsetMs: number
  /** Signed along-tangent offset amplitude (world units). Spreads
   * particles along the cursor heading axis (lengthwise). */
  wakeAlongStretchBmp: number
  /** Perpendicular band offset amplitude (world units). Lateral spread
   * forming the ribbon's width. */
  wakeBandSpreadBmp: number
  /** Per-particle release stagger (ms). Particles hold their release
   * position until their stagger expires — staggers playback start. */
  wakeReleaseStaggerMs: number
  /** When true, the canvas overlays a cursor-history polyline and tints
   * particles in the trailing-playback state magenta. Diagnostic only. */
  debugOverlay: boolean
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
  trailingProbability: 0.65,
  trailFollowMs: 2500,
  wakePace: 0.52,
  wakePaceJitter: 0.4,
  wakeTimeOffsetMs: 1400,
  wakeAlongStretchBmp: 22,
  wakeBandSpreadBmp: 14,
  wakeReleaseStaggerMs: 350,
  debugOverlay: false,
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
      "How strongly particles are pulled toward the cursor (0 = no pull, 1 = snap to cursor). Combined with entry-blend, this creates the comet head.",
  },
  {
    key: "inBlend",
    label: "Entry blend",
    min: 1,
    max: 60,
    step: 0.5,
    format: (v) => v.toFixed(1),
    description:
      "How fast particles chase the cursor target each frame. Lower = slower chase = longer in-motion lag.",
  },
  {
    key: "outBlend",
    label: "Return blend",
    min: 0.1,
    max: 10,
    step: 0.1,
    format: (v) => v.toFixed(1),
    description:
      "How fast non-trailing particles drift home after cursor leaves. Lower = slower settle.",
  },
  {
    key: "trailingProbability",
    label: "Trail probability",
    min: 0,
    max: 1,
    step: 0.01,
    format: (v) => v.toFixed(2),
    description:
      "Fraction of exiting particles that enter the wake-playback state. 0 = no trail. ~0.65 reads as a dense ribbon without dragging every particle.",
  },
  {
    key: "trailFollowMs",
    label: "Trail follow",
    min: 200,
    max: 6000,
    step: 50,
    format: (v) => `${(v / 1000).toFixed(2)} s`,
    description:
      "How long each released particle traces the cursor path before its wake ends and it springs home.",
  },
  {
    key: "wakePace",
    label: "Wake pace",
    min: 0.1,
    max: 1.5,
    step: 0.01,
    format: (v) => v.toFixed(2),
    description:
      "Playback speed of the cursor-history playhead. <1 = particle lags behind cursor (longer visible trail); >1 = catches up.",
  },
  {
    key: "wakePaceJitter",
    label: "Pace jitter",
    min: 0,
    max: 0.9,
    step: 0.01,
    format: (v) => v.toFixed(2),
    description:
      "± fraction of per-particle pace variance — spreads particles along the path so the trail reads as a band rather than a bead.",
  },
  {
    key: "wakeTimeOffsetMs",
    label: "Time offset",
    min: 0,
    max: 3000,
    step: 50,
    format: (v) => `${(v / 1000).toFixed(2)} s`,
    description:
      "Max per-particle backward time-offset. Biased toward the front of the wake, so most particles hug the cursor with a thinning tail.",
  },
  {
    key: "wakeAlongStretchBmp",
    label: "Along-stretch",
    min: 0,
    max: 60,
    step: 1,
    format: (v) => `${v.toFixed(0)} px`,
    description:
      "Signed offset along the cursor heading. Spreads particles lengthwise so the trail reads as a long ribbon, not a tight clump.",
  },
  {
    key: "wakeBandSpreadBmp",
    label: "Band spread",
    min: 0,
    max: 40,
    step: 1,
    format: (v) => `${v.toFixed(0)} px`,
    description:
      "Perpendicular spread from the path. Lateral width of the ribbon; tapers toward the tail.",
  },
  {
    key: "wakeReleaseStaggerMs",
    label: "Release stagger",
    min: 0,
    max: 1500,
    step: 25,
    format: (v) => `${v.toFixed(0)} ms`,
    description:
      "Particle-by-particle delay before playback starts after release. Staggered staggers produce the comet-tail growth from the cursor outward.",
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

const LS_KEY = "particle-threejs-tuning-v6"

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
  const [userPresets, setUserPresets] = useState<Preset[]>([])
  const [selectedPresetId, setSelectedPresetId] = useState<string>("")

  /** Load user presets on mount. */
  useEffect(() => {
    setUserPresets(loadUserPresets())
  }, [])

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
    setSelectedPresetId("")
  }, [onChange])

  const allPresets = useMemo<Preset[]>(
    () => [...CURATED_PRESETS, ...userPresets],
    [userPresets]
  )

  const handleSelectPreset = useCallback(
    (id: string) => {
      setSelectedPresetId(id)
      if (id === "") return
      const p = allPresets.find((x) => x.id === id)
      if (p == null) return
      onChange({ ...applyPreset(p), debugOverlay: tuning.debugOverlay })
    },
    [allPresets, onChange, tuning.debugOverlay]
  )

  const handleSaveCurrent = useCallback(() => {
    const defaultName = `Preset ${new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`
    const name = window.prompt(
      "Name this preset (saved to localStorage):",
      defaultName
    )
    if (name == null) return
    const next = appendUserPreset(userPresets, name, tuning)
    setUserPresets(next)
    const justSaved = next[next.length - 1]
    if (justSaved != null) setSelectedPresetId(justSaved.id)
  }, [tuning, userPresets])

  const handleDeleteSelected = useCallback(() => {
    if (!selectedPresetId.startsWith("user:")) return
    if (!window.confirm("Delete this saved preset?")) return
    const next = deleteUserPreset(userPresets, selectedPresetId)
    setUserPresets(next)
    setSelectedPresetId("")
  }, [selectedPresetId, userPresets])

  const selectedPreset = allPresets.find((p) => p.id === selectedPresetId)
  const canDelete = selectedPresetId.startsWith("user:")

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
        <div className="flex max-h-[80vh] flex-col gap-2.5 overflow-y-auto pr-1">
          <div className="rounded border border-white/15 bg-white/5 p-2">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-[11px] font-semibold text-white/90">
                Preset history
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={handleSaveCurrent}
                  className="rounded border border-white/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wide hover:border-white/50 hover:bg-white/10"
                  title="Save current sliders as a new preset"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  disabled={!canDelete}
                  className="rounded border border-white/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wide hover:border-white/50 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Delete the selected user-saved preset"
                >
                  Del
                </button>
              </div>
            </div>
            <select
              value={selectedPresetId}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="w-full rounded border border-white/15 bg-black/60 px-1.5 py-1 text-[11px] text-white/90 outline-none focus:border-white/40"
            >
              <option value="">— pick a preset —</option>
              <optgroup label="Curated (git history)">
                {CURATED_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
              {userPresets.length > 0 ? (
                <optgroup label="Saved">
                  {userPresets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.savedAt != null
                        ? `  · ${new Date(p.savedAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : ""}
                    </option>
                  ))}
                </optgroup>
              ) : null}
            </select>
            {selectedPreset?.note != null ? (
              <p className="mt-1 text-[10px] leading-tight text-white/50">
                {selectedPreset.note}
              </p>
            ) : null}
          </div>

          <label className="flex items-center justify-between rounded border border-white/15 bg-white/5 px-2 py-1.5">
            <span className="text-[11px] font-semibold text-white/90">
              Debug overlay
            </span>
            <input
              type="checkbox"
              checked={tuning.debugOverlay}
              onChange={(e) =>
                onChange({ ...tuning, debugOverlay: e.target.checked })
              }
              className="h-3 w-3 accent-fuchsia-400"
            />
          </label>

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
