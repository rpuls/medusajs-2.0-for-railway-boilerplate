"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react"

import TetrisParticleOverlay from "./tetris-particle-overlay"

const BOARD_W = 10
const BOARD_H = 20
const PIECE_TYPES = 7
const GRID = 4

const LINE_BONUS = [0, 100, 300, 500, 800] as const

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

type GameState = {
  board: Board
  active: Active | null
  next: number
  lines: number
  score: number
  gameOver: boolean
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

function createInitialState(_?: undefined): GameState {
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
    gameOver: !active,
  }
}

type Action =
  | { type: "tick" }
  | { type: "move"; dx: number; dy: number }
  | { type: "rotate" }
  | { type: "hardDrop" }
  | { type: "restart" }

function gameReducer(state: GameState, action: Action): GameState {
  if (action.type === "restart") {
    return createInitialState()
  }
  if (state.gameOver || !state.active) {
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
    const c = clearFullRows(b)
    const nextT = state.next
    const newNext = randomPieceType()
    const na = trySpawn(b, nextT)
    return {
      ...state,
      board: b,
      active: na,
      next: newNext,
      lines: state.lines + c,
      score: state.score + (LINE_BONUS[c] ?? 0),
      gameOver: !na,
    }
  }

  if (action.type === "tick") {
    if (collides(state.board, a.t, a.r, a.x, a.y + 1)) {
      const b = state.board.map((row) => [...row])
      lockPiece(b, a.t, a.r, a.x, a.y)
      const c = clearFullRows(b)
      const nextT = state.next
      const newNext = randomPieceType()
      const na = trySpawn(b, nextT)
      return {
        ...state,
        board: b,
        active: na,
        next: newNext,
        lines: state.lines + c,
        score: state.score + (LINE_BONUS[c] ?? 0),
        gameOver: !na,
      }
    }
    return { ...state, active: { ...a, y: a.y + 1 } }
  }
  return state
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

export type MiniTetrisProps = {
  /** `"lg"` = 1.5× cells; `"xl"` = ~2.25× cells (enlarged 404 layout). */
  size?: "default" | "lg" | "xl"
}

export default function MiniTetris({ size = "default" }: MiniTetrisProps) {
  const s = TETRIS_SIZES[size]
  const gridContainerRef = useRef<HTMLDivElement | null>(null)
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialState
  )
  const [reduceMotion, setReduceMotion] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduceMotion(mq.matches)
    const h = () => setReduceMotion(mq.matches)
    mq.addEventListener("change", h)
    return () => mq.removeEventListener("change", h)
  }, [])

  const dropMs = useMemo(
    () => (reduceMotion ? 1100 : 700),
    [reduceMotion]
  )

  useEffect(() => {
    if (state.gameOver) {
      return
    }
    const id = window.setInterval(() => {
      dispatch({ type: "tick" })
    }, dropMs)
    return () => window.clearInterval(id)
  }, [dropMs, state.gameOver])

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
    dispatch({ type: "restart" })
  }, [])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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
    [hardDrop, tryMove, tryRotate]
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
    if (state.active && !state.gameOver) {
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
  }, [state.active, state.board, state.gameOver])

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

  return (
    <div
      className={`text-white ${wrapPad}`}
    >
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
              gameOver={state.gameOver}
            />
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
                fontSize:
                  size === "xl"
                    ? "2.75rem"
                    : size === "lg"
                    ? "2.25rem"
                    : "1.625rem",
                lineHeight: 1.05,
                textShadow:
                  "0 0 12px rgba(120,180,255,0.45), 0 0 30px rgba(120,180,255,0.25)",
              }}
            >
              {state.score}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em]">
              Lines
            </p>
            <p
              className="font-bold tabular-nums tracking-tight"
              style={{
                fontSize:
                  size === "xl"
                    ? "2.25rem"
                    : size === "lg"
                    ? "1.75rem"
                    : "1.25rem",
                lineHeight: 1.05,
                textShadow:
                  "0 0 10px rgba(120,180,255,0.35), 0 0 24px rgba(120,180,255,0.18)",
              }}
            >
              {state.lines}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-white/40 mb-2 uppercase tracking-[0.2em]">
              Next
            </p>
            <div
              className="grid gap-px p-2 rounded-md bg-black/60 inline-block"
              style={{
                gridTemplateColumns: "repeat(4, 1fr)",
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.04), 0 0 16px 2px rgba(120,180,255,0.08)",
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
                            background: PIECE_FILL[state.next] ?? "var(--brand-primary)",
                          }
                        : undefined
                    }
                  />
                ))
              )}
            </div>
          </div>
          {state.gameOver ? (
            <p className="text-sm text-white font-medium" role="status">
              Game over
            </p>
          ) : null}
          <button
            type="button"
            onClick={restart}
            className="w-fit mt-1 rounded-md border border-white/25 bg-white/5 px-3 py-2 text-sm font-medium text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-1 focus:ring-offset-ui-fg-base"
          >
            {state.gameOver ? "Play again" : "Restart"}
          </button>
        </div>
      </div>
    </div>
  )
}
