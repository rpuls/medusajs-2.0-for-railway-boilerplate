/**
 * Particle system for Space Invaders. Reactive — consumes GameEvents from
 * the tick and spawns visual effects accordingly. Renders on top of the
 * main game canvas (same canvas, drawn after entities).
 *
 * Mirrors the polish bar of the Tetris overlay:
 *  - Thruster particles (player movement)
 *  - Muzzle flash (player fire)
 *  - Player explosion + drifting pieces + respawn shimmer
 *  - Alien explosion bursts with per-row colour
 *  - Adjacent flinch is rendered by the main renderer (state-driven), not here
 *  - Barrier debris chunks
 *  - UFO explosion (bigger burst + extra glow)
 *  - Score popups (floating "+10" "+50" etc.)
 *  - Confetti sweep on wave clear
 *  - Wave-spawn fly-in particles (small dust trail behind each alien sliding into formation)
 *
 * No velocity field for tetris-overlay-level fluid sim — that engine works
 * because the playfield is roomy and ambient particles are dense. Invaders
 * has constant entity churn, so a simpler per-particle ballistic system
 * with curl-noise micro-turbulence keeps it cheap and visually consistent.
 */

import { sampleCurlNoise } from "@modules/home/components/home-particle-logo-hero/curl-noise"
import {
  parseHexColor,
  WORDMARK_GRADIENT,
} from "@modules/common/lib/wordmark-gradient"

import {
  ALIEN_RGB,
  PLAYER_RGB,
  PLAYER_THRUSTER_RGB,
  SCORE_POPUP_RGB,
  UFO_RGB,
} from "./constants"
import type { GameEvent } from "./events"

/** Per-particle struct — keep small + numeric; this thing churns hot. */
type Particle = {
  alive: boolean
  x: number
  y: number
  vx: number
  vy: number
  age: number
  life: number
  /** Drawn as a `size × size` square. */
  size: number
  /** RGB packed into a single Uint32 (r << 16 | g << 8 | b) — saves three
   * lookups per particle in the render loop. */
  rgb: number
  /** Multiplier on global alpha (0..1). Used for fade-out. */
  alpha0: number
  /** When true, particle samples the curl-noise field for organic swirl —
   * used for explosions / dust. Linear ballistics for muzzle / confetti. */
  swirly: boolean
  /** Optional gravity for drifting debris. */
  gravity: number
}

/** Score popups float upward and fade — separate from generic particles
 * because they render text, not pixels. */
type ScorePopup = {
  alive: boolean
  x: number
  y: number
  vy: number
  age: number
  life: number
  text: string
}

const MAX_PARTICLES = 1200
const PARTICLE_CURL_AMPLITUDE = 0.4
const PARTICLE_CURL_SCALE = 0.02
const PARTICLE_CURL_HZ = 0.8

export class InvadersParticleSystem {
  private particles: Particle[] = []
  private popups: ScorePopup[] = []
  /** Reused per-particle scratch tuple for curl-noise samples. */
  private curlOut: [number, number] = [0, 0]
  /** Pre-parsed RGB triples from the wordmark gradient — shared with the
   * main hero so confetti uses the same palette. */
  private gradientRgb: Array<[number, number, number]>

  constructor() {
    this.gradientRgb = WORDMARK_GRADIENT.stops.map(parseHexColor)
  }

  /** Allocate a fresh particle, growing the pool until cap. Returns null if
   * the pool is full and no slot is dead — caller should drop the spawn. */
  private alloc(): Particle | null {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i]!
      if (!p.alive) return p
    }
    if (this.particles.length >= MAX_PARTICLES) return null
    const fresh: Particle = {
      alive: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      age: 0,
      life: 0,
      size: 1,
      rgb: 0xffffff,
      alpha0: 1,
      swirly: false,
      gravity: 0,
    }
    this.particles.push(fresh)
    return fresh
  }

  private allocPopup(): ScorePopup | null {
    for (let i = 0; i < this.popups.length; i++) {
      const p = this.popups[i]!
      if (!p.alive) return p
    }
    const fresh: ScorePopup = {
      alive: false,
      x: 0,
      y: 0,
      vy: 0,
      age: 0,
      life: 0,
      text: "",
    }
    this.popups.push(fresh)
    return fresh
  }

  /** Pack three 0–255 channel values into one Uint32 for storage. */
  private pack(r: number, g: number, b: number): number {
    return (r << 16) | (g << 8) | b
  }

  /** Generic burst — n particles in random directions from a centre. */
  private burst(
    cx: number,
    cy: number,
    n: number,
    speed: number,
    rgb: number,
    life: number,
    size: number
  ): void {
    for (let i = 0; i < n; i++) {
      const p = this.alloc()
      if (!p) return
      const ang = Math.random() * Math.PI * 2
      const sp = (0.4 + Math.random()) * speed
      p.alive = true
      p.x = cx
      p.y = cy
      p.vx = Math.cos(ang) * sp
      p.vy = Math.sin(ang) * sp
      p.age = 0
      p.life = life * (0.7 + 0.6 * Math.random())
      p.size = size
      p.rgb = rgb
      p.alpha0 = 1
      p.swirly = true
      p.gravity = 0
    }
  }

  /** Direct event consumer. Caller forwards every tick event here. */
  handleEvent(e: GameEvent): void {
    switch (e.kind) {
      case "playerFire": {
        /** Muzzle flash — 6 short-lived dots. */
        const rgb = this.pack(...PLAYER_RGB)
        for (let i = 0; i < 6; i++) {
          const p = this.alloc()
          if (!p) break
          const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.4
          const sp = 1.5 + Math.random() * 1.5
          p.alive = true
          p.x = e.x + (Math.random() - 0.5) * 4
          p.y = e.y
          p.vx = Math.cos(ang) * sp
          p.vy = Math.sin(ang) * sp
          p.age = 0
          p.life = 14 + Math.random() * 8
          p.size = 1.5
          p.rgb = rgb
          p.alpha0 = 0.9
          p.swirly = false
          p.gravity = 0
        }
        break
      }
      case "alienKilled": {
        const [r, g, b] = ALIEN_RGB[e.row] ?? [255, 255, 255]
        const rgb = this.pack(r, g, b)
        this.burst(e.x, e.y, 18, 2.4, rgb, 36, 1.5)
        /** Bright white flash core — 3 large, short-lived particles. */
        const whiteRgb = this.pack(255, 255, 255)
        for (let i = 0; i < 3; i++) {
          const p = this.alloc()
          if (!p) break
          p.alive = true
          p.x = e.x
          p.y = e.y
          p.vx = (Math.random() - 0.5) * 0.6
          p.vy = (Math.random() - 0.5) * 0.6
          p.age = 0
          p.life = 8
          p.size = 4
          p.rgb = whiteRgb
          p.alpha0 = 0.8
          p.swirly = false
          p.gravity = 0
        }
        break
      }
      case "ufoKilled": {
        const rgb = this.pack(...UFO_RGB)
        this.burst(e.x, e.y, 36, 3.2, rgb, 50, 2)
        /** Extra core flash. */
        const whiteRgb = this.pack(255, 255, 255)
        for (let i = 0; i < 8; i++) {
          const p = this.alloc()
          if (!p) break
          const ang = Math.random() * Math.PI * 2
          const sp = 0.5 + Math.random() * 1.5
          p.alive = true
          p.x = e.x
          p.y = e.y
          p.vx = Math.cos(ang) * sp
          p.vy = Math.sin(ang) * sp
          p.age = 0
          p.life = 14
          p.size = 3
          p.rgb = whiteRgb
          p.alpha0 = 0.95
          p.swirly = false
          p.gravity = 0
        }
        break
      }
      case "playerHit": {
        /** Bigger burst + drifting ship pieces (gravity-affected). */
        const rgb = this.pack(...PLAYER_RGB)
        this.burst(e.x, e.y, 24, 2.6, rgb, 50, 2)
        for (let i = 0; i < 8; i++) {
          const p = this.alloc()
          if (!p) break
          const ang = Math.random() * Math.PI * 2
          p.alive = true
          p.x = e.x + (Math.random() - 0.5) * 8
          p.y = e.y + (Math.random() - 0.5) * 8
          p.vx = Math.cos(ang) * (0.6 + Math.random() * 1.2)
          p.vy = Math.sin(ang) * (0.6 + Math.random() * 1.2) - 1
          p.age = 0
          p.life = 60 + Math.random() * 30
          p.size = 2.5
          p.rgb = rgb
          p.alpha0 = 0.85
          p.swirly = false
          p.gravity = 0.06
        }
        break
      }
      case "playerRespawn": {
        /** Shimmer ring — 14 particles ringing the spawn point. */
        const rgb = this.pack(255, 255, 255)
        for (let i = 0; i < 14; i++) {
          const p = this.alloc()
          if (!p) break
          const ang = (i / 14) * Math.PI * 2
          p.alive = true
          p.x = e.x + Math.cos(ang) * 2
          p.y = e.y + Math.sin(ang) * 2
          p.vx = Math.cos(ang) * 1.4
          p.vy = Math.sin(ang) * 1.4
          p.age = 0
          p.life = 24
          p.size = 1.5
          p.rgb = rgb
          p.alpha0 = 0.7
          p.swirly = false
          p.gravity = 0
        }
        break
      }
      case "barrierHit": {
        const rgb = this.pack(61, 207, 194) // brand teal — same as barrier colour
        for (let i = 0; i < 8; i++) {
          const p = this.alloc()
          if (!p) break
          const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI
          const sp = 0.8 + Math.random() * 1.6
          p.alive = true
          p.x = e.x + (Math.random() - 0.5) * 4
          p.y = e.y
          p.vx = Math.cos(ang) * sp
          p.vy = Math.sin(ang) * sp
          p.age = 0
          p.life = 28 + Math.random() * 20
          p.size = 2
          p.rgb = rgb
          p.alpha0 = 0.85
          p.swirly = false
          p.gravity = 0.08
        }
        break
      }
      case "alienFire": {
        /** Tiny down-puff — alien sneeze. */
        const rgb = this.pack(255, 94, 58)
        for (let i = 0; i < 3; i++) {
          const p = this.alloc()
          if (!p) break
          const ang = Math.PI / 2 + (Math.random() - 0.5) * 0.6
          const sp = 0.6 + Math.random() * 0.6
          p.alive = true
          p.x = e.x
          p.y = e.y
          p.vx = Math.cos(ang) * sp
          p.vy = Math.sin(ang) * sp
          p.age = 0
          p.life = 10
          p.size = 1.5
          p.rgb = rgb
          p.alpha0 = 0.7
          p.swirly = false
          p.gravity = 0
        }
        break
      }
      case "scorePopup": {
        const popup = this.allocPopup()
        if (!popup) break
        popup.alive = true
        popup.x = e.x
        popup.y = e.y
        popup.vy = -0.7
        popup.age = 0
        popup.life = 50
        popup.text = `+${e.points}`
        break
      }
      case "waveCleared": {
        /** Confetti sweep — wide horizontal band of brand-coloured
         * particles drifting downward. Uses the wordmark gradient palette. */
        const palette = this.gradientRgb
        for (let i = 0; i < 80; i++) {
          const p = this.alloc()
          if (!p) break
          const stop = palette[Math.floor(Math.random() * palette.length)]!
          const rgb = this.pack(stop[0], stop[1], stop[2])
          p.alive = true
          p.x = Math.random() * 320 // LOGICAL_W
          p.y = -10 + Math.random() * 30
          p.vx = (Math.random() - 0.5) * 1.4
          p.vy = 0.6 + Math.random() * 1.6
          p.age = 0
          p.life = 80 + Math.random() * 40
          p.size = 2
          p.rgb = rgb
          p.alpha0 = 0.85
          p.swirly = true
          p.gravity = 0.04
        }
        break
      }
      case "waveStart":
      case "gameOver":
        /** Visual handled elsewhere (renderer + screen shake from tick). */
        break
    }
  }

  /** Continuous emit — called each frame from the component when player is
   * moving, drives the thruster trail. */
  emitThruster(playerX: number, playerVx: number): void {
    const speed = Math.abs(playerVx)
    if (speed < 0.4) return
    /** Probability of emit scales with speed. */
    if (Math.random() > Math.min(1, speed / 2)) return
    const p = this.alloc()
    if (!p) return
    const rgb = this.pack(...PLAYER_THRUSTER_RGB)
    p.alive = true
    p.x = playerX + (Math.random() - 0.5) * 10
    p.y = 400 - 22 + 6 // PLAYER_Y + nudge below
    p.vx = -playerVx * 0.3 + (Math.random() - 0.5) * 0.4
    p.vy = 0.6 + Math.random() * 0.6
    p.age = 0
    p.life = 14 + Math.random() * 10
    p.size = 1.5
    p.rgb = rgb
    p.alpha0 = 0.85
    p.swirly = true
    p.gravity = 0
  }

  /** Continuous emit during waveSpawn — small dust trail behind aliens
   * sliding into their formation positions. Caller passes per-alien
   * coordinates (one entry per still-flying alien). */
  emitWaveSpawnDust(positions: Array<{ x: number; y: number }>): void {
    if (positions.length === 0) return
    /** Only emit on a fraction of frames to keep cost down. */
    if (Math.random() > 0.5) return
    const target = positions[Math.floor(Math.random() * positions.length)]!
    const p = this.alloc()
    if (!p) return
    const rgb = this.pack(255, 255, 255)
    p.alive = true
    p.x = target.x
    p.y = target.y
    p.vx = (Math.random() - 0.5) * 0.3
    p.vy = (Math.random() - 0.5) * 0.3
    p.age = 0
    p.life = 18
    p.size = 1
    p.rgb = rgb
    p.alpha0 = 0.5
    p.swirly = false
    p.gravity = 0
  }

  /** Per-frame integration. */
  step(now: number): void {
    const tSeconds = now / 1000
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i]!
      if (!p.alive) continue
      p.age += 1
      if (p.age >= p.life) {
        p.alive = false
        continue
      }
      if (p.swirly) {
        sampleCurlNoise(
          p.x,
          p.y,
          tSeconds,
          PARTICLE_CURL_SCALE,
          PARTICLE_CURL_AMPLITUDE,
          PARTICLE_CURL_HZ,
          this.curlOut
        )
        p.vx += this.curlOut[0] * 0.08
        p.vy += this.curlOut[1] * 0.08
      }
      p.vy += p.gravity
      p.vx *= 0.96
      p.vy *= 0.96
      p.x += p.vx
      p.y += p.vy
    }
    for (let i = 0; i < this.popups.length; i++) {
      const p = this.popups[i]!
      if (!p.alive) continue
      p.age += 1
      if (p.age >= p.life) {
        p.alive = false
        continue
      }
      p.vy *= 0.96
      p.y += p.vy
    }
  }

  /** Draw all alive particles + popups onto the canvas. */
  render(ctx: CanvasRenderingContext2D): void {
    /** Particles via direct fillRect with alpha = alpha0 * (1 - age/life). */
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i]!
      if (!p.alive) continue
      const a = p.alpha0 * (1 - p.age / p.life)
      const r = (p.rgb >> 16) & 0xff
      const g = (p.rgb >> 8) & 0xff
      const b = p.rgb & 0xff
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
    }
    /** Popups — bright magenta floating "+points". */
    ctx.font = "700 11px ui-sans-serif, system-ui, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    for (let i = 0; i < this.popups.length; i++) {
      const p = this.popups[i]!
      if (!p.alive) continue
      const a = 1 - p.age / p.life
      const [r, g, b] = SCORE_POPUP_RGB
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
      ctx.fillText(p.text, p.x, p.y)
    }
  }
}
