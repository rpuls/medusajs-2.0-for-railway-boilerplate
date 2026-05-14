"use client"

import React, { useEffect, useRef, useCallback } from "react"

// ─── Palette ────────────────────────────────────────────────────────────────
const BG = "#0B0C10"
const STAR_DIM = "#1F2833"
const STAR_BRIGHT = "#C5C6C7"
const COMET_HEAD = "#FFFFFF"
const COMET_TRAIL = "#45A29E"

// ─── Planet definitions ──────────────────────────────────────────────────────
interface PlanetDef {
  baseSize: number        // px before scale
  scale: number
  primary: string
  secondary: string
  trailColor: string
  orbitRX: number         // horizontal semi-axis (canvas px, desktop)
  orbitRY: number         // vertical semi-axis
  speed: number           // radians per ms
  startAngle: number
  type: "terran" | "arid" | "gas" | "ice"
}

const PLANET_DEFS: PlanetDef[] = [
  // Innermost — Ice Moon, tiny & fast
  {
    baseSize: 12, scale: 3, primary: "#C5C6C7", secondary: "#FFFFFF",
    trailColor: "#C5C6C7", orbitRX: 210, orbitRY: 80, speed: 0.00072,
    startAngle: 3.3, type: "ice",
  },
  // Second orbit — Arid/Mars, small & medium-fast
  {
    baseSize: 16, scale: 3, primary: "#D9534F", secondary: "#F0AD4E",
    trailColor: "#D9534F", orbitRX: 340, orbitRY: 125, speed: 0.00038,
    startAngle: 2.1, type: "arid",
  },
  // Third orbit — Terran/Earth, medium & medium-slow
  {
    baseSize: 32, scale: 3, primary: "#45A29E", secondary: "#66FCF1",
    trailColor: "#45A29E", orbitRX: 490, orbitRY: 178, speed: 0.00022,
    startAngle: 0.5, type: "terran",
  },
  // Outermost — Gas Giant with rings, large & slow
  {
    baseSize: 48, scale: 2.5, primary: "#6B5B95", secondary: "#FF7B25",
    trailColor: "#6B5B95", orbitRX: 640, orbitRY: 230, speed: 0.00013,
    startAngle: 4.0, type: "gas",
  },
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
  emitAccum: number       // ms accumulator for particle emission
}

interface Comet {
  x: number; y: number
  vx: number; vy: number
  active: boolean
  trailLen: number
}

interface SceneState {
  planets: Planet[]
  comets: Comet[]
  nextCometMs: number
  logoY: number           // current floating Y offset (px)
  logoImg: HTMLImageElement | null
  logoW: number
  logoH: number
}

// ─── Sprite generators ───────────────────────────────────────────────────────
function drawTerranSprite(size: number, primary: string, secondary: string): HTMLCanvasElement {
  const c = document.createElement("canvas")
  c.width = size; c.height = size
  const ctx = c.getContext("2d")!
  ctx.imageSmoothingEnabled = false

  // Base circle
  ctx.fillStyle = primary
  const r = Math.floor(size / 2)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - r + 0.5, dy = y - r + 0.5
      if (dx * dx + dy * dy <= r * r) ctx.fillRect(x, y, 1, 1)
    }
  }
  // Highlight band (secondary color horizontal stripe)
  ctx.fillStyle = secondary
  const bandY = Math.floor(size * 0.3)
  const bandH = Math.max(1, Math.floor(size * 0.12))
  for (let y = bandY; y < bandY + bandH; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - r + 0.5, dy = y - r + 0.5
      if (dx * dx + dy * dy <= (r - 1) * (r - 1)) ctx.fillRect(x, y, 1, 1)
    }
  }
  // Shadow (dark right edge)
  ctx.fillStyle = "rgba(0,0,0,0.45)"
  for (let y = 0; y < size; y++) {
    for (let x = Math.floor(size * 0.55); x < size; x++) {
      const dx = x - r + 0.5, dy = y - r + 0.5
      if (dx * dx + dy * dy <= r * r) ctx.fillRect(x, y, 1, 1)
    }
  }
  return c
}

function drawAridSprite(size: number, primary: string, secondary: string): HTMLCanvasElement {
  const c = document.createElement("canvas")
  c.width = size; c.height = size
  const ctx = c.getContext("2d")!
  ctx.imageSmoothingEnabled = false
  const r = Math.floor(size / 2)
  // Base
  ctx.fillStyle = primary
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - r + 0.5, dy = y - r + 0.5
      if (dx * dx + dy * dy <= r * r) ctx.fillRect(x, y, 1, 1)
    }
  }
  // Crater-like spots in secondary
  ctx.fillStyle = secondary
  const spots = [[Math.floor(size * 0.3), Math.floor(size * 0.4), 2], [Math.floor(size * 0.6), Math.floor(size * 0.3), 1], [Math.floor(size * 0.45), Math.floor(size * 0.6), 2]] as [number, number, number][]
  for (const [sx, sy, sr] of spots) {
    for (let dy2 = -sr; dy2 <= sr; dy2++) {
      for (let dx2 = -sr; dx2 <= sr; dx2++) {
        if (dx2 * dx2 + dy2 * dy2 <= sr * sr) {
          const px = sx + dx2, py = sy + dy2
          if (px >= 0 && px < size && py >= 0 && py < size) ctx.fillRect(px, py, 1, 1)
        }
      }
    }
  }
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)"
  for (let y = 0; y < size; y++) {
    for (let x = Math.floor(size * 0.6); x < size; x++) {
      const dx = x - r + 0.5, dy = y - r + 0.5
      if (dx * dx + dy * dy <= r * r) ctx.fillRect(x, y, 1, 1)
    }
  }
  return c
}

function drawGasSprite(size: number, primary: string, secondary: string): HTMLCanvasElement {
  const c = document.createElement("canvas")
  c.width = size * 2; c.height = size  // wider to accommodate rings
  const ctx = c.getContext("2d")!
  ctx.imageSmoothingEnabled = false
  const cx = size, cy = Math.floor(size / 2)
  const r = Math.floor(size / 2)

  // Rings (drawn behind — rendered first, partially overdrawn by planet)
  ctx.strokeStyle = secondary
  ctx.lineWidth = Math.max(1, Math.floor(size * 0.06))
  ctx.beginPath()
  ctx.ellipse(cx, cy, Math.floor(size * 0.85), Math.floor(size * 0.2), 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = primary
  ctx.lineWidth = Math.max(1, Math.floor(size * 0.04))
  ctx.beginPath()
  ctx.ellipse(cx, cy, Math.floor(size * 0.75), Math.floor(size * 0.16), 0, 0, Math.PI * 2)
  ctx.stroke()

  // Planet body
  ctx.fillStyle = primary
  for (let y = 0; y < size; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      const dx = x - cx + 0.5, dy = y - cy + 0.5
      if (dx * dx + dy * dy <= r * r) ctx.fillRect(x, y, 1, 1)
    }
  }
  // Horizontal bands
  const bands = [0.2, 0.45, 0.65, 0.8]
  for (const bf of bands) {
    ctx.fillStyle = bf % 0.3 < 0.15 ? secondary : `${secondary}88`
    const by = Math.floor(cy - r + size * bf)
    const bh = Math.max(1, Math.floor(size * 0.07))
    for (let y = by; y < by + bh; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        const dx = x - cx + 0.5, dy = y - cy + 0.5
        if (dx * dx + dy * dy <= (r - 1) * (r - 1)) ctx.fillRect(x, y, 1, 1)
      }
    }
  }
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)"
  for (let y = 0; y < size; y++) {
    for (let x = cx; x <= cx + r; x++) {
      const dx = x - cx + 0.5, dy = y - cy + 0.5
      if (dx * dx + dy * dy <= r * r) ctx.fillRect(x, y, 1, 1)
    }
  }
  return c
}

function drawIceSprite(size: number, primary: string, secondary: string): HTMLCanvasElement {
  const c = document.createElement("canvas")
  c.width = size; c.height = size
  const ctx = c.getContext("2d")!
  ctx.imageSmoothingEnabled = false
  const r = Math.floor(size / 2)
  ctx.fillStyle = primary
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - r + 0.5, dy = y - r + 0.5
      if (dx * dx + dy * dy <= r * r) ctx.fillRect(x, y, 1, 1)
    }
  }
  // White highlight spot
  ctx.fillStyle = secondary
  const hx = Math.floor(size * 0.3), hy = Math.floor(size * 0.25)
  const hr = Math.max(1, Math.floor(size * 0.2))
  for (let dy2 = -hr; dy2 <= hr; dy2++) {
    for (let dx2 = -hr; dx2 <= hr; dx2++) {
      if (dx2 * dx2 + dy2 * dy2 <= hr * hr) {
        const px = hx + dx2, py = hy + dy2
        if (px >= 0 && px < size && py >= 0 && py < size) ctx.fillRect(px, py, 1, 1)
      }
    }
  }
  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)"
  for (let y = 0; y < size; y++) {
    for (let x = Math.floor(size * 0.55); x < size; x++) {
      const dx = x - r + 0.5, dy = y - r + 0.5
      if (dx * dx + dy * dy <= r * r) ctx.fillRect(x, y, 1, 1)
    }
  }
  return c
}

function makeSprite(def: PlanetDef): HTMLCanvasElement {
  switch (def.type) {
    case "terran": return drawTerranSprite(def.baseSize, def.primary, def.secondary)
    case "arid":   return drawAridSprite(def.baseSize, def.primary, def.secondary)
    case "gas":    return drawGasSprite(def.baseSize, def.primary, def.secondary)
    case "ice":    return drawIceSprite(def.baseSize, def.primary, def.secondary)
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a)
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function spawnComet(w: number, _h: number): Comet {
  const fromRight = Math.random() > 0.5
  const speed = randomBetween(0.55, 0.85)
  const angle = randomBetween(0.3, 0.6) // radians, roughly diagonal
  return {
    x: fromRight ? w + 40 : -40,
    y: randomBetween(-40, _h * 0.4),
    vx: fromRight ? -Math.cos(angle) * speed : Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    active: true,
    trailLen: randomBetween(80, 140),
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SpaceHero({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const starsCanvasRef = useRef<HTMLCanvasElement>(null)
  const sceneCanvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const stateRef = useRef<SceneState | null>(null)
  const pausedRef = useRef(false)

  // ── Init scene ──────────────────────────────────────────────────────────────
  const initScene = useCallback((w: number, h: number): SceneState => {
    const planets: Planet[] = PLANET_DEFS.map(def => ({
      def,
      angle: def.startAngle,
      sprite: makeSprite(def),
      trail: [],
      emitAccum: 0,
    }))

    const logoImg = new Image()
    logoImg.src = "/branding/sc-prints-logo-transparent.png"

    return {
      planets,
      comets: [],
      nextCometMs: randomBetween(3000, 8000),
      logoY: 0,
      logoImg,
      logoW: 0,
      logoH: 0,
    }
  }, [])

  // ── Draw stars (once) ───────────────────────────────────────────────────────
  const drawStars = useCallback((canvas: HTMLCanvasElement, w: number, h: number, dpr: number) => {
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    const ctx = canvas.getContext("2d")!
    ctx.scale(dpr, dpr)
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, w, h)

    const count = Math.floor((w * h) / 3000)
    for (let i = 0; i < count; i++) {
      const bright = Math.random() < 0.2
      ctx.fillStyle = bright ? STAR_BRIGHT : STAR_DIM
      const size = bright ? (Math.random() < 0.3 ? 2 : 1) : 1
      ctx.fillRect(
        Math.floor(Math.random() * w),
        Math.floor(Math.random() * h),
        size, size
      )
    }
  }, [])

  // ── Responsiveness: scale orbit radii ───────────────────────────────────────
  const getOrbitScale = (w: number) => {
    if (w < 480) return 0.35
    if (w < 768) return 0.55
    return 1.0
  }

  const getVisiblePlanetCount = (w: number) => {
    if (w < 480) return 2
    if (w < 768) return 3
    return 4
  }

  // ── Main animation loop ──────────────────────────────────────────────────────
  const runLoop = useCallback(() => {
    const starsCanvas = starsCanvasRef.current
    const sceneCanvas = sceneCanvasRef.current
    if (!starsCanvas || !sceneCanvas) return

    const dpr = window.devicePixelRatio || 1
    let w = starsCanvas.parentElement?.clientWidth ?? window.innerWidth
    let h = starsCanvas.parentElement?.clientHeight ?? window.innerHeight

    sceneCanvas.width = w * dpr
    sceneCanvas.height = h * dpr
    sceneCanvas.style.width = `${w}px`
    sceneCanvas.style.height = `${h}px`

    drawStars(starsCanvas, w, h, dpr)

    const state = stateRef.current!
    const ctx = sceneCanvas.getContext("2d")!
    ctx.scale(dpr, dpr)

    let lastTs = performance.now()
    let elapsed = 0

    // Logo: clamp to 30% of canvas width, max 320px
    const calcLogoSize = () => {
      if (!state.logoImg || state.logoImg.naturalWidth === 0) return
      state.logoW = Math.min(w * 0.30, 320)
      state.logoH = (state.logoImg.naturalHeight / state.logoImg.naturalWidth) * state.logoW
    }
    if (state.logoImg && !state.logoImg.complete) {
      state.logoImg.onload = calcLogoSize
    } else {
      calcLogoSize()
    }

    const tick = (ts: number) => {
      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      const delta = Math.min(ts - lastTs, 50) // cap at 50ms to handle tab blur
      lastTs = ts
      elapsed += delta

      // Recalc canvas size on resize
      const newW = starsCanvas.parentElement?.clientWidth ?? window.innerWidth
      const newH = starsCanvas.parentElement?.clientHeight ?? window.innerHeight
      if (newW !== w || newH !== h) {
        w = newW; h = newH
        sceneCanvas.width = w * dpr
        sceneCanvas.height = h * dpr
        sceneCanvas.style.width = `${w}px`
        sceneCanvas.style.height = `${h}px`
        ctx.scale(dpr, dpr)
        drawStars(starsCanvas, w, h, dpr)
        calcLogoSize()
      }

      const cx = w / 2
      const cy = h / 2
      const orbitScale = getOrbitScale(w)
      const visibleCount = getVisiblePlanetCount(w)

      // Clear scene
      ctx.clearRect(0, 0, w, h)

      // ── Logo float ──────────────────────────────────────────────────────────
      const floatY = Math.sin(elapsed * 0.0005) * 7

      // ── Update planets & trails ─────────────────────────────────────────────
      const sorted = state.planets.slice(0, visibleCount).sort((a, b) => {
        return Math.sin(a.angle) - Math.sin(b.angle)  // behind-to-front by z
      })

      // ── Comet logic ─────────────────────────────────────────────────────────
      state.nextCometMs -= delta
      if (state.nextCometMs <= 0) {
        if (state.comets.filter(c => c.active).length < 2) {
          state.comets.push(spawnComet(w, h))
        }
        state.nextCometMs = randomBetween(5000, 12000)
      }
      // Update comets
      for (const comet of state.comets) {
        if (!comet.active) continue
        comet.x += comet.vx * delta
        comet.y += comet.vy * delta
        if (comet.x < -200 || comet.x > w + 200 || comet.y > h + 200) {
          comet.active = false
        }
      }
      // Remove inactive comets (keep pool tidy)
      while (state.comets.length > 6) state.comets.shift()

      // ── Draw comets ─────────────────────────────────────────────────────────
      for (const comet of state.comets) {
        if (!comet.active) continue
        const len = comet.trailLen
        const tx = comet.x - (comet.vx / Math.hypot(comet.vx, comet.vy)) * len
        const ty = comet.y - (comet.vy / Math.hypot(comet.vx, comet.vy)) * len

        const grad = ctx.createLinearGradient(comet.x, comet.y, tx, ty)
        grad.addColorStop(0, COMET_HEAD)
        grad.addColorStop(0.15, COMET_TRAIL)
        grad.addColorStop(1, "rgba(69,162,158,0)")
        ctx.strokeStyle = grad
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(comet.x, comet.y)
        ctx.lineTo(tx, ty)
        ctx.stroke()

        // Head pixel
        ctx.fillStyle = COMET_HEAD
        ctx.fillRect(Math.round(comet.x) - 1, Math.round(comet.y) - 1, 3, 3)
      }

      // ── Update trail particles ──────────────────────────────────────────────
      for (const planet of state.planets.slice(0, visibleCount)) {
        planet.angle += planet.def.speed * delta

        const rx = planet.def.orbitRX * orbitScale
        const ry = planet.def.orbitRY * orbitScale
        const px = cx + Math.cos(planet.angle) * rx
        const py = cy + Math.sin(planet.angle) * ry

        // Emit particles — 3 per 40ms burst for a dense, visible wake
        planet.emitAccum += delta
        const emitInterval = 16 // ms per particle
        while (planet.emitAccum >= emitInterval) {
          planet.emitAccum -= emitInterval
          const maxTrail = 200
          const p: TrailParticle = {
            x: px + randomBetween(-4, 4),
            y: py + randomBetween(-4, 4),
            life: randomBetween(1000, 2200),
            maxLife: 2200,
            size: 4,
            color: planet.def.trailColor,
          }
          if (planet.trail.length < maxTrail) {
            planet.trail.push(p)
          } else {
            // Recycle oldest
            const old = planet.trail.shift()!
            Object.assign(old, p)
            planet.trail.push(old)
          }
        }

        // Age particles
        for (let i = planet.trail.length - 1; i >= 0; i--) {
          planet.trail[i].life -= delta
          if (planet.trail[i].life <= 0) planet.trail.splice(i, 1)
        }
      }

      // ── Draw: behind-logo planets first ────────────────────────────────────
      const logoCenterX = cx
      const logoCenterY = cy + floatY

      // Draw trails for ALL visible planets (they always show)
      for (const planet of state.planets.slice(0, visibleCount)) {
        const [r, g, b] = hexToRgb(planet.def.trailColor)
        for (const p of planet.trail) {
          const alpha = (p.life / p.maxLife) * 0.85
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
        }
      }

      // Draw planets behind logo (sin(angle) < 0 = top of orbit)
      for (const planet of sorted) {
        const z = Math.sin(planet.angle)
        if (z >= 0) continue  // skip front planets here

        const rx = planet.def.orbitRX * orbitScale
        const ry = planet.def.orbitRY * orbitScale
        const px = cx + Math.cos(planet.angle) * rx
        const py = cy + Math.sin(planet.angle) * ry

        const rendered = planet.def.baseSize * planet.def.scale
        const isGas = planet.def.type === "gas"
        const drawW = isGas ? rendered * 2 : rendered
        const drawH = rendered
        const alpha = 0.4 + 0.6 * ((z + 1) / 2)  // dimmer when behind

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(planet.sprite, Math.round(px - drawW / 2), Math.round(py - drawH / 2), drawW, drawH)
        ctx.restore()
      }

      // ── Draw logo ───────────────────────────────────────────────────────────
      if (state.logoImg && state.logoImg.complete && state.logoW > 0) {
        ctx.save()
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(
          state.logoImg,
          Math.round(logoCenterX - state.logoW / 2),
          Math.round(logoCenterY - state.logoH / 2),
          state.logoW,
          state.logoH
        )
        ctx.restore()
      }

      // Draw planets in front of logo (sin(angle) >= 0 = bottom of orbit)
      for (const planet of sorted) {
        const z = Math.sin(planet.angle)
        if (z < 0) continue

        const rx = planet.def.orbitRX * orbitScale
        const ry = planet.def.orbitRY * orbitScale
        const px = cx + Math.cos(planet.angle) * rx
        const py = cy + Math.sin(planet.angle) * ry

        const rendered = planet.def.baseSize * planet.def.scale
        const isGas = planet.def.type === "gas"
        const drawW = isGas ? rendered * 2 : rendered
        const drawH = rendered

        ctx.save()
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(planet.sprite, Math.round(px - drawW / 2), Math.round(py - drawH / 2), drawW, drawH)
        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [drawStars, initScene])

  // ── Mount / unmount ─────────────────────────────────────────────────────────
  useEffect(() => {
    const starsCanvas = starsCanvasRef.current
    const sceneCanvas = sceneCanvasRef.current
    if (!starsCanvas || !sceneCanvas) return

    const parent = starsCanvas.parentElement!
    const w = parent.clientWidth
    const h = parent.clientHeight
    stateRef.current = initScene(w, h)

    // Pause when off-screen
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
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "600px",
        overflow: "hidden",
        background: BG,
        ...style,
      }}
    >
      {/* Stars layer — drawn once */}
      <canvas
        ref={starsCanvasRef}
        style={{ position: "absolute", inset: 0, display: "block" }}
      />
      {/* Animated scene layer */}
      <canvas
        ref={sceneCanvasRef}
        style={{ position: "absolute", inset: 0, display: "block" }}
      />
    </div>
  )
}
