/**
 * Shared interface every 404-page game implements. The page mounts whichever
 * component is selected by the rotation logic and treats both the same way.
 *
 * Both games today (Tetris, Space Invaders) are React components — they
 * "mount" and "unmount" through normal JSX rendering. The interface satisfies
 * the brief's mount/unmount/score/game-over requirements via standard React
 * idioms (callback props for state, lifecycle for cleanup).
 */
export type GameComponentProps = {
  /**
   * Sizing tier matching Tetris's `size` prop. Used by both games so the page
   * can request the same visual scale regardless of which game is mounted.
   */
  size?: "md" | "lg" | "xl"
  /**
   * Fired whenever the game's score changes (including resets). Optional so
   * pages that don't need score telemetry can omit it.
   */
  onScoreChange?: (score: number) => void
  /**
   * Fired when the game's game-over state changes — true on death, false on
   * restart.
   */
  onGameOverChange?: (gameOver: boolean) => void
}

/** Identifiers used by the rotation logic to pick a game. */
export type GameId = "tetris" | "invaders"

/** Display label shown in the section header. Pure data; no logic. */
export const GAME_LABELS: Record<GameId, string> = {
  tetris: "Tetris",
  invaders: "Space Invaders",
}
