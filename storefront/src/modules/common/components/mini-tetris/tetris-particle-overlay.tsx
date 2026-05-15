"use client"

import { useEffect, useRef } from "react"

import {
  parseHexColor,
  WORDMARK_GRADIENT,
} from "@modules/common/lib/wordmark-gradient"
import type { VelocityField } from "@modules/home/components/home-particle-logo-hero/velocity-field"
import {
  createVelocityField,
  decayVelocityField,
  diffuseVelocityField,
  pressureProjectVelocityField,
  sampleVelocityField,
} from "@modules/home/components/home-particle-logo-hero/velocity-field"
import { sampleCurlNoise } from "@modules/home/components/home-particle-logo-hero/curl-noise"

const BOARD_W = 10
const BOARD_H = 20

/** Ambient particles per cell — fixed homes covering the entire board. Filled cells
 * act as obstacles pushing them outward; empty cells let them rest. 400 × 200 cells
 * = 80 000 ambient particles. Stored in typed arrays + rendered via putImageData. */
const AMBIENT_PER_CELL = 400
/** Burst pool capacity (transient one-shot particles for lock/clear effects). */
const MAX_BURST_PARTICLES = 6000
/** Particles spawned per cell when the active piece locks. */
const LOCK_BURST_PER_CELL = 22
/** Particles spawned per cell when a line is cleared. */
const CLEAR_BURST_PER_CELL = 38
/** Burst lifetime (ms). */
const BURST_LIFE_MS = 1700
/** Spring stiffness pulling ambient particles back to home each frame. Low spring +
 * high friction = particles linger after being pushed, leaving glowing wakes. */
const HOME_SPRING = 0.028
/** Friction multiplier for ambient particles. */
const HOME_FRICTION = 0.94
/** Radius (in cell units) of the obstacle force around each filled cell. */
const OBSTACLE_RADIUS_CELLS = 0.65
/** Force magnitude pushing particles out of filled cells. */
const OBSTACLE_FORCE = 4.2
/** Burst initial speed (CSS px / frame). */
const LOCK_BURST_SPEED = 4.5
const CLEAR_BURST_SPEED = 6.5
/** Active-piece movement transition (ms). 480 splits the difference: ease-out
 * means the block snaps most of the way in ~120ms (player input feels
 * responsive), and the long settle keeps natural drops fluid edge-to-edge. */
const PIECE_TRANSITION_MS = 560
/** Cap on visual lag distance (in cells). Hard drops would otherwise leave a
 * 20-cell trail; we clamp so it caps out at ~1 cell of smoothing slack at rest.
 * Velocity-coupled clamp scales this up during fast moves (see pieceMotion logic). */
const PIECE_MAX_LAG_CELLS = 1.2
/** Max bonus lag (cells) added on top of the base clamp during rapid movement. */
const PIECE_VELOCITY_LAG_BONUS = 1.5
/** Block "blob": each filled cell renders as a SOLID core rect + fizzy fringe of
 * coloured particles on the rim. Core gives readable shape; fringe gives organic
 * fluid edges that smoothly track sub-pixel motion of the active piece. */
const BLOCK_CORE_HALF_FRAC = 0.4
/** Number of fringe particles per cell — light dusting on the cell perimeter. */
const BLOCK_FRINGE_PARTICLES_PER_CELL = 32
/** Fringe particles' jitter spread inside a cell (fraction of cell halfsize). */
const BLOCK_FRINGE_HALF_FRAC = 0.55
/** Water-drop ripple: radial wave expanding outward from the impact point on lock.
 * Pushes particles radially outward with amplitude that decays with distance. */
const RIPPLE_SPEED = 6
const RIPPLE_BAND_HALF = 24
const RIPPLE_AMPLITUDE = 7
const RIPPLE_AMPLITUDE_DECAY = 0.992
const RIPPLE_MIN_AMPLITUDE = 0.2
/** CSS-px half-width of the visible glowing wave-front drawn into pixBuf. Higher
 * = thicker, softer ring. */
const RIPPLE_RING_HALF_PX = 7
/** Upward bias for ripple — water drops mostly affect the surface above impact. */
const RIPPLE_UPWARD_BIAS = 1.4
/** Line-clear flash: horizontal stripe over the cleared row that fades over time. */
const FLASH_LIFE_MS = 820
/** Excitement decay per frame (multiplicative). Lower = longer-lingering glow
 * trails behind moving blocks. 0.985 gives ~3-second visible afterglow. */
const EXCITEMENT_DECAY = 0.991
/** Ambient particle base alpha at rest (0-1). Quiet field at rest, brightens to
 * full white when pushed (via excitement). */
const AMBIENT_BASE_ALPHA = 0.72
/** Vignette darkness at canvas corners (0 = no vignette, 1 = corners fully dark). */
const VIGNETTE_STRENGTH = 0.62
/** Extra vignette bias toward the top of the board (where the playfield is
 * usually empty) so the eye is drawn toward the action. */
const VIGNETTE_TOP_BIAS = 0.35
/** Locked-block "breathing": tiny time-based jitter so locked blobs feel alive
 * instead of frozen. Amplitude in CSS px. */
const LOCKED_BREATHE_PX = 1.2
/** Lock-impact white anticipation flash drawn over the lock cells for a brief
 * window before the ripple starts. */
const LOCK_FLASH_LIFE_MS = 180
/** Field directional drift: each ambient particle's home oscillates in a small
 * circular orbit defined by its noise-derived drift angle. Reads as gentle
 * flowing texture on top of the spring physics. */
const FIELD_DRIFT_PX = 1.6
const FIELD_DRIFT_RATE = 0.0008
/** Rotation animation: when the player rotates the piece, briefly scale-pulse
 * it. Reads as a deliberate punctuation, not an instant teleport. */
const ROTATION_PULSE_MS = 320
const ROTATION_PULSE_SCALE = 0.12
/** Velocity-coupled effects: piece velocity (cells/frame, smoothed) is captured
 * at lock time and used to scale ripple amplitude + the lock burst. Faster
 * impacts produce stronger ripples. */
const RIPPLE_VELOCITY_SCALE = 0.6
/** Line-clear shockwave: initial downward impulse on cleared row, then an upward
 * travelling band that pushes particles upward as it rises through the board. */
const LINE_CLEAR_FALL_IMPULSE = 5
/** Wave upward speed (CSS px / frame) — negative because canvas Y is downward. */
const WAVE_SPEED = -9
/** Wave amplitude (impulse strength at band centre). */
const WAVE_STRENGTH = 2.6
/** Decay of wave strength per frame. Wave dies before reaching the top edge if
 * board is short — and amplitude tapers naturally. */
const WAVE_DECAY = 0.99
/** Half-height of the wave's effect band (CSS px). Wider band = larger ripple. */
const WAVE_BAND_HALF = 30

/** ============================================================
 * Velocity field — Stam-style fluid grid that drives organic
 * vortex / curl behaviour on top of the existing spring physics.
 * Game events (lock, line clear, rotation, hard drop, etc.) deposit
 * velocity into the field; pressure projection makes it curl
 * naturally; ambient particles read it bilinearly each frame and
 * gain a small fraction of the cell velocity. Decay drains it back
 * to zero over a few seconds.
 * ============================================================ */

/** Cells along the longer canvas axis. ~24 means each tetris cell is
 * subdivided into ~2x2 field cells — fine enough for visible vortex
 * shapes inside a single tetris cell, coarse enough to be cheap. */
const FIELD_RESOLUTION = 24
/** Fraction of cell velocity added to each ambient particle per frame. */
const FIELD_RIDE_STRENGTH = 0.06
/** Energy lost per second when nothing is depositing. ~0.55 = settles in
 * 3-4 seconds, matches Newmix's pacing. */
const FIELD_DECAY_PER_SEC = 0.42
/** Lateral diffusion per frame — cells bleed energy to 4 neighbours. */
const FIELD_DIFFUSION = 0.05
/** Pressure projection strength (Stam fluid solver). 0.4 = clean curls. */
const FIELD_PRESSURE_STRENGTH = 0.4
/** How many pressure-projection passes per frame. 1 is enough at this
 * grid resolution. */
const FIELD_PRESSURE_ITERS = 1

/** Lock event — outward radial blast at lock centroid. */
const LOCK_FIELD_BLAST_RADIUS_CSS = 60
const LOCK_FIELD_BLAST_MAGNITUDE = 3.5
/** Line clear — downward + outward energy on cleared row. */
const CLEAR_FIELD_DOWN_MAGNITUDE = 3.5
const CLEAR_FIELD_OUTWARD_MAGNITUDE = 5
/** Rotation — tangential spin around piece centroid. */
const ROTATION_FIELD_SPIN_RADIUS_CSS = 50
const ROTATION_FIELD_SPIN_MAGNITUDE = 4
/** Hard drop — vertical streak deposit along the column the piece
 * traveled. Triggered when a lock event registers a drop > 3 cells. */
const HARDDROP_MIN_CELLS = 3
const HARDDROP_FIELD_STREAK_MAGNITUDE = 4.5
const HARDDROP_FIELD_STREAK_RADIUS_CSS = 16
/** Soft fall / piece-following wake. Subtle; deposited every frame the
 * piece is moving. */
const FALL_FIELD_WAKE_MAGNITUDE = 0.6
/** Side movement — lateral impulse at the piece's leading edge. */
const SIDE_FIELD_PUSH_MAGNITUDE = 1.6
/** Game-over fizzle — strong upward burst when the player loses. */
const GAMEOVER_FIELD_UP_MAGNITUDE = 5.5

/** Curl-noise micro-turbulence on burst particles. Cheap (~6 sin/cos
 * per burst per frame), gives sparks an organic swirl rather than
 * straight-line ballistic flight. */
const BURST_CURL_AMPLITUDE = 0.18
const BURST_CURL_SCALE = 0.018
const BURST_CURL_HZ = 0.6

/** Per-piece-type RGB palette used to render the active piece on canvas (where it
 * can be smoothly interpolated between drop ticks). Roughly matches the DOM palette
 * but uses concrete RGB so we can write directly to the pixel buffer. */
const PIECE_RGB: ReadonlyArray<readonly [number, number, number]> = [
  [61, 207, 194], // I — teal (brand-accent)
  [255, 46, 99], // O — magenta (brand-secondary)
  [181, 86, 255], // T — violet
  [69, 164, 255], // S — blue
  [255, 193, 69], // Z — yellow
  [193, 255, 69], // J — lime
  [255, 107, 53], // L — orange
]
/** Pre-built gradient lookup table size. */
const GRAD_LUT_SIZE = 512

type Active = { t: number; r: number; x: number; y: number }
type Display = number[][]
type Board = number[][]

type Burst = {
  alive: boolean
  x: number
  y: number
  vx: number
  vy: number
  bornAt: number
  lifeMs: number
}

type ClearKind = "single" | "double" | "triple" | "tetris"
type Phase = "intro" | "playing" | "over"

type Props = {
  containerRef: React.RefObject<HTMLDivElement | null>
  display: Display
  board: Board
  active: Active | null
  lines: number
  gameOver: boolean
  /** Cells of the ghost piece (landing position). Null while intro/over or
   * when the active piece is already at its landing. */
  ghostCells: { bx: number; by: number; t: number }[] | null
  phase: Phase
  level: number
  lastClearKind: ClearKind | null
  lastClearAt: number
}

/** Deterministic hash → 0..1, stable per (a, b). */
function hash01(a: number, b: number): number {
  let h = (a * 374761393 + b * 668265263) | 0
  h = (h ^ (h >>> 13)) * 1274126177
  h = h ^ (h >>> 16)
  return ((h >>> 0) % 10000) / 10000
}

export default function TetrisParticleOverlay({
  containerRef,
  display,
  board,
  active,
  lines,
  gameOver,
  ghostCells,
  phase,
  level,
  lastClearKind,
  lastClearAt,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const propsRef = useRef({
    display,
    board,
    active,
    lines,
    gameOver,
    ghostCells,
    phase,
    level,
    lastClearKind,
    lastClearAt,
  })
  propsRef.current = {
    display,
    board,
    active,
    lines,
    gameOver,
    ghostCells,
    phase,
    level,
    lastClearKind,
    lastClearAt,
  }
  const prevRef = useRef<{
    display: Display
    board: Board
    active: Active | null
    lines: number
    gameOver: boolean
    level: number
    lastClearAt: number
  }>({ display, board, active, lines, gameOver, level, lastClearAt })

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2)
    const sizeState = {
      cssW: 0,
      cssH: 0,
      cellW: 0,
      cellH: 0,
      padX: 0,
      padY: 0,
    }

    /** ============ Ambient particle state (struct of arrays) ============
     * Particles are stored in cell-indexed buckets implicit in the array order:
     * cell (bx, by) owns indices [(bx + by*BOARD_W) * AMBIENT_PER_CELL,
     * +AMBIENT_PER_CELL). Obstacle force only iterates the 9 cells in the obstacle's
     * neighbourhood instead of all 200k particles. */
    const TOTAL_AMBIENT = BOARD_W * BOARD_H * AMBIENT_PER_CELL
    const amb = {
      hx: new Float32Array(TOTAL_AMBIENT),
      hy: new Float32Array(TOTAL_AMBIENT),
      x: new Float32Array(TOTAL_AMBIENT),
      y: new Float32Array(TOTAL_AMBIENT),
      vx: new Float32Array(TOTAL_AMBIENT),
      vy: new Float32Array(TOTAL_AMBIENT),
      excitement: new Float32Array(TOTAL_AMBIENT),
      /** Per-particle density factor (0..1) baked from a smooth value-noise field
       * at home position. Used at render time to modulate alpha so the field has
       * visible streaks/clusters/voids instead of being uniform noise. */
      density: new Float32Array(TOTAL_AMBIENT),
      /** Per-particle drift angle (0..2π) baked from a separate noise sample.
       * Determines each particle's individual circular drift direction so the
       * field appears to flow gently rather than sit still. */
      drift: new Float32Array(TOTAL_AMBIENT),
    }

    /** ===== Velocity field (Stam-style) =====
     * Allocated lazily on first resize, when canvas dimensions are known.
     * Reallocated when the canvas resizes (so cell size matches).
     */
    let field: VelocityField | null = null
    let fieldDiffuseScratch: Float32Array | null = null
    let fieldPressureScratch: Float32Array | null = null
    /** Reused per-frame for sampling — avoids per-call allocation. */
    const fieldSampleOut: [number, number] = [0, 0]
    const burstCurlOut: [number, number] = [0, 0]

    /** Allocate (or reallocate) the field to match current canvas size. */
    const rebuildField = () => {
      const W = sizeState.cssW
      const H = sizeState.cssH
      if (W < 2 || H < 2) {
        field = null
        return
      }
      field = createVelocityField(W, H, FIELD_RESOLUTION)
      fieldDiffuseScratch = new Float32Array(field.cols * field.rows * 2)
      fieldPressureScratch = new Float32Array(field.cols * field.rows)
    }

    /** Splat radial outward velocity into the field around (cx, cy). Uses
     * a Gaussian falloff out to `radius`. Each cell within reach gets a
     * vector pointing FROM the centre with magnitude scaled by `mag` and
     * the falloff. Used for lock impacts. */
    const depositRadialBlast = (
      cx: number,
      cy: number,
      radius: number,
      mag: number
    ): void => {
      if (!field || mag === 0 || radius <= 0) return
      const rCells = Math.max(
        1,
        Math.ceil(radius / Math.min(field.cellW, field.cellH))
      )
      const ci = Math.floor(cx / field.cellW)
      const cj = Math.floor(cy / field.cellH)
      const rSqInv = 1 / (radius * radius)
      for (let dj = -rCells; dj <= rCells; dj++) {
        const j = cj + dj
        if (j < 0 || j >= field.rows) continue
        for (let di = -rCells; di <= rCells; di++) {
          const i = ci + di
          if (i < 0 || i >= field.cols) continue
          const cellCx = (i + 0.5) * field.cellW
          const cellCy = (j + 0.5) * field.cellH
          const dx = cellCx - cx
          const dy = cellCy - cy
          const distSq = dx * dx + dy * dy
          if (distSq > radius * radius || distSq < 1) continue
          const w = Math.exp(-3 * distSq * rSqInv) * mag
          const dist = Math.sqrt(distSq)
          const idx = j * field.cols + i
          field.vx[idx]! += (dx / dist) * w
          field.vy[idx]! += (dy / dist) * w
        }
      }
    }

    /** Splat tangential rotation into the field around (cx, cy). Used for
     * piece-rotation events. `mag > 0` = counter-clockwise; `< 0` = clockwise. */
    const depositRotationalImpulse = (
      cx: number,
      cy: number,
      radius: number,
      mag: number
    ): void => {
      if (!field || mag === 0 || radius <= 0) return
      const rCells = Math.max(
        1,
        Math.ceil(radius / Math.min(field.cellW, field.cellH))
      )
      const ci = Math.floor(cx / field.cellW)
      const cj = Math.floor(cy / field.cellH)
      const rSqInv = 1 / (radius * radius)
      for (let dj = -rCells; dj <= rCells; dj++) {
        const j = cj + dj
        if (j < 0 || j >= field.rows) continue
        for (let di = -rCells; di <= rCells; di++) {
          const i = ci + di
          if (i < 0 || i >= field.cols) continue
          const cellCx = (i + 0.5) * field.cellW
          const cellCy = (j + 0.5) * field.cellH
          const dx = cellCx - cx
          const dy = cellCy - cy
          const distSq = dx * dx + dy * dy
          if (distSq > radius * radius || distSq < 1) continue
          const w = Math.exp(-3 * distSq * rSqInv) * mag
          /** Tangential = perpendicular to radial: (-dy, dx) / dist. */
          const dist = Math.sqrt(distSq)
          const idx = j * field.cols + i
          field.vx[idx]! += (-dy / dist) * w
          field.vy[idx]! += (dx / dist) * w
        }
      }
    }

    /** Splat a directional impulse (vx, vy) into a rectangular region —
     * used for line-clear deposits and side-move wakes. */
    const depositDirectionalRect = (
      cx: number,
      cy: number,
      halfW: number,
      halfH: number,
      vx: number,
      vy: number
    ): void => {
      if (!field || (vx === 0 && vy === 0)) return
      const minI = Math.max(0, Math.floor((cx - halfW) / field.cellW))
      const maxI = Math.min(
        field.cols - 1,
        Math.ceil((cx + halfW) / field.cellW)
      )
      const minJ = Math.max(0, Math.floor((cy - halfH) / field.cellH))
      const maxJ = Math.min(
        field.rows - 1,
        Math.ceil((cy + halfH) / field.cellH)
      )
      for (let j = minJ; j <= maxJ; j++) {
        for (let i = minI; i <= maxI; i++) {
          const idx = j * field.cols + i
          field.vx[idx]! += vx
          field.vy[idx]! += vy
        }
      }
    }

    /** Splat a velocity streak from (x0, y0) to (x1, y1). Each cell in the
     * tube around the line gets a directional impulse along the line. Used
     * for hard-drop trails. */
    const depositLineStreak = (
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      radius: number,
      mag: number
    ): void => {
      if (!field || mag === 0) return
      const dx = x1 - x0
      const dy = y1 - y0
      const lineLen = Math.hypot(dx, dy)
      if (lineLen < 1) return
      const ux = dx / lineLen
      const uy = dy / lineLen
      /** Subdivide the line into roughly cell-spaced steps; at each step
       * splat a small radial Gaussian aligned along the direction (ux, uy). */
      const steps = Math.max(
        1,
        Math.ceil(lineLen / Math.max(2, field.cellW * 0.5))
      )
      for (let s = 1; s <= steps; s++) {
        const t = s / steps
        const px = x0 + dx * t
        const py = y0 + dy * t
        const rCells = Math.max(
          1,
          Math.ceil(radius / Math.min(field.cellW, field.cellH))
        )
        const ci = Math.floor(px / field.cellW)
        const cj = Math.floor(py / field.cellH)
        const rSqInv = 1 / (radius * radius)
        for (let dj = -rCells; dj <= rCells; dj++) {
          const jj = cj + dj
          if (jj < 0 || jj >= field.rows) continue
          for (let di = -rCells; di <= rCells; di++) {
            const ii = ci + di
            if (ii < 0 || ii >= field.cols) continue
            const cellCx = (ii + 0.5) * field.cellW
            const cellCy = (jj + 0.5) * field.cellH
            const ex = cellCx - px
            const ey = cellCy - py
            const eSq = ex * ex + ey * ey
            if (eSq > radius * radius) continue
            const w = Math.exp(-3 * eSq * rSqInv) * (mag / steps)
            const idx = jj * field.cols + ii
            field.vx[idx]! += ux * w
            field.vy[idx]! += uy * w
          }
        }
      }
    }

    /** Burst particles: object-array, size-capped pool with linear scan for free slots. */
    const bursts: Burst[] = []
    /** Active line-clear waves: each travels upward through the particle field after
     * a row is cleared, displacing particles as it passes. Multiple waves can coexist
     * if several lines clear in quick succession. */
    const waves: Array<{ y: number; strength: number }> = []
    /** Water-drop ripples: radial bands expanding outward from a lock impact point.
     * Multiple ripples can coexist (one per locked piece) — they layer naturally.
     * `startAt` enables concentric secondary ripples spawned at the same impact
     * with a small delay, mimicking real water-drop physics. */
    const ripples: Array<{
      cx: number
      cy: number
      radius: number
      amplitude: number
      startAt: number
    }> = []
    /** Line-clear flash bands: bright horizontal stripes drawn over the cleared row,
     * fading over FLASH_LIFE_MS. Drawn directly to pixBuf each frame. */
    const flashes: Array<{ y: number; bornAt: number }> = []
    /** Pre-vanish "pop" of the cleared row's blocks: oversized expansion at
     * each cell of the cleared row, fading over ~140ms before the row truly
     * disappears. Tinted by the row's actual block colours (captured from
     * prev.board at clear detection) so it reads as the row's blocks dispersing
     * rather than a generic white flash. */
    const clearPops: Array<{
      y: number
      bornAt: number
      colors: number[]
    }> = []
    /** Lock-impact anticipation flash: brief white/colour glow drawn at each
     * locked cell for ~110ms before the ripple starts. Visual punctuation that
     * the impact has happened. */
    const lockFlashes: Array<{
      cells: Array<{ bx: number; by: number }>
      bornAt: number
      colour: readonly [number, number, number]
    }> = []
    /** Rotation pulse: triggered when the active piece's rotation index changes.
     * Scales the active piece's render briefly for visual punctuation. */
    const rotationPulse = { startedAt: -1 }
    /** Time-delayed actions queue. Used to stagger line-clear effects so they
     * read as a sequence (anticipation → climax → aftermath) instead of all
     * firing simultaneously. Entries fire when `now >= runAt`. */
    const pendingActions: Array<{ runAt: number; fn: () => void }> = []
    const allocateBurst = (): Burst | null => {
      for (let i = 0; i < bursts.length; i++) {
        const p = bursts[i]!
        if (!p.alive) return p
      }
      if (bursts.length >= MAX_BURST_PARTICLES) return null
      const fresh: Burst = {
        alive: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        bornAt: 0,
        lifeMs: 0,
      }
      bursts.push(fresh)
      return fresh
    }

    /** ============ Pre-computed gradient lookup table ============
     * 512-entry table of [r,g,b] for fast colour lookup per pixel during render.
     * Built once from WORDMARK_GRADIENT.stops; indexed by t∈[0,1] floor(t * 511). */
    const gradStops = WORDMARK_GRADIENT.stops.map(parseHexColor)
    const gradLutR = new Uint8ClampedArray(GRAD_LUT_SIZE)
    const gradLutG = new Uint8ClampedArray(GRAD_LUT_SIZE)
    const gradLutB = new Uint8ClampedArray(GRAD_LUT_SIZE)
    {
      const segCount = gradStops.length - 1
      for (let i = 0; i < GRAD_LUT_SIZE; i++) {
        const t = i / (GRAD_LUT_SIZE - 1)
        const segPos = t * segCount
        let segIdx = Math.floor(segPos)
        if (segIdx >= segCount) segIdx = segCount - 1
        const localT = segPos - segIdx
        const c1 = gradStops[segIdx]!
        const c2 = gradStops[segIdx + 1]!
        gradLutR[i] = Math.round(c1[0]! + (c2[0]! - c1[0]!) * localT)
        gradLutG[i] = Math.round(c1[1]! + (c2[1]! - c1[1]!) * localT)
        gradLutB[i] = Math.round(c1[2]! + (c2[2]! - c1[2]!) * localT)
      }
    }

    /** Smooth-motion state for the active piece. */
    const pieceMotion = {
      offsetX: 0,
      offsetY: 0,
      transitionStartedAt: -1,
      lastPieceType: -1,
      lastCentroidX: 0,
      lastCentroidY: 0,
      /** Smoothed move distance per frame (in cells) — used for velocity-coupled
       * ripple amplitude on lock and for scaling the dynamic offset clamp. */
      recentVelocityCells: 0,
      /** Last seen rotation index so we can detect changes (rotation events). */
      lastPieceRotation: -1,
    }

    /** Pixel buffer for direct-write rendering. Reallocated on resize. */
    let imageData: ImageData | null = null
    let pixBuf: Uint8ClampedArray | null = null

    const cellCentre = (bx: number, by: number): { x: number; y: number } => ({
      x: sizeState.padX + (bx + 0.5) * sizeState.cellW,
      y: sizeState.padY + (by + 0.5) * sizeState.cellH,
    })

    /** Smooth 2D value noise (bilinear over a hash01 grid). Used to give the ambient
     * field visible texture — clusters, lanes, voids — instead of uniform noise. */
    const valueNoise2D = (x: number, y: number): number => {
      const x0 = Math.floor(x)
      const y0 = Math.floor(y)
      const tx = x - x0
      const ty = y - y0
      const a = hash01(x0 + 1, y0 + 1)
      const b = hash01(x0 + 2, y0 + 1)
      const c = hash01(x0 + 1, y0 + 2)
      const d = hash01(x0 + 2, y0 + 2)
      const sx = tx * tx * (3 - 2 * tx)
      const sy = ty * ty * (3 - 2 * ty)
      return (
        a * (1 - sx) * (1 - sy) +
        b * sx * (1 - sy) +
        c * (1 - sx) * sy +
        d * sx * sy
      )
    }

    /** Allocate ambient particles in cell-bucketed order. Each cell owns AMBIENT_PER_CELL
     * consecutive indices, enabling fast obstacle-neighbourhood iteration. */
    const buildAmbient = () => {
      let idx = 0
      /** Noise scale: ~3 cells per noise feature gives visible streaks at typical zooms. */
      const noiseScale = 1 / Math.max(1, Math.max(sizeState.cellW, sizeState.cellH) * 2.2)
      for (let by = 0; by < BOARD_H; by++) {
        for (let bx = 0; bx < BOARD_W; bx++) {
          const cellOriginX = sizeState.padX + bx * sizeState.cellW
          const cellOriginY = sizeState.padY + by * sizeState.cellH
          const w = sizeState.cellW
          const h = sizeState.cellH
          for (let s = 0; s < AMBIENT_PER_CELL; s++) {
            /** Random homes within the cell (fully fill the cell, slight margin). */
            const u = hash01(bx * 31 + by, s * 7 + 1)
            const v = hash01(bx * 31 + by, s * 7 + 2)
            const hx = cellOriginX + u * w
            const hy = cellOriginY + v * h
            /** Density from low-frequency value noise — combined with octaves for
             * texture variety. Result in 0..1, biased so most of field is mid-bright. */
            const n1 = valueNoise2D(hx * noiseScale, hy * noiseScale)
            const n2 = valueNoise2D(hx * noiseScale * 2.7, hy * noiseScale * 2.7)
            const dens = Math.max(0, Math.min(1, n1 * 0.7 + n2 * 0.3))
            /** Drift angle: sample a different noise frequency for spatial
             * correlation — neighbouring particles drift in similar directions,
             * so the whole field reads as gentle directional flow. */
            const driftN = valueNoise2D(hx * noiseScale * 1.7 + 31.7, hy * noiseScale * 1.7 + 17.3)
            amb.hx[idx] = hx
            amb.hy[idx] = hy
            amb.x[idx] = hx
            amb.y[idx] = hy
            amb.vx[idx] = 0
            amb.vy[idx] = 0
            amb.excitement[idx] = 0
            amb.density[idx] = dens
            amb.drift[idx] = driftN * Math.PI * 2
            idx++
          }
        }
      }
    }

    const spawnBurst = (
      cx: number,
      cy: number,
      count: number,
      speedMax: number,
      lifeMs: number = BURST_LIFE_MS
    ) => {
      const now = performance.now()
      for (let i = 0; i < count; i++) {
        const p = allocateBurst()
        if (!p) return
        p.alive = true
        const angle = Math.random() * Math.PI * 2
        const speed = speedMax * (0.35 + 0.65 * Math.random())
        p.x = cx + (Math.random() - 0.5) * sizeState.cellW * 0.5
        p.y = cy + (Math.random() - 0.5) * sizeState.cellH * 0.5
        p.vx = Math.cos(angle) * speed
        p.vy = Math.sin(angle) * speed
        p.bornAt = now
        p.lifeMs = lifeMs * (0.7 + 0.6 * Math.random())
      }
    }

    const computeActiveCells = (
      disp: Display,
      brd: Board
    ): Array<{ bx: number; by: number }> => {
      const out: Array<{ bx: number; by: number }> = []
      for (let by = 0; by < BOARD_H; by++) {
        for (let bx = 0; bx < BOARD_W; bx++) {
          if (disp[by]?.[bx] !== 0 && brd[by]?.[bx] === 0) {
            out.push({ bx, by })
            if (out.length >= 4) return out
          }
        }
      }
      return out
    }

    /** Cinematic effect triggers. Each becomes >= 0 when its event fires and
     * the per-frame envelope reads back to drive vignette / decay / overlay
     * intensity. They expire by elapsed-time check, no explicit reset needed
     * other than gameOverAt which must clear on restart (gameOver flips back).
     * Declared before layoutCanvas because it captures dofCanvas/dofCtx in its
     * closure; Turbopack's TDZ analysis rejects late let-after-use even when
     * the actual call site is correctly ordered. */
    let levelUpAt = -1
    let chapterSweepAt = -1
    let gameOverAt = -1
    /** Quarter-resolution scratch canvas used for the depth-of-field blur on
     * game-over. Created lazily on first need; invalidated by layoutCanvas. */
    let dofCanvas: HTMLCanvasElement | null = null
    let dofCtx: CanvasRenderingContext2D | null = null

    const layoutCanvas = () => {
      const rect = container.getBoundingClientRect()
      /** Defensive: skip layout while the container hasn't been measured yet. The
       * ResizeObserver will fire again when valid dimensions arrive. */
      if (rect.width < 4 || rect.height < 4) return
      sizeState.cssW = rect.width
      sizeState.cssH = rect.height
      const gap = 1
      const pad = 4
      sizeState.padX = pad
      sizeState.padY = pad
      sizeState.cellW = (rect.width - pad * 2 - gap * (BOARD_W - 1)) / BOARD_W + gap
      sizeState.cellH = (rect.height - pad * 2 - gap * (BOARD_H - 1)) / BOARD_H + gap
      const W = Math.max(1, Math.round(rect.width * dpr))
      const H = Math.max(1, Math.round(rect.height * dpr))
      canvas.width = W
      canvas.height = H
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      imageData = ctx.createImageData(W, H)
      pixBuf = imageData.data
      buildAmbient()
      rebuildField()
      // Invalidate the DOF blur scratch canvas; it'll be rebuilt lazily on
      // the next game-over frame with the new dimensions.
      dofCanvas = null
      dofCtx = null
    }

    layoutCanvas()
    const ro = new ResizeObserver(() => layoutCanvas())
    ro.observe(container)
    /** Time-driven amounts (recomputed per frame in tick). Used by inner loops
     * that previously read the constants directly. */
    let currentExcitementDecay = EXCITEMENT_DECAY
    let currentVignetteStrength = VIGNETTE_STRENGTH

    const LEVEL_UP_MS = 1400
    const CHAPTER_SWEEP_MS = 900
    const DOF_FADE_MS = 1200
    const GHOST_PULSE_HZ = 0.55
    const GHOST_ALPHA_BASE = 0.14
    const GHOST_ALPHA_RANGE = 0.08

    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const W = sizeState.cssW
      const H = sizeState.cssH
      if (W < 2 || H < 2 || pixBuf == null || imageData == null) return
      const now = performance.now()

      const { display: dispNow, board: brdNow, active: actNow, lines: linesNow } =
        propsRef.current
      const gameOverNow = propsRef.current.gameOver
      const levelNow = propsRef.current.level
      const lastClearKindNow = propsRef.current.lastClearKind
      const lastClearAtNow = propsRef.current.lastClearAt
      const ghostCellsNow = propsRef.current.ghostCells
      const phaseNow = propsRef.current.phase
      const prev = prevRef.current

      /** Level-up: detect via prev.level vs propsRef.current.level. The 1400ms
       * envelope below deepens vignette + extends excitement-decay so the field
       * blooms slowly. Reset on restart is implicit — levels go back to 1 via
       * the reducer, and the envelope expires by timestamp. */
      if (levelNow > prev.level) {
        levelUpAt = now
      }
      /** Tetris-grade clear: only the "tetris" kind triggers the chapter sweep.
       * Doubles/triples/singles use the per-row flash + retuned wave already
       * built into the pipeline above. */
      if (
        lastClearAtNow > prev.lastClearAt &&
        lastClearKindNow === "tetris"
      ) {
        chapterSweepAt = now
      }
      /** Game-over fresh trigger / restart reset. */
      if (gameOverNow && !prev.gameOver) {
        gameOverAt = now
      } else if (!gameOverNow && prev.gameOver) {
        gameOverAt = -1
      }

      /** Per-frame envelopes: cosine-bell over the lifetime of each event. */
      let levelUpAmount = 0
      if (levelUpAt >= 0 && now - levelUpAt < LEVEL_UP_MS) {
        const t = (now - levelUpAt) / LEVEL_UP_MS
        levelUpAmount = Math.sin(t * Math.PI)
      } else if (levelUpAt >= 0) {
        levelUpAt = -1
      }
      currentVignetteStrength = VIGNETTE_STRENGTH + 0.16 * levelUpAmount
      currentExcitementDecay = EXCITEMENT_DECAY + 0.006 * levelUpAmount

      /** Drain any time-delayed actions whose `runAt` has passed. Used by the
       * staggered line-clear sequence below. */
      for (let i = pendingActions.length - 1; i >= 0; i--) {
        if (now >= pendingActions[i]!.runAt) {
          pendingActions[i]!.fn()
          pendingActions.splice(i, 1)
        }
      }

      /** ===== Game-over transition deposit =====
       * On the frame the game ends, splat a strong upward burst across the
       * whole board into the field — locks the field at high energy. With
       * pressure projection running, the energy curls into chaotic vortices
       * that fade over the next 2-3 seconds. */
      if (gameOverNow && !prev.gameOver && field) {
        const cx = sizeState.padX + (BOARD_W * sizeState.cellW) / 2
        const cy = sizeState.padY + (BOARD_H * sizeState.cellH) / 2
        depositDirectionalRect(
          cx,
          cy,
          (BOARD_W * sizeState.cellW) / 2,
          (BOARD_H * sizeState.cellH) / 2,
          0,
          -GAMEOVER_FIELD_UP_MAGNITUDE
        )
        /** Add a few radial blasts for visual chaos. */
        for (let k = 0; k < 4; k++) {
          const rx = cx + (Math.random() - 0.5) * sizeState.cellW * BOARD_W * 0.6
          const ry = cy + (Math.random() - 0.5) * sizeState.cellH * BOARD_H * 0.4
          depositRadialBlast(
            rx,
            ry,
            LOCK_FIELD_BLAST_RADIUS_CSS * 1.5,
            GAMEOVER_FIELD_UP_MAGNITUDE * 0.6
          )
        }
      }

      /** =========== Lock + line clear event detection =========== */

      if (linesNow > prev.lines) {
        for (let by = 0; by < BOARD_H; by++) {
          const wasFull =
            prev.board[by] != null &&
            prev.board[by]!.every((c) => c !== 0)
          if (!wasFull) continue
          const rowMidY = sizeState.padY + (by + 0.5) * sizeState.cellH
          const rowColors = (prev.board[by] ?? []).slice()
          const byCaptured = by

          /** Sequence (timeline relative to clear detection):
           *
           *  T=0      pop (the row's blocks puff up brightly), small downward impulse
           *           on the row's particles — anticipation of the row falling out
           *  T=60ms   per-cell burst + flash band + pre-vanish ends → row "explodes"
           *  T=120ms  upward wave starts pushing field upward
           *  T=200ms  vertical column blasts (up + down) from row
           *  T=320ms  horizontal sweep ribbons across the full row
           *
           *  Reads as: row freezes briefly → climax → ripples outward → tail. */

          /** T=0 — pop + soft downward impulse. */
          clearPops.push({ y: rowMidY, bornAt: now, colors: rowColors })
          for (let bx = 0; bx < BOARD_W; bx++) {
            const startIdx = (bx + byCaptured * BOARD_W) * AMBIENT_PER_CELL
            const endIdx = startIdx + AMBIENT_PER_CELL
            for (let i = startIdx; i < endIdx; i++) {
              amb.vy[i] = (amb.vy[i] ?? 0) + LINE_CLEAR_FALL_IMPULSE * 0.6
              amb.excitement[i] = 0.8
            }
          }
          /** T=0 — field deposit: downward push across the full cleared row.
           * Pressure projection will turn this into curling outward energy
           * over the next second. */
          {
            const rowCx = sizeState.padX + (BOARD_W * sizeState.cellW) / 2
            const rowHalfW = (BOARD_W * sizeState.cellW) / 2
            depositDirectionalRect(
              rowCx,
              rowMidY,
              rowHalfW,
              sizeState.cellH * 0.5,
              0,
              CLEAR_FIELD_DOWN_MAGNITUDE
            )
          }

          /** T=60 — climax: per-cell bursts + flash band. */
          pendingActions.push({
            runAt: now + 60,
            fn: () => {
              for (let bx = 0; bx < BOARD_W; bx++) {
                const c = cellCentre(bx, byCaptured)
                spawnBurst(
                  c.x,
                  c.y,
                  CLEAR_BURST_PER_CELL * 2,
                  CLEAR_BURST_SPEED * 1.3,
                  BURST_LIFE_MS * 1.6
                )
              }
              flashes.push({ y: rowMidY, bornAt: performance.now() })
              /** Strong downward kick following the climax. */
              for (let bx = 0; bx < BOARD_W; bx++) {
                const ry = Math.min(BOARD_H - 1, byCaptured + 1)
                const startIdx = (bx + ry * BOARD_W) * AMBIENT_PER_CELL
                const endIdx = startIdx + AMBIENT_PER_CELL
                for (let i = startIdx; i < endIdx; i++) {
                  amb.vy[i] = (amb.vy[i] ?? 0) + LINE_CLEAR_FALL_IMPULSE * 1.4
                  amb.excitement[i] = 1
                }
              }
            },
          })

          /** T=120 — upward wave begins. */
          pendingActions.push({
            runAt: now + 120,
            fn: () => {
              waves.push({ y: rowMidY, strength: WAVE_STRENGTH * 1.6 })
            },
          })

          /** T=200 — vertical column blasts (up + down). */
          pendingActions.push({
            runAt: now + 200,
            fn: () => {
              for (let bx = 0; bx < BOARD_W; bx++) {
                const cellCx =
                  sizeState.padX + (bx + 0.5) * sizeState.cellW
                for (let dirSign = -1; dirSign <= 1; dirSign += 2) {
                  for (let i = 0; i < 14; i++) {
                    const p = allocateBurst()
                    if (!p) break
                    p.alive = true
                    p.x =
                      cellCx + (Math.random() - 0.5) * sizeState.cellW * 0.7
                    p.y =
                      rowMidY + (Math.random() - 0.5) * sizeState.cellH * 0.4
                    p.vx = (Math.random() - 0.5) * 4
                    p.vy = dirSign * (6 + Math.random() * 6)
                    p.bornAt = performance.now()
                    p.lifeMs = 800 + Math.random() * 400
                  }
                }
              }
              /** T=200 — field deposit: outward radial blasts at each end of
               * the cleared row. Pressure projection turns these into rolling
               * curls that spread the released energy across the board. */
              const leftX = sizeState.padX
              const rightX =
                sizeState.padX + BOARD_W * sizeState.cellW
              depositRadialBlast(
                leftX,
                rowMidY,
                LOCK_FIELD_BLAST_RADIUS_CSS * 1.4,
                CLEAR_FIELD_OUTWARD_MAGNITUDE
              )
              depositRadialBlast(
                rightX,
                rowMidY,
                LOCK_FIELD_BLAST_RADIUS_CSS * 1.4,
                CLEAR_FIELD_OUTWARD_MAGNITUDE
              )
            },
          })

          /** T=320 — horizontal sweep ribbons (the aftermath / tail). */
          pendingActions.push({
            runAt: now + 320,
            fn: () => {
              const rowSweepCount = 160
              const sweepNow = performance.now()
              for (let i = 0; i < rowSweepCount; i++) {
                const p = allocateBurst()
                if (!p) break
                p.alive = true
                const fromLeft = i % 2 === 0
                const startX = fromLeft
                  ? sizeState.padX
                  : sizeState.padX + W
                p.x = startX
                p.y =
                  rowMidY + (Math.random() - 0.5) * sizeState.cellH * 0.8
                const dir = fromLeft ? 1 : -1
                p.vx = dir * (10 + Math.random() * 9)
                p.vy = (Math.random() - 0.5) * 3
                p.bornAt = sweepNow
                p.lifeMs = 700 + Math.random() * 500
              }
            },
          })
        }
      }

      const prevActive = computeActiveCells(prev.display, prev.board)
      const lockedCells: Array<{ bx: number; by: number }> = []
      for (const cell of prevActive) {
        const wasInBoard = prev.board[cell.by]?.[cell.bx] !== 0
        const nowInBoard = brdNow[cell.by]?.[cell.bx] !== 0
        if (!wasInBoard && nowInBoard) {
          lockedCells.push(cell)
          const c = cellCentre(cell.bx, cell.by)
          spawnBurst(c.x, c.y, LOCK_BURST_PER_CELL, LOCK_BURST_SPEED)
        }
      }
      /** Anticipation flash on lock: bright glow over the lock cells in the
       * piece's colour for ~110ms before the ripple radiates. Visual punctuation
       * that says "impact landed here". */
      if (lockedCells.length > 0 && prev.active != null) {
        const colour = PIECE_RGB[prev.active.t] ?? [255, 255, 255]
        lockFlashes.push({
          cells: lockedCells.slice(),
          bornAt: now,
          colour: colour as readonly [number, number, number],
        })
      }
      if (lockedCells.length > 0) {
        /** Impact centroid sits at the BOTTOM of the locked block (bottom-most row's
         * lower edge) — that's where a water drop "lands" before the ripple radiates. */
        let cx = 0
        let maxBy = -1
        let minBy = BOARD_H
        for (const c of lockedCells) {
          cx += sizeState.padX + (c.bx + 0.5) * sizeState.cellW
          if (c.by > maxBy) maxBy = c.by
          if (c.by < minBy) minBy = c.by
        }
        cx /= lockedCells.length
        const cy = sizeState.padY + (maxBy + 1) * sizeState.cellH

        /** ===== Velocity-field deposit on lock =====
         * Outward radial blast at the impact centroid. Pressure projection
         * over the next 1-2 seconds will turn this into curling vortices
         * radiating from the impact point. The existing analytic ripple +
         * burst still play on top — they punctuate the moment; the field
         * is the lingering aftermath. */
        const lockVelFactor = Math.max(
          1,
          Math.min(2.2, 1 + pieceMotion.recentVelocityCells * 0.5)
        )
        depositRadialBlast(
          cx,
          cy,
          LOCK_FIELD_BLAST_RADIUS_CSS,
          LOCK_FIELD_BLAST_MAGNITUDE * lockVelFactor
        )

        /** ===== Hard-drop trail =====
         * If the piece travelled more than HARDDROP_MIN_CELLS this lock cycle,
         * paint a vertical streak in the field down the column the piece fell
         * through. Reads as a comet trail behind the dropped piece — the most
         * visceral feedback for hard-drop input. */
        if (
          prev.active != null &&
          maxBy - prev.active.y >= HARDDROP_MIN_CELLS
        ) {
          /** Piece centroid X for the streak */
          const streakX = cx
          const fromY =
            sizeState.padY +
            (prev.active.y + (maxBy - minBy + 1) * 0.5) * sizeState.cellH
          /** Streak ends at the impact line (top edge of locked region). */
          const toY = sizeState.padY + minBy * sizeState.cellH
          depositLineStreak(
            streakX,
            fromY,
            streakX,
            toY,
            HARDDROP_FIELD_STREAK_RADIUS_CSS,
            HARDDROP_FIELD_STREAK_MAGNITUDE
          )
        }

        /** Water-drop ripple: radial wave expanding outward from impact. Particles
         * encountered by the wave's band get a radial impulse outward (with upward
         * bias since the surface is below). */
        /** Scale ripple amplitude by recent piece velocity — faster impacts
         * produce more dramatic ripples. Floor at 1.0 so even a soft lock has
         * a visible ring; cap at ~2.5 for tetris-velocity hard drops. */
        const velFactor = Math.max(
          1,
          Math.min(2.5, 1 + pieceMotion.recentVelocityCells * RIPPLE_VELOCITY_SCALE)
        )
        /** Concentric ripples: primary + 2 smaller secondaries staggered in time
         * mimic real water-drop physics where the impact produces multiple rings. */
        const baseAmp = RIPPLE_AMPLITUDE * velFactor
        ripples.push({ cx, cy, radius: 0, amplitude: baseAmp, startAt: now })
        ripples.push({
          cx,
          cy,
          radius: 0,
          amplitude: baseAmp * 0.55,
          startAt: now + 130,
        })
        ripples.push({
          cx,
          cy,
          radius: 0,
          amplitude: baseAmp * 0.28,
          startAt: now + 270,
        })
        /** Splatter droplets — irregular impact spray rather than a uniform ring.
         * Random angles in upper hemisphere, varied speeds (most slow, some fast)
         * and varied lifetimes. Reads as organic spray, not a sterile ring. */
        const splatterCount = 36
        for (let i = 0; i < splatterCount; i++) {
          const p = allocateBurst()
          if (!p) break
          p.alive = true
          /** Random angle biased toward upward: 60% of full circle in upper
           * hemisphere, with some side spray. */
          const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4
          /** Power-curve speed: most droplets slow, a few fly fast. */
          const r01 = Math.random()
          const speed = 3 + r01 * r01 * 13 * velFactor
          p.x = cx + (Math.random() - 0.5) * sizeState.cellW * 0.3
          p.y = cy + (Math.random() - 0.5) * sizeState.cellH * 0.2
          p.vx = Math.cos(ang) * speed
          p.vy = Math.sin(ang) * speed
          p.bornAt = now
          p.lifeMs = 400 + Math.random() * 700
        }
      }

      /** =========== Smooth active-piece motion =========== */

      const activeCellsForMotion = computeActiveCells(dispNow, brdNow)
      let activeCentroidX = 0
      let activeCentroidY = 0
      if (activeCellsForMotion.length > 0) {
        for (const c of activeCellsForMotion) {
          const cc = cellCentre(c.bx, c.by)
          activeCentroidX += cc.x
          activeCentroidY += cc.y
        }
        activeCentroidX /= activeCellsForMotion.length
        activeCentroidY /= activeCellsForMotion.length

        const sameType = actNow != null && actNow.t === pieceMotion.lastPieceType
        if (
          sameType &&
          (activeCentroidX !== pieceMotion.lastCentroidX ||
            activeCentroidY !== pieceMotion.lastCentroidY)
        ) {
          /** Big-jump detection: if centroid moved more than 4 cells in one
           * frame this isn't a normal step — most likely a hard drop or a new
           * piece sharing the previous type. Skip the transition so the block
           * doesn't streak across the board. */
          const dxJump = activeCentroidX - pieceMotion.lastCentroidX
          const dyJump = activeCentroidY - pieceMotion.lastCentroidY
          const jumpDist = Math.hypot(dxJump, dyJump)
          const cellDiag = Math.hypot(sizeState.cellW, sizeState.cellH)
          if (jumpDist > cellDiag * 4) {
            pieceMotion.offsetX = 0
            pieceMotion.offsetY = 0
            pieceMotion.transitionStartedAt = -1
            /** Big jumps don't count toward velocity — that's a piece spawn / hard
             * drop, not a continuous motion the player is maintaining. */
          } else {
            pieceMotion.offsetX += pieceMotion.lastCentroidX - activeCentroidX
            pieceMotion.offsetY += pieceMotion.lastCentroidY - activeCentroidY
            pieceMotion.transitionStartedAt = now
            /** Smoothed velocity in cells/frame. Spikes when player holds down
             * arrow, decays back to 0 when piece holds still. */
            const moveCells = jumpDist / cellDiag
            pieceMotion.recentVelocityCells =
              pieceMotion.recentVelocityCells * 0.85 + moveCells * 0.15

            /** ===== Side-move + soft-fall wake =====
             * Each step the piece takes deposits a small directional impulse
             * into the field at its centroid. Reads as a brushed-by wake —
             * particles get nudged in the direction the piece moved. */
            const cellW = sizeState.cellW
            const cellH = sizeState.cellH
            /** Horizontal wakes (left/right movement). dxJump > 0 means piece
             * moved RIGHT this frame; deposit eastward push. */
            if (Math.abs(dxJump) > cellW * 0.2) {
              depositDirectionalRect(
                activeCentroidX,
                activeCentroidY,
                cellW * 1.5,
                cellH * 1.5,
                Math.sign(dxJump) * SIDE_FIELD_PUSH_MAGNITUDE,
                0
              )
            }
            /** Vertical wakes (soft fall / soft drop). Always deposits some
             * downward energy when the piece is moving down — produces a
             * faint trail beneath the piece. Scaled by movement so a slow
             * gravity-fall produces a tiny bias and a soft-drop produces
             * a stronger one. */
            if (dyJump > cellH * 0.05) {
              const m =
                FALL_FIELD_WAKE_MAGNITUDE * Math.min(3, dyJump / cellH)
              depositDirectionalRect(
                activeCentroidX,
                activeCentroidY,
                cellW * 1.2,
                cellH * 1.5,
                0,
                m
              )
            }
          }
        } else if (!sameType) {
          pieceMotion.offsetX = 0
          pieceMotion.offsetY = 0
          pieceMotion.transitionStartedAt = -1
          pieceMotion.recentVelocityCells = 0
        }
        /** Detect rotation: same piece type, .r changed → trigger pulse +
         * rotational field deposit. The visual scale-pulse is the visible
         * punctuation; the field deposit is the surrounding-fluid reaction. */
        if (
          actNow != null &&
          actNow.t === pieceMotion.lastPieceType &&
          actNow.r !== pieceMotion.lastPieceRotation &&
          pieceMotion.lastPieceRotation !== -1
        ) {
          rotationPulse.startedAt = now
          /** Tangential impulse around the piece centroid. Sign alternates
           * with rotation direction (ccw indicated by r increasing mod n). */
          const rotSign =
            ((actNow.r - pieceMotion.lastPieceRotation + 4) % 4) === 1
              ? 1
              : -1
          depositRotationalImpulse(
            activeCentroidX,
            activeCentroidY,
            ROTATION_FIELD_SPIN_RADIUS_CSS,
            ROTATION_FIELD_SPIN_MAGNITUDE * rotSign
          )
        }
        pieceMotion.lastPieceType = actNow != null ? actNow.t : -1
        pieceMotion.lastPieceRotation = actNow != null ? actNow.r : -1
        pieceMotion.lastCentroidX = activeCentroidX
        pieceMotion.lastCentroidY = activeCentroidY
      } else {
        pieceMotion.lastPieceType = -1
        pieceMotion.lastPieceRotation = -1
      }

      /** Velocity-coupled offset clamp: at rest, cap at PIECE_MAX_LAG_CELLS. During
       * fast moves, allow more lag proportional to current velocity so the trail
       * gracefully extends instead of pop-snapping back when the player stops. */
      {
        const cellL = Math.max(sizeState.cellW, sizeState.cellH)
        const velBonus = Math.min(
          PIECE_VELOCITY_LAG_BONUS,
          pieceMotion.recentVelocityCells * 1.4
        )
        const maxLag = cellL * (PIECE_MAX_LAG_CELLS + velBonus)
        const offLen = Math.hypot(pieceMotion.offsetX, pieceMotion.offsetY)
        if (offLen > maxLag) {
          const scale = maxLag / offLen
          pieceMotion.offsetX *= scale
          pieceMotion.offsetY *= scale
        }
      }
      /** Decay velocity when no motion this frame so the clamp shrinks gracefully. */
      pieceMotion.recentVelocityCells *= 0.92

      let smoothOffsetX = 0
      let smoothOffsetY = 0
      if (pieceMotion.transitionStartedAt >= 0) {
        const elapsed = now - pieceMotion.transitionStartedAt
        if (elapsed >= PIECE_TRANSITION_MS) {
          pieceMotion.offsetX = 0
          pieceMotion.offsetY = 0
          pieceMotion.transitionStartedAt = -1
        } else {
          const u = elapsed / PIECE_TRANSITION_MS
          /** Ease-out: block snaps quickly to the new position then settles
           * with a soft tail. Removes the "delay after keypress" feel of
           * ease-in curves. `(1-u)^3` is responsive without being harsh. */
          const oneMinusU = 1 - u
          const remaining = oneMinusU * oneMinusU * oneMinusU
          smoothOffsetX = pieceMotion.offsetX * remaining
          smoothOffsetY = pieceMotion.offsetY * remaining
        }
      }

      /** =========== Build obstacle list =========== */

      type Obstacle = { cx: number; cy: number; bx: number; by: number }
      const obstacles: Obstacle[] = []
      for (let by = 0; by < BOARD_H; by++) {
        for (let bx = 0; bx < BOARD_W; bx++) {
          if (brdNow[by]?.[bx] !== 0) {
            const c = cellCentre(bx, by)
            obstacles.push({ cx: c.x, cy: c.y, bx, by })
          }
        }
      }
      for (const ac of activeCellsForMotion) {
        const c = cellCentre(ac.bx, ac.by)
        obstacles.push({
          cx: c.x + smoothOffsetX,
          cy: c.y + smoothOffsetY,
          bx: ac.bx,
          by: ac.by,
        })
      }
      const obstacleR =
        Math.max(sizeState.cellW, sizeState.cellH) * OBSTACLE_RADIUS_CELLS
      const obstacleR2 = obstacleR * obstacleR

      /** =========== Apply obstacle forces (cell-neighbourhood only) =========== */

      for (let oi = 0; oi < obstacles.length; oi++) {
        const o = obstacles[oi]!
        for (let dy = -1; dy <= 1; dy++) {
          const ny = o.by + dy
          if (ny < 0 || ny >= BOARD_H) continue
          for (let dx = -1; dx <= 1; dx++) {
            const nx = o.bx + dx
            if (nx < 0 || nx >= BOARD_W) continue
            const startIdx = (nx + ny * BOARD_W) * AMBIENT_PER_CELL
            const endIdx = startIdx + AMBIENT_PER_CELL
            for (let i = startIdx; i < endIdx; i++) {
              const ddx = amb.x[i]! - o.cx
              const ddy = amb.y[i]! - o.cy
              if (ddx > obstacleR || ddx < -obstacleR) continue
              if (ddy > obstacleR || ddy < -obstacleR) continue
              const dd2 = ddx * ddx + ddy * ddy
              if (dd2 >= obstacleR2 || dd2 < 0.5) continue
              const dd = Math.sqrt(dd2)
              const fall = (obstacleR - dd) / obstacleR
              const f = OBSTACLE_FORCE * fall * fall
              amb.vx[i] = amb.vx[i]! + (ddx / dd) * f
              amb.vy[i] = amb.vy[i]! + (ddy / dd) * f
              if (fall > amb.excitement[i]!) amb.excitement[i] = fall
            }
          }
        }
      }

      /** =========== Wave forces (line-clear shockwaves travelling upward) =========== */

      /** Update each wave's position, decay strength, and apply impulse to particles
       * in its band. Iterate only the row buckets within the band — not all 200k. */
      for (let wi = waves.length - 1; wi >= 0; wi--) {
        const w = waves[wi]!
        /** Determine which board rows fall within the wave's band. */
        const minY = w.y - WAVE_BAND_HALF
        const maxY = w.y + WAVE_BAND_HALF
        const minBy = Math.max(
          0,
          Math.floor((minY - sizeState.padY) / sizeState.cellH)
        )
        const maxBy = Math.min(
          BOARD_H - 1,
          Math.ceil((maxY - sizeState.padY) / sizeState.cellH)
        )
        if (minBy <= maxBy) {
          for (let by = minBy; by <= maxBy; by++) {
            const rowStart = (by * BOARD_W) * AMBIENT_PER_CELL
            const rowEnd = rowStart + BOARD_W * AMBIENT_PER_CELL
            for (let i = rowStart; i < rowEnd; i++) {
              const dy = amb.y[i]! - w.y
              if (dy > WAVE_BAND_HALF || dy < -WAVE_BAND_HALF) continue
              const fall = 1 - Math.abs(dy) / WAVE_BAND_HALF
              const fallSq = fall * fall
              /** Push upward (negative Y in canvas coords). */
              amb.vy[i] = amb.vy[i]! + -w.strength * fallSq
              if (fallSq > amb.excitement[i]!) amb.excitement[i] = fallSq
            }
          }
        }
        /** Move wave upward and decay. */
        w.y += WAVE_SPEED
        w.strength *= WAVE_DECAY
        /** Retire when off the top of the board or strength is negligible. */
        if (w.y < -WAVE_BAND_HALF || w.strength < 0.15) {
          waves.splice(wi, 1)
        }
      }

      /** =========== Water-drop ripples (radial wave from lock impact) =========== */

      /** For each ripple, find ambient particles in the (radius ± band) annulus and
       * apply a radial-outward impulse. Decays with distance from impact + over time. */
      for (let ri = ripples.length - 1; ri >= 0; ri--) {
        const r = ripples[ri]!
        if (now < r.startAt) continue
        const innerR = r.radius - RIPPLE_BAND_HALF
        const outerR = r.radius + RIPPLE_BAND_HALF
        /** Bounding box of cells the band could touch — iterate only those buckets. */
        const minBx = Math.max(
          0,
          Math.floor(
            (r.cx - outerR - sizeState.padX) / sizeState.cellW
          )
        )
        const maxBx = Math.min(
          BOARD_W - 1,
          Math.ceil(
            (r.cx + outerR - sizeState.padX) / sizeState.cellW
          )
        )
        const minBy = Math.max(
          0,
          Math.floor(
            (r.cy - outerR - sizeState.padY) / sizeState.cellH
          )
        )
        const maxBy = Math.min(
          BOARD_H - 1,
          Math.ceil(
            (r.cy + outerR - sizeState.padY) / sizeState.cellH
          )
        )
        if (minBx <= maxBx && minBy <= maxBy) {
          for (let by = minBy; by <= maxBy; by++) {
            for (let bx = minBx; bx <= maxBx; bx++) {
              const startIdx = (bx + by * BOARD_W) * AMBIENT_PER_CELL
              const endIdx = startIdx + AMBIENT_PER_CELL
              for (let i = startIdx; i < endIdx; i++) {
                const dx = amb.x[i]! - r.cx
                const dy = amb.y[i]! - r.cy
                const d2 = dx * dx + dy * dy
                if (d2 < innerR * innerR || d2 > outerR * outerR) continue
                const d = Math.sqrt(d2)
                if (d < 1e-3) continue
                /** Falloff: Gaussian-ish across the band centre + radial decay. */
                const bandPos = (d - r.radius) / RIPPLE_BAND_HALF
                const bandFall = 1 - bandPos * bandPos
                /** Distance decay: 1/sqrt(r) for 2D wave. */
                const distDecay = 1 / Math.sqrt(1 + d / 30)
                const force = r.amplitude * bandFall * distDecay
                /** Radial outward unit vector + upward bias because we're a ripple
                 * on a surface (impact was at bottom — most field is above). */
                const nx = dx / d
                const ny = dy / d
                amb.vx[i] = amb.vx[i]! + nx * force
                amb.vy[i] =
                  amb.vy[i]! +
                  ny * force -
                  Math.max(0, RIPPLE_UPWARD_BIAS * bandFall)
                /** Force excitement near max so the ripple band reads as a bright
                 * expanding ring of light passing through the field. */
                const rippleExc = 0.85 + bandFall * 0.15
                if (rippleExc > amb.excitement[i]!)
                  amb.excitement[i] = rippleExc
              }
            }
          }
        }
        /** Advance ripple: expand radius, decay amplitude. Retire when faded. */
        r.radius += RIPPLE_SPEED
        r.amplitude *= RIPPLE_AMPLITUDE_DECAY
        const maxR = Math.hypot(W, H)
        if (r.amplitude < RIPPLE_MIN_AMPLITUDE || r.radius > maxR) {
          ripples.splice(ri, 1)
        }
      }

      /** =========== Velocity field update (Stam fluid pass) ===========
       * Order matches home-particle-logo-hero: diffuse → pressure project →
       * decay. Game events deposit into the field elsewhere in the loop;
       * by the time particles read it below, all this frame's energy has
       * been redistributed. */
      if (field) {
        if (FIELD_DIFFUSION > 0 && fieldDiffuseScratch) {
          diffuseVelocityField(field, FIELD_DIFFUSION, fieldDiffuseScratch)
        }
        if (FIELD_PRESSURE_STRENGTH > 0 && fieldPressureScratch) {
          pressureProjectVelocityField(
            field,
            fieldPressureScratch,
            FIELD_PRESSURE_STRENGTH,
            FIELD_PRESSURE_ITERS
          )
        }
        decayVelocityField(field, FIELD_DECAY_PER_SEC, 16)
      }

      /** =========== Spring + integration (all ambient particles) =========== */

      const driftPhase = now * FIELD_DRIFT_RATE
      const fieldRideOn = field != null && FIELD_RIDE_STRENGTH > 0
      for (let i = 0; i < TOTAL_AMBIENT; i++) {
        amb.excitement[i] = amb.excitement[i]! * currentExcitementDecay
        /** Per-particle drift: each particle's effective home oscillates in a
         * small circular orbit. Phase offset varies per particle (noise-derived)
         * so neighbours flow in correlated but not identical directions. */
        const ang = amb.drift[i]! + driftPhase
        const driftHx = amb.hx[i]! + Math.cos(ang) * FIELD_DRIFT_PX
        const driftHy = amb.hy[i]! + Math.sin(ang) * FIELD_DRIFT_PX
        const sx = (driftHx - amb.x[i]!) * HOME_SPRING
        const sy = (driftHy - amb.y[i]!) * HOME_SPRING
        let nvx = (amb.vx[i]! + sx) * HOME_FRICTION
        let nvy = (amb.vy[i]! + sy) * HOME_FRICTION
        /** Read the velocity field at the particle's CURRENT position and add
         * a fraction of it to velocity. Field carries energy across frames
         * that decay/diffusion/pressure-projection have already redistributed.
         * Excitement boosted when the field is hot at this location. */
        if (fieldRideOn) {
          sampleVelocityField(
            field!,
            amb.x[i]!,
            amb.y[i]!,
            fieldSampleOut
          )
          nvx += fieldSampleOut[0] * FIELD_RIDE_STRENGTH
          nvy += fieldSampleOut[1] * FIELD_RIDE_STRENGTH
          const fmag2 = fieldSampleOut[0] * fieldSampleOut[0] +
            fieldSampleOut[1] * fieldSampleOut[1]
          if (fmag2 > 1) {
            const e = amb.excitement[i]!
            const target = Math.min(1, Math.sqrt(fmag2) * 0.15)
            if (target > e) amb.excitement[i] = target
          }
        }
        amb.vx[i] = nvx
        amb.vy[i] = nvy
        amb.x[i] = amb.x[i]! + nvx
        amb.y[i] = amb.y[i]! + nvy
      }

      /** =========== Burst physics =========== */

      const burstCurlOn = BURST_CURL_AMPLITUDE > 0
      const burstCurlT = now / 1000
      for (let i = 0; i < bursts.length; i++) {
        const p = bursts[i]!
        if (!p.alive) continue
        const age = now - p.bornAt
        if (age >= p.lifeMs) {
          p.alive = false
          continue
        }
        p.vx *= 0.93
        p.vy *= 0.93
        p.vy += 0.1
        /** Curl-noise micro-turbulence — bursts swirl through an organic 2D
         * flow instead of flying in straight ballistic lines. Falls off as the
         * burst ages so the swirl is most pronounced near birth (when the
         * spark is brightest) and dies down toward life-end. */
        if (burstCurlOn) {
          const ageU = 1 - age / p.lifeMs
          sampleCurlNoise(
            p.x,
            p.y,
            burstCurlT,
            BURST_CURL_SCALE,
            BURST_CURL_AMPLITUDE * ageU,
            BURST_CURL_HZ,
            burstCurlOut
          )
          p.vx += burstCurlOut[0]
          p.vy += burstCurlOut[1]
        }
        p.x += p.vx
        p.y += p.vy
      }

      /** =========== Render via direct pixel buffer =========== */

      /** Clear buffer (zero alpha = transparent → tetris cell bg shows through). */
      pixBuf.fill(0)
      const PW = canvas.width
      const PH = canvas.height

      /** Gradient axis for projecting positions to gradient-colour lookups. Computed
       * here (before block render) because the block render uses it to blend piece
       * colours with the local gradient colour. */
      const angleRadG = (WORDMARK_GRADIENT.angleDeg * Math.PI) / 180
      const gdx = Math.sin(angleRadG)
      const gdy = -Math.cos(angleRadG)
      let mn = Infinity
      let mx = -Infinity
      {
        const cornersG: ReadonlyArray<readonly [number, number]> = [
          [0, 0],
          [W, 0],
          [0, H],
          [W, H],
        ]
        for (const c of cornersG) {
          const tt = c[0]! * gdx + c[1]! * gdy
          if (tt < mn) mn = tt
          if (tt > mx) mx = tt
        }
      }
      const span = Math.max(1e-3, mx - mn)
      const lutMaxIdx = GRAD_LUT_SIZE - 1

      /** Draw filled cells as GLOWING RADIAL BLOBS of luminous fluid. Bright core
       * (overdriven toward white) falls off through the piece colour to a soft
       * alpha-blended edge that bleeds into the surrounding particle field. The
       * piece colour is blended 50/50 with the gradient colour at the cell's
       * canvas position — pieces feel part of the rainbow palette rather than
       * arbitrary saturated rectangles.
       *
       * Per-pixel evaluation enables:
       *  • smooth subpixel edges — block doesn't pixel-snap as it moves
       *  • luminance gradient — bright core glows like a fluid ink drop in water
       *  • alpha falloff — block bleeds into the field, no hard rectangle */
      const blockHalfW = sizeState.cellW * 0.48
      const blockHalfH = sizeState.cellH * 0.48
      const renderBlockBlob = (
        cssX: number,
        cssY: number,
        pr: number,
        pg: number,
        pb: number,
        seedA: number,
        scale = 1
      ) => {
        /** Light gradient tint of the piece colour (25% gradient / 75% piece) —
         * the piece keeps its identity while taking on a hint of the local
         * rainbow palette. Avoids the pastel "muddied" look from heavier blends. */
        const proj = cssX * gdx + cssY * gdy
        let tg = (proj - mn) / span
        if (tg < 0) tg = 0
        else if (tg > 1) tg = 1
        const lutIdx = (tg * lutMaxIdx) | 0
        const grR = gradLutR[lutIdx]!
        const grG = gradLutG[lutIdx]!
        const grB = gradLutB[lutIdx]!
        const baseR = Math.min(255, (pr * 0.75 + grR * 0.25) | 0)
        const baseG = Math.min(255, (pg * 0.75 + grG * 0.25) | 0)
        const baseB = Math.min(255, (pb * 0.75 + grB * 0.25) | 0)
        /** Pixel-space bounding box with margin for the soft edge. Scale lets
         * callers apply a rotation-pulse expansion. */
        const cxPx = cssX * dpr
        const cyPx = cssY * dpr
        const halfWPx = blockHalfW * dpr * scale
        const halfHPx = blockHalfH * dpr * scale
        const margin = 3
        const x0 = Math.max(0, ((cxPx - halfWPx - margin) | 0))
        const y0 = Math.max(0, ((cyPx - halfHPx - margin) | 0))
        const x1 = Math.min(PW, ((cxPx + halfWPx + margin) | 0) + 1)
        const y1 = Math.min(PH, ((cyPx + halfHPx + margin) | 0) + 1)
        const invHalfW = 1 / halfWPx
        const invHalfH = 1 / halfHPx
        for (let py = y0; py < y1; py++) {
          const dy = (py + 0.5 - cyPx) * invHalfH
          const dy2 = dy * dy
          if (dy2 > 1.6) continue
          const rowOff = py * PW * 4
          for (let px = x0; px < x1; px++) {
            const dx = (px + 0.5 - cxPx) * invHalfW
            const r2 = dx * dx + dy2
            if (r2 > 1.4) continue
            /** Luminance: gentle dome — bright at centre (no overdrive), softly
             * falling to ~70% at the rim. Less "white jellyfish core" look. */
            let lum: number
            if (r2 < 0.5) {
              lum = 1.0 - r2 * 0.1
            } else if (r2 < 0.95) {
              lum = 0.95 - (r2 - 0.5) * 0.55
            } else {
              lum = 0.7 - (r2 - 0.95) * 5
            }
            if (lum <= 0.05) continue
            /** Crisp alpha edge: full opacity inside r²=0.92, fast cliff to 0 by
             * r²=1.05. Block reads as deliberate fluid drop, not a fuzzy halo. */
            let edgeA: number
            if (r2 < 0.92) {
              edgeA = 255
            } else if (r2 < 1.05) {
              edgeA = (255 * (1 - (r2 - 0.92) / 0.13)) | 0
            } else {
              continue
            }
            /** Subtle white-ish core highlight — much milder than before. */
            const whiteK = r2 < 0.1 ? (0.1 - r2) * 0.7 : 0
            let r = baseR * lum
            let g = baseG * lum
            let b = baseB * lum
            if (whiteK > 0) {
              r = r + (255 - r) * whiteK
              g = g + (255 - g) * whiteK
              b = b + (255 - b) * whiteK
            }
            const off = rowOff + px * 4
            const ri = r | 0
            const gi = g | 0
            const bi = b | 0
            /** Replace pixel — block colour wins over field underneath.
             * Non-null asserted: the early-return guard above keeps pixBuf
             * non-null for the entire tick(); TS just loses track in nested loops. */
            pixBuf![off] = ri > 255 ? 255 : ri
            pixBuf![off + 1] = gi > 255 ? 255 : gi
            pixBuf![off + 2] = bi > 255 ? 255 : bi
            pixBuf![off + 3] = edgeA
          }
        }
        /** Sparse internal sparkles — 5-6 brighter pixels inside the core for
         * crystalline/granular texture, keyed on stable seed so they don't
         * shimmer between frames. */
        for (let s = 0; s < 6; s++) {
          const u = hash01(seedA, s * 11 + 5) * 1.2 - 0.6
          const v = hash01(seedA, s * 11 + 6) * 1.2 - 0.6
          const sx = (cssX + u * blockHalfW * 0.7) * dpr
          const sy = (cssY + v * blockHalfH * 0.7) * dpr
          const sxi = sx | 0
          const syi = sy | 0
          if (sxi < 0 || sxi + 1 >= PW || syi < 0 || syi + 1 >= PH) continue
          const off = (syi * PW + sxi) * 4
          // Non-null asserted — see note above on the early-return guard.
          pixBuf![off] = 255
          pixBuf![off + 1] = 255
          pixBuf![off + 2] = 255
          pixBuf![off + 3] = 255
        }
      }

      /** Block rendering moved to AFTER particles+bursts so blocks always sit
       * cleanly on top of the field — no filled-mask alignment artefacts. */

      /** Filled-cell mask for the render pass: particles whose current position
       * falls inside a LOCKED cell are skipped (block renders on top of them
       * later anyway, so rendering them is wasted work). The ACTIVE piece is
       * NOT included — its actual board cell may differ from where the block
       * visually sits during smoothed motion, and masking the actual cell
       * leaves a visible particle-void square ahead of the falling block. */
      const filledMask = new Uint8Array(BOARD_W * BOARD_H)
      for (let by = 0; by < BOARD_H; by++) {
        for (let bx = 0; bx < BOARD_W; bx++) {
          if (brdNow[by]?.[bx] !== 0) {
            filledMask[bx + by * BOARD_W] = 1
          }
        }
      }
      const padXL = sizeState.padX
      const padYL = sizeState.padY
      const cellWL = sizeState.cellW
      const cellHL = sizeState.cellH

      /** Vignette: subtle radial darkening toward canvas corners. Adds depth
       * without reducing the central action area's brightness. */
      const vignCx = W * 0.5
      const vignCy = H * 0.5
      const vignMaxD = Math.hypot(vignCx, vignCy)

      /** Ambient pass — write 1 pixel per particle. */
      for (let i = 0; i < TOTAL_AMBIENT; i++) {
        const x = amb.x[i]!
        const y = amb.y[i]!
        /** Skip if this particle is currently inside a filled cell (locked or
         * active). Without this, particles render on top of the opaque block. */
        const cbx = ((x - padXL) / cellWL) | 0
        const cby = ((y - padYL) / cellHL) | 0
        if (
          cbx >= 0 &&
          cbx < BOARD_W &&
          cby >= 0 &&
          cby < BOARD_H &&
          filledMask[cbx + cby * BOARD_W] === 1
        ) {
          continue
        }
        const px = (x * dpr) | 0
        const py = (y * dpr) | 0
        if (px < 0 || px >= PW || py < 0 || py >= PH) continue
        const proj = x * gdx + y * gdy
        let t = (proj - mn) / span
        if (t < 0) t = 0
        else if (t > 1) t = 1
        const lutIdx = (t * lutMaxIdx) | 0
        let r = gradLutR[lutIdx]!
        let g = gradLutG[lutIdx]!
        let b = gradLutB[lutIdx]!
        const exc = amb.excitement[i]!
        if (exc > 0) {
          const k = exc < 0.85 ? exc : 0.85
          r = r + (255 - r) * k
          g = g + (255 - g) * k
          b = b + (255 - b) * k
        }
        /** Brightness modulation: density (noise texture, baked at build) gives
         * the field visible streaks/clusters; AMBIENT_BASE_ALPHA dims resting
         * particles so excited (bright white-blended) ones stand out; vignette
         * darkens corners. */
        const dens = amb.density[i]!
        const densMul = 0.78 + dens * 0.42
        const restMul = AMBIENT_BASE_ALPHA + (1 - AMBIENT_BASE_ALPHA) * exc
        const dvX = px - vignCx
        const dvY = py - vignCy
        const dV = Math.sqrt(dvX * dvX + dvY * dvY) / vignMaxD
        /** Top half gets extra darkening — biases the eye toward the lower
         * portion of the playfield where the locked stack sits. */
        const topBias =
          py < vignCy ? (1 - py / vignCy) * VIGNETTE_TOP_BIAS : 0
        const vignMul = Math.max(0.2, 1 - dV * currentVignetteStrength - topBias)
        const finalMul = restMul * densMul * vignMul
        const off = (py * PW + px) * 4
        pixBuf[off] = (r * finalMul) | 0
        pixBuf[off + 1] = (g * finalMul) | 0
        pixBuf[off + 2] = (b * finalMul) | 0
        pixBuf[off + 3] = 255
      }

      /** Burst pass — 2×2 splat per particle so they read brighter than ambient. */
      for (let i = 0; i < bursts.length; i++) {
        const p = bursts[i]!
        if (!p.alive) continue
        const age = now - p.bornAt
        const a = Math.max(0, 1 - age / p.lifeMs)
        if (a <= 0.05) continue
        const proj = p.x * gdx + p.y * gdy
        let t = (proj - mn) / span
        if (t < 0) t = 0
        else if (t > 1) t = 1
        const lutIdx = (t * lutMaxIdx) | 0
        let r = gradLutR[lutIdx]!
        let g = gradLutG[lutIdx]!
        let b = gradLutB[lutIdx]!
        /** Bursts ride at high excitement initially, fading. */
        const k = a * 0.85
        r = (r + (255 - r) * k) | 0
        g = (g + (255 - g) * k) | 0
        b = (b + (255 - b) * k) | 0
        const al = (a * 255) | 0
        const px0 = (p.x * dpr) | 0
        const py0 = (p.y * dpr) | 0
        for (let dy = 0; dy < 2; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            const px = px0 + dx
            const py = py0 + dy
            if (px < 0 || px >= PW || py < 0 || py >= PH) continue
            const off = (py * PW + px) * 4
            pixBuf[off] = r
            pixBuf[off + 1] = g
            pixBuf[off + 2] = b
            pixBuf[off + 3] = al
          }
        }
      }

      /** Visible water-drop wave-front: draw a soft glowing arc into the pixel
       * buffer at each ripple's current radius. The ring physically appears as
       * a curve of light expanding outward, layered on top of the displaced
       * particles. Decays with the ripple's amplitude. */
      for (const rip of ripples) {
        if (now < rip.startAt) continue
        if (rip.radius < 4) continue
        const ringRP = RIPPLE_RING_HALF_PX * dpr
        const radiusP = rip.radius * dpr
        const cxP = rip.cx * dpr
        const cyP = rip.cy * dpr
        const outerRP = radiusP + ringRP
        const x0 = Math.max(0, ((cxP - outerRP) | 0))
        const y0 = Math.max(0, ((cyP - outerRP) | 0))
        const x1 = Math.min(PW, ((cxP + outerRP) | 0) + 1)
        const y1 = Math.min(PH, ((cyP + outerRP) | 0) + 1)
        const ampNorm = Math.min(1, rip.amplitude / RIPPLE_AMPLITUDE)
        /** Peak alpha in the band, scales with amplitude. */
        const peakA = ampNorm * 220
        if (peakA < 6) continue
        const innerRP = Math.max(0, radiusP - ringRP)
        for (let py = y0; py < y1; py++) {
          const dy = py + 0.5 - cyP
          if (dy * dy > outerRP * outerRP) continue
          const rowOff = py * PW * 4
          for (let px = x0; px < x1; px++) {
            const dx = px + 0.5 - cxP
            const d2 = dx * dx + dy * dy
            if (d2 > outerRP * outerRP || d2 < innerRP * innerRP) continue
            const d = Math.sqrt(d2)
            const distFromRing = Math.abs(d - radiusP)
            if (distFromRing > ringRP) continue
            /** Wave shape: bright crest at the leading edge of the band, dark
             * trough just behind, smaller bright tail. Reads as a real wave
             * with surface tension instead of a uniform glowing band. */
            const u = distFromRing / ringRP
            const inner = d < radiusP
            let intensity: number
            if (inner) {
              /** Inside the ring radius (toward impact centre): dark trough
               * peaks at u≈0.55 then softens at edges. */
              const t = u
              intensity = -Math.sin(t * Math.PI) * 0.55
            } else {
              /** Outside (leading edge): bright crest peaks at u≈0.4. */
              const t = u
              intensity = (1 - t) * (1 - t * 0.5)
            }
            if (intensity > 0) {
              /** Bright crest — additive toward white. */
              const a = (peakA * intensity) | 0
              if (a < 6) continue
              const off = rowOff + px * 4
              const k = a / 255
              pixBuf[off] =
                (pixBuf[off]! + (255 - pixBuf[off]!) * k) | 0
              pixBuf[off + 1] =
                (pixBuf[off + 1]! + (255 - pixBuf[off + 1]!) * k) | 0
              pixBuf[off + 2] =
                (pixBuf[off + 2]! + (255 - pixBuf[off + 2]!) * k) | 0
              const cur = pixBuf[off + 3]!
              if (a > cur) pixBuf[off + 3] = a
            } else if (intensity < 0) {
              /** Dark trough — multiplicative darkening toward black. */
              const k = -intensity * (peakA / 255)
              if (k < 0.025) continue
              const off = rowOff + px * 4
              const dim = 1 - k * 0.6
              pixBuf[off] = (pixBuf[off]! * dim) | 0
              pixBuf[off + 1] = (pixBuf[off + 1]! * dim) | 0
              pixBuf[off + 2] = (pixBuf[off + 2]! * dim) | 0
            }
          }
        }
      }

      /** =========== Block render (over particles + bursts) ===========
       * Blocks render LAST among the field-level passes so they sit cleanly on
       * top of any particles around them — no need to mask particles by active-
       * piece position; they're simply covered by the block's own pixels. */

      /** Locked cells: each blob breathes via a tiny per-cell sinusoidal offset
       * so the static stack feels alive instead of frozen. */
      const breathePhase = now * 0.0009
      for (let by = 0; by < BOARD_H; by++) {
        for (let bx = 0; bx < BOARD_W; bx++) {
          const v = brdNow[by]?.[bx] ?? 0
          if (v === 0) continue
          const colour = PIECE_RGB[v - 1] ?? [255, 255, 255]
          const c = cellCentre(bx, by)
          const seed = bx * 1009 + by * 17 + 1
          const breatheX =
            Math.sin(breathePhase + bx * 0.4 + by * 0.7) * LOCKED_BREATHE_PX
          const breatheY =
            Math.cos(breathePhase * 1.13 + bx * 0.6 + by * 0.3) *
            LOCKED_BREATHE_PX
          renderBlockBlob(
            c.x + breatheX,
            c.y + breatheY,
            colour[0]!,
            colour[1]!,
            colour[2]!,
            seed
          )
        }
      }

      /** Active piece: rendered AFTER locked so it visually sits on top during
       * lock transitions. Position uses the smoothly-interpolated offset.
       * Rotation pulse scales briefly to punctuate rotation events. */
      let activeScale = 1
      if (rotationPulse.startedAt >= 0) {
        const elapsed = now - rotationPulse.startedAt
        if (elapsed >= ROTATION_PULSE_MS) {
          rotationPulse.startedAt = -1
        } else {
          const u = elapsed / ROTATION_PULSE_MS
          const bell = Math.sin(u * Math.PI)
          activeScale = 1 + ROTATION_PULSE_SCALE * bell
        }
      }
      if (actNow != null) {
        const colour = PIECE_RGB[actNow.t] ?? [255, 255, 255]
        for (let aci = 0; aci < activeCellsForMotion.length; aci++) {
          const ac = activeCellsForMotion[aci]!
          const c = cellCentre(ac.bx, ac.by)
          renderBlockBlob(
            c.x + smoothOffsetX,
            c.y + smoothOffsetY,
            colour[0]!,
            colour[1]!,
            colour[2]!,
            900000 + aci * 31,
            activeScale
          )
        }
      }

      /** Lock anticipation flash: brief bright glow over each just-locked cell,
       * tinted by the piece's colour. Drawn over locked blocks before ripples
       * radiate. ~110ms. */
      for (let li = lockFlashes.length - 1; li >= 0; li--) {
        const lf = lockFlashes[li]!
        const age = now - lf.bornAt
        if (age >= LOCK_FLASH_LIFE_MS) {
          lockFlashes.splice(li, 1)
          continue
        }
        const u = age / LOCK_FLASH_LIFE_MS
        /** Bell curve so flash rises and falls in the window. */
        const bell = Math.sin(u * Math.PI)
        const a = (bell * 200) | 0
        if (a < 8) continue
        const lr = lf.colour[0]
        const lg = lf.colour[1]
        const lb = lf.colour[2]
        const halfWPx = sizeState.cellW * 0.55 * (1 + bell * 0.25) * dpr
        const halfHPx = sizeState.cellH * 0.55 * (1 + bell * 0.25) * dpr
        for (const cc of lf.cells) {
          const c = cellCentre(cc.bx, cc.by)
          const cxPx = c.x * dpr
          const cyPx = c.y * dpr
          const x0 = Math.max(0, ((cxPx - halfWPx) | 0))
          const y0 = Math.max(0, ((cyPx - halfHPx) | 0))
          const x1 = Math.min(PW, ((cxPx + halfWPx) | 0))
          const y1 = Math.min(PH, ((cyPx + halfHPx) | 0))
          for (let py = y0; py < y1; py++) {
            const rowOff = py * PW * 4
            for (let px = x0; px < x1; px++) {
              const off = rowOff + px * 4
              const k = a / 255
              /** Additive blend toward the piece's tinted-white. */
              const tr = (lr + 255) >> 1
              const tg = (lg + 255) >> 1
              const tb = (lb + 255) >> 1
              pixBuf[off] = (pixBuf[off]! + (tr - pixBuf[off]!) * k) | 0
              pixBuf[off + 1] =
                (pixBuf[off + 1]! + (tg - pixBuf[off + 1]!) * k) | 0
              pixBuf[off + 2] =
                (pixBuf[off + 2]! + (tb - pixBuf[off + 2]!) * k) | 0
              if (a > pixBuf[off + 3]!) pixBuf[off + 3] = a
            }
          }
        }
      }

      /** Pre-vanish pop: at line clear, draw oversized blocks tinted by the
       * row's actual block colours for ~140ms — reads as the row's blocks
       * dispersing rather than a generic white flash. */
      const POP_LIFE_MS = 140
      for (let pi = clearPops.length - 1; pi >= 0; pi--) {
        const pop = clearPops[pi]!
        const age = now - pop.bornAt
        if (age >= POP_LIFE_MS) {
          clearPops.splice(pi, 1)
          continue
        }
        const u = age / POP_LIFE_MS
        /** Expand from 1.0 to 1.5 over the pop's life. */
        const scale = 1 + u * 0.5
        const a = ((1 - u) * 255) | 0
        const halfWPx = sizeState.cellW * 0.5 * scale * dpr
        const halfHPx = sizeState.cellH * 0.5 * scale * dpr
        const cyPx = (pop.y * dpr) | 0
        for (let bx = 0; bx < BOARD_W; bx++) {
          const cellCx =
            sizeState.padX + (bx + 0.5) * sizeState.cellW
          const cxPx = (cellCx * dpr) | 0
          const x0 = Math.max(0, (cxPx - halfWPx) | 0)
          const y0 = Math.max(0, (cyPx - halfHPx) | 0)
          const x1 = Math.min(PW, (cxPx + halfWPx) | 0)
          const y1 = Math.min(PH, (cyPx + halfHPx) | 0)
          /** Tint by the actual block colour at this column (captured from the
           * row before it cleared), brightened toward white as the pop fades. */
          const cellVal = pop.colors[bx] ?? 0
          const cellColour =
            cellVal > 0 ? PIECE_RGB[cellVal - 1] : null
          if (cellColour == null) continue
          /** Brighter at the centre of the pop's life (bell), fades outward. */
          const bell = Math.sin(u * Math.PI)
          const whiteK = 0.5 + bell * 0.5
          const cr =
            (cellColour[0] + (255 - cellColour[0]) * whiteK) | 0
          const cg =
            (cellColour[1] + (255 - cellColour[1]) * whiteK) | 0
          const cb =
            (cellColour[2] + (255 - cellColour[2]) * whiteK) | 0
          for (let py = y0; py < y1; py++) {
            const rowOff = py * PW * 4
            for (let px = x0; px < x1; px++) {
              const off = rowOff + px * 4
              pixBuf[off] = cr
              pixBuf[off + 1] = cg
              pixBuf[off + 2] = cb
              pixBuf[off + 3] = a
            }
          }
        }
      }

      /** Line-clear flash: bright horizontal stripe over the cleared row that fades
       * with cubic ease-out. Drawn additively so the row reads as a quick burst of
       * brilliance before fading to dark. */
      for (let fi = flashes.length - 1; fi >= 0; fi--) {
        const fl = flashes[fi]!
        const age = now - fl.bornAt
        if (age >= FLASH_LIFE_MS) {
          flashes.splice(fi, 1)
          continue
        }
        const u = age / FLASH_LIFE_MS
        const a = (1 - u) * (1 - u) * (1 - u)
        const halfBandPx = (sizeState.cellH * 0.6) * dpr
        const cyPx = (fl.y * dpr) | 0
        const y0 = Math.max(0, cyPx - (halfBandPx | 0))
        const y1 = Math.min(PH, cyPx + (halfBandPx | 0))
        for (let py = y0; py < y1; py++) {
          /** Fade vertically away from the band centre too. */
          const vDist = Math.abs(py - cyPx) / halfBandPx
          const vFall = 1 - vDist * vDist
          const aa = a * vFall * 240
          if (aa < 8) continue
          const rowOff = py * PW * 4
          for (let px = 0; px < PW; px++) {
            const off = rowOff + px * 4
            /** Additive blend toward white over the existing pixel. */
            const cur = pixBuf[off + 3]!
            if (cur < aa) {
              const k = aa / 255
              pixBuf[off] = (pixBuf[off]! + (255 - pixBuf[off]!) * k) | 0
              pixBuf[off + 1] =
                (pixBuf[off + 1]! + (255 - pixBuf[off + 1]!) * k) | 0
              pixBuf[off + 2] =
                (pixBuf[off + 2]! + (255 - pixBuf[off + 2]!) * k) | 0
              pixBuf[off + 3] = aa | 0
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0)

      /** =================== Ghost-piece outline ===================
       * Drawn AFTER putImageData via the 2D ctx so the stroked outline doesn't
       * fight with the dense pixel-buffer writes above. A thin sinusoidal pulse
       * keeps the ghost feeling alive without competing with the active piece. */
      if (
        ghostCellsNow != null &&
        ghostCellsNow.length > 0 &&
        phaseNow === "playing"
      ) {
        const pulse = 0.5 + 0.5 * Math.sin(now * 0.001 * GHOST_PULSE_HZ * Math.PI * 2)
        const alpha = GHOST_ALPHA_BASE + GHOST_ALPHA_RANGE * pulse
        ctx.save()
        ctx.lineWidth = 1.5 * dpr
        const halfW = sizeState.cellW * 0.5
        const halfH = sizeState.cellH * 0.5
        const inset = 1.5
        for (let gi = 0; gi < ghostCellsNow.length; gi++) {
          const gc = ghostCellsNow[gi]!
          const c = cellCentre(gc.bx, gc.by)
          const rgb = PIECE_RGB[gc.t] ?? [255, 255, 255]
          ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`
          ctx.strokeRect(
            (c.x - halfW + inset) * dpr,
            (c.y - halfH + inset) * dpr,
            (sizeState.cellW - 2 * inset) * dpr,
            (sizeState.cellH - 2 * inset) * dpr
          )
        }
        ctx.restore()
      }

      /** =================== Tetris "chapter sweep" ===================
       * Soft white band sweeps bottom→top over CHAPTER_SWEEP_MS for tetris
       * clears only. Screen-blended so it adds bloom rather than overpainting,
       * vertical gradient so the band tapers softly at top + bottom edges. */
      if (chapterSweepAt >= 0) {
        const elapsed = now - chapterSweepAt
        if (elapsed < CHAPTER_SWEEP_MS) {
          const t = elapsed / CHAPTER_SWEEP_MS
          const eased = -(Math.cos(Math.PI * t) - 1) / 2
          const Hpx = canvas.height
          const Wpx = canvas.width
          const bandY = Hpx * (1 - eased)
          const bandH = Hpx * 0.18
          ctx.save()
          ctx.globalCompositeOperation = "screen"
          const grad = ctx.createLinearGradient(
            0,
            bandY - bandH / 2,
            0,
            bandY + bandH / 2
          )
          grad.addColorStop(0, "rgba(255,255,255,0)")
          grad.addColorStop(0.5, "rgba(255,255,255,0.14)")
          grad.addColorStop(1, "rgba(255,255,255,0)")
          ctx.fillStyle = grad
          ctx.fillRect(0, bandY - bandH / 2, Wpx, bandH)
          ctx.restore()
        } else {
          chapterSweepAt = -1
        }
      }

      /** =================== Game-over depth-of-field ===================
       * When the game ends, fade in a soft blur of the canvas onto itself over
       * DOF_FADE_MS, then hold steady forever. We blur into a 1/4-resolution
       * scratch canvas (cheap), then composite the upscaled blur on top of the
       * sharp render. Reaches max opacity of 0.55 — preserves enough detail to
       * read the final field, while feeling dreamy/cinematic. */
      if (gameOverNow && gameOverAt >= 0) {
        const elapsed = now - gameOverAt
        const t = Math.min(1, elapsed / DOF_FADE_MS)
        const blurAlpha = (1 - Math.pow(1 - t, 3)) * 0.55
        if (blurAlpha > 0.02) {
          const dW = Math.max(2, (canvas.width / 4) | 0)
          const dH = Math.max(2, (canvas.height / 4) | 0)
          if (!dofCanvas || dofCanvas.width !== dW || dofCanvas.height !== dH) {
            dofCanvas = document.createElement("canvas")
            dofCanvas.width = dW
            dofCanvas.height = dH
            dofCtx = dofCanvas.getContext("2d")
          }
          if (dofCtx && dofCanvas) {
            dofCtx.globalCompositeOperation = "copy"
            dofCtx.filter = "blur(2px)"
            dofCtx.drawImage(canvas, 0, 0, dW, dH)
            dofCtx.filter = "none"
            ctx.save()
            ctx.globalAlpha = blurAlpha
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = "high"
            ctx.drawImage(dofCanvas, 0, 0, canvas.width, canvas.height)
            ctx.restore()
          }
        }
      }

      prevRef.current = {
        display: dispNow,
        board: brdNow,
        active: actNow,
        lines: linesNow,
        gameOver: propsRef.current.gameOver,
        level: levelNow,
        lastClearAt: lastClearAtNow,
      }
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [containerRef])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10"
      aria-hidden
    />
  )
}
