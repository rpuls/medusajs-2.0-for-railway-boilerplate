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
  baseSize: number; scale: number; primary: string; secondary: string
  trailColor: string; orbitRX: number; orbitRY: number; speed: number
  startAngle: number; type: PlanetType
}

const PLANET_DEFS: PlanetDef[] = [
  { baseSize: 12, scale: 3, primary: "#C5C6C7", secondary: "#FFFFFF",
    trailColor: "#C5C6C7", orbitRX: 200, orbitRY: 75, speed: 0.00075, startAngle: 3.3, type: "ice" },
  { baseSize: 16, scale: 3, primary: "#D9534F", secondary: "#F0AD4E",
    trailColor: "#D9534F", orbitRX: 310, orbitRY: 115, speed: 0.00042, startAngle: 2.1, type: "arid" },
  { baseSize: 20, scale: 3, primary: "#8B1A1A", secondary: "#FF4500",
    trailColor: "#FF4500", orbitRX: 410, orbitRY: 150, speed: 0.00031, startAngle: 5.5, type: "lava" },
  { baseSize: 32, scale: 3, primary: "#45A29E", secondary: "#66FCF1",
    trailColor: "#45A29E", orbitRX: 510, orbitRY: 185, speed: 0.00021, startAngle: 0.5, type: "terran" },
  { baseSize: 24, scale: 3, primary: "#1A7A4A", secondary: "#39FF14",
    trailColor: "#39FF14", orbitRX: 590, orbitRY: 210, speed: 0.00016, startAngle: 1.2, type: "neon" },
  { baseSize: 48, scale: 2.5, primary: "#6B5B95", secondary: "#FF7B25",
    trailColor: "#6B5B95", orbitRX: 680, orbitRY: 242, speed: 0.00011, startAngle: 4.0, type: "gas" },
]

// ─── Types ───────────────────────────────────────────────────────────────────
interface TrailParticle {
  x: number; y: number; life: number; maxLife: number; size: number; color: string
}

interface Planet {
  def: PlanetDef; angle: number; sprite: HTMLCanvasElement
  trail: TrailParticle[]; emitAccum: number
  prevX: number; prevY: number; initialized: boolean
}

interface Comet {
  x: number; y: number; vx: number; vy: number; active: boolean; trailLen: number
}

interface Flyby {
  x: number; y: number; vx: number; vy: number
  sprite: HTMLCanvasElement; active: boolean; alpha: number; flipped: boolean
  engineX: number; engineY: number  // local coords of engine glow
  engineColor: string
  scale: number
}

interface LogoPixel { lx: number; ly: number }

interface SceneState {
  planets: Planet[]; comets: Comet[]; nextCometMs: number
  flybys: Flyby[]; flybySprites: HTMLCanvasElement[]; nextFlybyMs: number
  logoImg: HTMLImageElement | null; logoW: number; logoH: number
  logoPixels: LogoPixel[] | null; logoCols: number; logoRows: number; logoPixelSize: number
  earthImg: HTMLImageElement | null; earthFrames: number
}

// ─── Planet sprite helpers ────────────────────────────────────────────────────
function circleFill(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, inset = 0) {
  ctx.fillStyle = color
  const ri = r - inset
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const dx = x - cx + 0.5, dy = y - cy + 0.5
      if (dx * dx + dy * dy <= ri * ri) ctx.fillRect(x, y, 1, 1)
    }
}

function drawTerranSprite(size: number, primary: string, secondary: string): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = size; c.height = size
  const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false; const r = size / 2
  circleFill(ctx, r, r, r, primary)
  ctx.fillStyle = secondary
  const bY = Math.floor(size * 0.28), bH = Math.max(1, Math.floor(size * 0.13))
  for (let y = bY; y < bY + bH; y++) for (let x = 0; x < size; x++) {
    const dx = x - r + 0.5, dy = y - r + 0.5
    if (dx * dx + dy * dy <= (r - 1) * (r - 1)) ctx.fillRect(x, y, 1, 1)
  }
  ctx.fillStyle = "rgba(0,0,0,0.38)"
  for (let y = 0; y < size; y++) for (let x = Math.floor(r * 1.1); x < size; x++) {
    const dx = x - r + 0.5, dy = y - r + 0.5
    if (dx * dx + dy * dy <= r * r) ctx.fillRect(x, y, 1, 1)
  }
  return c
}

function drawAridSprite(size: number, primary: string, secondary: string): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = size; c.height = size
  const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false; const r = size / 2
  circleFill(ctx, r, r, r, primary)
  const spots: [number, number, number][] = [[Math.floor(size*0.3),Math.floor(size*0.4),2],[Math.floor(size*0.6),Math.floor(size*0.3),1],[Math.floor(size*0.45),Math.floor(size*0.62),2]]
  for (const [sx, sy, sr] of spots) for (let dy = -sr; dy <= sr; dy++) for (let dx = -sr; dx <= sr; dx++)
    if (dx*dx+dy*dy <= sr*sr) { const px=sx+dx, py=sy+dy; if (px>=0&&px<size&&py>=0&&py<size) { ctx.fillStyle=secondary; ctx.fillRect(px,py,1,1) } }
  ctx.fillStyle = "rgba(0,0,0,0.4)"
  for (let y = 0; y < size; y++) for (let x = Math.floor(r*1.15); x < size; x++) {
    const dx = x-r+0.5, dy = y-r+0.5; if (dx*dx+dy*dy <= r*r) ctx.fillRect(x,y,1,1)
  }
  return c
}

function drawLavaSprite(size: number, primary: string, secondary: string): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = size; c.height = size
  const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false; const r = size / 2
  circleFill(ctx, r, r, r, primary)
  ctx.fillStyle = secondary
  const cracks: [number,number,number,number][] = [[Math.floor(r*.5),Math.floor(r*.4),Math.floor(r*1.3),Math.floor(r*.9)],[Math.floor(r*.8),Math.floor(r*1.1),Math.floor(r*1.5),Math.floor(r*1.6)],[Math.floor(r*.4),Math.floor(r*1.3),Math.floor(r*.9),Math.floor(r*1.8)]]
  for (const [x1,y1,x2,y2] of cracks) { const steps=Math.max(Math.abs(x2-x1),Math.abs(y2-y1)); for (let i=0;i<=steps;i++) { const px=Math.round(x1+(x2-x1)*(i/steps)),py=Math.round(y1+(y2-y1)*(i/steps)); const dx=px-r+.5,dy=py-r+.5; if (dx*dx+dy*dy<=(r-1)*(r-1)) ctx.fillRect(px,py,1,1) } }
  ctx.fillStyle = "rgba(0,0,0,0.5)"
  for (let y=0;y<size;y++) for (let x=Math.floor(r*1.1);x<size;x++) { const dx=x-r+.5,dy=y-r+.5; if (dx*dx+dy*dy<=r*r) ctx.fillRect(x,y,1,1) }
  return c
}

function drawNeonSprite(size: number, primary: string, secondary: string): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = size; c.height = size
  const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false; const r = size / 2
  circleFill(ctx, r, r, r, primary)
  ctx.fillStyle = secondary
  for (let y=0;y<size;y++) for (let x=0;x<size;x++) { const dx=x-r+.5,dy=y-r+.5,d2=dx*dx+dy*dy; if (d2<=r*r&&d2>=(r-2.5)*(r-2.5)) ctx.fillRect(x,y,1,1) }
  circleFill(ctx, Math.floor(r*.55), Math.floor(r*.45), Math.max(1,Math.floor(r*.28)), secondary)
  ctx.fillStyle = "rgba(0,0,0,0.45)"
  for (let y=0;y<size;y++) for (let x=Math.floor(r*1.1);x<size;x++) { const dx=x-r+.5,dy=y-r+.5; if (dx*dx+dy*dy<=r*r) ctx.fillRect(x,y,1,1) }
  return c
}

function drawGasSprite(size: number, primary: string, secondary: string): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = size*2; c.height = size
  const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false
  const cx=size,cy=size/2,r=size/2
  for (const [rx2,ry2,lw,col] of [[Math.floor(size*.88),Math.floor(size*.21),Math.max(1,Math.floor(size*.06)),secondary],[Math.floor(size*.76),Math.floor(size*.17),Math.max(1,Math.floor(size*.04)),primary]] as [number,number,number,string][]) { ctx.strokeStyle=col; ctx.lineWidth=lw; ctx.beginPath(); ctx.ellipse(cx,cy,rx2,ry2,0,0,Math.PI*2); ctx.stroke() }
  circleFill(ctx,cx,cy,r,primary)
  for (const [bf,col] of [[.22,secondary],[.46,`${secondary}99`],[.66,secondary],[.81,`${secondary}77`]] as [number,string][]) { ctx.fillStyle=col; const by=Math.floor(cy-r+size*bf),bh=Math.max(1,Math.floor(size*.07)); for (let y=by;y<by+bh;y++) for (let x=cx-Math.floor(r);x<=cx+Math.floor(r);x++) { const dx=x-cx+.5,dy=y-cy+.5; if (dx*dx+dy*dy<=(r-1)*(r-1)) ctx.fillRect(x,y,1,1) } }
  ctx.fillStyle="rgba(0,0,0,0.4)"
  for (let y=0;y<size;y++) for (let x=cx;x<=cx+Math.floor(r);x++) { const dx=x-cx+.5,dy=y-cy+.5; if (dx*dx+dy*dy<=r*r) ctx.fillRect(x,y,1,1) }
  return c
}

function drawIceSprite(size: number, primary: string, secondary: string): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = size; c.height = size
  const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false; const r = size / 2
  circleFill(ctx,r,r,r,primary)
  circleFill(ctx,Math.floor(r*.62),Math.floor(r*.52),Math.max(1,Math.floor(r*.38)),secondary)
  ctx.fillStyle="rgba(0,0,0,0.32)"
  for (let y=0;y<size;y++) for (let x=Math.floor(r*1.05);x<size;x++) { const dx=x-r+.5,dy=y-r+.5; if (dx*dx+dy*dy<=r*r) ctx.fillRect(x,y,1,1) }
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

// ─── Ship sprite generators ───────────────────────────────────────────────────
// All ships face RIGHT. The flyby system flips them for leftward travel via ctx.scale(-1,1).

function makeShuttleSprite(): HTMLCanvasElement {
  // Side view, nose = right, 46w × 10h
  const W = 46, H = 10
  const c = document.createElement("canvas"); c.width = W; c.height = H
  const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false
  const midY = Math.floor(H / 2)

  // Delta wing: wider at back (left), narrows to nose (right) via scanlines
  for (let x = 0; x < W - 2; x++) {
    const t = x / (W - 3) // 0=back 1=nose
    const half = Math.round(4 * (1 - t))
    if (half === 0) continue
    ctx.fillStyle = "#DDDDDD"
    ctx.fillRect(x, midY - half, 1, half * 2)
    // Heat tiles on bottom ~60% from back
    if (t < 0.65 && half >= 2) {
      ctx.fillStyle = "#334488"
      ctx.fillRect(x, midY + half - 2, 1, 2)
    }
  }
  // Nose tip
  ctx.fillStyle = "#DDDDDD"
  ctx.fillRect(W - 3, midY, 3, 1)
  ctx.fillRect(W - 2, midY - 1, 2, 3)
  // Cockpit windows
  ctx.fillStyle = "#66CCEE"
  ctx.fillRect(W - 14, midY - 2, 5, 2)
  // Engine nozzles (left end)
  ctx.fillStyle = "#88AAFF"
  ctx.fillRect(0, midY - 3, 3, 2)
  ctx.fillRect(0, midY + 1, 3, 2)
  ctx.fillStyle = "#AACCFF"
  ctx.fillRect(0, midY - 1, 2, 2)
  return c
}

function makeEnterpriseSprite(): HTMLCanvasElement {
  // Top-down view, nose = right, 58w × 16h
  const W = 58, H = 16
  const c = document.createElement("canvas"); c.width = W; c.height = H
  const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false
  const midY = H / 2

  // Saucer section (oval, right side)
  const sCX = W - 18, sRX = 17, sRY = 7
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x - sCX) / sRX, dy = (y - midY) / sRY
    if (dx * dx + dy * dy <= 1) { ctx.fillStyle = "#CCCCCC"; ctx.fillRect(x, y, 1, 1) }
  }
  // Saucer dome highlight
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x - sCX + 3) / (sRX * 0.6), dy = (y - midY + 1) / (sRY * 0.55)
    if (dx * dx + dy * dy <= 1) { ctx.fillStyle = "#E8E8E8"; ctx.fillRect(x, y, 1, 1) }
  }
  // Secondary hull (rectangular, center-left)
  ctx.fillStyle = "#AAAAAA"
  ctx.fillRect(12, Math.floor(midY) - 2, 26, 4)
  // Nacelles (2 thin bars, top & bottom)
  ctx.fillStyle = "#8899BB"
  ctx.fillRect(0, 1, 34, 3)       // top nacelle
  ctx.fillRect(0, H - 4, 34, 3)   // bottom nacelle
  // Nacelle engine glows
  ctx.fillStyle = "#4466FF"
  ctx.fillRect(0, 2, 4, 2)
  ctx.fillRect(0, H - 3, 4, 2)
  // Neck (connecting saucer to hull)
  ctx.fillStyle = "#999999"
  ctx.fillRect(37, Math.floor(midY) - 1, 5, 2)
  return c
}

function makeXWingSprite(): HTMLCanvasElement {
  // Side view, nose = right, 44w × 18h
  const W = 44, H = 18
  const c = document.createElement("canvas"); c.width = W; c.height = H
  const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false
  const midY = Math.floor(H / 2)

  // Fuselage
  ctx.fillStyle = "#CCCCCC"
  ctx.fillRect(2, midY - 1, W - 4, 3)
  // Pointed nose
  ctx.fillRect(W - 4, midY, 4, 1)
  ctx.fillRect(W - 3, midY - 1, 3, 3)
  // Cockpit canopy
  ctx.fillStyle = "#334466"
  ctx.fillRect(W - 16, midY - 2, 6, 2)
  ctx.fillStyle = "#4466AA"
  ctx.fillRect(W - 15, midY - 2, 4, 1)
  // R2-D2 dome
  ctx.fillStyle = "#AACCEE"
  ctx.fillRect(W - 22, midY - 2, 4, 3)

  // Wing attachment point ~40% from back
  const wx = 10
  // Top wings (fan upward from wx)
  ctx.fillStyle = "#BBBBBB"
  ctx.fillRect(wx, midY - 3, 18, 1)   // near-top wing
  ctx.fillRect(wx - 2, midY - 6, 18, 1) // far-top wing
  // Bottom wings
  ctx.fillRect(wx, midY + 3, 18, 1)   // near-bottom wing
  ctx.fillRect(wx - 2, midY + 5, 18, 1) // far-bottom wing
  // Red stripes
  ctx.fillStyle = "#CC2222"
  ctx.fillRect(wx + 4, midY - 3, 6, 1)
  ctx.fillRect(wx + 4, midY + 3, 6, 1)
  ctx.fillRect(wx + 2, midY - 6, 6, 1)
  ctx.fillRect(wx + 2, midY + 5, 6, 1)
  // Engine glow (back left)
  ctx.fillStyle = "#FF8800"
  ctx.fillRect(0, midY - 1, 4, 3)
  ctx.fillStyle = "#FFCC44"
  ctx.fillRect(0, midY, 2, 1)
  return c
}

function makeFalconSprite(): HTMLCanvasElement {
  // Top-down view, 40w × 30h, nose = right
  const W = 40, H = 30
  const c = document.createElement("canvas"); c.width = W; c.height = H
  const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false
  const cx = W / 2 - 2, cy = H / 2

  // Main disc
  const rX = 16, rY = 13
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x - cx) / rX, dy = (y - cy) / rY
    if (dx * dx + dy * dy <= 1) { ctx.fillStyle = "#887766"; ctx.fillRect(x, y, 1, 1) }
  }
  // Panel lines (darker cross)
  ctx.fillStyle = "#554433"
  ctx.fillRect(cx - 12, cy - 1, 24, 1)
  ctx.fillRect(cx - 1, cy - 10, 1, 20)
  ctx.fillRect(cx - 8, cy - 8, 1, 16)
  ctx.fillRect(cx + 6, cy - 8, 1, 16)
  // Disc highlight
  ctx.fillStyle = "#AA9988"
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x - cx + 3) / (rX * 0.55), dy = (y - cy + 2) / (rY * 0.5)
    if (dx * dx + dy * dy <= 1) { ctx.fillStyle = "#998877"; ctx.fillRect(x, y, 1, 1) }
  }
  // Front mandibles (right side, creates the fork shape)
  ctx.clearRect(cx + 10, cy - 4, 9, 3)
  ctx.clearRect(cx + 10, cy + 1, 9, 3)
  // Mandible detail
  ctx.fillStyle = "#665544"
  ctx.fillRect(cx + 10, cy - 6, 8, 2)
  ctx.fillRect(cx + 10, cy + 4, 8, 2)
  // Cockpit blister (upper right of disc)
  ctx.fillStyle = "#334466"
  ctx.fillRect(cx + 4, cy - 9, 6, 4)
  ctx.fillStyle = "#4466AA"
  ctx.fillRect(cx + 5, cy - 8, 4, 2)
  // Engine glow (back left)
  ctx.fillStyle = "#4488FF"
  ctx.fillRect(cx - rX + 1, cy - 2, 4, 4)
  ctx.fillStyle = "#88AAFF"
  ctx.fillRect(cx - rX + 1, cy - 1, 3, 2)
  return c
}

function makeTIESprite(): HTMLCanvasElement {
  // Front 3/4 view, 34w × 28h
  const W = 34, H = 28
  const c = document.createElement("canvas"); c.width = W; c.height = H
  const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false
  const cx = W / 2, cy = H / 2

  // Solar panels — left panel (hexagonal approximation)
  ctx.fillStyle = "#1A3322"
  for (const [x, y, w, h] of [[0,6,4,16],[4,3,4,22],[8,1,3,26],[11,3,2,22]] as [number,number,number,number][])
    ctx.fillRect(x, y, w, h)
  // Panel grid lines
  ctx.fillStyle = "#2A5533"
  for (let row = 0; row < 5; row++) ctx.fillRect(0, 5 + row * 4, 13, 1)

  // Solar panels — right panel (mirror)
  ctx.fillStyle = "#1A3322"
  for (const [x, y, w, h] of [[30,6,4,16],[26,3,4,22],[23,1,3,26],[21,3,2,22]] as [number,number,number,number][])
    ctx.fillRect(x, y, w, h)
  ctx.fillStyle = "#2A5533"
  for (let row = 0; row < 5; row++) ctx.fillRect(21, 5 + row * 4, 13, 1)

  // Struts
  ctx.fillStyle = "#555555"
  ctx.fillRect(13, cy - 1, 4, 2)
  ctx.fillRect(17, cy - 1, 4, 2)

  // Cockpit ball
  circleFill(ctx, cx, cy, 5, "#777777")
  circleFill(ctx, cx - 1, cy - 1, 3, "#999999")
  // Viewport
  ctx.fillStyle = "#44FF88"
  ctx.fillRect(cx - 2, cy - 1, 4, 2)
  // Engine glow center
  ctx.fillStyle = "#44FF88"
  circleFill(ctx, cx, cy, 2, "#44FF88")
  ctx.fillStyle = "#AAFFCC"
  ctx.fillRect(cx - 1, cy, 2, 1)
  return c
}

// ─── Ship registry (built once, reused across flybys) ─────────────────────────
interface ShipDef { sprite: HTMLCanvasElement; engineX: number; engineY: number; engineColor: string; scale: number }

function buildShipDefs(): ShipDef[] {
  return [
    { sprite: makeShuttleSprite(),   engineX: 1,   engineY: 5,  engineColor: "#88AAFF", scale: 2.5 },
    { sprite: makeEnterpriseSprite(), engineX: 2,   engineY: 8,  engineColor: "#4466FF", scale: 2   },
    { sprite: makeXWingSprite(),     engineX: 2,   engineY: 9,  engineColor: "#FF8800", scale: 2   },
    { sprite: makeFalconSprite(),    engineX: 4,   engineY: 15, engineColor: "#4488FF", scale: 1.8 },
    { sprite: makeTIESprite(),       engineX: 17,  engineY: 14, engineColor: "#44FF88", scale: 1.8 },
  ]
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
  return { x: fromRight ? w + 40 : -40, y: randomBetween(-40, h * 0.4), vx: fromRight ? -Math.cos(angle) * speed : Math.cos(angle) * speed, vy: Math.sin(angle) * speed, active: true, trailLen: randomBetween(80, 140) }
}

function spawnFlyby(w: number, h: number, shipDefs: ShipDef[]): Flyby {
  const def = shipDefs[Math.floor(Math.random() * shipDefs.length)]
  const fromRight = Math.random() > 0.5
  const speed = randomBetween(0.18, 0.32)
  const angle = randomBetween(0.05, 0.22)  // shallow diagonal
  const vx = fromRight ? -speed : speed
  const vy = randomBetween(-0.06, 0.12)
  const margin = def.sprite.width * def.scale + 20
  const startX = fromRight ? w + margin : -margin
  const startY = randomBetween(h * 0.05, h * 0.75)
  return {
    x: startX, y: startY, vx, vy,
    sprite: def.sprite, active: true,
    alpha: randomBetween(0.55, 0.82),
    flipped: fromRight,
    engineX: def.engineX, engineY: def.engineY,
    engineColor: def.engineColor,
    scale: def.scale,
  }
}

function sampleLogoPixels(img: HTMLImageElement, targetCols: number): { pixels: LogoPixel[]; cols: number; rows: number } {
  const cols = targetCols, rows = Math.round(cols * img.naturalHeight / img.naturalWidth)
  const off = document.createElement("canvas"); off.width = cols; off.height = rows
  const ctx = off.getContext("2d")!; ctx.imageSmoothingEnabled = false
  ctx.drawImage(img, 0, 0, cols, rows)
  const data = ctx.getImageData(0, 0, cols, rows).data
  const pixels: LogoPixel[] = []
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++)
    if (data[(y * cols + x) * 4 + 3] > 80) pixels.push({ lx: x, ly: y })
  return { pixels, cols, rows }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SpaceHero({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const starsCanvasRef = useRef<HTMLCanvasElement>(null)
  const sceneCanvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const stateRef = useRef<SceneState | null>(null)
  const pausedRef = useRef(false)
  const shipDefsRef = useRef<ShipDef[] | null>(null)

  const initScene = useCallback((): SceneState => {
    const planets: Planet[] = PLANET_DEFS.map(def => ({
      def, angle: def.startAngle, sprite: makeSprite(def), trail: [], emitAccum: 0,
      prevX: Math.cos(def.startAngle) * def.orbitRX,
      prevY: Math.sin(def.startAngle) * def.orbitRY,
      initialized: false,
    }))
    const logoImg = new Image(); logoImg.src = "/branding/sc-prints-logo-transparent.png"
    const earthImg = new Image()
    earthImg.src = "/branding/earth-spritesheet.png"
    earthImg.onload = () => { if (stateRef.current) stateRef.current.earthFrames = Math.round(earthImg.naturalWidth / earthImg.naturalHeight) }
    return { planets, comets: [], nextCometMs: randomBetween(3000, 7000), flybys: [], flybySprites: [], nextFlybyMs: randomBetween(8000, 18000), logoImg, logoW: 0, logoH: 0, logoPixels: null, logoCols: 0, logoRows: 0, logoPixelSize: 0, earthImg, earthFrames: 0 }
  }, [])

  const drawStars = useCallback((canvas: HTMLCanvasElement, w: number, h: number, dpr: number) => {
    canvas.width = w * dpr; canvas.height = h * dpr
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
    const ctx = canvas.getContext("2d")!; ctx.scale(dpr, dpr)
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

    let lastTs = performance.now(), elapsed = 0

    const LOGO_SAMPLE_COLS = 72, LOGO_DISPLAY_COLS = 64
    const EARTH_FRAME_MS = 80  // 30 frames over 2.4 s = 80 ms/frame

    const calcLogoSize = () => {
      if (!state.logoImg || state.logoImg.naturalWidth === 0) return
      state.logoPixelSize = Math.max(3, Math.round(Math.min(w * 0.006, 5.5)))
      state.logoCols = LOGO_DISPLAY_COLS
      state.logoW = state.logoCols * state.logoPixelSize
      state.logoRows = Math.round(state.logoCols * state.logoImg.naturalHeight / state.logoImg.naturalWidth)
      state.logoH = state.logoRows * state.logoPixelSize
    }

    const doSampleLogo = () => {
      if (!state.logoImg || state.logoImg.naturalWidth === 0) return
      const { pixels, cols } = sampleLogoPixels(state.logoImg, LOGO_SAMPLE_COLS)
      const scale = LOGO_DISPLAY_COLS / cols
      const seen = new Set<string>()
      state.logoPixels = pixels.map(p => ({ lx: Math.round(p.lx * scale), ly: Math.round(p.ly * scale) }))
        .filter(p => { const k = `${p.lx},${p.ly}`; if (seen.has(k)) return false; seen.add(k); return true })
    }

    const initLogo = () => { calcLogoSize(); doSampleLogo() }
    if (state.logoImg && !state.logoImg.complete) { state.logoImg.onload = initLogo } else if (state.logoImg) { initLogo() }

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
        ctx.scale(dpr, dpr); drawStars(starsCanvas, w, h, dpr); calcLogoSize()
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
        ctx.fillStyle = COMET_HEAD; ctx.fillRect(Math.round(comet.x) - 1, Math.round(comet.y) - 1, 3, 3)
      }

      // ── Flybys ───────────────────────────────────────────────────────────────
      const shipDefs = shipDefsRef.current
      if (shipDefs) {
        state.nextFlybyMs -= delta
        if (state.nextFlybyMs <= 0) {
          if (state.flybys.filter(f => f.active).length < 2) state.flybys.push(spawnFlyby(w, h, shipDefs))
          state.nextFlybyMs = randomBetween(12000, 28000)
        }
      }
      for (const fb of state.flybys) {
        if (!fb.active) continue
        fb.x += fb.vx * delta; fb.y += fb.vy * delta
        const margin = fb.sprite.width * fb.scale + 60
        if (fb.x < -margin || fb.x > w + margin) fb.active = false
      }
      while (state.flybys.length > 6) state.flybys.shift()

      // Draw flybys (background layer — before planets & trails)
      for (const fb of state.flybys) {
        if (!fb.active) continue
        const sw = fb.sprite.width * fb.scale
        const sh = fb.sprite.height * fb.scale

        ctx.save()
        ctx.globalAlpha = fb.alpha
        ctx.imageSmoothingEnabled = false

        if (fb.flipped) {
          // Traveling left: flip sprite horizontally around its center
          ctx.translate(fb.x + sw / 2, fb.y)
          ctx.scale(-1, 1)
          ctx.drawImage(fb.sprite, -sw / 2, -sh / 2, sw, sh)
          // Engine glow on flipped ship (engine is on original left = now right)
          const [er, eg, eb] = hexToRgb(fb.engineColor)
          ctx.globalAlpha = fb.alpha * 0.8
          ctx.fillStyle = `rgba(${er},${eg},${eb},0.9)`
          ctx.fillRect(Math.round(-sw / 2 + fb.engineX * fb.scale - 2), Math.round(-sh / 2 + fb.engineY * fb.scale - 2), 6, 4)
          ctx.fillStyle = `rgba(${er},${eg},${eb},0.4)`
          ctx.fillRect(Math.round(-sw / 2 + fb.engineX * fb.scale - 4), Math.round(-sh / 2 + fb.engineY * fb.scale - 4), 12, 8)
        } else {
          ctx.drawImage(fb.sprite, Math.round(fb.x - sw / 2), Math.round(fb.y - sh / 2), sw, sh)
          // Engine glow (engine at left end of sprite = back of ship)
          const [er, eg, eb] = hexToRgb(fb.engineColor)
          ctx.globalAlpha = fb.alpha * 0.8
          ctx.fillStyle = `rgba(${er},${eg},${eb},0.9)`
          ctx.fillRect(Math.round(fb.x - sw / 2 + fb.engineX * fb.scale - 2), Math.round(fb.y - sh / 2 + fb.engineY * fb.scale - 2), 6, 4)
          ctx.fillStyle = `rgba(${er},${eg},${eb},0.4)`
          ctx.fillRect(Math.round(fb.x - sw / 2 + fb.engineX * fb.scale - 4), Math.round(fb.y - sh / 2 + fb.engineY * fb.scale - 4), 12, 8)
        }
        ctx.restore()
      }

      // ── Update planets & trailing-edge particles ─────────────────────────────
      for (const planet of state.planets.slice(0, visibleCount)) {
        planet.angle += planet.def.speed * delta
        const rx = planet.def.orbitRX * orbitScale, ry = planet.def.orbitRY * orbitScale
        const px = cx + Math.cos(planet.angle) * rx, py = cy + Math.sin(planet.angle) * ry
        const rendered = planet.def.baseSize * planet.def.scale
        const planetRadius = rendered / 2

        const velX = px - planet.prevX, velY = py - planet.prevY
        const velLen = Math.hypot(velX, velY)

        if (!planet.initialized) {
          planet.prevX = px; planet.prevY = py; planet.initialized = true
        } else if (velLen > 0.001) {
          const vnX = velX / velLen, vnY = velY / velLen
          const perpX = -vnY, perpY = vnX
          const originX = px - vnX * planetRadius * 0.8
          const originY = py - vnY * planetRadius * 0.8
          const pSize = Math.max(3, Math.floor(planetRadius * 0.22))
          const maxTrail = 240, emitInterval = 14

          planet.emitAccum += delta
          while (planet.emitAccum >= emitInterval) {
            planet.emitAccum -= emitInterval
            const spread = randomBetween(-planetRadius * 0.7, planetRadius * 0.7)
            const drift = randomBetween(0, planetRadius * 0.3)
            const spawnX = originX + perpX * spread - vnX * drift + randomBetween(-1.5, 1.5)
            const spawnY = originY + perpY * spread - vnY * drift + randomBetween(-1.5, 1.5)
            const life = randomBetween(900, 2400)
            const p: TrailParticle = { x: spawnX, y: spawnY, life, maxLife: life, size: pSize, color: planet.def.trailColor }
            if (planet.trail.length < maxTrail) { planet.trail.push(p) }
            else { const old = planet.trail.shift()!; Object.assign(old, p); planet.trail.push(old) }
          }
          planet.prevX = px; planet.prevY = py
        }
        for (let i = planet.trail.length - 1; i >= 0; i--) {
          planet.trail[i].life -= delta
          if (planet.trail[i].life <= 0) planet.trail.splice(i, 1)
        }
      }

      const sorted = state.planets.slice(0, visibleCount).sort((a, b) => Math.sin(a.angle) - Math.sin(b.angle))

      // ── Draw trails ──────────────────────────────────────────────────────────
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
        const drawW = isGas ? rendered * 2 : rendered
        const z = Math.sin(planet.angle)
        ctx.save(); ctx.globalAlpha = 0.38 + 0.62 * ((z + 1) / 2); ctx.imageSmoothingEnabled = false
        ctx.drawImage(planet.sprite, Math.round(px - drawW / 2), Math.round(py - rendered / 2), drawW, rendered)
        ctx.restore()
      }

      // ── Draw pixel logo ──────────────────────────────────────────────────────
      if (state.logoPixels && state.logoPixels.length > 0 && state.logoPixelSize > 0) {
        const ps = state.logoPixelSize
        const offX = cx - (state.logoCols * ps) / 2
        const offY = cy + floatY - (state.logoRows * ps) / 2
        const logoW = state.logoCols * ps
        const logoH = state.logoRows * ps

        ctx.save()
        ctx.beginPath()
        for (const { lx, ly } of state.logoPixels)
          ctx.rect(Math.round(offX + lx * ps), Math.round(offY + ly * ps), ps, ps)
        ctx.clip()

        if (state.earthImg?.complete && state.earthFrames > 0) {
          const frameSize = state.earthImg.naturalHeight  // each frame is square
          const frame = Math.floor(elapsed / EARTH_FRAME_MS) % state.earthFrames
          const tileH = logoH
          const tileW = tileH  // frames are square
          ctx.imageSmoothingEnabled = true
          for (let tx = offX; tx < offX + logoW; tx += tileW)
            ctx.drawImage(state.earthImg, frame * frameSize, 0, frameSize, frameSize, tx, offY, tileW, tileH)
        } else {
          ctx.fillStyle = "#FFFFFF"
          for (const { lx, ly } of state.logoPixels)
            ctx.fillRect(Math.round(offX + lx * ps), Math.round(offY + ly * ps), ps, ps)
        }

        ctx.restore()
      } else if (state.logoImg?.complete && state.logoW > 0) {
        ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.imageSmoothingEnabled = false
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
        const drawW = isGas ? rendered * 2 : rendered
        ctx.save(); ctx.imageSmoothingEnabled = false
        ctx.drawImage(planet.sprite, Math.round(px - drawW / 2), Math.round(py - rendered / 2), drawW, rendered)
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

    // Build ship sprites once (canvas API, must be in browser)
    shipDefsRef.current = buildShipDefs()

    stateRef.current = initScene()
    const observer = new IntersectionObserver(([entry]) => { pausedRef.current = !entry.isIntersecting }, { threshold: 0 })
    observer.observe(starsCanvas)
    runLoop()
    return () => { cancelAnimationFrame(rafRef.current); observer.disconnect() }
  }, [initScene, runLoop])

  return (
    <div className={className} style={{ position: "relative", width: "100%", height: "100%", minHeight: "600px", overflow: "hidden", background: BG, ...style }}>
      <canvas ref={starsCanvasRef} style={{ position: "absolute", inset: 0, display: "block" }} />
      <canvas ref={sceneCanvasRef} style={{ position: "absolute", inset: 0, display: "block" }} />
    </div>
  )
}
