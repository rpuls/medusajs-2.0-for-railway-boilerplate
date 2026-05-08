/**
 * Type declarations for the Space Invaders game state. Kept separate from
 * constants and tick logic so reducer, renderer, and overlay can all import
 * the shape without pulling in implementation.
 */

import {
  ALIEN_COLS,
  ALIEN_ROWS,
  BARRIER_COUNT,
  BARRIER_GRID_H,
  BARRIER_GRID_W,
} from "./constants"

/** Per-alien presence (true = alive). Stored as a flat row-major array of
 * length ALIEN_COLS × ALIEN_ROWS so the formation step can scan O(n). */
export type AlienGrid = boolean[]
export const ALIEN_TOTAL = ALIEN_COLS * ALIEN_ROWS

/** Per-alien flinch counter: 0 = idle, >0 = flinching (decrements per frame).
 * Same flat row-major layout as AlienGrid. */
export type FlinchGrid = number[]

/** Per-barrier 2D chunk grid. true = chunk intact. Flat row-major within a
 * single barrier (BARRIER_GRID_W × BARRIER_GRID_H entries each). */
export type BarrierState = boolean[]
export const BARRIER_CHUNK_TOTAL = BARRIER_GRID_W * BARRIER_GRID_H
export type BarriersState = BarrierState[] // length = BARRIER_COUNT

export type Bullet = {
  x: number
  y: number
  vy: number
  /** True if this bullet was fired by the player; false if by an alien. */
  fromPlayer: boolean
  /** Recent positions for the trail render. Index 0 = newest. */
  trail: Array<{ x: number; y: number }>
}

export type UFO = {
  x: number
  y: number
  /** +1 = travelling right, -1 = travelling left. */
  dir: number
  /** Phase used for the wobble — increments each frame. */
  phase: number
  /** Points awarded if the player kills it (chosen randomly at spawn). */
  points: number
}

/** Discriminated union for the global game phase. */
export type GamePhase =
  | { kind: "playing" }
  | { kind: "waveClear"; waveOver: number; framesLeft: number }
  | { kind: "waveSpawn"; nextWave: number; framesLeft: number }
  | { kind: "paused" }
  | { kind: "gameOver" }

export type GameState = {
  /** Wave counter (1-indexed). */
  wave: number
  score: number
  highScore: number
  lives: number
  phase: GamePhase

  /** Player ship — x is centre. */
  playerX: number
  /** Per-frame x-velocity (smoothed) for tilt + thruster effects. */
  playerVx: number
  /** Frames of invulnerability remaining (>0 = invuln). */
  invulnFrames: number
  /** Cooldown counter for player firing. */
  fireCooldown: number

  /** Aliens: grid + presence + flinch state. */
  aliens: AlienGrid
  flinch: FlinchGrid
  /** Formation top-left in logical px (the top-left alien's centre). */
  formationX: number
  formationY: number
  /** +1 right, -1 left. */
  formationDir: number
  /** Frames until the next formation step. */
  stepCountdown: number
  /** Step parity (0/1) — drives the two-frame walk cycle. */
  stepParity: number

  /** Bullets in flight (player + alien). */
  bullets: Bullet[]
  /** Active UFO, if any. */
  ufo: UFO | null
  /** Frames until the next UFO can spawn. */
  ufoCountdown: number

  /** Barrier chunk states (one entry per barrier). */
  barriers: BarriersState

  /** Visual: screen shake amplitude (logical px) decaying per frame. */
  shake: number
  /** Death-wash counter — non-zero on the frames after the player dies. */
  deathWash: number

  /** Wave-card animation: tracks "WAVE n" title-card phase + counter. */
  waveCardTimer: number
  waveCardPhase: "in" | "hold" | "out" | "idle"
  waveCardWave: number
}
