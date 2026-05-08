/**
 * Layout, gameplay, and visual constants for Space Invaders. Centralised so
 * tuning is one file edit; nothing here is magic.
 *
 * Coordinate system: the playfield uses an internal "logical" pixel space.
 * Width = `LOGICAL_W`, height = `LOGICAL_H`. The renderer scales this to
 * whatever CSS-px size the container has.
 */

/** ============== Playfield dimensions (logical px) ============== */
/** Logical playfield aspect ratio (4:5) — matches Tetris's 10×20 portrait
 * footprint so both games occupy the same visual slot on the 404 page. */
export const LOGICAL_W = 320
export const LOGICAL_H = 400

/** ============== Player ship ============== */
export const PLAYER_W = 22
export const PLAYER_H = 12
export const PLAYER_Y = LOGICAL_H - 22
export const PLAYER_SPEED = 3.4
/** Tilt animation (radians). Spring-driven; lerps toward target each frame. */
export const PLAYER_TILT_MAX = 0.32
export const PLAYER_TILT_LERP = 0.18
/** Frames of invulnerability after respawn. ~120 frames at 60fps = 2s. */
export const PLAYER_INVULN_FRAMES = 120
/** Frames between consecutive shots — small cooldown so mash-firing doesn't
 * stack a bullet wall. */
export const PLAYER_FIRE_COOLDOWN_FRAMES = 18

/** ============== Projectiles ============== */
export const BULLET_W = 2
export const BULLET_H = 8
export const PLAYER_BULLET_SPEED = 6
export const ALIEN_BULLET_SPEED = 3.4
/** Trail length — last N positions are drawn at decreasing alpha. */
export const BULLET_TRAIL_LENGTH = 6

/** ============== Aliens (formation) ============== */
/** Formation grid: 11 wide × 5 tall = 55 aliens, classic SI count. */
export const ALIEN_COLS = 11
export const ALIEN_ROWS = 5
export const ALIEN_W = 16
export const ALIEN_H = 12
/** Spacing between aliens in the formation (centre-to-centre). */
export const ALIEN_HSPACE = 22
export const ALIEN_VSPACE = 18
/** Step distance per advance frame (logical px). */
export const ALIEN_STEP_X = 6
export const ALIEN_DROP_Y = 12
/** Frames between formation steps when ALL aliens are alive. The formation
 * speeds up as aliens are killed; remaining aliens linearly scale this down
 * toward `ALIEN_STEP_FRAMES_MIN`. */
export const ALIEN_STEP_FRAMES_FULL = 48
export const ALIEN_STEP_FRAMES_MIN = 6
/** Wave counter shifts the formation start position downward; cap so it
 * doesn't push the formation into the player on wave 1. */
export const ALIEN_WAVE_DROP = 12
export const ALIEN_MAX_WAVE_DROPS = 6
/** Per-row points (top row = highest). */
export const ALIEN_POINTS = [40, 30, 20, 10, 10] as const
/** RGB triples per row index. Top row uses brand teal so the highest-value
 * aliens visually stand out. */
export const ALIEN_RGB: ReadonlyArray<readonly [number, number, number]> = [
  [61, 207, 194], // teal — top row (40 pts)
  [181, 86, 255], // violet
  [69, 164, 255], // blue
  [255, 193, 69], // yellow
  [193, 255, 69], // lime — bottom row (10 pts)
]
/** Two-frame walk cycle is keyed on the formation step counter (0/1). */
export const ALIEN_FRAMES = 2

/** Probability per frame an arbitrary alive alien fires. Scaled with wave so
 * later waves are more aggressive. */
export const ALIEN_FIRE_BASE_PROB = 0.012
export const ALIEN_FIRE_WAVE_GAIN = 0.004
/** Cap on simultaneously airborne alien bullets. */
export const ALIEN_BULLET_CAP = 4

/** Adjacent-flinch animation when a neighbor alien dies. */
export const FLINCH_FRAMES = 14
export const FLINCH_SCALE = 0.78

/** ============== Barriers ============== */
/** Four barriers, evenly spaced across the lower-third of the playfield. */
export const BARRIER_COUNT = 4
export const BARRIER_Y = LOGICAL_H - 70
/** Each barrier is a `BARRIER_GRID_W × BARRIER_GRID_H` grid of small chunks
 * that erode independently when shot. */
export const BARRIER_GRID_W = 8
export const BARRIER_GRID_H = 5
export const BARRIER_CHUNK_SIZE = 4

/** ============== UFO ============== */
/** Seconds-of-game between UFO spawns; randomised between min/max. */
export const UFO_INTERVAL_MIN_FRAMES = 60 * 12
export const UFO_INTERVAL_MAX_FRAMES = 60 * 22
export const UFO_SPEED = 1.6
export const UFO_Y = 30
export const UFO_W = 24
export const UFO_H = 10
export const UFO_WOBBLE_AMP = 2
export const UFO_WOBBLE_HZ = 1.2
export const UFO_POINTS_MIN = 100
export const UFO_POINTS_MAX = 300

/** ============== Wave / lives ============== */
export const STARTING_LIVES = 3
/** When wave clears, formation drops by N rows for next wave. */
export const WAVE_DROP_PER_WAVE = 1

/** ============== Visual feedback ============== */
/** Screen-shake decay (per-frame multiplier). */
export const SHAKE_DECAY = 0.86
/** Death wash duration (frames). */
export const DEATH_WASH_FRAMES = 28
/** Wave-card slide duration (frames in / hold / out). */
export const WAVE_CARD_IN_FRAMES = 18
export const WAVE_CARD_HOLD_FRAMES = 60
export const WAVE_CARD_OUT_FRAMES = 18

/** ============== Particle palette ============== */
/** Brand wordmark gradient is shared via wordmark-gradient.ts; these are
 * additional pure RGB tints for overlay flair. */
export const SCORE_POPUP_RGB: readonly [number, number, number] = [
  255, 46, 99,
] // brand magenta — score popups stand out against teal/blue alien colours
export const PLAYER_RGB: readonly [number, number, number] = [
  61, 207, 194,
] // brand teal
export const PLAYER_THRUSTER_RGB: readonly [number, number, number] = [
  255, 193, 69,
] // brand yellow — warm against the cool teal ship
export const UFO_RGB: readonly [number, number, number] = [
  255, 46, 99,
] // brand magenta
