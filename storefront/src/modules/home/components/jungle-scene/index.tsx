"use client"

import React, { useEffect, useRef, useCallback } from "react"

// ─── Palette (sky + cliff + water — environment that stays code-based) ───────
const SKY_TOP = "#3F6F94"
const SKY_MID = "#8FB3CC"
const SKY_HORIZON = "#E6CFAF"
const MOUNTAIN_FAR = "#6E8294"
const MOUNTAIN_NEAR = "#4A5867"
const CANOPY_DARK = "#152418"
const CANOPY_MID = "#1F3B25"
const CLIFF_BASE = "#5A4F45"
const CLIFF_HILITE = "#7A6E60"
const CLIFF_SHADOW = "#3A312A"
const CLIFF_CRACK = "#26201A"
const WATER_DEEP = "#1F445A"
const WATER_MID = "#316E80"
const WATER_SHIMMER = "#9CD7DF"
const WATER_FOAM = "#E0F2F4"
const WATERFALL_LIGHT = "#CFEAEF"
const WATERFALL_MID = "#8AC3CE"
const WATERFALL_DEEP = "#4F8C99"
const SAND_BASE = "#D4B886"
const SAND_LITE = "#E6CDA5"
const SAND_SHADOW = "#9C7E4F"
const STONE_BASE = "#9C918A"
const STONE_SHADOW = "#5A524D"
const STONE_HILITE = "#BCB0A8"
const STONE_MOSS = "#3A5A38"
const STONE_CRACK = "#3A332C"
const STONE_CARVE = "#3F362E"
const STONE_CARVE_HILITE = "#BCB0A8"

// ─── Asset URLs ──────────────────────────────────────────────────────────────
// All files come from itch.io packs the user installed locally:
//  - dino-characters/* — arks "Dino Characters" (CC-BY 4.0). Each PNG is a 576x24 sheet,
//    24 frames of 24x24 each. Frames 0-3 are Idle, 4-9 are Move/Run, the rest aren't used.
//  - forest/* — Anokolisa "Legacy Fantasy: High Forest" (free, commercial OK).
//  - palms/* — ToffeeCraft "Forest Nature Pack" free tier (cacti, grasses, rocks — no palms in free tier).
const ASSETS = {
  bg: "/jungle-scene/forest/background.png",
  trees: "/jungle-scene/forest/green-trees.png",
  bushes: "/jungle-scene/forest/tree-assets.png",
  rocks: "/jungle-scene/forest/rocks.png",
  plants: "/jungle-scene/palms/nature-pack.png",
  dinoGreen: "/jungle-scene/dino-characters/dino-green.png",
  dinoYellow: "/jungle-scene/dino-characters/dino-yellow.png",
} as const
type AssetKey = keyof typeof ASSETS
type AssetMap = Record<AssetKey, HTMLImageElement>

// ─── Dino sprite-sheet layout ────────────────────────────────────────────────
const DINO_FRAME_W = 24
const DINO_FRAME_H = 24
const DINO_IDLE_FRAMES = [0, 1, 2, 3]
const DINO_WALK_FRAMES = [4, 5, 6, 7, 8, 9]
const DINO_IDLE_FRAME_MS = 200
const DINO_WALK_FRAME_MS = 110
const DINO_WALK_SPEED_PX_PER_MS = 0.045

// ─── Source rectangles in environment sprite sheets ──────────────────────────
// Hand-picked from inspecting each sheet. Each tuple is [x, y, w, h] in source pixels.
// Trees — green-trees.png (1344x1200). 8 columns × 4 rows of variants. We pick a handful
// at slightly varied source rects to give visual variety.
const TREE_VARIANTS: Array<[number, number, number, number]> = [
  [0, 0, 168, 400],     // top-left bushy tree
  [168, 0, 168, 400],   // top-left bushy tree 2
  [336, 0, 168, 400],   // dense dark tree
  [840, 0, 168, 400],   // mid-row tree
  [0, 400, 168, 400],   // mid-row bushy
]
// Bushes/foliage — tree-assets.png (336x400). Right column has bush silhouettes.
const BUSH_VARIANTS: Array<[number, number, number, number]> = [
  [200, 50, 130, 70],   // top bush
  [200, 160, 130, 75],  // mid bush
  [200, 240, 130, 80],  // larger bush
  [200, 320, 130, 70],  // bottom bush
]
// Rocks — rocks.png (288x336). Large rocks at top, smaller mid.
const ROCK_VARIANTS: Array<[number, number, number, number]> = [
  [0, 0, 100, 110],     // big boulder top-left
  [110, 10, 80, 90],    // medium boulder
  [195, 20, 50, 70],    // smaller rock
  [0, 110, 90, 70],     // mossy boulder
  [105, 110, 70, 60],   // mossy mid
]
// Plants — nature-pack.png (512x384). Cacti on left, grasses middle, smaller plants.
const PLANT_VARIANTS: Array<[number, number, number, number]> = [
  [10, 10, 70, 100],    // tall cactus
  [85, 10, 65, 100],    // second cactus
  [160, 30, 95, 90],    // grass cluster
  [260, 30, 85, 90],    // wide grass
  [350, 30, 70, 90],    // small flowering cactus
]

// ─── Types ───────────────────────────────────────────────────────────────────
interface MistParticle {
  x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number
}

interface DinoState {
  spriteKey: "dinoGreen" | "dinoYellow"
  x: number          // center x in canvas pixels
  baseY: number      // foot anchor (ground line)
  scale: number      // render multiplier on the 24x24 base sprite
  dir: 1 | -1        // 1 = facing right (native), -1 = mirrored
  mode: "idle" | "walk"
  modeMs: number
  frameMs: number
  frame: number      // current sprite-sheet column (0..23)
  patrolMinX: number
  patrolMaxX: number
  nextDecisionMs: number
}

interface SceneState {
  dinos: DinoState[]
  mist: MistParticle[]
  shimmerMs: number
  shimmerFrame: number
  waterfallMs: number
  riverY: number
  waterfallBaseX: number
  waterfallBaseY: number
  waterfallSlotW: number
}

// ─── Random / colour helpers ────────────────────────────────────────────────
const rand = (min: number, max: number) => min + Math.random() * (max - min)

function mulberry32(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6D2B79F5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function lerpRgb(a: [number, number, number], b: [number, number, number], t: number): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t)
  const g = Math.round(a[1] + (b[1] - a[1]) * t)
  const bl = Math.round(a[2] + (b[2] - a[2]) * t)
  return `rgb(${r},${g},${bl})`
}

// ─── Image loader ────────────────────────────────────────────────────────────
function loadAllAssets(): Promise<AssetMap> {
  const entries = Object.entries(ASSETS) as Array<[AssetKey, string]>
  return Promise.all(entries.map(([key, url]) => new Promise<[AssetKey, HTMLImageElement]>((resolve, reject) => {
    const img = new Image()
    img.decoding = "async"
    img.onload = () => resolve([key, img])
    img.onerror = () => reject(new Error(`Failed to load ${url}`))
    img.src = url
  }))).then(pairs => Object.fromEntries(pairs) as AssetMap)
}

// ─── Dino animation ──────────────────────────────────────────────────────────
function drawDino(ctx: CanvasRenderingContext2D, state: DinoState, sheet: HTMLImageElement) {
  const sx = state.frame * DINO_FRAME_W
  const dw = DINO_FRAME_W * state.scale
  const dh = DINO_FRAME_H * state.scale
  const dx = Math.round(state.x - dw / 2)
  const dy = Math.round(state.baseY - dh)
  ctx.imageSmoothingEnabled = false
  if (state.dir === -1) {
    ctx.save()
    ctx.translate(dx + dw, dy)
    ctx.scale(-1, 1)
    ctx.drawImage(sheet, sx, 0, DINO_FRAME_W, DINO_FRAME_H, 0, 0, dw, dh)
    ctx.restore()
  } else {
    ctx.drawImage(sheet, sx, 0, DINO_FRAME_W, DINO_FRAME_H, dx, dy, dw, dh)
  }
}

function updateDino(state: DinoState, dt: number) {
  state.modeMs += dt
  state.frameMs += dt
  if (state.mode === "walk") {
    state.x += state.dir * DINO_WALK_SPEED_PX_PER_MS * dt
    if (state.frameMs >= DINO_WALK_FRAME_MS) {
      state.frameMs -= DINO_WALK_FRAME_MS
      const idx = DINO_WALK_FRAMES.indexOf(state.frame)
      state.frame = DINO_WALK_FRAMES[(idx >= 0 ? idx + 1 : 1) % DINO_WALK_FRAMES.length]
    }
    if (state.x >= state.patrolMaxX) {
      state.x = state.patrolMaxX; state.dir = -1; transitionToIdle(state)
    } else if (state.x <= state.patrolMinX) {
      state.x = state.patrolMinX; state.dir = 1; transitionToIdle(state)
    } else if (state.modeMs >= state.nextDecisionMs) {
      transitionToIdle(state)
    }
  } else {
    if (state.frameMs >= DINO_IDLE_FRAME_MS) {
      state.frameMs -= DINO_IDLE_FRAME_MS
      const idx = DINO_IDLE_FRAMES.indexOf(state.frame)
      state.frame = DINO_IDLE_FRAMES[(idx >= 0 ? idx + 1 : 1) % DINO_IDLE_FRAMES.length]
    }
    if (state.modeMs >= state.nextDecisionMs) {
      state.mode = "walk"
      state.modeMs = 0
      state.frameMs = 0
      state.frame = DINO_WALK_FRAMES[0]
      state.nextDecisionMs = 2500 + Math.random() * 3000
    }
  }
}

function transitionToIdle(state: DinoState) {
  state.mode = "idle"
  state.modeMs = 0
  state.frameMs = 0
  state.frame = DINO_IDLE_FRAMES[0]
  state.nextDecisionMs = 1800 + Math.random() * 2500
}

// ─── Sprite stamping helpers ─────────────────────────────────────────────────
// Stamp a source rect from a sprite sheet onto the destination, sized to a target height
// and positioned at (cx, baseY) — the foot anchor.
function stampSprite(
  ctx: CanvasRenderingContext2D, sheet: HTMLImageElement,
  src: [number, number, number, number], cx: number, baseY: number, targetH: number, flipH = false
) {
  const [sx, sy, sw, sh] = src
  const scale = targetH / sh
  const dw = sw * scale
  const dh = sh * scale
  const dx = Math.round(cx - dw / 2)
  const dy = Math.round(baseY - dh)
  ctx.imageSmoothingEnabled = false
  if (flipH) {
    ctx.save()
    ctx.translate(dx + dw, dy)
    ctx.scale(-1, 1)
    ctx.drawImage(sheet, sx, sy, sw, sh, 0, 0, dw, dh)
    ctx.restore()
  } else {
    ctx.drawImage(sheet, sx, sy, sw, sh, dx, dy, dw, dh)
  }
}

// ─── Stone monument with carved "SC PRINTS" ──────────────────────────────────
function makeMonument(scale: number): HTMLCanvasElement {
  const BW = 84, BH = 48
  const c = document.createElement("canvas")
  c.width = BW * scale; c.height = BH * scale
  const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false
  const px = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color
    ctx.fillRect(x * scale, y * scale, w * scale, h * scale)
  }
  // Base ground / pedestal
  px(2, 43, 80, 5, "#3A2E20")
  px(0, 45, 84, 3, "#241B12")
  // Pedestal slab
  px(6, 39, 72, 5, STONE_SHADOW)
  px(6, 38, 72, 1, STONE_BASE)
  px(6, 36, 72, 2, STONE_BASE)
  px(5, 39, 1, 5, STONE_SHADOW)
  px(78, 39, 1, 5, STONE_SHADOW)
  // Main block
  const monL = 10, monR = 74, monTop = 6, monBot = 36
  px(monL, monTop + 2, monR - monL, monBot - monTop - 2, STONE_BASE)
  px(monL, monTop, 2, 2, STONE_SHADOW)
  px(monR - 2, monTop, 2, 2, STONE_SHADOW)
  px(monL + 2, monTop, monR - monL - 4, 2, STONE_BASE)
  px(monL + 2, monTop, monR - monL - 4, 1, STONE_HILITE)
  px(monL + 1, monTop + 1, 1, 1, STONE_HILITE)
  px(monR - 2, monTop + 1, 1, 1, STONE_HILITE)
  px(monL, monTop + 2, 1, monBot - monTop - 2, STONE_HILITE)
  px(monR - 1, monTop + 2, 1, monBot - monTop - 2, STONE_SHADOW)
  px(monL, monBot - 1, monR - monL, 1, STONE_SHADOW)
  // Cracks
  const rng = mulberry32(7311)
  for (let i = 0; i < 5; i++) {
    let cx = Math.floor(monL + 2 + rng() * (monR - monL - 4))
    let cy = Math.floor(monTop + 4 + rng() * (monBot - monTop - 8))
    const len = 3 + Math.floor(rng() * 6)
    for (let j = 0; j < len; j++) {
      px(cx, cy, 1, 1, STONE_CRACK)
      cx += rng() > 0.5 ? 0 : (rng() > 0.5 ? 1 : -1)
      cy += rng() > 0.4 ? 1 : 0
      if (cx < monL + 1 || cx > monR - 2 || cy > monBot - 2) break
    }
  }
  // Moss
  const mossPatches: [number, number, number, number][] = [
    [monL + 1, monBot - 4, 3, 2],
    [monL + 6, monBot - 3, 5, 2],
    [monL + 18, monBot - 2, 7, 2],
    [monL + 3, monBot - 9, 2, 2],
    [monR - 10, monBot - 3, 6, 2],
    [monR - 4, monBot - 7, 2, 3],
  ]
  for (const [mx, my, mw, mh] of mossPatches) px(mx, my, mw, mh, STONE_MOSS)

  // Carved "SC PRINTS" — rasterize text + stamp each pixel into the monument.
  const TEXT = "SC PRINTS"
  const tcanvas = document.createElement("canvas")
  tcanvas.width = 200; tcanvas.height = 24
  const tctx = tcanvas.getContext("2d")!
  tctx.imageSmoothingEnabled = false
  tctx.fillStyle = "#FFFFFF"
  tctx.font = "bold 10px monospace"
  tctx.textBaseline = "top"
  tctx.textAlign = "left"
  const metrics = tctx.measureText(TEXT)
  const textW = Math.min(200, Math.ceil(metrics.width))
  const textH = 10
  tctx.fillText(TEXT, 0, 0)
  const data = tctx.getImageData(0, 0, textW, textH).data
  const monW = monR - monL
  const monH = monBot - monTop
  const insetX = 4, insetY = 10
  const availW = monW - insetX * 2
  const availH = monH - insetY - 8
  const tx0 = monL + insetX + Math.floor((availW - textW) / 2)
  const ty0 = monTop + insetY + Math.floor((availH - textH) / 2)
  for (let y = 0; y < textH; y++) {
    for (let x = 0; x < textW; x++) {
      if (data[(y * textW + x) * 4 + 3] > 80) {
        px(tx0 + x, ty0 + y, 1, 1, STONE_CARVE)
        if (y === 0 || data[((y - 1) * textW + x) * 4 + 3] <= 80) {
          px(tx0 + x, ty0 + y - 1, 1, 1, STONE_CARVE_HILITE)
        }
      }
    }
  }
  return c
}

// ─── Backdrop painter ────────────────────────────────────────────────────────
function paintBackdrop(
  canvas: HTMLCanvasElement, w: number, h: number, dpr: number,
  assets: AssetMap, monumentSprite: HTMLCanvasElement
) {
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr)
  canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
  const ctx = canvas.getContext("2d")!
  ctx.imageSmoothingEnabled = false
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const riverY = Math.floor(h * 0.62)

  // 1. Sky gradient + the cloudy Background.png stretched across the upper half.
  const skyTopRgb = hexToRgb(SKY_TOP)
  const skyMidRgb = hexToRgb(SKY_MID)
  const skyHorizonRgb = hexToRgb(SKY_HORIZON)
  for (let y = 0; y < riverY; y += 3) {
    const t = y / Math.max(1, riverY - 1)
    const color = t < 0.5
      ? lerpRgb(skyTopRgb, skyMidRgb, t / 0.5)
      : lerpRgb(skyMidRgb, skyHorizonRgb, (t - 0.5) / 0.5)
    ctx.fillStyle = color
    ctx.fillRect(0, y, w, 3)
  }
  // Background.png drifts as a soft cloud band over the gradient (drawn at reduced alpha
  // so the sky colour bleeds through).
  ctx.save()
  ctx.globalAlpha = 0.55
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(assets.bg, 0, 0, w, Math.floor(h * 0.4))
  ctx.restore()

  // 2. Distant mountains (code-based silhouettes for depth)
  drawMountainLayer(ctx, w, riverY, riverY - Math.floor(h * 0.08), Math.floor(h * 0.18), MOUNTAIN_FAR, 1733)
  drawMountainLayer(ctx, w, riverY, riverY - Math.floor(h * 0.04), Math.floor(h * 0.13), MOUNTAIN_NEAR, 9421)

  // 3. Trees from green-trees.png scattered in midground — these are the "jungle"
  //    canopy now. We size them to ~70-110% of riverY so they tower above the water.
  const treeRng = mulberry32(31337)
  const treeTargetH = Math.floor(riverY * 0.95)
  const treeCount = 4 + Math.floor(w / 220)
  for (let i = 0; i < treeCount; i++) {
    const variant = TREE_VARIANTS[Math.floor(treeRng() * TREE_VARIANTS.length)]
    // Spread trees across width but bias toward edges (more density at sides, less centred)
    const u = treeRng()
    const x = Math.floor(w * (u < 0.5 ? u * 0.4 : 0.6 + (u - 0.5) * 0.8))
    const flip = treeRng() < 0.5
    const heightVar = treeTargetH * (0.6 + treeRng() * 0.4)
    stampSprite(ctx, assets.trees, variant, x, riverY + 2, heightVar, flip)
  }

  // 4. Cliff face + waterfall slot (code-based — no sprite for this)
  drawCliff(ctx, w, h, riverY)

  // 5. River base
  ctx.fillStyle = WATER_DEEP
  ctx.fillRect(0, riverY, w, h - riverY)
  const waterMidRgb = hexToRgb(WATER_MID)
  const waterDeepRgb = hexToRgb(WATER_DEEP)
  for (let y = riverY; y < h; y += 2) {
    const t = (y - riverY) / Math.max(1, h - riverY - 1)
    const eased = t * 0.8
    ctx.fillStyle = lerpRgb(waterMidRgb, waterDeepRgb, 1 - eased)
    ctx.fillRect(0, y, w, 2)
  }

  // 6. Sandy riverbank — chunky 3px wet-sand strip at the river's top edge
  for (let x = 0; x < w; x++) {
    const ripple = ((x * 7) % 11) / 11
    ctx.fillStyle = ripple < 0.5 ? SAND_BASE : SAND_LITE
    ctx.fillRect(x, riverY, 1, 1)
    ctx.fillStyle = SAND_SHADOW
    ctx.fillRect(x, riverY + 1, 1, 1)
  }
  ctx.fillStyle = WATER_FOAM
  for (let x = 0; x < w; x += 5) {
    const dip = ((x * 0.13) % 2 < 1) ? 0 : 1
    ctx.fillRect(x, riverY - dip, 2, 1)
  }

  // 7. Foreground rocks scattered along the bottom
  const rockRng = mulberry32(7777)
  const rockCount = Math.max(3, Math.floor(w / 180))
  const rockTargetH = Math.max(28, Math.floor(h * 0.10))
  for (let i = 0; i < rockCount; i++) {
    const variant = ROCK_VARIANTS[Math.floor(rockRng() * ROCK_VARIANTS.length)]
    const x = Math.floor(rockRng() * w * 0.95) + Math.floor(w * 0.025)
    const flip = rockRng() < 0.5
    const heightVar = rockTargetH * (0.7 + rockRng() * 0.6)
    stampSprite(ctx, assets.rocks, variant, x, h - 2, heightVar, flip)
  }

  // 8. Foreground bushes (left + right edges)
  const bushRng = mulberry32(54321)
  const bushTargetH = Math.max(36, Math.floor(h * 0.14))
  const bushCount = Math.max(4, Math.floor(w / 140))
  for (let i = 0; i < bushCount; i++) {
    const variant = BUSH_VARIANTS[Math.floor(bushRng() * BUSH_VARIANTS.length)]
    // Skip the centre 35% so bushes don't cover the monument area
    let x = Math.floor(bushRng() * w)
    if (x > w * 0.55 && x < w * 0.78) x = Math.floor(x - w * 0.25)
    const flip = bushRng() < 0.5
    const heightVar = bushTargetH * (0.7 + bushRng() * 0.5)
    stampSprite(ctx, assets.bushes, variant, x, h - 4 + Math.floor(bushRng() * 6), heightVar, flip)
  }

  // 9. Plants/cacti/grass tufts from the nature pack — sparse decorative touches
  const plantRng = mulberry32(88888)
  const plantTargetH = Math.max(22, Math.floor(h * 0.10))
  const plantCount = Math.max(3, Math.floor(w / 160))
  for (let i = 0; i < plantCount; i++) {
    const variant = PLANT_VARIANTS[Math.floor(plantRng() * PLANT_VARIANTS.length)]
    const x = Math.floor(plantRng() * w * 0.95) + Math.floor(w * 0.025)
    const heightVar = plantTargetH * (0.75 + plantRng() * 0.5)
    stampSprite(ctx, assets.plants, variant, x, h - 2, heightVar, plantRng() < 0.5)
  }

  // 10. Monument — placed on the right riverbank in the foreground
  const mw = monumentSprite.width
  const mh = monumentSprite.height
  const targetCenter = w * 0.84
  const halfW = mw / 2
  const mxRaw = targetCenter - halfW
  const mx = Math.round(Math.min(Math.max(mxRaw, 4), w - mw - 4))
  const my = Math.round(h - mh - 4)
  ctx.drawImage(monumentSprite, mx, my)
}

function drawMountainLayer(
  ctx: CanvasRenderingContext2D, w: number, riverY: number, baseY: number, maxHeight: number,
  color: string, seed: number
) {
  const rng = mulberry32(seed)
  const ridge: number[] = []
  const samples = Math.ceil(w / 3) + 1
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1)
    const a = Math.sin(t * 5.2 + seed * 0.013) * 0.45
    const b = Math.sin(t * 11.7 + seed * 0.029) * 0.22
    const c2 = Math.sin(t * 23.1 + seed * 0.043) * 0.10
    const n = (rng() - 0.5) * 0.18
    const height = (a + b + c2 + n + 0.5) * maxHeight
    ridge.push(baseY - Math.max(0, height))
  }
  ctx.fillStyle = color
  for (let x = 0; x < w; x++) {
    const fi = (x / w) * (samples - 1)
    const i0 = Math.floor(fi), i1 = Math.min(samples - 1, i0 + 1)
    const tt = fi - i0
    const y = Math.floor(ridge[i0] * (1 - tt) + ridge[i1] * tt)
    ctx.fillRect(x, y, 1, Math.max(0, baseY - y))
  }
}

function drawCliff(ctx: CanvasRenderingContext2D, w: number, h: number, riverY: number) {
  const cliffTopY = Math.floor(h * 0.08)
  const cliffBotY = riverY
  const cliffWidth = Math.floor(w * 0.36)
  const cliffX = Math.floor(w * 0.55 - cliffWidth / 2)
  const slotW = Math.max(10, Math.floor(cliffWidth * 0.18))
  const slotX = cliffX + Math.floor(cliffWidth / 2) - Math.floor(slotW / 2)

  const rng = mulberry32(2024)
  const buildEdge = (x0: number, x1: number, peakOffset: number): number[] => {
    const arr: number[] = []
    for (let x = x0; x <= x1; x++) {
      const t = (x - x0) / Math.max(1, x1 - x0)
      const arch = Math.sin(t * Math.PI) * peakOffset
      const lump = Math.sin(t * 8 + 1.1) * (peakOffset * 0.3) + (rng() - 0.5) * 4
      arr.push(Math.floor(cliffTopY + (peakOffset - arch) - lump))
    }
    return arr
  }
  const leftEdge = buildEdge(cliffX, slotX - 1, Math.floor(h * 0.05))
  const rightEdge = buildEdge(slotX + slotW, cliffX + cliffWidth, Math.floor(h * 0.05))

  ctx.fillStyle = CLIFF_BASE
  for (let x = cliffX; x < slotX; x++) {
    const yTop = leftEdge[x - cliffX]
    ctx.fillRect(x, yTop, 1, cliffBotY - yTop)
  }
  for (let x = slotX + slotW; x <= cliffX + cliffWidth; x++) {
    const yTop = rightEdge[x - (slotX + slotW)]
    ctx.fillRect(x, yTop, 1, cliffBotY - yTop)
  }
  ctx.fillStyle = CLIFF_SHADOW
  ctx.fillRect(slotX, cliffTopY + 2, slotW, cliffBotY - cliffTopY - 2)
  ctx.fillStyle = CLIFF_HILITE
  ctx.fillRect(slotX, cliffTopY + 2, 1, cliffBotY - cliffTopY - 2)
  ctx.fillStyle = CLIFF_CRACK
  ctx.fillRect(slotX + slotW - 1, cliffTopY + 2, 1, cliffBotY - cliffTopY - 2)

  const rng2 = mulberry32(4096)
  for (let i = 0; i < Math.floor(cliffWidth / 4); i++) {
    const cx = cliffX + Math.floor(rng2() * cliffWidth)
    if (cx > slotX - 2 && cx < slotX + slotW + 2) continue
    const cy = cliffTopY + 6 + Math.floor(rng2() * (cliffBotY - cliffTopY - 12))
    const len = 4 + Math.floor(rng2() * 12)
    ctx.fillStyle = CLIFF_CRACK
    ctx.fillRect(cx, cy, 1, len)
  }
  for (let i = 0; i < Math.floor(cliffWidth / 6); i++) {
    const cy = cliffTopY + 4 + Math.floor(rng2() * (cliffBotY - cliffTopY - 8))
    const cx = cliffX + Math.floor(rng2() * cliffWidth)
    if (cx > slotX - 2 && cx < slotX + slotW + 2) continue
    const len = 3 + Math.floor(rng2() * 6)
    ctx.fillStyle = CLIFF_HILITE
    ctx.fillRect(cx, cy, len, 1)
  }
  ctx.fillStyle = CLIFF_HILITE
  for (let x = cliffX; x < slotX; x++) {
    ctx.fillRect(x, leftEdge[x - cliffX], 1, 1)
  }
  ctx.fillStyle = CLIFF_SHADOW
  for (let x = slotX + slotW; x <= cliffX + cliffWidth; x++) {
    ctx.fillRect(x, rightEdge[x - (slotX + slotW)], 1, 1)
  }
}

// ─── Per-frame animated overlays ─────────────────────────────────────────────
function drawWaterfall(
  ctx: CanvasRenderingContext2D, w: number, h: number, riverY: number, scrollMs: number
) {
  const cliffTopY = Math.floor(h * 0.08)
  const cliffWidth = Math.floor(w * 0.36)
  const cliffX = Math.floor(w * 0.55 - cliffWidth / 2)
  const slotW = Math.max(10, Math.floor(cliffWidth * 0.18))
  const slotX = cliffX + Math.floor(cliffWidth / 2) - Math.floor(slotW / 2)
  const fallTop = cliffTopY + 2
  const fallBot = riverY + 2

  const streamCount = Math.max(3, Math.floor(slotW / 3))
  const scrollPeriod = 24
  for (let s = 0; s < streamCount; s++) {
    const t = s / Math.max(1, streamCount - 1)
    const streamX = slotX + 1 + Math.floor(t * (slotW - 2))
    const rate = 0.18 + (s % 3) * 0.04
    const yOff = (scrollMs * rate) % scrollPeriod
    for (let y = fallTop; y < fallBot; y++) {
      const phase = ((y + yOff) % scrollPeriod) / scrollPeriod
      ctx.fillStyle =
        phase < 0.20 ? WATERFALL_LIGHT
        : phase < 0.45 ? WATERFALL_MID
        : phase < 0.75 ? WATERFALL_DEEP
        : WATERFALL_MID
      ctx.fillRect(streamX, y, 1, 1)
    }
  }
  // Foam pool at base
  ctx.fillStyle = WATER_FOAM
  for (let x = slotX - 2; x < slotX + slotW + 2; x++) {
    const dy = ((scrollMs * 0.01) + x * 0.37) % 2
    ctx.fillRect(x, Math.floor(fallBot + dy), 1, 1)
  }
  ctx.fillStyle = WATERFALL_LIGHT
  for (let x = slotX; x < slotX + slotW; x++) {
    const dy = Math.sin(scrollMs * 0.01 + x * 0.4) * 0.5 + 0.5
    ctx.fillRect(x, Math.floor(fallBot - 1 + dy * 2), 1, 1)
  }
}

function drawRiverShimmer(
  ctx: CanvasRenderingContext2D, w: number, h: number, riverY: number, frame: number
) {
  const rng = mulberry32(20251115)
  const count = Math.floor(w / 12)
  for (let i = 0; i < count; i++) {
    const sx = Math.floor(rng() * w)
    const sy = Math.floor(riverY + 2 + rng() * (h - riverY - 4))
    const f = Math.floor(rng() * 4)
    const len = 1 + Math.floor(rng() * 3)
    if (f === frame) {
      ctx.fillStyle = WATER_SHIMMER
      ctx.fillRect(sx, sy, len, 1)
    } else if ((f + 1) % 4 === frame) {
      ctx.fillStyle = WATER_MID
      ctx.fillRect(sx, sy, len, 1)
    }
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function JungleScene({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  const backdropRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const stateRef = useRef<SceneState | null>(null)
  const assetsRef = useRef<AssetMap | null>(null)
  const monumentRef = useRef<HTMLCanvasElement | null>(null)
  const pausedRef = useRef(false)
  const reducedMotionRef = useRef(false)
  const lastSizeRef = useRef<{ w: number; h: number; dpr: number }>({ w: 0, h: 0, dpr: 1 })

  const initScene = useCallback((): SceneState => ({
    dinos: [],
    mist: [],
    shimmerMs: 0,
    shimmerFrame: 0,
    waterfallMs: 0,
    riverY: 0,
    waterfallBaseX: 0,
    waterfallBaseY: 0,
    waterfallSlotW: 0,
  }), [])

  const layoutScene = useCallback((state: SceneState, w: number, h: number) => {
    const riverY = Math.floor(h * 0.62)
    const cliffWidth = Math.floor(w * 0.36)
    const cliffX = Math.floor(w * 0.55 - cliffWidth / 2)
    const slotW = Math.max(10, Math.floor(cliffWidth * 0.18))
    const slotX = cliffX + Math.floor(cliffWidth / 2) - Math.floor(slotW / 2)
    state.riverY = riverY
    state.waterfallBaseX = slotX + slotW / 2
    state.waterfallBaseY = riverY + 2
    state.waterfallSlotW = slotW

    // Dino 1 — bigger green vita near the riverbank, between waterfall base and left edge
    // Dino 2 — smaller yellow tard patrolling the foreground bottom, right of center
    const bigScale = Math.max(3, Math.round(h / 90))
    const smallScale = Math.max(2, Math.round(h / 110))
    if (state.dinos.length === 0) {
      const dinoBigPatrolMin = Math.floor(w * 0.12)
      const dinoBigPatrolMax = Math.floor(w * 0.34)
      state.dinos.push({
        spriteKey: "dinoGreen",
        x: (dinoBigPatrolMin + dinoBigPatrolMax) / 2,
        baseY: riverY + 2 * bigScale,
        scale: bigScale,
        dir: 1,
        mode: "idle",
        modeMs: 0,
        frameMs: 0,
        frame: 0,
        patrolMinX: dinoBigPatrolMin,
        patrolMaxX: dinoBigPatrolMax,
        nextDecisionMs: 1800 + Math.random() * 2500,
      })
      const dinoSmallPatrolMin = Math.floor(w * 0.42)
      const dinoSmallPatrolMax = Math.floor(w * 0.72)
      state.dinos.push({
        spriteKey: "dinoYellow",
        x: (dinoSmallPatrolMin + dinoSmallPatrolMax) / 2,
        baseY: h - 4,
        scale: smallScale,
        dir: -1,
        mode: "walk",
        modeMs: 0,
        frameMs: 0,
        frame: DINO_WALK_FRAMES[0],
        patrolMinX: dinoSmallPatrolMin,
        patrolMaxX: dinoSmallPatrolMax,
        nextDecisionMs: 2500 + Math.random() * 3000,
      })
    } else {
      // Resize-time update — re-clamp patrol ranges + baselines, keep modes
      state.dinos[0].scale = bigScale
      state.dinos[0].baseY = riverY + 2 * bigScale
      state.dinos[0].patrolMinX = Math.floor(w * 0.12)
      state.dinos[0].patrolMaxX = Math.floor(w * 0.34)
      state.dinos[0].x = Math.max(state.dinos[0].patrolMinX, Math.min(state.dinos[0].patrolMaxX, state.dinos[0].x))
      state.dinos[1].scale = smallScale
      state.dinos[1].baseY = h - 4
      state.dinos[1].patrolMinX = Math.floor(w * 0.42)
      state.dinos[1].patrolMaxX = Math.floor(w * 0.72)
      state.dinos[1].x = Math.max(state.dinos[1].patrolMinX, Math.min(state.dinos[1].patrolMaxX, state.dinos[1].x))
    }
  }, [])

  const runLoop = useCallback(() => {
    const backdrop = backdropRef.current
    const scene = sceneRef.current
    const assets = assetsRef.current
    const monument = monumentRef.current
    if (!backdrop || !scene || !assets || !monument) return
    const ctx = scene.getContext("2d")
    if (!ctx) return

    const resizeIfNeeded = () => {
      const parent = scene.parentElement
      const w = parent?.clientWidth ?? window.innerWidth
      const h = parent?.clientHeight ?? window.innerHeight
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const last = lastSizeRef.current
      if (w === last.w && h === last.h && dpr === last.dpr) return { w, h, dpr }
      lastSizeRef.current = { w, h, dpr }
      scene.width = Math.round(w * dpr); scene.height = Math.round(h * dpr)
      scene.style.width = `${w}px`; scene.style.height = `${h}px`
      ctx.imageSmoothingEnabled = false
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const state = stateRef.current
      if (state) {
        layoutScene(state, w, h)
        const monumentScale = Math.max(1, Math.round(h / 110))
        monumentRef.current = makeMonument(monumentScale)
        paintBackdrop(backdrop, w, h, dpr, assets, monumentRef.current)
      }
      return { w, h, dpr }
    }

    let { w, h } = resizeIfNeeded()

    if (reducedMotionRef.current) {
      drawAnimatedLayer(ctx, w, h, stateRef.current!, assets, true, 600, 0)
      return
    }

    let last = performance.now()
    const tick = (ts: number) => {
      if (pausedRef.current) { rafRef.current = requestAnimationFrame(tick); return }
      const delta = Math.min(ts - last, 50)
      last = ts

      const r = resizeIfNeeded()
      w = r.w; h = r.h

      const state = stateRef.current
      if (!state) return

      state.shimmerMs += delta
      if (state.shimmerMs >= 130) {
        state.shimmerMs = 0
        state.shimmerFrame = (state.shimmerFrame + 1) % 4
      }
      state.waterfallMs += delta

      // Dinos
      for (const d of state.dinos) updateDino(d, delta)

      // Mist particles at the waterfall base
      const spawnCount = Math.random() < 0.7 ? (Math.random() < 0.4 ? 2 : 1) : 0
      for (let i = 0; i < spawnCount; i++) {
        if (state.mist.length >= 100) break
        const spread = state.waterfallSlotW + 6
        state.mist.push({
          x: state.waterfallBaseX + rand(-spread / 2, spread / 2),
          y: state.waterfallBaseY + rand(-2, 4),
          vx: rand(-0.012, 0.012),
          vy: rand(-0.045, -0.022),
          life: rand(1500, 2400),
          maxLife: 2400,
          size: Math.random() < 0.3 ? 2 : 1,
        })
      }
      for (let i = state.mist.length - 1; i >= 0; i--) {
        const m = state.mist[i]
        m.x += m.vx * delta
        m.y += m.vy * delta
        m.life -= delta
        if (m.life <= 0) state.mist.splice(i, 1)
      }

      drawAnimatedLayer(ctx, w, h, state, assets, false, state.waterfallMs, state.shimmerFrame)

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [layoutScene])

  useEffect(() => {
    const backdrop = backdropRef.current
    const scene = sceneRef.current
    if (!backdrop || !scene) return

    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
      reducedMotionRef.current = mq.matches
    }

    let cancelled = false
    loadAllAssets().then(assets => {
      if (cancelled) return
      assetsRef.current = assets
      stateRef.current = initScene()
      const parent = scene.parentElement
      const w = parent?.clientWidth ?? window.innerWidth
      const h = parent?.clientHeight ?? window.innerHeight
      layoutScene(stateRef.current, w, h)
      monumentRef.current = makeMonument(Math.max(1, Math.round(h / 110)))
      runLoop()
    }).catch(err => {
      console.error("JungleScene: failed to load sprite assets", err)
    })

    const observer = new IntersectionObserver(
      ([entry]) => { pausedRef.current = !entry.isIntersecting },
      { threshold: 0 }
    )
    observer.observe(scene)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      observer.disconnect()
    }
  }, [initScene, layoutScene, runLoop])

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "40vh",
        minHeight: "240px",
        overflow: "hidden",
        background: SKY_TOP,
        ...style,
      }}
    >
      <canvas ref={backdropRef} style={{ position: "absolute", inset: 0, display: "block" }} />
      <canvas ref={sceneRef} style={{ position: "absolute", inset: 0, display: "block" }} />
    </div>
  )
}

function drawAnimatedLayer(
  ctx: CanvasRenderingContext2D, w: number, h: number, state: SceneState, assets: AssetMap,
  motionless: boolean, waterfallMs: number, shimmerFrame: number
) {
  ctx.clearRect(0, 0, w, h)
  ctx.imageSmoothingEnabled = false

  drawWaterfall(ctx, w, h, state.riverY, motionless ? 600 : waterfallMs)
  drawRiverShimmer(ctx, w, h, state.riverY, shimmerFrame)

  // Dinos (drawn in front of waterfall + river, behind mist)
  for (const dino of state.dinos) {
    const sheet = assets[dino.spriteKey]
    if (!sheet) continue
    drawDino(ctx, dino, sheet)
  }

  // Mist particles last
  for (const m of state.mist) {
    const lifeT = m.life / m.maxLife
    const alpha = Math.max(0, Math.min(1, lifeT)) * 0.7
    ctx.fillStyle = `rgba(224, 242, 244, ${alpha})`
    ctx.fillRect(Math.round(m.x), Math.round(m.y), m.size, m.size)
  }
}
