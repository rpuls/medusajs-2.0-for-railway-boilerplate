"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import HomeParticleLogoHero from "@modules/home/components/home-particle-logo-hero"
import type { NewmixLiveTuning } from "@modules/home/components/home-particle-logo-hero/newmix-live-tuning"
import { mergeNewmixLiveTuning } from "@modules/home/components/home-particle-logo-hero/newmix-live-tuning"

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
    id: "field",
    label: "Field",
    blurb:
      "Lingering-momentum velocity grid — the cursor stirs a coarse 2D field that holds momentum across frames and slowly decays. Particles ride the field, so when the cursor stops the swirl keeps spinning before fading. Turning the group off disables the field entirely (no inject, no sample).",
    offValues: {
      fieldStrength: 0,
    },
    sliders: [
      {
        key: "fieldStrength",
        label: "Master strength",
        description:
          "Global on/off / fade for the field. 0 = particles never sample it (system disabled). 1 = full ride strength. Acts as the master multiplier on every other field knob.",
        min: 0,
        max: 1,
        step: 0.05,
      },
      {
        key: "fieldGridResolution",
        label: "Grid resolution",
        description:
          "Cells along the longer canvas axis. Higher = finer detail in the swirl, but more cells to update each frame. 24-48 reads as natural; >64 starts costing fps.",
        min: 12,
        max: 96,
        step: 2,
        format: (v) => `${Math.round(v)} cells`,
      },
      {
        key: "fieldInjectRadiusBmp",
        label: "Inject radius",
        description:
          "How wide the cursor's velocity is splashed into the grid each frame (px). Larger = the stir reaches further out from the cursor's path.",
        min: 20,
        max: 200,
        step: 2,
      },
      {
        key: "fieldInjectStrength",
        label: "Inject strength",
        description:
          "Multiplier on cursor velocity when injecting into the field. Higher = a single mouse stroke deposits more momentum, so the field carries longer / spins harder after the cursor leaves.",
        min: 0,
        max: 5,
        step: 0.1,
      },
      {
        key: "fieldDecayPerSec",
        label: "Decay rate",
        description:
          "Fraction of field energy lost per second when the cursor isn't adding to it. 0 = field never decays (energy keeps building, can get chaotic); 1 = field dies within a second. 0.4-0.7 = stir, watch it spin down over a couple of seconds.",
        min: 0,
        max: 1,
        step: 0.02,
      },
      {
        key: "fieldDiffusion",
        label: "Diffusion",
        description:
          "Lateral spread of momentum each frame — energy bleeds from each cell into its 4 neighbours. Higher = the swirl spreads beyond the cursor's path more aggressively. 0 = skip the pass (perf saving).",
        min: 0,
        max: 0.25,
        step: 0.01,
      },
      {
        key: "fieldRideStrength",
        label: "Ride strength",
        description:
          "How much of the sampled field velocity is added to a particle each frame. 0 = particles ignore the field. 0.05-0.2 = particles ride it but keep their own dynamics. >0.3 = particles act mostly as flow tracers.",
        min: 0,
        max: 0.5,
        step: 0.01,
      },
      {
        key: "fieldPressureStrength",
        label: "Pressure projection",
        description:
          "Stam-style fluid-solver step that subtracts the divergent component of the velocity field — vortices form/persist instead of smearing outward. The single most important knob for making the field feel like fluid. 0 = disabled (gas-like); 0.25-0.5 = clean curling; >0.7 may lock up.",
        min: 0,
        max: 1,
        step: 0.02,
      },
      {
        key: "fieldPressureIterations",
        label: "Pressure iterations",
        description:
          "Number of pressure-projection passes per frame. More = closer to true incompressibility but more expensive. 1-2 covers most cases at this grid resolution.",
        min: 1,
        max: 4,
        step: 1,
        format: (v) => `${Math.round(v)}×`,
      },
      {
        key: "fieldDrivenCursor",
        label: "Cursor pushes field",
        description:
          "Newmix-style toggle. OFF (0) = cursor force pushes particles directly (classic). ON (1) = cursor force is deposited into the field cell, particles read the field bilinearly. Combined with pressure projection, makes the cursor feel like stirring fluid instead of pushing a rake through sand.",
        min: 0,
        max: 1,
        step: 1,
        format: (v) => (v >= 0.5 ? "ON" : "OFF"),
      },
      {
        key: "fieldStrokeSubdivisionPx",
        label: "Stroke subdivide",
        description:
          "When the cursor moves more than this many bitmap pixels in a frame (a flick), the cursor inject is subdivided so velocity is deposited at every step along the path — fast cursor movement deposits everywhere it travelled, not just at the endpoint. Newmix uses 6px. 0 = no subdivision.",
        min: 0,
        max: 30,
        step: 1,
        format: (v) => (v <= 0 ? "off" : `${Math.round(v)}px`),
      },
      {
        key: "particleSpeedLimit",
        label: "Particle speed limit",
        description:
          "Hard ceiling on per-particle velocity (px/frame). Newmix uses 30. Lower = particles always pulled back hard, swirl stays tight; higher = particles can fly further on hot field flow lines (long thin arcs). 0 = no clamp.",
        min: 0,
        max: 100,
        step: 1,
        format: (v) =>
          v <= 0 ? "off" : `${Math.round(v)} px/frame`,
      },
    ],
  },
  {
    id: "curl",
    label: "Curl",
    blurb:
      "Divergence-free curl-noise micro-turbulence. Layers organic 2D flow on top of the cursor + field forces, so resting particles drift in marbled streams instead of sitting dead-still. Turning the group off zeroes the amplitude.",
    offValues: {
      curlNoiseAmplitude: 0,
    },
    sliders: [
      {
        key: "curlNoiseAmplitude",
        label: "Amplitude",
        description:
          "How strongly the curl-noise field nudges resting particles each frame (px). 0 = disabled. 0.05-0.2 = subtle marbling. >0.5 = chaotic.",
        min: 0,
        max: 1,
        step: 0.01,
      },
      {
        key: "curlNoiseScale",
        label: "Spatial scale",
        description:
          "Spatial frequency of the noise (cycles per px). Lower = bigger, slower swirls; higher = tighter, more chaotic eddies. 0.005-0.03 typical.",
        min: 0.001,
        max: 0.05,
        step: 0.001,
      },
      {
        key: "curlNoiseEvolutionHz",
        label: "Evolution rate",
        description:
          "How fast the noise field drifts in time (Hz). Lower = lazy, slow-flowing turbulence; higher = busy, nervous.",
        min: 0,
        max: 2,
        step: 0.05,
      },
    ],
  },
  {
    id: "coupling",
    label: "Coupling",
    blurb:
      "Cursor-speed coupling: blends the constant cursor force with one that scales with mouse speed. Slow drag = gentle, fast flick = chaotic. Turning the group off restores classic constant force regardless of speed.",
    offValues: {
      cursorForceSpeedCoupling: 0,
    },
    sliders: [
      {
        key: "cursorForceSpeedCoupling",
        label: "Coupling strength",
        description:
          "Blend between constant force (0) and fully speed-coupled force (1). At 1, slow drag barely moves particles and a flick produces violent chaos.",
        min: 0,
        max: 1,
        step: 0.05,
      },
      {
        key: "cursorForceSpeedReference",
        label: "Reference speed",
        description:
          "Cursor speed (px/frame) at which the speed-coupled multiplier equals 1. Lower = forces ramp up faster at lower cursor speeds.",
        min: 1,
        max: 30,
        step: 0.5,
      },
    ],
  },
  {
    id: "boundary",
    label: "Boundary",
    blurb:
      "Optional invisible circular wall (the 'coffee cup'). Particles past the radius are reflected back inward, so cursor pushes pile up at the rim and curl back instead of escaping. Turning the group off disables the wall.",
    offValues: {
      boundaryRadiusFrac: 0,
    },
    sliders: [
      {
        key: "boundaryRadiusFrac",
        label: "Radius",
        description:
          "Wall radius as a fraction of canvas half-diagonal. 0 = no wall. 1.0 = wall at canvas corner. ~0.7-0.9 keeps the bowl tight enough to feel like a cup.",
        min: 0,
        max: 1.5,
        step: 0.02,
      },
      {
        key: "boundaryRestitution",
        label: "Bounce",
        description:
          "Velocity restitution on impact. 0 = velocity wiped on contact (sticky wall); 1 = perfect bounce. ~0.4-0.6 reads as soft but visible reflection.",
        min: 0,
        max: 1,
        step: 0.05,
      },
    ],
  },
  {
    id: "crema",
    label: "Crema",
    blurb:
      "Two-phase fluid: a fraction of particles is flagged as 'lighter' (crema) — they react more strongly to the cursor and get sucked into vortex eddies first while the heavier particles swing wider. Plus an asymmetric-paddling knob that biases cursor force toward broadside particles. Foam status is hash-derived per particle so it's stable across frames; the slider just shifts the cutoff. Gradient colours are preserved — only physics differs.",
    offValues: {
      foamFraction: 0,
      paddleSharpness: 0,
    },
    sliders: [
      {
        key: "foamFraction",
        label: "Foam fraction",
        description:
          "Fraction of particles flagged as crema (lighter). 0 = none. ~0.05-0.15 reads as a few visibly more reactive specks. Hash-derived so the same particles are crema every refresh.",
        min: 0,
        max: 0.3,
        step: 0.01,
        format: (v) => `${(v * 100).toFixed(0)}%`,
      },
      {
        key: "foamForceMultiplier",
        label: "Foam reactivity",
        description:
          "How much more strongly foam particles react to cursor and vortex forces vs heavier particles. 1.0 = identical (effectively disabled). 1.5-2.5 = visible difference. >3 = foam shoots ahead while liquid lags.",
        min: 1,
        max: 4,
        step: 0.1,
        format: (v) => `${v.toFixed(1)}×`,
      },
      {
        key: "paddleSharpness",
        label: "Paddle bias",
        description:
          "Biases cursor force toward particles that are broadside to the motion direction. 0 = spherical cursor (current default). 1 = strong cos² weighting — the cursor reads like a flat spoon face: hits sideways particles hard, slices past those in line with motion.",
        min: 0,
        max: 1,
        step: 0.05,
      },
    ],
  },
  {
    id: "flocking",
    label: "Flocking",
    blurb:
      "Particles blend a fraction of a neighbour's velocity into their own each frame, forming streams / ribbons instead of independent dust. Uses a spatial hash so it scales linearly. Turning the group off skips the pass entirely.",
    offValues: {
      flockingStrength: 0,
    },
    sliders: [
      {
        key: "flockingStrength",
        label: "Strength",
        description:
          "Fraction of a neighbour's velocity blended in per process tick. 0 = disabled. 0.05-0.15 = subtle alignment into ribbons. >0.3 starts to look gummy.",
        min: 0,
        max: 0.5,
        step: 0.01,
      },
      {
        key: "flockingRadiusBmp",
        label: "Neighbour radius",
        description:
          "Spatial radius for finding neighbours (px). Sets the spatial-hash cell size. Larger = particles align over longer distances at higher cost.",
        min: 4,
        max: 60,
        step: 1,
      },
      {
        key: "flockingProcessFraction",
        label: "Process fraction",
        description:
          "Fraction of particles processed each frame (round-robin). 1 = every particle every frame (heavy at 50k+). 0.25 = every particle once every 4 frames (cheap, still reads as alignment).",
        min: 0.05,
        max: 1,
        step: 0.05,
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
    id: "metaball",
    label: "Metaball",
    blurb:
      "Liquid render mode — particles are blurred + thresholded into fused blobs with sharp surface-tension edges. Significantly heavier than direct rendering; pair with a lower particle count. Turning the group off restores classic discrete-particle rendering.",
    offValues: {
      metaballEnabled: 0,
    },
    sliders: [
      {
        key: "metaballEnabled",
        label: "Liquid mode",
        description:
          "Master toggle (0 = off, 1 = on). When on, particles are drawn larger & softer, then blurred and contrast-thresholded so overlapping ones fuse into single blobs.",
        min: 0,
        max: 1,
        step: 1,
        format: (v) => (v >= 0.5 ? "ON" : "OFF"),
      },
      {
        key: "metaballGlowRadius",
        label: "Glow radius",
        description:
          "Per-particle drawn size when metaball is on (px). Larger = particles fuse more aggressively across gaps. Replaces the normal Particle Size in Display while metaball is on.",
        min: 2,
        max: 24,
        step: 0.5,
      },
      {
        key: "metaballBlurPx",
        label: "Blur",
        description:
          "Gaussian blur (CSS px) applied before the threshold. Higher = softer fusion, more diffuse blobs.",
        min: 0,
        max: 40,
        step: 0.5,
      },
      {
        key: "metaballThreshold",
        label: "Threshold",
        description:
          "How hard the contrast pass cuts the blurred glow. Higher = harder, more surface-tension edges; lower = softer, more ghostly.",
        min: 0,
        max: 1,
        step: 0.02,
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

/** Page-specific configuration. Each instance (one per route) gets its own
 * `lsKeyPrefix` so localStorage state stays isolated. */
export type NewmixTunerExperienceProps = {
  /** Prefix for all localStorage keys this instance touches. */
  lsKeyPrefix: string
  /** Default tuning values used when localStorage is empty + on Reset. */
  initialTuning?: Partial<NewmixLiveTuning>
  /** Default render values (particle size + count). */
  initialRender?: Partial<RenderTuning>
  /** Default gradient preset id. */
  initialGradientId?: string
  /** Aria label for the canvas section. */
  sectionAriaLabel?: string
  /** Body class applied while this experience is mounted, used to hide the
   * site footer + chat widget so they don't overlap the tuner panel. */
  bodyClassWhileMounted?: string
}

type LsKeys = {
  tuning: string
  disabled: string
  disabledSliders: string
  render: string
  gradient: string
}

function buildLsKeys(prefix: string): LsKeys {
  return {
    tuning: `${prefix}-tuning-v1`,
    disabled: `${prefix}-disabled-groups-v1`,
    disabledSliders: `${prefix}-disabled-sliders-v1`,
    render: `${prefix}-render-v1`,
    gradient: `${prefix}-gradient-v1`,
  }
}

function loadTuning(
  keys: LsKeys,
  initial: Partial<NewmixLiveTuning>
): NewmixLiveTuning {
  const merged = mergeNewmixLiveTuning(initial)
  if (typeof window === "undefined") return merged
  try {
    const raw = localStorage.getItem(keys.tuning)
    if (!raw) return merged
    const parsed = JSON.parse(raw) as Partial<NewmixLiveTuning>
    return mergeNewmixLiveTuning({ ...initial, ...parsed })
  } catch {
    return merged
  }
}

function loadDisabledGroups(keys: LsKeys): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(keys.disabled)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as string[]
    return new Set(parsed)
  } catch {
    return new Set()
  }
}

function loadRender(
  keys: LsKeys,
  initial: Partial<RenderTuning>
): RenderTuning {
  const base = { ...RENDER_DEFAULTS, ...initial }
  if (typeof window === "undefined") return base
  try {
    const raw = localStorage.getItem(keys.render)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<RenderTuning>
    return { ...base, ...parsed }
  } catch {
    return base
  }
}

function loadDisabledSliders(keys: LsKeys): Set<keyof NewmixLiveTuning> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(keys.disabledSliders)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as string[]
    return new Set(parsed as Array<keyof NewmixLiveTuning>)
  } catch {
    return new Set()
  }
}

function loadGradientId(keys: LsKeys, fallback: string): string {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(keys.gradient)
    if (!raw) return fallback
    const found = GRADIENT_PRESETS.find((p) => p.id === raw)
    return found ? found.id : fallback
  } catch {
    return fallback
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

export default function NewmixTunerExperience(
  props: NewmixTunerExperienceProps
) {
  const {
    lsKeyPrefix,
    initialTuning = {},
    initialRender = {},
    initialGradientId = DEFAULT_GRADIENT_ID,
    sectionAriaLabel = "SC Prints — particle flow",
    bodyClassWhileMounted = "particle-flow-page",
  } = props
  /** Memoize keys so the load* identity is stable. */
  const lsKeys = useMemo(() => buildLsKeys(lsKeyPrefix), [lsKeyPrefix])
  const initialTuningRef = useRef(initialTuning)
  const initialRenderRef = useRef(initialRender)
  const initialGradientIdRef = useRef(initialGradientId)
  const [tuning, setTuning] = useState<NewmixLiveTuning>(() =>
    loadTuning(lsKeys, initialTuningRef.current)
  )
  const [render, setRender] = useState<RenderTuning>(() =>
    loadRender(lsKeys, initialRenderRef.current)
  )
  const [gradientId, setGradientId] = useState<string>(() =>
    loadGradientId(lsKeys, initialGradientIdRef.current)
  )
  const [disabledGroups, setDisabledGroups] = useState<Set<string>>(() =>
    loadDisabledGroups(lsKeys)
  )
  const [disabledSliders, setDisabledSliders] = useState<
    Set<keyof NewmixLiveTuning>
  >(() => loadDisabledSliders(lsKeys))

  /** Debounce particleCount changes — every 1k bump otherwise rebuilds the
   * 55k-particle field and causes a flash. We commit to the prop only after
   * the slider has been still for ~250ms. */
  const [appliedParticleCount, setAppliedParticleCount] = useState<number>(
    () => loadRender(lsKeys, initialRenderRef.current).particleCount
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

  /** Hide the (main) layout's footer + chat widget while this experience is
   * mounted. The class itself is page-configurable. */
  useEffect(() => {
    document.body.classList.add(bodyClassWhileMounted)
    return () => {
      document.body.classList.remove(bodyClassWhileMounted)
    }
  }, [bodyClassWhileMounted])

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
      localStorage.setItem(lsKeys.tuning, JSON.stringify(payload))
      localStorage.setItem(
        lsKeys.disabled,
        JSON.stringify(Array.from(disabledGroups))
      )
      localStorage.setItem(
        lsKeys.disabledSliders,
        JSON.stringify(Array.from(disabledSliders))
      )
      localStorage.setItem(lsKeys.render, JSON.stringify(render))
      localStorage.setItem(lsKeys.gradient, gradientId)
    } catch {
      /* ignore quota */
    }
  }, [tuning, disabledGroups, disabledSliders, render, gradientId, lsKeys])

  const resetToInitial = useCallback(() => {
    setTuning(mergeNewmixLiveTuning(initialTuningRef.current))
    setDisabledGroups(new Set())
    setDisabledSliders(new Set())
    setRender({ ...RENDER_DEFAULTS, ...initialRenderRef.current })
    setGradientId(initialGradientIdRef.current)
    try {
      localStorage.removeItem(lsKeys.tuning)
      localStorage.removeItem(lsKeys.disabled)
      localStorage.removeItem(lsKeys.disabledSliders)
      localStorage.removeItem(lsKeys.render)
      localStorage.removeItem(lsKeys.gradient)
    } catch {
      /* ignore */
    }
  }, [lsKeys])

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

  /** Inline `<style>` block: scoped to the page-configurable body class so
   * each tuner instance hides only its own host page's chrome. */
  const bodyHideCss = `
    body.${bodyClassWhileMounted} > footer,
    body.${bodyClassWhileMounted} footer.relative,
    body.${bodyClassWhileMounted} button[aria-label="Open chat"],
    body.${bodyClassWhileMounted} button[aria-label="Close chat"] {
      display: none !important;
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: bodyHideCss }} />

      <HomeParticleLogoHero
        presentation="embedded"
        interactionMode="newmix"
        animatedParticleCap={appliedParticleCount}
        sectionAriaLabel={sectionAriaLabel}
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
                onClick={resetToInitial}
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
