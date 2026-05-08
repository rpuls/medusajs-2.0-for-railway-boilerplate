/**
 * Game events emitted from the tick to the particle overlay. The tick is
 * pure state mutation; visual reactions (particles, screen shake, score
 * popups) are produced by reading these events.
 *
 * Mirrors the pattern used in Tetris where lock/clear/rotate events are
 * detected via state diffing inside the overlay's RAF loop. Here we let the
 * tick own the event stream (cleaner because the tick already knows the
 * cause-and-effect and detection-via-diff would lose context like which
 * alien fired the killing shot).
 */

export type GameEvent =
  | { kind: "alienKilled"; col: number; row: number; x: number; y: number; points: number }
  | { kind: "ufoKilled"; x: number; y: number; points: number }
  | { kind: "playerHit"; x: number; y: number }
  | { kind: "playerRespawn"; x: number; y: number }
  | { kind: "playerFire"; x: number; y: number }
  | { kind: "barrierHit"; x: number; y: number }
  | { kind: "alienFire"; x: number; y: number }
  | { kind: "waveCleared"; wave: number }
  | { kind: "waveStart"; wave: number }
  | { kind: "gameOver" }
  | { kind: "scorePopup"; x: number; y: number; points: number }

export type EventSink = (event: GameEvent) => void
