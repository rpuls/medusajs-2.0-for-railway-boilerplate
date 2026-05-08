"use client"

/**
 * Public entry point for the Space Invaders game. Re-exports the canvas-based
 * implementation so the lazy import in `game-rotation.tsx` resolves to a
 * standalone bundle.
 */
import InvadersInternal from "./invaders/component"

import type { GameComponentProps } from "./types"

export default function InvadersGame(props: GameComponentProps) {
  return <InvadersInternal {...props} />
}
