/**
 * Cheap divergence-free 2D vector field for organic micro-turbulence. Sampled
 * per-particle per-frame, so the implementation must be branch-free and avoid
 * allocations. We use a hand-tuned scalar potential P(x,y,t) built from a
 * small sum of trig terms, then take its 2D curl `(∂P/∂y, -∂P/∂x)` analytically.
 *
 * This is NOT mathematically rigorous Simplex curl noise — it's a pragmatic
 * approximation that LOOKS like divergence-free fluid turbulence at our
 * sampling scale. The key property (incompressibility / no divergence sources)
 * holds because we take the curl of a scalar potential, regardless of the
 * potential's specific form.
 *
 * Cost: ~6 sin / cos per sample. At 55k particles, ~0.3-0.6 ms / frame.
 */

/**
 * Sample the curl-noise vector field at a bitmap-space coordinate and time.
 * Writes the (vx, vy) pair into `out` to avoid per-call array allocation.
 *
 * @param x         Bitmap-space x position (px).
 * @param y         Bitmap-space y position (px).
 * @param t         Time in seconds (drives temporal evolution).
 * @param scale     Spatial frequency (cycles per bitmap px). 0.005-0.03 typical.
 * @param amplitude Output magnitude (bitmap px / frame).
 * @param evolHz    Temporal evolution rate (Hz). 0.2-1.0 typical.
 * @param out       Two-element scratch tuple for the result.
 */
export function sampleCurlNoise(
  x: number,
  y: number,
  t: number,
  scale: number,
  amplitude: number,
  evolHz: number,
  out: [number, number]
): void {
  if (amplitude <= 0 || scale <= 0) {
    out[0] = 0
    out[1] = 0
    return
  }
  /** Three octaves of trig with mutually irrational frequency ratios so the
   * pattern doesn't tile visibly across the canvas. */
  const k1 = scale
  const k2 = scale * 1.731
  const k3 = scale * 0.547
  const k4 = scale * 0.673
  const k5 = scale * 2.418
  const k6 = scale * 1.319
  const w1 = evolHz * 2 * Math.PI * 1.0
  const w2 = evolHz * 2 * Math.PI * 0.83
  const w3 = evolHz * 2 * Math.PI * 1.27
  const ax = x * k1 + t * w1
  const by = y * k2 + t * w2
  const ux = x * k3 + t * w3
  const uy = y * k4 + t * w1
  const sx = x * k5 + t * w2
  const sy = y * k6 + t * w3
  /** Scalar potential P(x,y,t) (we don't need to compute it; only its
   * partial derivatives matter for the curl). */
  /** ∂P/∂x and ∂P/∂y of the trig sum below:
   *   P = sin(ax) cos(by) + 0.6 sin(ux + uy) + 0.4 cos(sx + sy)
   */
  const cosAx = Math.cos(ax)
  const sinAx = Math.sin(ax)
  const cosBy = Math.cos(by)
  const sinBy = Math.sin(by)
  const cosUxy = Math.cos(ux + uy)
  const sinSxy = Math.sin(sx + sy)
  const dPdx =
    cosAx * cosBy * k1 + 0.6 * cosUxy * k3 - 0.4 * sinSxy * k5
  const dPdy =
    -sinAx * sinBy * k2 + 0.6 * cosUxy * k4 - 0.4 * sinSxy * k6
  /** Curl of a 2D scalar potential P is the divergence-free vector
   * `(∂P/∂y, -∂P/∂x)`. Scale to amplitude. */
  out[0] = dPdy * amplitude
  out[1] = -dPdx * amplitude
}
