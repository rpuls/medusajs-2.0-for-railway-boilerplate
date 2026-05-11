/** Minimal shape needed by the layout solver — just an id to seed pseudo-random positions. */
type BrandTileLike = { id: string }

/** Effective tile footprint used by the solver (visual logos are lighter than full square boxes). */
const TILE_PX = 112
/** Minimum gap between tile centers (higher = more spread, too high causes bunching). */
const MIN_GAP_PX = 30
/** Keep tiles away from ring edges */
const EDGE_PADDING_PX = 12

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function rand01(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 10000
  return x - Math.floor(x)
}

/** Angles near this point (screen “up” / toward the headline) stay clearer for text */
const EXCLUDED_APEX = -Math.PI / 2
/** Wider wedge so fewer tiles drift toward the copy above the ring */
const EXCLUDED_HALF_WIDTH = 1.02

function angleInExcludedTop(angle: number): boolean {
  let d = angle - EXCLUDED_APEX
  while (d > Math.PI) d -= 2 * Math.PI
  while (d < -Math.PI) d += 2 * Math.PI
  return Math.abs(d) < EXCLUDED_HALF_WIDTH
}

function nudgeAngleOutOfExclusion(angle: number): number {
  let d = angle - EXCLUDED_APEX
  while (d > Math.PI) d -= 2 * Math.PI
  while (d < -Math.PI) d += 2 * Math.PI
  if (Math.abs(d) >= EXCLUDED_HALF_WIDTH) {
    return angle
  }
  // Nearest rim of the cleared “top” sector (keeps tiles off the headline)
  return EXCLUDED_APEX + (d >= 0 ? EXCLUDED_HALF_WIDTH + 0.06 : -EXCLUDED_HALF_WIDTH - 0.06)
}

/**
 * Irregular, deterministic positions on an annulus: random-looking spacing, no overlaps,
 * inner hole keeps tiles off the headline; relaxation pushes tiles apart.
 */
export function computeTilePositions(
  tiles: BrandTileLike[],
  ringEl: HTMLElement
): { x: number; y: number }[] {
  const w = ringEl.offsetWidth
  const h = ringEl.offsetHeight
  const dim = Math.min(w, h)
  const minCenterDist = TILE_PX + MIN_GAP_PX
  const tileHalf = TILE_PX / 2

  const xMin = -w / 2 + tileHalf + EDGE_PADDING_PX
  const xMax = w / 2 - tileHalf - EDGE_PADDING_PX
  /**
   * Keep logos within ring bounds with soft top/bottom margins.
   * The previous narrow central band over-constrained placement and made tiles bunch.
   */
  const yMin = -h / 2 + tileHalf + EDGE_PADDING_PX + 12
  const yMax = h / 2 - tileHalf - EDGE_PADDING_PX - 12

  /** Wider annulus = more room between brands */
  const rMin = Math.max(dim * 0.3, 148)
  const rMax = Math.max(dim * 0.62, rMin + 132)

  const n = tiles.length
  const positions: { x: number; y: number }[] = []

  for (let i = 0; i < n; i++) {
    const seed = hash(tiles[i].id)
    const seed2 = hash(tiles[i].id + "r")
    const baseAngle = (i / n) * Math.PI * 2 + (rand01(seed) - 0.5) * 0.18
    let angle = nudgeAngleOutOfExclusion(baseAngle + (rand01(seed2) - 0.5) * 0.12)

    const rJitter = (rand01(seed >>> 1) - 0.5) * 0.14 * (rMax - rMin)
    let r = rMin + rand01(seed >>> 2) * (rMax - rMin) + rJitter
    r = Math.min(rMax, Math.max(rMin, r))

    angle += (rand01(seed >>> 4) - 0.5) * 0.08

    let x = Math.cos(angle) * r
    let y = Math.sin(angle) * r

    if (angleInExcludedTop(Math.atan2(y, x))) {
      const a2 = nudgeAngleOutOfExclusion(Math.atan2(y, x))
      x = Math.cos(a2) * r
      y = Math.sin(a2) * r
    }

    positions.push({ x, y })
  }

  for (let iter = 0; iter < 36; iter++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = positions[j].x - positions[i].x
        const dy = positions[j].y - positions[i].y
        const d = Math.hypot(dx, dy) || 1
        if (d < minCenterDist) {
          const push = (minCenterDist - d) * 0.6 + 0.45
          const ux = dx / d
          const uy = dy / d
          positions[i].x -= ux * push
          positions[i].y -= uy * push
          positions[j].x += ux * push
          positions[j].y += uy * push
        }
      }
    }

    for (let i = 0; i < n; i++) {
      let { x, y } = positions[i]
      let dist = Math.hypot(x, y)
      if (dist < rMin) {
        const s = rMin / dist
        x *= s
        y *= s
        dist = rMin
      }
      if (dist > rMax) {
        const s = rMax / dist
        x *= s
        y *= s
        dist = rMax
      }
      let a = Math.atan2(y, x)
      if (angleInExcludedTop(a)) {
        a = nudgeAngleOutOfExclusion(a)
        x = Math.cos(a) * dist
        y = Math.sin(a) * dist
      }
      x = Math.min(xMax, Math.max(xMin, x))
      y = Math.min(yMax, Math.max(yMin, y))
      positions[i] = { x, y }
    }
  }

  for (let iter = 0; iter < 18; iter++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = positions[j].x - positions[i].x
        const dy = positions[j].y - positions[i].y
        const d = Math.hypot(dx, dy) || 1
        if (d < minCenterDist) {
          const push = (minCenterDist - d) * 0.55 + 0.35
          const ux = dx / d
          const uy = dy / d
          positions[i].x -= ux * push
          positions[i].y -= uy * push
          positions[j].x += ux * push
          positions[j].y += uy * push
        }
      }
    }
    for (let i = 0; i < n; i++) {
      let { x, y } = positions[i]
      let dist = Math.hypot(x, y)
      if (dist < rMin) {
        const s = rMin / dist
        x *= s
        y *= s
        dist = rMin
      }
      if (dist > rMax) {
        const s = rMax / dist
        x *= s
        y *= s
        dist = rMax
      }
      x = Math.min(xMax, Math.max(xMin, x))
      y = Math.min(yMax, Math.max(yMin, y))
      positions[i] = { x, y }
    }
  }

  return positions
}
