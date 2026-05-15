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
import { useEffect, useMemo, useState } from "react"

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
 * means editing one function. */
function pickGame(): GameId {
  return Math.random() < 0.5 ? "tetris" : "invaders"
}

export default function GameRotation() {
  /** Pick on the client only — SSR would call Math.random() during render and
   * hydration would then mismatch when the client picked the other option. We
   * defer the pick until after mount and render an invisible placeholder of
   * the same height meanwhile so the page layout doesn't jump. */
  const [gameId, setGameId] = useState<GameId | null>(null)
  useEffect(() => {
    setGameId(pickGame())
  }, [])

  const Game = useMemo(
    () => (gameId === "tetris" ? TetrisGame : gameId === "invaders" ? InvadersGame : null),
    [gameId]
  )

  if (!gameId || !Game) {
    // Placeholder during SSR + the brief pre-mount client window. The actual
    // game canvas is much taller; reserving min-height here avoids a layout
    // shift when the game mounts on a 404 page.
    return (
      <div
        className="w-full max-w-7xl mt-6 small:mt-10 flex flex-col items-stretch px-0"
        aria-hidden
        style={{ minHeight: "32rem" }}
      />
    )
  }

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
