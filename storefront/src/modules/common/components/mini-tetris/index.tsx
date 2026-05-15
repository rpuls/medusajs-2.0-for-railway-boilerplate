"use client"

import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react"
import { AnimatePresence, motion } from "framer-motion"

import TetrisParticleOverlay from "./tetris-particle-overlay"

const BOARD_W = 10
const BOARD_H = 20
const PIECE_TYPES = 7
const GRID = 4

const LINE_BONUS = [0, 100, 300, 500, 800] as const

/** Levels 1..15. dropMs = max(LEVEL_MIN_MS, LEVEL_BASE_MS * LEVEL_SPEED_FACTOR^(L-1)).
 * Levels advance every 10 lines. Reduced-motion multiplies dropMs by
 * LEVEL_REDUCED_MOTION_MULT so the game stays playable for slow inputs. */
const LEVEL_BASE_MS = 800
const LEVEL_MIN_MS = 95
const LEVEL_SPEED_FACTOR = 0.85
const LEVEL_MAX = 15
const LEVEL_REDUCED_MOTION_MULT = 1.45
const LINES_PER_LEVEL = 10

/** Total visible duration of the line-clear celebration label (enter + hold +
 * exit). The reducer keeps the label state forever once set; the rendered
 * component auto-hides itself after this window via AnimatePresence keyed by
 * lastClearAt — so each new clear remounts the label cleanly. */
const CLEAR_LABEL_DURATION_MS = 1300

/** Intro sequence total duration. Players can skip with any input. */
const INTRO_DURATION_MS = 1400

const LS_KEY_BEST = "mini-tetris:best"

/** 1 = block in shape. O has a single 4x4; others list each rotation. */
const SHAPES: readonly (readonly (readonly (readonly (0 | 1)[])[])[])[] = [
  // I
  [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  // O
  [
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
  ],
  // T
  [
    [
      [0, 0, 0, 0],
      [0, 1, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 1, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  // S
  [
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [1, 1, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  // Z
  [
    [
      [0, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 1, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
    ],
  ],
  // J
  [
    [
      [0, 0, 0, 0],
      [1, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
    ],
  ],
  // L
  [
    [
      [0, 0, 0, 0],
      [0, 0, 1, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [1, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
] as const

const PIECE_FILL: readonly string[] = [
  "var(--brand-accent)",
  "var(--brand-secondary)",
  "var(--brand-primary)",
  "color-mix(in srgb, var(--brand-accent) 70%, var(--brand-background))",
  "color-mix(in srgb, var(--brand-secondary) 75%, var(--brand-primary))",
  "color-mix(in srgb, var(--brand-primary) 55%, var(--brand-accent))",
  "color-mix(in srgb, var(--brand-primary) 40%, var(--brand-background))",
]

type Board = (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7)[][]

type Active = { t: number; r: number; x: number; y: number }

type ClearKind = "single" | "double" | "triple" | "tetris"
type Phase = "intro" | "playing" | "over"

type GameState = {
  board: Board
  active: Active | null
  next: number
  lines: number
  score: number
  level: number
  phase: Phase
  lastClearKind: ClearKind | null
  lastClearAt: number
  comboCount: number
  best: number
}

const SPAWN_X = 3
const SPAWN_Y = 0

function emptyBoard(): Board {
  return Array.from({ length: BOARD_H }, () =>
    Array.from({ length: BOARD_W }, () => 0 as 0)
  )
}

function getShapeM(t: number, r: number) {
  const piece = SHAPES[t]!
  const k = r % piece.length
  return piece[k]! as (0 | 1)[][]
}

function collides(
  b: Board,
  t: number,
  r: number,
  px: number,
  py: number
): boolean {
  const m = getShapeM(t, r)
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (m[row]![col]! !== 1) {
        continue
      }
      const by = py + row
      const bx = px + col
      if (bx < 0 || bx >= BOARD_W) {
        return true
      }
      if (by >= BOARD_H) {
        return true
      }
      if (by < 0) {
        continue
      }
      if (b[by]![bx]! !== 0) {
        return true
      }
    }
  }
  return false
}

function lockPiece(
  b: Board,
  t: number,
  r: number,
  px: number,
  py: number
): void {
  const m = getShapeM(t, r)
  const mark = (t + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (m[row]![col]! !== 1) {
        continue
      }
      const by = py + row
      const bx = px + col
      if (by >= 0 && by < BOARD_H && bx >= 0 && bx < BOARD_W) {
        b[by]![bx] = mark
      }
    }
  }
}

function clearFullRows(b: Board): number {
  let cleared = 0
  for (let y = BOARD_H - 1; y >= 0; ) {
    if (b[y]!.every((c) => c !== 0)) {
      b.splice(y, 1)
      b.unshift(Array.from({ length: BOARD_W }, () => 0 as 0))
      cleared += 1
    } else {
      y -= 1
    }
  }
  return cleared
}

function randomPieceType(): number {
  return (Math.random() * PIECE_TYPES) | 0
}

function trySpawn(b: Board, t: number): Active | null {
  const a: Active = { t, r: 0, x: SPAWN_X, y: SPAWN_Y }
  if (collides(b, a.t, a.r, a.x, a.y)) {
    return null
  }
  return a
}

function levelFromLines(lines: number): number {
  return Math.min(LEVEL_MAX, Math.floor(lines / LINES_PER_LEVEL) + 1)
}

function dropMsForLevel(level: number, reduceMotion: boolean): number {
  const raw = Math.max(
    LEVEL_MIN_MS,
    LEVEL_BASE_MS * Math.pow(LEVEL_SPEED_FACTOR, level - 1)
  )
  return reduceMotion ? raw * LEVEL_REDUCED_MOTION_MULT : raw
}

function clearKindFromCount(c: number): ClearKind | null {
  if (c === 1) return "single"
  if (c === 2) return "double"
  if (c === 3) return "triple"
  if (c >= 4) return "tetris"
  return null
}

/** Compute the ghost piece position — the same piece dropped as far as it goes
 * without collision. Returns null when ghost would land at the active piece's
 * own position (already at landing) so the outline doesn't double up. */
function getGhost(b: Board, a: Active | null): Active | null {
  if (!a) return null
  let y = a.y
  while (!collides(b, a.t, a.r, a.x, y + 1)) {
    y += 1
  }
  if (y === a.y) return null
  return { t: a.t, r: a.r, x: a.x, y }
}

/** Derive the ghost piece's 4 cell positions on the board for canvas rendering. */
function getGhostCells(
  ghost: Active | null
): { bx: number; by: number; t: number }[] | null {
  if (!ghost) return null
  const m = getShapeM(ghost.t, ghost.r)
  const cells: { bx: number; by: number; t: number }[] = []
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (m[row]![col]! !== 1) continue
      const by = ghost.y + row
      const bx = ghost.x + col
      if (by < 0 || by >= BOARD_H || bx < 0 || bx >= BOARD_W) continue
      cells.push({ bx, by, t: ghost.t })
    }
  }
  return cells.length > 0 ? cells : null
}

function readBest(): number {
  if (typeof window === "undefined") return 0
  try {
    const v = window.localStorage.getItem(LS_KEY_BEST)
    const n = v == null ? 0 : Number.parseInt(v, 10)
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}

function writeBest(n: number): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(LS_KEY_BEST, String(n))
  } catch {
    // localStorage can fail in private mode / quota — silently ignore.
  }
}

type InitOpts = { best: number; phase: Phase }

function createInitialState(opts?: InitOpts): GameState {
  const b = emptyBoard()
  const a = randomPieceType()
  const n = randomPieceType()
  const active = trySpawn(b, a)
  return {
    board: b,
    active,
    next: n,
    lines: 0,
    score: 0,
    level: 1,
    phase: !active ? "over" : opts?.phase ?? "intro",
    lastClearKind: null,
    lastClearAt: 0,
    comboCount: 0,
    best: opts?.best ?? 0,
  }
}

type Action =
  | { type: "tick" }
  | { type: "move"; dx: number; dy: number }
  | { type: "rotate" }
  | { type: "hardDrop" }
  | { type: "restart"; phase: Phase }
  | { type: "startPlaying" }

function gameReducer(state: GameState, action: Action): GameState {
  if (action.type === "restart") {
    return createInitialState({ best: state.best, phase: action.phase })
  }
  if (action.type === "startPlaying") {
    if (state.phase === "intro") {
      return { ...state, phase: "playing" }
    }
    return state
  }
  if (state.phase !== "playing" || !state.active) {
    return state
  }
  const a = state.active

  if (action.type === "move") {
    const { dx, dy } = action
    const nx = a.x + dx
    const ny = a.y + dy
    if (collides(state.board, a.t, a.r, nx, ny)) {
      return state
    }
    return { ...state, active: { ...a, x: nx, y: ny } }
  }

  if (action.type === "rotate") {
    const piece = SHAPES[a.t]!
    const nRot = (a.r + 1) % piece.length
    if (collides(state.board, a.t, nRot, a.x, a.y)) {
      return state
    }
    return { ...state, active: { ...a, r: nRot } }
  }

  if (action.type === "hardDrop") {
    const b = state.board.map((row) => [...row])
    let y = a.y
    while (!collides(b, a.t, a.r, a.x, y + 1)) {
      y += 1
    }
    lockPiece(b, a.t, a.r, a.x, y)
    return finalizeLock(state, b)
  }

  if (action.type === "tick") {
    if (collides(state.board, a.t, a.r, a.x, a.y + 1)) {
      const b = state.board.map((row) => [...row])
      lockPiece(b, a.t, a.r, a.x, a.y)
      return finalizeLock(state, b)
    }
    return { ...state, active: { ...a, y: a.y + 1 } }
  }
  return state
}

/** Shared post-lock pipeline: clear rows, spawn next piece, update score /
 * lines / level / combo / lastClear / phase / best. Pulled out of the reducer
 * so tick and hardDrop share identical logic. */
function finalizeLock(prev: GameState, b: Board): GameState {
  const c = clearFullRows(b)
  const nextT = prev.next
  const newNext = randomPieceType()
  const na = trySpawn(b, nextT)
  const newLines = prev.lines + c
  const newScore = prev.score + (LINE_BONUS[c] ?? 0)
  const isOver = !na
  const kind = clearKindFromCount(c)
  // Only update lastClearAt when a clear actually happened so the celebration
  // label's AnimatePresence key stays stable on 0-clear locks.
  const newLastClearAt =
    kind !== null ? Date.now() : prev.lastClearAt
  const newLastClearKind = kind !== null ? kind : prev.lastClearKind
  const newCombo = c > 0 ? prev.comboCount + 1 : 0
  const newLevel = levelFromLines(newLines)
  const newBest = Math.max(prev.best, newScore)
  return {
    ...prev,
    board: b,
    active: na,
    next: newNext,
    lines: newLines,
    score: newScore,
    level: newLevel,
    phase: isOver ? "over" : prev.phase,
    lastClearKind: newLastClearKind,
    lastClearAt: newLastClearAt,
    comboCount: newCombo,
    best: newBest,
  }
}

/** Default vs 1.5× (lg) vs 2.25× (xl, not-found) cell dimensions.
 * Empty cells are entirely transparent — the playfield is rendered on the
 * particle-overlay canvas, no DOM grid lines. The next-piece preview keeps
 * subtle rim lines so its layout reads. */
const TETRIS_SIZES = {
  default: {
    cellEmpty: "w-3.5 h-3.5 small:w-4 small:h-4",
    cellFilled: "w-3.5 h-3.5 small:w-4 small:h-4 box-border",
    next: "w-3 h-3",
  },
  lg: {
    cellEmpty: "w-[1.3125rem] h-[1.3125rem] small:w-6 small:h-6",
    cellFilled: "w-[1.3125rem] h-[1.3125rem] small:w-6 small:h-6 box-border",
    next: "w-[1.125rem] h-[1.125rem]",
  },
  xl: {
    cellEmpty: "w-5 h-5 small:w-7 small:h-7",
    cellFilled: "w-5 h-5 small:w-7 small:h-7 box-border",
    next: "w-4 h-4 small:w-5 small:h-5",
  },
} as const

/** ---------- AnimatedNumber: a tiny RAF tween that counts a numeric value
 * from the previously displayed value to the new value over `duration` ms with
 * easeOutCubic, and briefly lifts a blue-glow text-shadow on increase. Inline
 * because the flash semantics are specific to this HUD. */
const SHADOW_BASE = "0 0 12px rgba(120,180,255,0.45), 0 0 30px rgba(120,180,255,0.25)"
const SHADOW_PEAK = "0 0 22px rgba(120,180,255,0.85), 0 0 60px rgba(120,180,255,0.45)"
const SHADOW_FLASH_MS = 700

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function buildShadow(flashAmount: number): string {
  // Linearly interpolate blur radii and alphas between baseline and peak.
  const a1 = 0.45 + 0.4 * flashAmount
  const a2 = 0.25 + 0.2 * flashAmount
  const r1 = 12 + 10 * flashAmount
  const r2 = 30 + 30 * flashAmount
  return `0 0 ${r1}px rgba(120,180,255,${a1}), 0 0 ${r2}px rgba(120,180,255,${a2})`
}

type AnimatedNumberProps = {
  value: number
  duration?: number
  reduceMotion?: boolean
  className?: string
  style?: CSSProperties
}

function AnimatedNumber({
  value,
  duration = 650,
  reduceMotion = false,
  className,
  style,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)
  const spanRef = useRef<HTMLSpanElement | null>(null)
  const fromRef = useRef(value)
  const toRef = useRef(value)
  const startRef = useRef<number>(0)
  const flashStartRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const displayRef = useRef(value)

  // Apply the resting shadow on first mount.
  useEffect(() => {
    if (spanRef.current) {
      spanRef.current.style.textShadow = SHADOW_BASE
    }
  }, [])

  useEffect(() => {
    if (value === toRef.current) return
    if (reduceMotion) {
      setDisplay(value)
      displayRef.current = value
      toRef.current = value
      fromRef.current = value
      return
    }
    fromRef.current = displayRef.current
    toRef.current = value
    startRef.current = performance.now()
    if (value > displayRef.current) {
      flashStartRef.current = performance.now()
    }
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    const tick = () => {
      const now = performance.now()
      const t = Math.min(1, (now - startRef.current) / duration)
      const eased = easeOutCubic(t)
      const v = Math.round(
        fromRef.current + (toRef.current - fromRef.current) * eased
      )
      displayRef.current = v
      setDisplay(v)
      const el = spanRef.current
      if (el) {
        const fs = flashStartRef.current
        if (fs != null) {
          const ft = (now - fs) / SHADOW_FLASH_MS
          if (ft >= 1) {
            el.style.textShadow = SHADOW_BASE
            flashStartRef.current = null
          } else {
            // Smooth ease back to baseline.
            const flashAmount = 1 - easeOutCubic(ft)
            el.style.textShadow = buildShadow(flashAmount)
          }
        }
      }
      if (t < 1 || flashStartRef.current != null) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = null
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [value, reduceMotion, duration])

  return (
    <span ref={spanRef} className={className} style={style}>
      {display}
    </span>
  )
}

/** ---------- ClearLabel: the SINGLE/DOUBLE/TRIPLE/TETRIS celebration that
 * floats over the board. Mounted only while inside its visible window after a
 * clear; outside the window AnimatePresence has nothing to render so the DOM
 * stays empty. Keyed by `at` so each clear remounts fresh. */
const CLEAR_KIND_COPY: Record<
  ClearKind,
  { label: string; tint: string; size: string; holdMs: number }
> = {
  single: {
    label: "SINGLE",
    tint: "rgba(255,255,255,0.8)",
    size: "1.5rem",
    holdMs: 180,
  },
  double: {
    label: "DOUBLE",
    tint: "rgba(255,255,255,0.95)",
    size: "1.7rem",
    holdMs: 300,
  },
  triple: {
    label: "TRIPLE",
    tint: "var(--brand-accent)",
    size: "1.9rem",
    holdMs: 450,
  },
  tetris: {
    label: "TETRIS",
    tint: "var(--brand-secondary)",
    size: "2.6rem",
    holdMs: 700,
  },
}

function ClearLabel({
  kind,
  at,
  combo,
  reduceMotion,
}: {
  kind: ClearKind | null
  at: number
  combo: number
  reduceMotion: boolean
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (kind == null || at <= 0) return
    setVisible(true)
    const id = window.setTimeout(
      () => setVisible(false),
      CLEAR_LABEL_DURATION_MS
    )
    return () => window.clearTimeout(id)
  }, [at, kind])

  const copy = kind ? CLEAR_KIND_COPY[kind] : null
  const enter = reduceMotion
    ? { duration: 0.3, ease: "linear" as const }
    : { duration: 0.24, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  const exit = reduceMotion
    ? { duration: 0.3, ease: "linear" as const }
    : { duration: 0.7, ease: [0.5, 0, 0.75, 0] as [number, number, number, number] }

  return (
    <div
      className="absolute inset-x-0 pointer-events-none flex flex-col items-center"
      style={{ top: "10%" }}
      aria-live="polite"
    >
      <AnimatePresence>
        {visible && copy ? (
          <motion.div
            key={`label-${at}`}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 12, scale: 0.94 }
            }
            animate={
              reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: -18, scale: 1.02 }
            }
            transition={enter}
            style={{
              fontSize: copy.size,
              color: copy.tint,
              fontWeight: 800,
              letterSpacing: "0.18em",
              textShadow:
                "0 0 24px rgba(120,180,255,0.55), 0 0 60px rgba(120,180,255,0.25)",
            }}
          >
            {copy.label}
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {visible && combo >= 2 ? (
          <motion.div
            key={`combo-${at}`}
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
            }
            animate={
              reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
            }
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }
            }
            transition={
              reduceMotion
                ? enter
                : { ...enter, delay: 0.06 }
            }
            style={{
              marginTop: "0.4rem",
              fontSize: "1.05rem",
              color: "var(--brand-accent)",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textShadow:
                "0 0 18px rgba(120,180,255,0.45), 0 0 40px rgba(120,180,255,0.2)",
            }}
          >
            x{combo} COMBO
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {visible && copy ? (
          <motion.div
            key={`exit-${at}`}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, transitionEnd: {} }
            }
            transition={exit}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export type MiniTetrisProps = {
  /** `"lg"` = 1.5× cells; `"xl"` = ~2.25× cells (enlarged 404 layout). */
  size?: "default" | "lg" | "xl"
  /** Fired whenever the game score changes. Used by the 404 page rotation
   * shell to display a single unified score line outside the game canvas. */
  onScoreChange?: (score: number) => void
  /** Fired when the game-over state flips. */
  onGameOverChange?: (gameOver: boolean) => void
}

export default function MiniTetris({
  size = "default",
  onScoreChange,
  onGameOverChange,
}: MiniTetrisProps) {
  const s = TETRIS_SIZES[size]
  const gridContainerRef = useRef<HTMLDivElement | null>(null)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    // Initial state: ignore reduce-motion here; we'll re-init in an effect
    // once the media query has been read on the client.
    () => createInitialState({ best: readBest(), phase: "intro" })
  )

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduceMotion(mq.matches)
    const h = () => setReduceMotion(mq.matches)
    mq.addEventListener("change", h)
    return () => mq.removeEventListener("change", h)
  }, [])

  /** Skip intro under reduce-motion the moment we know it's active. */
  useEffect(() => {
    if (reduceMotion && state.phase === "intro") {
      dispatch({ type: "startPlaying" })
    }
  }, [reduceMotion, state.phase])

  /** Auto-flip phase intro → playing after INTRO_DURATION_MS. RAF-style is
   * overkill for a one-shot timer; a setTimeout is enough. */
  useEffect(() => {
    if (state.phase !== "intro") return
    const id = window.setTimeout(
      () => dispatch({ type: "startPlaying" }),
      INTRO_DURATION_MS
    )
    return () => window.clearTimeout(id)
  }, [state.phase])

  /** Persist best score whenever the game ends. */
  useEffect(() => {
    if (state.phase === "over") {
      writeBest(state.best)
    }
  }, [state.phase, state.best])

  /** Emit score / game-over changes to the parent. Both refs are stable
   * across renders so the effects only refire on the underlying state value. */
  const onScoreChangeRef = useRef(onScoreChange)
  onScoreChangeRef.current = onScoreChange
  const onGameOverChangeRef = useRef(onGameOverChange)
  onGameOverChangeRef.current = onGameOverChange
  useEffect(() => {
    onScoreChangeRef.current?.(state.score)
  }, [state.score])
  useEffect(() => {
    onGameOverChangeRef.current?.(state.phase === "over")
  }, [state.phase])

  const dropMs = useMemo(
    () => dropMsForLevel(state.level, reduceMotion),
    [state.level, reduceMotion]
  )

  useEffect(() => {
    if (state.phase !== "playing") return
    const id = window.setInterval(() => {
      dispatch({ type: "tick" })
    }, dropMs)
    return () => window.clearInterval(id)
  }, [dropMs, state.phase])

  const tryMove = useCallback((dx: number, dy: number) => {
    dispatch({ type: "move", dx, dy })
  }, [])

  const tryRotate = useCallback(() => {
    dispatch({ type: "rotate" })
  }, [])

  const hardDrop = useCallback(() => {
    dispatch({ type: "hardDrop" })
  }, [])

  const restart = useCallback(() => {
    dispatch({
      type: "restart",
      phase: reduceMotion ? "playing" : "intro",
    })
  }, [reduceMotion])

  const skipIntro = useCallback(() => {
    dispatch({ type: "startPlaying" })
  }, [])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // When game-over, the "Play again" button has focus and handles Enter
      // directly. We don't want the wrapper's handler also dispatching, so
      // bail early on everything except restart triggers (the button does its
      // own onClick).
      if (state.phase === "over") {
        return
      }
      // During the intro, any input skips to playing immediately. The first
      // press doesn't dispatch a game action — it just unlocks the game.
      if (state.phase === "intro") {
        if (
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight" ||
          e.key === "ArrowDown" ||
          e.key === "ArrowUp" ||
          e.key === " " ||
          e.key === "Enter" ||
          e.key === "x" ||
          e.key === "X"
        ) {
          e.preventDefault()
          skipIntro()
        }
        return
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        tryMove(-1, 0)
        return
      }
      if (e.key === "ArrowRight") {
        e.preventDefault()
        tryMove(1, 0)
        return
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        tryMove(0, 1)
        return
      }
      if (e.key === "ArrowUp" || e.key === "x" || e.key === "X") {
        e.preventDefault()
        tryRotate()
        return
      }
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault()
        hardDrop()
      }
    },
    [hardDrop, skipIntro, state.phase, tryMove, tryRotate]
  )

  /** DOM display: locked board only. The active piece is rendered on the particle
   * overlay canvas instead, where its position is smoothly interpolated between
   * drop ticks instead of snapping to integer cells each frame. */
  const display = useMemo((): (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7)[][] => {
    return state.board.map((row) => [...row]) as (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7)[][]
  }, [state.board])

  /** Display *with* active piece — used only by the overlay for active-cell detection
   * (it computes activeCells = displayWithActive − board). */
  const displayWithActive = useMemo((): (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7)[][] => {
    const out = state.board.map((row) => [...row]) as (0 | 1 | 2 | 3 | 4 | 5 | 6 | 7)[][]
    if (state.active && state.phase === "playing") {
      const m = getShapeM(state.active.t, state.active.r)
      const { x, y, t } = state.active
      for (let row = 0; row < GRID; row++) {
        for (let col = 0; col < GRID; col++) {
          if (m[row]![col]! !== 1) {
            continue
          }
          const by = y + row
          const bx = x + col
          if (by >= 0 && by < BOARD_H && bx >= 0 && bx < BOARD_W) {
            out[by]![bx] = (t + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7
          }
        }
      }
    }
    return out
  }, [state.active, state.board, state.phase])

  /** Ghost piece cells — null while game-over, intro, or when the active is
   * already at its landing position. */
  const ghostCells = useMemo(() => {
    if (state.phase !== "playing") return null
    const g = getGhost(state.board, state.active)
    return getGhostCells(g)
  }, [state.active, state.board, state.phase])

  const nextMat = getShapeM(state.next, 0)

  const wrapPad =
    size === "xl"
      ? "p-8 small:p-10 max-w-6xl"
      : size === "lg"
      ? "p-6 small:p-8 max-w-5xl"
      : "p-4 small:p-5 max-w-2xl"
  const colGap =
    size === "xl" ? "gap-12" : size === "lg" ? "gap-9" : "gap-6"
  const sideMinW =
    size === "xl"
      ? "min-w-[18rem]"
      : size === "lg"
      ? "min-w-[15rem]"
      : "min-w-[10rem]"

  const scoreFontSize =
    size === "xl" ? "2.75rem" : size === "lg" ? "2.25rem" : "1.625rem"
  const linesFontSize =
    size === "xl" ? "2.25rem" : size === "lg" ? "1.75rem" : "1.25rem"
  const levelFontSize =
    size === "xl" ? "1.6rem" : size === "lg" ? "1.35rem" : "1rem"

  const playAgainRef = useRef<HTMLButtonElement | null>(null)
  // Auto-focus the Play Again button when the overlay mounts so Enter restarts.
  useEffect(() => {
    if (state.phase === "over") {
      // Defer to next tick so the button has actually rendered.
      const id = window.setTimeout(() => playAgainRef.current?.focus(), 50)
      return () => window.clearTimeout(id)
    }
  }, [state.phase])

  const isBestRun = state.score > 0 && state.score >= state.best

  return (
    <div className={`text-white ${wrapPad}`}>
      <div
        className={`flex flex-col small:flex-row ${colGap} small:items-start`}
      >
        <div
          className="inline-block outline-none"
          onKeyDown={onKeyDown}
          role="application"
          aria-label="Mini Tetris. Focus this area to use the keyboard."
          tabIndex={0}
        >
          <p className="text-[11px] text-white/40 mb-3 tracking-wide">
            Click the board · arrows move / soft drop · ↑ or X = rotate · space = hard drop
            {reduceMotion ? " · reduced motion" : ""}
          </p>
          <div
            className="relative inline-block rounded-md"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.06), 0 0 32px 4px rgba(120,180,255,0.10), 0 0 80px 12px rgba(120,180,255,0.06)",
            }}
          >
            <div
              ref={gridContainerRef}
              className="grid gap-0 rounded-md bg-black inline-grid overflow-hidden"
              style={{
                gridTemplateColumns: `repeat(${BOARD_W}, minmax(0, 1fr))`,
              }}
              aria-hidden
            >
              {/** All cells render as transparent placeholders — filled cells are
               * drawn on the canvas overlay as glowing radial blobs. */}
              {display.map((row, ri) =>
                row.map((_cell, ci) => (
                  <div className={s.cellEmpty} key={`${ri}-${ci}`} />
                ))
              )}
            </div>
            <TetrisParticleOverlay
              containerRef={gridContainerRef}
              display={displayWithActive}
              board={state.board}
              active={state.active}
              lines={state.lines}
              gameOver={state.phase === "over"}
              ghostCells={ghostCells}
              phase={state.phase}
              level={state.level}
              lastClearKind={state.lastClearKind}
              lastClearAt={state.lastClearAt}
            />

            {/** Line-clear celebration label + combo. */}
            <ClearLabel
              kind={state.lastClearKind}
              at={state.lastClearAt}
              combo={state.comboCount}
              reduceMotion={reduceMotion}
            />

            {/** Intro overlay. */}
            <AnimatePresence>
              {state.phase === "intro" && !reduceMotion ? (
                <IntroOverlay key="intro" />
              ) : null}
            </AnimatePresence>

            {/** Game-over overlay. */}
            <AnimatePresence>
              {state.phase === "over" ? (
                <GameOverOverlay
                  key="over"
                  score={state.score}
                  lines={state.lines}
                  best={state.best}
                  isBestRun={isBestRun}
                  reduceMotion={reduceMotion}
                  onRestart={restart}
                  playAgainRef={playAgainRef}
                />
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <div
          className={`flex flex-col gap-5 ${sideMinW} text-sm text-white`}
        >
          <div>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
              Score
            </p>
            <p
              className="font-bold tabular-nums tracking-tight"
              style={{
                fontSize: scoreFontSize,
                lineHeight: 1.05,
              }}
            >
              <AnimatedNumber
                value={state.score}
                duration={650}
                reduceMotion={reduceMotion}
              />
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
              Lines
            </p>
            <p
              className="font-bold tabular-nums tracking-tight"
              style={{
                fontSize: linesFontSize,
                lineHeight: 1.05,
              }}
            >
              <AnimatedNumber
                value={state.lines}
                duration={500}
                reduceMotion={reduceMotion}
              />
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
              Level
            </p>
            <p
              className="font-bold tabular-nums tracking-tight"
              style={{
                fontSize: levelFontSize,
                lineHeight: 1.05,
              }}
            >
              <AnimatedNumber
                value={state.level}
                duration={600}
                reduceMotion={reduceMotion}
              />
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-white/40 mb-2 uppercase tracking-[0.2em]">
              Next
            </p>
            <motion.div
              className="inline-block"
              animate={
                reduceMotion ? undefined : { y: [0, -2, 0] }
              }
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }
            >
              <div
                className="grid gap-px p-2 rounded-md bg-black/60 inline-block"
                style={{
                  gridTemplateColumns: "repeat(4, 1fr)",
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.04), 0 0 16px 2px rgba(120,180,255,0.08)",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`next-${state.next}`}
                    initial={
                      reduceMotion
                        ? { opacity: 1 }
                        : { opacity: 0, scale: 0.88, y: -6 }
                    }
                    animate={
                      reduceMotion
                        ? { opacity: 1 }
                        : { opacity: 1, scale: 1, y: 0 }
                    }
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.95, y: 4 }
                    }
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.38, ease: [0.22, 1, 0.36, 1] }
                    }
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "1px",
                    }}
                  >
                    {nextMat.map((row, ri) =>
                      row.map((cell, ci) => (
                        <div
                          className={s.next}
                          key={`n-${ri}-${ci}`}
                          style={
                            cell === 1
                              ? {
                                  background:
                                    PIECE_FILL[state.next] ?? "var(--brand-primary)",
                                }
                              : undefined
                          }
                        />
                      ))
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
          <button
            type="button"
            onClick={restart}
            className="w-fit mt-1 rounded-md border border-white/25 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-1 focus:ring-offset-ui-fg-base"
          >
            {state.phase === "over" ? "Play again" : "Restart"}
          </button>
        </div>
      </div>
    </div>
  )
}

/** ---------- IntroOverlay: the soft READY / GO sequence over the canvas. */
function IntroOverlay() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,0,0,0.35) 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.92 }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: [12, 0, 0, -8],
          scale: [0.92, 1, 1, 1.04],
        }}
        transition={{
          duration: 0.9,
          times: [0, 0.25, 0.7, 1],
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          fontSize: "3.2rem",
          fontWeight: 800,
          color: "rgba(255,255,255,0.92)",
          letterSpacing: "0.32em",
          textShadow:
            "0 0 32px rgba(120,180,255,0.55), 0 0 80px rgba(120,180,255,0.25)",
        }}
      >
        READY
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{
          opacity: [0, 0, 1, 0],
          scale: [0.85, 0.85, 1.1, 1.3],
        }}
        transition={{
          duration: 1.4,
          times: [0, 0.55, 0.7, 1],
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          marginTop: "0.6rem",
          fontSize: "2.4rem",
          fontWeight: 800,
          color: "var(--brand-accent)",
          letterSpacing: "0.32em",
          textShadow:
            "0 0 28px rgba(120,180,255,0.6), 0 0 70px rgba(120,180,255,0.3)",
        }}
      >
        GO
      </motion.div>
    </motion.div>
  )
}

/** ---------- GameOverOverlay: the slow cinematic finale. */
function GameOverOverlay({
  score,
  lines,
  best,
  isBestRun,
  reduceMotion,
  onRestart,
  playAgainRef,
}: {
  score: number
  lines: number
  best: number
  isBestRun: boolean
  reduceMotion: boolean
  onRestart: () => void
  playAgainRef: React.RefObject<HTMLButtonElement | null>
}) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={
        reduceMotion
          ? { duration: 0.25 }
          : { duration: 1.2, ease: "easeOut" }
      }
      style={{
        background: "rgba(0,0,0,0.62)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <motion.div
        className="flex flex-col items-center"
        initial={
          reduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 14, scale: 0.96 }
        }
        animate={
          reduceMotion
            ? { opacity: 1 }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={
          reduceMotion
            ? { duration: 0.2 }
            : { duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }
        }
      >
        <div
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "rgba(255,255,255,0.92)",
            letterSpacing: "0.22em",
            textShadow:
              "0 0 24px rgba(120,180,255,0.45), 0 0 60px rgba(120,180,255,0.2)",
          }}
        >
          GAME OVER
        </div>
        <GameOverStats
          label="Score"
          value={score}
          delaySec={reduceMotion ? 0 : 0.5}
          color={isBestRun ? "#f5d985" : "white"}
          reduceMotion={reduceMotion}
        />
        <GameOverStats
          label="Lines"
          value={lines}
          delaySec={reduceMotion ? 0 : 0.62}
          color="white"
          reduceMotion={reduceMotion}
        />
        <GameOverStats
          label="Best"
          value={best}
          delaySec={reduceMotion ? 0 : 0.74}
          color={isBestRun ? "#f5d985" : "white"}
          reduceMotion={reduceMotion}
        />
        <motion.button
          ref={playAgainRef}
          type="button"
          onClick={onRestart}
          initial={
            reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }
          }
          animate={
            reduceMotion
              ? { opacity: 1 }
              : {
                  opacity: 1,
                  y: 0,
                  scale: [1, 1.035, 1],
                }
          }
          transition={
            reduceMotion
              ? { duration: 0.2 }
              : {
                  opacity: { duration: 0.5, delay: 0.95 },
                  y: { duration: 0.5, delay: 0.95 },
                  scale: {
                    duration: 2.4,
                    delay: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
          }
          className="mt-6 rounded-md border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-1 focus:ring-offset-black"
        >
          Play again
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

function GameOverStats({
  label,
  value,
  delaySec,
  color,
  reduceMotion,
}: {
  label: string
  value: number
  delaySec: number
  color: string
  reduceMotion: boolean
}) {
  return (
    <motion.div
      className="mt-5 flex items-baseline gap-3"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0.2 }
          : { duration: 0.55, delay: delaySec, ease: [0.22, 1, 0.36, 1] }
      }
    >
      <span
        className="text-[10px] font-semibold text-white/50 uppercase tracking-[0.2em]"
        style={{ minWidth: "3.5rem", textAlign: "right" }}
      >
        {label}
      </span>
      <span
        className="font-bold tabular-nums"
        style={{
          fontSize: "1.85rem",
          color,
          lineHeight: 1.05,
        }}
      >
        <AnimatedNumber
          value={value}
          duration={900}
          reduceMotion={reduceMotion}
        />
      </span>
    </motion.div>
  )
}
