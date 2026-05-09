"use client"

import HomeParticleLogoHero from "@modules/home/components/home-particle-logo-hero"
import type { NewmixLiveTuning } from "@modules/home/components/home-particle-logo-hero/newmix-live-tuning"
import { WORDMARK_GRADIENT } from "@modules/common/lib/wordmark-gradient"

/** Re-export shared gradient so existing imports of WORDMARK_GRADIENT from this
 * file keep working. Single source lives in modules/common/lib/wordmark-gradient.ts. */
export { WORDMARK_GRADIENT }

/**
 * Newmix-style tuning for the particle-flow page.
 *
 * Replaces the old V3_TUNING (cursor-pushes-particles + dual-vortex emitters)
 * with the Newmix model: cursor pushes a velocity field, pressure projection
 * makes the field curl, particles ride the field bilinearly with heavy
 * friction. Settings are tuned from frame-by-frame analysis of the Newmix
 * reference (Start with mix v6 video):
 *
 *  - Inject radius 36 (matches the thin diagonal trail visible on cursor entry)
 *  - Pressure projection 0.5 (rings hold their shape across many frames)
 *  - Decay 0.5 / sec (~1s settling matches Newmix's spring-back speed)
 *  - Spring stiffness 1.2 (faster snapback than the default 0.9)
 *  - Inject strength 10.0 (matches Newmix's effective per-cell deposit,
 *    since their 1/r-style falloff peaks ~6× higher than our Gaussian and
 *    the per-particle disk deposit is no longer running when fieldDrivenCursor
 *    is on — bulk inject is the sole cursor → field path)
 *  - Vortex emitters OFF (Newmix has no orbital capture mechanic)
 *  - Wake-history playback OFF (the field replaces it)
 *  - Velocity-alpha boost 0.05 (moving particles read slightly luminous —
 *    the subtle glow on the wake visible in the reference)
 *
 * The export is named `V3_TUNING` for backward compatibility (callers
 * already import that symbol). It is NO LONGER the v3 settings — it is
 * the Newmix-style preset.
 */
export const V3_TUNING: Partial<NewmixLiveTuning> = {
  /** ------ Cursor disk shape ------ */
  radius: 50,
  velSmoothing: 0.45,
  sideSwirlForce: 8,
  frontPush: 4,
  backInward: 4,
  falloffPower: 1.6,
  motionGateSpeed: 1.5,

  /** ------ Wake-history mechanics ON ------
   * Particles in the cursor disk are CAPTURED (carried along at
   * inDiskCarryFactor of mouse velocity), then on exit a fraction
   * (trailingProbability) enter wake state — they trace the cursor's
   * historical path for trailFollowMs at wakePace. This is the actual
   * Newmix "stir the coffee" mechanism; the field provides flow context
   * but the wake is what makes particles physically follow the cursor. */
  trailFollowMs: 1000,
  wakePace: 0.7,
  wakePaceJitter: 0.25,
  wakeLateralSpreadBmp: 6,
  wakeReleaseStaggerMs: 200,
  wakeBandSpreadBmp: 5,
  wakeAlongStretchBmp: 5,
  wakeDiffusionBmp: 0,
  wakeDiffusionHz: 0.6,
  wakeTimeOffsetMs: 600,
  releaseVelocityKeep: 0,
  exitVelocityBoostBmp: 4,
  leadingEdgePullForce: 0.4,
  trailingProbability: 0.6,
  inDiskCarryFactor: 0.85,
  wakeBandTaperPower: 1.0,
  coreEjectionForce: 5,
  coreEjectionRadiusFrac: 0.15,
  wakeAlphaMult: 1.2,

  /** ------ Vortex emitters OFF ------
   * Newmix has no orbital capture mechanic. Rings are PATH-shaped, not
   * orbital — the cursor traces a circle and the field's pressure projection
   * holds that shape, no per-particle orbit needed. */
  vortexStrength: 0,

  /** ------ Field — the heavy lifter ------ */
  fieldStrength: 1,
  fieldGridResolution: 48,
  fieldInjectRadiusBmp: 20,
  fieldInjectStrength: 1.0,
  fieldInjectMinSpeedPxPerFrame: 8,
  fieldDecayPerSec: 0.5,
  fieldAdvectionStrength: 0.7,
  fieldDiffusion: 0.05,
  fieldRideStrength: 0.06,
  fieldPressureStrength: 0.5,
  fieldPressureIterations: 1,
  fieldDrivenCursor: 1,
  fieldStrokeSubdivisionPx: 6,

  /** ------ Particle damping + clamp ------ */
  friction: 0.4,
  particleSpeedLimit: 30,
  springStiffnessMult: 1.2,
  homeSpringSuppress: 0.85,

  /** ------ Home return ------ */
  homeReturnMs: 800,
  homeReturnCurveBmp: 30,
  homeReturnDurationJitter: 0.4,
  homeReturnDiffusionBmp: 0,
  idleThresholdMs: 800,
  homeReturnSpring: 0.04,
  homeReturnFriction: 0.85,
  homeReturnGravity: 0,

  /** ------ Visual polish ------ */
  velocityAlphaBoost: 0.05,
  velocityAlphaBoostCap: 0.35,

  /** ------ Auxiliary mechanics OFF ------
   * Curl noise / coupling / boundary / flocking / metaball / crema add
   * complexity that fights the cleanness of pure Newmix-style flow. */
  curlNoiseAmplitude: 0,
  cursorForceSpeedCoupling: 0,
  boundaryRadiusFrac: 0,
  flockingStrength: 0,
  foamFraction: 0,
  paddleSharpness: 0,
  metaballEnabled: 0,
}

export default function V3Splash() {
  return (
    <HomeParticleLogoHero
      presentation="embedded"
      interactionMode="newmix"
      animatedParticleCap={55000}
      sectionAriaLabel="SC Prints — particle flow"
      newmixLiveTuning={V3_TUNING}
      wordmarkGradient={WORDMARK_GRADIENT}
    />
  )
}
