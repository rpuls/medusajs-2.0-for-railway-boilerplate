"use client"

import NextImage from "next/image"
import { useReducedMotion } from "framer-motion"
import { createPortal } from "react-dom"
import type { CSSProperties } from "react"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

import {
  ANIMATED_PARTICLE_CAP,
  DRAG_RADIUS,
  FRICTION,
  FULL_HERO_HOME_FRACTION,
  FULLSCREEN_LOGO_NUDGE_Y_CSS,
  FULLSCREEN_LOGO_PAD,
  FULLSCREEN_PARTICLE_DRAW_SIZE_BMP,
  MOUSE_CURSOR_STIPPLE_COUPLED_EFFECTS_ENABLED,
  ANIMATED_PARTICLE_ALPHA_MULT,
  PARTICLE_ALPHA_CAP,
  PARTICLE_BASE_ALPHA,
  PARTICLE_DRAW_SIZE_BMP,
  PARTICLE_ENTRANCE_DURATION_MS,
  PARTICLE_ENTRANCE_SPAWN_SPREAD_FRAC,
  PARTICLE_ENTRANCE_STAGGER_FRAC,
  PARTICLE_ENTRANCE_DURATION_JITTER,
  PARTICLE_ENTRANCE_CURVE_BMP,
  PARTICLE_ENTRANCE_DIFFUSION_BMP,
  PARTICLE_ENTRANCE_SPAWN_TAIL_BMP,
  EMBEDDED_LOGO_BOOST_SCALE,
  PARTICLE_RADIUS_MIN_CSS,
  PHYSICS_DIST_EPSILON,
  PUSH_FORCE,
  PUSH_REPULSE_FALLOFF_POWER,
  SPRING_STIFFNESS,
  SWIRL_FORCE,
  PARALLAX_EASE,
  PARALLAX_MOUSE_SENSITIVITY,
  PARALLAX_MULT_C,
  SHOW_MOUSE_CURSOR_DEBUG_MARKER,
  LOGO_TILT_MAX_DEG,
  LOGO_TILT_PERSPECTIVE_PX,
  LOGO_TILT_SMOOTHING,
  WAKE_TRAIL_MAX_POINTS,
  WAKE_TRAIL_SAMPLE_DIST_BMP,
  WAKE_TRAIL_AGE_DECAY,
  WAKE_TRAIL_RADIUS_FRAC,
  WAKE_TRAIL_FORCE_FRAC,
  WAKE_SPRING_STIFFNESS,
  WAKE_FRICTION,
  WAKE_TRAIL_SWIRL_FRAC,
  BLACK_HOLE_RADIUS_MULT,
  BLACK_HOLE_PULL_FORCE,
  BLACK_HOLE_SWIRL_MULT,
  BLACK_HOLE_RING_HOLD_DIST_BMP,
  BLACK_HOLE_RING_PUSH,
  BLACK_HOLE_HOME_SPRING_SUPPRESS,
  BLACK_HOLE_SPRING_STIFFNESS_MULT,
  BLACK_HOLE_FRICTION,
  BLACK_HOLE_TRAIL_FOLLOW_MS,
  BLACK_HOLE_TRAIL_FOLLOW_ACCEL,
  NEWMIX_RADIUS_BMP,
  NEWMIX_TRAIL_MAX_POINTS,
  NEWMIX_TRAIL_SAMPLE_DIST_BMP,
} from "./constants"
import type { ViscousCoffeeLiveTuning } from "./viscous-coffee-live-tuning"
import { mergeViscousCoffeeLiveTuning } from "./viscous-coffee-live-tuning"
import type { NewmixLiveTuning } from "./newmix-live-tuning"
import { mergeNewmixLiveTuning } from "./newmix-live-tuning"
import type { FlowLiveTuning } from "./flow-live-tuning"
import { mergeFlowLiveTuning } from "./flow-live-tuning"
import type { DisplacedLiveTuning } from "./displaced-live-tuning"
import { mergeDisplacedLiveTuning } from "./displaced-live-tuning"
import type { VelocityField } from "./velocity-field"
import {
  clearVelocityField,
  createVelocityField,
  advectVelocityField,
  decayVelocityField,
  diffuseVelocityField,
  injectVelocity,
  pressureProjectVelocityField,
  sampleVelocityField,
} from "./velocity-field"
import { sampleCurlNoise } from "./curl-noise"
import type { SpatialHash } from "./spatial-hash"
import {
  buildSpatialHash,
  ensureSpatialHash,
  pickNeighbor,
} from "./spatial-hash"

const DEFAULT_LOGO_SRC = "/branding/sc-prints-logo-transparent.png"
const FALLBACK_SRC = "/branding/sc-prints-logo-white.png"

const MIX_REVEAL_MS = 1350
const MIX_REVEAL_EASE = "cubic-bezier(0.33, 1, 0.68, 1)"

/** If logo renders with no usable alpha (some SVG/CORS cases), sample bright ink on black. */
const FALLBACK_BRIGHT_SUM = 280

/**
 * Rasterize the logo on a transparent offscreen canvas and collect bitmap pixels
 * where alpha exceeds mid threshold (solid logo ink on transparent PNG/SVG).
 */
function gatherAlphaCandidates(
  W: number,
  H: number,
  dpr: number,
  img: CanvasImageSource,
  wCss: number,
  hCss: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number
): Array<{ x: number; y: number }> {
  const off = document.createElement("canvas")
  off.width = W
  off.height = H
  const octx = off.getContext("2d", { alpha: true })
  if (!octx) {
    return []
  }
  octx.setTransform(1, 0, 0, 1, 0, 0)
  octx.scale(dpr, dpr)
  octx.clearRect(0, 0, wCss, hCss)
  octx.drawImage(img, dx, dy, dw, dh)

  let imageData: ImageData
  try {
    imageData = octx.getImageData(0, 0, W, H)
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[HomeParticleLogoHero] getImageData (alpha pass) failed:", e)
    }
    return []
  }

  const out: Array<{ x: number; y: number }> = []
  const data = imageData.data
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4
      const a = data[i + 3]
      if (a > 128) {
        out.push({ x, y })
      }
    }
  }
  return out
}

/**
 * Second pass: black background + draw image; keep bright pixels (white logo on black).
 */
function gatherBrightInkCandidates(
  W: number,
  H: number,
  dpr: number,
  img: CanvasImageSource,
  wCss: number,
  hCss: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number
): Array<{ x: number; y: number }> {
  const off = document.createElement("canvas")
  off.width = W
  off.height = H
  const octx = off.getContext("2d", { alpha: true })
  if (!octx) {
    return []
  }
  octx.setTransform(1, 0, 0, 1, 0, 0)
  octx.scale(dpr, dpr)
  octx.fillStyle = "#000"
  octx.fillRect(0, 0, wCss, hCss)
  octx.drawImage(img, dx, dy, dw, dh)

  let imageData: ImageData
  try {
    imageData = octx.getImageData(0, 0, W, H)
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[HomeParticleLogoHero] getImageData (bright pass) failed:", e)
    }
    return []
  }

  const out: Array<{ x: number; y: number }> = []
  const data = imageData.data
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      if (r + g + b >= FALLBACK_BRIGHT_SUM) {
        out.push({ x, y })
      }
    }
  }
  return out
}

/** Threshold for the dark-ink pass: pixels darker than this (`r+g+b` sum) become candidates.
 * Mirror of `FALLBACK_BRIGHT_SUM` for inverted-polarity logos (dark ink on white background). */
const FALLBACK_DARK_SUM = 380

/**
 * Third pass: white background + draw image; keep DARK pixels (dark logo on white). Used
 * for source images where the visible content is dark on a light background — the inverse
 * of `gatherBrightInkCandidates`.
 */
function gatherDarkInkCandidates(
  W: number,
  H: number,
  dpr: number,
  img: CanvasImageSource,
  wCss: number,
  hCss: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number
): Array<{ x: number; y: number }> {
  const off = document.createElement("canvas")
  off.width = W
  off.height = H
  const octx = off.getContext("2d", { alpha: true })
  if (!octx) {
    return []
  }
  octx.setTransform(1, 0, 0, 1, 0, 0)
  octx.scale(dpr, dpr)
  octx.fillStyle = "#fff"
  octx.fillRect(0, 0, wCss, hCss)
  octx.drawImage(img, dx, dy, dw, dh)

  let imageData: ImageData
  try {
    imageData = octx.getImageData(0, 0, W, H)
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[HomeParticleLogoHero] getImageData (dark pass) failed:", e)
    }
    return []
  }

  const out: Array<{ x: number; y: number }> = []
  const data = imageData.data
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      if (r + g + b <= FALLBACK_DARK_SUM) {
        out.push({ x, y })
      }
    }
  }
  return out
}

/**
 * Detect the polarity of a source image by sampling the average brightness across the
 * drawn area on a NEUTRAL-grey background. Returns "bright" (white-on-dark logos like
 * sc-prints) or "dark" (dark-on-white logos). Used to auto-route to the right candidate
 * pass without requiring per-image preprocessing.
 */
function detectImagePolarity(
  W: number,
  H: number,
  dpr: number,
  img: CanvasImageSource,
  wCss: number,
  hCss: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number
): "bright" | "dark" {
  const off = document.createElement("canvas")
  off.width = W
  off.height = H
  const octx = off.getContext("2d", { alpha: true })
  if (!octx) {
    return "bright"
  }
  octx.setTransform(1, 0, 0, 1, 0, 0)
  octx.scale(dpr, dpr)
  /** Mid-grey reference background. If the drawn image leaves more bright-than-grey
   * pixels behind, it's "dark ink on light bg" → use dark pass. Otherwise → bright pass. */
  octx.fillStyle = "#808080"
  octx.fillRect(0, 0, wCss, hCss)
  octx.drawImage(img, dx, dy, dw, dh)
  let imageData: ImageData
  try {
    imageData = octx.getImageData(0, 0, W, H)
  } catch {
    return "bright"
  }
  const data = imageData.data
  let bright = 0
  let dark = 0
  /** Stride-sample for speed — every 4th pixel in each direction is plenty. */
  const stride = 4
  for (let y = 0; y < H; y += stride) {
    for (let x = 0; x < W; x += stride) {
      const i = (y * W + x) * 4
      const sum = data[i]! + data[i + 1]! + data[i + 2]!
      if (sum > 480) bright++
      else if (sum < 240) dark++
    }
  }
  /** If the image has more dark-than-grey pixels after drawing on grey, the source's
   * "ink" is dark — use the dark pass. Otherwise default to bright. */
  return dark > bright ? "dark" : "bright"
}

/**
 * Bitmap-space particles; position integrated in the RAF loop (or kinematic entrance).
 */
type ParallaxParticle = {
  hx: number
  hy: number
  x: number
  y: number
  vx: number
  vy: number
  radiusCss: number
  baseAlpha: number
  fromLogoMask: boolean
  /** Top-left spawn for entrance lerp. */
  spawnX: number
  spawnY: number
  /**
   * 0 = screen bottom-right priority (starts moving first); 1 = top-left (starts last).
   */
  entranceStagger: number
  /** Multiplies drawn opacity during entrance (0…1). */
  entranceOpacity: number
  /** Black hole: was inside capture disk (geom) last frame — exit edge starts trail. */
  bhPrevInRadius: boolean
  /** Color-invert mix (0 = original gradient color, 1 = fully inverted RGB).
   * Driven toward 1 when particle is captured / in wake state (SNAP sets instantly,
   * FADE eases over captureColorInvertFadeMs); always eases back toward 0 over the
   * home-return duration once the particle is no longer captured. */
  captureColorMix?: number
  /** Whether THIS particle won the dice roll on its most recent capture and is
   * therefore in the inverted+glowing subset. Set on capture, cleared when
   * captureColorMix returns to 0. Particles that are captured but did NOT win
   * the roll keep their gradient color throughout. */
  captureColorInvertSelected?: boolean
  /** Black hole: `performance.now()` deadline for escort-toward-cursor; null if inactive. */
  bhTrailUntilMs: number | null
  /** Viscous coffee wake pool only: unit tangent along stroke at this particle’s trail slot. */
  wakeTx?: number
  wakeTy?: number
  /** Newmix: arc-length along the trail (bitmap px from oldest end) where this particle was released. */
  newmixTrailArc?: number
  /** Newmix: lateral offset along the trail normal at the release slot, preserved across frames. */
  newmixLateral?: number
  /** Newmix: cursor position at release frame (bitmap px). Used to advect the particle by
   * the cursor's net displacement so it traces the exact path the cursor draws. */
  newmixCursorOriginX?: number
  newmixCursorOriginY?: number
  /** Newmix: home position snapshot at release (so we lerp back to logo home, not a moving target). */
  newmixHomeAtReleaseX?: number
  newmixHomeAtReleaseY?: number
  /** Newmix: position snapshot at the moment the wake timer expired (start of home return). */
  newmixHomeReturnFromX?: number
  newmixHomeReturnFromY?: number
  /** Newmix: wall-clock when home return started (used for ease-out timing along the curved path). */
  newmixHomeReturnStartMs?: number
  /** Newmix: swirl side at capture (-1 or +1). Locked through the wake so left-swirled
   * particles trail the left side of the cursor path, right-swirled particles trail the right. */
  newmixSwirlSide?: number
  /** Vortex influence (0..1). Set by `applyDualVortexImpulse` whenever a
   * particle receives tangential force; decays each frame. Used to suppress
   * the home spring so the orbital motion has time to develop into a visible
   * curl before the spring snaps the particle back home. */
  newmixVortexSuppress?: number
  /** Capture-orbit-release: when a particle enters a vortex zone, it gets
   * locked onto a circular orbit around that vortex's centre. Position is
   * SET each frame from the orbital math (no force / spring / friction).
   * On expiry the particle is released into the wake. */
  newmixVortexLockUntil?: number
  /** Which vortex captured this particle: -1 (left) or +1 (right). */
  newmixVortexSide?: number
  /** Current angle of the orbit (radians, world frame). Advances each frame. */
  newmixVortexAngle?: number
  /** Orbital radius (preserved from capture so the particle stays on a
   * stable circle as the centre translates with the cursor). */
  newmixVortexRadius?: number
  /** Offset from cursor to vortex centre at capture time (frozen). Each
   * frame, vortex centre = cursor + this offset, so the orbital path
   * smoothly follows the cursor as it moves. */
  newmixVortexOffsetX?: number
  newmixVortexOffsetY?: number
  /** Cursor unit-velocity direction at capture time. Used as the major-axis
   * direction for the elliptical orbit so curls stretch along the cursor's
   * motion direction (the natural "spoon-trail" elongation). */
  newmixVortexAxisX?: number
  newmixVortexAxisY?: number
}

type LogoInteractBounds = {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

function logoHomeBounds(particles: ParallaxParticle[]): LogoInteractBounds | null {
  if (particles.length === 0) {
    return null
  }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of particles) {
    const hx = Number.isFinite(p.hx) ? p.hx : 0
    const hy = Number.isFinite(p.hy) ? p.hy : 0
    minX = Math.min(minX, hx)
    minY = Math.min(minY, hy)
    maxX = Math.max(maxX, hx)
    maxY = Math.max(maxY, hy)
  }
  return { minX, minY, maxX, maxY }
}

function pointerInLogoBoundsPad(
  mx: number,
  my: number,
  b: LogoInteractBounds | null,
  pad: number
): boolean {
  if (b == null || !Number.isFinite(mx) || !Number.isFinite(my)) {
    return false
  }
  return (
    mx >= b.minX - pad &&
    mx <= b.maxX + pad &&
    my >= b.minY - pad &&
    my <= b.maxY + pad
  )
}

function pointerNearStippleHome(
  mx: number,
  my: number,
  particles: ParallaxParticle[] | null,
  radius: number
): boolean {
  if (
    particles == null ||
    particles.length === 0 ||
    !Number.isFinite(mx) ||
    !Number.isFinite(my)
  ) {
    return false
  }
  const r2 = radius * radius
  for (const p of particles) {
    const hx = Number.isFinite(p.hx) ? p.hx : 0
    const hy = Number.isFinite(p.hy) ? p.hy : 0
    const dx = mx - hx
    const dy = my - hy
    if (dx * dx + dy * dy <= r2) {
      return true
    }
  }
  return false
}

function pointerInStippleInteractionRange(
  mx: number,
  my: number,
  bounds: LogoInteractBounds | null,
  particles: ParallaxParticle[] | null,
  proximityRadius: number
): boolean {
  if (!pointerInLogoBoundsPad(mx, my, bounds, proximityRadius)) {
    return false
  }
  return pointerNearStippleHome(mx, my, particles, proximityRadius)
}

function canvasScale(canvas: HTMLCanvasElement) {
  const cw = canvas.clientWidth
  const ch = canvas.clientHeight
  const sx = canvas.width / Math.max(1, cw)
  const sy = canvas.height / Math.max(1, ch)
  return { sx, sy }
}

/** Same `dpr` and `w × h` box as `build()` so pointer maps to particle bitmap pixels. */
function backingDpr() {
  return Math.min(window.devicePixelRatio ?? 1, 2)
}

function viewportBox() {
  const wBox = Math.max(120, Math.floor(window.innerWidth))
  const hBox = Math.max(120, Math.floor(window.innerHeight))
  return { wBox, hBox }
}

/**
 * Client px → canvas backing-store px. Uses `getBoundingClientRect()` when the canvas exists.
 * Parallax is applied in physics (`mouseX`/`mouseY`) and in `drawLayer` via `ctx.translate`, not via CSS.
 */
function clientToBitmapViewport(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement | null
): { x: number; y: number } {
  if (canvas && canvas.width > 0 && canvas.height > 0) {
    const rect = canvas.getBoundingClientRect()
    const rw = Math.max(1, rect.width)
    const rh = Math.max(1, rect.height)
    return {
      x: ((clientX - rect.left) / rw) * canvas.width,
      y: ((clientY - rect.top) / rh) * canvas.height,
    }
  }
  const iw = Math.max(1, window.innerWidth)
  const ih = Math.max(1, window.innerHeight)
  const dpr = backingDpr()
  const W = Math.max(1, Math.round(iw * dpr))
  const H = Math.max(1, Math.round(ih * dpr))
  return {
    x: (clientX / iw) * W,
    y: (clientY / ih) * H,
  }
}

function easeOutCubic(t: number): number {
  const u = Math.max(0, Math.min(1, t))
  return 1 - Math.pow(1 - u, 3)
}

/** Radial push + tangential swirl toward `PUSH_FORCE` / `SWIRL_FORCE` (scaled). */
function applyRadialSwirlImpulse(
  p: ParallaxParticle,
  cx: number,
  cy: number,
  radius: number,
  impulseMul: number,
  swirlScale = 1
): void {
  if (cx <= -9000 || impulseMul <= 0 || radius <= 0) {
    return
  }
  const dx = p.x - cx
  const dy = p.y - cy
  const dist = Math.hypot(dx, dy)
  if (dist >= radius || dist < PHYSICS_DIST_EPSILON) {
    return
  }
  const t = (radius - dist) / radius
  const falloff = Math.pow(
    Math.max(0, Math.min(1, t)),
    PUSH_REPULSE_FALLOFF_POWER
  )
  const f = falloff * impulseMul
  const inv = 1 / dist
  const ux = dx * inv
  const uy = dy * inv
  const sF = SWIRL_FORCE * swirlScale
  p.vx += (ux * PUSH_FORCE + uy * sF) * f
  p.vy += (uy * PUSH_FORCE - ux * sF) * f
}

/** Inward pull + accretion swirl + inner ring so particles orbit the cursor instead of collapsing. */
function applyBlackHoleImpulse(
  p: ParallaxParticle,
  cx: number,
  cy: number,
  radius: number
): void {
  if (cx <= -9000 || radius <= 0) {
    return
  }
  const dx = p.x - cx
  const dy = p.y - cy
  const dist = Math.hypot(dx, dy)
  if (dist >= radius) {
    return
  }
  if (dist < PHYSICS_DIST_EPSILON) {
    return
  }
  const inv = 1 / dist
  const ux = dx * inv
  const uy = dy * inv
  const edge = (radius - dist) / radius
  const falloff = Math.pow(
    Math.max(0, Math.min(1, edge)),
    PUSH_REPULSE_FALLOFF_POWER
  )
  const pull = BLACK_HOLE_PULL_FORCE * falloff
  p.vx -= ux * pull
  p.vy -= uy * pull
  const sw = SWIRL_FORCE * BLACK_HOLE_SWIRL_MULT * falloff
  p.vx += uy * sw
  p.vy -= ux * sw
  if (dist < BLACK_HOLE_RING_HOLD_DIST_BMP) {
    const ringU =
      1 -
      dist /
        Math.max(PHYSICS_DIST_EPSILON * 10, BLACK_HOLE_RING_HOLD_DIST_BMP)
    const ring = BLACK_HOLE_RING_PUSH * ringU * ringU
    p.vx += ux * ring
    p.vy += uy * ring
  }
}

/** Weak steering for particles outside the capture disk during trail-follow window. */
function applyBlackHoleTrailFollow(
  p: ParallaxParticle,
  cx: number,
  cy: number
): void {
  if (cx <= -9000) {
    return
  }
  const dx = cx - p.x
  const dy = cy - p.y
  const dist = Math.hypot(dx, dy)
  if (dist < PHYSICS_DIST_EPSILON) {
    return
  }
  const inv = 1 / dist
  const a = BLACK_HOLE_TRAIL_FOLLOW_ACCEL
  p.vx += dx * inv * a
  p.vy += dy * inv * a
}

/**
 * Newmix mode: direction-aware capture impulse. Counter-rotating side swirl based on which
 * side of the smoothed motion vector the particle sits on. Mild front push and back inward
 * pinch shape the wake. Stationary mouse (`gmag < 1e-5`) becomes a passive collector — no
 * swirl until motion arrives, which arms the trail-follow on the next exit frame.
 */
function applyNewmixCaptureImpulse(
  p: ParallaxParticle,
  cx: number,
  cy: number,
  radius: number,
  gx: number,
  gy: number,
  /** Mouse speed (bitmap px / frame). Forces fade to zero below `motionGateSpeed`. */
  mouseSpeed: number,
  t: NewmixLiveTuning,
  /** When provided AND `t.fieldDrivenCursor > 0.5`, the computed cursor
   * impulse is INJECTED INTO THE FIELD at the particle's location instead of
   * applied to the particle directly. Newmix-style: cursor pushes the field,
   * particles then read the field bilinearly elsewhere in the loop. */
  fieldForInjection: VelocityField | null = null
): void {
  if (cx <= -9000 || radius <= 0) {
    return
  }
  const dx = p.x - cx
  const dy = p.y - cy
  const dist = Math.hypot(dx, dy)
  if (dist >= radius || dist < PHYSICS_DIST_EPSILON) {
    return
  }
  const gmag = Math.hypot(gx, gy)
  if (gmag < 1e-5) {
    return
  }
  const ux = dx / dist
  const uy = dy / dist
  const edge = (radius - dist) / radius
  const falloff = Math.pow(
    Math.max(0, Math.min(1, edge)),
    t.falloffPower
  )
  const fxf = gx / gmag
  const fyf = gy / gmag
  const rx = -fyf
  const ry = fxf
  const along = dx * fxf + dy * fyf
  const perp = dx * rx + dy * ry
  const alongN = along / radius

  const ccwX = -uy
  const ccwY = ux
  /** Particle on right of motion (perp > 0) sweeps one way; left sweeps the other.
   * Persist this sign on the particle so the wake can route it to the correct side. */
  const vSgn = perp >= 0 ? -1 : 1
  p.newmixSwirlSide = vSgn
  const tvx = vSgn * ccwX
  const tvy = vSgn * ccwY

  let ax = 0
  let ay = 0

  /** Wider Gaussian than viscous (0.7 vs 0.52) so the swirl spans most of the disk. */
  const sideGauss = Math.exp(-Math.pow(alongN / 0.7, 2))
  const sideSw = t.sideSwirlForce * falloff * sideGauss
  ax += tvx * sideSw
  ay += tvy * sideSw

  if (alongN > 0.07) {
    const cap = Math.min(1, (alongN - 0.07) / 0.5)
    const push = t.frontPush * falloff * cap
    ax += ux * push
    ay += uy * push
    /** Leading-edge radial-inward pull: gather particles into the path before they get
     * deflected. Active only on the front-facing side and stronger near the disk perimeter
     * (where particles enter), so dots are reeled in toward the cursor as it approaches. */
    const rim = Math.max(0, Math.min(1, dist / radius))
    const pullStrength = t.leadingEdgePullForce * cap * rim
    ax -= ux * pullStrength
    ay -= uy * pullStrength
  }

  if (alongN < -0.04) {
    const back = Math.min(1, -alongN / 0.62)
    const inward = t.backInward * falloff * back
    ax -= ux * inward
    ay -= uy * inward
  }

  /** Core ejection: in the inner fraction of the disk, apply strong radial-outward push
   * so the very center stays visibly empty. Strength ramps from 0 at the boundary to
   * full at the cursor center. */
  const coreR = radius * t.coreEjectionRadiusFrac
  if (dist < coreR && coreR > 1e-5) {
    const coreU = 1 - dist / coreR
    const eject = t.coreEjectionForce * coreU * coreU
    ax += ux * eject
    ay += uy * eject
  }

  /** Motion gate: when the cursor is barely moving, scale all impulse to zero so particles
   * don't accumulate orbital velocity into a persistent halo. */
  const motionScale = Math.max(
    0,
    Math.min(1, mouseSpeed / Math.max(0.01, t.motionGateSpeed))
  )
  /** Cursor-force speed coupling: blends a constant force (coupling=0) with a
   * fully speed-coupled force (coupling=1, scaled by mouseSpeed/refSpeed).
   * Produces the "slow drag = gentle, flick = chaotic" feel. */
  const speedCouplingMult =
    t.cursorForceSpeedCoupling > 0
      ? (1 - t.cursorForceSpeedCoupling) +
        t.cursorForceSpeedCoupling *
          (mouseSpeed / Math.max(0.01, t.cursorForceSpeedReference))
      : 1
  /** Asymmetric paddling — bias force toward broadside particles (perp to
   * motion), away from particles in line with the heading. `alongN` is the
   * along-axis projection of (particle - cursor) over `radius`, so its
   * absolute value runs 0 at broadside, ~1 at front/back tips. cos² weight
   * is `1 - alongN²`, blended with 1 at sharpness=0. */
  const paddleMult =
    t.paddleSharpness > 0
      ? 1 -
        t.paddleSharpness *
          Math.min(1, alongN * alongN)
      : 1
  /** Crema mass — foam particles react more strongly. Foam status is
   * deterministically hash-derived from the home position so it persists
   * across frames; raising/lowering `foamFraction` just shifts the cutoff. */
  let massMult = 1
  if (t.foamFraction > 0 && t.foamForceMultiplier !== 1) {
    const hashSrc =
      ((p.hx | 0) * 374761393) ^ ((p.hy | 0) * 668265263)
    const foamRoll = ((hashSrc >>> 0) & 0xffffff) / 0xffffff
    if (foamRoll < t.foamFraction) {
      massMult = t.foamForceMultiplier
    }
  }
  const finalScale = motionScale * speedCouplingMult * paddleMult * massMult
  /** Two interaction modes:
   *
   * 1. **Field-driven cursor (Newmix style).** When `fieldDrivenCursor` is on,
   *    the velocity field is the SINGLE source of cursor influence: the
   *    per-frame `injectVelocity()` call splats cursor velocity into cells
   *    around the cursor with a 1/r-style falloff, particles read the field
   *    bilinearly later in the loop, pressure projection holds the curl
   *    shape. There is NO per-particle cursor impulse — that would deposit
   *    a second, fragmented force into individual cells and fight pressure
   *    projection, which empirically smears rings into a diffuse halo.
   *    So we skip both the field deposit and the particle deposit here.
   *
   * 2. **Direct cursor push (legacy).** When `fieldDrivenCursor` is off, the
   *    cursor's swirl/push profile (sideSwirl + frontPush + backInward, etc.)
   *    is applied directly to particle velocity. Used by older modes.
   *
   * `fieldForInjection` is only forwarded to keep the call site shape stable;
   * we no longer write to it (kept as a parameter so future changes can
   * re-enable the per-particle deposit if needed). */
  void fieldForInjection
  if (t.fieldDrivenCursor > 0.5 && t.fieldStrength > 0) {
    /** Skip — bulk inject is the sole cursor → field path. */
    return
  }
  p.vx += ax * finalScale
  p.vy += ay * finalScale
}

/**
 * Capture-orbit-release vortex pair. Two virtual rotation centres are placed
 * perpendicular to the cursor's motion direction (one on each side, optionally
 * offset along/behind by `vortexLagBmp`). Particles entering either zone are
 * CAPTURED — locked onto a circular orbital path around that vortex centre.
 * Each frame the integration loop sets the particle's position directly from
 * the orbital math (no force / friction / spring). After
 * `vortexCaptureDurationMs`, the lock expires and the particle is released
 * into the wake on the swirl side it was captured from.
 *
 * The vortex centre offset relative to the cursor is FROZEN at capture time,
 * so the orbital path translates with the cursor (smooth) without re-aiming
 * if the cursor's velocity direction changes mid-spin.
 */
/**
 * Continuous force-based dual vortex (Newmix-style). Adds a tangential force
 * to particles inside either vortex zone. Force magnitude follows a BELL
 * CURVE over cursor speed: zero at standstill, peak at moderate speed, fades
 * at high speed. This produces the natural "vortex emerges from cursor
 * disturbance, then dissolves into a push wake" behavior — no discrete
 * capture / lock, just fluid forces.
 *
 *   bell(s) = (s/sPeak) * exp(1 - s/sPeak)
 *   at s = 0     → 0       (no motion = no vortex)
 *   at s = sPeak → 1       (peak curl)
 *   at s = 4·sPeak → ~0.07 (faded — cursor just plows through)
 */
function applyDualVortexImpulse(
  p: ParallaxParticle,
  cx: number,
  cy: number,
  velUx: number,
  velUy: number,
  mouseSpeed: number,
  t: NewmixLiveTuning
): void {
  if (t.vortexStrength <= 0 || t.vortexRadiusBmp <= 0) return
  if (cx <= -9000) return
  const speedMag = Math.hypot(velUx, velUy)
  if (speedMag < 1e-5) return
  const ux = velUx / speedMag
  const uy = velUy / speedMag
  const perpX = -uy
  const perpY = ux
  const off = t.vortexOffsetBmp
  const lag = t.vortexLagBmp
  const loffX = perpX * off + ux * lag
  const loffY = perpY * off + uy * lag
  const roffX = -perpX * off + ux * lag
  const roffY = -perpY * off + uy * lag
  const R = t.vortexRadiusBmp
  /** Speed bell — peak at vortexSpeedReference, fades at high speeds. */
  const s = mouseSpeed / Math.max(0.01, t.vortexSpeedReference)
  const bell = s * Math.exp(1 - s)
  if (bell < 1e-3) return
  const apply = (offX: number, offY: number, rotSign: number): void => {
    const vx = cx + offX
    const vy = cy + offY
    const dxv = p.x - vx
    const dyv = p.y - vy
    const distV = Math.hypot(dxv, dyv)
    if (distV >= R || distV < PHYSICS_DIST_EPSILON) return
    const fall = Math.pow(1 - distV / R, t.vortexFalloffPower)
    /** Tangent = perp(radial) · rotSign — left vortex CW (-1), right CCW (+1). */
    const radialUx = dxv / distV
    const radialUy = dyv / distV
    const tangX = -radialUy * rotSign
    const tangY = radialUx * rotSign
    const force = t.vortexStrength * fall * bell
    p.vx += tangX * force
    p.vy += tangY * force
    /** Suppress spring while inside vortex zone so tangential motion can
     * develop into a visible curl rather than getting yanked back home. */
    p.newmixVortexSuppress = Math.max(p.newmixVortexSuppress ?? 0, fall * bell)
  }
  apply(loffX, loffY, -1)
  apply(roffX, roffY, 1)
}

function applyDualVortexCapture(
  p: ParallaxParticle,
  cx: number,
  cy: number,
  velUx: number,
  velUy: number,
  mouseSpeed: number,
  nowTick: number,
  t: NewmixLiveTuning,
  rand01: number
): void {
  if (t.vortexStrength <= 0 || t.vortexRadiusBmp <= 0) return
  if (cx <= -9000) return
  /** Already locked on an orbit — let the integration branch handle it. */
  if (
    p.newmixVortexLockUntil != null &&
    nowTick < p.newmixVortexLockUntil
  ) {
    return
  }
  const speedMag = Math.hypot(velUx, velUy)
  if (speedMag < 1e-5) return
  const ux = velUx / speedMag
  const uy = velUy / speedMag
  const perpX = -uy
  const perpY = ux
  const lag = t.vortexLagBmp
  const off = t.vortexOffsetBmp
  /** Left and right vortex offsets from cursor. */
  const loffX = perpX * off + ux * lag
  const loffY = perpY * off + uy * lag
  const roffX = -perpX * off + ux * lag
  const roffY = -perpY * off + uy * lag
  const R = t.vortexRadiusBmp
  const motionScale = Math.max(
    0,
    Math.min(1, mouseSpeed / Math.max(0.01, t.motionGateSpeed))
  )
  if (motionScale < 0.05) return
  /** Try to capture into one of the two vortices. Capture probability gates
   * how many particles get locked — at <1, some particles stream past the
   * vortex zone instead of getting captured (gives a sparser, less crowded
   * orbital field). */
  const tryCapture = (
    offX: number,
    offY: number,
    rotSign: number
  ): boolean => {
    const vx = cx + offX
    const vy = cy + offY
    const dxv = p.x - vx
    const dyv = p.y - vy
    const distV = Math.hypot(dxv, dyv)
    if (distV >= R || distV < PHYSICS_DIST_EPSILON) return false
    /** Probability gate. Foam particles are lighter — multiply their effective
     * capture probability by `foamForceMultiplier` so they get sucked into
     * eddies first while heavier particles swing wide. */
    let effectiveCaptureProb = t.vortexCaptureProbability
    if (t.foamFraction > 0 && t.foamForceMultiplier !== 1) {
      const fhSrc =
        ((p.hx | 0) * 374761393) ^ ((p.hy | 0) * 668265263)
      const fRoll = ((fhSrc >>> 0) & 0xffffff) / 0xffffff
      if (fRoll < t.foamFraction) {
        effectiveCaptureProb = Math.min(
          1,
          effectiveCaptureProb * t.foamForceMultiplier
        )
      }
    }
    if (rand01 > effectiveCaptureProb) return false
    /** Lock the particle onto an orbit around this vortex centre. The orbit
     * angle is expressed in the cursor's motion frame: 0 rad = along the
     * cursor's heading (major axis); π/2 = perpendicular (minor axis). */
    const dxAxis = dxv * ux + dyv * uy
    const dxPerp = dxv * perpX + dyv * perpY
    p.newmixVortexLockUntil = nowTick + t.vortexCaptureDurationMs
    p.newmixVortexSide = rotSign
    p.newmixVortexAngle = Math.atan2(dxPerp, dxAxis)
    p.newmixVortexRadius = distV
    p.newmixVortexOffsetX = offX
    p.newmixVortexOffsetY = offY
    /** Freeze the cursor's unit-velocity direction at capture as the major
     * axis of the elliptical orbit so the orbit doesn't re-aim mid-spin if
     * the cursor changes direction. */
    p.newmixVortexAxisX = ux
    p.newmixVortexAxisY = uy
    /** Stamp suppression so the spring stays off if anything else samples it. */
    p.newmixVortexSuppress = 1
    return true
  }
  /** Try left vortex first; if particle is in the right zone, try that instead. */
  if (!tryCapture(loffX, loffY, -1)) {
    tryCapture(roffX, roffY, 1)
  }
}

/**
 * Per-frame integration for vortex-locked particles. Sets position directly
 * from the orbital math: vortex centre = cursor + frozen offset; particle
 * position = centre + (radius·cos(angle), radius·sin(angle)); angle advances
 * by `vortexOrbitSpeedDegPerSec`. Returns `true` if the particle is still
 * locked, `false` if the lock just expired (caller should release into wake).
 */
function integrateVortexOrbit(
  p: ParallaxParticle,
  cx: number,
  cy: number,
  nowTick: number,
  dtMs: number,
  mouseSpeed: number,
  t: NewmixLiveTuning
): boolean {
  if (
    p.newmixVortexLockUntil == null ||
    nowTick >= p.newmixVortexLockUntil
  ) {
    return false
  }
  const offX = p.newmixVortexOffsetX ?? 0
  const offY = p.newmixVortexOffsetY ?? 0
  const radius = p.newmixVortexRadius ?? 0
  const side = p.newmixVortexSide ?? 1
  let angle = p.newmixVortexAngle ?? 0
  /** Speed-coupled angular velocity: orbit pace scales with cursor speed
   * (faster cursor → faster spin; slow cursor → slow spin), matching
   * Newmix's physics-driven feel. Clamped so a still cursor doesn't fully
   * freeze and a flick doesn't make particles teleport. */
  const speedRef = Math.max(0.01, t.vortexSpeedReference)
  /** No lower clamp: when the cursor stops, the orbit stops too — that's the
   * physics-driven feel the user is asking for. Upper clamp prevents flicks
   * from teleporting particles around the orbit. */
  const speedScale = Math.min(4, mouseSpeed / speedRef)
  const angSpeedRadPerMs =
    (t.vortexOrbitSpeedDegPerSec * Math.PI) / 180 / 1000
  /** `rotSign = side`: -1 for left vortex (CW), +1 for right vortex (CCW). */
  angle += angSpeedRadPerMs * speedScale * dtMs * side
  p.newmixVortexAngle = angle
  /** Vortex centre = cursor + frozen offset (so the path follows the cursor). */
  const vx = cx + offX
  const vy = cy + offY
  /** Elliptical orbit aligned with the cursor's heading at capture time:
   * major axis = stored unit-velocity direction; minor axis = perpendicular.
   * This produces oval curls stretched along the motion direction (matches
   * the elongated spoon-trail vortices in Newmix). */
  const axisX = p.newmixVortexAxisX ?? 1
  const axisY = p.newmixVortexAxisY ?? 0
  const perpAxisX = -axisY
  const perpAxisY = axisX
  const aspect = Math.max(1, t.vortexEllipseAspect)
  /** Preserve overall orbit "size" but stretch along major axis: major =
   * radius·√aspect, minor = radius/√aspect. */
  const sqrtA = Math.sqrt(aspect)
  const majorR = radius * sqrtA
  const minorR = radius / sqrtA
  const cosA = Math.cos(angle) * majorR
  const sinA = Math.sin(angle) * minorR
  p.x = vx + axisX * cosA + perpAxisX * sinA
  p.y = vy + axisY * cosA + perpAxisY * sinA
  p.vx = 0
  p.vy = 0
  return true
}

/**
 * Look up the cursor's recorded position at a given wall-clock timestamp by linear
 * interpolation between the two surrounding history samples. Returns null if the buffer
 * is empty or the timestamp is past the newest sample (caller should treat as "caught up").
 */
function lookupCursorHistoryAtTime(
  history: Array<{ x: number; y: number; t: number }>,
  targetTime: number
): { x: number; y: number; pastHead: boolean } | null {
  const n = history.length
  if (n === 0) {
    return null
  }
  const head = history[n - 1]!
  if (targetTime >= head.t) {
    return { x: head.x, y: head.y, pastHead: true }
  }
  const tail = history[0]!
  if (targetTime <= tail.t) {
    return { x: tail.x, y: tail.y, pastHead: false }
  }
  /** Binary search for the segment containing targetTime. */
  let lo = 0
  let hi = n - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >>> 1
    if (history[mid]!.t <= targetTime) {
      lo = mid
    } else {
      hi = mid
    }
  }
  const a = history[lo]!
  const b = history[hi]!
  const span = b.t - a.t
  const u = span > 1e-6 ? (targetTime - a.t) / span : 0
  return {
    x: a.x + (b.x - a.x) * u,
    y: a.y + (b.y - a.y) * u,
    pastHead: false,
  }
}

/**
 * Walk the trail polyline starting from the head (newest sample, cursor side) backward
 * along older segments by `arcFromHead` bitmap pixels. Returns the world position and the
 * local tangent (pointing from older → newer, i.e. the direction the mouse moved).
 * If `arcFromHead` exceeds the trail's total length, returns the oldest sample.
 */
function pointAlongTrailFromHead(
  trail: Array<{ x: number; y: number }>,
  arcFromHead: number
): { x: number; y: number; tx: number; ty: number } | null {
  const n = trail.length
  if (n === 0) {
    return null
  }
  if (n === 1) {
    return { x: trail[0]!.x, y: trail[0]!.y, tx: 1, ty: 0 }
  }
  let remaining = Math.max(0, arcFromHead)
  for (let i = n - 1; i > 0; i--) {
    const b = trail[i]!
    const a = trail[i - 1]!
    const dx = b.x - a.x
    const dy = b.y - a.y
    const segLen = Math.hypot(dx, dy)
    if (segLen <= 1e-6) {
      continue
    }
    if (remaining <= segLen) {
      const u = remaining / segLen
      const tx = dx / segLen
      const ty = dy / segLen
      return {
        x: b.x - dx * u,
        y: b.y - dy * u,
        tx,
        ty,
      }
    }
    remaining -= segLen
  }
  const a = trail[0]!
  const b = trail[1]!
  const dx = b.x - a.x
  const dy = b.y - a.y
  const segLen = Math.hypot(dx, dy)
  const tx = segLen > 1e-6 ? dx / segLen : 1
  const ty = segLen > 1e-6 ? dy / segLen : 0
  return { x: a.x, y: a.y, tx, ty }
}

function closestPointOnSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): { cx: number; cy: number; t: number; dist: number } {
  const abx = bx - ax
  const aby = by - ay
  const apx = px - ax
  const apy = py - ay
  const ab2 = abx * abx + aby * aby
  let t =
    ab2 > 1e-10 ? (apx * abx + apy * aby) / ab2 : 0
  t = Math.max(0, Math.min(1, t))
  const cx = ax + t * abx
  const cy = ay + t * aby
  const dx = px - cx
  const dy = py - cy
  return { cx, cy, t, dist: Math.hypot(dx, dy) }
}

/** Viscous stroke: drag along path tangent + normal shear from each segment (coffee remembers spoon). */
function applyViscousCoffeeAlongPath(
  p: ParallaxParticle,
  trail: Array<{ x: number; y: number }>,
  t: ViscousCoffeeLiveTuning
): void {
  if (trail.length < 2) {
    return
  }
  const n = trail.length
  const R = t.lineRadiusBmp
  for (let i = 0; i < n - 1; i++) {
    const a = trail[i]!
    const b = trail[i + 1]!
    const minX = Math.min(a.x, b.x) - R
    const maxX = Math.max(a.x, b.x) + R
    const minY = Math.min(a.y, b.y) - R
    const maxY = Math.max(a.y, b.y) + R
    if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) {
      continue
    }
    const { cx, cy, dist } = closestPointOnSegment(
      p.x,
      p.y,
      a.x,
      a.y,
      b.x,
      b.y
    )
    if (dist > R) {
      continue
    }
    const bx = b.x - a.x
    const by = b.y - a.y
    const segLen = Math.hypot(bx, by)
    if (segLen < 1e-5) {
      continue
    }
    const tx = bx / segLen
    const ty = by / segLen
    const nx = -ty
    const ny = tx
    const ageW = Math.pow(t.pathDecay, n - 2 - i)
    const edgeW = 1 - dist / R
    const w = ageW * edgeW * edgeW
    p.vx += tx * t.alongStrength * w
    p.vy += ty * t.alongStrength * w
    const side = (p.x - cx) * nx + (p.y - cy) * ny
    const sgn = side >= 0 ? 1 : -1
    p.vx += nx * t.shearStrength * w * sgn
    p.vy += ny * t.shearStrength * w * sgn
  }
}

/**
 * Spoon motion `gx,gy` (unit). Ahead of cursor: outward push. Sides: counter-rotating vortices.
 * Near outer shell: tangential “rim” flow. Behind: inward pinch, half-radius orbit, wash into wake.
 */
function applyViscousCoffeeSpoonField(
  p: ParallaxParticle,
  cx: number,
  cy: number,
  gx: number,
  gy: number,
  t: ViscousCoffeeLiveTuning
): void {
  const radius = t.dragRadius
  if (cx <= -9000 || radius <= 0) {
    return
  }
  const dx = p.x - cx
  const dy = p.y - cy
  const dist = Math.hypot(dx, dy)
  if (dist >= radius || dist < PHYSICS_DIST_EPSILON) {
    return
  }
  const ux = dx / dist
  const uy = dy / dist
  const edge = (radius - dist) / radius
  const falloff = Math.pow(
    Math.max(0, Math.min(1, edge)),
    t.spoonRepulseFalloffPower
  )

  const gmag = Math.hypot(gx, gy)
  let fxf = gx
  let fyf = gy
  if (gmag < 1e-5) {
    fxf = 1
    fyf = 0
  } else {
    fxf /= gmag
    fyf /= gmag
  }
  const rx = -fyf
  const ry = fxf
  const along = dx * fxf + dy * fyf
  const perp = dx * rx + dy * ry
  const invR = 1 / radius
  const alongN = along * invR

  const ccwX = -uy
  const ccwY = ux
  /** Upper side of stroke → CCW; lower → CW for typical horizontal passes. */
  const vSgn = perp >= 0 ? -1 : 1
  const tvx = vSgn * ccwX
  const tvy = vSgn * ccwY

  let ax = 0
  let ay = 0

  if (alongN > 0.07) {
    const cap = Math.min(1, (alongN - 0.07) / 0.5)
    const push = t.spoonFrontPush * falloff * cap
    ax += ux * push
    ay += uy * push
  }

  const shell = Math.exp(
    -Math.pow((dist - radius * 0.9) / (radius * 0.15), 2)
  )
  const ringSw = t.spoonRingSwirl * falloff * shell
  ax += tvx * ringSw
  ay += tvy * ringSw

  const sideGauss = Math.exp(-Math.pow(alongN / 0.52, 2))
  const sideSw =
    t.spoonSideVortex *
    falloff *
    sideGauss *
    (0.28 + 0.72 * shell)
  ax += tvx * sideSw
  ay += tvy * sideSw

  if (alongN < -0.04) {
    const back = Math.min(1, -alongN / 0.62)
    const inward = t.spoonBackInward * falloff * back
    ax -= ux * inward
    ay -= uy * inward

    const halfR = radius * 0.5
    const radialErr = dist - halfR
    const orbitK =
      t.spoonHalfRadiusOrbit *
      falloff *
      back *
      Math.exp(-Math.pow(radialErr / (radius * 0.32), 2))
    const sre = radialErr >= 0 ? 1 : -1
    ax -= ux * orbitK * 0.45 * sre
    ay -= uy * orbitK * 0.45 * sre
    ax += tvx * orbitK
    ay += tvy * orbitK

    const wash = t.spoonBackWash * falloff * back
    ax -= fxf * wash
    ay -= fyf * wash
  }

  p.vx += ax
  p.vy += ay
}

function polylineTotalLength(
  trail: Array<{ x: number; y: number }>
): number {
  if (trail.length < 2) {
    return 0
  }
  let L = 0
  for (let i = 0; i < trail.length - 1; i++) {
    const a = trail[i]!
    const b = trail[i + 1]!
    L += Math.hypot(b.x - a.x, b.y - a.y)
  }
  return L
}

function createCoffeeWakeParticlePool(
  W: number,
  H: number,
  count: number
): ParallaxParticle[] {
  const cx = Math.max(0, Math.floor(W / 2))
  const cy = Math.max(0, Math.floor(H / 2))
  const out: ParallaxParticle[] = []
  for (let i = 0; i < count; i++) {
    out.push({
      hx: cx,
      hy: cy,
      x: cx,
      y: cy,
      radiusCss: PARTICLE_RADIUS_MIN_CSS,
      baseAlpha: 0,
      vx: 0,
      vy: 0,
      fromLogoMask: false,
      spawnX: cx,
      spawnY: cy,
      entranceStagger: 0,
      entranceOpacity: 1,
      bhPrevInRadius: false,
      bhTrailUntilMs: null,
      wakeTx: undefined,
      wakeTy: undefined,
    })
  }
  return out
}

/**
 * Wake dots sit on actual mouse samples from trail[0] (oldest) up to trail[lastIdx] (behind cursor).
 * Tangent push + index-based slots keep the ribbon glued to the path in motion.
 */
function assignCoffeeWakeTargets(
  wake: ParallaxParticle[],
  trail: Array<{ x: number; y: number }>,
  t: ViscousCoffeeLiveTuning
): void {
  const nW = wake.length
  if (nW === 0) {
    return
  }
  const n = trail.length
  if (n < 2) {
    for (const p of wake) {
      p.baseAlpha = 0
      p.wakeTx = undefined
      p.wakeTy = undefined
    }
    return
  }

  const back = Math.min(t.wakeTailBackSamples, Math.max(0, n - 2))
  let lastIdx = Math.max(1, n - 1 - back)
  lastIdx = Math.max(
    1,
    Math.min(
      lastIdx,
      Math.round((n - 1 - back) * t.wakeArcHeadKeep)
    )
  )

  const totalLen = polylineTotalLength(trail)
  const fadeLen = Math.min(1, totalLen / 12)
  const fadePts = Math.min(1, (n - 1) / 1.2)
  const alphaBase =
    PARTICLE_BASE_ALPHA * t.wakeAlphaMult * fadeLen * fadePts

  const denom = Math.max(1, nW - 1)
  const gamma = t.wakeArcDistribGamma
  for (let i = 0; i < nW; i++) {
    const p = wake[i]!
    const uLin = i / denom
    const u =
      gamma <= 0 ? uLin : Math.pow(Math.max(0, Math.min(1, uLin)), gamma)
    const idxF = u * lastIdx
    const i0 = Math.min(Math.floor(idxF), lastIdx - 1)
    const i1 = Math.min(i0 + 1, lastIdx)
    const w = idxF - i0
    const a = trail[i0]!
    const b = trail[i1]!
    const x = a.x + w * (b.x - a.x)
    const y = a.y + w * (b.y - a.y)
    const dx = b.x - a.x
    const dy = b.y - a.y
    const sl = Math.hypot(dx, dy)
    const tx = sl > 1e-6 ? dx / sl : 1
    const ty = sl > 1e-6 ? dy / sl : 0
    const nx = -ty
    const ny = tx
    const rng = ((i * 2654435761) >>> 0) / 4294967296
    const spread = (rng - 0.5) * 2 * t.wakeSpreadBmp
    p.hx = x + nx * spread
    p.hy = y + ny * spread
    p.wakeTx = tx
    p.wakeTy = ty
    p.baseAlpha = alphaBase
  }
}

function integrateCoffeeWakeParticles(
  wake: ParallaxParticle[],
  t: ViscousCoffeeLiveTuning
): void {
  const sk = t.wakeSpringStiffness
  const fk = t.wakeFriction
  const ad = t.wakeAlongDrag
  for (const p of wake) {
    if ((p.baseAlpha ?? 0) <= 1e-6) {
      p.vx = 0
      p.vy = 0
      continue
    }
    const tx = p.wakeTx
    const ty = p.wakeTy
    if (tx != null && ty != null && ad !== 0) {
      p.vx += tx * ad
      p.vy += ty * ad
    }
    p.vx += (p.hx - p.x) * sk
    p.vy += (p.hy - p.y) * sk
    p.vx *= fk
    p.vy *= fk
    p.x += p.vx
    p.y += p.vy
  }
}

/** `h` degrees [0,360); `s`,`l` in [0,1]. */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const hd = ((h % 360) + 360) % 360
  const hn = hd / 360
  if (s <= 0) {
    const x = Math.round(l * 255)
    return { r: x, g: x, b: x }
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    let u = t
    if (u < 0) u += 1
    if (u > 1) u -= 1
    if (u < 1 / 6) return p + (q - p) * 6 * u
    if (u < 1 / 2) return q
    if (u < 2 / 3) return p + (q - p) * (2 / 3 - u) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const r = hue2rgb(p, q, hn + 1 / 3)
  const g = hue2rgb(p, q, hn)
  const b = hue2rgb(p, q, hn - 1 / 3)
  return {
    r: Math.round(Math.max(0, Math.min(255, r * 255))),
    g: Math.round(Math.max(0, Math.min(255, g * 255))),
    b: Math.round(Math.max(0, Math.min(255, b * 255))),
  }
}

/** Screen-space diagonal rainbow from particle home; keeps hue stable while dots move. */
function rainbowRgbForHome(
  hx: number,
  hy: number,
  cw: number,
  ch: number
): { r: number; g: number; b: number } {
  const w = Math.max(1, cw - 1)
  const h = Math.max(1, ch - 1)
  const u = Math.max(0, Math.min(1, hx / w))
  const v = Math.max(0, Math.min(1, hy / h))
  const hue = 360 * (0.62 * u + 0.38 * v)
  return hslToRgb(hue, 0.9, 0.52)
}

/**
 * Pre-baked soft-edge particle sprite. A single offscreen canvas with a radial gradient
 * (white center → transparent edge) cached once and blitted per particle for the bloomed
 * "ink with grain" look. Cache is keyed on diameter so resizes regenerate it.
 */
let particleSpriteCache: {
  diameter: number
  canvas: HTMLCanvasElement
} | null = null

let particleSpriteBaseCache: {
  diameter: number
  canvas: HTMLCanvasElement
} | null = null

/** Wider, softer base sprite (3× diameter) used as the fill-layer in dual-pass rendering.
 * Has a much wider falloff so adjacent particles' base layers overlap heavily, filling
 * the gaps between centers with low-alpha ink to produce a solid stroke fill. */
function getParticleSpriteBase(
  diameter: number
): HTMLCanvasElement | null {
  const d = Math.max(1, Math.round(diameter))
  if (
    particleSpriteBaseCache != null &&
    particleSpriteBaseCache.diameter === d
  ) {
    return particleSpriteBaseCache.canvas
  }
  const spriteSize = d * 3
  const off = document.createElement("canvas")
  off.width = spriteSize
  off.height = spriteSize
  const sctx = off.getContext("2d", { alpha: true })
  if (!sctx) {
    return null
  }
  const center = spriteSize * 0.5
  const grad = sctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    center
  )
  /** Wider, softer falloff — nearly transparent at the core and zero at the edge. */
  grad.addColorStop(0, "rgba(255,255,255,1)")
  grad.addColorStop(0.5, "rgba(255,255,255,0.5)")
  grad.addColorStop(1, "rgba(255,255,255,0)")
  sctx.fillStyle = grad
  sctx.fillRect(0, 0, spriteSize, spriteSize)
  particleSpriteBaseCache = { diameter: d, canvas: off }
  return off
}

function getParticleSprite(diameter: number): HTMLCanvasElement | null {
  const d = Math.max(1, Math.round(diameter))
  if (
    particleSpriteCache != null &&
    particleSpriteCache.diameter === d
  ) {
    return particleSpriteCache.canvas
  }
  /** Sprite is 2× the requested diameter to leave room for the soft gradient falloff
   * to extend beyond the nominal "core" size. */
  const spriteSize = d * 2
  const off = document.createElement("canvas")
  off.width = spriteSize
  off.height = spriteSize
  const sctx = off.getContext("2d", { alpha: true })
  if (!sctx) {
    return null
  }
  const center = spriteSize * 0.5
  /** Inner stop: solid white core (~30% of sprite radius). Outer stop: transparent.
   * The mid-stop produces a smooth bloom without a hard inner edge. */
  const grad = sctx.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    center
  )
  grad.addColorStop(0, "rgba(255,255,255,1)")
  grad.addColorStop(0.35, "rgba(255,255,255,0.95)")
  grad.addColorStop(0.65, "rgba(255,255,255,0.4)")
  grad.addColorStop(1, "rgba(255,255,255,0)")
  sctx.fillStyle = grad
  sctx.fillRect(0, 0, spriteSize, spriteSize)
  particleSpriteCache = { diameter: d, canvas: off }
  return off
}

/** Parse a CSS hex colour ("#rrggbb" or "#rgb") into an RGB tuple. Returns white on parse failure. */
function parseHexColor(s: string): [number, number, number] {
  const v = s.trim()
  if (v.startsWith("#")) {
    const hex = v.slice(1)
    if (hex.length === 3) {
      const r = parseInt(hex[0]! + hex[0]!, 16)
      const g = parseInt(hex[1]! + hex[1]!, 16)
      const b = parseInt(hex[2]! + hex[2]!, 16)
      return [r, g, b]
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return [r, g, b]
    }
  }
  return [255, 255, 255]
}

function drawLayer(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  particles: ParallaxParticle[],
  sx: number,
  sy: number,
  mouseRef: { current: { x: number; y: number } },
  /** Multiply debug dot radius (use backing-store DPR). */
  debugDotDpr: number,
  /** Parallax offset in “CSS px” space: `T.x * PARALLAX_MULT_C` / `T.y * PARALLAX_MULT_C`. */
  parallaxX: number,
  parallaxY: number,
  /** When false, skip `translate` (reduced motion). */
  applyCanvasParallax: boolean,
  drawSizeBmp = PARTICLE_DRAW_SIZE_BMP,
  /** e.g. viscous-coffee stroke followers (drawn on top of logo stipple). */
  extraParticles?: ParallaxParticle[] | null,
  /** Alpha multiplier applied when a particle is in trailing state. <1 produces a
   * translucent ghostly wake so the wordmark remains visually dominant. */
  wakeAlphaMult = 1,
  /** When false, skip the soft base-sprite layer and draw only the core sprite. Produces
   * a sharper, less bloomed look — matches Newmix's crisp individual particles. */
  useDualPass = true,
  /** Optional linear gradient overlay applied to the rendered particle pixels via
   * `globalCompositeOperation = 'source-in'`. `angleDeg` follows CSS convention. */
  wordmarkGradient: { angleDeg: number; stops: string[] } | null = null,
  /** Per-particle alpha boost proportional to particle speed
   * (`hypot(vx, vy) * boost`, clamped to `boostCap`). Reproduces the
   * Newmix effect where moving particles read slightly brighter than
   * resting ones. 0 disables. */
  velocityAlphaBoost = 0,
  velocityAlphaBoostCap = 0.35,
  /** Brightness boost (0..1) applied to particles selected for color
   * inversion. Lifts both alpha and RGB toward white in proportion to
   * captureColorMix * boost so the inverted subset reads as glowing. */
  captureColorInvertGlowBoost = 0
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  /** Smoothing on so the soft sprite blits scale cleanly when the canvas is at a
   * non-integer DPR ratio. */
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"
  ctx.save()
  if (applyCanvasParallax) {
    ctx.translate(parallaxX * sx, parallaxY * sy)
  }
  const d = drawSizeBmp
  const bitmapW = canvas.width
  const bitmapH = canvas.height
  /** DUAL-PASS RENDERING:
   * Pass 1 (base layer): a larger sprite at low alpha that overlaps with neighbors,
   *   filling the black gaps between particle centers — produces solid "ink fill".
   * Pass 2 (core layer): the normal sprite at full alpha, keeping each dot's center crisp
   *   so individual grain is preserved at sparse regions.
   * Each particle is drawn twice; combined visual = ink with grain. */
  const sprite = getParticleSprite(d)
  const baseSprite = getParticleSpriteBase(d)
  const spriteSize = d * 2
  const halfSprite = spriteSize * 0.5
  const baseSpriteSize = d * 3
  const halfBaseSprite = baseSpriteSize * 0.5

  /** Per-particle gradient colouring: each particle's RGB is fixed by its HOME position
   * projected onto the gradient axis. Colour travels with the particle when it's
   * displaced, instead of acting like a screen-space mask. */
  let gradStops: [number, number, number][] | null = null
  let gradDx = 0
  let gradDy = 0
  let gradMin = 0
  let gradSpan = 1
  if (wordmarkGradient != null && wordmarkGradient.stops.length >= 2) {
    gradStops = wordmarkGradient.stops.map(parseHexColor)
    /** CSS angle: 0° = up, increasing clockwise. Canvas y is downward, so direction
     * is (sin a, -cos a). */
    const angleRad = (wordmarkGradient.angleDeg * Math.PI) / 180
    gradDx = Math.sin(angleRad)
    gradDy = -Math.cos(angleRad)
    /** Project all particle homes onto the axis and take the actual extents so the
     * full gradient spans the wordmark — not the empty space around it. */
    let mn = Infinity
    let mx = -Infinity
    for (const p of particles) {
      const t = p.hx * gradDx + p.hy * gradDy
      if (t < mn) mn = t
      if (t > mx) mx = t
    }
    if (mx > mn) {
      gradMin = mn
      gradSpan = mx - mn
    } else {
      gradStops = null
    }
  }

  const velBoostOn = velocityAlphaBoost > 0
  const drawOne = (p: ParallaxParticle) => {
    const ba = Number.isFinite(p.baseAlpha) ? p.baseAlpha : PARTICLE_BASE_ALPHA
    const op = Number.isFinite(p.entranceOpacity) ? p.entranceOpacity : 1
    /** Trailing particles render at a lower alpha so the wake reads as ghostly. */
    const wakeMul = p.bhTrailUntilMs != null ? wakeAlphaMult : 1
    /** Velocity-based luminosity bump — moving particles read slightly
     * brighter than resting ones, reproducing the Newmix effect where the
     * cursor's wake is illuminated. Boost = speed * coefficient, capped. */
    let velBoost = 0
    if (velBoostOn) {
      const speed = Math.hypot(p.vx, p.vy)
      velBoost = Math.min(velocityAlphaBoostCap, speed * velocityAlphaBoost)
    }
    /** Capture-invert glow: alpha bump scaled by mix * glowBoost. Only
     * applies to particles that won the dice roll (captureColorMix > 0). */
    const invMixForBoost = p.captureColorMix ?? 0
    const invGlowAlpha = invMixForBoost * captureColorInvertGlowBoost
    const alpha = Math.min(
      PARTICLE_ALPHA_CAP,
      Math.max(
        0,
        ba * ANIMATED_PARTICLE_ALPHA_MULT * op * wakeMul +
          velBoost +
          invGlowAlpha
      )
    )
    const hx = Number.isFinite(p.hx) ? p.hx : 0
    const hy = Number.isFinite(p.hy) ? p.hy : 0
    void rainbowRgbForHome
    void bitmapW
    void bitmapH
    void hx
    void hy
    const px = Number.isFinite(p.x) ? p.x : hx
    const py = Number.isFinite(p.y) ? p.y : hy
    let xBmp = px
    let yBmp = py
    if (!Number.isFinite(xBmp)) {
      xBmp = px
    }
    if (!Number.isFinite(yBmp)) {
      yBmp = py
    }
    if (gradStops != null) {
      /** Per-particle gradient colour. Project particle's HOME onto axis so the
       * colour is fixed to the wordmark and travels with the particle when displaced. */
      const proj = p.hx * gradDx + p.hy * gradDy
      let t = (proj - gradMin) / gradSpan
      if (t < 0) t = 0
      else if (t > 1) t = 1
      const segCount = gradStops.length - 1
      const segPos = t * segCount
      let segIdx = Math.floor(segPos)
      if (segIdx >= segCount) segIdx = segCount - 1
      const localT = segPos - segIdx
      const c1 = gradStops[segIdx]!
      const c2 = gradStops[segIdx + 1]!
      let r = Math.round(c1[0]! + (c2[0]! - c1[0]!) * localT)
      let g = Math.round(c1[1]! + (c2[1]! - c1[1]!) * localT)
      let b = Math.round(c1[2]! + (c2[2]! - c1[2]!) * localT)
      const invMix = p.captureColorMix
      if (invMix != null && invMix > 0) {
        r = Math.round(r * (1 - invMix) + (255 - r) * invMix)
        g = Math.round(g * (1 - invMix) + (255 - g) * invMix)
        b = Math.round(b * (1 - invMix) + (255 - b) * invMix)
        /** RGB glow lift toward white, scaled by mix * boost. Combined with
         * the alpha bump above, selected particles read as visibly brighter
         * than their non-inverted neighbors. */
        const lift = invMix * captureColorInvertGlowBoost * 80
        if (lift > 0) {
          r = Math.min(255, Math.round(r + lift))
          g = Math.min(255, Math.round(g + lift))
          b = Math.min(255, Math.round(b + lift))
        }
      }
      ctx.globalAlpha = alpha
      ctx.fillStyle = `rgb(${r},${g},${b})`
      const half = d * 0.5
      ctx.fillRect(xBmp - half, yBmp - half, d, d)
    } else if (sprite != null && baseSprite != null && useDualPass) {
      /** Pass 1: low-alpha base layer fills gaps between centers. */
      ctx.globalAlpha = alpha * 0.18
      ctx.drawImage(
        baseSprite,
        xBmp - halfBaseSprite,
        yBmp - halfBaseSprite
      )
      /** Pass 2: full-alpha core sprite preserves grain. */
      ctx.globalAlpha = alpha
      ctx.drawImage(sprite, xBmp - halfSprite, yBmp - halfSprite)
    } else if (sprite != null) {
      /** Single-pass crisp render — only the core sprite, no base bloom. */
      ctx.globalAlpha = alpha
      ctx.drawImage(sprite, xBmp - halfSprite, yBmp - halfSprite)
    } else {
      ctx.fillStyle = `rgba(255,255,255,${alpha})`
      ctx.fillRect(xBmp, yBmp, d, d)
    }
  }
  for (const p of particles) {
    drawOne(p)
  }
  if (extraParticles != null && extraParticles.length > 0) {
    for (const p of extraParticles) {
      drawOne(p)
    }
  }
  /** Reset globalAlpha so subsequent draws (debug marker, parallax overlays) aren't
   * dimmed by the last sprite-blit alpha. */
  ctx.globalAlpha = 1

  const m = mouseRef.current
  if (
    SHOW_MOUSE_CURSOR_DEBUG_MARKER &&
    Number.isFinite(m.x) &&
    Number.isFinite(m.y) &&
    m.x > -9000
  ) {
    const r = 20 * debugDotDpr
    ctx.fillStyle = "#ff00ff"
    ctx.beginPath()
    ctx.arc(m.x, m.y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

/**
 * Metaball post-process — copies the just-rendered canvas to an offscreen,
 * applies CSS-filter blur + contrast, and composites it back over the original.
 * The contrast pass acts as the threshold: overlapping soft-blur particles
 * fuse into solid blobs with sharp surface-tension edges, while isolated
 * particles fade out (low alpha pushed below the contrast cutoff).
 *
 * Caches its own offscreen canvas across frames to avoid per-frame alloc.
 * Returns the (possibly newly created) offscreen so the caller can hold the
 * reference.
 */
function applyMetaballPostprocess(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  glowCanvas: HTMLCanvasElement | null,
  blurPx: number,
  threshold: number
): HTMLCanvasElement | null {
  const W = canvas.width
  const H = canvas.height
  if (W <= 0 || H <= 0) return glowCanvas
  let offscreen = glowCanvas
  if (!offscreen || offscreen.width !== W || offscreen.height !== H) {
    offscreen = document.createElement("canvas")
    offscreen.width = W
    offscreen.height = H
  }
  const offCtx = offscreen.getContext("2d", { alpha: true })
  if (!offCtx) return offscreen
  /** Snapshot the pre-threshold render. */
  offCtx.clearRect(0, 0, W, H)
  offCtx.drawImage(canvas, 0, 0)
  /** Clear the main canvas and composite back through a CSS-filter blur +
   * contrast pass. The contrast multiplier is mapped from the threshold knob:
   * higher threshold = harder cutoff (more contrast). */
  ctx.save()
  ctx.clearRect(0, 0, W, H)
  /** Map threshold (0..1) to contrast (1..30). 0.45 → ~13, gives clean blobs. */
  const contrast = 1 + Math.max(0, Math.min(1, threshold)) * 30
  ctx.filter = `blur(${Math.max(0, blurPx)}px) contrast(${contrast})`
  ctx.drawImage(offscreen, 0, 0)
  ctx.filter = "none"
  ctx.restore()
  return offscreen
}

type Props = {
  logoSrc?: string
  /**
   * `embedded` — portal inside the parent hero (home).
   * `fullscreen` — fixed 100vw×100vh layer on `document.body` + mix reveal + viewport physics tuning.
   */
  presentation?: "embedded" | "fullscreen"
  /**
   * Stipple count (logo mask + hero grid per `FULL_HERO_HOME_FRACTION`). Defaults to `ANIMATED_PARTICLE_CAP`.
   */
  animatedParticleCap?: number
  /**
   * `"newmix"` — Newmix-style cursor-pushes-field with pressure projection;
   * particles ride the field bilinearly. The only supported interactive mode.
   * `"default"` — kept for back-compat; behaves the same as `newmix` at runtime.
   *
   * Earlier modes (`fluidWake`, `blackHole`, `viscousCoffee`, `flow`, `displaced`)
   * are no longer wired up — every caller in the codebase uses `"newmix"`.
   */
  interactionMode?: "default" | "newmix"
  /** Overrides default `aria-label` on the outer `<section>` (embedded). */
  sectionAriaLabel?: string
  /**
 * When `interactionMode="viscousCoffee"`, merged into physics each frame (sliders / lab).
 * Omitted = built-in defaults from `viscous-coffee-live-tuning.ts`.
 */
  viscousCoffeeLiveTuning?: Partial<ViscousCoffeeLiveTuning> | null
  /**
   * When `interactionMode="newmix"`, merged into physics each frame (sliders / lab).
   * Omitted = built-in defaults from `newmix-live-tuning.ts`.
   */
  newmixLiveTuning?: Partial<NewmixLiveTuning> | null
  /**
   * When `interactionMode="flow"`, merged into physics each frame.
   * Omitted = built-in defaults from `flow-live-tuning.ts`.
   */
  flowLiveTuning?: Partial<FlowLiveTuning> | null
  /**
   * When `interactionMode="displaced"`, merged into physics each frame.
   * Omitted = built-in defaults from `displaced-live-tuning.ts`.
   */
  displacedLiveTuning?: Partial<DisplacedLiveTuning> | null
  /**
   * Forces which pixels become particle candidates, overriding auto-detect.
   * - `"bright"`: keep light pixels (white logo on dark / transparent background)
   * - `"dark"`: keep dark pixels (dark logo on light background, or photographic content
   *   where the dark areas should form the particle silhouette)
   * - `"auto"` (default): inspect the image and pick whichever is dominant
   */
  inkPolarity?: "auto" | "bright" | "dark"
  /**
   * Tailwind class for the embedded section background. Default `bg-black`.
   * Set to e.g. `"bg-ui-fg-base"` to seamlessly blend with the site header.
   */
  bgClassName?: string
  /**
   * Optional linear-gradient overlay applied to the rendered particle stipple via
   * `globalCompositeOperation = 'source-in'`. Recolours the wordmark with a multi-stop
   * gradient. `angleDeg` follows CSS convention (0° = upward, increasing clockwise).
   * Set `stops` to a list of CSS colour strings (any length).
   */
  wordmarkGradient?: { angleDeg: number; stops: string[] } | null
  /**
   * Override the animated particle's draw size (bitmap px). When set, takes
   * priority over the presentation-mode default (1 px embedded / 5 px fullscreen).
   * Useful for live-tuning UIs that expose particle size as a slider.
   */
  particleDrawSize?: number | null
}

export default function HomeParticleLogoHero({
  logoSrc = DEFAULT_LOGO_SRC,
  presentation = "embedded",
  animatedParticleCap = ANIMATED_PARTICLE_CAP,
  interactionMode = "default",
  sectionAriaLabel,
  viscousCoffeeLiveTuning = null,
  newmixLiveTuning = null,
  flowLiveTuning = null,
  displacedLiveTuning = null,
  inkPolarity = "auto",
  bgClassName = "bg-black",
  wordmarkGradient = null,
  particleDrawSize = null,
}: Props) {
  const presentationRef = useRef(presentation)
  presentationRef.current = presentation
  const interactionModeRef = useRef(interactionMode)
  interactionModeRef.current = interactionMode
  const wordmarkGradientRef = useRef(wordmarkGradient)
  wordmarkGradientRef.current = wordmarkGradient
  const wakeTrailRef = useRef<Array<{ x: number; y: number }>>([])
  const viscousCoffeeTrailRef = useRef<Array<{ x: number; y: number }>>([])
  const viscousCoffeeErodeAccRef = useRef(0)
  const viscousCoffeeWakeParticlesRef = useRef<ParallaxParticle[] | null>(
    null
  )
  /** Previous cursor (bitmap) for spoon heading when the trail has fewer than two samples. */
  const viscousCoffeePrevCursorRef = useRef({ x: 0, y: 0 })
  const viscousCoffeeSpoonVelRef = useRef({ vx: 1, vy: 0 })
  const viscousCoffeeSpoonPrimedRef = useRef(false)
  const viscousCoffeeLiveMergedRef = useRef<ViscousCoffeeLiveTuning>(
    mergeViscousCoffeeLiveTuning()
  )
  const viscousWakeBuiltCountRef = useRef<number | undefined>(undefined)

  const newmixTrailRef = useRef<Array<{ x: number; y: number }>>([])
  const newmixSpoonVelRef = useRef({ vx: 1, vy: 0 })
  const newmixSpoonPrimedRef = useRef(false)
  const newmixPrevCursorRef = useRef({ x: 0, y: 0 })
  /** Wall-clock of the last frame the cursor moved (used to gate capture/swirl after idle). */
  const newmixLastMotionMsRef = useRef(0)
  /** Per-frame cursor delta in bitmap px — used to advect trailing particles at mouse pace. */
  const newmixFrameMouseDeltaRef = useRef({ dx: 0, dy: 0 })
  /** Previous tick's cursor position (bitmap px) for delta computation. */
  const newmixTickPrevCursorRef = useRef({ x: -9999, y: -9999 })
  /** Per-frame cursor history (bitmap px). Each tick pushes the SMOOTHED cursor position
   * (low-pass filtered from raw input); trailing particles play back this buffer so quick
   * direction changes don't bend the wake into visible zigzags. */
  const newmixCursorHistoryRef = useRef<
    Array<{ x: number; y: number; t: number }>
  >([])
  /** Smoothed cursor position used for the history buffer push. Updated each tick by
   * lerping toward the raw cursor position with `WAKE_HISTORY_SMOOTHING` factor. */
  const newmixSmoothedCursorRef = useRef({ x: -9999, y: -9999 })
  const newmixLiveMergedRef = useRef<NewmixLiveTuning>(
    mergeNewmixLiveTuning()
  )
  /** Velocity-field grid for the lingering-momentum mechanic. Allocated lazily
   * the first frame `fieldStrength > 0` and the canvas size is known. Reused
   * across frames; only reallocated if grid resolution changes. */
  const newmixVelocityFieldRef = useRef<VelocityField | null>(null)
  /** Scratch buffer (length cols*rows*2) reused across frames by the diffusion
   * pass. Resized in lockstep with the field. */
  const newmixVelocityFieldScratchRef = useRef<Float32Array | null>(null)
  /** Separate scratch buffer (length cols*rows) for the pressure-projection
   * pass — holds the per-cell pressure scalar between the divergence and
   * gradient steps. */
  const newmixVelocityFieldPressureRef = useRef<Float32Array | null>(null)
  /** Scratch tuple reused across the per-particle field-sample call to avoid
   * per-frame `[number, number]` allocation. */
  const newmixVelocityFieldSampleRef = useRef<[number, number]>([0, 0])
  /** Scratch tuple for the per-particle curl-noise sample. */
  const newmixCurlNoiseSampleRef = useRef<[number, number]>([0, 0])
  /** Spatial hash for flocking-alignment neighbour lookups. Allocated lazily
   * the first frame `flockingStrength > 0`. Reused across frames; rebuilt
   * each frame by `buildSpatialHash`. */
  const newmixFlockingHashRef = useRef<SpatialHash | null>(null)
  /** Round-robin offset for `flockingProcessFraction < 1` so processing rotates
   * across all particles over multiple frames. */
  const newmixFlockingOffsetRef = useRef(0)
  /** Offscreen canvases for the metaball render path. Allocated lazily and
   * resized in lockstep with the main canvas. */
  const newmixMetaballGlowRef = useRef<HTMLCanvasElement | null>(null)
  const newmixMetaballThresholdRef =
    useRef<HTMLCanvasElement | null>(null)
  /** Flow mode: low-pass-smoothed cursor velocity used for the carry-along velocity handoff. */
  const flowSpoonVelRef = useRef({ vx: 0, vy: 0 })
  const flowPrevCursorRef = useRef({ x: -9999, y: -9999 })
  const flowLiveMergedRef = useRef<FlowLiveTuning>(
    mergeFlowLiveTuning()
  )
  const displacedLiveMergedRef = useRef<DisplacedLiveTuning>(
    mergeDisplacedLiveTuning()
  )

  useLayoutEffect(() => {
    Object.assign(
      viscousCoffeeLiveMergedRef.current,
      mergeViscousCoffeeLiveTuning(viscousCoffeeLiveTuning)
    )
  }, [viscousCoffeeLiveTuning])

  useLayoutEffect(() => {
    Object.assign(
      newmixLiveMergedRef.current,
      mergeNewmixLiveTuning(newmixLiveTuning)
    )
  }, [newmixLiveTuning])

  useLayoutEffect(() => {
    Object.assign(
      flowLiveMergedRef.current,
      mergeFlowLiveTuning(flowLiveTuning)
    )
  }, [flowLiveTuning])

  useLayoutEffect(() => {
    Object.assign(
      displacedLiveMergedRef.current,
      mergeDisplacedLiveTuning(displacedLiveTuning)
    )
  }, [displacedLiveTuning])
  const reducedMotion = useReducedMotion()
  /** Layer parallax respects OS reduced-motion. */
  const reduceParallax = reducedMotion === true

  /** Axis-aligned logo home bounds in bitmap px (for fast hit reject). */
  const logoInteractBoundsRef = useRef<LogoInteractBounds | null>(null)
  /** Wall-clock start of entrance lerp (−1 = disabled / reduced motion). */
  const particleEntranceStartMsRef = useRef(-1)
  const particleDrawSizeBmpRef = useRef(PARTICLE_DRAW_SIZE_BMP)
  /** Push live `particleDrawSize` prop changes into the ref every render so
   * slider drags apply to the next frame's draw, without waiting for a
   * resampling pass to overwrite the ref. */
  if (particleDrawSize != null && particleDrawSize > 0) {
    particleDrawSizeBmpRef.current = particleDrawSize
  }

  const reduceParallaxRef = useRef(reduceParallax)
  reduceParallaxRef.current = reduceParallax

  const wrapRef = useRef<HTMLDivElement | null>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const canvasORef = useRef<HTMLCanvasElement>(null)
  const canvasARef = useRef<HTMLCanvasElement>(null)
  const canvasCRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<ParallaxParticle[] | null>(null)
  const rafRef = useRef<number | null>(null)
  /** Restarts the simulation loop if it was idle (e.g. after tab sleep). */
  const rafResumeRef = useRef<() => void>(() => {})
  /** Stable 2D context for canvasC; reset in build after backing store is sized. */
  const canvasCCtxRef = useRef<CanvasRenderingContext2D | null>(null)
  const buildRef = useRef<() => void>(() => {})
  /** Throttle `build()` calls kicked from RAF when fixing null-particle races. */
  const rafBuildKickAtRef = useRef(0)
  const lastPointerClientRef = useRef<{ x: number; y: number } | null>(null)
  /** Raw pointer in bitmap px from `clientToBitmapViewport`; tick subtracts parallax for physics. */
  const mouseRawBmpRef = useRef<{ x: number; y: number } | null>(null)
  /** Bitmap-space cursor; `active` stays true (no click/drag gates). */
  const mouseRef = useRef({
    active: true,
    x: -9999,
    y: -9999,
    deltaX: 0,
    deltaY: 0,
  })
  const parallaxLRef = useRef({ x: 0, y: 0 })
  const parallaxTRef = useRef({ x: 0, y: 0 })
  const logoTiltTargetRef = useRef({ rx: 0, ry: 0 })
  const logoTiltCurrentRef = useRef({ rx: 0, ry: 0 })
  const logoTiltLayerRef = useRef<HTMLDivElement | null>(null)
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  /** Hide static fallback `<img>` once canvases have sampled the logo and spawned particles. */
  const [logoRasterReady, setLogoRasterReady] = useState(false)
  /** Client-only; portal mounts canvases inside the hero (black panel). */
  const [portalReady, setPortalReady] = useState(false)
  const [particleLayerHostReady, setParticleLayerHostReady] = useState(false)
  /** Fullscreen mode does not use `wrapRef` as the portal host. */
  const [fullscreenHostReady, setFullscreenHostReady] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const logoImgRef = useRef<HTMLImageElement | null>(null)
  logoImgRef.current = logoImg

  const layerReady =
    presentation === "fullscreen" ? fullscreenHostReady : particleLayerHostReady

  const mixRevealActive = presentation === "fullscreen" && !reduceParallax

  useLayoutEffect(() => {
    if (presentation === "fullscreen") {
      setFullscreenHostReady(true)
    } else {
      setFullscreenHostReady(false)
    }
  }, [presentation])

  useEffect(() => {
    if (presentation !== "fullscreen") {
      setIsRevealed(true)
      return
    }
    if (reduceParallax) {
      setIsRevealed(true)
      return
    }
    setIsRevealed(false)
    const timer = setTimeout(() => setIsRevealed(true), 200)
    return () => clearTimeout(timer)
  }, [presentation, reduceParallax])

  useLayoutEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    setLogoRasterReady(false)
    setLoadFailed(false)
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.decoding = "async"
    img.onload = () => {
      void img
        .decode()
        .catch(() => {
          /* decode optional; onload already fired */
        })
        .finally(() => {
          requestAnimationFrame(() => setLogoImg(img))
        })
    }
    img.onerror = () => setLoadFailed(true)
    img.src = logoSrc
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [logoSrc])

  const build = useCallback(() => {
    const c0 = canvasORef.current
    const c1 = canvasARef.current
    const c2 = canvasCRef.current
    const img = logoImg
    if (!c0 || !c1 || !c2 || !img || !img.naturalWidth) {
      return
    }

    const dpr = backingDpr()
    const iw = Math.max(1, window.innerWidth)
    const ih = Math.max(1, window.innerHeight)

    for (const c of [c0, c1, c2]) {
      c.style.width = "100%"
      c.style.height = "100%"
    }
    const useViewportBitmap = presentationRef.current === "fullscreen"
    const br = c0.getBoundingClientRect()
    const cw = useViewportBitmap
      ? Math.max(1, Math.round(iw))
      : Math.max(1, Math.round(br.width || c0.clientWidth || iw))
    const ch = useViewportBitmap
      ? Math.max(1, Math.round(ih))
      : Math.max(1, Math.round(br.height || c0.clientHeight || ih))
    const W = Math.round(cw * dpr)
    const H = Math.round(ch * dpr)

    for (const c of [c0, c1, c2]) {
      c.width = W
      c.height = H
    }

    const nw = img.naturalWidth
    const nh = img.naturalHeight
    const isFsBuild = presentationRef.current === "fullscreen"
    const pad = isFsBuild ? FULLSCREEN_LOGO_PAD : 0.985
    const baseLogoScale = Math.min((W * pad) / nw, (H * pad) / nh)
    const logoScale = isFsBuild
      ? baseLogoScale
      : baseLogoScale * EMBEDDED_LOGO_BOOST_SCALE
    const dw = nw * logoScale
    const dh = nh * logoScale
    /** Physics mask centered in bitmap W×H (`W`/`H` ≡ viewport × dpr). */
    const dx = (W - nw * logoScale) / 2
    let dy = (H - nh * logoScale) / 2
    if (isFsBuild) {
      dy += Math.round(FULLSCREEN_LOGO_NUDGE_Y_CSS * dpr)
    }

    const wCss = W / dpr
    const hCss = H / dpr
    const dxCss = dx / dpr
    const dyCss = dy / dpr
    const dwCss = dw / dpr
    const dhCss = dh / dpr

    let candidates: Array<{ x: number; y: number }>
    try {
      /** Polarity selection. If the caller forced one via `inkPolarity`, use it. Otherwise
       * auto-detect by inspecting the drawn image on a mid-grey background. */
      const polarity =
        inkPolarity !== "auto"
          ? inkPolarity
          : detectImagePolarity(
              W,
              H,
              dpr,
              img,
              wCss,
              hCss,
              dxCss,
              dyCss,
              dwCss,
              dhCss
            )
      if (polarity === "dark") {
        candidates = gatherDarkInkCandidates(W, H, dpr, img, wCss, hCss, dxCss, dyCss, dwCss, dhCss)
        if (candidates.length === 0) {
          candidates = gatherBrightInkCandidates(W, H, dpr, img, wCss, hCss, dxCss, dyCss, dwCss, dhCss)
        }
      } else {
        candidates = gatherBrightInkCandidates(W, H, dpr, img, wCss, hCss, dxCss, dyCss, dwCss, dhCss)
        if (candidates.length === 0) {
          candidates = gatherDarkInkCandidates(W, H, dpr, img, wCss, hCss, dxCss, dyCss, dwCss, dhCss)
        }
      }
      if (candidates.length === 0) {
        candidates = gatherAlphaCandidates(W, H, dpr, img, wCss, hCss, dxCss, dyCss, dwCss, dhCss)
      }
    } catch {
      setLoadFailed(true)
      return
    }

    if (process.env.NODE_ENV === "development") {
      if (candidates.length === 0) {
        console.warn(
          "[HomeParticleLogoHero] No mask pixels — check asset and CORS; tried bright-ink, dark-ink, alpha passes."
        )
      }
    }

    const nLogo = candidates.length
    const cap = Math.max(1, Math.floor(animatedParticleCap))
    const heroHomeCount =
      nLogo > 0
        ? Math.min(cap, Math.round(cap * FULL_HERO_HOME_FRACTION))
        : cap
    const logoHomeCount = cap - heroHomeCount
    const particles: ParallaxParticle[] = []

    const gridCols = Math.max(1, Math.ceil(Math.sqrt(heroHomeCount)))
    const gridRows = Math.max(1, Math.ceil(heroHomeCount / gridCols))
    for (let k = 0; k < heroHomeCount; k++) {
      const col = k % gridCols
      const row = Math.floor(k / gridCols)
      const hx = Math.min(
        W - 1,
        Math.round(((col + 0.5) / Math.max(1, gridCols)) * (W - 1))
      )
      const hy = Math.min(
        H - 1,
        Math.round(((row + 0.5) / Math.max(1, gridRows)) * (H - 1))
      )
      particles.push({
        hx,
        hy,
        x: hx,
        y: hy,
        radiusCss: PARTICLE_RADIUS_MIN_CSS,
        baseAlpha: PARTICLE_BASE_ALPHA,
        vx: 0,
        vy: 0,
        fromLogoMask: false,
        spawnX: hx,
        spawnY: hy,
        entranceStagger: 0,
        entranceOpacity: 1,
        bhPrevInRadius: false,
        bhTrailUntilMs: null,
      })
    }

    /** Replace the previous scan-line-ordered deterministic stride (which produced visible
     * grid patterns on the wordmark) with a hashed pseudo-random pick. Same density, but
     * candidate positions are drawn uniformly from the mask without any spatial ordering bias. */
    for (let k = 0; k < logoHomeCount; k++) {
      /** Two independent hashes per particle: one for candidate index, two for sub-pixel
       * jitter (breaks the integer-pixel grid the alpha mask collected on). Deterministic
       * (reproduces same layout on reload) but uncorrelated with scan-line order. */
      const h1 = ((k * 2654435761) ^ ((k * 1597334677) >>> 0)) >>> 0
      const h2 = ((k * 374761393) ^ ((k * 668265263) >>> 0)) >>> 0
      const h3 = ((k * 3266489917) ^ ((k * 2246822519) >>> 0)) >>> 0
      const idx = h1 % nLogo
      const jx = ((h2 & 0xffff) / 0xffff - 0.5) * 0.8
      const jy = ((h3 & 0xffff) / 0xffff - 0.5) * 0.8
      const c = candidates[idx]!
      const hx = (Number(c.x) || 0) + jx
      const hy = (Number(c.y) || 0) + jy
      particles.push({
        hx,
        hy,
        x: hx,
        y: hy,
        radiusCss: PARTICLE_RADIUS_MIN_CSS,
        baseAlpha: PARTICLE_BASE_ALPHA,
        vx: 0,
        vy: 0,
        fromLogoMask: true,
        spawnX: hx,
        spawnY: hy,
        entranceStagger: 0,
        entranceOpacity: 1,
        bhPrevInRadius: false,
        bhTrailUntilMs: null,
      })
    }

    /** Particle draw size: caller-provided prop takes priority, else fall back
     * to presentation-mode default (1 px embedded / 5 px fullscreen). */
    particleDrawSizeBmpRef.current =
      particleDrawSize != null && particleDrawSize > 0
        ? particleDrawSize
        : isFsBuild
        ? FULLSCREEN_PARTICLE_DRAW_SIZE_BMP
        : PARTICLE_DRAW_SIZE_BMP

    if (reduceParallaxRef.current) {
      for (const p of particles) {
        p.spawnX = p.hx
        p.spawnY = p.hy
        p.x = p.hx
        p.y = p.hy
        p.vx = 0
        p.vy = 0
        p.entranceStagger = 0
        p.entranceOpacity = 1
      }
      particleEntranceStartMsRef.current = -1
    } else {
      /** Wide spawn cloud anchored at the upper-left, falling off gradually toward the
       * wordmark (a long elongated tail) so the entrance reads as a diffuse drift rather
       * than a tight pocket emerging. */
      const spread = Math.min(W, H) * PARTICLE_ENTRANCE_SPAWN_SPREAD_FRAC
      const tlx = -spread * 0.15
      const tly = -spread * 0.05
      const invW = W > 1 ? 1 / (W - 1) : 0
      const invH = H > 1 ? 1 / (H - 1) : 0
      const tailDir = Math.SQRT1_2 // 45° toward bottom-right
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!
        const nx = Math.max(0, Math.min(1, p.hx * invW))
        const ny = Math.max(0, Math.min(1, p.hy * invH))
        const u = (nx + ny) * 0.5
        p.entranceStagger = 1 - u
        /** Three independent hashes per particle for spawn position + tail drift. */
        const rngU = ((i * 2654435761) >>> 0) / 4294967296
        const rngV = ((i * 2246822519) >>> 0) / 4294967296
        const rngT =
          (((i * 374761393) >>> 0) ^ ((i * 668265263) >>> 0) >>> 0) /
          4294967296
        /** Square-root weighting biases toward larger spread values, producing more
         * particles in the outer halo (long tail) than in the dense core. */
        const baseU = Math.sqrt(rngU) - 0.5
        const baseV = Math.sqrt(rngV) - 0.5
        /** Tail offset along 45°-toward-wordmark direction, length scaled by rngT^2 so
         * most particles cluster but a long-tail of stragglers extends toward the homes. */
        const tail =
          rngT * rngT * PARTICLE_ENTRANCE_SPAWN_TAIL_BMP
        p.spawnX =
          tlx + baseU * spread * 1.6 + tail * tailDir
        p.spawnY =
          tly + baseV * spread * 1.6 + tail * tailDir
        p.x = p.spawnX
        p.y = p.spawnY
        p.vx = 0
        p.vy = 0
        p.entranceOpacity = 0
      }
      particleEntranceStartMsRef.current = performance.now()
    }

    parallaxTRef.current = { x: 0, y: 0 }
    parallaxLRef.current = { x: 0, y: 0 }

    const ctx0 = c0.getContext("2d", { alpha: true })
    const ctx1 = c1.getContext("2d", { alpha: true })
    const ctx2 = c2.getContext("2d", { alpha: true })
    if (!ctx0 || !ctx1 || !ctx2) {
      canvasCCtxRef.current = null
      setLogoRasterReady(false)
      return
    }
    canvasCCtxRef.current = ctx2
    particlesRef.current = particles
    logoInteractBoundsRef.current = logoHomeBounds(particles)
    /** viscousCoffee mode is no longer wired up — always nullify the wake pool. */
    {
      viscousCoffeeWakeParticlesRef.current = null
    }
    const { sx, sy } = canvasScale(c0)

    ctx0.clearRect(0, 0, c0.width, c0.height)
    ctx1.clearRect(0, 0, c1.width, c1.height)

    const dotDpr = c2.width / Math.max(1, c2.clientWidth)
    const fs = presentationRef.current === "fullscreen"
    drawLayer(
      ctx2,
      c2,
      particles,
      sx,
      sy,
      mouseRef,
      dotDpr,
      0,
      0,
      !reduceParallax && !fs,
      particleDrawSizeBmpRef.current,
      viscousCoffeeWakeParticlesRef.current,
      interactionModeRef.current === "newmix"
        ? newmixLiveMergedRef.current.wakeAlphaMult
        : 1,
      /** Newmix mode uses crisp single-pass rendering; other modes keep the dual-pass bloom. */
      interactionModeRef.current !== "newmix",
      wordmarkGradientRef.current
    )

    setLogoRasterReady(particles.length > 0)

    if (lastPointerClientRef.current == null) {
      const rSeed = c0.getBoundingClientRect()
      const scx = Math.floor(rSeed.left + rSeed.width / 2)
      const scy = Math.floor(rSeed.top + rSeed.height / 2)
      lastPointerClientRef.current = { x: scx, y: scy }
      const sb = clientToBitmapViewport(scx, scy, c2)
      mouseRawBmpRef.current = {
        x: sb.x,
        y: sb.y,
      }
    }
  }, [logoImg, reduceParallax, animatedParticleCap, interactionMode])

  buildRef.current = build

  useEffect(() => {
    /** viscousCoffee wake pool was the only consumer of this rebuild effect;
     * with that mode removed the effect is a no-op. Kept as a placeholder
     * so the surrounding hook order doesn't shift. */
    return
    if (!portalReady || !layerReady) {
      return
    }
    const want = viscousCoffeeLiveMergedRef.current.wakeParticleCount
    if (viscousWakeBuiltCountRef.current === undefined) {
      viscousWakeBuiltCountRef.current = want
      return
    }
    if (viscousWakeBuiltCountRef.current === want) {
      return
    }
    viscousWakeBuiltCountRef.current = want
    buildRef.current()
  }, [viscousCoffeeLiveTuning, portalReady, layerReady])

  useLayoutEffect(() => {
    if (!portalReady || !layerReady) {
      return
    }
    build()
  }, [build, portalReady, layerReady])

  useEffect(() => {
    if (!reduceParallax) {
      return
    }
    parallaxTRef.current = { x: 0, y: 0 }
    parallaxLRef.current = { x: 0, y: 0 }
  }, [reduceParallax])

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined
    const onResize = () => {
      if (t != null) {
        clearTimeout(t)
      }
      t = setTimeout(() => {
        t = undefined
        build()
      }, 100)
    }
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      if (t != null) {
        clearTimeout(t)
      }
    }
  }, [build])

  useEffect(() => {
    if (!particleLayerHostReady) {
      return
    }
    if (presentationRef.current === "fullscreen") {
      return
    }
    const el = wrapRef.current
    if (!el) {
      return
    }
    const ro = new ResizeObserver(() => {
      buildRef.current()
    })
    ro.observe(el)
    return () => {
      ro.disconnect()
    }
  }, [particleLayerHostReady, presentation])

  useEffect(() => {
    let frameId: number | null = null
    const tick = () => {
      try {
        const c2 = canvasCRef.current
        const ctx2 = canvasCCtxRef.current
        const particles = particlesRef.current
        const reduceParallaxNow = reduceParallaxRef.current

        if (!c2) {
          return
        }

        if (particles == null) {
          if (logoImgRef.current?.naturalWidth && canvasCRef.current) {
            const t = performance.now()
            if (t - rafBuildKickAtRef.current > 200) {
              rafBuildKickAtRef.current = t
              buildRef.current()
            }
          }
          return
        }

        if (!ctx2) {
          return
        }

        if (particles.length === 0) {
          return
        }

        const { sx, sy } = canvasScale(c2)
        if (!Number.isFinite(sx) || !Number.isFinite(sy) || sx <= 0 || sy <= 0) {
          return
        }
        const isFs = presentationRef.current === "fullscreen"
        const L = parallaxLRef.current
        const T = parallaxTRef.current
        const Tx = Number.isFinite(T.x) ? T.x : 0
        const Ty = Number.isFinite(T.y) ? T.y : 0
        T.x = Tx
        T.y = Ty

        const Lx = Number.isFinite(L.x) ? L.x : 0
        const Ly = Number.isFinite(L.y) ? L.y : 0
        const applyCanvasParallax = !reduceParallaxNow && !isFs
        if (applyCanvasParallax) {
          T.x += (Lx - T.x) * PARALLAX_EASE
          T.y += (Ly - T.y) * PARALLAX_EASE
          if (!Number.isFinite(T.x)) {
            T.x = 0
          }
          if (!Number.isFinite(T.y)) {
            T.y = 0
          }
        } else {
          T.x = 0
          T.y = 0
        }

        mouseRef.current.active = true

        const lpBmp = lastPointerClientRef.current
        if (lpBmp != null && c2.width > 0 && c2.height > 0) {
          const bNow = clientToBitmapViewport(lpBmp.x, lpBmp.y, c2)
          mouseRawBmpRef.current = {
            x: Number.isFinite(bNow.x) ? bNow.x : -9999,
            y: Number.isFinite(bNow.y) ? bNow.y : -9999,
          }
        }

        const raw = mouseRawBmpRef.current

        const hitBx = applyCanvasParallax ? T.x * PARALLAX_MULT_C * sx : 0
        const hitBy = applyCanvasParallax ? T.y * PARALLAX_MULT_C * sy : 0

        let currentMouseX = -9999
        let currentMouseY = -9999
        if (raw != null && Number.isFinite(raw.x) && Number.isFinite(raw.y)) {
          currentMouseX = raw.x - hitBx
          currentMouseY = raw.y - hitBy
        }

        mouseRef.current.x = currentMouseX
        mouseRef.current.y = currentMouseY

        const Tdur = PARTICLE_ENTRANCE_DURATION_MS
        const entranceT0 = particleEntranceStartMsRef.current
        /** Max possible per-particle duration after jitter — used to keep the entrance
         * active until even the slowest particle has finished its lerp. */
        const entranceGlobalTdur =
          Tdur * (1 + PARTICLE_ENTRANCE_DURATION_JITTER)
        let entranceActive =
          entranceT0 >= 0 && !reduceParallaxNow && Tdur > 0

        if (entranceActive) {
          const elapsed = performance.now() - entranceT0
          if (elapsed >= entranceGlobalTdur) {
            for (const p of particles) {
              p.x = p.hx
              p.y = p.hy
              p.vx = 0
              p.vy = 0
              p.entranceOpacity = 1
            }
            particleEntranceStartMsRef.current = -1
            entranceActive = false
          } else {
            const sFrac = PARTICLE_ENTRANCE_STAGGER_FRAC
            const tSec = elapsed * 0.001
            for (let pi = 0; pi < particles.length; pi++) {
              const p = particles[pi]!
              /** Per-particle hashes (distinct from wake hashes — keyed off index too). */
              const eh =
                ((p.hx | 0) * 374761393 +
                  (p.hy | 0) * 3266489917 +
                  pi * 2654435761) >>> 0
              const er1 = (eh & 0xffffff) / 0xffffff
              const er2 =
                ((((eh >>> 8) * 2246822519) >>> 0) & 0xffffff) / 0xffffff
              const er3 =
                ((((eh >>> 16) * 1597334677) >>> 0) & 0xffffff) /
                0xffffff
              /** Per-particle duration jitter: ±DURATION_JITTER fraction. */
              const durMul =
                1 + (er1 * 2 - 1) * PARTICLE_ENTRANCE_DURATION_JITTER
              const partTdur = Math.max(100, Tdur * durMul)
              const tStart = p.entranceStagger * sFrac * Tdur
              const moveDur = Math.max(1e-6, partTdur - tStart)
              if (elapsed <= tStart) {
                p.x = p.spawnX
                p.y = p.spawnY
                p.vx = 0
                p.vy = 0
                p.entranceOpacity = 0
              } else if (elapsed >= tStart + moveDur) {
                /** This particle has finished; snap to home with full opacity. */
                p.x = p.hx
                p.y = p.hy
                p.vx = 0
                p.vy = 0
                p.entranceOpacity = 1
              } else {
                const rawU = (elapsed - tStart) / moveDur
                const pathU = easeOutCubic(rawU)
                /** Bezier control point: midpoint of (spawn, home) plus a random angular
                 * offset, magnitude unique per particle. Each entrance trajectory curves
                 * differently so particles fan out instead of moving in straight lines. */
                const sx = p.spawnX
                const sy = p.spawnY
                const ex = p.hx
                const ey = p.hy
                const sweepAngle = (er2 - 0.5) * Math.PI * 2
                const curveAmp =
                  PARTICLE_ENTRANCE_CURVE_BMP * (0.4 + er3 * 1.2)
                const cdx = Math.cos(sweepAngle) * curveAmp
                const cdy = Math.sin(sweepAngle) * curveAmp
                const mx = (sx + ex) * 0.5 + cdx
                const my = (sy + ey) * 0.5 + cdy
                const oneMinus = 1 - pathU
                const bx =
                  oneMinus * oneMinus * sx +
                  2 * oneMinus * pathU * mx +
                  pathU * pathU * ex
                const by =
                  oneMinus * oneMinus * sy +
                  2 * oneMinus * pathU * my +
                  pathU * pathU * ey
                /** Diffusion wobble: bell-shaped envelope (peaks mid-trip, zero at home)
                 * so each particle drifts on its own irregular path during the lerp. */
                const env = 4 * pathU * (1 - pathU)
                const phase1 = er1 * Math.PI * 2
                const phase2 = er2 * Math.PI * 2
                const diffX =
                  Math.sin(tSec * 1.7 + phase1) *
                  PARTICLE_ENTRANCE_DIFFUSION_BMP *
                  env
                const diffY =
                  Math.cos(tSec * 2.1 + phase2) *
                  PARTICLE_ENTRANCE_DIFFUSION_BMP *
                  env
                p.x = bx + diffX
                p.y = by + diffY
                p.vx = 0
                p.vy = 0
                p.entranceOpacity = easeOutCubic(rawU)
              }
            }
          }
        }

        /** Dead modes (`fluidWake`, `blackHole`, `viscousCoffee`, `flow`,
         * `displaced`) are no longer reachable — every caller uses `"newmix"`.
         * Hard-coding them to `false` lets TypeScript narrow the conditionals
         * in the per-particle dispatch below; the dead branches stay as
         * unreachable code (deleted in a follow-up cleanup pass). */
        const fluidWake = false as boolean
        const blackHole = false as boolean
        const viscousCoffee = false as boolean
        const newmix = interactionModeRef.current === "newmix"
        const flow = false as boolean
        const displaced = false as boolean
        const vc = viscousCoffee ? viscousCoffeeLiveMergedRef.current : null
        const nm = newmix ? newmixLiveMergedRef.current : null
        const fl = flow ? flowLiveMergedRef.current : null
        const dp = displaced ? displacedLiveMergedRef.current : null
        const viscousDragR = vc != null ? vc.dragRadius : DRAG_RADIUS
        const newmixRadius = nm != null ? nm.radius : NEWMIX_RADIUS_BMP
        const flowRadius = fl != null ? fl.radius : 50
        const displacedRadius = dp != null ? dp.radius : 60
        const nowTick = performance.now()
        const bhBounds = logoInteractBoundsRef.current
        const inBlackHoleStipple =
          blackHole &&
          !entranceActive &&
          bhBounds != null &&
          currentMouseX > -9000 &&
          pointerInStippleInteractionRange(
            currentMouseX,
            currentMouseY,
            bhBounds,
            particles,
            DRAG_RADIUS
          )

        const inViscousStipple =
          viscousCoffee &&
          !entranceActive &&
          bhBounds != null &&
          currentMouseX > -9000 &&
          pointerInStippleInteractionRange(
            currentMouseX,
            currentMouseY,
            bhBounds,
            particles,
            viscousDragR
          )

        const inNewmixStipple =
          newmix &&
          !entranceActive &&
          bhBounds != null &&
          currentMouseX > -9000 &&
          pointerInStippleInteractionRange(
            currentMouseX,
            currentMouseY,
            bhBounds,
            particles,
            newmixRadius
          )

        const inFlowStipple =
          flow &&
          !entranceActive &&
          bhBounds != null &&
          currentMouseX > -9000 &&
          pointerInStippleInteractionRange(
            currentMouseX,
            currentMouseY,
            bhBounds,
            particles,
            flowRadius
          )

        const inDisplacedStipple =
          displaced &&
          !entranceActive &&
          bhBounds != null &&
          currentMouseX > -9000 &&
          pointerInStippleInteractionRange(
            currentMouseX,
            currentMouseY,
            bhBounds,
            particles,
            displacedRadius
          )

        /** Flow / displaced modes: per-tick smoothed cursor velocity. Each tick lerps the
         * prior smoothed velocity toward the current per-frame delta. Used to determine
         * the cursor's heading direction for direction-aware displacement. */
        const flowCursorOk = currentMouseX > -9000
        if (
          (flow || displaced) &&
          !entranceActive &&
          (fl != null || dp != null) &&
          flowCursorOk
        ) {
          const prev = flowPrevCursorRef.current
          if (prev.x <= -9000 || prev.y <= -9000) {
            prev.x = currentMouseX
            prev.y = currentMouseY
            flowSpoonVelRef.current.vx = 0
            flowSpoonVelRef.current.vy = 0
          } else {
            const dx = currentMouseX - prev.x
            const dy = currentMouseY - prev.y
            const sv = flowSpoonVelRef.current
            /** Use flow tuning when in flow mode; sane default for displaced mode. */
            const k = fl != null ? fl.velSmoothing : 0.45
            sv.vx += (dx - sv.vx) * k
            sv.vy += (dy - sv.vy) * k
            prev.x = currentMouseX
            prev.y = currentMouseY
          }
        } else if ((flow || displaced) && !flowCursorOk) {
          flowPrevCursorRef.current = { x: -9999, y: -9999 }
          flowSpoonVelRef.current = { vx: 0, vy: 0 }
        }

        if (fluidWake && !entranceActive) {
          const bWake = logoInteractBoundsRef.current
          const nearWake =
            bWake != null &&
            currentMouseX > -9000 &&
            pointerInStippleInteractionRange(
              currentMouseX,
              currentMouseY,
              bWake,
              particles,
              DRAG_RADIUS
            )
          if (nearWake) {
            const trail = wakeTrailRef.current
            const last = trail[trail.length - 1]
            if (
              !last ||
              Math.hypot(currentMouseX - last.x, currentMouseY - last.y) >=
                WAKE_TRAIL_SAMPLE_DIST_BMP
            ) {
              trail.push({ x: currentMouseX, y: currentMouseY })
              while (trail.length > WAKE_TRAIL_MAX_POINTS) {
                trail.shift()
              }
            }
          } else {
            wakeTrailRef.current = []
          }
        }

        if (viscousCoffee && !entranceActive && vc != null) {
          const bV = logoInteractBoundsRef.current
          const nearV =
            bV != null &&
            currentMouseX > -9000 &&
            pointerInStippleInteractionRange(
              currentMouseX,
              currentMouseY,
              bV,
              particles,
              viscousDragR
            )
          const trail = viscousCoffeeTrailRef.current
          if (nearV) {
            const last = trail[trail.length - 1]
            if (
              !last ||
              Math.hypot(
                currentMouseX - last.x,
                currentMouseY - last.y
              ) >= vc.sampleDistBmp
            ) {
              trail.push({
                x: currentMouseX,
                y: currentMouseY,
              })
              while (
                trail.length > vc.trailMaxPoints
              ) {
                trail.shift()
              }
            }
            viscousCoffeeErodeAccRef.current = 0
          } else {
            viscousCoffeeErodeAccRef.current++
            if (
              viscousCoffeeErodeAccRef.current >=
              vc.erodeEveryFrames
            ) {
              viscousCoffeeErodeAccRef.current = 0
              if (trail.length > 0) {
                trail.shift()
              }
            }
          }
        }

        if (newmix && !entranceActive && nm != null) {
          const trail = newmixTrailRef.current
          if (inNewmixStipple) {
            const last = trail[trail.length - 1]
            if (
              !last ||
              Math.hypot(
                currentMouseX - last.x,
                currentMouseY - last.y
              ) >= NEWMIX_TRAIL_SAMPLE_DIST_BMP
            ) {
              trail.push({ x: currentMouseX, y: currentMouseY })
              while (trail.length > NEWMIX_TRAIL_MAX_POINTS) {
                trail.shift()
              }
            }
          } else if (trail.length > 0) {
            trail.shift()
          }
        }

        const springKBase = fluidWake
          ? WAKE_SPRING_STIFFNESS
          : viscousCoffee && vc != null
            ? vc.springStiffness
            : newmix && nm != null
              ? SPRING_STIFFNESS * nm.springStiffnessMult
              : blackHole
                ? SPRING_STIFFNESS * BLACK_HOLE_SPRING_STIFFNESS_MULT
                : SPRING_STIFFNESS
        const frictionK = fluidWake
          ? WAKE_FRICTION
          : viscousCoffee && vc != null
            ? vc.friction
            : newmix && nm != null
              ? nm.friction
              : blackHole
                ? BLACK_HOLE_FRICTION
                : FRICTION
        const trailSnap = wakeTrailRef.current
        const bhRadius = DRAG_RADIUS * BLACK_HOLE_RADIUS_MULT
        const cursorOk = currentMouseX > -9000

        let applyCoffeeSpoon = false
        let spoonGx = 1
        let spoonGy = 0
        if (
          viscousCoffee &&
          !entranceActive &&
          inViscousStipple &&
          cursorOk
        ) {
          const vcTrail = viscousCoffeeTrailRef.current
          const pr = viscousCoffeePrevCursorRef.current
          if (!viscousCoffeeSpoonPrimedRef.current) {
            pr.x = currentMouseX
            pr.y = currentMouseY
            viscousCoffeeSpoonPrimedRef.current = true
          } else {
            let rx = 0
            let ry = 0
            if (vcTrail.length >= 2) {
              const a = vcTrail[vcTrail.length - 2]!
              const b = vcTrail[vcTrail.length - 1]!
              rx = b.x - a.x
              ry = b.y - a.y
            }
            if (rx * rx + ry * ry < 0.25) {
              rx = currentMouseX - pr.x
              ry = currentMouseY - pr.y
            }
            const sv = viscousCoffeeSpoonVelRef.current
            const sm = viscousCoffeeLiveMergedRef.current.spoonVelSmooth
            sv.vx += (rx - sv.vx) * sm
            sv.vy += (ry - sv.vy) * sm
            spoonGx = sv.vx
            spoonGy = sv.vy
          }
          pr.x = currentMouseX
          pr.y = currentMouseY
          applyCoffeeSpoon = true
        }

        if (
          viscousCoffee &&
          !entranceActive &&
          (!inViscousStipple || !cursorOk)
        ) {
          viscousCoffeeSpoonPrimedRef.current = false
        }

        let newmixSpoonGx = 1
        let newmixSpoonGy = 0
        let newmixSpoonSpeed = 0
        if (
          newmix &&
          !entranceActive &&
          inNewmixStipple &&
          cursorOk &&
          nm != null
        ) {
          const nmTrail = newmixTrailRef.current
          const pr = newmixPrevCursorRef.current
          if (!newmixSpoonPrimedRef.current) {
            pr.x = currentMouseX
            pr.y = currentMouseY
            newmixSpoonPrimedRef.current = true
          } else {
            let rx = 0
            let ry = 0
            if (nmTrail.length >= 2) {
              const a = nmTrail[nmTrail.length - 2]!
              const b = nmTrail[nmTrail.length - 1]!
              rx = b.x - a.x
              ry = b.y - a.y
            }
            if (rx * rx + ry * ry < 0.25) {
              rx = currentMouseX - pr.x
              ry = currentMouseY - pr.y
            }
            const sv = newmixSpoonVelRef.current
            const sm = nm.velSmoothing
            sv.vx += (rx - sv.vx) * sm
            sv.vy += (ry - sv.vy) * sm
            newmixSpoonGx = sv.vx
            newmixSpoonGy = sv.vy
            newmixSpoonSpeed = Math.hypot(sv.vx, sv.vy)
          }
          pr.x = currentMouseX
          pr.y = currentMouseY
        }

        if (
          newmix &&
          !entranceActive &&
          (!inNewmixStipple || !cursorOk)
        ) {
          newmixSpoonPrimedRef.current = false
        }

        /** Velocity-field grid update — happens once per frame BEFORE the
         * per-particle loop so particles read the field that was just updated
         * by this frame's cursor stroke. The field carries momentum across
         * frames; particles ride it in their integration branch below.
         *
         * Allocated lazily and reallocated only if the resolution knob or
         * canvas size has changed.
         */
        let velocityField: VelocityField | null = null
        if (
          newmix &&
          nm != null &&
          nm.fieldStrength > 0 &&
          c2.width > 0 &&
          c2.height > 0
        ) {
          const targetRes = Math.max(8, Math.floor(nm.fieldGridResolution))
          const existing = newmixVelocityFieldRef.current
          const longSide = Math.max(c2.width, c2.height)
          const targetCellSize = Math.max(
            4,
            Math.floor(longSide / Math.max(4, targetRes))
          )
          const targetCols = Math.max(2, Math.ceil(c2.width / targetCellSize))
          const targetRows = Math.max(2, Math.ceil(c2.height / targetCellSize))
          const needsRebuild =
            !existing ||
            existing.cols !== targetCols ||
            existing.rows !== targetRows ||
            existing.bitmapW !== c2.width ||
            existing.bitmapH !== c2.height
          if (needsRebuild) {
            newmixVelocityFieldRef.current = createVelocityField(
              c2.width,
              c2.height,
              targetRes
            )
            const nf = newmixVelocityFieldRef.current
            newmixVelocityFieldScratchRef.current = new Float32Array(
              nf.cols * nf.rows * 2
            )
            newmixVelocityFieldPressureRef.current = new Float32Array(
              nf.cols * nf.rows
            )
          }
          velocityField = newmixVelocityFieldRef.current
          if (velocityField) {
            /** Inject the cursor's smoothed velocity into cells around the cursor
             * — only when the cursor is actually moving. A still cursor adds
             * nothing, so the field gets to coast on whatever was deposited by
             * the last stroke. Stroke subdivision: when the cursor moves more
             * than `fieldStrokeSubdivisionPx` in a single frame (a flick), we
             * inject at every step along the path so the entire stroke
             * deposits velocity, not just the endpoint — Newmix uses 6px. */
            if (
              cursorOk &&
              inNewmixStipple &&
              !entranceActive &&
              newmixSpoonSpeed > 0.05
            ) {
              /** Slow-stroke velocity floor: scale cursor velocity up to at
               * least nm.fieldInjectMinSpeedPxPerFrame while preserving
               * direction. Slow drags still deposit visible energy; fast
               * strokes are unaffected. */
              let injectGx = newmixSpoonGx
              let injectGy = newmixSpoonGy
              const minSpeed = Math.max(0, nm.fieldInjectMinSpeedPxPerFrame)
              if (minSpeed > 0 && newmixSpoonSpeed < minSpeed) {
                const boost = minSpeed / newmixSpoonSpeed
                injectGx *= boost
                injectGy *= boost
              }
              const prev = newmixTickPrevCursorRef.current
              const haveValidPrev =
                prev.x > -9000 &&
                prev.y > -9000 &&
                Number.isFinite(prev.x) &&
                Number.isFinite(prev.y)
              const subdivPx = Math.max(0, nm.fieldStrokeSubdivisionPx)
              if (haveValidPrev && subdivPx > 0) {
                const dxStroke = currentMouseX - prev.x
                const dyStroke = currentMouseY - prev.y
                const strokeDist = Math.hypot(dxStroke, dyStroke)
                const steps = Math.max(
                  1,
                  Math.ceil(strokeDist / subdivPx)
                )
                /** Each subdivided sample deposits the FULL strength;
                 * cursor speed amplifies total energy along the path
                 * (more samples × full strength). This matches Newmix's
                 * stirring metaphor — a flick across the wordmark
                 * deposits more than a slow drag, as expected. */
                const perStepStrength = nm.fieldInjectStrength
                for (let s = 1; s <= steps; s++) {
                  const u = s / steps
                  injectVelocity(
                    velocityField,
                    prev.x + dxStroke * u,
                    prev.y + dyStroke * u,
                    injectGx,
                    injectGy,
                    nm.fieldInjectRadiusBmp,
                    perStepStrength
                  )
                }
              } else {
                injectVelocity(
                  velocityField,
                  currentMouseX,
                  currentMouseY,
                  injectGx,
                  injectGy,
                  nm.fieldInjectRadiusBmp,
                  nm.fieldInjectStrength
                )
              }
            }
            /** Self-advection — velocity moves itself, so deposited energy
             * travels in its own direction. Run BEFORE diffusion so the
             * trail forms first, then softens at its edges. Stam-style
             * semi-Lagrangian step is unconditionally stable. */
            if (
              nm.fieldAdvectionStrength > 0 &&
              newmixVelocityFieldScratchRef.current
            ) {
              advectVelocityField(
                velocityField,
                newmixVelocityFieldScratchRef.current,
                nm.fieldAdvectionStrength,
                16
              )
            }
            /** Lateral diffusion — energy seeps outward from the inject site
             * each frame so the swirl spreads beyond the cursor's path. */
            if (
              nm.fieldDiffusion > 0 &&
              newmixVelocityFieldScratchRef.current
            ) {
              diffuseVelocityField(
                velocityField,
                nm.fieldDiffusion,
                newmixVelocityFieldScratchRef.current
              )
            }
            /** Pressure projection — Stam-style fluid-solver step that
             * subtracts the divergent component of the velocity field so
             * vortices form/persist instead of smearing. Run AFTER diffusion
             * but BEFORE decay so the projected field is what particles
             * sample this frame. */
            if (
              nm.fieldPressureStrength > 0 &&
              newmixVelocityFieldPressureRef.current
            ) {
              pressureProjectVelocityField(
                velocityField,
                newmixVelocityFieldPressureRef.current,
                nm.fieldPressureStrength,
                nm.fieldPressureIterations
              )
            }
            /** Per-frame decay (frame-rate-correct via dt). */
            decayVelocityField(velocityField, nm.fieldDecayPerSec, 16)
          }
        } else if (newmixVelocityFieldRef.current) {
          /** Field is disabled — clear it so re-enabling later starts fresh
           * instead of resuming with stale momentum from the previous session. */
          clearVelocityField(newmixVelocityFieldRef.current)
        }

        /** Spatial-hash rebuild for the flocking pass. Cell size matches the
         * neighbour radius so the 3x3 window covers ~3R distance. */
        let flockingHash: SpatialHash | null = null
        if (
          newmix &&
          nm != null &&
          nm.flockingStrength > 0 &&
          c2.width > 0 &&
          c2.height > 0
        ) {
          flockingHash = ensureSpatialHash(
            newmixFlockingHashRef.current,
            c2.width,
            c2.height,
            nm.flockingRadiusBmp,
            particles.length
          )
          newmixFlockingHashRef.current = flockingHash
          buildSpatialHash(
            flockingHash,
            particles.length,
            (i) => particles[i]!.x,
            (i) => particles[i]!.y
          )
        }

        /** Curl-noise time argument (seconds). Drives temporal evolution of the
         * potential — same `t` for every particle this frame. */
        const curlT = nowTick / 1000

        /** Cursor-force speed coupling multiplier. Computed once per frame and
         * applied where the cursor disk imparts force on particles. */
        const cursorForceMult =
          nm != null && nm.cursorForceSpeedCoupling > 0
            ? (1 - nm.cursorForceSpeedCoupling) +
              nm.cursorForceSpeedCoupling *
                (newmixSpoonSpeed /
                  Math.max(0.01, nm.cursorForceSpeedReference))
            : 1

        /** Boundary radius (bitmap px) for the reflection wall. Computed once
         * per frame from the canvas half-diagonal. 0 = boundary disabled. */
        const boundaryR =
          nm != null && nm.boundaryRadiusFrac > 0
            ? Math.hypot(c2.width, c2.height) * 0.5 * nm.boundaryRadiusFrac
            : 0
        const boundaryCx = c2.width * 0.5
        const boundaryCy = c2.height * 0.5

        let newmixIdle = false
        if (newmix && nm != null) {
          const tprev = newmixTickPrevCursorRef.current
          if (cursorOk) {
            if (tprev.x <= -9000 || tprev.y <= -9000) {
              newmixFrameMouseDeltaRef.current.dx = 0
              newmixFrameMouseDeltaRef.current.dy = 0
              newmixLastMotionMsRef.current = nowTick
            } else {
              const ddx = currentMouseX - tprev.x
              const ddy = currentMouseY - tprev.y
              newmixFrameMouseDeltaRef.current.dx = ddx
              newmixFrameMouseDeltaRef.current.dy = ddy
              if (ddx * ddx + ddy * ddy > 0.04) {
                newmixLastMotionMsRef.current = nowTick
              }
            }
            tprev.x = currentMouseX
            tprev.y = currentMouseY
          } else {
            newmixFrameMouseDeltaRef.current.dx = 0
            newmixFrameMouseDeltaRef.current.dy = 0
            tprev.x = -9999
            tprev.y = -9999
          }
          newmixIdle =
            nowTick - newmixLastMotionMsRef.current >= nm.idleThresholdMs

          /** Push the SMOOTHED cursor position into the history buffer. Smoothing is a
           * simple exponential lerp toward the raw cursor — direction reversals get
           * blended out so the wake doesn't bend into zigzags. Keep enough history for
           * the wake duration + per-particle time offset so particles released "in the
           * past" can read valid history samples. */
          if (cursorOk) {
            const sm = newmixSmoothedCursorRef.current
            if (sm.x <= -9000 || sm.y <= -9000) {
              sm.x = currentMouseX
              sm.y = currentMouseY
            } else {
              const SMOOTH_K = 0.35
              sm.x += (currentMouseX - sm.x) * SMOOTH_K
              sm.y += (currentMouseY - sm.y) * SMOOTH_K
            }
            const hist = newmixCursorHistoryRef.current
            hist.push({ x: sm.x, y: sm.y, t: nowTick })
            const cutoff =
              nowTick - nm.trailFollowMs - nm.wakeTimeOffsetMs - 500
            while (hist.length > 0 && hist[0]!.t < cutoff) {
              hist.shift()
            }
          } else {
            newmixSmoothedCursorRef.current = { x: -9999, y: -9999 }
          }
        }

        if (!entranceActive) {
          let __pIdx = -1
          for (const p of particles) {
            __pIdx++
            if (newmix && nm != null) {
              /** Expire the wake timer if the deadline has passed — start home return.
               * Also force-expire ALL trailing particles when the cursor is idle, so the
               * wordmark fills back in promptly when the user stops moving the mouse rather
               * than leaving a permanent hole at the cursor's last position. */
              /** Wake expiry — both natural deadline and idle-triggered routes start a
               * visible Bezier home-return flight from the particle's current position.
               * Particles always travel back to home visibly; they never teleport. */
              const wakeExpired =
                p.bhTrailUntilMs != null &&
                (nowTick >= p.bhTrailUntilMs || newmixIdle)
              if (wakeExpired) {
                p.bhTrailUntilMs = null
                p.newmixCursorOriginX = undefined
                p.newmixCursorOriginY = undefined
                p.newmixHomeAtReleaseX = undefined
                p.newmixHomeAtReleaseY = undefined
                /** Snapshot wake-end position as the home-return start. The Bezier flight
                 * is parametric — no velocity handoff needed; particles travel the curve
                 * deterministically and stop at home with no rebound. */
                p.newmixHomeReturnFromX = p.x
                p.newmixHomeReturnFromY = p.y
                p.newmixHomeReturnStartMs = nowTick
              }

              const distM = cursorOk
                ? Math.hypot(
                    p.x - currentMouseX,
                    p.y - currentMouseY
                  )
                : Infinity
              const inCaptureDiskGeom =
                cursorOk && distM < newmixRadius
              const trailingActive =
                p.bhTrailUntilMs != null &&
                nowTick < p.bhTrailUntilMs
              /** Re-capture: trailing particles inside the disk re-enter the swirl cycle. */
              const captured =
                inNewmixStipple && inCaptureDiskGeom && !newmixIdle

              /** When re-capturing a trailing particle, clear the wake state so the swirl/release
               * cycle starts fresh. */
              if (captured && trailingActive) {
                p.bhTrailUntilMs = null
                p.newmixCursorOriginX = undefined
                p.newmixCursorOriginY = undefined
                p.newmixHomeAtReleaseX = undefined
                p.newmixHomeAtReleaseY = undefined
                p.newmixHomeReturnFromX = undefined
                p.newmixHomeReturnFromY = undefined
                p.newmixHomeReturnStartMs = undefined
              }

              /** Capture color invert + glow: only a SUBSET of interacted
               * particles (per captureColorInvertChance) get the invert+glow
               * effect. Roll dice on first capture (transition mix 0 → >0).
               * Selected particles drive captureColorMix toward 1 (snap or
               * fade); non-selected stay at 0. All particles ease back to 0
               * over homeReturnMs when no longer captured. */
              const colorInvertMode = nm.captureColorInvertMode | 0
              if (colorInvertMode > 0) {
                const inverted = captured || trailingActive
                const curMix = p.captureColorMix ?? 0
                if (inverted) {
                  /** First-capture dice roll: only when transitioning from
                   * mix=0 (untouched) into the captured state. Persisted via
                   * captureColorInvertSelected for the lifetime of capture. */
                  if (curMix <= 0) {
                    p.captureColorInvertSelected =
                      Math.random() < nm.captureColorInvertChance
                  }
                  if (p.captureColorInvertSelected === true) {
                    if (colorInvertMode === 1) {
                      p.captureColorMix = 1
                    } else {
                      const fadeMs = Math.max(
                        1,
                        nm.captureColorInvertFadeMs
                      )
                      p.captureColorMix = Math.min(1, curMix + 16 / fadeMs)
                    }
                  }
                } else if (curMix > 0) {
                  const recoverMs = Math.max(1, nm.homeReturnMs)
                  const next = Math.max(0, curMix - 16 / recoverMs)
                  p.captureColorMix = next
                  if (next <= 0) {
                    p.captureColorInvertSelected = false
                  }
                }
              } else if ((p.captureColorMix ?? 0) > 0) {
                p.captureColorMix = 0
                p.captureColorInvertSelected = false
              }

              /** Dual vortex emitters — continuous tangential force, magnitude
               * follows a bell curve over cursor speed. No capture / lock —
               * particles flow through the vortex zone, getting curled by the
               * tangential force when motion is moderate, and just plowed
               * along when motion is fast (curls fade, push wake dominates). */
              applyDualVortexImpulse(
                p,
                currentMouseX,
                currentMouseY,
                newmixSpoonGx,
                newmixSpoonGy,
                newmixSpoonSpeed,
                nm
              )

              if (captured) {
                /** Apply the swirl impulse — particle is being curled around the cursor.
                 * When `fieldDrivenCursor` is on AND the field is active, the impulse
                 * is rerouted into the field cell instead of into the particle. */
                applyNewmixCaptureImpulse(
                  p,
                  currentMouseX,
                  currentMouseY,
                  newmixRadius,
                  newmixSpoonGx,
                  newmixSpoonGy,
                  newmixSpoonSpeed,
                  nm,
                  velocityField
                )
                /** In-disk carry-along: particle advects with the cursor at `inDiskCarryFactor`
                 * of mouse velocity. Produces the "spoon scooping up coffee" feel — captured
                 * particles get carried briefly with the cursor before being released. */
                p.x +=
                  newmixFrameMouseDeltaRef.current.dx *
                  nm.inDiskCarryFactor
                p.y +=
                  newmixFrameMouseDeltaRef.current.dy *
                  nm.inDiskCarryFactor
              } else if (
                p.bhPrevInRadius &&
                !inCaptureDiskGeom &&
                !newmixIdle &&
                cursorOk
              ) {
                /** Probabilistic trailing: only a fraction of exiting particles get wake-trailing
                 * state (per `trailingProbability`). The rest skip directly to home-return.
                 * Keeps the wake thin instead of dragging every particle that passes through. */
                const releaseHash =
                  ((p.hx | 0) * 2654435761 +
                    (p.hy | 0) * 1597334677 +
                    Math.floor(nowTick * 0.013)) >>> 0
                const releaseRoll = (releaseHash & 0xffffff) / 0xffffff
                if (releaseRoll < nm.trailingProbability) {
                  /** Release into wake: store the wall-clock time. The wake playhead reads
                   * cursor history at `releaseTime + (now - releaseTime) * pace`, so the
                   * particle traces the EXACT path the cursor drew. */
                  p.bhTrailUntilMs = nowTick + nm.trailFollowMs
                  p.newmixCursorOriginX = nowTick
                  p.newmixCursorOriginY = 0
                  p.newmixTrailArc = p.x - currentMouseX
                  p.newmixLateral = p.y - currentMouseY
                  p.newmixHomeAtReleaseX = p.hx
                  p.newmixHomeAtReleaseY = p.hy
                  p.vx = 0
                  p.vy = 0
                  /** Exit-velocity boost: shoot the released particle along the cursor's
                   * heading direction so it lands cleanly into the wake. */
                  const gMag = Math.hypot(newmixSpoonGx, newmixSpoonGy)
                  if (gMag > 1e-5) {
                    const gx = newmixSpoonGx / gMag
                    const gy = newmixSpoonGy / gMag
                    p.x += gx * nm.exitVelocityBoostBmp
                    p.y += gy * nm.exitVelocityBoostBmp
                  }
                } else {
                  /** Skip wake — start a direct home-return flight from current position. */
                  p.bhTrailUntilMs = null
                  p.newmixCursorOriginX = undefined
                  p.newmixCursorOriginY = undefined
                  p.newmixHomeReturnFromX = p.x
                  p.newmixHomeReturnFromY = p.y
                  p.newmixHomeReturnStartMs = nowTick
                  p.vx = 0
                  p.vy = 0
                }
              }

              const trailing =
                p.bhTrailUntilMs != null &&
                nowTick < p.bhTrailUntilMs &&
                !captured

              if (captured) {
                /** In-disk integration: spring + friction + suppression so dots can drift around the cursor. */
                let springMul = 1
                if (distM < newmixRadius * 1.05) {
                  const u = Math.max(
                    0,
                    1 - distM / (newmixRadius * 1.05)
                  )
                  springMul = 1 - nm.homeSpringSuppress * u * u
                }
                p.vx += (p.hx - p.x) * springKBase * springMul
                p.vy += (p.hy - p.y) * springKBase * springMul
                p.vx *= frictionK
                p.vy *= frictionK
                /** Hard velocity clamp — see resting-branch note. */
                if (nm.particleSpeedLimit > 0) {
                  const sp = Math.hypot(p.vx, p.vy)
                  if (sp > nm.particleSpeedLimit) {
                    const k = nm.particleSpeedLimit / sp
                    p.vx *= k
                    p.vy *= k
                  }
                }
                p.x += p.vx
                p.y += p.vy
              } else if (
                trailing &&
                p.newmixCursorOriginX != null
              ) {
                /** WAKE PLAYBACK with per-particle pace, stagger, and band spread. Each
                 * particle reads cursor history at its own playhead time and is offset
                 * laterally by a unique constant amount, so the wake reads as a long spread
                 * trail rather than a tight clump. */
                const releaseTime = p.newmixCursorOriginX
                /** Deterministic per-particle hashes (uniform 0..1). */
                const hashSrc =
                  ((p.hx | 0) * 2654435761 + (p.hy | 0) * 1597334677) >>> 0
                const rand01 = (hashSrc & 0xffffff) / 0xffffff
                const rand2 =
                  ((((hashSrc >>> 8) * 2246822519) >>> 0) & 0xffffff) /
                  0xffffff
                const rand3 =
                  ((((hashSrc >>> 16) * 374761393) >>> 0) & 0xffffff) /
                  0xffffff
                const rand4 =
                  ((((hashSrc >>> 4) * 3266489917) >>> 0) & 0xffffff) /
                  0xffffff
                /** Stagger: each particle's effective release is delayed by up to staggerMs.
                 * Before its stagger expires the particle stays put. */
                const stagger = rand3 * nm.wakeReleaseStaggerMs
                const elapsed = nowTick - releaseTime - stagger
                if (elapsed <= 0) {
                  /** Hold release position until stagger expires. */
                  p.vx = 0
                  p.vy = 0
                } else {
                  const paceFactor =
                    1 + (rand01 * 2 - 1) * nm.wakePaceJitter
                  const particlePace = Math.max(
                    0.05,
                    nm.wakePace * paceFactor
                  )
                  /** Per-particle time offset: shift this particle's playhead backward in
                   * history. `rand4²` weighting biases most particles toward the front of
                   * the wake (close to cursor) with a thinner tail extending further back —
                   * produces a defined ribbon that fades with distance, rather than uniform
                   * scatter across the entire history window. */
                  const timeOffset =
                    rand4 * rand4 * nm.wakeTimeOffsetMs
                  const playheadTime =
                    releaseTime +
                    stagger +
                    elapsed * particlePace -
                    timeOffset
                  const sample = lookupCursorHistoryAtTime(
                    newmixCursorHistoryRef.current,
                    playheadTime
                  )
                  const offX = p.newmixTrailArc ?? 0
                  const offY = p.newmixLateral ?? 0
                  const wakeTotalMs = Math.max(
                    1,
                    nm.trailFollowMs - stagger
                  )
                  const u = Math.max(
                    0,
                    Math.min(1, elapsed / wakeTotalMs)
                  )
                  const offDecay = 1 - u
                  if (sample != null) {
                    let tanX = 1
                    let tanY = 0
                    let perpX = 0
                    let perpY = 0
                    const lookAhead = lookupCursorHistoryAtTime(
                      newmixCursorHistoryRef.current,
                      playheadTime + 50
                    )
                    if (lookAhead != null) {
                      const tdx = lookAhead.x - sample.x
                      const tdy = lookAhead.y - sample.y
                      const tlen = Math.hypot(tdx, tdy)
                      if (tlen > 1e-3) {
                        tanX = tdx / tlen
                        tanY = tdy / tlen
                        perpX = -tanY
                        perpY = tanX
                      }
                    }
                    /** Side-locked band offset: sign is determined by the swirl side
                     * (left-swirled particles always offset to the left of the path,
                     * right-swirled to the right). Two clean ribbons emerge instead of
                     * one mixed clump. */
                    const swirlSide =
                      p.newmixSwirlSide != null
                        ? p.newmixSwirlSide
                        : rand2 * 2 - 1 < 0
                          ? -1
                          : 1
                    /** Core vs diffuse split: ~30% of particles are "core" (small magnitude,
                     * sit close to the path edge — define the clean inner spine) and the
                     * remaining ~70% are "diffuse" (larger magnitude, break off the edge
                     * into a fuzzy halo). */
                    const isCore = rand2 < 0.3
                    const magnitudeMul = isCore
                      ? 0.15 + rand2 * 0.5
                      : 0.7 + rand2 * 0.6
                    /** Wake band taper: lateral offset shrinks toward the tail. `u=0` near
                     * the cursor (front) keeps the full band width; `u=1` at the trail end
                     * collapses to zero — produces the teardrop / leaf shape. */
                    const taper = Math.pow(
                      Math.max(0, 1 - u),
                      nm.wakeBandTaperPower
                    )
                    const bandAmp =
                      nm.wakeBandSpreadBmp *
                      swirlSide *
                      magnitudeMul *
                      taper
                    /** Bell-shaped extra spread peaking mid-wake — also tapered so the
                     * mid-wake bulge sits just behind the cursor, not at the back. */
                    const env = 4 * u * (1 - u)
                    const dynLateralAmp =
                      nm.wakeLateralSpreadBmp *
                      swirlSide *
                      magnitudeMul *
                      env *
                      taper
                    /** Per-particle along-tangent stretch: signed offset along cursor heading
                     * so particles spread along the trail axis, not just perpendicular. */
                    const stretchSign = rand01 * 2 - 1
                    const stretchAmp =
                      nm.wakeAlongStretchBmp * stretchSign
                    /** Diffusion: deterministic sine-noise wobble per particle, function of
                     * time + per-particle phase. Two orthogonal sines on different freqs so
                     * each particle traces its own slow wandering path. */
                    const diffPhase1 = rand01 * Math.PI * 2
                    const diffPhase2 = rand2 * Math.PI * 2
                    const tSec = nowTick * 0.001
                    const diffX =
                      Math.sin(
                        tSec * Math.PI * 2 * nm.wakeDiffusionHz +
                          diffPhase1
                      ) *
                      nm.wakeDiffusionBmp
                    const diffY =
                      Math.cos(
                        tSec * Math.PI * 2 * nm.wakeDiffusionHz * 1.37 +
                          diffPhase2
                      ) *
                      nm.wakeDiffusionBmp
                    p.x =
                      sample.x +
                      offX * offDecay +
                      tanX * stretchAmp +
                      perpX * (bandAmp + dynLateralAmp) +
                      diffX
                    p.y =
                      sample.y +
                      offY * offDecay +
                      tanY * stretchAmp +
                      perpY * (bandAmp + dynLateralAmp) +
                      diffY
                  } else if (cursorOk) {
                    p.x = currentMouseX + offX * offDecay
                    p.y = currentMouseY + offY * offDecay
                  }
                  p.vx = 0
                  p.vy = 0
                }
              } else if (
                p.newmixHomeReturnStartMs != null &&
                p.newmixHomeReturnFromX != null &&
                p.newmixHomeReturnFromY != null
              ) {
                /** V3-ERA VISIBLE HOME-RETURN FLIGHT. Particles travel back to home along
                 * a per-particle curved Bezier path at full opacity. Parametric (no spring
                 * physics) so there's no rebound at home — particles arrive cleanly on
                 * the cubic-ease-out curve and stop. */
                const hashSrc =
                  ((p.hx | 0) * 2654435761 +
                    (p.hy | 0) * 1597334677) >>> 0
                const rand1 = (hashSrc & 0xffffff) / 0xffffff
                const rand2 =
                  ((((hashSrc >>> 8) * 2246822519) >>> 0) & 0xffffff) /
                  0xffffff
                const rand3 =
                  ((((hashSrc >>> 16) * 374761393) >>> 0) & 0xffffff) /
                  0xffffff
                const durJitter =
                  1 + (rand1 * 2 - 1) * nm.homeReturnDurationJitter
                const dur = Math.max(100, nm.homeReturnMs * durJitter)
                const elapsed = nowTick - p.newmixHomeReturnStartMs
                const t = Math.max(0, Math.min(1, elapsed / dur))
                /** Cubic ease-out for graceful arrival at home. */
                const e = 1 - (1 - t) * (1 - t) * (1 - t)
                const sx = p.newmixHomeReturnFromX
                const sy = p.newmixHomeReturnFromY
                const ex = p.hx
                const ey = p.hy
                const dx = ex - sx
                const dy = ey - sy
                const dist = Math.hypot(dx, dy)
                /** Per-particle Bezier control point with unique sweep angle + magnitude. */
                const sweepAngle = (rand2 - 0.5) * Math.PI * 2
                const curveAmp =
                  nm.homeReturnCurveBmp *
                  (0.4 + rand3 * 1.2) *
                  Math.min(1, dist / 200 + 0.3)
                const cdx = Math.cos(sweepAngle) * curveAmp
                const cdy = Math.sin(sweepAngle) * curveAmp
                const mx = (sx + ex) * 0.5 + cdx
                const my = (sy + ey) * 0.5 + cdy
                const oneMinusE = 1 - e
                const bx =
                  oneMinusE * oneMinusE * sx +
                  2 * oneMinusE * e * mx +
                  e * e * ex
                const by =
                  oneMinusE * oneMinusE * sy +
                  2 * oneMinusE * e * my +
                  e * e * ey
                /** Optional bell-shape diffusion wobble for organic flight. */
                const homeEnv = 4 * t * (1 - t)
                const homePhase1 = rand1 * Math.PI * 2
                const homePhase2 = rand2 * Math.PI * 2
                const homeTSec = nowTick * 0.001
                const homeDiffX =
                  Math.sin(homeTSec * 4.1 + homePhase1) *
                  nm.homeReturnDiffusionBmp *
                  homeEnv
                const homeDiffY =
                  Math.cos(homeTSec * 5.3 + homePhase2) *
                  nm.homeReturnDiffusionBmp *
                  homeEnv
                p.x = bx + homeDiffX
                p.y = by + homeDiffY
                p.entranceOpacity = 1
                p.vx = 0
                p.vy = 0
                if (t >= 1) {
                  p.x = p.hx
                  p.y = p.hy
                  p.newmixHomeReturnFromX = undefined
                  p.newmixHomeReturnFromY = undefined
                  p.newmixHomeReturnStartMs = undefined
                  p.newmixSwirlSide = undefined
                }
              } else {
                /** Resting at home — usually no force, no velocity. BUT if the
                 * dual-vortex emitter just applied tangential force this frame,
                 * we need to LET the velocity play out (with strong spring
                 * suppression) so the orbital motion develops into a visible
                 * curl before snapping back. Without this, the vortex impulse
                 * gets wiped on the very next line and the effect is invisible. */
                const vortexSupp = p.newmixVortexSuppress ?? 0
                /** Velocity-field contribution — sample the lingering-momentum
                 * grid at this particle's resting position and add it to the
                 * particle's velocity. This is what produces the "swirl
                 * continues after the cursor stops" effect: even when no
                 * cursor force is active, the field carries momentum and lifts
                 * resting particles into temporary motion. */
                let fieldRideX = 0
                let fieldRideY = 0
                if (
                  velocityField &&
                  nm.fieldStrength > 0 &&
                  nm.fieldRideStrength > 0
                ) {
                  const sampleOut =
                    newmixVelocityFieldSampleRef.current
                  sampleVelocityField(
                    velocityField,
                    p.x,
                    p.y,
                    sampleOut
                  )
                  const ride =
                    nm.fieldStrength * nm.fieldRideStrength
                  fieldRideX = sampleOut[0] * ride
                  fieldRideY = sampleOut[1] * ride
                  p.vx += fieldRideX
                  p.vy += fieldRideY
                }
                /** Curl-noise micro-turbulence — divergence-free organic
                 * marbling, sampled per-particle from a 2D potential field
                 * that drifts in time. Never zero unless amplitude is 0. */
                let curlX = 0
                let curlY = 0
                if (nm.curlNoiseAmplitude > 0) {
                  const curlOut = newmixCurlNoiseSampleRef.current
                  sampleCurlNoise(
                    p.x,
                    p.y,
                    curlT,
                    nm.curlNoiseScale,
                    nm.curlNoiseAmplitude,
                    nm.curlNoiseEvolutionHz,
                    curlOut
                  )
                  curlX = curlOut[0]
                  curlY = curlOut[1]
                  p.vx += curlX
                  p.vy += curlY
                }
                /** Flocking velocity alignment — blend a fraction of a single
                 * neighbour's velocity into this particle's. Round-robin so
                 * we only touch a fraction of particles each frame. */
                let flockX = 0
                let flockY = 0
                if (
                  flockingHash &&
                  nm.flockingStrength > 0 &&
                  ((p.hx | 0) + (p.hy | 0) + nowTick) %
                    Math.max(1, Math.round(1 / Math.max(0.01, nm.flockingProcessFraction))) ===
                    0
                ) {
                  const flockHash =
                    ((p.hx | 0) * 374761393 + (p.hy | 0) * 668265263 + nowTick) >>> 0
                  const flockRand = (flockHash & 0xffffff) / 0xffffff
                  const neighborIdx = pickNeighbor(
                    flockingHash,
                    p.x,
                    p.y,
                    __pIdx,
                    flockRand
                  )
                  if (neighborIdx >= 0) {
                    const n = particles[neighborIdx]!
                    flockX = (n.vx - p.vx) * nm.flockingStrength
                    flockY = (n.vy - p.vy) * nm.flockingStrength
                    p.vx += flockX
                    p.vy += flockY
                  }
                }
                /** Compound activation: vortex impulse OR enough field velocity
                 * OR curl/flocking velocity at this position. If any is
                 * active, run integrated motion. */
                const fieldRideMag = Math.hypot(fieldRideX, fieldRideY)
                const curlMag = Math.hypot(curlX, curlY)
                const flockMag = Math.hypot(flockX, flockY)
                const ambientMag = fieldRideMag + curlMag + flockMag
                if (vortexSupp > 0.05 || ambientMag > 0.05) {
                  /** Spring is ALWAYS strong (Newmix-style) — the field nudges
                   * particles, friction damps them, the spring continually pulls
                   * them home. Without this, particles ride field flow lines
                   * indefinitely and trace long arcs across the screen.
                   *
                   * Vortex suppression remains as a separate concession because
                   * it's a brief impulse (~93%/frame decay) that needs a moment
                   * to develop into a visible curl. Field activity does NOT
                   * suppress the spring. */
                  const springMul = Math.max(0, 1 - vortexSupp * 1.6)
                  p.vx += (p.hx - p.x) * springKBase * springMul
                  p.vy += (p.hy - p.y) * springKBase * springMul
                  p.vx *= frictionK
                  p.vy *= frictionK
                  /** Hard velocity clamp (Newmix uses 30 px/frame). Without
                   * this, a hot field can accelerate particles to escape
                   * velocities the spring + friction can't counter. */
                  if (nm.particleSpeedLimit > 0) {
                    const sp = Math.hypot(p.vx, p.vy)
                    if (sp > nm.particleSpeedLimit) {
                      const k = nm.particleSpeedLimit / sp
                      p.vx *= k
                      p.vy *= k
                    }
                  }
                  p.x += p.vx
                  p.y += p.vy
                  /** Decay vortex influence each frame so the particle
                   * eventually returns to its resting state. */
                  p.newmixVortexSuppress = vortexSupp * 0.93
                } else {
                  p.vx = 0
                  p.vy = 0
                  /** Snap any subpixel residual. */
                  if (
                    (p.hx - p.x) * (p.hx - p.x) +
                      (p.hy - p.y) * (p.hy - p.y) <
                    0.25
                  ) {
                    p.x = p.hx
                    p.y = p.hy
                  }
                }
              }

              /** Track in-radius status so the next exit triggers a release. Trailing particles
               * inside the disk are re-captured (handled above) and will re-enter the swirl cycle. */
              p.bhPrevInRadius = inCaptureDiskGeom

              /** Boundary reflection (the "coffee cup wall"). Particles past the
               * boundary radius are pushed back inward and their velocity is
               * reflected along the inward normal, producing the classic
               * "stuff piles up at the rim and curls back" look. */
              if (boundaryR > 0) {
                const bdx = p.x - boundaryCx
                const bdy = p.y - boundaryCy
                const bDist = Math.hypot(bdx, bdy)
                if (bDist > boundaryR && bDist > PHYSICS_DIST_EPSILON) {
                  const nx = bdx / bDist
                  const ny = bdy / bDist
                  /** Push position back to the wall. */
                  p.x = boundaryCx + nx * boundaryR
                  p.y = boundaryCy + ny * boundaryR
                  /** Reflect velocity along the inward normal: v - 2(v·n)n,
                   * scaled by restitution. */
                  const vDotN = p.vx * nx + p.vy * ny
                  if (vDotN > 0) {
                    const restitution = Math.max(
                      0,
                      Math.min(1, nm.boundaryRestitution)
                    )
                    p.vx -= (1 + restitution) * vDotN * nx
                    p.vy -= (1 + restitution) * vDotN * ny
                  }
                }
              }
            }
          }
        }

        const dotDprTick = c2.width / Math.max(1, c2.clientWidth)
        const parallaxX = T.x * PARALLAX_MULT_C
        const parallaxY = T.y * PARALLAX_MULT_C
        /** Metaball post-process needs the particles drawn LARGER and SOFTER so
         * overlapping ones can fuse during the blur+contrast pass. Temporarily
         * upsize when the toggle is on. */
        const metaballOn =
          newmix && nm != null && nm.metaballEnabled > 0.5
        const drawSize = particleDrawSizeBmpRef.current
        const renderSize = metaballOn
          ? Math.max(drawSize, nm!.metaballGlowRadius)
          : drawSize
        drawLayer(
          ctx2,
          c2,
          particles,
          sx,
          sy,
          mouseRef,
          dotDprTick,
          parallaxX,
          parallaxY,
          applyCanvasParallax,
          renderSize,
          null,
          newmix && nm != null ? nm.wakeAlphaMult : 1,
          /** Newmix mode uses crisp single-pass rendering; other modes keep the dual-pass bloom. */
          !newmix,
          wordmarkGradientRef.current,
          newmix && nm != null ? nm.velocityAlphaBoost : 0,
          newmix && nm != null ? nm.velocityAlphaBoostCap : 0.35,
          newmix && nm != null ? nm.captureColorInvertGlowBoost : 0
        )
        /** Apply the metaball blur+contrast pass after the particles are
         * rendered. Cached offscreen lives on a ref. */
        if (metaballOn && nm != null) {
          newmixMetaballGlowRef.current = applyMetaballPostprocess(
            ctx2,
            c2,
            newmixMetaballGlowRef.current,
            nm.metaballBlurPx,
            nm.metaballThreshold
          )
        }

        const tiltEl = logoTiltLayerRef.current
        if (tiltEl != null) {
          const cur = logoTiltCurrentRef.current
          const tgt = logoTiltTargetRef.current
          const k = LOGO_TILT_SMOOTHING
          cur.rx += (tgt.rx - cur.rx) * k
          cur.ry += (tgt.ry - cur.ry) * k
          tiltEl.style.transform = `rotateX(${cur.rx}deg) rotateY(${cur.ry}deg)`
        }
      } catch (err) {
        console.error("[HomeParticleLogoHero] RAF step failed:", err)
      } finally {
        frameId = requestAnimationFrame(tick)
        rafRef.current = frameId
      }
    }

    const resume = () => {
      if (frameId == null) {
        frameId = requestAnimationFrame(tick)
        rafRef.current = frameId
      }
    }
    rafResumeRef.current = resume
    resume()

    return () => {
      rafResumeRef.current = () => {}
      if (frameId != null) {
        cancelAnimationFrame(frameId)
        frameId = null
      }
      rafRef.current = null
    }
  }, [])

  const applyWindowPointerClient = useCallback(
    (
      clientX: number,
      clientY: number,
      opts?: { recordPointerMove?: boolean }
    ) => {
      lastPointerClientRef.current = { x: clientX, y: clientY }

      if (!MOUSE_CURSOR_STIPPLE_COUPLED_EFFECTS_ENABLED) {
        parallaxLRef.current = { x: 0, y: 0 }
        logoTiltTargetRef.current = { rx: 0, ry: 0 }
        return
      }

      const canvas = canvasCRef.current
      if (!canvas || canvas.width <= 0) {
        logoTiltTargetRef.current = { rx: 0, ry: 0 }
        return
      }

      const isFs = presentationRef.current === "fullscreen"
      const { sx, sy } = canvasScale(canvas)
      const raw = clientToBitmapViewport(clientX, clientY, canvas)
      const rawX = Number.isFinite(raw.x) ? raw.x : -9999
      const rawY = Number.isFinite(raw.y) ? raw.y : -9999
      const reducePlx = reduceParallaxRef.current
      const T = parallaxTRef.current
      const Tx = Number.isFinite(T.x) ? T.x : 0
      const Ty = Number.isFinite(T.y) ? T.y : 0
      const hitBx = !reducePlx && !isFs ? Tx * PARALLAX_MULT_C * sx : 0
      const hitBy = !reducePlx && !isFs ? Ty * PARALLAX_MULT_C * sy : 0
      const mx = rawX - hitBx
      const my = rawY - hitBy

      const parts = particlesRef.current
      const b = logoInteractBoundsRef.current
      const stippleR =
        interactionModeRef.current === "newmix"
          ? newmixLiveMergedRef.current.radius
          : DRAG_RADIUS
      const nearStipple = pointerInStippleInteractionRange(
        mx,
        my,
        b,
        parts,
        stippleR
      )

      const rect = canvas.getBoundingClientRect()
      const halfW = Math.max(rect.width / 2, 1)
      const halfH = Math.max(rect.height / 2, 1)

      if (nearStipple) {
        const nx = Math.max(
          -1,
          Math.min(
            1,
            (clientX - (rect.left + rect.width / 2)) / halfW
          )
        )
        const ny = Math.max(
          -1,
          Math.min(
            1,
            (clientY - (rect.top + rect.height / 2)) / halfH
          )
        )
        if (!isFs && !reducePlx) {
          parallaxLRef.current = {
            x: nx * PARALLAX_MOUSE_SENSITIVITY,
            y: ny * PARALLAX_MOUSE_SENSITIVITY,
          }
        } else {
          parallaxLRef.current = { x: 0, y: 0 }
        }
        if (!reducePlx) {
          logoTiltTargetRef.current = {
            rx: -ny * LOGO_TILT_MAX_DEG,
            ry: nx * LOGO_TILT_MAX_DEG,
          }
        } else {
          logoTiltTargetRef.current = { rx: 0, ry: 0 }
        }
      } else {
        parallaxLRef.current = { x: 0, y: 0 }
        logoTiltTargetRef.current = { rx: 0, ry: 0 }
      }
    },
    []
  )

  useEffect(() => {
    /** Window `mousemove` / `mousedown` (not document `pointer*`) for reliable hover without activation gating. */
    const syncClient = (clientX: number, clientY: number) => {
      applyWindowPointerClient(clientX, clientY, { recordPointerMove: true })
    }

    const onMouseMove = (e: MouseEvent) => {
      syncClient(e.clientX, e.clientY)
    }

    const onMouseDown = (e: MouseEvent) => {
      syncClient(e.clientX, e.clientY)
    }

    const onResumePointer = () => {
      const lp = lastPointerClientRef.current
      if (lp != null) {
        applyWindowPointerClient(lp.x, lp.y, { recordPointerMove: false })
      } else {
        const hero = wrapRef.current
        if (hero != null) {
          const r = hero.getBoundingClientRect()
          const cx = Math.floor(r.left + r.width / 2)
          const cy = Math.floor(r.top + r.height / 2)
          lastPointerClientRef.current = { x: cx, y: cy }
          applyWindowPointerClient(cx, cy, { recordPointerMove: false })
        } else {
          const { wBox, hBox } = viewportBox()
          const cx = Math.floor(wBox / 2)
          const cy = Math.floor(hBox / 2)
          lastPointerClientRef.current = { x: cx, y: cy }
          applyWindowPointerClient(cx, cy, { recordPointerMove: false })
        }
      }
      rafResumeRef.current()
    }

    const onPointerMove = (e: PointerEvent) => {
      syncClient(e.clientX, e.clientY)
    }

    const clearPointerLeaveDocument = () => {
      lastPointerClientRef.current = null
      mouseRawBmpRef.current = null
      parallaxLRef.current = { x: 0, y: 0 }
      logoTiltTargetRef.current = { rx: 0, ry: 0 }
      logoTiltCurrentRef.current = { rx: 0, ry: 0 }
      const tiltEl = logoTiltLayerRef.current
      if (tiltEl != null) {
        tiltEl.style.transform = "rotateX(0deg) rotateY(0deg)"
      }
      mouseRef.current.x = -9999
      mouseRef.current.y = -9999
      wakeTrailRef.current = []
      viscousCoffeeTrailRef.current = []
      viscousCoffeeErodeAccRef.current = 0
      viscousCoffeeSpoonPrimedRef.current = false
      viscousCoffeeSpoonVelRef.current = { vx: 1, vy: 0 }
      newmixTrailRef.current = []
      newmixSpoonPrimedRef.current = false
      newmixSpoonVelRef.current = { vx: 1, vy: 0 }
      newmixLastMotionMsRef.current = 0
      newmixFrameMouseDeltaRef.current = { dx: 0, dy: 0 }
      newmixTickPrevCursorRef.current = { x: -9999, y: -9999 }
      newmixCursorHistoryRef.current = []
      newmixSmoothedCursorRef.current = { x: -9999, y: -9999 }
      flowSpoonVelRef.current = { vx: 0, vy: 0 }
      flowPrevCursorRef.current = { x: -9999, y: -9999 }
      const cw = viscousCoffeeWakeParticlesRef.current
      if (cw != null) {
        for (const p of cw) {
          p.vx = 0
          p.vy = 0
          p.baseAlpha = 0
        }
      }
    }

    const onDocumentMouseOut = (e: MouseEvent) => {
      const rel = e.relatedTarget as Node | null
      if (rel != null && document.documentElement.contains(rel)) {
        return
      }
      clearPointerLeaveDocument()
    }

    const onWindowBlur = () => {
      clearPointerLeaveDocument()
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        clearPointerLeaveDocument()
      }
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true })
    window.addEventListener("pointermove", onPointerMove, { passive: true })
    window.addEventListener("mousedown", onMouseDown, { passive: true })
    window.addEventListener("focus", onResumePointer)
    window.addEventListener("pageshow", onResumePointer)
    window.addEventListener("blur", onWindowBlur)
    document.addEventListener("mouseout", onDocumentMouseOut)
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("focus", onResumePointer)
      window.removeEventListener("pageshow", onResumePointer)
      window.removeEventListener("blur", onWindowBlur)
      document.removeEventListener("mouseout", onDocumentMouseOut)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [applyWindowPointerClient])

  const stackBaseClass =
    presentation === "fullscreen"
      ? "pointer-events-none fixed inset-0 overflow-hidden bg-ui-fg-base"
      : "pointer-events-none absolute inset-0 overflow-hidden bg-transparent"

  const stackStyle: CSSProperties = {
    pointerEvents: "none",
    zIndex: presentation === "fullscreen" ? 30 : 2,
    ...(mixRevealActive
      ? {
          opacity: isRevealed ? 1 : 0,
          transform: isRevealed ? "translateY(0)" : "translateY(20px)",
          transition: `opacity ${MIX_REVEAL_MS}ms ${MIX_REVEAL_EASE}, transform ${MIX_REVEAL_MS}ms ${MIX_REVEAL_EASE}`,
        }
      : {}),
  }

  const particleStack = (
    <div ref={stackRef} className={stackBaseClass} style={stackStyle}>
      <div
        className="absolute inset-0"
        style={{
          perspective: `${LOGO_TILT_PERSPECTIVE_PX}px`,
          perspectiveOrigin: "50% 42%",
        }}
      >
        <div
          ref={logoTiltLayerRef}
          className="h-full w-full"
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "50% 42%",
          }}
        >
          {/* Visible until canvas particle raster succeeds; avoids double logo vs stipple */}
          <img
            src={logoSrc}
            alt=""
            decoding="async"
            className={`pointer-events-none absolute left-1/2 z-[5] max-w-[min(96%,80rem)] -translate-x-1/2 -translate-y-1/2 object-contain transition-opacity duration-300 ${
              presentation === "fullscreen"
                ? "top-[48%] max-h-[min(50vh,460px)]"
                : "top-1/2 max-h-[min(58vh,560px)]"
            } ${logoRasterReady ? "opacity-0" : "opacity-100"}`}
            draggable={false}
            aria-hidden={logoRasterReady}
          />
          <canvas
            ref={canvasORef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[10] block h-full w-full min-h-0 min-w-0 !bg-transparent [background:transparent!important] [image-rendering:auto]"
            style={{
              pointerEvents: "none",
              background: "transparent",
            }}
          />
          <canvas
            ref={canvasARef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[11] block h-full w-full min-h-0 min-w-0 !bg-transparent [background:transparent!important] [image-rendering:auto]"
            style={{
              pointerEvents: "none",
              background: "transparent",
            }}
          />
          <canvas
            ref={canvasCRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[12] block h-full w-full min-h-0 min-w-0 !bg-transparent [background:transparent!important] [image-rendering:auto]"
            style={{
              pointerEvents: "none",
              background: "transparent",
            }}
          />
        </div>
      </div>
    </div>
  )

  if (loadFailed) {
    if (presentation === "fullscreen") {
      return (
        <div
          className="flex min-h-screen flex-col items-center justify-center bg-ui-fg-base text-white"
          aria-label="SC Prints"
        >
          <NextImage
            src={FALLBACK_SRC}
            alt="SC Prints"
            width={320}
            height={120}
            className="h-auto w-full max-w-xs object-contain opacity-90"
          />
        </div>
      )
    }
    return (
      <section
        aria-label="SC Prints"
        className="relative flex min-h-[min(72vh,680px)] flex-col bg-black text-white"
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
          <NextImage
            src={FALLBACK_SRC}
            alt="SC Prints"
            width={320}
            height={120}
            className="h-auto w-full max-w-xs object-contain opacity-90"
          />
        </div>
      </section>
    )
  }

  if (presentation === "fullscreen") {
    const portalTarget =
      typeof document !== "undefined" ? document.body : null
    return (
      <>
        {portalReady &&
          layerReady &&
          portalTarget &&
          createPortal(particleStack, portalTarget)}
      </>
    )
  }

  return (
    <section
      aria-label={
        sectionAriaLabel ?? "SC Prints — interactive particle logo"
      }
      className={`relative flex min-h-[min(72vh,680px)] w-full flex-col overflow-hidden ${bgClassName} text-white`}
    >
      <div
        ref={(node) => {
          wrapRef.current = node
          setParticleLayerHostReady(node != null)
        }}
        className="relative isolate min-h-[min(72vh,680px)] w-full flex-1 overflow-hidden"
        aria-hidden
      />
      {portalReady &&
        layerReady &&
        typeof document !== "undefined" &&
        wrapRef.current != null &&
        createPortal(particleStack, wrapRef.current)}
    </section>
  )
}
