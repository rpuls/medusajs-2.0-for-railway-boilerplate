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
  radius: 75,
  velSmoothing: 0.45,
  sideSwirlForce: 8,
  frontPush: 4,
  backInward: 4,
  falloffPower: 1.6,
  motionGateSpeed: 1.5,
  /** Wake-history playback ON — the actual Newmix mechanism. Cursor disk
   * captures particles (carried at inDiskCarryFactor of mouse velocity),
   * exit yields wake-trail state for trailingProbability of them, which
   * trace cursor's historical path at wakePace for trailFollowMs. */
  trailFollowMs: 2500,
  wakePace: 0.52,
  wakePaceJitter: 0.40,
  wakeLateralSpreadBmp: 14,
  wakeReleaseStaggerMs: 200,
  wakeBandSpreadBmp: 14,
  wakeAlongStretchBmp: 22,
  wakeDiffusionBmp: 3,
  wakeTimeOffsetMs: 1400,
  releaseVelocityKeep: 0,
  exitVelocityBoostBmp: 10,
  leadingEdgePullForce: 1.8,
  trailingProbability: 0.65,
  inDiskCarryFactor: 0.85,
  wakeBandTaperPower: 1.0,
  coreEjectionForce: 8,
  coreEjectionRadiusFrac: 0.15,
  wakeAlphaMult: 1.2,
  captureColorInvertMode: 1,
  captureColorInvertFadeMs: 150,
  captureColorInvertChance: 0.33,
  captureColorInvertGlowBoost: 0.3,
  /** Vortex emitters disabled. */
  vortexStrength: 0,
  /** Field — heavy lifter for the lingering momentum, but particles only
   * gently sample it (Newmix uses ride ≈ 0.06). With the spring always strong
   * (no field-based suppression) and a hard 30 px/frame velocity clamp,
   * particles sit close to home and read flow lines without escaping. */
  fieldStrength: 1,
  fieldGridResolution: 48,
  fieldInjectRadiusBmp: 26,
  fieldInjectStrength: 1.0,
  fieldInjectMinSpeedPxPerFrame: 8,
  fieldDecayPerSec: 0.45,
  fieldAdvectionStrength: 0.7,
  fieldDiffusion: 0.05,
  fieldRideStrength: 0.15,
  fieldPressureStrength: 0.7,
  fieldPressureIterations: 1,
  fieldDrivenCursor: 1,
  fieldStrokeSubdivisionPx: 6,
  /** Hard particle damping + velocity clamp — particles are passive tracers
   * with no escape from the spring's pull. */
  friction: 0.4,
  particleSpeedLimit: 30,
  springStiffnessMult: 0.9,
  homeSpringSuppress: 0.85,
  homeReturnMs: 1400,
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
  curlNoiseAmplitude: 0.35,
  curlNoiseScale: 0.009,
  curlNoiseEvolutionHz: 0.22,
  cursorForceSpeedCoupling: 0,
  boundaryRadiusFrac: 0,
  flockingStrength: 0,
  foamFraction: 0,
  paddleSharpness: 0,
  metaballEnabled: 0,
}
