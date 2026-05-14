"use client"

import React, { useEffect, useRef, useCallback } from "react"

// ─── Palette ────────────────────────────────────────────────────────────────
const BG = "#0B0C10"
const STAR_DIM = "#1F2833"
const STAR_BRIGHT = "#C5C6C7"
const COMET_HEAD = "#FFFFFF"
const COMET_TRAIL = "#45A29E"

// ─── Planet definitions ──────────────────────────────────────────────────────
type PlanetType = "terran" | "arid" | "gas" | "ice" | "lava" | "neon"

interface PlanetDef {
  baseSize: number
  scale: number
  primary: string
  secondary: string
  trailColor: string
  orbitRX: number
  orbitRY: number
  speed: number
  startAngle: number
  type: PlanetType
}

const PLANET_DEFS: PlanetDef[] = [
  // 1 — Innermost: Ice Moon, tiny & fastest
  { baseSize: 12, scale: 3, primary: "#C5C6C7", secondary: "#FFFFFF",
    trailColor: "#C5C6C7", orbitRX: 200, orbitRY: 75, speed: 0.00075,
    startAngle: 3.3, type: "ice" },
  // 2 — Arid/Mars
  { baseSize: 16, scale: 3, primary: "#D9534F", secondary: "#F0AD4E",
    trailColor: "#D9534F", orbitRX: 310, orbitRY: 115, speed: 0.00042,
    startAngle: 2.1, type: "arid" },
  // 3 — Lava
  { baseSize: 20, scale: 3, primary: "#8B1A1A", secondary: "#FF4500",
    trailColor: "#FF4500", orbitRX: 410, orbitRY: 150, speed: 0.00031,
    startAngle: 5.5, type: "lava" },
  // 4 — Terran/Earth
  { baseSize: 32, scale: 3, primary: "#45A29E", secondary: "#66FCF1",
    trailColor: "#45A29E", orbitRX: 510, orbitRY: 185, speed: 0.00021,
    startAngle: 0.5, type: "terran" },
  // 5 — Neon/Alien
  { baseSize: 24, scale: 3, primary: "#1A7A4A", secondary: "#39FF14",
    trailColor: "#39FF14", orbitRX: 590, orbitRY: 210, speed: 0.00016,
    startAngle: 1.2, type: "neon" },
  // 6 — Gas Giant with rings, largest & slowest
  { baseSize: 48, scale: 2.5, primary: "#6B5B95", secondary: "#FF7B25",
    trailColor: "#6B5B95", orbitRX: 680, orbitRY: 242, speed: 0.00011,
    startAngle: 4.0, type: "gas" },
]

// ─── Types ───────────────────────────────────────────────────────────────────
interface TrailParticle {
  x: number; y: number
  life: number; maxLife: number
  size: number
  color: string
}

interface Planet {
  def: PlanetDef
  angle: number
  sprite: HTMLCanvasElement
  trail: TrailParticle[]
  emitAccum: number
  prevX: number
  prevY: number
  initialized: boolean
}

interface Comet {
  x: number; y: number
  vx: number; vy: number
  active: boolean
  trailLen: number
}

interface LogoPixel { lx: number; ly: number }

interface SceneState {
  planets: Planet[]
  comets: Comet[]
  nextCometMs: number
  logoImg: HTMLImageElement | null
  logoW: number
  logoH: number
  logoPixels: LogoPixel[] | null
  logoCols: number
  logoRows: number
  logoPixelSize: number
}

// ─── Sprite generators ───────────────────────────────────────────────────────
function circleFill(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, inset = 0) {
  ctx.fillStyle = color
  const ri = r - inset
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const dx = x - cx + 0.5, dy = y - cy + 0.5
      if (dx * dx + dy * dy <= ri * ri) ctx.fillRect(x, y, 1, 1)
    }
  }
}

function drawTerranSprite(size: number, primary: string, secondary: string): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = size; c.height = size
  const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false
  const r = size / 2
  circleFill(ctx, r, r, r, primary)
  // Teal highlight band
  ctx.fillStyle = secondary
  const bY = Math.floor(size * 0.28), bH = Math.max(1, Math.floor(size * 0.13))
  for (let y = bY; y < bY + bH; y++)
    for (let x = 0; x < size; x++) {
      const dx = x - r + 0.5, dy = y - r + 0.5
      if (dx * dx + dy * dy <= (r - 1) * (r - 1)) ctx.fillRect(x, y, 1, 1)
    }
  circleFill(ctx, r, r, r, "rgba(0,0,0,0.42)", -Math.floor(r * 0.45))
  // Re-fill left half darkened for shadow
  ctx.fillStyle = "rgba(0,0,0,0.38)"
  for (let y = 0; y < size; y++)
    for (let x = Math.floor(r * 1.1); x < size; x++) {
      const dx = x - r + 0.5, dy = y - r + 0.5
      if (dx * dx + dy * dy <= r * r) ctx.fillRect(x, y, 1, 1)
    }
  return c
}

function drawAridSprite(size: number, primary: string, secondary: string): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = size; c.height = size
  const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false
  const r = size / 2
  circleFill(ctx, r, r, r, primary)
  const spots: [number, number, number][] = [
    [Math.floor(size * 0.3), Math.floor(size * 0.4), 2],
    [Math.floor(size * 0.6), Math.floor(size * 0.3), 1],
    [Math.floor(size * 0.45), Math.floor(size * 0.62), 2],
  ]
  for (const [sx, sy, sr] of spots)
    for (let dy = -sr; dy <= sr; dy++)
      for (let dx = -sr; dx <= sr; dx++)
        if (dx * dx + dy * dy <= sr * sr) {
          const px = sx + dx, py = sy + dy
          if (px >= 0 && px < size && py >= 0 && py < size) {
            ctx.fillStyle = secondary; ctx.fillRect(px, py, 1, 1)
          }
        }
  ctx.fillStyle = "rgba(0,0,0,0.4)"
  for (let y = 0; y < size; y++)
    for (let x = Math.floor(r * 1.15); x < size; x++) {
      const dx = x - r + 0.5, dy = y - r + 0.5
      if (dx * dx + dy * dy <= r * r) ctx.fillRect(x, y, 1, 1)
    }
  return c
}

function drawLavaSprite(size: number, primary: string, secondary: string): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = size; c.height = size
  const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false
  const r = size / 2
  circleFill(ctx, r, r, r, primary)
  // Lava crack lines in secondary color
  ctx.fillStyle = secondary
  const cracks: [number, number, number, number][] = [
    [Math.floor(r * 0.5), Math.floor(r * 0.4), Math.floor(r * 1.3), Math.floor(r * 0.9)],
    [Math.floor(r * 0.8), Math.floor(r * 1.1), Math.floor(r * 1.5), Math.floor(r * 1.6)],
    [Math.floor(r * 0.4), Math.floor(r * 1.3), Math.floor(r * 0.9), Math.floor(r * 1.8)],
  ]
  for (const [x1, y1, x2, y2] of cracks) {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1))
    for (let i = 0; i <= steps; i++) {
      const px = Math.round(x1 + (x2 - x1) * (i / steps))
      const py = Math.round(y1 + (y2 - y1) * (i / steps))
      const dx = px - r + 0.5, dy = py - r + 0.5
      if (dx * dx + dy * dy <= (r - 1) * (r - 1)) ctx.fillRect(px, py, 1, 1)
    }
  }
  ctx.fillStyle = "rgba(0,0,0,0.5)"
  for (let y = 0; y < size; y++)
    for (let x = Math.floor(r * 1.1); x < size; x++) {
      const dx = x - r + 0.5, dy = y - r + 0.5
      if (dx * dx + dy * dy <= r * r) ctx.fillRect(x, y, 1, 1)
    }
  return c
}

function drawNeonSprite(size: number, primary: string, secondary: string): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = size; c.height = size
  const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false
  const r = size / 2
  circleFill(ctx, r, r, r, primary)
  // Neon green glowing ring near edge
  ctx.fillStyle = secondary
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const dx = x - r + 0.5, dy = y - r + 0.5
      const d2 = dx * dx + dy * dy
      if (d2 <= r * r && d2 >= (r - 2.5) * (r - 2.5)) ctx.fillRect(x, y, 1, 1)
    }
  // Bright highlight dot top-left
  circleFill(ctx, Math.floor(r * 0.55), Math.floor(r * 0.45), Math.max(1, Math.floor(r * 0.28)), secondary)
  ctx.fillStyle = "rgba(0,0,0,0.45)"
  for (let y = 0; y < size; y++)
    for (let x = Math.floor(r * 1.1); x < size; x++) {
      const dx = x - r + 0.5, dy = y - r + 0.5
      if (dx * dx + dy * dy <= r * r) ctx.fillRect(x, y, 1, 1)
    }
  return c
}

function drawGasSprite(size: number, primary: string, secondary: string): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = size * 2; c.height = size
  const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false
  const cx = size, cy = size / 2, r = size / 2
  // Rings
  for (const [rx2, ry2, lw, color] of [
    [Math.floor(size * 0.88), Math.floor(size * 0.21), Math.max(1, Math.floor(size * 0.06)), secondary],
    [Math.floor(size * 0.76), Math.floor(size * 0.17), Math.max(1, Math.floor(size * 0.04)), primary],
  ] as [number, number, number, string][]) {
    ctx.strokeStyle = color; ctx.lineWidth = lw
    ctx.beginPath(); ctx.ellipse(cx, cy, rx2, ry2, 0, 0, Math.PI * 2); ctx.stroke()
  }
  circleFill(ctx, cx, cy, r, primary)
  // Horizontal bands
  for (const [bf, col] of [[0.22, secondary], [0.46, `${secondary}99`], [0.66, secondary], [0.81, `${secondary}77`]] as [number, string][]) {
    ctx.fillStyle = col
    const by = Math.floor(cy - r + size * bf), bh = Math.max(1, Math.floor(size * 0.07))
    for (let y = by; y < by + bh; y++)
      for (let x = cx - Math.floor(r); x <= cx + Math.floor(r); x++) {
        const dx = x - cx + 0.5, dy = y - cy + 0.5
        if (dx * dx + dy * dy <= (r - 1) * (r - 1)) ctx.fillRect(x, y, 1, 1)
      }
  }
  ctx.fillStyle = "rgba(0,0,0,0.4)"
  for (let y = 0; y < size; y++)
    for (let x = cx; x <= cx + Math.floor(r); x++) {
      const dx = x - cx + 0.5, dy = y - cy + 0.5
      if (dx * dx + dy * dy <= r * r) ctx.fillRect(x, y, 1, 1)
    }
  return c
}

function drawIceSprite(size: number, primary: string, secondary: string): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = size; c.height = size
  const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false
  const r = size / 2
  circleFill(ctx, r, r, r, primary)
  circleFill(ctx, Math.floor(r * 0.62), Math.floor(r * 0.52), Math.max(1, Math.floor(r * 0.38)), secondary)
  ctx.fillStyle = "rgba(0,0,0,0.32)"
  for (let y = 0; y < size; y++)
    for (let x = Math.floor(r * 1.05); x < size; x++) {
      const dx = x - r + 0.5, dy = y - r + 0.5
      if (dx * dx + dy * dy <= r * r) ctx.fillRect(x, y, 1, 1)
    }
  return c
}

function makeSprite(def: PlanetDef): HTMLCanvasElement {
  switch (def.type) {
    case "terran": return drawTerranSprite(def.baseSize, def.primary, def.secondary)
    case "arid":   return drawAridSprite(def.baseSize, def.primary, def.secondary)
    case "lava":   return drawLavaSprite(def.baseSize, def.primary, def.secondary)
    case "neon":   return drawNeonSprite(def.baseSize, def.primary, def.secondary)
    case "gas":    return drawGasSprite(def.baseSize, def.primary, def.secondary)
    case "ice":    return drawIceSprite(def.baseSize, def.primary, def.secondary)
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function randomBetween(a: number, b: number) { return a + Math.random() * (b - a) }

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function spawnComet(w: number, h: number): Comet {
  const fromRight = Math.random() > 0.5
  const speed = randomBetween(0.55, 0.85)
  const angle = randomBetween(0.3, 0.6)
  return {
    x: fromRight ? w + 40 : -40,
    y: randomBetween(-40, h * 0.4),
    vx: fromRight ? -Math.cos(angle) * speed : Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    active: true,
    trailLen: randomBetween(80, 140),
  }
}

// Sample logo image into pixel coordinates at a reduced resolution for chunky pixel-art look
function sampleLogoPixels(img: HTMLImageElement, targetCols: number): { pixels: LogoPixel[]; cols: number; rows: number } {
  const aspect = img.naturalHeight / img.naturalWidth
  const cols = targetCols
  const rows = Math.round(cols * aspect)
  const off = document.createElement("canvas")
  off.width = cols; off.height = rows
  const ctx = off.getContext("2d")!
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(img, 0, 0, cols, rows)
  const data = ctx.getImageData(0, 0, cols, rows).data
  const pixels: LogoPixel[] = []
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4
      if (data[i + 3] > 80) pixels.push({ lx: x, ly: y })
    }
  }
  return { pixels, cols, rows }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SpaceHero({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const starsCanvasRef = useRef<HTMLCanvasElement>(null)
  const sceneCanvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const stateRef = useRef<SceneState | null>(null)
  const pausedRef = useRef(false)

  const initScene = useCallback((): SceneState => {
    const planets: Planet[] = PLANET_DEFS.map(def => {
      // Compute an approximate starting position for prevX/prevY
      const px = Math.cos(def.startAngle) * def.orbitRX
      const py = Math.sin(def.startAngle) * def.orbitRY
      return { def, angle: def.startAngle, sprite: makeSprite(def), trail: [], emitAccum: 0, prevX: px, prevY: py, initialized: false }
    })
    const logoImg = new Image()
    logoImg.src = "/branding/sc-prints-logo-transparent.png"
    return { planets, comets: [], nextCometMs: randomBetween(3000, 7000), logoImg, logoW: 0, logoH: 0, logoPixels: null, logoCols: 0, logoRows: 0, logoPixelSize: 0 }
  }, [])

  const drawStars = useCallback((canvas: HTMLCanvasElement, w: number, h: number, dpr: number) => {
    canvas.width = w * dpr; canvas.height = h * dpr
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
    const ctx = canvas.getContext("2d")!
    ctx.scale(dpr, dpr)
    ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h)
    const count = Math.floor((w * h) / 2800)
    for (let i = 0; i < count; i++) {
      const bright = Math.random() < 0.2
      ctx.fillStyle = bright ? STAR_BRIGHT : STAR_DIM
      const sz = bright && Math.random() < 0.3 ? 2 : 1
      ctx.fillRect(Math.floor(Math.random() * w), Math.floor(Math.random() * h), sz, sz)
    }
  }, [])

  const getOrbitScale = (w: number) => w < 480 ? 0.35 : w < 768 ? 0.55 : 1.0
  const getVisibleCount = (w: number) => w < 480 ? 2 : w < 768 ? 4 : 6

  const runLoop = useCallback(() => {
    const starsCanvas = starsCanvasRef.current
    const sceneCanvas = sceneCanvasRef.current
    if (!starsCanvas || !sceneCanvas) return

    const dpr = window.devicePixelRatio || 1
    let w = starsCanvas.parentElement?.clientWidth ?? window.innerWidth
    let h = starsCanvas.parentElement?.clientHeight ?? window.innerHeight

    sceneCanvas.width = w * dpr; sceneCanvas.height = h * dpr
    sceneCanvas.style.width = `${w}px`; sceneCanvas.style.height = `${h}px`
    drawStars(starsCanvas, w, h, dpr)

    const state = stateRef.current!
    const ctx = sceneCanvas.getContext("2d")!
    ctx.scale(dpr, dpr)

    let lastTs = performance.now()
    let elapsed = 0

    // Logo sizing & pixel sampling
    const LOGO_SAMPLE_COLS = 72  // logical pixel columns at sample resolution
    const LOGO_DISPLAY_COLS = 64  // number of chunky pixels across display width

    const calcLogoSize = () => {
      if (!state.logoImg || state.logoImg.naturalWidth === 0) return
      // Display width: each pixel is ~4-5 screen px for chunky look
      const pixelSize = Math.round(Math.min(w * 0.006, 5.5))  // scales with viewport, min chunky
      state.logoPixelSize = Math.max(3, pixelSize)
      state.logoCols = LOGO_DISPLAY_COLS  // always 64 logical pixels wide
      state.logoW = state.logoCols * state.logoPixelSize
      const aspect = state.logoImg.naturalHeight / state.logoImg.naturalWidth
      state.logoRows = Math.round(state.logoCols * aspect)
      state.logoH = state.logoRows * state.logoPixelSize
    }

    const doSampleLogo = () => {
      if (!state.logoImg || state.logoImg.naturalWidth === 0) return
      const { pixels, cols, rows } = sampleLogoPixels(state.logoImg, LOGO_SAMPLE_COLS)
      // Scale from sample resolution to display resolution
      const scaleX = LOGO_DISPLAY_COLS / cols
      const scaleY = LOGO_DISPLAY_COLS / cols
      state.logoPixels = pixels.map(p => ({
        lx: Math.round(p.lx * scaleX),
        ly: Math.round(p.ly * scaleY),
      }))
      // Deduplicate
      const seen = new Set<string>()
      state.logoPixels = state.logoPixels.filter(p => {
        const k = `${p.lx},${p.ly}`
        if (seen.has(k)) return false
        seen.add(k); return true
      })
    }

    const initLogo = () => { calcLogoSize(); doSampleLogo() }

    if (state.logoImg && !state.logoImg.complete) {
      state.logoImg.onload = initLogo
    } else if (state.logoImg) {
      initLogo()
    }

    const tick = (ts: number) => {
      if (pausedRef.current) { rafRef.current = requestAnimationFrame(tick); return }

      const delta = Math.min(ts - lastTs, 50)
      lastTs = ts; elapsed += delta

      const newW = starsCanvas.parentElement?.clientWidth ?? window.innerWidth
      const newH = starsCanvas.parentElement?.clientHeight ?? window.innerHeight
      if (newW !== w || newH !== h) {
        w = newW; h = newH
        sceneCanvas.width = w * dpr; sceneCanvas.height = h * dpr
        sceneCanvas.style.width = `${w}px`; sceneCanvas.style.height = `${h}px`
        ctx.scale(dpr, dpr)
        drawStars(starsCanvas, w, h, dpr)
        calcLogoSize()
      }

      const cx = w / 2, cy = h / 2
      const orbitScale = getOrbitScale(w)
      const visibleCount = getVisibleCount(w)
      const floatY = Math.sin(elapsed * 0.0005) * 7

      ctx.clearRect(0, 0, w, h)

      // ── Comets ───────────────────────────────────────────────────────────────
      state.nextCometMs -= delta
      if (state.nextCometMs <= 0) {
        if (state.comets.filter(c => c.active).length < 2) state.comets.push(spawnComet(w, h))
        state.nextCometMs = randomBetween(5000, 12000)
      }
      for (const comet of state.comets) {
        if (!comet.active) continue
        comet.x += comet.vx * delta; comet.y += comet.vy * delta
        if (comet.x < -200 || comet.x > w + 200 || comet.y > h + 200) comet.active = false
      }
      while (state.comets.length > 6) state.comets.shift()

      for (const comet of state.comets) {
        if (!comet.active) continue
        const spd = Math.hypot(comet.vx, comet.vy)
        const tx = comet.x - (comet.vx / spd) * comet.trailLen
        const ty = comet.y - (comet.vy / spd) * comet.trailLen
        const grad = ctx.createLinearGradient(comet.x, comet.y, tx, ty)
        grad.addColorStop(0, COMET_HEAD); grad.addColorStop(0.15, COMET_TRAIL); grad.addColorStop(1, "rgba(69,162,158,0)")
        ctx.strokeStyle = grad; ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(comet.x, comet.y); ctx.lineTo(tx, ty); ctx.stroke()
        ctx.fillStyle = COMET_HEAD
        ctx.fillRect(Math.round(comet.x) - 1, Math.round(comet.y) - 1, 3, 3)
      }

      // ── Update planets & trailing-edge particles ─────────────────────────────
      for (const planet of state.planets.slice(0, visibleCount)) {
        planet.angle += planet.def.speed * delta

        const rx = planet.def.orbitRX * orbitScale
        const ry = planet.def.orbitRY * orbitScale
        const px = cx + Math.cos(planet.angle) * rx
        const py = cy + Math.sin(planet.angle) * ry

        const rendered = planet.def.baseSize * planet.def.scale
        const planetRadius = rendered / 2

        // Velocity direction (orbit tangent)
        let velX = px - planet.prevX
        let velY = py - planet.prevY
        const velLen = Math.hypot(velX, velY)

        if (!planet.initialized) {
          // Skip first frame — no valid velocity yet
          planet.prevX = px; planet.prevY = py; planet.initialized = true
        } else if (velLen > 0.001) {
          const vnX = velX / velLen  // normalized velocity (direction of travel)
          const vnY = velY / velLen
          // Perpendicular to velocity (for fan spread)
          const perpX = -vnY, perpY = vnX

          // Trailing origin = back edge of planet
          const originX = px - vnX * planetRadius * 0.8
          const originY = py - vnY * planetRadius * 0.8

          // Particle size scales with planet size
          const pSize = Math.max(3, Math.floor(planetRadius * 0.22))
          const maxTrail = 240
          const emitInterval = 14

          planet.emitAccum += delta
          while (planet.emitAccum >= emitInterval) {
            planet.emitAccum -= emitInterval
            // Spread laterally across back face of planet
            const spread = randomBetween(-planetRadius * 0.7, planetRadius * 0.7)
            // Small backward drift
            const drift = randomBetween(0, planetRadius * 0.3)
            const spawnX = originX + perpX * spread - vnX * drift + randomBetween(-1.5, 1.5)
            const spawnY = originY + perpY * spread - vnY * drift + randomBetween(-1.5, 1.5)
            const life = randomBetween(900, 2400)
            const p: TrailParticle = { x: spawnX, y: spawnY, life, maxLife: life, size: pSize, color: planet.def.trailColor }
            if (planet.trail.length < maxTrail) {
              planet.trail.push(p)
            } else {
              const old = planet.trail.shift()!; Object.assign(old, p); planet.trail.push(old)
            }
          }

          planet.prevX = px; planet.prevY = py
        }

        // Age out dead particles
        for (let i = planet.trail.length - 1; i >= 0; i--) {
          planet.trail[i].life -= delta
          if (planet.trail[i].life <= 0) planet.trail.splice(i, 1)
        }
      }

      // ── Sort by z for depth ordering ─────────────────────────────────────────
      const sorted = state.planets.slice(0, visibleCount).sort((a, b) => Math.sin(a.angle) - Math.sin(b.angle))

      // ── Draw trails (always on top of stars, below planets) ─────────────────
      for (const planet of state.planets.slice(0, visibleCount)) {
        const [r, g, b] = hexToRgb(planet.def.trailColor)
        for (const p of planet.trail) {
          const alpha = (p.life / p.maxLife) * 0.9
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
        }
      }

      // ── Draw planets behind logo ─────────────────────────────────────────────
      for (const planet of sorted) {
        if (Math.sin(planet.angle) >= 0) continue
        const rx = planet.def.orbitRX * orbitScale, ry = planet.def.orbitRY * orbitScale
        const px = cx + Math.cos(planet.angle) * rx, py = cy + Math.sin(planet.angle) * ry
        const rendered = planet.def.baseSize * planet.def.scale
        const isGas = planet.def.type === "gas"
        const drawW = isGas ? rendered * 2 : rendered, drawH = rendered
        const z = Math.sin(planet.angle)
        ctx.save()
        ctx.globalAlpha = 0.38 + 0.62 * ((z + 1) / 2)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(planet.sprite, Math.round(px - drawW / 2), Math.round(py - drawH / 2), drawW, drawH)
        ctx.restore()
      }

      // ── Draw pixel logo ──────────────────────────────────────────────────────
      if (state.logoPixels && state.logoPixels.length > 0 && state.logoPixelSize > 0) {
        const ps = state.logoPixelSize
        const offX = cx - (state.logoCols * ps) / 2
        const offY = cy + floatY - (state.logoRows * ps) / 2
        ctx.fillStyle = "#FFFFFF"
        for (const { lx, ly } of state.logoPixels) {
          ctx.fillRect(Math.round(offX + lx * ps), Math.round(offY + ly * ps), ps, ps)
        }
      } else if (state.logoImg && state.logoImg.complete && state.logoW > 0) {
        // Fallback: plain drawImage until pixels are sampled
        ctx.save()
        ctx.globalCompositeOperation = "screen"
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(state.logoImg, Math.round(cx - state.logoW / 2), Math.round(cy + floatY - state.logoH / 2), state.logoW, state.logoH)
        ctx.restore()
      }

      // ── Draw planets in front of logo ────────────────────────────────────────
      for (const planet of sorted) {
        if (Math.sin(planet.angle) < 0) continue
        const rx = planet.def.orbitRX * orbitScale, ry = planet.def.orbitRY * orbitScale
        const px = cx + Math.cos(planet.angle) * rx, py = cy + Math.sin(planet.angle) * ry
        const rendered = planet.def.baseSize * planet.def.scale
        const isGas = planet.def.type === "gas"
        const drawW = isGas ? rendered * 2 : rendered, drawH = rendered
        ctx.save()
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(planet.sprite, Math.round(px - drawW / 2), Math.round(py - drawH / 2), drawW, drawH)
        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [drawStars, initScene])

  useEffect(() => {
    const starsCanvas = starsCanvasRef.current
    const sceneCanvas = sceneCanvasRef.current
    if (!starsCanvas || !sceneCanvas) return

    stateRef.current = initScene()

    const observer = new IntersectionObserver(
      ([entry]) => { pausedRef.current = !entry.isIntersecting },
      { threshold: 0 }
    )
    observer.observe(starsCanvas)

    runLoop()

    return () => {
      cancelAnimationFrame(rafRef.current)
      observer.disconnect()
    }
  }, [initScene, runLoop])

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", minHeight: "600px", overflow: "hidden", background: BG, ...style }}
    >
      <canvas ref={starsCanvasRef} style={{ position: "absolute", inset: 0, display: "block" }} />
      <canvas ref={sceneCanvasRef} style={{ position: "absolute", inset: 0, display: "block" }} />
    </div>
  )
}
