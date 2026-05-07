"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import HomeParticleLogoHero from "@modules/home/components/home-particle-logo-hero"
import type { NewmixLiveTuning } from "@modules/home/components/home-particle-logo-hero/newmix-live-tuning"
import { mergeNewmixLiveTuning } from "@modules/home/components/home-particle-logo-hero/newmix-live-tuning"

import { V3_TUNING } from "./v3-splash"

const LS_KEY = "particle-flow-tuning-v1"
const LS_DISABLED_KEY = "particle-flow-disabled-groups-v1"
const LS_DISABLED_SLIDERS_KEY = "particle-flow-disabled-sliders-v1"
const LS_RENDER_KEY = "particle-flow-render-v1"
const LS_GRADIENT_KEY = "particle-flow-gradient-v1"

/** Render-only knobs that don't fit in the NewmixLiveTuning shape (those are
 * physics; these are visuals). Persisted separately so they don't pollute the
 * tuning payload. */
type RenderTuning = {
  particleDrawSize: number
  particleCount: number
}
const RENDER_DEFAULTS: RenderTuning = {
  particleDrawSize: 1,
  particleCount: 55000,
}

/** Colour palettes — 10 hand-picked gradients with varying stop counts.
 * `angleDeg` follows CSS convention (0° = up, increasing clockwise). The
 * panel renders each as a circular swatch button; clicking one updates the
 * `wordmarkGradient` prop on the hero. */
type GradientPreset = {
  id: string
  label: string
  angleDeg: number
  stops: string[]
}
const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: "rainbow",
    label: "Rainbow",
    angleDeg: 78,
    stops: [
      "#ff2e63",
      "#ff6b35",
      "#ffc145",
      "#c1ff45",
      "#3dcfc2",
      "#45a4ff",
      "#6c5cff",
      "#b556ff",
      "#ff56e0",
    ],
  },
  {
    id: "sunset",
    label: "Sunset",
    angleDeg: 90,
    stops: ["#2c1338", "#7c2d3c", "#ff6b35", "#ffc145", "#fff3a0"],
  },
  {
    id: "ocean",
    label: "Ocean",
    angleDeg: 90,
    stops: ["#001f3f", "#0074d9", "#39cccc", "#7fdbff"],
  },
  {
    id: "forest",
    label: "Forest",
    angleDeg: 90,
    stops: ["#0b2e13", "#2e7d32", "#a8d36a", "#f4ff8a"],
  },
  {
    id: "neon",
    label: "Neon",
    angleDeg: 78,
    stops: ["#ff00ff", "#00ffff", "#ffff00"],
  },
  {
    id: "pastel",
    label: "Pastel",
    angleDeg: 78,
    stops: ["#ffd1dc", "#ffe5b4", "#c1f0c1", "#b3e0ff", "#d4b3ff"],
  },
  {
    id: "fire",
    label: "Fire",
    angleDeg: 90,
    stops: ["#1a0202", "#6b1f1f", "#ff6b1f", "#ffaf45", "#fff7c0"],
  },
  {
    id: "aurora",
    label: "Aurora",
    angleDeg: 78,
    stops: ["#0b1c2c", "#1f7a8c", "#3dcfc2", "#a8e6c1", "#fff0a5", "#b556ff"],
  },
  {
    id: "mono",
    label: "Mono",
    angleDeg: 90,
    stops: ["#ffffff", "#a8a8b8", "#52526a", "#1a1a2e"],
  },
  {
    id: "brand",
    label: "Brand",
    angleDeg: 78,
    stops: ["#3dcfc2", "#a8e8e0", "#ffffff", "#ff2e63"],
  },
  {
    id: "spectrum",
    label: "Spectrum",
    angleDeg: 78,
    stops: [
      "#ff004c", "#ff5300", "#ffa600", "#ffe800", "#c2ff00",
      "#5dff00", "#00ff7a", "#00ffd1", "#00d4ff", "#0077ff",
      "#3a00ff", "#8c00ff", "#d300ff", "#ff00bf", "#ff0066",
    ],
  },
  {
    id: "aurora",
    label: "Aurora",
    angleDeg: 90,
    stops: [
      "#0a0e2e", "#13325c", "#1a6b8a", "#21a796", "#3edc8b",
      "#86f29c", "#c9f8b0", "#fff7c2", "#ffd166", "#f29259",
      "#d9466b", "#9a3d8a", "#5a2c95", "#2a1d6e",
    ],
  },
  {
    id: "neon",
    label: "Neon",
    angleDeg: 78,
    stops: [
      "#fe00fe", "#ff00b3", "#ff0080", "#ff3366", "#ff5e3a",
      "#ff9500", "#ffd400", "#aaff00", "#00ff85", "#00ffd5",
      "#00d4ff", "#00a3ff", "#3a6dff", "#7c4dff", "#c800ff",
    ],
  },
  {
    id: "candy",
    label: "Candy",
    angleDeg: 78,
    stops: [
      "#ffd5e5", "#ffb3d1", "#ff8fc8", "#ff6fb1", "#ff5c8a",
      "#ff7e6b", "#ffae5a", "#ffd86b", "#fff39a", "#d8f59a",
      "#a3e8c3", "#7ad7e0", "#a3b8f0", "#cfa8f0",
    ],
  },
  {
    id: "ember",
    label: "Ember",
    angleDeg: 90,
    stops: [
      "#0a0202", "#1f0606", "#3b0d0d", "#621414", "#8f1d1d",
      "#bf2b22", "#e0492a", "#f47237", "#ffa14a", "#ffce6e",
      "#fff0a5", "#fffadc", "#ffffff",
    ],
  },
]
const DEFAULT_GRADIENT_ID = "rainbow"

/** Sliders are organised into four small groups so the panel stays scannable.
 * Each group has a short blurb explaining the role of the sliders inside,
 * plus an enable/disable toggle that overrides every slider in the group with
 * an "off" value while still letting you preview your saved settings. */
type SliderSpec = {
  key: keyof NewmixLiveTuning
  label: string
  description: string
  min: number
  max: number
  step: number
  format?: (v: number) => string
  /** When defined, this slider supports a per-slider on/off toggle. The toggle
   * overrides the user's value with `disabledValue` when off. */
  disabledValue?: number
}

/** Render-only sliders use a separate type since they're not physics keys. */
type RenderSliderSpec = {
  key: keyof RenderTuning
  label: string
  description: string
  min: number
  max: number
  step: number
  format?: (v: number) => string
}

type Group = {
  id: string
  label: string
  blurb: string
  /** Values to use for each slider when the group's toggle is off. */
  offValues: Partial<NewmixLiveTuning>
  sliders: SliderSpec[]
  /** Optional render-only sliders for this group (not part of physics tuning). */
  renderSliders?: RenderSliderSpec[]
  /** Render-key off-values to apply when the group's toggle is off. */
  renderOffValues?: Partial<RenderTuning>
}

const GROUPS: Group[] = [
  {
    id: "cursor",
    label: "Cursor",
    blurb:
      "How the moving cursor disturbs the particle field — the spoon-through-coffee shape. Turning the group off reduces the cursor radius to zero so the field is undisturbed.",
    offValues: {
      radius: 0,
      sideSwirlForce: 0,
      frontPush: 0,
      backInward: 0,
      inDiskCarryFactor: 0,
    },
    sliders: [
      {
        key: "radius",
        label: "Radius",
        description:
          "Size of the cursor's influence disk. Larger = bigger area of effect.",
        min: 20,
        max: 200,
        step: 1,
        disabledValue: 0,
      },
      {
        key: "motionGateSpeed",
        label: "Motion gate",
        description:
          "Cursor speed below which forces fade to zero. Stops particles wobbling under sub-pixel mouse drift.",
        min: 0,
        max: 8,
        step: 0.1,
        disabledValue: 999,
      },
      {
        key: "falloffPower",
        label: "Falloff",
        description:
          "How sharply force drops off from cursor centre to disk edge. Higher = punchier centre, softer rim.",
        min: 0.5,
        max: 4,
        step: 0.05,
        disabledValue: 0,
      },
      {
        key: "sideSwirlForce",
        label: "Side swirl",
        description:
          "Counter-rotating tangential push on each side of motion — produces the parted-curtain shape.",
        min: 0,
        max: 30,
        step: 0.5,
        disabledValue: 0,
      },
      {
        key: "frontPush",
        label: "Front push",
        description:
          "Outward shove at the cursor's leading edge — how strongly it parts the field.",
        min: 0,
        max: 16,
        step: 0.1,
        disabledValue: 0,
      },
      {
        key: "backInward",
        label: "Back inward",
        description:
          "Suction behind the cursor — pulls particles into the wake instead of leaving an empty hole.",
        min: 0,
        max: 16,
        step: 0.1,
        disabledValue: 0,
      },
      {
        key: "inDiskCarryFactor",
        label: "In-disk carry",
        description:
          "How much particles inside the disk move with the cursor. Higher = the cursor drags its captured particles along its path.",
        min: 0,
        max: 1,
        step: 0.02,
        disabledValue: 0,
      },
    ],
  },
  {
    id: "wake",
    label: "Wake",
    blurb:
      "The trail of carried-along particles that follow the cursor's recent path. Turning the group off sets trail duration to zero, so disturbed particles spring home immediately.",
    offValues: {
      trailFollowMs: 0,
      wakeBandSpreadBmp: 0,
      wakeAlongStretchBmp: 0,
      wakeAlphaMult: 0,
      exitVelocityBoostBmp: 0,
    },
    sliders: [
      {
        key: "trailFollowMs",
        label: "Trail duration",
        description:
          "How long captured particles trail the cursor before drifting home (ms). Bigger = longer-lived wake.",
        min: 200,
        max: 12000,
        step: 100,
        format: (v) => `${Math.round(v)}ms`,
      },
      {
        key: "wakePace",
        label: "Wake pace",
        description:
          "Speed at which trail particles replay the cursor's recorded path. <1 = particles fall behind, longer visible tail.",
        min: 0.3,
        max: 1,
        step: 0.01,
      },
      {
        key: "wakeBandSpreadBmp",
        label: "Band spread",
        description:
          "Lateral thickness of the trail (px). Higher = wider, more diffuse wake.",
        min: 0,
        max: 60,
        step: 1,
      },
      {
        key: "wakeAlongStretchBmp",
        label: "Along stretch",
        description:
          "Per-particle offset along the trail direction (px). Stretches the wake out instead of clumping at one path point.",
        min: 0,
        max: 60,
        step: 1,
      },
      {
        key: "wakeAlphaMult",
        label: "Wake opacity",
        description:
          "How visible trailing particles are. Lower = more ghostly; lets the wordmark dominate.",
        min: 0,
        max: 1,
        step: 0.02,
      },
      {
        key: "exitVelocityBoostBmp",
        label: "Exit velocity",
        description:
          "Single-frame kick when a particle leaves the cursor disk. Shoots it cleanly into the wake.",
        min: 0,
        max: 30,
        step: 0.5,
      },
    ],
  },
  {
    id: "vortex",
    label: "Vortex",
    blurb:
      "Two virtual counter-rotating curls flanking the cursor's path. Particles entering a vortex zone get LOCKED onto a circular orbit, spin visibly for a configured duration, then release into the wake. Turning the group off skips the capture mechanic entirely.",
    offValues: {
      vortexStrength: 0,
    },
    sliders: [
      {
        key: "vortexStrength",
        label: "Strength",
        description:
          "How strongly each vortex spins particles around its centre. 0 = no vortex pair.",
        min: 0,
        max: 20,
        step: 0.1,
      },
      {
        key: "vortexOffsetBmp",
        label: "Side offset",
        description:
          "Distance from the cursor to each vortex centre (px). Higher = curls flank the cursor wider.",
        min: 0,
        max: 80,
        step: 1,
      },
      {
        key: "vortexLagBmp",
        label: "Along offset",
        description:
          "Behind (-) or ahead of (+) the cursor (px). Negative = the curls trail the cursor in its wake.",
        min: -40,
        max: 40,
        step: 1,
      },
      {
        key: "vortexRadiusBmp",
        label: "Vortex radius",
        description:
          "Each vortex's influence radius (px). Smaller = tighter curls; larger = blends into the surrounding field. Tip: set this equal to Side offset and the two rims meet at the cursor's leading edge.",
        min: 10,
        max: 100,
        step: 1,
      },
      {
        key: "vortexOrbitSpeedDegPerSec",
        label: "Orbit speed",
        description:
          "How fast captured particles spin around the vortex centre (degrees per second). Slower = more visible spinning. 360°/s = 1 rotation/sec.",
        min: 90,
        max: 1440,
        step: 10,
        format: (v) => `${Math.round(v)}°/s`,
      },
      {
        key: "vortexCaptureDurationMs",
        label: "Capture duration",
        description:
          "How long a particle stays locked on the orbital path before releasing into the wake (ms). At 540°/s, 500ms = ~3/4 of a rotation.",
        min: 100,
        max: 2000,
        step: 25,
        format: (v) => `${Math.round(v)}ms`,
      },
      {
        key: "vortexCaptureProbability",
        label: "Capture rate",
        description:
          "Probability that a particle entering the vortex zone gets captured. Lower = sparser orbits, more particles stream past.",
        min: 0,
        max: 1,
        step: 0.05,
      },
      {
        key: "vortexEllipseAspect",
        label: "Oval aspect",
        description:
          "Stretches the orbit into an oval along the cursor's heading. 1.0 = perfect circle; >1.0 = elongated like the Newmix spoon-trail vortices.",
        min: 1,
        max: 3,
        step: 0.05,
      },
      {
        key: "vortexSpeedReference",
        label: "Speed coupling ref",
        description:
          "Cursor speed (px/frame) at which orbit speed equals the configured rate. Lower = vortex reacts more sensitively to cursor speed (slow cursor → very slow spin; fast cursor → fast spin).",
        min: 1,
        max: 30,
        step: 0.5,
      },
    ],
  },
  {
    id: "display",
    label: "Display",
    blurb:
      "How particles are drawn on screen — visual size and total count. Turning the group off shrinks particles to a near-invisible 0.5 px stipple. Changing the count rebuilds the field (one brief flash).",
    offValues: {},
    renderOffValues: { particleDrawSize: 0.5 },
    sliders: [],
    renderSliders: [
      {
        key: "particleDrawSize",
        label: "Particle size",
        description:
          "Drawn size of each particle (px). 1 = fine pixel-stipple; 3-5 = chunky liquid blob; >5 = loses detail. Updates live as you drag.",
        min: 0.5,
        max: 6,
        step: 0.1,
      },
      {
        key: "particleCount",
        label: "Particle count",
        description:
          "Total number of animated particles sampled from the wordmark. Higher = denser stipple. Costs more CPU per frame; 10k-30k is light, 50k-80k is rich, 100k+ is heavy. The field briefly rebuilds when you release the slider.",
        min: 5000,
        max: 100000,
        step: 1000,
        format: (v) => `${(v / 1000).toFixed(0)}k`,
      },
    ],
  },
  {
    id: "colours",
    label: "Colours",
    blurb:
      "Pick the gradient palette painted onto the particles. Click any swatch to switch — the wordmark recolours instantly, no refresh.",
    offValues: {},
    sliders: [],
  },
  {
    id: "return",
    label: "Return",
    blurb:
      "How displaced particles drift back to their home positions after the wake expires — the sand-through-hourglass feel. Turning the group off makes them snap home immediately.",
    offValues: {
      idleThresholdMs: 0,
      homeReturnSpring: 0.05,
      homeReturnFriction: 0.85,
      homeReturnGravity: 0,
    },
    sliders: [
      {
        key: "idleThresholdMs",
        label: "Idle threshold",
        description:
          "How long the wake persists after the cursor stops (ms). Lower = wake collapses sooner.",
        min: 100,
        max: 4000,
        step: 50,
        format: (v) => `${Math.round(v)}ms`,
      },
      {
        key: "homeReturnSpring",
        label: "Spring",
        description:
          "Pull-toward-home strength during the drift phase. Lower = slower, more drifting return.",
        min: 0.001,
        max: 0.05,
        step: 0.001,
        format: (v) => v.toFixed(3),
      },
      {
        key: "homeReturnFriction",
        label: "Friction",
        description:
          "Velocity retention during return drift. Higher = soft slow motion; lower = snappier return.",
        min: 0.7,
        max: 0.99,
        step: 0.005,
        format: (v) => v.toFixed(3),
      },
      {
        key: "homeReturnGravity",
        label: "Gravity",
        description:
          "Downward bias during return — produces the sand-through-hourglass fall instead of a straight line home.",
        min: 0,
        max: 0.3,
        step: 0.005,
      },
    ],
  },
]

const ALL_SLIDER_KEYS = new Set<keyof NewmixLiveTuning>(
  GROUPS.flatMap((g) => g.sliders.map((s) => s.key))
)

const INT_KEYS = new Set<keyof NewmixLiveTuning>([
  "radius",
  "trailFollowMs",
  "wakeBandSpreadBmp",
  "wakeAlongStretchBmp",
  "exitVelocityBoostBmp",
  "vortexOffsetBmp",
  "vortexLagBmp",
  "vortexRadiusBmp",
  "idleThresholdMs",
])

function loadTuning(): NewmixLiveTuning {
  const merged = mergeNewmixLiveTuning(V3_TUNING)
  if (typeof window === "undefined") return merged
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return merged
    const parsed = JSON.parse(raw) as Partial<NewmixLiveTuning>
    return mergeNewmixLiveTuning({ ...V3_TUNING, ...parsed })
  } catch {
    return merged
  }
}

function loadDisabledGroups(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(LS_DISABLED_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as string[]
    return new Set(parsed)
  } catch {
    return new Set()
  }
}

function loadRender(): RenderTuning {
  if (typeof window === "undefined") return { ...RENDER_DEFAULTS }
  try {
    const raw = localStorage.getItem(LS_RENDER_KEY)
    if (!raw) return { ...RENDER_DEFAULTS }
    const parsed = JSON.parse(raw) as Partial<RenderTuning>
    return { ...RENDER_DEFAULTS, ...parsed }
  } catch {
    return { ...RENDER_DEFAULTS }
  }
}

function loadDisabledSliders(): Set<keyof NewmixLiveTuning> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(LS_DISABLED_SLIDERS_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as string[]
    return new Set(parsed as Array<keyof NewmixLiveTuning>)
  } catch {
    return new Set()
  }
}

function loadGradientId(): string {
  if (typeof window === "undefined") return DEFAULT_GRADIENT_ID
  try {
    const raw = localStorage.getItem(LS_GRADIENT_KEY)
    if (!raw) return DEFAULT_GRADIENT_ID
    const found = GRADIENT_PRESETS.find((p) => p.id === raw)
    return found ? found.id : DEFAULT_GRADIENT_ID
  } catch {
    return DEFAULT_GRADIENT_ID
  }
}

/** Build a CSS `linear-gradient(...)` string for swatch buttons in the panel. */
function gradientCss(preset: GradientPreset): string {
  return `linear-gradient(${preset.angleDeg}deg, ${preset.stops.join(", ")})`
}

function formatVal(spec: SliderSpec, v: number): string {
  if (spec.format) return spec.format(v)
  if (INT_KEYS.has(spec.key)) return String(Math.round(v))
  return v.toFixed(2)
}

export default function ParticleFlowTuner() {
  const [tuning, setTuning] = useState<NewmixLiveTuning>(() => loadTuning())
  const [render, setRender] = useState<RenderTuning>(() => loadRender())
  const [gradientId, setGradientId] = useState<string>(() => loadGradientId())
  const [disabledGroups, setDisabledGroups] = useState<Set<string>>(() =>
    loadDisabledGroups()
  )
  const [disabledSliders, setDisabledSliders] = useState<
    Set<keyof NewmixLiveTuning>
  >(() => loadDisabledSliders())

  /** Debounce particleCount changes — every 1k bump otherwise rebuilds the
   * 55k-particle field and causes a flash. We commit to the prop only after
   * the slider has been still for ~250ms. */
  const [appliedParticleCount, setAppliedParticleCount] = useState<number>(
    () => loadRender().particleCount
  )
  useEffect(() => {
    const id = window.setTimeout(() => {
      setAppliedParticleCount(render.particleCount)
    }, 250)
    return () => window.clearTimeout(id)
  }, [render.particleCount])
  const [open, setOpen] = useState(false)
  const [activeGroup, setActiveGroup] = useState<string>(GROUPS[0]!.id)
  const panelRef = useRef<HTMLDivElement | null>(null)

  /** Hide the (main) layout's footer + chat widget while this page is mounted. */
  useEffect(() => {
    document.body.classList.add("particle-flow-page")
    return () => {
      document.body.classList.remove("particle-flow-page")
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const updateSlider = useCallback(
    (key: keyof NewmixLiveTuning, raw: number) => {
      const v = INT_KEYS.has(key) ? Math.round(raw) : raw
      setTuning((t) => ({ ...t, [key]: v }))
    },
    []
  )

  const updateRenderSlider = useCallback(
    (key: keyof RenderTuning, raw: number) => {
      setRender((r) => ({ ...r, [key]: raw }))
    },
    []
  )

  const toggleGroup = useCallback((groupId: string) => {
    setDisabledGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }, [])

  const toggleSlider = useCallback((key: keyof NewmixLiveTuning) => {
    setDisabledSliders((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const saveSettings = useCallback(() => {
    try {
      const payload: Partial<NewmixLiveTuning> = {}
      for (const k of Array.from(ALL_SLIDER_KEYS)) {
        ;(payload as Record<string, number>)[k as string] = tuning[k as keyof NewmixLiveTuning]
      }
      localStorage.setItem(LS_KEY, JSON.stringify(payload))
      localStorage.setItem(
        LS_DISABLED_KEY,
        JSON.stringify(Array.from(disabledGroups))
      )
      localStorage.setItem(
        LS_DISABLED_SLIDERS_KEY,
        JSON.stringify(Array.from(disabledSliders))
      )
      localStorage.setItem(LS_RENDER_KEY, JSON.stringify(render))
      localStorage.setItem(LS_GRADIENT_KEY, gradientId)
    } catch {
      /* ignore quota */
    }
  }, [tuning, disabledGroups, disabledSliders, render, gradientId])

  const resetToV3 = useCallback(() => {
    setTuning(mergeNewmixLiveTuning(V3_TUNING))
    setDisabledGroups(new Set())
    setDisabledSliders(new Set())
    setRender({ ...RENDER_DEFAULTS })
    setGradientId(DEFAULT_GRADIENT_ID)
    try {
      localStorage.removeItem(LS_KEY)
      localStorage.removeItem(LS_DISABLED_KEY)
      localStorage.removeItem(LS_DISABLED_SLIDERS_KEY)
      localStorage.removeItem(LS_RENDER_KEY)
      localStorage.removeItem(LS_GRADIENT_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  /** Compute the effective tuning the hero will use: per-group overrides
   * applied for any group whose toggle is off. Live — every slider drag or
   * toggle change re-renders this and the hero picks it up next frame. */
  const effectiveTuning = useMemo<NewmixLiveTuning>(() => {
    let out = tuning
    /** Per-slider toggles: any slider whose toggle is off has its value
     * overridden by the spec's `disabledValue`. Applied first so a group-level
     * off-value can still win where defined. */
    if (disabledSliders.size > 0) {
      const overrides: Partial<NewmixLiveTuning> = {}
      for (const g of GROUPS) {
        for (const spec of g.sliders) {
          if (
            spec.disabledValue != null &&
            disabledSliders.has(spec.key)
          ) {
            ;(overrides as Record<string, number>)[spec.key as string] =
              spec.disabledValue
          }
        }
      }
      out = { ...out, ...overrides }
    }
    for (const g of GROUPS) {
      if (disabledGroups.has(g.id)) {
        out = { ...out, ...g.offValues }
      }
    }
    return out
  }, [tuning, disabledGroups, disabledSliders])

  const effectiveRender = useMemo<RenderTuning>(() => {
    let out = render
    for (const g of GROUPS) {
      if (disabledGroups.has(g.id) && g.renderOffValues) {
        out = { ...out, ...g.renderOffValues }
      }
    }
    return out
  }, [render, disabledGroups])

  const activeGradient = useMemo<GradientPreset>(
    () =>
      GRADIENT_PRESETS.find((p) => p.id === gradientId) ??
      GRADIENT_PRESETS[0]!,
    [gradientId]
  )

  const activeGroupSpec = useMemo(
    () => GROUPS.find((g) => g.id === activeGroup) ?? GROUPS[0]!,
    [activeGroup]
  )
  const activeIsEnabled = !disabledGroups.has(activeGroupSpec.id)

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            body.particle-flow-page > footer,
            body.particle-flow-page footer.relative,
            body.particle-flow-page button[aria-label="Open chat"],
            body.particle-flow-page button[aria-label="Close chat"] {
              display: none !important;
            }
          `,
        }}
      />

      <HomeParticleLogoHero
        presentation="embedded"
        interactionMode="newmix"
        animatedParticleCap={appliedParticleCount}
        sectionAriaLabel="SC Prints — particle flow"
        newmixLiveTuning={effectiveTuning}
        wordmarkGradient={{
          angleDeg: activeGradient.angleDeg,
          stops: activeGradient.stops,
        }}
        particleDrawSize={effectiveRender.particleDrawSize}
      />

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open particle tuning"
          className="fixed bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/85 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.45)] transition-colors hover:bg-black/80 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[18px] w-[18px]"
            aria-hidden
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      )}

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Particle tuning"
          className="fixed bottom-5 right-5 z-50 w-[min(440px,calc(100vw-2.5rem))] max-h-[min(85vh,720px)] flex flex-col overflow-hidden rounded-xl border border-white/15 text-white backdrop-blur-xl shadow-[0_18px_48px_-12px_rgba(0,0,0,0.6),0_0_32px_2px_rgba(120,180,255,0.06)] animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{ backgroundColor: "rgba(13, 16, 28, 0.62)" }}
        >
          {/** Header: tab buttons (each with a coloured dot indicating its
           * enabled state) + close. */}
          <div className="flex items-center gap-1 border-b border-white/10 px-2 py-2">
            <div className="flex flex-1 flex-wrap gap-1">
              {GROUPS.map((g) => {
                const active = g.id === activeGroup
                const enabled = !disabledGroups.has(g.id)
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setActiveGroup(g.id)}
                    className={
                      "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium tracking-wide transition-colors " +
                      (active
                        ? "bg-white/15 text-white"
                        : "text-white/55 hover:text-white/85 hover:bg-white/5")
                    }
                  >
                    {g.id !== "colours" && (
                      <span
                        aria-hidden
                        className={
                          "h-1.5 w-1.5 rounded-full transition-colors " +
                          (enabled
                            ? "bg-[#3dcfc2] shadow-[0_0_6px_rgba(61,207,194,0.7)]"
                            : "bg-white/25")
                        }
                      />
                    )}
                    {g.label}
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close particle tuning"
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-[16px] w-[16px]"
                aria-hidden
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/** Group blurb + on/off toggle. Colours tab has no toggle — picking
           * a palette is always meaningful, there's no "off" state. */}
          <div className="border-b border-white/10 bg-white/[0.02] px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[12px] font-semibold text-white/85">
                {activeGroupSpec.label}
              </div>
              {activeGroupSpec.id !== "colours" && (
              <button
                type="button"
                onClick={() => toggleGroup(activeGroupSpec.id)}
                role="switch"
                aria-checked={activeIsEnabled}
                aria-label={`Toggle ${activeGroupSpec.label} effects`}
                className={
                  "relative h-5 w-9 shrink-0 rounded-full border transition-colors " +
                  (activeIsEnabled
                    ? "bg-[#3dcfc2]/30 border-[#3dcfc2]/40"
                    : "bg-white/5 border-white/15")
                }
              >
                <span
                  aria-hidden
                  className={
                    "absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full transition-all " +
                    (activeIsEnabled
                      ? "left-[18px] bg-[#3dcfc2] shadow-[0_0_8px_rgba(61,207,194,0.7)]"
                      : "left-[2px] bg-white/45")
                  }
                />
              </button>
              )}
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-white/55">
              {activeGroupSpec.blurb}
            </p>
          </div>

          {/** Sliders — visually dimmed when the group is disabled, but still
           * interactive so you can preview values before re-enabling. The
           * Colours tab is a special case: it renders gradient swatch buttons
           * instead of sliders. */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            {activeGroupSpec.id === "colours" ? (
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-3">
                  {GRADIENT_PRESETS.map((preset) => {
                    const selected = preset.id === gradientId
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setGradientId(preset.id)}
                        aria-label={preset.label}
                        aria-pressed={selected}
                        className={
                          "group flex flex-col items-center gap-1.5 rounded-lg p-1.5 transition-colors " +
                          (selected
                            ? "bg-white/10"
                            : "hover:bg-white/[0.04]")
                        }
                      >
                        <span
                          aria-hidden
                          className={
                            "h-12 w-12 rounded-full transition-all " +
                            (selected
                              ? "ring-2 ring-[#3dcfc2] ring-offset-2 ring-offset-[rgba(13,16,28,0.85)] shadow-[0_0_18px_rgba(61,207,194,0.45)]"
                              : "ring-1 ring-white/15 group-hover:ring-white/30")
                          }
                          style={{ background: gradientCss(preset) }}
                        />
                        <span
                          className={
                            "text-[10.5px] font-medium tracking-wide " +
                            (selected ? "text-white" : "text-white/60")
                          }
                        >
                          {preset.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <p className="px-1 text-[10.5px] leading-snug text-white/45">
                  Each particle's colour is fixed by its home position
                  projected onto the gradient axis ({activeGradient.angleDeg}°
                  for this preset). When the cursor pushes a particle, the
                  colour travels with it.
                </p>
              </div>
            ) : (
              <div
                className={
                  "space-y-3 transition-opacity " +
                  (activeIsEnabled ? "opacity-100" : "opacity-45")
                }
              >
                {activeGroupSpec.sliders.map((spec) => {
                const v = Math.min(
                  spec.max,
                  Math.max(spec.min, tuning[spec.key])
                )
                const hasToggle = spec.disabledValue != null
                const sliderEnabled = !disabledSliders.has(spec.key)
                return (
                  <label
                    key={spec.key}
                    className={
                      "block rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 transition-opacity " +
                      (hasToggle && !sliderEnabled ? "opacity-50" : "")
                    }
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-medium text-white/85">
                        {spec.label}
                      </span>
                      <span className="flex items-center gap-2.5">
                        <span className="font-mono text-[11px] text-white/65 tabular-nums">
                          {formatVal(spec, v)}
                        </span>
                        {hasToggle && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              toggleSlider(spec.key)
                            }}
                            role="switch"
                            aria-checked={sliderEnabled}
                            aria-label={`Toggle ${spec.label}`}
                            className={
                              "relative h-4 w-7 shrink-0 rounded-full border transition-colors " +
                              (sliderEnabled
                                ? "bg-[#3dcfc2]/30 border-[#3dcfc2]/40"
                                : "bg-white/5 border-white/15")
                            }
                          >
                            <span
                              aria-hidden
                              className={
                                "absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full transition-all " +
                                (sliderEnabled
                                  ? "left-[14px] bg-[#3dcfc2] shadow-[0_0_5px_rgba(61,207,194,0.6)]"
                                  : "left-[2px] bg-white/45")
                              }
                            />
                          </button>
                        )}
                      </span>
                    </span>
                    <p className="mt-0.5 text-[10.5px] leading-snug text-white/45">
                      {spec.description}
                    </p>
                    <input
                      type="range"
                      min={spec.min}
                      max={spec.max}
                      step={spec.step}
                      value={v}
                      disabled={hasToggle && !sliderEnabled}
                      onChange={(e) =>
                        updateSlider(spec.key, Number(e.target.value))
                      }
                      className="mt-2 w-full accent-[#3dcfc2] disabled:cursor-not-allowed"
                    />
                  </label>
                )
              })}
              {activeGroupSpec.renderSliders?.map((spec) => {
                const v = Math.min(
                  spec.max,
                  Math.max(spec.min, render[spec.key])
                )
                return (
                  <label
                    key={spec.key}
                    className="block rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2"
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-[12px] font-medium text-white/85">
                        {spec.label}
                      </span>
                      <span className="font-mono text-[11px] text-white/65 tabular-nums">
                        {spec.format
                          ? spec.format(v)
                          : v.toFixed(1)}
                      </span>
                    </span>
                    <p className="mt-0.5 text-[10.5px] leading-snug text-white/45">
                      {spec.description}
                    </p>
                    <input
                      type="range"
                      min={spec.min}
                      max={spec.max}
                      step={spec.step}
                      value={v}
                      onChange={(e) =>
                        updateRenderSlider(spec.key, Number(e.target.value))
                      }
                      className="mt-2 w-full accent-[#3dcfc2]"
                    />
                  </label>
                )
              })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-black/30 px-3 py-2">
            <p className="text-[10.5px] text-white/40">
              Changes apply live — no refresh needed.
            </p>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={resetToV3}
                className="rounded-md border border-white/15 bg-transparent px-2.5 py-1 text-[11px] font-medium text-white/65 transition-colors hover:bg-white/5 hover:text-white/90"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={saveSettings}
                className="rounded-md border border-[#3dcfc2]/35 bg-[#3dcfc2]/10 px-3 py-1 text-[11px] font-semibold text-[#3dcfc2] transition-colors hover:bg-[#3dcfc2]/20"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
