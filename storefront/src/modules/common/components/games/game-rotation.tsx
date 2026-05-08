"use client"

/**
 * Client island that picks ONE game per pageview (50/50 between Tetris and
 * Space Invaders) and lazy-loads its bundle. Users only download the bundle
 * for the game they're served. The pick is computed on first render via
 * useState's lazy initialiser so it's stable for the lifetime of the page —
 * a refresh re-rolls.
 *
 * This component is also responsible for the surrounding chrome (the
 * "While you're here..." copy and the layout wrapper). Both games render at
 * the same visual scale so the section keeps the same footprint regardless
 * of which one mounted.
 */
import dynamic from "next/dynamic"
import { useMemo, useState } from "react"

import type { GameComponentProps, GameId } from "./types"
import { GAME_LABELS } from "./types"

/** Lazy-loaded Tetris. SSR off because the canvas + RAF code is client-only. */
const TetrisGame = dynamic<GameComponentProps>(
  () => import("./tetris-game"),
  { ssr: false }
)

/** Lazy-loaded Space Invaders. */
const InvadersGame = dynamic<GameComponentProps>(
  () => import("./invaders-game"),
  { ssr: false }
)

/** Pure rotation policy. Currently a 50/50 random coin flip; centralised here
 * so changing the policy (e.g. weighting toward the new game during launch)
 * means editing one function. Returns a stable result for the page lifetime
 * because the caller stores it in state. */
function pickGame(): GameId {
  return Math.random() < 0.5 ? "tetris" : "invaders"
}

export default function GameRotation() {
  /** Pick once on mount. Stored in state so re-renders don't re-roll. */
  const [gameId] = useState<GameId>(() => pickGame())
  const Game = useMemo(
    () => (gameId === "tetris" ? TetrisGame : InvadersGame),
    [gameId]
  )
  const label = GAME_LABELS[gameId]
  const intro =
    gameId === "tetris"
      ? "While you’re here, you can play a quick round of Tetris."
      : "While you’re here, defend the wordmark. A round of Space Invaders."

  return (
    <div className="w-full max-w-7xl mt-6 small:mt-10 flex flex-col items-stretch px-0">
      <p className="text-sm text-ui-fg-muted text-center mb-3">{intro}</p>
      <div className="flex justify-center w-full">
        <Game size="xl" />
      </div>
      <p className="sr-only" aria-live="polite">
        {label} loaded.
      </p>
    </div>
  )
}
