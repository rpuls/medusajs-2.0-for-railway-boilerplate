/**
 * Lightweight spatial hash grid for O(n) neighbour lookups in the integration
 * loop. Used by the flocking-alignment pass to find a velocity-blend candidate
 * per particle without an O(n²) all-pairs scan.
 *
 * Storage layout (cache-friendly):
 *  - `cellStart[ci]` = first particle index in cell `ci` (or -1 if empty).
 *  - `cellNext[pi]`  = next particle index in the same cell as `pi`.
 *
 * Build is two passes over the particle array (O(n) total). Querying a cell
 * walks the linked list — fast in practice when cell size ~ neighbour radius.
 *
 * Coordinates are bitmap-space.
 */
export type SpatialHash = {
  cellW: number
  cellH: number
  cols: number
  rows: number
  bitmapW: number
  bitmapH: number
  /** cellStart[j*cols + i] — first particle index in that cell, or -1. */
  cellStart: Int32Array
  /** cellNext[pi] — next particle index in the same cell, or -1. */
  cellNext: Int32Array
}

/** Allocate a spatial hash sized to a target cell-size. Cells should be sized
 * roughly to the neighbour radius being queried — too small wastes memory,
 * too large loses the perf benefit. */
export function createSpatialHash(
  bitmapW: number,
  bitmapH: number,
  cellSize: number,
  particleCount: number
): SpatialHash {
  const cs = Math.max(2, Math.floor(cellSize))
  const cols = Math.max(1, Math.ceil(bitmapW / cs))
  const rows = Math.max(1, Math.ceil(bitmapH / cs))
  return {
    cellW: cs,
    cellH: cs,
    cols,
    rows,
    bitmapW,
    bitmapH,
    cellStart: new Int32Array(cols * rows),
    cellNext: new Int32Array(particleCount),
  }
}

/** Resize the hash if particle count, canvas size, or cell size has changed.
 * Returns the (possibly new) hash. */
export function ensureSpatialHash(
  current: SpatialHash | null,
  bitmapW: number,
  bitmapH: number,
  cellSize: number,
  particleCount: number
): SpatialHash {
  const cs = Math.max(2, Math.floor(cellSize))
  const cols = Math.max(1, Math.ceil(bitmapW / cs))
  const rows = Math.max(1, Math.ceil(bitmapH / cs))
  if (
    current &&
    current.cols === cols &&
    current.rows === rows &&
    current.cellW === cs &&
    current.bitmapW === bitmapW &&
    current.bitmapH === bitmapH &&
    current.cellNext.length === particleCount
  ) {
    return current
  }
  return createSpatialHash(bitmapW, bitmapH, cellSize, particleCount)
}

/**
 * Build the hash from particle x/y arrays. Resets `cellStart` to -1 and walks
 * each particle once, prepending it to its cell's linked list.
 *
 * `getX(i)` and `getY(i)` are passed as callbacks so the caller can pull from
 * whatever shape it stores particles in (objects, parallel arrays, etc).
 */
export function buildSpatialHash(
  hash: SpatialHash,
  particleCount: number,
  getX: (i: number) => number,
  getY: (i: number) => number
): void {
  hash.cellStart.fill(-1)
  for (let i = 0; i < particleCount; i++) {
    const x = getX(i)
    const y = getY(i)
    const ci = Math.max(0, Math.min(hash.cols - 1, Math.floor(x / hash.cellW)))
    const cj = Math.max(0, Math.min(hash.rows - 1, Math.floor(y / hash.cellH)))
    const idx = cj * hash.cols + ci
    hash.cellNext[i] = hash.cellStart[idx]!
    hash.cellStart[idx] = i
  }
}

/** Pick one neighbour particle index near `(x, y)` (excluding `selfIdx`).
 * Returns -1 if no neighbour found. Uses the supplied `rand01` to pick from
 * the candidate list, so the caller controls determinism / animation. */
export function pickNeighbor(
  hash: SpatialHash,
  x: number,
  y: number,
  selfIdx: number,
  rand01: number
): number {
  const ci = Math.max(0, Math.min(hash.cols - 1, Math.floor(x / hash.cellW)))
  const cj = Math.max(0, Math.min(hash.rows - 1, Math.floor(y / hash.cellH)))
  /** Search 3x3 window (own cell + 8 neighbours). */
  /** First pass: count candidates. */
  let count = 0
  for (let dj = -1; dj <= 1; dj++) {
    const j = cj + dj
    if (j < 0 || j >= hash.rows) continue
    for (let di = -1; di <= 1; di++) {
      const i = ci + di
      if (i < 0 || i >= hash.cols) continue
      let p = hash.cellStart[j * hash.cols + i]!
      while (p !== -1) {
        if (p !== selfIdx) count++
        p = hash.cellNext[p]!
      }
    }
  }
  if (count === 0) return -1
  /** Second pass: pick the n-th. */
  let target = Math.floor(rand01 * count)
  if (target >= count) target = count - 1
  let seen = 0
  for (let dj = -1; dj <= 1; dj++) {
    const j = cj + dj
    if (j < 0 || j >= hash.rows) continue
    for (let di = -1; di <= 1; di++) {
      const i = ci + di
      if (i < 0 || i >= hash.cols) continue
      let p = hash.cellStart[j * hash.cols + i]!
      while (p !== -1) {
        if (p !== selfIdx) {
          if (seen === target) return p
          seen++
        }
        p = hash.cellNext[p]!
      }
    }
  }
  return -1
}
