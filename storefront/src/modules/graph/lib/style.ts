import type { NodeKind } from "../../../types/graph"

export type NodeStyle = {
  /** Resting fill when the node is unrelated to the active focus/hover. */
  fill: string
  /** Fill used when the node is hovered, selected, or adjacent to focus. */
  highlightFill: string
  stroke: string
  baseRadius: number
  /** Label color in the resting state. */
  labelColor: string
  /** Label color in the highlighted state. */
  labelHighlightColor: string
}

/**
 * Visual tokens for each node kind. Colors are hard-coded hex here rather than
 * CSS vars because react-force-graph-2d renders to canvas, which cannot
 * inherit CSS variables.
 *
 * Palette follows an Obsidian-style aesthetic: nodes sit in a muted resting
 * state and only "light up" to their highlight color when they are hovered,
 * selected, or adjacent to the active node. This keeps the default view calm
 * and reserves color saliency for the interactive neighborhood.
 */
export const NODE_STYLE: Record<NodeKind, NodeStyle> = {
  root: {
    fill: "#d1d5db",
    highlightFill: "#f8fafc",
    stroke: "#64748b",
    baseRadius: 12,
    labelColor: "#475569",
    labelHighlightColor: "#f8fafc",
  },
  brand: {
    fill: "#64748b",
    highlightFill: "#2dd4bf",
    stroke: "#94a3b8",
    baseRadius: 9,
    labelColor: "#94a3b8",
    labelHighlightColor: "#f1f5f9",
  },
  category: {
    fill: "#6b7280",
    highlightFill: "#fb923c",
    stroke: "#94a3b8",
    baseRadius: 7,
    labelColor: "#94a3b8",
    labelHighlightColor: "#f1f5f9",
  },
  type: {
    fill: "#5b21b6",
    highlightFill: "#a78bfa",
    stroke: "#7c3aed",
    baseRadius: 7,
    labelColor: "#a78bfa",
    labelHighlightColor: "#ede9fe",
  },
  tag: {
    fill: "#78350f",
    highlightFill: "#fbbf24",
    stroke: "#b45309",
    baseRadius: 5.5,
    labelColor: "#d97706",
    labelHighlightColor: "#fef3c7",
  },
  product: {
    fill: "#94a3b8",
    highlightFill: "#93c5fd",
    stroke: "#cbd5e1",
    baseRadius: 4,
    labelColor: "#94a3b8",
    labelHighlightColor: "#e0e7ff",
  },
}

/**
 * Scale node radius slightly by its associated product count so heavy brands
 * / categories visually out-weigh long-tail ones.
 */
export function nodeRadius(kind: NodeKind, productCount?: number): number {
  const base = NODE_STYLE[kind].baseRadius
  if (!productCount || productCount <= 0 || kind === "product" || kind === "root") {
    return base
  }
  return base + Math.min(8, Math.log2(productCount + 1))
}

/** Default link color: visible cool grey so the web structure reads clearly. */
export const LINK_COLOR = "rgba(148, 163, 184, 0.4)"
/** Link color when the link touches the hovered/selected/search-matched node. */
export const LINK_COLOR_HIGHLIGHT = "rgba(147, 197, 253, 0.95)"
/** Link color for links that are neither active nor adjacent to the focus. */
export const LINK_COLOR_DIMMED = "rgba(148, 163, 184, 0.06)"
