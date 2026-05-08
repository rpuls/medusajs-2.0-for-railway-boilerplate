import type { NewmixLiveTuning } from "@modules/home/components/home-particle-logo-hero/newmix-live-tuning"

/**
 * Newmix-style preset — defaults that approximate newmixcoffee.com's
 * particle behaviour by exercising the three Newmix-technique knobs:
 *
 *  1. Velocity field with strong pressure projection — vortices form/persist
 *     instead of the field smearing outward.
 *  2. `fieldDrivenCursor` ON — cursor force is deposited into the field cell
 *     instead of pushed onto particles directly. Combined with #1, this is
 *     what makes the cursor feel like stirring fluid rather than pushing
 *     a rake through sand.
 *  3. `fieldStrokeSubdivisionPx = 6` — fast cursor flicks deposit velocity
 *     at every step along the path.
 *
 * Other settings are conservative — direct cursor swirl/wake disabled, no
 * vortex emitters, no curl, no flocking, no metaball. The field does the
 * heavy lifting; particles just spring back to home with very strong
 * damping (×0.4 friction) once the field's energy at their cell drops below
 * activation threshold.
 *
 * Tuning lab on /particle-flow can override any of these live; this preset
 * is just the starting point.
 */
export const NEWMIX_PRESET: Partial<NewmixLiveTuning> = {
  /** Cursor disk — keep moderate so the impulse profile (sideSwirl, frontPush)
   * is meaningful, but its OUTPUT is rerouted into the field via `fieldDrivenCursor`. */
  radius: 50,
  velSmoothing: 0.45,
  sideSwirlForce: 8,
  frontPush: 4,
  backInward: 4,
  falloffPower: 1.6,
  motionGateSpeed: 1.5,
  /** No direct wake-history playback — the field carries the wake. */
  trailFollowMs: 0,
  wakePace: 1,
  wakePaceJitter: 0,
  wakeLateralSpreadBmp: 0,
  wakeReleaseStaggerMs: 0,
  wakeBandSpreadBmp: 0,
  wakeAlongStretchBmp: 0,
  wakeDiffusionBmp: 0,
  wakeTimeOffsetMs: 0,
  releaseVelocityKeep: 0,
  exitVelocityBoostBmp: 0,
  leadingEdgePullForce: 0,
  trailingProbability: 0,
  inDiskCarryFactor: 0,
  wakeBandTaperPower: 0,
  coreEjectionForce: 0,
  coreEjectionRadiusFrac: 0.15,
  wakeAlphaMult: 1,
  /** Vortex emitters disabled. */
  vortexStrength: 0,
  /** Field — heavy lifter for the lingering momentum, but particles only
   * gently sample it (Newmix uses ride ≈ 0.06). With the spring always strong
   * (no field-based suppression) and a hard 30 px/frame velocity clamp,
   * particles sit close to home and read flow lines without escaping. */
  fieldStrength: 1,
  fieldGridResolution: 48,
  fieldInjectRadiusBmp: 48,
  fieldInjectStrength: 1.0,
  fieldDecayPerSec: 0.45,
  fieldDiffusion: 0.05,
  fieldRideStrength: 0.06,
  fieldPressureStrength: 0.4,
  fieldPressureIterations: 1,
  fieldDrivenCursor: 1,
  fieldStrokeSubdivisionPx: 6,
  /** Hard particle damping + velocity clamp — particles are passive tracers
   * with no escape from the spring's pull. */
  friction: 0.4,
  particleSpeedLimit: 30,
  springStiffnessMult: 0.9,
  homeSpringSuppress: 0.85,
  homeReturnMs: 800,
  homeReturnCurveBmp: 30,
  homeReturnDurationJitter: 0.4,
  homeReturnDiffusionBmp: 0,
  idleThresholdMs: 800,
  homeReturnSpring: 0.04,
  homeReturnFriction: 0.85,
  homeReturnGravity: 0,
  /** Render-time alpha boost on moving particles — reproduces the Newmix
   * effect where the cursor's wake reads slightly luminous against the
   * resting wordmark. Subtle but visible. */
  velocityAlphaBoost: 0.05,
  velocityAlphaBoostCap: 0.35,
  /** Off by default — Crema, Curl, Flocking, Boundary, Metaball, Coupling.
   * The user can layer them on top via the tuner panel; the preset is the
   * minimal Newmix-style baseline. */
  curlNoiseAmplitude: 0,
  cursorForceSpeedCoupling: 0,
  boundaryRadiusFrac: 0,
  flockingStrength: 0,
  foamFraction: 0,
  paddleSharpness: 0,
  metaballEnabled: 0,
}
