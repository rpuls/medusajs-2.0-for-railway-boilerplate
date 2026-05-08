"use client"

/**
 * Adapter that exposes <MiniTetris/> through the shared GameComponentProps
 * shape so the 404-page rotation can mount either game with identical props.
 *
 * Map note: Tetris's `size` accepts `"default" | "lg" | "xl"`; the shared
 * interface uses `"md" | "lg" | "xl"`. We translate "md" → "default" here so
 * the rest of the codebase doesn't have to know about the legacy alias.
 */
import MiniTetris from "@modules/common/components/mini-tetris"

import type { GameComponentProps } from "./types"

export default function TetrisGame({
  size = "xl",
  onScoreChange,
  onGameOverChange,
}: GameComponentProps) {
  const mappedSize = size === "md" ? "default" : size
  return (
    <MiniTetris
      size={mappedSize}
      onScoreChange={onScoreChange}
      onGameOverChange={onGameOverChange}
    />
  )
}
