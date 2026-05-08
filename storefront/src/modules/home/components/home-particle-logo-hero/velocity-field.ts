/**
 * Coarse 2D velocity-field grid — Stam-style "stir lingers after the cursor stops"
 * mechanic. The cursor injects velocity into nearby cells; the field decays each
 * frame; particles sample the field cell at their current bitmap position and add
 * a fraction of that velocity to themselves. When the cursor stops, the field
 * keeps its momentum and slowly dies off — particles continue to swirl naturally
 * in the wake.
 *
 * Stored as two Float32Arrays (vx, vy) of length cols*rows. Coordinates are in
 * BITMAP space (the same space the integration loop uses for x/y/hx/hy).
 */
export type VelocityField = {
  cols: number
  rows: number
  /** Bitmap pixels per cell on each axis — cached so sample/inject can convert
   * between bitmap coords and grid indices without recomputing. */
  cellW: number
  cellH: number
  /** Bitmap-space dimensions the grid covers. */
  bitmapW: number
  bitmapH: number
  vx: Float32Array
  vy: Float32Array
}

/** Allocate a fresh velocity field sized to a target cell-count along the longer
 * axis. We keep cells roughly square so inject/sample math is symmetric. */
export function createVelocityField(
  bitmapW: number,
  bitmapH: number,
  resolution: number
): VelocityField {
  const longSide = Math.max(bitmapW, bitmapH)
  const cellSize = Math.max(4, Math.floor(longSide / Math.max(4, resolution)))
  const cols = Math.max(2, Math.ceil(bitmapW / cellSize))
  const rows = Math.max(2, Math.ceil(bitmapH / cellSize))
  return {
    cols,
    rows,
    cellW: bitmapW / cols,
    cellH: bitmapH / rows,
    bitmapW,
    bitmapH,
    vx: new Float32Array(cols * rows),
    vy: new Float32Array(cols * rows),
  }
}

/** Reset all cells to zero. Cheap. Called when interaction mode changes or the
 * field needs to be flushed (e.g. resize / mode swap). */
export function clearVelocityField(field: VelocityField): void {
  field.vx.fill(0)
  field.vy.fill(0)
}

/** Inject velocity into the grid around a cursor position. Uses a Gaussian-ish
 * radial falloff so the inject blob is soft (no hard ring artifacts). The cursor
 * velocity (vx, vy) is added — not assigned — so repeated strokes accumulate. */
export function injectVelocity(
  field: VelocityField,
  cx: number,
  cy: number,
  vx: number,
  vy: number,
  radiusBmp: number,
  strength: number
): void {
  if (strength <= 0 || radiusBmp <= 0) return
  if (cx <= -9000) return
  const rCells = Math.max(1, Math.ceil(radiusBmp / Math.min(field.cellW, field.cellH)))
  const cxCell = cx / field.cellW
  const cyCell = cy / field.cellH
  const ci = Math.floor(cxCell)
  const cj = Math.floor(cyCell)
  const rSqInv = 1 / (radiusBmp * radiusBmp)
  for (let dj = -rCells; dj <= rCells; dj++) {
    const j = cj + dj
    if (j < 0 || j >= field.rows) continue
    for (let di = -rCells; di <= rCells; di++) {
      const i = ci + di
      if (i < 0 || i >= field.cols) continue
      /** Distance from cursor in bitmap units (cell centre to cursor). */
      const cellCx = (i + 0.5) * field.cellW
      const cellCy = (j + 0.5) * field.cellH
      const dx = cellCx - cx
      const dy = cellCy - cy
      const distSq = dx * dx + dy * dy
      if (distSq > radiusBmp * radiusBmp) continue
      /** Gaussian-ish falloff: exp(-3 * normalisedDistSq). */
      const w = Math.exp(-3 * distSq * rSqInv) * strength
      const idx = j * field.cols + i
      field.vx[idx] += vx * w
      field.vy[idx] += vy * w
    }
  }
}

/** Per-frame decay. `decayPerSec` is the fraction of velocity REMOVED per second
 * (e.g. 0.6 = field loses 60% of its energy each second of inactivity). The
 * frame-correct factor is `(1 - decayPerSec) ^ (dtMs / 1000)`. */
export function decayVelocityField(
  field: VelocityField,
  decayPerSec: number,
  dtMs: number
): void {
  const k = Math.max(0, Math.min(1, decayPerSec))
  if (k <= 0) return
  const factor = Math.pow(1 - k, dtMs / 1000)
  if (factor >= 1) return
  const n = field.cols * field.rows
  for (let i = 0; i < n; i++) {
    field.vx[i] *= factor
    field.vy[i] *= factor
  }
}

/** Optional lateral diffusion pass — each cell averages a tiny fraction of its
 * 4-neighbours into itself, so injected energy seeps outward over time. Skip
 * if `amount <= 0` to save the buffer pass. Uses a single ping-pong buffer
 * (caller-allocated) to avoid the per-frame alloc cost. */
export function diffuseVelocityField(
  field: VelocityField,
  amount: number,
  scratch: Float32Array
): void {
  if (amount <= 0) return
  const a = Math.max(0, Math.min(0.25, amount))
  const { cols, rows, vx, vy } = field
  /** scratch is sized cols*rows*2 — first half = vx', second half = vy'. */
  const sx = scratch.subarray(0, cols * rows)
  const sy = scratch.subarray(cols * rows, cols * rows * 2)
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const idx = j * cols + i
      const left = i > 0 ? idx - 1 : idx
      const right = i < cols - 1 ? idx + 1 : idx
      const up = j > 0 ? idx - cols : idx
      const down = j < rows - 1 ? idx + cols : idx
      const avgX = (vx[left]! + vx[right]! + vx[up]! + vx[down]!) * 0.25
      const avgY = (vy[left]! + vy[right]! + vy[up]! + vy[down]!) * 0.25
      sx[idx] = vx[idx]! * (1 - a) + avgX * a
      sy[idx] = vy[idx]! * (1 - a) + avgY * a
    }
  }
  vx.set(sx)
  vy.set(sy)
}

/**
 * Pressure projection — Stam-style fluid-solver pass that subtracts the
 * divergent component of the velocity field. Without this, energy injected by
 * the cursor smears outward uniformly and the swirl looks like spreading
 * gas instead of curling fluid. With it, vortices preserve their shape and
 * eddies form naturally.
 *
 * The pass is a Sobel-like convolution: each cell's "pressure" scalar is
 * computed as the divergence of the velocity at that cell, then the
 * pressure gradient is subtracted from each cell's velocity. Reference:
 * Newmix's particle code does exactly this with a 3x3 Sobel kernel.
 *
 * Allocates nothing if `scratch` is correctly pre-sized.
 *
 * @param field      The velocity field to project.
 * @param scratch    Buffer of length `cols * rows` for the pressure scalar.
 *                   Caller-allocated to avoid per-frame alloc.
 * @param strength   How strongly to subtract the gradient (0..1). 0 = no
 *                   correction; 1 = full Stam-style projection. 0.25-0.5
 *                   is a good range — enough to make swirls curl, not so
 *                   much that the field locks up.
 * @param iterations How many projection passes to run. More = closer to
 *                   true incompressibility but more expensive. 1-2 is
 *                   usually enough at this grid resolution.
 */
export function pressureProjectVelocityField(
  field: VelocityField,
  scratch: Float32Array,
  strength: number,
  iterations: number
): void {
  if (strength <= 0 || iterations <= 0) return
  const { cols, rows, vx, vy } = field
  const k = Math.max(0, Math.min(1, strength)) * 0.25
  const passes = Math.max(1, Math.min(8, Math.floor(iterations)))
  for (let pass = 0; pass < passes; pass++) {
    /** Step 1: compute pressure scalar at each cell as the divergence of
     * velocity, sampled with a Sobel-like kernel for smoother results than
     * the bare 4-neighbor finite difference. */
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const idx = j * cols + i
        const left = i > 0 ? idx - 1 : idx
        const right = i < cols - 1 ? idx + 1 : idx
        const up = j > 0 ? idx - cols : idx
        const down = j < rows - 1 ? idx + cols : idx
        const upLeft = j > 0 && i > 0 ? idx - cols - 1 : idx
        const upRight = j > 0 && i < cols - 1 ? idx - cols + 1 : idx
        const downLeft = j < rows - 1 && i > 0 ? idx + cols - 1 : idx
        const downRight =
          j < rows - 1 && i < cols - 1 ? idx + cols + 1 : idx
        /** Sobel-x on vx (horizontal gradient of horizontal velocity). */
        const dvx =
          0.5 * vx[upLeft]! +
          vx[left]! +
          0.5 * vx[downLeft]! -
          0.5 * vx[upRight]! -
          vx[right]! -
          0.5 * vx[downRight]!
        /** Sobel-y on vy (vertical gradient of vertical velocity). */
        const dvy =
          0.5 * vy[upLeft]! +
          vy[up]! +
          0.5 * vy[upRight]! -
          0.5 * vy[downLeft]! -
          vy[down]! -
          0.5 * vy[downRight]!
        scratch[idx] = (dvx + dvy) * k
      }
    }
    /** Step 2: subtract pressure gradient from velocity. */
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const idx = j * cols + i
        const left = i > 0 ? idx - 1 : idx
        const right = i < cols - 1 ? idx + 1 : idx
        const up = j > 0 ? idx - cols : idx
        const down = j < rows - 1 ? idx + cols : idx
        const upLeft = j > 0 && i > 0 ? idx - cols - 1 : idx
        const upRight = j > 0 && i < cols - 1 ? idx - cols + 1 : idx
        const downLeft = j < rows - 1 && i > 0 ? idx + cols - 1 : idx
        const downRight =
          j < rows - 1 && i < cols - 1 ? idx + cols + 1 : idx
        const gx =
          0.5 * scratch[upLeft]! +
          scratch[left]! +
          0.5 * scratch[downLeft]! -
          0.5 * scratch[upRight]! -
          scratch[right]! -
          0.5 * scratch[downRight]!
        const gy =
          0.5 * scratch[upLeft]! +
          scratch[up]! +
          0.5 * scratch[upRight]! -
          0.5 * scratch[downLeft]! -
          scratch[down]! -
          0.5 * scratch[downRight]!
        vx[idx]! += gx * k
        vy[idx]! += gy * k
      }
    }
  }
}

/** Bilinearly sample the field at a bitmap coordinate. Returns `[vx, vy]`. */
export function sampleVelocityField(
  field: VelocityField,
  x: number,
  y: number,
  out: [number, number]
): void {
  const fx = x / field.cellW - 0.5
  const fy = y / field.cellH - 0.5
  const i0 = Math.max(0, Math.min(field.cols - 1, Math.floor(fx)))
  const j0 = Math.max(0, Math.min(field.rows - 1, Math.floor(fy)))
  const i1 = Math.max(0, Math.min(field.cols - 1, i0 + 1))
  const j1 = Math.max(0, Math.min(field.rows - 1, j0 + 1))
  const tx = Math.max(0, Math.min(1, fx - i0))
  const ty = Math.max(0, Math.min(1, fy - j0))
  const a = j0 * field.cols + i0
  const b = j0 * field.cols + i1
  const c = j1 * field.cols + i0
  const d = j1 * field.cols + i1
  const vx0 = field.vx[a]! * (1 - tx) + field.vx[b]! * tx
  const vx1 = field.vx[c]! * (1 - tx) + field.vx[d]! * tx
  const vy0 = field.vy[a]! * (1 - tx) + field.vy[b]! * tx
  const vy1 = field.vy[c]! * (1 - tx) + field.vy[d]! * tx
  out[0] = vx0 * (1 - ty) + vx1 * ty
  out[1] = vy0 * (1 - ty) + vy1 * ty
}
