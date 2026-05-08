/**
 * Per-frame state-update logic for Space Invaders. Pure mutation of the
 * passed `GameState`; emits semantic events to a sink for the particle
 * overlay to react to.
 *
 * Called from the component's RAF loop. The component owns input state
 * (`InputState`) and passes it in each frame.
 */

import {
  ALIEN_BULLET_CAP,
  ALIEN_BULLET_SPEED,
  ALIEN_COLS,
  ALIEN_FIRE_BASE_PROB,
  ALIEN_FIRE_WAVE_GAIN,
  ALIEN_HSPACE,
  ALIEN_POINTS,
  ALIEN_ROWS,
  ALIEN_STEP_FRAMES_FULL,
  ALIEN_STEP_FRAMES_MIN,
  ALIEN_STEP_X,
  ALIEN_DROP_Y,
  ALIEN_VSPACE,
  ALIEN_W,
  ALIEN_H,
  BARRIER_COUNT,
  BARRIER_CHUNK_SIZE,
  BARRIER_GRID_H,
  BARRIER_GRID_W,
  BARRIER_Y,
  BULLET_H,
  BULLET_TRAIL_LENGTH,
  BULLET_W,
  DEATH_WASH_FRAMES,
  FLINCH_FRAMES,
  LOGICAL_H,
  LOGICAL_W,
  PLAYER_BULLET_SPEED,
  PLAYER_FIRE_COOLDOWN_FRAMES,
  PLAYER_H,
  PLAYER_INVULN_FRAMES,
  PLAYER_SPEED,
  PLAYER_W,
  PLAYER_Y,
  UFO_H,
  UFO_INTERVAL_MAX_FRAMES,
  UFO_INTERVAL_MIN_FRAMES,
  UFO_POINTS_MAX,
  UFO_POINTS_MIN,
  UFO_SPEED,
  UFO_W,
  UFO_Y,
  WAVE_CARD_HOLD_FRAMES,
  WAVE_CARD_IN_FRAMES,
  WAVE_CARD_OUT_FRAMES,
} from "./constants"
import type { EventSink, GameEvent } from "./events"
import { formationBounds, randInt, resetForWave } from "./state"
import type { Bullet, GameState } from "./types"

/** Input snapshot passed in each frame. */
export type InputState = {
  left: boolean
  right: boolean
  fire: boolean
  /** Edge-triggered: true the frame after a "pause toggle" key is pressed. */
  pauseEdge: boolean
  /** Edge-triggered: true the frame after restart is requested. */
  restartEdge: boolean
}

/** Compute the formation step cadence. As aliens are killed, this scales
 * linearly down from FULL to MIN. Always at least 1 (clamps zero alive). */
function stepFramesForCount(aliveCount: number): number {
  const total = ALIEN_COLS * ALIEN_ROWS
  if (aliveCount <= 0) return ALIEN_STEP_FRAMES_MIN
  const t = 1 - aliveCount / total
  const frames =
    ALIEN_STEP_FRAMES_FULL -
    (ALIEN_STEP_FRAMES_FULL - ALIEN_STEP_FRAMES_MIN) * t
  return Math.max(ALIEN_STEP_FRAMES_MIN, Math.round(frames))
}

/** AABB overlap. */
function aabb(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number
): boolean {
  return (
    Math.abs(x1 - x2) * 2 < w1 + w2 && Math.abs(y1 - y2) * 2 < h1 + h2
  )
}

/** Erode barrier chunks intersecting the bullet AABB. Returns true if any
 * chunk was destroyed. */
function eraseBarrierChunks(
  state: GameState,
  bx: number,
  by: number,
  bw: number,
  bh: number
): boolean {
  let hit = false
  /** Compute barrier x-positions identical to the renderer's layout. */
  const barrierW = BARRIER_GRID_W * BARRIER_CHUNK_SIZE
  const spacing = LOGICAL_W / BARRIER_COUNT
  for (let bi = 0; bi < BARRIER_COUNT; bi++) {
    const bx0 = (bi + 0.5) * spacing - barrierW / 2
    const by0 = BARRIER_Y
    if (
      bx + bw / 2 < bx0 ||
      bx - bw / 2 > bx0 + barrierW ||
      by + bh / 2 < by0 ||
      by - bh / 2 > by0 + BARRIER_GRID_H * BARRIER_CHUNK_SIZE
    ) {
      continue
    }
    const grid = state.barriers[bi]!
    for (let r = 0; r < BARRIER_GRID_H; r++) {
      for (let c = 0; c < BARRIER_GRID_W; c++) {
        const idx = r * BARRIER_GRID_W + c
        if (!grid[idx]) continue
        const cx = bx0 + (c + 0.5) * BARRIER_CHUNK_SIZE
        const cy = by0 + (r + 0.5) * BARRIER_CHUNK_SIZE
        if (
          aabb(
            bx,
            by,
            bw,
            bh,
            cx,
            cy,
            BARRIER_CHUNK_SIZE,
            BARRIER_CHUNK_SIZE
          )
        ) {
          grid[idx] = false
          hit = true
        }
      }
    }
  }
  return hit
}

/** Spawn a bullet with the trail buffer initialised. */
function spawnBullet(
  state: GameState,
  x: number,
  y: number,
  vy: number,
  fromPlayer: boolean
): void {
  const trail: Array<{ x: number; y: number }> = []
  for (let i = 0; i < BULLET_TRAIL_LENGTH; i++) trail.push({ x, y })
  state.bullets.push({ x, y, vy, fromPlayer, trail })
}

/** Choose a random alive alien in the bottom row of each column (the only
 * aliens that have a clear line-of-fire to the player). Returns null if the
 * formation is empty. */
function pickAlienToFire(state: GameState): { c: number; r: number } | null {
  const candidates: Array<{ c: number; r: number }> = []
  for (let c = 0; c < ALIEN_COLS; c++) {
    for (let r = ALIEN_ROWS - 1; r >= 0; r--) {
      if (state.aliens[r * ALIEN_COLS + c]) {
        candidates.push({ c, r })
        break
      }
    }
  }
  if (candidates.length === 0) return null
  return candidates[Math.floor(Math.random() * candidates.length)]!
}

/** Step the formation: try to advance horizontally; if any extreme alien
 * would clip the wall, drop one row and reverse direction instead. */
function stepFormation(state: GameState, sink: EventSink): void {
  const { minC, maxC, maxR, aliveCount } = formationBounds(state)
  if (aliveCount === 0) return
  const dx = state.formationDir * ALIEN_STEP_X
  const newLeftAlienCx = state.formationX + minC * ALIEN_HSPACE + dx
  const newRightAlienCx = state.formationX + maxC * ALIEN_HSPACE + dx
  const margin = ALIEN_W / 2 + 4
  const wantsBounce =
    newLeftAlienCx < margin || newRightAlienCx > LOGICAL_W - margin
  if (wantsBounce) {
    state.formationY += ALIEN_DROP_Y
    state.formationDir *= -1
  } else {
    state.formationX += dx
  }
  state.stepParity = state.stepParity === 0 ? 1 : 0
  /** Reset stepCountdown for the new cadence (faster as fewer aliens remain). */
  state.stepCountdown = stepFramesForCount(aliveCount)
  /** Bottom-row arrival is checked at the end of `tick()` — not here. */
  void maxR
}

/** Trigger player death — spend a life, set invuln, deathWash. If lives
 * run out, transition to gameOver phase. */
function killPlayer(state: GameState, sink: EventSink): void {
  if (state.invulnFrames > 0 || state.phase.kind !== "playing") return
  sink({ kind: "playerHit", x: state.playerX, y: PLAYER_Y })
  state.lives -= 1
  state.shake = Math.max(state.shake, 6)
  state.deathWash = DEATH_WASH_FRAMES
  if (state.lives <= 0) {
    state.phase = { kind: "gameOver" }
    if (state.score > state.highScore) state.highScore = state.score
    sink({ kind: "gameOver" })
    return
  }
  /** Respawn with invuln + shimmer. */
  state.invulnFrames = PLAYER_INVULN_FRAMES
  state.playerX = LOGICAL_W / 2
  state.playerVx = 0
  /** Clear all alien bullets so respawn isn't unfair. */
  state.bullets = state.bullets.filter((b) => b.fromPlayer)
  sink({ kind: "playerRespawn", x: state.playerX, y: PLAYER_Y })
}

/** Award points + emit a score popup at (x, y). */
function awardPoints(
  state: GameState,
  sink: EventSink,
  x: number,
  y: number,
  points: number
): void {
  state.score += points
  if (state.score > state.highScore) state.highScore = state.score
  sink({ kind: "scorePopup", x, y, points })
}

/** Main per-frame update. Mutates state in place. */
export function tick(
  state: GameState,
  input: InputState,
  sink: EventSink
): void {
  /** -------- Pause + restart edges -------- */
  if (input.pauseEdge) {
    if (state.phase.kind === "playing") {
      state.phase = { kind: "paused" }
    } else if (state.phase.kind === "paused") {
      state.phase = { kind: "playing" }
    }
    /** waveSpawn / waveClear / gameOver ignore pause toggle. */
  }
  /** Restart on game-over only. */
  if (input.restartEdge && state.phase.kind === "gameOver") {
    /** Caller is responsible for swapping in a fresh state; flag is consumed
     * via the component's restartEdge handling, not here. */
  }

  if (state.phase.kind === "paused") {
    /** Frozen — only the wave card timer also pauses. */
    return
  }

  /** -------- Wave card timing (runs during all play phases) -------- */
  if (state.waveCardPhase !== "idle") {
    state.waveCardTimer += 1
    if (
      state.waveCardPhase === "in" &&
      state.waveCardTimer >= WAVE_CARD_IN_FRAMES
    ) {
      state.waveCardPhase = "hold"
      state.waveCardTimer = 0
    } else if (
      state.waveCardPhase === "hold" &&
      state.waveCardTimer >= WAVE_CARD_HOLD_FRAMES
    ) {
      state.waveCardPhase = "out"
      state.waveCardTimer = 0
    } else if (
      state.waveCardPhase === "out" &&
      state.waveCardTimer >= WAVE_CARD_OUT_FRAMES
    ) {
      state.waveCardPhase = "idle"
      state.waveCardTimer = 0
    }
  }

  /** -------- Wave-spawn animation -------- */
  if (state.phase.kind === "waveSpawn") {
    state.phase.framesLeft -= 1
    /** Fly-in: aliens visually slide in to formation positions; we don't
     * need state for that, the renderer interpolates from off-screen
     * starting positions based on framesLeft. */
    if (state.phase.framesLeft <= 0) {
      sink({ kind: "waveStart", wave: state.wave })
      state.phase = { kind: "playing" }
    }
    /** Skip gameplay updates during fly-in. */
    return
  }

  /** -------- Wave-clear celebration -------- */
  if (state.phase.kind === "waveClear") {
    state.phase.framesLeft -= 1
    if (state.phase.framesLeft <= 0) {
      const nextWave = state.phase.waveOver + 1
      resetForWave(state, nextWave)
      state.phase = { kind: "waveSpawn", nextWave, framesLeft: 80 }
    }
    return
  }

  if (state.phase.kind === "gameOver") {
    /** Decay shake but otherwise frozen. */
    state.shake *= 0.86
    if (state.deathWash > 0) state.deathWash -= 1
    return
  }

  /** ============ Active gameplay ============ */

  /** -------- Player movement + tilt -------- */
  let inputDir = 0
  if (input.left) inputDir -= 1
  if (input.right) inputDir += 1
  const targetVx = inputDir * PLAYER_SPEED
  state.playerVx = state.playerVx + (targetVx - state.playerVx) * 0.35
  state.playerX += state.playerVx
  /** Clamp to playfield. */
  const halfW = PLAYER_W / 2
  if (state.playerX < halfW) state.playerX = halfW
  if (state.playerX > LOGICAL_W - halfW) state.playerX = LOGICAL_W - halfW

  if (state.invulnFrames > 0) state.invulnFrames -= 1
  if (state.fireCooldown > 0) state.fireCooldown -= 1

  /** -------- Player firing -------- */
  if (input.fire && state.fireCooldown === 0) {
    spawnBullet(
      state,
      state.playerX,
      PLAYER_Y - PLAYER_H / 2,
      -PLAYER_BULLET_SPEED,
      true
    )
    state.fireCooldown = PLAYER_FIRE_COOLDOWN_FRAMES
    sink({ kind: "playerFire", x: state.playerX, y: PLAYER_Y - PLAYER_H / 2 })
    /** Tiny recoil bump. */
    state.playerVx -= 0.4 * Math.sign(state.playerVx || 1) * 0.2
  }

  /** -------- Formation step -------- */
  state.stepCountdown -= 1
  if (state.stepCountdown <= 0) {
    stepFormation(state, sink)
  }

  /** -------- Alien firing -------- */
  const alienBulletsAirborne = state.bullets.filter((b) => !b.fromPlayer).length
  if (alienBulletsAirborne < ALIEN_BULLET_CAP) {
    const fireProb =
      ALIEN_FIRE_BASE_PROB + ALIEN_FIRE_WAVE_GAIN * (state.wave - 1)
    if (Math.random() < fireProb) {
      const pick = pickAlienToFire(state)
      if (pick) {
        const cx = state.formationX + pick.c * ALIEN_HSPACE
        const cy = state.formationY + pick.r * ALIEN_VSPACE
        spawnBullet(state, cx, cy + ALIEN_H / 2, ALIEN_BULLET_SPEED, false)
        sink({ kind: "alienFire", x: cx, y: cy })
      }
    }
  }

  /** -------- UFO spawn / motion -------- */
  if (state.ufo == null) {
    state.ufoCountdown -= 1
    if (state.ufoCountdown <= 0) {
      const dir = Math.random() < 0.5 ? 1 : -1
      state.ufo = {
        x: dir === 1 ? -UFO_W : LOGICAL_W + UFO_W,
        y: UFO_Y,
        dir,
        phase: 0,
        points: randInt(UFO_POINTS_MIN, UFO_POINTS_MAX),
      }
      state.ufoCountdown = randInt(
        UFO_INTERVAL_MIN_FRAMES,
        UFO_INTERVAL_MAX_FRAMES
      )
    }
  } else {
    state.ufo.x += state.ufo.dir * UFO_SPEED
    state.ufo.phase += 1
    if (state.ufo.x < -UFO_W * 2 || state.ufo.x > LOGICAL_W + UFO_W * 2) {
      state.ufo = null
    }
  }

  /** -------- Bullets: integrate, collision -------- */
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const b = state.bullets[i]!
    /** Push current pos onto trail, drop oldest. */
    b.trail.unshift({ x: b.x, y: b.y })
    if (b.trail.length > BULLET_TRAIL_LENGTH) b.trail.length = BULLET_TRAIL_LENGTH
    b.y += b.vy
    if (b.y < -8 || b.y > LOGICAL_H + 8) {
      state.bullets.splice(i, 1)
      continue
    }
    /** Barrier collision (both directions). */
    if (
      b.y > BARRIER_Y - 8 &&
      b.y < BARRIER_Y + BARRIER_GRID_H * BARRIER_CHUNK_SIZE + 8
    ) {
      const hit = eraseBarrierChunks(state, b.x, b.y, BULLET_W, BULLET_H)
      if (hit) {
        sink({ kind: "barrierHit", x: b.x, y: b.y })
        state.bullets.splice(i, 1)
        continue
      }
    }
    /** Player bullet → alien collision. */
    if (b.fromPlayer) {
      let hitAlien = false
      for (let r = 0; r < ALIEN_ROWS && !hitAlien; r++) {
        for (let c = 0; c < ALIEN_COLS && !hitAlien; c++) {
          const idx = r * ALIEN_COLS + c
          if (!state.aliens[idx]) continue
          const ax = state.formationX + c * ALIEN_HSPACE
          const ay = state.formationY + r * ALIEN_VSPACE
          if (aabb(b.x, b.y, BULLET_W, BULLET_H, ax, ay, ALIEN_W, ALIEN_H)) {
            state.aliens[idx] = false
            hitAlien = true
            const points = ALIEN_POINTS[r] ?? 10
            awardPoints(state, sink, ax, ay, points)
            sink({
              kind: "alienKilled",
              col: c,
              row: r,
              x: ax,
              y: ay,
              points,
            })
            /** Adjacent flinch — immediate neighbours scale down briefly. */
            const neighbors = [
              [c - 1, r],
              [c + 1, r],
              [c, r - 1],
              [c, r + 1],
            ] as const
            for (const [nc, nr] of neighbors) {
              if (
                nc >= 0 &&
                nc < ALIEN_COLS &&
                nr >= 0 &&
                nr < ALIEN_ROWS
              ) {
                const nidx = nr * ALIEN_COLS + nc
                if (state.aliens[nidx]) {
                  state.flinch[nidx] = FLINCH_FRAMES
                }
              }
            }
            state.bullets.splice(i, 1)
            break
          }
        }
      }
      if (hitAlien) continue
      /** Player bullet → UFO. */
      if (state.ufo) {
        if (
          aabb(
            b.x,
            b.y,
            BULLET_W,
            BULLET_H,
            state.ufo.x,
            state.ufo.y,
            UFO_W,
            UFO_H
          )
        ) {
          const ufoPts = state.ufo.points
          awardPoints(state, sink, state.ufo.x, state.ufo.y, ufoPts)
          sink({
            kind: "ufoKilled",
            x: state.ufo.x,
            y: state.ufo.y,
            points: ufoPts,
          })
          state.shake = Math.max(state.shake, 5)
          state.ufo = null
          state.bullets.splice(i, 1)
          continue
        }
      }
    } else {
      /** Alien bullet → player. */
      if (
        state.invulnFrames === 0 &&
        aabb(b.x, b.y, BULLET_W, BULLET_H, state.playerX, PLAYER_Y, PLAYER_W, PLAYER_H)
      ) {
        state.bullets.splice(i, 1)
        killPlayer(state, sink)
        continue
      }
    }
  }

  /** -------- Flinch decay -------- */
  for (let i = 0; i < state.flinch.length; i++) {
    if (state.flinch[i]! > 0) state.flinch[i] = state.flinch[i]! - 1
  }

  /** -------- Shake decay + death wash -------- */
  state.shake *= 0.86
  if (state.shake < 0.05) state.shake = 0
  if (state.deathWash > 0) state.deathWash -= 1

  /** -------- Aliens reached the player row → game over -------- */
  {
    const { maxR, aliveCount } = formationBounds(state)
    if (aliveCount > 0) {
      const lowestY = state.formationY + maxR * ALIEN_VSPACE
      if (lowestY + ALIEN_H / 2 >= PLAYER_Y - PLAYER_H) {
        state.lives = 0
        state.phase = { kind: "gameOver" }
        state.shake = Math.max(state.shake, 8)
        sink({ kind: "gameOver" })
        return
      }
    }
  }

  /** -------- Wave cleared -------- */
  {
    const { aliveCount } = formationBounds(state)
    if (aliveCount === 0) {
      sink({ kind: "waveCleared", wave: state.wave })
      state.phase = {
        kind: "waveClear",
        waveOver: state.wave,
        framesLeft: 90,
      }
      return
    }
  }
}
