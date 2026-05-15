"use client"

import React, { useEffect, useRef, useCallback } from "react"

// ─── Palette ────────────────────────────────────────────────────────────────
const SKY_TOP = "#3F6F94"
const SKY_MID = "#8FB3CC"
const SKY_HORIZON = "#E6CFAF"
const MOUNTAIN_FAR = "#6E8294"
const MOUNTAIN_NEAR = "#4A5867"
const CANOPY_DARK = "#1A2E1C"
const CANOPY_MID = "#274229"
const CANOPY_HILITE = "#3F6A3A"
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
// Brachiosaurus — cute baby-sauropod palette (chunky outline + 4 shades + belly + glint)
const BRACHIO_OUTLINE = "#152812"
const BRACHIO_DARK = "#2A4A1F"
const BRACHIO_MID = "#5B8736"
const BRACHIO_LIGHT = "#8FB552"
const BRACHIO_BELLY = "#D5E089"
// Triceratops — orange T-Rex inspired (chunky outline + 4 shades + belly + horn)
const TRIC_OUTLINE = "#2A180A"
const TRIC_DARK = "#5A3920"
const TRIC_MID = "#A86A35"
const TRIC_LIGHT = "#D78843"
const TRIC_BELLY = "#F5C28A"
const TRIC_HORN = "#F0E0B0"
const TRIC_HORN_DK = "#A89060"
// Pterodactyl — dark brown with warm highlights
const PTERO_OUTLINE = "#1F0F08"
const PTERO_DARK = "#3F2E22"
const PTERO_MID = "#7A5037"
const PTERO_LIGHT = "#B07A4F"
const PTERO_BEAK = "#E8C374"
// Eye highlights — shared
const EYE_GLINT = "#FFFFFF"
const STONE_BASE = "#9C918A"
const STONE_SHADOW = "#5A524D"
const STONE_HILITE = "#BCB0A8"
const STONE_MOSS = "#3A5A38"
const STONE_CRACK = "#3A332C"
const STONE_CARVE = "#3F362E"
const STONE_CARVE_HILITE = "#BCB0A8"

// ─── Types ───────────────────────────────────────────────────────────────────
interface Cloud {
  x: number; y: number; scale: number; speed: number; seed: number
}

interface Pterodactyl {
  x: number; y: number; baseY: number; vx: number; phase: number; freq: number
  amplitude: number; flapMs: number; flapFrame: 0 | 1; active: boolean; flipped: boolean
  scale: number
}

interface MistParticle {
  x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number
}

interface TricState {
  x: number; baseY: number; dir: 1 | -1; mode: "walk" | "pause"
  modeMs: number; stepMs: number; frame: 0 | 1 | 2 | 3
  patrolMinX: number; patrolMaxX: number; scale: number
}

interface BrachioState {
  x: number; y: number; scale: number
  cycleMs: number  // 0..CYCLE_LEN, looped
}

interface SceneState {
  clouds: Cloud[]
  pterodactyls: Pterodactyl[]
  nextPteroMs: number
  mist: MistParticle[]
  brachio: BrachioState
  trics: TricState[]
  brachioBodySprite: HTMLCanvasElement | null
  tricSprites: HTMLCanvasElement[] | null
  pteroSprites: HTMLCanvasElement[] | null
  shimmerMs: number
  shimmerFrame: number
  waterfallMs: number
  cloudSprites: HTMLCanvasElement[] | null
  waterfallBaseX: number
  waterfallBaseY: number
  waterfallTopY: number
  waterfallSlotW: number
  riverY: number
}

// ─── Random / colour helpers ─────────────────────────────────────────────────
const rand = (min: number, max: number) => min + Math.random() * (max - min)
const randi = (min: number, max: number) => Math.floor(rand(min, max))

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

// Filled disc on a pixel grid (matches SpaceHero's circleFill style).
function pixelDisc(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.fillStyle = color
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++)
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const dx = x - cx + 0.5, dy = y - cy + 0.5
      if (dx * dx + dy * dy <= r * r) ctx.fillRect(x, y, 1, 1)
    }
}

function pixelEllipse(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, color: string) {
  ctx.fillStyle = color
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x - cx + 0.5) / rx, dy = (y - cy + 0.5) / ry
      if (dx * dx + dy * dy <= 1) ctx.fillRect(x, y, 1, 1)
    }
}

// Render an ASCII-pixel-art template to a canvas context at (x,y), each char = `scale` pixels.
// Characters not present in the palette (e.g. `.` or space) are treated as transparent.
function drawTemplate(
  ctx: CanvasRenderingContext2D,
  template: string[],
  palette: Record<string, string>,
  x: number,
  y: number,
  scale: number
) {
  for (let r = 0; r < template.length; r++) {
    const row = template[r]
    for (let c = 0; c < row.length; c++) {
      const color = palette[row[c]]
      if (!color) continue
      ctx.fillStyle = color
      ctx.fillRect(x + c * scale, y + r * scale, scale, scale)
    }
  }
}

function makeTemplateSprite(
  template: string[],
  palette: Record<string, string>,
  scale: number
): HTMLCanvasElement {
  const cols = template.reduce((m, r) => Math.max(m, r.length), 0)
  const rows = template.length
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, cols * scale)
  canvas.height = Math.max(1, rows * scale)
  const ctx = canvas.getContext("2d")!
  ctx.imageSmoothingEnabled = false
  drawTemplate(ctx, template, palette, 0, 0, scale)
  return canvas
}

// ─── Cloud sprite ────────────────────────────────────────────────────────────
function makeCloud(seed: number, baseScale: number): HTMLCanvasElement {
  const rng = mulberry32(seed)
  const W = Math.floor(28 * baseScale), H = Math.floor(10 * baseScale)
  const c = document.createElement("canvas"); c.width = W; c.height = H
  const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false
  // Body — 3-5 overlapping pixel discs
  const blobs = 3 + Math.floor(rng() * 3)
  for (let i = 0; i < blobs; i++) {
    const bx = (W * (0.15 + 0.7 * (i / Math.max(1, blobs - 1))))
    const by = H * (0.55 + rng() * 0.2)
    const br = (2 + rng() * 2.5) * baseScale
    pixelDisc(ctx, bx, by, br, "rgba(255,255,255,0.85)")
  }
  // Soft shadow underside (one pixel band)
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      const i = (y * W + x) * 4
      const data = ctx.getImageData(x, y, 1, 1).data
      if (data[3] > 0) {
        // mark only the bottom-most lit pixel as shadow
        const below = ctx.getImageData(x, y + 1, 1, 1).data
        if (below[3] === 0 && y > H * 0.55) {
          ctx.fillStyle = "rgba(180,200,210,0.55)"; ctx.fillRect(x, y, 1, 1)
        }
        break
      }
    }
  }
  return c
}

// ─── Pterodactyl sprite (2-frame flap) ───────────────────────────────────────
// Right-facing. Chunky black outline + 3 brown shades + cream beak + white eye glint.
const PTERO_PALETTE: Record<string, string> = {
  o: PTERO_OUTLINE,
  D: PTERO_DARK,
  M: PTERO_MID,
  L: PTERO_LIGHT,
  B: PTERO_BEAK,
  E: EYE_GLINT,
}
// 18w x 9h base. The far-left "tail" pixel is the rear; head/beak is on the right.
const PTERO_TPL_UP: string[] = [
  ".o..............o.",
  ".oMo..........oMo.",
  "..oMMo......oMMo..",
  "...oMMo....oMMo...",
  "....oMMooooMMo.oo.",
  ".....oDLLDDLooEoBo",
  ".....oDDDDDDLBBBo.",
  "......oMMDDLLBo...",
  ".......oooooo.....",
]
const PTERO_TPL_DOWN: string[] = [
  "..................",
  "..................",
  ".o..............o.",
  ".oMo..........oMo.",
  ".oMMooooooooooMMoo",
  ".oMLLDDLLDDLLDLEoB",
  "..oMDDDDDDDDDDLBBo",
  "...oooMMDDLLBBBoo.",
  "......ooooooooo...",
]
function makePterodactylFrame(frame: 0 | 1, scale: number): HTMLCanvasElement {
  return makeTemplateSprite(frame === 0 ? PTERO_TPL_UP : PTERO_TPL_DOWN, PTERO_PALETTE, scale)
}

// ─── Triceratops sprite (4-frame walk cycle) ─────────────────────────────────
// Right-facing. Chunky black outline + 3 orange-brown shades + cream horn + belly.
const TRIC_PALETTE: Record<string, string> = {
  o: TRIC_OUTLINE,
  D: TRIC_DARK,
  M: TRIC_MID,
  L: TRIC_LIGHT,
  B: TRIC_BELLY,
  F: TRIC_DARK,   // frill (uses dark shade for that "bony plate" look)
  H: TRIC_HORN,
  h: TRIC_HORN_DK,
  E: EYE_GLINT,
}
// Base 30w x 17h. Head + frill + horns occupy the right third; tail on the left.
const TRIC_TORSO: string[] = [
  "..........................oo..",
  "..........................oHo.",
  "......oooooooo............oHo.",
  ".....oDDDDDDDDoo.........oHHo.",
  "....oDFFFFFFFFFDoooooooooFFo..",
  "....oDFFFFFFFFFFDDDDDDDDDFFo..",
  "....oDMMMMMMMFFFFMMMMMMMMFFo..",
  "....oMLLLLLLLLFFFLLLLLLLLMFFo.",
  "....oMLBBLLLLLLLLLLLLLLLLLLFo.",
  "....oMLBBLLLLLLLLLLLLLLLLLLEoh",
  "....oMLLLLLLLLLLLLLLLLLLLLLMhh",
  "....oMMLLLLLLLLLLLLLLLLLLLLMhh",
  ".....oDMMMMMMMMMMMMMMMMMMMMMo.",
  ".....oooMMM.MMM..MMM.MMMoooo..",
  "........???.???..???.???......",
  "........???.???..???.???......",
  "........???.???..???.???......",
]
// Leg-pose chars: 'M' = filled leg pixel (rendered with TRIC_DARK in a second pass),
// '.' = transparent. Top of the leg is row 0, foot is row 2.
const LEG_POSES = {
  raised: ["MMM", "M.M", "M.M"],
  planted: ["MMM", "M.M", "MMM"],
} as const
function makeTriceratopsFrame(frame: 0 | 1 | 2 | 3, scale: number): HTMLCanvasElement {
  const template = TRIC_TORSO.map(row => row)
  const lifted: [boolean, boolean, boolean, boolean] =
    frame === 0 ? [false, true, true, false]
    : frame === 2 ? [true, false, false, true]
    : [false, false, false, false]
  const LEG_COLS = [8, 12, 17, 21]
  const LEG_TOP_ROW = 14
  for (let leg = 0; leg < 4; leg++) {
    const pose = lifted[leg] ? LEG_POSES.raised : LEG_POSES.planted
    const col = LEG_COLS[leg]
    for (let r = 0; r < 3; r++) {
      const targetRow = LEG_TOP_ROW + r
      const before = template[targetRow].slice(0, col)
      const after = template[targetRow].slice(col + 3)
      template[targetRow] = before + pose[r] + after
    }
  }
  const canvas = makeTemplateSprite(template, TRIC_PALETTE, scale)
  const ctx = canvas.getContext("2d")!
  ctx.imageSmoothingEnabled = false
  // Second pass — paint legs in TRIC_DARK so they read as shadowed against the body.
  for (let leg = 0; leg < 4; leg++) {
    const col = LEG_COLS[leg]
    const pose = lifted[leg] ? LEG_POSES.raised : LEG_POSES.planted
    for (let r = 0; r < 3; r++) {
      const ch = pose[r]
      for (let i = 0; i < ch.length; i++) {
        if (ch[i] === "M") {
          ctx.fillStyle = TRIC_DARK
          ctx.fillRect((col + i) * scale, (LEG_TOP_ROW + r) * scale, scale, scale)
        }
      }
    }
  }
  return canvas
}

// ─── Brachiosaurus body sprite (static — neck is drawn per-frame) ───────────
// Right-facing. Chunky black outline + 3 green shades + bright belly spots.
// Body is partially submerged → legs are short stubs at the bottom; the river overlay
// covers the lower portion at draw time.
const BRACHIO_PALETTE: Record<string, string> = {
  o: BRACHIO_OUTLINE,
  D: BRACHIO_DARK,
  M: BRACHIO_MID,
  L: BRACHIO_LIGHT,
  B: BRACHIO_BELLY,
}
// Base 38w x 17h. Neck attaches at the top-right "shoulder bump" (cols 33-34, rows 0-3).
const BRACHIO_BODY_TPL: string[] = [
  ".................................oo..",
  "................................oMMo.",
  "................................oMMo.",
  "................................oMMo.",
  ".......ooooooooooooooooooooooooooMMo.",
  "......oDDDDDDDDDDDDDDDDDDDDDDDDDDDMo.",
  ".....oDDMMMMMMMMMMMMMMMMMMMMMMMMMMMo.",
  "....oDDMLLLLLLLLLLLLLLLLLLLLLLLLLLLMo",
  "...oDMLLLLLLLLLLLLLLLLLLLLLLLLLLLLLMo",
  "..oDMLBBBLLLLLBBBLLLLLBBBLLLLLLLLLLMo",
  "..oDMLBBBLLLLLBBBLLLLLBBBLLLLLLLLLLMo",
  "..oDMMLLLLLLLLLLLLLLLLLLLLLLLLLLLLMMo",
  "...oDDMMMMMMMMMMMMMMMMMMMMMMMMMMMMMo.",
  "....ooooMMM.MMM........MMM.MMMoooo...",
  "........oo..oo..........oo..oo.......",
  "........o....o..........o....o.......",
  "........oooooo..........oooooo.......",
]
function makeBrachioBody(scale: number): HTMLCanvasElement {
  return makeTemplateSprite(BRACHIO_BODY_TPL, BRACHIO_PALETTE, scale)
}

// Brachio neck + head drawn each frame because the neck bend angle changes.
// Three-pass rendering: outline (thickness+2 in BRACHIO_OUTLINE), fill (BRACHIO_MID),
// then a 1px upper-edge highlight (BRACHIO_LIGHT).
function drawBrachioNeck(
  ctx: CanvasRenderingContext2D,
  shoulderX: number,
  shoulderY: number,
  scale: number,
  cyclePhase: number  // 0..1
) {
  const ANGLE_UP = -Math.PI / 2 + 0.10
  const ANGLE_DOWN = Math.PI * 0.20
  let baseAngle = ANGLE_UP
  let drinkBob = 0
  if (cyclePhase < 0.30) baseAngle = ANGLE_UP
  else if (cyclePhase < 0.42) {
    const t = (cyclePhase - 0.30) / 0.12
    baseAngle = ANGLE_UP + (ANGLE_DOWN - ANGLE_UP) * t
  } else if (cyclePhase < 0.58) {
    baseAngle = ANGLE_DOWN
    drinkBob = Math.sin((cyclePhase - 0.42) / 0.16 * Math.PI * 3) * 0.4 * scale
  } else if (cyclePhase < 0.70) {
    const t = (cyclePhase - 0.58) / 0.12
    baseAngle = ANGLE_DOWN + (ANGLE_UP - ANGLE_DOWN) * t
  }

  const SEGMENTS = 6
  const segLen = 4.5 * scale
  const downness = Math.max(0, Math.min(1, (baseAngle - ANGLE_UP) / (ANGLE_DOWN - ANGLE_UP)))
  const segDelta = -0.08 + downness * 0.18
  let cx = shoulderX, cy = shoulderY, angle = baseAngle
  const points: [number, number][] = [[cx, cy]]
  for (let i = 0; i < SEGMENTS; i++) {
    angle += segDelta * 0.4
    cx += Math.cos(angle) * segLen
    cy += Math.sin(angle) * segLen
    points.push([cx, cy])
  }
  const [headX, headY] = points[points.length - 1]

  // Neck thickness tapers from shoulder to head.
  const thickness = (i: number) => Math.max(2, Math.round((2.0 - i * 0.13) * scale))
  // Pass 1 — outline
  ctx.fillStyle = BRACHIO_OUTLINE
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i], [x2, y2] = points[i + 1]
    const steps = Math.max(2, Math.ceil(Math.hypot(x2 - x1, y2 - y1)))
    const th = thickness(i) + 2
    for (let s = 0; s <= steps; s++) {
      const px = Math.round(x1 + (x2 - x1) * (s / steps))
      const py = Math.round(y1 + (y2 - y1) * (s / steps))
      ctx.fillRect(px - Math.floor(th / 2), py - Math.floor(th / 2), th, th)
    }
  }
  // Pass 2 — fill
  ctx.fillStyle = BRACHIO_MID
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i], [x2, y2] = points[i + 1]
    const steps = Math.max(2, Math.ceil(Math.hypot(x2 - x1, y2 - y1)))
    const th = thickness(i)
    for (let s = 0; s <= steps; s++) {
      const px = Math.round(x1 + (x2 - x1) * (s / steps))
      const py = Math.round(y1 + (y2 - y1) * (s / steps))
      ctx.fillRect(px - Math.floor(th / 2), py - Math.floor(th / 2), th, th)
    }
  }
  // Pass 3 — 1px highlight along upper edge
  ctx.fillStyle = BRACHIO_LIGHT
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i], [x2, y2] = points[i + 1]
    const steps = Math.max(2, Math.ceil(Math.hypot(x2 - x1, y2 - y1)))
    const th = thickness(i)
    for (let s = 0; s <= steps; s++) {
      const px = Math.round(x1 + (x2 - x1) * (s / steps))
      const py = Math.round(y1 + (y2 - y1) * (s / steps))
      ctx.fillRect(px - Math.floor(th / 2), py - Math.floor(th / 2), 1, Math.max(1, Math.floor(th / 2)))
    }
  }

  // Head — chunky outlined oval with cream snout, dark pupil, white glint.
  const headAngle = angle + 0.15
  const hx = headX + Math.cos(headAngle) * scale * 1.6
  const hy = headY + Math.sin(headAngle) * scale * 1.6 + drinkBob
  const hrx = scale * 2.2, hry = scale * 1.6
  pixelEllipse(ctx, hx, hy, hrx + 1, hry + 1, BRACHIO_OUTLINE)
  pixelEllipse(ctx, hx, hy, hrx, hry, BRACHIO_MID)
  pixelEllipse(ctx, hx - scale * 0.3, hy - scale * 0.5, hrx * 0.8, hry * 0.5, BRACHIO_LIGHT)
  pixelEllipse(ctx, hx + scale * 1.0, hy + scale * 0.4, scale * 0.9, scale * 0.6, BRACHIO_BELLY)
  ctx.fillStyle = BRACHIO_OUTLINE
  ctx.fillRect(Math.round(hx + scale * 0.7), Math.round(hy + scale * 0.5), Math.max(1, Math.round(scale * 1.2)), Math.max(1, Math.round(scale * 0.25)))
  ctx.fillRect(Math.round(hx + scale * 0.3), Math.round(hy - scale * 0.4), Math.max(1, Math.round(scale * 0.7)), Math.max(1, Math.round(scale * 0.7)))
  ctx.fillStyle = EYE_GLINT
  ctx.fillRect(Math.round(hx + scale * 0.5), Math.round(hy - scale * 0.3), Math.max(1, Math.round(scale * 0.3)), Math.max(1, Math.round(scale * 0.3)))
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

  // Base ground / pedestal (wider than monument)
  px(2, 43, 80, 5, "#3A2E20")
  px(0, 45, 84, 3, "#241B12")

  // Pedestal slab
  px(6, 39, 72, 5, STONE_SHADOW)
  px(6, 38, 72, 1, STONE_BASE)
  px(6, 36, 72, 2, STONE_BASE)
  px(5, 39, 1, 5, STONE_SHADOW)
  px(78, 39, 1, 5, STONE_SHADOW)

  // Main monument block — chiselled trapezoid
  // Outer silhouette
  const monL = 10, monR = 74, monTop = 6, monBot = 36
  // Fill base
  px(monL, monTop + 2, monR - monL, monBot - monTop - 2, STONE_BASE)
  // Slope-top: chip away corners
  px(monL, monTop, 2, 2, STONE_SHADOW)
  px(monR - 2, monTop, 2, 2, STONE_SHADOW)
  px(monL + 2, monTop, monR - monL - 4, 2, STONE_BASE)
  // Highlight on top edge (sun-lit)
  px(monL + 2, monTop, monR - monL - 4, 1, STONE_HILITE)
  px(monL + 1, monTop + 1, 1, 1, STONE_HILITE)
  px(monR - 2, monTop + 1, 1, 1, STONE_HILITE)
  // Highlight on left edge
  px(monL, monTop + 2, 1, monBot - monTop - 2, STONE_HILITE)
  // Shadow on right edge
  px(monR - 1, monTop + 2, 1, monBot - monTop - 2, STONE_SHADOW)
  // Shadow on bottom edge
  px(monL, monBot - 1, monR - monL, 1, STONE_SHADOW)

  // Weathering: cracks
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
  // Moss patches (mostly on the left side and bottom)
  const mossPatches: [number, number, number, number][] = [
    [monL + 1, monBot - 4, 3, 2],
    [monL + 6, monBot - 3, 5, 2],
    [monL + 18, monBot - 2, 7, 2],
    [monL + 3, monBot - 9, 2, 2],
    [monR - 10, monBot - 3, 6, 2],
    [monR - 4, monBot - 7, 2, 3],
  ]
  for (const [mx, my, mw, mh] of mossPatches) {
    px(mx, my, mw, mh, STONE_MOSS)
  }

  // Carved "SC PRINTS" via text rasterization onto an offscreen canvas.
  // Sample at 1px-per-pixel of the design grid, then bake into the monument.
  const TEXT = "SC PRINTS"
  const tcanvas = document.createElement("canvas")
  tcanvas.width = 200; tcanvas.height = 24
  const tctx = tcanvas.getContext("2d")!
  tctx.imageSmoothingEnabled = false
  // Use a bold sans font — the pixel grid will chunk it appropriately.
  tctx.fillStyle = "#FFFFFF"
  tctx.font = "bold 10px monospace"
  tctx.textBaseline = "top"
  tctx.textAlign = "left"
  const metrics = tctx.measureText(TEXT)
  const textW = Math.min(200, Math.ceil(metrics.width))
  const textH = 10
  // Center the text in its sample area
  tctx.fillText(TEXT, 0, 0)
  const data = tctx.getImageData(0, 0, textW, textH).data

  // Place text within the monument, centered horizontally, slightly above center vertically.
  const monW = monR - monL
  const monH = monBot - monTop
  // Compute design-grid offset so text fits comfortably within an inset frame.
  const insetX = 4, insetY = 10
  const availW = monW - insetX * 2
  const availH = monH - insetY - 8
  // We render the text 1:1 from the sample (no scaling) — chunky pixel font.
  const tx0 = monL + insetX + Math.floor((availW - textW) / 2)
  const ty0 = monTop + insetY + Math.floor((availH - textH) / 2)
  for (let y = 0; y < textH; y++) {
    for (let x = 0; x < textW; x++) {
      if (data[(y * textW + x) * 4 + 3] > 80) {
        // Recessed pixel — darker than the surrounding stone.
        px(tx0 + x, ty0 + y, 1, 1, STONE_CARVE)
        // 1px highlight on the top edge of each carved pixel to give a chiselled look.
        // Only if the pixel above this one was not also carved.
        if (y === 0 || data[((y - 1) * textW + x) * 4 + 3] <= 80) {
          px(tx0 + x, ty0 + y - 1, 1, 1, STONE_CARVE_HILITE)
        }
      }
    }
  }
  return c
}

// ─── Backdrop painter (sky, mountains, canopy, cliff, monument, river base) ──
function paintBackdrop(canvas: HTMLCanvasElement, w: number, h: number, dpr: number, monumentSprite: HTMLCanvasElement | null) {
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr)
  canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
  const ctx = canvas.getContext("2d")!
  ctx.imageSmoothingEnabled = false
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const riverY = Math.floor(h * 0.62)
  const skyTopRgb = hexToRgb(SKY_TOP)
  const skyMidRgb = hexToRgb(SKY_MID)
  const skyHorizonRgb = hexToRgb(SKY_HORIZON)

  // Sky gradient — chunky bands of ~3px each so it stays pixelly.
  const BAND = 3
  for (let y = 0; y < riverY; y += BAND) {
    const t = y / Math.max(1, riverY - 1)
    let color: string
    if (t < 0.5) color = lerpRgb(skyTopRgb, skyMidRgb, t / 0.5)
    else color = lerpRgb(skyMidRgb, skyHorizonRgb, (t - 0.5) / 0.5)
    ctx.fillStyle = color
    ctx.fillRect(0, y, w, BAND)
  }

  // Far mountains — softer / lighter
  drawMountainLayer(ctx, w, riverY, riverY - Math.floor(h * 0.08), Math.floor(h * 0.18), MOUNTAIN_FAR, 1733)
  // Near mountains — darker, closer to horizon
  drawMountainLayer(ctx, w, riverY, riverY - Math.floor(h * 0.04), Math.floor(h * 0.13), MOUNTAIN_NEAR, 9421)

  // Jungle canopy silhouette — lumpy treeline below the mountains, behind the cliff
  drawCanopy(ctx, w, h, riverY)

  // Cliff face & waterfall slot — central
  drawCliff(ctx, w, h, riverY)

  // River base teal
  ctx.fillStyle = WATER_DEEP
  ctx.fillRect(0, riverY, w, h - riverY)
  // River gradient bands toward the bottom (subtle, 2-3 colour stops)
  const waterMidRgb = hexToRgb(WATER_MID)
  const waterDeepRgb = hexToRgb(WATER_DEEP)
  for (let y = riverY; y < h; y += 2) {
    const t = (y - riverY) / Math.max(1, h - riverY - 1)
    const eased = t * 0.8
    ctx.fillStyle = lerpRgb(waterMidRgb, waterDeepRgb, 1 - eased)
    ctx.fillRect(0, y, w, 2)
  }

  // Sandy riverbank — chunky 3px tan/wet-sand band at the top of the river, with a soft
  // foam pixel-line on top so the sand reads as "wet sand under the water surface".
  const SAND_BASE = "#D4B886"
  const SAND_LITE = "#E6CDA5"
  const SAND_SHADOW = "#9C7E4F"
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
  // Riverbank foreground rocks (right side, foreground)
  drawForegroundRocks(ctx, w, h, riverY)

  // Foreground palms — lush silhouettes along the left and right edges, in front
  // of the canopy and behind the monument so the depth reads correctly.
  drawPalmsCluster(ctx, w, h)

  // Monument — placed on the right riverbank in the foreground
  if (monumentSprite) {
    const mw = monumentSprite.width
    const mh = monumentSprite.height
    // Center horizontally on right ~85% of width, but clamp so the monument never
    // overflows the right edge on narrow viewports.
    const targetCenter = w * 0.82
    const halfW = mw / 2
    const mxRaw = targetCenter - halfW
    const mx = Math.round(Math.min(Math.max(mxRaw, 4), w - mw - 4))
    const my = Math.round(h - mh - 4)
    ctx.drawImage(monumentSprite, mx, my)
  }
}

function drawMountainLayer(
  ctx: CanvasRenderingContext2D, w: number, riverY: number, baseY: number, maxHeight: number,
  color: string, seed: number
) {
  const rng = mulberry32(seed)
  // Build a ridge as a coarse sampled array, then fill below it.
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
  // Soft horizon haze underneath the ridge
  ctx.fillStyle = `${color}88`
  for (let x = 0; x < w; x++) {
    const fi = (x / w) * (samples - 1)
    const y = Math.floor(ridge[Math.floor(fi)])
    ctx.fillRect(x, y - 1, 1, 1)
  }
}

function drawCanopy(ctx: CanvasRenderingContext2D, w: number, h: number, riverY: number) {
  // Lumpy dark-green skyline. Two passes — back (darker) and a foreground accent.
  const baseY = riverY
  const canopyTopBaseY = Math.floor(riverY - h * 0.08)
  const rng = mulberry32(31337)
  // Pass 1 — broad canopy fill
  ctx.fillStyle = CANOPY_DARK
  for (let x = 0; x < w; x++) {
    const t = x / w
    const lump =
      Math.sin(t * 14 + 1.3) * 0.55 +
      Math.sin(t * 31 + 0.7) * 0.30 +
      Math.sin(t * 53 + 2.1) * 0.15
    const noise = (rng() - 0.5) * 0.3
    const top = Math.floor(canopyTopBaseY - lump * h * 0.04 - noise * h * 0.02)
    ctx.fillRect(x, top, 1, baseY - top)
  }
  // Pass 2 — sparse highlight bumps (CANOPY_MID and CANOPY_HILITE)
  const rng2 = mulberry32(31338)
  ctx.fillStyle = CANOPY_MID
  for (let i = 0; i < Math.floor(w / 18); i++) {
    const bx = rng2() * w
    const by = canopyTopBaseY - rng2() * h * 0.03
    const r = 2 + rng2() * 3
    pixelDisc(ctx, bx, by, r, CANOPY_MID)
  }
  for (let i = 0; i < Math.floor(w / 36); i++) {
    const bx = rng2() * w
    const by = canopyTopBaseY - rng2() * h * 0.02
    pixelDisc(ctx, bx, by, 1.4, CANOPY_HILITE)
  }
}

function drawCliff(ctx: CanvasRenderingContext2D, w: number, h: number, riverY: number) {
  const cliffTopY = Math.floor(h * 0.08)
  const cliffBotY = riverY
  const cliffWidth = Math.floor(w * 0.42)
  const cliffX = Math.floor(w * 0.55 - cliffWidth / 2)
  const slotW = Math.max(8, Math.floor(cliffWidth * 0.16))
  const slotX = cliffX + Math.floor(cliffWidth / 2) - Math.floor(slotW / 2)

  // Sky-side: the cliff doesn't fill a clean rectangle — it juts up with a ragged top edge.
  // We'll compute a top edge with two ridges (left of slot and right of slot).
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

  // Fill cliff mass
  ctx.fillStyle = CLIFF_BASE
  for (let x = cliffX; x < slotX; x++) {
    const yTop = leftEdge[x - cliffX]
    ctx.fillRect(x, yTop, 1, cliffBotY - yTop)
  }
  for (let x = slotX + slotW; x <= cliffX + cliffWidth; x++) {
    const yTop = rightEdge[x - (slotX + slotW)]
    ctx.fillRect(x, yTop, 1, cliffBotY - yTop)
  }

  // Slot (recessed) — darker stone in the gap
  ctx.fillStyle = CLIFF_SHADOW
  ctx.fillRect(slotX, cliffTopY + 2, slotW, cliffBotY - cliffTopY - 2)
  // Slot walls — 1px highlight on the left, 1px shadow on the right
  ctx.fillStyle = CLIFF_HILITE
  ctx.fillRect(slotX, cliffTopY + 2, 1, cliffBotY - cliffTopY - 2)
  ctx.fillStyle = CLIFF_CRACK
  ctx.fillRect(slotX + slotW - 1, cliffTopY + 2, 1, cliffBotY - cliffTopY - 2)

  // Texture: vertical cracks + horizontal striations
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

  // Sun-lit top edge on the left ridge
  ctx.fillStyle = CLIFF_HILITE
  for (let x = cliffX; x < slotX; x++) {
    ctx.fillRect(x, leftEdge[x - cliffX], 1, 1)
  }
  ctx.fillStyle = CLIFF_SHADOW
  for (let x = slotX + slotW; x <= cliffX + cliffWidth; x++) {
    ctx.fillRect(x, rightEdge[x - (slotX + slotW)], 1, 1)
  }
}

function drawForegroundRocks(ctx: CanvasRenderingContext2D, w: number, h: number, riverY: number) {
  // A few rocks scattered along the riverbank edge (foreground)
  const rng = mulberry32(7777)
  const rockY = h - 6
  for (let i = 0; i < Math.floor(w / 80); i++) {
    const rx = rng() * w
    const rw = 6 + rng() * 10
    const rh = 3 + rng() * 4
    pixelEllipse(ctx, rx, rockY, rw, rh, "#4A403A")
    pixelEllipse(ctx, rx - 1, rockY - 1, rw - 2, rh - 1, "#6A5F58")
    // tiny moss
    if (rng() > 0.5) {
      ctx.fillStyle = STONE_MOSS
      ctx.fillRect(Math.round(rx - 2), Math.round(rockY - rh + 1), 3, 1)
    }
  }
}

// ─── Palm trees (map-inspired foreground silhouettes) ────────────────────────
const PALM_OUTLINE = "#0F1A0C"
const PALM_TRUNK = "#3A2A1A"
const PALM_TRUNK_LITE = "#5A4232"
const PALM_FROND_DARK = "#1F3318"
const PALM_FROND_MID = "#3A6028"
const PALM_FROND_LITE = "#5C8A3F"

function drawPalmTree(
  ctx: CanvasRenderingContext2D, baseX: number, baseY: number, scale: number, seed: number, flipped: boolean
) {
  const rng = mulberry32(seed)
  const trunkW = Math.max(2, Math.round(scale * 1.2))
  const trunkH = Math.round(scale * (10 + rng() * 5))
  const trunkLean = Math.round((rng() - 0.5) * scale * 1.5)
  const topX = baseX + trunkLean
  const topY = baseY - trunkH
  ctx.fillStyle = PALM_OUTLINE
  for (let y = 0; y < trunkH; y++) {
    const lean = Math.round((trunkLean * y) / Math.max(1, trunkH))
    ctx.fillRect(baseX + lean - Math.floor(trunkW / 2) - 1, baseY - trunkH + y, trunkW + 2, 1)
  }
  ctx.fillStyle = PALM_TRUNK
  for (let y = 0; y < trunkH; y++) {
    const lean = Math.round((trunkLean * y) / Math.max(1, trunkH))
    ctx.fillRect(baseX + lean - Math.floor(trunkW / 2), baseY - trunkH + y, trunkW, 1)
  }
  // Trunk segment stripes (cocoa-bark texture)
  ctx.fillStyle = PALM_TRUNK_LITE
  for (let y = 2; y < trunkH; y += 3) {
    const lean = Math.round((trunkLean * y) / Math.max(1, trunkH))
    ctx.fillRect(baseX + lean - Math.floor(trunkW / 2), baseY - trunkH + y, trunkW, 1)
  }
  // Crown — 6 fronds at staggered angles, drooping at the tips
  const FRONDS = 6
  const baseLen = scale * (4.5 + rng() * 1.5)
  for (let i = 0; i < FRONDS; i++) {
    const baseAngle = -Math.PI + (i + 0.5) * (Math.PI / FRONDS)
    const angle = flipped ? -Math.PI - (baseAngle + Math.PI) : baseAngle
    const len = baseLen * (0.7 + rng() * 0.6)
    const droop = scale * (1.5 + rng() * 1)
    const segs = Math.max(4, Math.round(len * 1.3))
    for (let s = 0; s <= segs; s++) {
      const t = s / segs
      const fx = topX + Math.cos(angle) * t * len
      const fy = topY + Math.sin(angle) * t * len + droop * t * t
      const px = Math.round(fx), py = Math.round(fy)
      ctx.fillStyle = PALM_OUTLINE
      ctx.fillRect(px - 1, py - 1, 3, 3)
      ctx.fillStyle = t < 0.35 ? PALM_FROND_LITE : t < 0.75 ? PALM_FROND_MID : PALM_FROND_DARK
      ctx.fillRect(px, py, 1, 1)
      if (s > 0 && s % 3 === 0 && t < 0.6) {
        ctx.fillStyle = PALM_FROND_LITE
        ctx.fillRect(px, py - 1, 1, 1)
      }
    }
  }
}

function drawPalmsCluster(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const rng = mulberry32(98765)
  const baseY = h - 4
  const leftCount = 2 + Math.floor(rng() * 2)
  for (let i = 0; i < leftCount; i++) {
    const px = Math.floor(rng() * (w * 0.18)) + Math.floor(w * 0.02) + i * 14
    const scale = 1.5 + rng() * 1.5
    drawPalmTree(ctx, px, baseY - Math.floor(rng() * 4), scale, 1000 + i * 31, false)
  }
  const rightCount = 2 + Math.floor(rng() * 2)
  for (let i = 0; i < rightCount; i++) {
    const px = Math.floor(w * 0.88) + Math.floor(rng() * (w * 0.10)) - i * 14
    const scale = 1.5 + rng() * 1.5
    drawPalmTree(ctx, px, baseY - Math.floor(rng() * 4), scale, 2000 + i * 47, true)
  }
}

// ─── Per-frame animated overlays ─────────────────────────────────────────────
function drawWaterfall(
  ctx: CanvasRenderingContext2D, w: number, h: number, riverY: number,
  scrollMs: number
) {
  // Compute the slot the cliff exposed
  const cliffTopY = Math.floor(h * 0.08)
  const cliffWidth = Math.floor(w * 0.42)
  const cliffX = Math.floor(w * 0.55 - cliffWidth / 2)
  const slotW = Math.max(8, Math.floor(cliffWidth * 0.16))
  const slotX = cliffX + Math.floor(cliffWidth / 2) - Math.floor(slotW / 2)
  const fallTop = cliffTopY + 2
  const fallBot = riverY + 2  // overshoot slightly into the river

  // 3 vertical pixel "streams" scrolling at slightly different rates so the texture
  // never reads as a single tiled pattern.
  const streamCount = Math.max(3, Math.floor(slotW / 3))
  const scrollPeriod = 24
  for (let s = 0; s < streamCount; s++) {
    const t = s / Math.max(1, streamCount - 1)
    const streamX = slotX + 1 + Math.floor(t * (slotW - 2))
    const streamW = 1
    const rate = 0.18 + (s % 3) * 0.04
    const yOff = (scrollMs * rate) % scrollPeriod
    for (let y = fallTop; y < fallBot; y++) {
      const phase = ((y + yOff) % scrollPeriod) / scrollPeriod
      let color: string
      if (phase < 0.20) color = WATERFALL_LIGHT
      else if (phase < 0.45) color = WATERFALL_MID
      else if (phase < 0.75) color = WATERFALL_DEEP
      else color = WATERFALL_MID
      ctx.fillStyle = color
      ctx.fillRect(streamX, y, streamW, 1)
    }
  }
  // Foam pool at the base
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
  // Deterministic shimmer positions, toggled per frame
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

function drawBrachiosaurus(
  ctx: CanvasRenderingContext2D, state: BrachioState, body: HTMLCanvasElement, riverY: number
) {
  const { x, y, scale } = state
  const cyclePhase = (state.cycleMs / 10000) % 1
  const bw = body.width, bh = body.height
  // Body is 38x17 design pixels. Waterline sits at row 12 of 17.
  const WATERLINE_ROW = 12, BODY_ROWS = 17
  const NECK_ATTACH_COL = 33.5, BODY_COLS = 38, NECK_ATTACH_ROW = 1
  const drawX = Math.round(x - bw / 2)
  const drawY = Math.round(y - bh * (WATERLINE_ROW / BODY_ROWS))
  ctx.imageSmoothingEnabled = false
  // Render the neck BEHIND the body so the shoulder bump occludes the neck base cleanly.
  const shoulderX = drawX + Math.round((NECK_ATTACH_COL / BODY_COLS) * bw)
  const shoulderY = drawY + Math.round((NECK_ATTACH_ROW / BODY_ROWS) * bh)
  drawBrachioNeck(ctx, shoulderX, shoulderY, scale, cyclePhase)
  ctx.drawImage(body, drawX, drawY)
  // Waterline wash — soft band of WATER_MID over the submerged portion of the body.
  ctx.save()
  ctx.globalAlpha = 0.55
  ctx.fillStyle = WATER_MID
  ctx.fillRect(drawX, riverY - 1, bw, bh - (riverY - drawY))
  ctx.restore()
}

function drawTriceratops(
  ctx: CanvasRenderingContext2D, state: TricState, sprites: HTMLCanvasElement[]
) {
  const sprite = sprites[state.frame]
  const sw = sprite.width, sh = sprite.height
  ctx.save()
  ctx.imageSmoothingEnabled = false
  if (state.dir === -1) {
    // Walking left → flip horizontally
    ctx.translate(Math.round(state.x), Math.round(state.baseY - sh))
    ctx.scale(-1, 1)
    ctx.drawImage(sprite, -sw, 0)
  } else {
    ctx.drawImage(sprite, Math.round(state.x - sw / 2), Math.round(state.baseY - sh))
  }
  ctx.restore()
}

function drawPterodactyl(
  ctx: CanvasRenderingContext2D, p: Pterodactyl, sprites: HTMLCanvasElement[]
) {
  const sprite = sprites[p.flapFrame]
  const sw = sprite.width, sh = sprite.height
  ctx.save()
  ctx.imageSmoothingEnabled = false
  if (p.flipped) {
    ctx.translate(Math.round(p.x + sw / 2), Math.round(p.y))
    ctx.scale(-1, 1)
    ctx.drawImage(sprite, -sw / 2, -sh / 2)
  } else {
    ctx.drawImage(sprite, Math.round(p.x - sw / 2), Math.round(p.y - sh / 2))
  }
  ctx.restore()
}

function spawnPterodactyl(w: number, h: number, scale: number): Pterodactyl {
  const fromRight = Math.random() > 0.5
  const baseY = rand(h * 0.10, h * 0.35)
  const speed = rand(0.06, 0.12)
  return {
    x: fromRight ? w + 40 : -40,
    y: baseY,
    baseY,
    vx: fromRight ? -speed : speed,
    phase: rand(0, Math.PI * 2),
    freq: rand(0.0008, 0.0015),
    amplitude: rand(h * 0.015, h * 0.04),
    flapMs: 0,
    flapFrame: 0,
    active: true,
    flipped: fromRight,
    scale,
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
  const pausedRef = useRef(false)
  const reducedMotionRef = useRef(false)
  const lastSizeRef = useRef<{ w: number; h: number; dpr: number }>({ w: 0, h: 0, dpr: 1 })

  const initScene = useCallback((h: number): SceneState => {
    const dinoScale = Math.max(2, Math.round(h / 110))
    const tricScale = Math.max(2, Math.round(h / 130))
    const pteroScale = Math.max(2, Math.round(h / 140))
    return {
      clouds: [],
      pterodactyls: [],
      nextPteroMs: rand(2000, 6000),
      mist: [],
      brachio: { x: 0, y: 0, scale: dinoScale, cycleMs: 0 },
      trics: [],
      brachioBodySprite: makeBrachioBody(dinoScale),
      tricSprites: [
        makeTriceratopsFrame(0, tricScale),
        makeTriceratopsFrame(1, tricScale),
        makeTriceratopsFrame(2, tricScale),
        makeTriceratopsFrame(3, tricScale),
      ],
      pteroSprites: [
        makePterodactylFrame(0, pteroScale),
        makePterodactylFrame(1, pteroScale),
      ],
      shimmerMs: 0,
      shimmerFrame: 0,
      waterfallMs: 0,
      cloudSprites: null,
      waterfallBaseX: 0,
      waterfallBaseY: 0,
      waterfallTopY: 0,
      waterfallSlotW: 0,
      riverY: 0,
    }
  }, [])

  const layoutScene = useCallback((state: SceneState, w: number, h: number) => {
    const riverY = Math.floor(h * 0.62)
    const cliffWidth = Math.floor(w * 0.42)
    const cliffX = Math.floor(w * 0.55 - cliffWidth / 2)
    const slotW = Math.max(8, Math.floor(cliffWidth * 0.16))
    const slotX = cliffX + Math.floor(cliffWidth / 2) - Math.floor(slotW / 2)
    state.riverY = riverY
    state.waterfallTopY = Math.floor(h * 0.08) + 2
    state.waterfallBaseX = slotX + slotW / 2
    state.waterfallBaseY = riverY + 2
    state.waterfallSlotW = slotW
    // Brachiosaurus position: left of the cliff, body slightly above the river.
    state.brachio.x = Math.floor(w * 0.27)
    state.brachio.y = riverY + 4
    // Triceratops patrol along the foreground bottom
    if (state.trics.length === 0) {
      const tricScale = state.tricSprites?.[0].height ?? 28
      state.trics.push({
        x: Math.floor(w * 0.62),
        baseY: h - 4,
        dir: 1,
        mode: "walk",
        modeMs: 0,
        stepMs: 0,
        frame: 0,
        patrolMinX: Math.floor(w * 0.50),
        patrolMaxX: Math.floor(w * 0.72),
        scale: tricScale,
      })
    } else {
      const t = state.trics[0]
      t.baseY = h - 4
      t.patrolMinX = Math.floor(w * 0.50)
      t.patrolMaxX = Math.floor(w * 0.72)
      t.x = Math.max(t.patrolMinX, Math.min(t.patrolMaxX, t.x))
    }
    // Clouds — populate initially
    if (state.clouds.length === 0) {
      const cloudCount = 3 + Math.floor(w / 600)
      const cloudBaseScale = Math.max(1, Math.round(h / 180))
      state.cloudSprites = [
        makeCloud(11, cloudBaseScale),
        makeCloud(23, cloudBaseScale),
        makeCloud(37, cloudBaseScale * 0.8),
        makeCloud(51, cloudBaseScale * 1.1),
        makeCloud(67, cloudBaseScale * 0.9),
      ]
      for (let i = 0; i < cloudCount; i++) {
        state.clouds.push({
          x: rand(0, w),
          y: rand(h * 0.05, h * 0.32),
          scale: rand(0.8, 1.3),
          speed: rand(0.005, 0.018),
          seed: i % (state.cloudSprites?.length ?? 1),
        })
      }
    }
  }, [])

  const runLoop = useCallback(() => {
    const backdrop = backdropRef.current
    const scene = sceneRef.current
    if (!backdrop || !scene) return
    const ctx = scene.getContext("2d")
    if (!ctx) return

    const resizeIfNeeded = () => {
      const parent = scene.parentElement
      const w = parent?.clientWidth ?? window.innerWidth
      const h = parent?.clientHeight ?? window.innerHeight
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const last = lastSizeRef.current
      if (w === last.w && h === last.h && dpr === last.dpr) return { w, h, dpr, changed: false }
      lastSizeRef.current = { w, h, dpr }
      scene.width = Math.round(w * dpr); scene.height = Math.round(h * dpr)
      scene.style.width = `${w}px`; scene.style.height = `${h}px`
      ctx.imageSmoothingEnabled = false
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const state = stateRef.current
      if (state) {
        // Rebuild sprites for the new height so they stay pixel-crisp at the new scale
        const newDinoScale = Math.max(2, Math.round(h / 110))
        const newTricScale = Math.max(2, Math.round(h / 130))
        const newPteroScale = Math.max(2, Math.round(h / 140))
        if (newDinoScale !== state.brachio.scale) {
          state.brachio.scale = newDinoScale
          state.brachioBodySprite = makeBrachioBody(newDinoScale)
        }
        state.tricSprites = [
          makeTriceratopsFrame(0, newTricScale),
          makeTriceratopsFrame(1, newTricScale),
          makeTriceratopsFrame(2, newTricScale),
          makeTriceratopsFrame(3, newTricScale),
        ]
        state.pteroSprites = [
          makePterodactylFrame(0, newPteroScale),
          makePterodactylFrame(1, newPteroScale),
        ]
        layoutScene(state, w, h)
        // Rebuild backdrop with a freshly-sized monument
        const monumentScale = Math.max(1, Math.round(h / 110))
        const monument = makeMonument(monumentScale)
        paintBackdrop(backdrop, w, h, dpr, monument)
      }
      return { w, h, dpr, changed: true }
    }

    let { w, h, dpr } = resizeIfNeeded()

    if (reducedMotionRef.current) {
      // Single static frame: draw the scene once and stop.
      drawAnimatedLayer(ctx, w, h, stateRef.current!, /*motionless*/ true, 0, 0, 0)
      return
    }

    let last = performance.now()
    const tick = (ts: number) => {
      if (pausedRef.current) { rafRef.current = requestAnimationFrame(tick); return }
      const delta = Math.min(ts - last, 50)
      last = ts

      const r = resizeIfNeeded()
      w = r.w; h = r.h; dpr = r.dpr

      const state = stateRef.current
      if (!state) return

      state.shimmerMs += delta
      if (state.shimmerMs >= 130) {
        state.shimmerMs = 0
        state.shimmerFrame = (state.shimmerFrame + 1) % 4
      }
      state.waterfallMs += delta
      state.brachio.cycleMs = (state.brachio.cycleMs + delta) % 10000

      // Clouds drift right (with wrap)
      for (const c of state.clouds) {
        c.x += c.speed * delta
        const sprite = state.cloudSprites?.[c.seed]
        const sw = (sprite?.width ?? 60) * c.scale
        if (c.x > w + sw) c.x = -sw
      }

      // Pterodactyl spawn timer
      state.nextPteroMs -= delta
      const activePtero = state.pterodactyls.filter(p => p.active).length
      if (state.nextPteroMs <= 0 && activePtero < 2) {
        state.pterodactyls.push(spawnPterodactyl(w, h, Math.max(2, Math.round(h / 140))))
        state.nextPteroMs = rand(8000, 15000)
      } else if (state.nextPteroMs <= 0) {
        state.nextPteroMs = rand(3000, 6000)
      }
      // Update + cull pterodactyls
      for (const p of state.pterodactyls) {
        if (!p.active) continue
        p.x += p.vx * delta
        p.y = p.baseY + Math.sin(state.waterfallMs * p.freq + p.phase) * p.amplitude
        p.flapMs += delta
        if (p.flapMs > 150) { p.flapMs = 0; p.flapFrame = p.flapFrame === 0 ? 1 : 0 }
        const margin = (state.pteroSprites?.[0].width ?? 40) + 30
        if (p.x < -margin || p.x > w + margin) p.active = false
      }
      // Free up references to inactive pterodactyls (cap at 6 stored)
      state.pterodactyls = state.pterodactyls.filter(p => p.active).slice(0, 6)

      // Triceratops state machine
      const tric = state.trics[0]
      if (tric) {
        tric.modeMs += delta
        if (tric.mode === "walk") {
          tric.x += tric.dir * 0.05 * delta
          tric.stepMs += delta
          if (tric.stepMs > 150) { tric.stepMs = 0; tric.frame = ((tric.frame + 1) % 4) as 0 | 1 | 2 | 3 }
          if (tric.x >= tric.patrolMaxX || tric.x <= tric.patrolMinX) {
            tric.mode = "pause"; tric.modeMs = 0
          } else if (tric.modeMs > 4500) {
            tric.mode = "pause"; tric.modeMs = 0
          }
        } else {
          tric.frame = 1
          if (tric.modeMs > 2000) {
            tric.mode = "walk"; tric.modeMs = 0
            tric.dir = (tric.x >= tric.patrolMaxX ? -1 : tric.x <= tric.patrolMinX ? 1 : (tric.dir === 1 ? -1 : 1))
          }
        }
      }

      // Mist particles — spawn 0-2 per frame at base of waterfall
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

      drawAnimatedLayer(ctx, w, h, state, false, delta, state.waterfallMs, state.shimmerFrame)

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [layoutScene])

  useEffect(() => {
    const backdrop = backdropRef.current
    const scene = sceneRef.current
    if (!backdrop || !scene) return

    // Respect reduced motion
    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
      reducedMotionRef.current = mq.matches
    }

    // Initial size
    const parent = scene.parentElement
    const w = parent?.clientWidth ?? window.innerWidth
    const h = parent?.clientHeight ?? window.innerHeight
    stateRef.current = initScene(h)
    layoutScene(stateRef.current, w, h)

    const observer = new IntersectionObserver(
      ([entry]) => { pausedRef.current = !entry.isIntersecting },
      { threshold: 0 }
    )
    observer.observe(scene)

    runLoop()

    return () => {
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

// ─── Per-tick draw — everything that moves ───────────────────────────────────
function drawAnimatedLayer(
  ctx: CanvasRenderingContext2D, w: number, h: number, state: SceneState,
  motionless: boolean, _delta: number, waterfallMs: number, shimmerFrame: number
) {
  ctx.clearRect(0, 0, w, h)
  ctx.imageSmoothingEnabled = false

  // Clouds (background of moving layer)
  if (state.cloudSprites) {
    for (const c of state.clouds) {
      const sprite = state.cloudSprites[c.seed]
      if (!sprite) continue
      const sw = sprite.width * c.scale, sh = sprite.height * c.scale
      ctx.drawImage(sprite, Math.round(c.x), Math.round(c.y), sw, sh)
    }
  }

  // Waterfall water (centred slot)
  drawWaterfall(ctx, w, h, state.riverY, motionless ? 600 : waterfallMs)

  // River shimmer overlay
  drawRiverShimmer(ctx, w, h, state.riverY, shimmerFrame)

  // Brachiosaurus
  if (state.brachioBodySprite) {
    drawBrachiosaurus(ctx, state.brachio, state.brachioBodySprite, state.riverY)
  }

  // Triceratops (foreground)
  if (state.tricSprites && state.trics[0]) {
    drawTriceratops(ctx, state.trics[0], state.tricSprites)
  }

  // Pterodactyls (sky)
  if (state.pteroSprites) {
    for (const p of state.pterodactyls) {
      if (!p.active) continue
      drawPterodactyl(ctx, p, state.pteroSprites)
    }
  }

  // Mist particles (above the water at base of fall)
  for (const m of state.mist) {
    const lifeT = m.life / m.maxLife
    const alpha = Math.max(0, Math.min(1, lifeT)) * 0.7
    ctx.fillStyle = `rgba(224, 242, 244, ${alpha})`
    ctx.fillRect(Math.round(m.x), Math.round(m.y), m.size, m.size)
  }
}
