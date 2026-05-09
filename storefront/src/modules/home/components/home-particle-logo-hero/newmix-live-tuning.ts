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
  /** Color-invert effect when a particle is captured / in wake state.
   * 0 = OFF (particle keeps its gradient color always)
   * 1 = SNAP (color inverts the moment cursor touches it; smooth fade back home)
   * 2 = FADE (color smoothly fades toward inverted over captureColorInvertFadeMs;
   *           same smooth fade back home).
   * Render lerps between original RGB and (255-r, 255-g, 255-b) by per-particle mix. */
  captureColorInvertMode: number
  /** Fade-in duration (ms) for FADE mode. How long it takes the particle's color
   * to transition from original to fully inverted while inside the cursor disk
   * or in wake-trail state. Ignored when mode is OFF or SNAP. 80-200ms reads as
   * elegant; >300ms can feel laggy. */
  captureColorInvertFadeMs: number
  /** Probability (0..1) that an interacted particle is *selected* for color
   * inversion. 0 = none. 1 = all particles invert. 0.33 reads as Newmix-style:
   * a sparse subset of particles in the wake glow with inverted color while
   * the rest keep their gradient color. Roll happens once per capture event;
   * cleared when the particle returns home. */
  captureColorInvertChance: number
  /** Additional brightness boost applied to selected (inverted) particles.
   * Lifts both RGB toward white and alpha so the inverted particles read as
   * visibly brighter than their non-inverted neighbors. 0 = no boost (only
   * the inversion). 0.3-0.5 reads as a subtle glow; >0.6 can blow out. */
  captureColorInvertGlowBoost: number
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
  /** Ellipse aspect ratio for vortex orbits (major/minor). 1.0 = circle;
   * >1.0 stretches orbit along the cursor's motion direction so curls read
   * as oval rather than perfect circles (matches Newmix's elongated swirls). */
  vortexEllipseAspect: number
  /** Reference cursor speed (bitmap px / frame) at which orbit speed equals
   * `vortexOrbitSpeedDegPerSec`. Faster cursor → faster spin; slower → slower
   * spin. The ratio is clamped to a sensible range. */
  vortexSpeedReference: number
  /** Master toggle for the velocity-field grid (0..1). 0 = field is dormant,
   * particles never sample it; 1 = particles ride the field at full strength.
   * Acts as the global on/off / fade knob for the lingering-momentum mechanic. */
  fieldStrength: number
  /** Resolution of the velocity-field grid along the longer canvas axis. Higher
   * = finer detail in the swirl, but more cells to update each frame. 24-48 is
   * a good range. */
  fieldGridResolution: number
  /** Radius (bitmap px) over which the cursor injects velocity into the field
   * each frame. Roughly the cursor-disk size or slightly larger reads as
   * "the spoon stirring the coffee around it". */
  fieldInjectRadiusBmp: number
  /** Multiplier on the cursor's per-frame velocity when injecting into the
   * field. Higher = a single mouse stroke deposits more momentum, so the
   * field carries longer / spins harder after the cursor leaves. */
  fieldInjectStrength: number
  /** Minimum cursor speed (px/frame) used for inject. If the cursor moves
   * slower than this, its velocity vector is scaled up (direction preserved)
   * to this magnitude before being injected into the field. Boosts slow
   * strokes so they still produce visible swirls without amplifying fast
   * strokes that already have plenty of energy. 0 = no floor (raw speed).
   * 4-10 px/frame reads as "slow drag still makes the wordmark dance". */
  fieldInjectMinSpeedPxPerFrame: number
  /** Fraction of the field's energy LOST per second when the cursor isn't
   * adding to it. 0 = field never decays (chaotic build-up); 1 = field dies
   * within a frame (no lingering). 0.4-0.7 reads as "stir, watch it spin
   * down over a couple of seconds". */
  fieldDecayPerSec: number
  /** Self-advection strength (0..1). Each frame the velocity grid moves
   * itself by `velocity * dt * strength` (Stam-style semi-Lagrangian step).
   * 0 = no advection — deposited energy sits where the cursor put it and
   * dissipates radially via diffusion (blobs, rings, no trail).
   * 1 = full velocity*dt advection — energy TRAVELS in its own direction,
   * so a moving cursor leaves a directional crescent wake behind it.
   * 0.4-0.8 reads as "stir the coffee — there's a clear trail behind the
   * spoon." This is THE step that turns the cursor from a stamp into a stir. */
  fieldAdvectionStrength: number
  /** Per-frame lateral diffusion (0..0.25). Each cell averages a fraction of
   * its 4 neighbours' velocity into itself, so injected energy seeps outward
   * — crucial for "the swirl spreads beyond where the cursor went". 0 skips
   * the pass for a perf saving. */
  fieldDiffusion: number
  /** How much of the sampled field velocity is added to a particle's velocity
   * each frame. Multiplied by `fieldStrength`. 0.05-0.20 reads as "particles
   * ride the field but still keep their own dynamics". */
  fieldRideStrength: number

  /** Curl-noise micro-turbulence amplitude (bitmap px / frame). Layered onto
   * resting particles to produce organic marbling instead of dead-still
   * particles outside the cursor's reach. 0 = disabled. */
  curlNoiseAmplitude: number
  /** Spatial frequency of the curl-noise potential (cycles per bitmap px).
   * Lower = bigger, slower swirls; higher = tighter, more chaotic eddies. */
  curlNoiseScale: number
  /** Temporal evolution rate (Hz) — how fast the noise field drifts in time.
   * Lower = lazy, slow-flowing; higher = busy / nervous. */
  curlNoiseEvolutionHz: number

  /** Cursor-speed coupling on cursor-disk forces (sideSwirlForce, frontPush,
   * backInward). 0 = constant force regardless of cursor speed (classic);
   * 1 = force fully scales with `mouseSpeed / cursorForceSpeedReference`. */
  cursorForceSpeedCoupling: number
  /** Reference speed (bitmap px / frame) at which the speed-coupled force
   * multiplier equals 1. Lower = forces ramp up faster as cursor moves. */
  cursorForceSpeedReference: number

  /** Boundary reflection radius as a fraction of the canvas half-diagonal.
   * Particles past this radius are pushed back inward. 0 = boundary disabled. */
  boundaryRadiusFrac: number
  /** Velocity restitution on boundary impact (0..1). 0 = velocity zeroed on
   * impact; 1 = perfect bounce. */
  boundaryRestitution: number

  /** Flocking velocity-alignment strength (0..1). Each particle blends a
   * fraction of a neighbour's velocity into its own. 0 = no alignment;
   * higher = particles form ribbons / streams instead of acting independently. */
  flockingStrength: number
  /** Spatial radius for finding neighbours (bitmap px). Sets the spatial-hash
   * cell size. Larger = particles align over longer distances but at higher
   * cost (more candidates per cell). */
  flockingRadiusBmp: number
  /** Per-frame fraction of particles processed by the flocking pass (0..1).
   * 1 = every particle every frame; 0.25 = round-robin every 4 frames. Lets
   * you keep the visual without the full perf cost on dense fields. */
  flockingProcessFraction: number

  /** Metaball renderer toggle. 0 = direct putImageData (default, fast); 1 =
   * offscreen blur+threshold pass that fuses overlapping particles into
   * liquid blobs. Heavy at high particle counts; pair with a particle-count
   * reduction. */
  metaballEnabled: number
  /** Glow radius per particle in CSS px before the threshold pass. Larger =
   * particles fuse more aggressively; smaller = more discrete blobs. */
  metaballGlowRadius: number
  /** Gaussian blur amount (CSS px) applied to the glow buffer before the
   * threshold. Higher = softer edges before the threshold cuts them. */
  metaballBlurPx: number
  /** Alpha threshold (0..1) for the metaball cutoff. Higher = harder, more
   * surface-tension edges; lower = softer, more diffuse. */
  metaballThreshold: number

  /** Fraction of particles flagged as "crema" (lighter mass) — they react
   * MORE strongly to cursor and vortex forces while keeping their gradient
   * colour. Visually reads as the lighter particles getting sucked into
   * eddies first while the heavier particles swing wider. 0 = disabled.
   *
   * Foam-status is hash-derived from the home position so it's deterministic:
   * the same particles are foam every refresh, but raising/lowering the
   * fraction live just shifts the cutoff threshold. */
  foamFraction: number
  /** Force multiplier applied to foam particles when the cursor-disk imparts
   * impulse. >1 = foam reacts more strongly than regular particles (lighter
   * mass). 1 = foam behaves identically to non-foam (effectively disabled). */
  foamForceMultiplier: number

  /** Pressure projection strength (0..1). Stam-style fluid-solver step that
   * subtracts the divergent component of the velocity field — without it, the
   * field smears uniformly outward; with it, vortices form and persist
   * naturally. 0 = disabled; 0.25-0.5 = clean curling; >0.7 may lock up. */
  fieldPressureStrength: number
  /** Number of pressure-projection passes per frame. More = closer to true
   * incompressibility, more expensive. 1-2 is usually enough. */
  fieldPressureIterations: number
  /** When > 0.5, the cursor force is INJECTED INTO THE FIELD (Newmix-style)
   * instead of pushed onto particles directly. The cursor force profile
   * (sideSwirl, frontPush, etc.) is preserved but it deposits velocity into
   * cells, which particles then read bilinearly. Combined with pressure
   * projection this is what makes the effect feel like stirring fluid
   * rather than pushing a rake through sand. */
  fieldDrivenCursor: number
  /** Cursor-stroke subdivision distance (bitmap px). When the cursor moves
   * more than this in a single frame, the inject is applied at every step
   * along the path so a fast flick deposits velocity everywhere it travelled.
   * Newmix uses 6px. 0 = no subdivision (only inject at endpoint). */
  fieldStrokeSubdivisionPx: number

  /** Render-time alpha boost on particles with non-trivial velocity.
   * `boost = min(velocityAlphaBoostCap, hypot(vx, vy) * velocityAlphaBoost)`
   * is added to the particle's alpha at draw time. Reproduces the Newmix
   * effect where particles in motion read slightly brighter than resting
   * particles, making the cursor's wake feel illuminated. 0 = disabled. */
  velocityAlphaBoost: number
  /** Maximum additional alpha contributed by `velocityAlphaBoost`. Caps the
   * effect so a fast-moving particle can't blow out to fully opaque. */
  velocityAlphaBoostCap: number

  /** Hard ceiling on per-particle velocity (bitmap px / frame). After every
   * velocity update, if `hypot(vx, vy) > limit`, the velocity is rescaled to
   * the limit. Newmix uses 30 px/frame — without this, a hot velocity field
   * can accelerate particles past the spring + friction's ability to counter,
   * producing long thin arcs that trace flow lines across the screen.
   * 0 disables the clamp. */
  particleSpeedLimit: number

  /** Asymmetric paddling — biases the cursor's force toward particles that
   * are BROADSIDE to the motion direction (perpendicular to heading), away
   * from particles that are along the heading. 0 = no bias (current
   * spherical-cursor behaviour). 1 = strong cos² weighting — the cursor reads
   * like the flat face of a spoon: hits sideways particles hard, slices past
   * the ones in line with motion. */
  paddleSharpness: number
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
  captureColorInvertMode: 0,
  captureColorInvertFadeMs: 150,
  captureColorInvertChance: 0.33,
  captureColorInvertGlowBoost: 0.3,
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
  vortexEllipseAspect: 1.6,
  vortexSpeedReference: 8.0,
  /** Velocity-field grid — disabled by default. Enable by raising
   * `fieldStrength` above 0 to introduce the lingering-momentum mechanic. */
  fieldStrength: 0.0,
  fieldGridResolution: 36,
  fieldInjectRadiusBmp: 70,
  fieldInjectStrength: 1.0,
  fieldInjectMinSpeedPxPerFrame: 0.0,
  fieldDecayPerSec: 0.55,
  fieldAdvectionStrength: 0.0,
  fieldDiffusion: 0.06,
  fieldRideStrength: 0.12,
  /** Curl-noise micro-turbulence — disabled by default. */
  curlNoiseAmplitude: 0.0,
  curlNoiseScale: 0.012,
  curlNoiseEvolutionHz: 0.4,
  /** Cursor-force speed coupling — disabled by default (classic constant force). */
  cursorForceSpeedCoupling: 0.0,
  cursorForceSpeedReference: 8.0,
  /** Boundary reflection — disabled by default. */
  boundaryRadiusFrac: 0.0,
  boundaryRestitution: 0.5,
  /** Flocking velocity alignment — disabled by default. */
  flockingStrength: 0.0,
  flockingRadiusBmp: 18,
  flockingProcessFraction: 0.5,
  /** Metaball renderer — disabled by default (direct putImageData is faster). */
  metaballEnabled: 0,
  metaballGlowRadius: 8,
  metaballBlurPx: 12,
  metaballThreshold: 0.45,
  /** Pressure projection — disabled by default; turn on alongside the field. */
  fieldPressureStrength: 0.0,
  fieldPressureIterations: 1,
  /** Cursor-driven field — disabled by default. Toggle on to switch to
   * Newmix-style cursor-pushes-field behaviour. */
  fieldDrivenCursor: 0,
  fieldStrokeSubdivisionPx: 6,
  /** Crema layer — disabled by default. */
  foamFraction: 0.0,
  foamForceMultiplier: 1.6,
  /** Render-time alpha boost on moving particles — disabled by default.
   * Recommended starting point: amount 0.05, cap 0.35 (subtle but visible). */
  velocityAlphaBoost: 0.0,
  velocityAlphaBoostCap: 0.35,
  /** Hard particle velocity clamp — Newmix uses 30 px/frame. */
  particleSpeedLimit: 30,
  /** Asymmetric paddling — disabled by default. */
  paddleSharpness: 0.0,
})

export function mergeNewmixLiveTuning(
  partial?: Partial<NewmixLiveTuning> | null
): NewmixLiveTuning {
  return {
    ...NEWMIX_LIVE_TUNING_DEFAULTS,
    ...partial,
  }
}
