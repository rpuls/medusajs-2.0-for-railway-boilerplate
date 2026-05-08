/**
 * Initial-state factory and a couple of pure helpers used by the tick logic.
 * The game state itself is mutated in-place by the tick (matching the
 * approach used in the Tetris particle overlay) — React only sees the
 * top-level state through a single `setState` call per frame for the score
 * line; the game canvas reads state directly via a ref.
 */

import {
  ALIEN_COLS,
  ALIEN_HSPACE,
  ALIEN_ROWS,
  ALIEN_VSPACE,
  ALIEN_WAVE_DROP,
  ALIEN_MAX_WAVE_DROPS,
  BARRIER_COUNT,
  LOGICAL_H,
  LOGICAL_W,
  PLAYER_Y,
  STARTING_LIVES,
  UFO_INTERVAL_MAX_FRAMES,
  UFO_INTERVAL_MIN_FRAMES,
} from "./constants"
import type {
  AlienGrid,
  BarriersState,
  FlinchGrid,
  GameState,
} from "./types"
import { ALIEN_TOTAL, BARRIER_CHUNK_TOTAL } from "./types"

/** Random integer in [a, b]. */
export const randInt = (a: number, b: number): number =>
  a + Math.floor(Math.random() * (b - a + 1))

/** Build a fresh formation grid (every alien alive). */
export function buildAliveFormation(): AlienGrid {
  const out: boolean[] = new Array(ALIEN_TOTAL)
  for (let i = 0; i < ALIEN_TOTAL; i++) out[i] = true
  return out
}

export function buildFlinchGrid(): FlinchGrid {
  return new Array(ALIEN_TOTAL).fill(0)
}

/** Build a fresh barrier chunk grid (every chunk intact). */
export function buildBarriers(): BarriersState {
  const out: boolean[][] = []
  for (let b = 0; b < BARRIER_COUNT; b++) {
    const grid: boolean[] = new Array(BARRIER_CHUNK_TOTAL)
    for (let i = 0; i < BARRIER_CHUNK_TOTAL; i++) grid[i] = true
    out.push(grid)
  }
  return out
}

/** Compute the formation-row's vertical start (top alien's centre y) for the
 * given wave. Each completed wave drops the start by ALIEN_WAVE_DROP, capped
 * so the formation can't spawn on top of the player. */
export function formationStartY(wave: number): number {
  const waveDrops = Math.min(ALIEN_MAX_WAVE_DROPS, wave - 1)
  return 50 + waveDrops * ALIEN_WAVE_DROP
}

/** Centre x of the alien at column c, row r within the formation. */
export function alienCx(state: GameState, c: number, r: number): number {
  return state.formationX + c * ALIEN_HSPACE
}
export function alienCy(state: GameState, c: number, r: number): number {
  return state.formationY + r * ALIEN_VSPACE
}

/** Compute the formation's leftmost / rightmost / lowest alive alien column
 * indices and bottom y. Used by the step logic to detect screen-edge bounce
 * and to detect game-over (aliens reaching player row). */
export function formationBounds(state: GameState): {
  minC: number
  maxC: number
  maxR: number
  aliveCount: number
} {
  let minC = ALIEN_COLS
  let maxC = -1
  let maxR = -1
  let aliveCount = 0
  for (let r = 0; r < ALIEN_ROWS; r++) {
    for (let c = 0; c < ALIEN_COLS; c++) {
      const idx = r * ALIEN_COLS + c
      if (!state.aliens[idx]) continue
      aliveCount++
      if (c < minC) minC = c
      if (c > maxC) maxC = c
      if (r > maxR) maxR = r
    }
  }
  return { minC, maxC, maxR, aliveCount }
}

/** Initial `GameState` for wave 1. Used both on first mount and on Restart. */
export function createInitialState(highScore = 0): GameState {
  const wave = 1
  return {
    wave,
    score: 0,
    highScore,
    lives: STARTING_LIVES,
    phase: { kind: "waveSpawn", nextWave: wave, framesLeft: 60 },

    playerX: LOGICAL_W / 2,
    playerVx: 0,
    invulnFrames: 60,
    fireCooldown: 0,

    aliens: buildAliveFormation(),
    flinch: buildFlinchGrid(),
    /** Formation horizontally centred for first wave. */
    formationX: (LOGICAL_W - (ALIEN_COLS - 1) * ALIEN_HSPACE) / 2,
    formationY: formationStartY(wave),
    formationDir: 1,
    stepCountdown: 30,
    stepParity: 0,

    bullets: [],
    ufo: null,
    ufoCountdown: randInt(UFO_INTERVAL_MIN_FRAMES, UFO_INTERVAL_MAX_FRAMES),

    barriers: buildBarriers(),

    shake: 0,
    deathWash: 0,

    waveCardTimer: 0,
    waveCardPhase: "idle",
    waveCardWave: wave,
  }
}

/** Reset the formation + barriers to start a new wave (NOT a full restart —
 * keeps score, lives, high score). */
export function resetForWave(state: GameState, wave: number): void {
  state.wave = wave
  state.aliens = buildAliveFormation()
  state.flinch = buildFlinchGrid()
  state.formationX = (LOGICAL_W - (ALIEN_COLS - 1) * ALIEN_HSPACE) / 2
  state.formationY = formationStartY(wave)
  state.formationDir = 1
  state.stepCountdown = 30
  state.stepParity = 0
  state.bullets = []
  state.ufo = null
  state.ufoCountdown = randInt(
    UFO_INTERVAL_MIN_FRAMES,
    UFO_INTERVAL_MAX_FRAMES
  )
  state.barriers = buildBarriers()
  state.invulnFrames = 60
  state.fireCooldown = 0
  /** Trigger the wave card. */
  state.waveCardWave = wave
  state.waveCardPhase = "in"
  state.waveCardTimer = 0
}
