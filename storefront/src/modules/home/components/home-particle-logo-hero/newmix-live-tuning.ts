/**
 * Live-tunable parameters for `interactionMode: "newmix"`.
 * Defaults mirror `constants.ts`; the RAF loop reads a merged ref updated from the tuning panel.
 */
export type NewmixLiveTuning = {
  radius: number
  velSmoothing: number
  sideSwirlForce: number
  frontPush: number
  backInward: number
  falloffPower: number
  trailFollowMs: number
  /** Playback pace for the cursor history: 1.0 = particle stays at cursor (no trail);
   * <1.0 = particle traces path slower than real time, falling behind as a wake. */
  wakePace: number
  /** Per-particle pace jitter (0..1). Each particle's pace is randomly varied by ±this fraction
   * of `wakePace`, so different particles fall behind at different rates and spread out along the trail. */
  wakePaceJitter: number
  /** Lateral drift along the trail's perpendicular over the wake duration (bitmap px).
   * Each particle gets a random sign + magnitude so the wake spreads instead of clumping. */
  wakeLateralSpreadBmp: number
  /** Per-particle release-time stagger (ms). Each particle's effective release time is
   * delayed by up to this much (deterministic from home), so particles released in the same
   * frame don't move in lockstep. */
  wakeReleaseStaggerMs: number
  /** Per-particle perpendicular offset multiplier added to the playback target. This is
   * NOT bell-shaped — it's a constant lateral offset that varies per particle, so dots
   * spread into a band along the entire trail length, not just mid-wake. */
  wakeBandSpreadBmp: number
  /** Per-particle along-tangent offset (bitmap px). Each particle gets a unique signed
   * offset along the cursor's heading so they stretch out along the trail axis, not just
   * perpendicular to it — produces a long elongated wake rather than a short clump. */
  wakeAlongStretchBmp: number
  /** Continuous diffusion noise amplitude (bitmap px). Each particle wobbles around its
   * playback position via a deterministic sine function of time + particle hash. Breaks
   * up clumping by making each particle drift along its own slow wandering path. */
  wakeDiffusionBmp: number
  /** Diffusion frequency (Hz). Higher = faster wobble; lower = slower drift. */
  wakeDiffusionHz: number
  /** Each particle's effective release time is shifted backward in history by a per-particle
   * fraction of this many ms. Spreads a single swirl-pass across the entire path-history
   * so the wake reads as a continuous trail rather than discrete clumps at the cursor. */
  wakeTimeOffsetMs: number
  /** Fraction of swirl velocity preserved on the release frame (lower = trail playback takes over immediately). */
  releaseVelocityKeep: number
  /** Single-frame impulse magnitude applied along the cursor's heading direction when a
   * particle exits the capture disk. Shoots particles cleanly into the wake instead of
   * orbiting / ringing the cursor. */
  exitVelocityBoostBmp: number
  /** Radial-inward pull strength applied on the leading edge of the disk (front-facing
   * relative to motion). Gathers particles into the path as the cursor approaches, so
   * the wake is fed a denser stream of dots instead of just deflecting passively. */
  leadingEdgePullForce: number
  /** Probability (0..1) that an exiting particle is granted wake-trailing state. The
   * remainder skip the wake and spring directly home — keeps the wake thin instead of
   * dragging the entire path of particles. */
  trailingProbability: number
  /** While a particle is captured inside the disk, it advects along with the cursor at
   * this fraction of mouse velocity. Produces the "spoon scooping up coffee" feel where
   * particles are carried briefly before being released. */
  inDiskCarryFactor: number
  /** Mouse-speed gate (bitmap px / frame) below which the disk's impulse fades to zero.
   * Stops the persistent halo of orbiting particles when the cursor slows or stops. */
  motionGateSpeed: number
  /** Wake band taper power. Lateral offset is multiplied by `(1 - u)^power` where `u` is
   * the wake age (0 at release / front, 1 at end / tail). Higher = sharper taper toward
   * the tail = more teardrop / leaf shape. */
  wakeBandTaperPower: number
  /** Aggressive radial outward repulsion in the inner core of the disk. Active when
   * `dist < radius * coreEjectionRadiusFrac`, this strong outward push keeps the very
   * center of the cursor disk visibly empty (the "void" Newmix shows). */
  coreEjectionForce: number
  /** Fraction of the disk radius treated as "core" for ejection (e.g. 0.3 = inner 30%). */
  coreEjectionRadiusFrac: number
  /** Alpha multiplier applied to particles in trailing state. Lower = wake reads more
   * ghostly / translucent so the wordmark dominates visually. */
  wakeAlphaMult: number
  friction: number
  springStiffnessMult: number
  homeSpringSuppress: number
  /** Total duration of the home-return phase (ms). Each particle eases from its wake-end
   * position back to home over this time along a curved path. */
  homeReturnMs: number
  /** Random perpendicular curve magnitude (bitmap px) for the home-return path. Each particle
   * gets a unique sign + amount, so home return paths fan out instead of all converging
   * along the straight line from wake-end to home. */
  homeReturnCurveBmp: number
  /** Per-particle home-return duration jitter (0..1). Each particle's homeReturnMs is
   * varied by ±this fraction so they don't all arrive home in lockstep. */
  homeReturnDurationJitter: number
  /** Diffusion noise amplitude during home return (bitmap px). Wobbles each particle around
   * its Bezier path so the return trajectories spread out and don't appear clumped. */
  homeReturnDiffusionBmp: number
  /** Idle-gate threshold (ms). If no mouse motion for this long, capture/swirl freezes. */
  idleThresholdMs: number
  /** Spring stiffness pulling home-returning particles toward their home position each
   * frame. Lower = slower, more drifting return. Newmix-style is very weak (~0.008) so
   * particles take 2-4 sec to drift home like sand falling. */
  homeReturnSpring: number
  /** Friction multiplier applied each frame during home-return drift. High friction
   * (~0.94) gives soft slow motion; low friction allows momentum to overshoot. */
  homeReturnFriction: number
  /** Downward gravity acceleration applied during home-return drift (bitmap px/frame²).
   * Produces the "sand through hourglass" effect — particles fall toward home with a
   * downward bias, not a straight line. */
  homeReturnGravity: number
  /** Dual vortex emitters — two virtual rotation centres travelling with the cursor on
   * each side of its motion direction. Particles within each vortex's radius receive a
   * tangential impulse around that vortex (not around the cursor), producing visible
   * counter-rotating curls on each side of the cursor — the Kármán vortex pair you see
   * trailing a moving spoon in coffee.
   *
   * Set `vortexStrength` to 0 to disable.
   */
  vortexStrength: number
  /** Each vortex's perpendicular offset from the cursor's path (bitmap px). */
  vortexOffsetBmp: number
  /** Along-velocity offset of the vortex centre relative to the cursor (bitmap px).
   * Negative = behind cursor (in the wake), 0 = level with cursor, positive = ahead. */
  vortexLagBmp: number
  /** Each vortex's influence radius (bitmap px). Smaller than cursor radius keeps the
   * curls localised; larger makes them blend into the surrounding flow. */
  vortexRadiusBmp: number
  /** Force falloff with distance from vortex centre. `((R - d)/R)^P`. Higher = sharper
   * concentration of force near the vortex centre = tighter visible curl. */
  vortexFalloffPower: number
  /** Vortex capture-orbit-release: how fast captured particles orbit (deg/sec).
   * Slower = more visible spinning. ~360-720 reads as 1-2 rotations/sec. */
  vortexOrbitSpeedDegPerSec: number
  /** How long a captured particle stays locked on its orbital path (ms) before
   * being released into the wake. */
  vortexCaptureDurationMs: number
  /** Probability (0..1) that a particle entering a vortex zone gets captured.
   * Lower = sparser orbits, more particles streaming past. */
  vortexCaptureProbability: number
}

/** SC PRints v2-era settings (commit 2f8436e, May 3 11:20). User indicated these
 * produced the best result so far. Newer knobs (added after v2) are set to
 * neutral / disabled values so they don't perturb the v2-era behavior. */
export const NEWMIX_LIVE_TUNING_DEFAULTS = Object.freeze<NewmixLiveTuning>({
  radius: 65,
  velSmoothing: 0.45,
  sideSwirlForce: 14.0,
  frontPush: 5.0,
  backInward: 3.5,
  falloffPower: 1.4,
  trailFollowMs: 1200,
  wakePace: 0.85,
  wakePaceJitter: 0.25,
  wakeLateralSpreadBmp: 6,
  wakeReleaseStaggerMs: 200,
  wakeBandSpreadBmp: 5,
  wakeAlongStretchBmp: 5,
  wakeDiffusionBmp: 0,
  wakeDiffusionHz: 0.6,
  wakeTimeOffsetMs: 600,
  releaseVelocityKeep: 0.0,
  /** Knobs added after v2 — neutral / disabled. */
  exitVelocityBoostBmp: 0.0,
  leadingEdgePullForce: 0.0,
  trailingProbability: 1.0,
  inDiskCarryFactor: 0.0,
  motionGateSpeed: 0.0,
  wakeBandTaperPower: 0.0,
  coreEjectionForce: 0.0,
  coreEjectionRadiusFrac: 0.15,
  wakeAlphaMult: 1.0,
  /** Resume v2-era values. */
  friction: 0.94,
  springStiffnessMult: 0.55,
  homeSpringSuppress: 0.85,
  homeReturnMs: 400,
  homeReturnCurveBmp: 0,
  homeReturnDurationJitter: 0.85,
  homeReturnDiffusionBmp: 0,
  idleThresholdMs: 2000,
  /** Sand-fall drift constants (added after v2; neutral if unused). */
  homeReturnSpring: 0.008,
  homeReturnFriction: 0.94,
  homeReturnGravity: 0.05,
  /** Dual vortex emitters — disabled by default. */
  vortexStrength: 0.0,
  vortexOffsetBmp: 25,
  vortexLagBmp: -8,
  vortexRadiusBmp: 35,
  vortexFalloffPower: 1.6,
  vortexOrbitSpeedDegPerSec: 540,
  vortexCaptureDurationMs: 500,
  vortexCaptureProbability: 0.7,
})

export function mergeNewmixLiveTuning(
  partial?: Partial<NewmixLiveTuning> | null
): NewmixLiveTuning {
  return {
    ...NEWMIX_LIVE_TUNING_DEFAULTS,
    ...partial,
  }
}
