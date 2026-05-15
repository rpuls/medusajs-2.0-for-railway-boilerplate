"use client"

import dynamic from "next/dynamic"
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react"

import { forceCollide } from "d3-force"

import type { GraphLink, GraphNode, GraphPayload } from "../../../types/graph"
import {
  LINK_COLOR,
  LINK_COLOR_DIMMED,
  LINK_COLOR_HIGHLIGHT,
  NODE_STYLE,
  nodeRadius,
} from "../lib/style"
import { getImage } from "../lib/image-pool"

/**
 * react-force-graph depends on `window` (canvas) so it must only render in
 * the browser. Next.js `dynamic(… { ssr: false })` handles this cleanly
 * inside a client component.
 *
 * The library exports a function component that accepts a mutable ref to its
 * imperative methods object. We cast to a minimal subset we actually use.
 */
type D3Force = {
  strength?: (value: number | ((d: unknown) => number)) => D3Force
  distance?: (value: number | ((link: unknown) => number)) => D3Force
  radius?: (value: number | ((d: unknown) => number)) => D3Force
  iterations?: (value: number) => D3Force
}

type ForceGraphMethods = {
  centerAt: (x: number, y: number, durationMs?: number) => unknown
  zoom: (scale: number, durationMs?: number) => unknown
  zoomToFit: (durationMs?: number, padding?: number) => unknown
  graph2ScreenCoords: (x: number, y: number) => { x: number; y: number }
  screen2GraphCoords: (x: number, y: number) => { x: number; y: number }
  d3Force: (name: string, force?: unknown) => D3Force | undefined
  d3ReheatSimulation?: () => unknown
}

type ForceGraph2DComponent = React.ComponentType<
  Record<string, unknown> & {
    ref?: MutableRefObject<ForceGraphMethods | undefined>
  }
>

const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d").then((mod) => mod.default as unknown as ForceGraph2DComponent),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-ui-fg-subtle">
        Loading graph…
      </div>
    ),
  }
) as ForceGraph2DComponent

/**
 * Shared label rasterizer. Draws a dark halo behind the label so it remains
 * readable over both the dark UI chrome and any background color.
 *
 * Canvas text is specified in the current transform's units (graph
 * coordinates), which then get multiplied by `globalScale` to produce screen
 * pixels. To keep labels at a constant on-screen size regardless of zoom, we
 * use `TARGET_SCREEN_PX / globalScale` as the graph-unit font size. The prior
 * `Math.max(11, ...)` floor accidentally grew text with zoom: at globalScale=3
 * it produced 11 graph units × 3 = 33 screen pixels, which is why a hovered
 * product label was spanning the whole viewport.
 *
 * NOTE: `lineJoin`/`lineCap` must be `round` — the canvas default is `miter`,
 * which produces spike artifacts at the sharp corners of characters when the
 * stroke is wide relative to the font size (most visible on Ws, Vs, Ks, etc.).
 */
const LABEL_TARGET_SCREEN_PX = 12

function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  globalScale: number,
  bold: boolean,
  color: string
) {
  const safeScale = Math.max(0.2, globalScale)
  const fontSize = LABEL_TARGET_SCREEN_PX / safeScale
  ctx.font = `${bold ? "600 " : ""}${fontSize}px Inter, system-ui, sans-serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "top"
  ctx.lineWidth = Math.max(2, fontSize / 3)
  ctx.lineJoin = "round"
  ctx.lineCap = "round"
  ctx.miterLimit = 2
  ctx.strokeStyle = "rgba(15, 23, 42, 0.85)"
  ctx.strokeText(text, x, y)
  ctx.fillStyle = color
  ctx.fillText(text, x, y)
}

export type ForceGraphHandle = {
  /** Center and zoom-to-fit on a specific node id. */
  focusNode: (nodeId: string, zoom?: number) => void
  /** Recenter the whole graph. */
  zoomToFit: (durationMs?: number, padding?: number) => void
}

type RenderNode = GraphNode & {
  x?: number
  y?: number
}

type RenderLink = GraphLink & {
  source: string | RenderNode
  target: string | RenderNode
}

type Props = {
  payload: GraphPayload
  /** Search input from the parent. Matching nodes are highlighted, others dimmed. */
  highlightQuery?: string
  /** Parent-controlled "selected" node (e.g. last-clicked). Selection persists until cleared. */
  selectedNodeId?: string | null
  onNodeClick: (node: GraphNode) => void
  onNodeHover: (node: GraphNode | null, clientXY: { x: number; y: number } | null) => void
  /** Control engine tick behavior — set `cooldownTicks={0}` once the user has settled. */
  cooldownTicks?: number
  onEngineStop?: () => void
  onBackgroundClick?: () => void
  className?: string
}

/** Duration in ms for the entry glow ring that pulses out from newly-added nodes. */
const GLOW_DURATION_MS = 900

export const ForceGraph = forwardRef<ForceGraphHandle, Props>(function ForceGraph(
  {
    payload,
    highlightQuery,
    selectedNodeId,
    onNodeClick,
    onNodeHover,
    cooldownTicks = 120,
    onEngineStop,
    onBackgroundClick,
    className,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const instanceRef = useRef<ForceGraphMethods | undefined>(undefined)
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  })
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

  // Track when each node first appeared so we can draw an entry glow ring.
  const nodeEntryTimesRef = useRef<Map<string, number>>(new Map())
  const knownNodeIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const now = Date.now()
    for (const node of payload.nodes) {
      if (!knownNodeIdsRef.current.has(node.id)) {
        knownNodeIdsRef.current.add(node.id)
        nodeEntryTimesRef.current.set(node.id, now)
      }
    }
  }, [payload.nodes])

  useEffect(() => {
    if (!containerRef.current) return
    const element = containerRef.current
    const update = () => {
      const rect = element.getBoundingClientRect()
      setDimensions({
        width: Math.max(1, Math.floor(rect.width)),
        height: Math.max(1, Math.floor(rect.height)),
      })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const normalizedQuery = highlightQuery?.trim().toLowerCase() ?? ""
  const hasQuery = normalizedQuery.length > 0

  const resolveLinkId = useCallback((value: unknown): string => {
    if (typeof value === "string") return value
    if (value && typeof value === "object" && "id" in value) {
      const id = (value as { id?: unknown }).id
      if (typeof id === "string") return id
    }
    return ""
  }, [])

  /**
   * Build the canonical graph data (node/link copies with string endpoints)
   * and an adjacency map keyed by node id. The adjacency map powers the
   * Obsidian-style "light up the neighborhood" highlight, and is only rebuilt
   * when the payload reference changes — hover/selection changes don't need
   * to re-derive it.
   */
  const { graphData, adjacency } = useMemo(() => {
    const nodes: RenderNode[] = payload.nodes.map((node) => ({ ...node }))
    const adj = new Map<string, Set<string>>()
    const links: RenderLink[] = payload.links.map((link) => {
      const source = resolveLinkId(link.source)
      const target = resolveLinkId(link.target)
      if (source && target) {
        if (!adj.has(source)) adj.set(source, new Set())
        if (!adj.has(target)) adj.set(target, new Set())
        adj.get(source)!.add(target)
        adj.get(target)!.add(source)
      }
      return { ...link, source, target }
    })
    return { graphData: { nodes, links }, adjacency: adj }
  }, [payload, resolveLinkId])

  /**
   * Derive the active highlight neighborhood. Precedence (highest first):
   *   1. Hovered node   — transient, follows mouse.
   *   2. Selected node  — persistent, last clicked.
   *   3. Search matches — every match + every direct neighbor.
   * If none of the above are active, `focusIds` is null meaning "render
   * everything in its resting color".
   */
  const { focusIds, matchCount, hasFocus } = useMemo(() => {
    const matchIdSet = new Set<string>()
    if (hasQuery) {
      for (const n of graphData.nodes) {
        if (n.label.toLowerCase().includes(normalizedQuery)) {
          matchIdSet.add(n.id)
        }
      }
    }

    const primary = hoveredNodeId ?? selectedNodeId ?? null
    if (primary) {
      const set = new Set<string>([primary])
      const neighbors = adjacency.get(primary)
      if (neighbors) {
        neighbors.forEach((id) => set.add(id))
      }
      return { focusIds: set, matchCount: matchIdSet.size, hasFocus: true }
    }

    if (matchIdSet.size > 0) {
      const set = new Set<string>(matchIdSet)
      matchIdSet.forEach((id) => {
        const neighbors = adjacency.get(id)
        if (neighbors) neighbors.forEach((n) => set.add(n))
      })
      return { focusIds: set, matchCount: matchIdSet.size, hasFocus: true }
    }

    return { focusIds: null as Set<string> | null, matchCount: 0, hasFocus: false }
  }, [graphData.nodes, adjacency, hoveredNodeId, selectedNodeId, hasQuery, normalizedQuery])

  const primaryNodeId = hoveredNodeId ?? selectedNodeId ?? null

  const nodeCanvasObject = useCallback(
    (node: RenderNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const style = NODE_STYLE[node.kind]
      const radius = nodeRadius(node.kind, node.productCount)
      const x = node.x ?? 0
      const y = node.y ?? 0

      const isPrimary = primaryNodeId === node.id
      const inFocus = focusIds?.has(node.id) ?? false
      const isDimmed = hasFocus && !inFocus

      const fill = inFocus ? style.highlightFill : style.fill
      const alpha = isDimmed ? 0.18 : 1

      if (node.kind === "product" && node.thumbnail && globalScale > 1.2) {
        const image = getImage(node.thumbnail)
        if (image) {
          ctx.save()
          ctx.globalAlpha = alpha
          ctx.beginPath()
          ctx.arc(x, y, radius + 1, 0, Math.PI * 2)
          ctx.closePath()
          ctx.clip()
          ctx.drawImage(image, x - radius, y - radius, radius * 2, radius * 2)
          ctx.restore()

          ctx.save()
          ctx.globalAlpha = alpha
          ctx.strokeStyle = isPrimary ? "#fbbf24" : inFocus ? style.highlightFill : style.stroke
          ctx.lineWidth = isPrimary ? 2 : inFocus ? 1.25 : 0.75
          ctx.beginPath()
          ctx.arc(x, y, radius + 0.5, 0, Math.PI * 2)
          ctx.stroke()
          ctx.restore()

          // Intentionally no canvas-drawn label for products: the DOM tooltip
          // that appears on hover already shows the product title, thumbnail
          // and price, so drawing the same text on the canvas just created a
          // huge redundant overlay that collided with the tooltip card.
          drawEntryGlow(ctx, node.id, x, y, radius, alpha, style.highlightFill, nodeEntryTimesRef)
          return
        }
      }

      /**
       * Brand nodes render their logo directly, clipped to a circle with no
       * background disc. The logo floats on the canvas — dark logos read fine
       * against the dark canvas background, and the ring stroke defines the
       * node boundary clearly. Falls back to the flat fill color while the
       * image is still loading or when the brand has no logo.
       */
      if (node.kind === "brand" && node.logoSrc) {
        const logo = getImage(node.logoSrc)
        if (logo) {
          const r = radius + 2

          // Clip logo to circle — transparent background, no white disc.
          ctx.save()
          ctx.globalAlpha = alpha
          ctx.beginPath()
          ctx.arc(x, y, r, 0, Math.PI * 2)
          ctx.clip()

          // Fit the logo inside the circle while preserving aspect ratio.
          // Pad a little so the glyph doesn't touch the circle edge.
          const pad = r * 0.22
          const maxW = (r - pad) * 2
          const maxH = (r - pad) * 2
          const ratio = logo.width / Math.max(1, logo.height)
          let drawW = maxW
          let drawH = maxW / ratio
          if (drawH > maxH) {
            drawH = maxH
            drawW = maxH * ratio
          }
          ctx.drawImage(logo, x - drawW / 2, y - drawH / 2, drawW, drawH)
          ctx.restore()

          // Ring — thicker and more colourful when in focus.
          ctx.save()
          ctx.globalAlpha = alpha
          ctx.strokeStyle = isPrimary
            ? "#fbbf24"
            : inFocus
            ? style.highlightFill
            : style.stroke
          ctx.lineWidth = isPrimary ? 3 : inFocus ? 2 : 1.25
          ctx.beginPath()
          ctx.arc(x, y, r + 0.5, 0, Math.PI * 2)
          ctx.stroke()
          ctx.restore()

          const highZoom = globalScale > 2.2
          const showLabel = highZoom || (hasFocus && inFocus)
          if (showLabel) {
            const labelColor = inFocus || isPrimary ? style.labelHighlightColor : style.labelColor
            drawLabel(ctx, node.label, x, y + r + 4, globalScale, isPrimary, labelColor)
          }
          drawEntryGlow(ctx, node.id, x, y, r, alpha, style.highlightFill, nodeEntryTimesRef)
          return
        }
      }

      ctx.save()
      ctx.globalAlpha = alpha
      ctx.fillStyle = fill
      ctx.strokeStyle = isPrimary ? "#fbbf24" : inFocus ? style.highlightFill : style.stroke
      ctx.lineWidth = isPrimary ? 2 : inFocus ? 1.25 : 0.75

      if (node.kind === "product") {
        const size = radius * 2
        ctx.fillRect(x - radius, y - radius, size, size)
        ctx.strokeRect(x - radius, y - radius, size, size)
      } else if (node.kind === "type") {
        // Diamond shape — visually distinct from circular brand/category nodes.
        ctx.beginPath()
        ctx.moveTo(x, y - radius)
        ctx.lineTo(x + radius, y)
        ctx.lineTo(x, y + radius)
        ctx.lineTo(x - radius, y)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      } else if (node.kind === "tag") {
        // Rounded square — smaller than type, softer than the sharp diamond.
        const cr = radius * 0.35
        const r = radius
        ctx.beginPath()
        ctx.moveTo(x - r + cr, y - r)
        ctx.lineTo(x + r - cr, y - r)
        ctx.quadraticCurveTo(x + r, y - r, x + r, y - r + cr)
        ctx.lineTo(x + r, y + r - cr)
        ctx.quadraticCurveTo(x + r, y + r, x + r - cr, y + r)
        ctx.lineTo(x - r + cr, y + r)
        ctx.quadraticCurveTo(x - r, y + r, x - r, y + r - cr)
        ctx.lineTo(x - r, y - r + cr)
        ctx.quadraticCurveTo(x - r, y - r, x - r + cr, y - r)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }

      /**
       * Label visibility:
       *   - Root label: always visible when zoomed in enough to be useful.
       *   - Brand/category/type/tag labels: only when the node is the primary
       *     focus OR adjacent to it. At high zoom every non-product label shows.
       */
      const isLabelEligibleKind =
        node.kind === "brand" ||
        node.kind === "category" ||
        node.kind === "type" ||
        node.kind === "tag" ||
        node.kind === "root"
      if (isLabelEligibleKind) {
        const highZoom = globalScale > 2.2
        const rootAlwaysShown = node.kind === "root" && globalScale > 0.9
        const showLabel = rootAlwaysShown || highZoom || (hasFocus && inFocus)
        if (showLabel) {
          const labelColor = inFocus || isPrimary ? style.labelHighlightColor : style.labelColor
          const bold = isPrimary
          drawLabel(ctx, node.label, x, y + radius + 3, globalScale, bold, labelColor)
        }
      }

      ctx.restore()

      drawEntryGlow(ctx, node.id, x, y, radius, alpha, style.highlightFill, nodeEntryTimesRef)
    },
    [focusIds, hasFocus, primaryNodeId]
  )

  const nodePointerAreaPaint = useCallback(
    (node: RenderNode, color: string, ctx: CanvasRenderingContext2D) => {
      const radius = nodeRadius(node.kind, node.productCount) + 2
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, Math.PI * 2)
      ctx.fill()
    },
    []
  )

  const linkColor = useCallback(
    (link: RenderLink) => {
      if (!hasFocus) return LINK_COLOR
      const sourceId = resolveLinkId(link.source)
      const targetId = resolveLinkId(link.target)
      // A link is "in focus" when both ends are in the focus set. Using `both`
      // rather than `either` keeps the highlighted subgraph connected and
      // avoids painting stray links whose other end is in the dimmed cloud.
      if (focusIds?.has(sourceId) && focusIds?.has(targetId)) {
        return LINK_COLOR_HIGHLIGHT
      }
      return LINK_COLOR_DIMMED
    },
    [hasFocus, focusIds, resolveLinkId]
  )

  const linkWidth = useCallback(
    (link: RenderLink) => {
      if (!hasFocus) return 0.8
      const sourceId = resolveLinkId(link.source)
      const targetId = resolveLinkId(link.target)
      if (focusIds?.has(sourceId) && focusIds?.has(targetId)) return 1.6
      return 0.4
    },
    [hasFocus, focusIds, resolveLinkId]
  )

  /**
   * Emit flowing particles along links that are part of the active highlight
   * neighbourhood. Particles give links a sense of direction and make the
   * selected subgraph feel alive without adding visual clutter at rest.
   */
  const linkDirectionalParticles = useCallback(
    (link: RenderLink) => {
      if (!hasFocus) return 0
      const sourceId = resolveLinkId(link.source)
      const targetId = resolveLinkId(link.target)
      return focusIds?.has(sourceId) && focusIds?.has(targetId) ? 4 : 0
    },
    [hasFocus, focusIds, resolveLinkId]
  )

  const linkDirectionalParticleWidth = useCallback(
    (link: RenderLink) => {
      if (!hasFocus) return 0
      const sourceId = resolveLinkId(link.source)
      const targetId = resolveLinkId(link.target)
      return focusIds?.has(sourceId) && focusIds?.has(targetId) ? 2 : 0
    },
    [hasFocus, focusIds, resolveLinkId]
  )

  const handleNodeHover = useCallback(
    (node: RenderNode | null, _previous: RenderNode | null) => {
      setHoveredNodeId(node?.id ?? null)

      if (!node) {
        onNodeHover(null, null)
        return
      }
      const container = containerRef.current
      if (!container || node.x == null || node.y == null) {
        onNodeHover(node, null)
        return
      }
      const rect = container.getBoundingClientRect()
      const instance = instanceRef.current
      if (instance?.graph2ScreenCoords) {
        const screen = instance.graph2ScreenCoords(node.x, node.y)
        onNodeHover(node, {
          x: rect.left + screen.x,
          y: rect.top + screen.y,
        })
        return
      }
      onNodeHover(node, { x: rect.left + node.x, y: rect.top + node.y })
    },
    [onNodeHover]
  )

  const handleNodeClick = useCallback(
    (node: RenderNode) => {
      onNodeClick(node)
    },
    [onNodeClick]
  )

  const handleBackgroundClick = useCallback(() => {
    onBackgroundClick?.()
  }, [onBackgroundClick])

  useImperativeHandle(
    ref,
    () => ({
      focusNode(nodeId: string, zoom = 2.5) {
        const node = graphData.nodes.find((n) => n.id === nodeId)
        const instance = instanceRef.current
        if (!node || !instance) return
        if (typeof node.x === "number" && typeof node.y === "number") {
          instance.centerAt(node.x, node.y, 600)
          instance.zoom(zoom, 600)
        }
      },
      zoomToFit(durationMs = 500, padding = 80) {
        instanceRef.current?.zoomToFit(durationMs, padding)
      },
    }),
    [graphData.nodes]
  )

  /**
   * Tune the underlying d3-force simulation for a dense, Obsidian-style
   * circular layout. Default react-force-graph parameters are tuned for sparse
   * networks and make brand→product halos drift far from the center; we
   * shorten links, soften repulsion, and add a collision force so nodes pack
   * tightly without overlapping.
   *
   * Re-run whenever the payload identity changes because expanding a node
   * swaps in a new `graphData` reference and d3 rebuilds its force state.
   */
  useEffect(() => {
    const instance = instanceRef.current
    if (!instance?.d3Force) return

    const link = instance.d3Force("link")
    link?.distance?.((l: unknown) => {
      const kind = (l as { kind?: string } | null)?.kind
      // Product→brand / product→category / product→type / product→tag halos
      // hug their hub tightly. Hub→root links are intentionally long so
      // super-nodes spread into a wide ring around the center, leaving room
      // for every label to sit on its own without colliding with neighbors.
      if (kind === "product-brand" || kind === "product-category") return 14
      if (kind === "product-type") return 18
      if (kind === "product-tag") return 14
      if (kind === "category-parent") return 20
      if (kind === "brand-root") return 120
      if (kind === "category-root") return 95
      if (kind === "type-root") return 90
      if (kind === "tag-root") return 72
      return 60
    })
    link?.strength?.(0.55)

    const charge = instance.d3Force("charge")
    charge?.strength?.((d: unknown) => {
      const kind = (d as { kind?: string } | null)?.kind
      // Stronger repulsion on brand / category / type super-nodes so they
      // actively push each other apart around the ring.
      if (kind === "root") return -380
      if (kind === "brand") return -260
      if (kind === "category") return -160
      if (kind === "type") return -200
      if (kind === "tag") return -110
      return -18
    })

    instance.d3Force(
      "collide",
      forceCollide()
        .radius((d: unknown) => {
          const node = d as RenderNode
          return nodeRadius(node.kind, node.productCount) + 1.5
        })
        .iterations(2)
    )

    const center = instance.d3Force("center")
    center?.strength?.(0.08)

    instance.d3ReheatSimulation?.()
  }, [graphData])

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full ${className ?? ""}`}
      role="application"
      aria-label={`Product graph with ${graphData.nodes.length} nodes${
        hasQuery ? `, ${matchCount} matching search` : ""
      }`}
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <ForceGraph2D
          ref={instanceRef}
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="transparent"
          nodeRelSize={4}
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={nodePointerAreaPaint}
          linkColor={linkColor}
          linkWidth={linkWidth}
          linkCurvature={0.12}
          linkDirectionalParticles={linkDirectionalParticles}
          linkDirectionalParticleWidth={linkDirectionalParticleWidth}
          linkDirectionalParticleColor={() => LINK_COLOR_HIGHLIGHT}
          linkDirectionalParticleSpeed={0.004}
          cooldownTicks={cooldownTicks}
          onEngineStop={onEngineStop}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          onBackgroundClick={handleBackgroundClick}
          enableNodeDrag={true}
          warmupTicks={15}
          d3AlphaDecay={0.055}
          d3VelocityDecay={0.42}
        />
      )}
    </div>
  )
})

/**
 * Draw a softly expanding glow ring around a node for the first GLOW_DURATION_MS
 * after it first appears. The ring pulses outward and fades to transparent so
 * the "arriving" motion is visible without being distracting.
 *
 * Extracted as a standalone function so it can be called consistently across
 * every branch of nodeCanvasObject (product thumbnail, brand logo, generic circle).
 */
function drawEntryGlow(
  ctx: CanvasRenderingContext2D,
  nodeId: string,
  x: number,
  y: number,
  radius: number,
  baseAlpha: number,
  glowColor: string,
  entryTimesRef: React.MutableRefObject<Map<string, number>>
) {
  const entryTime = entryTimesRef.current.get(nodeId)
  if (entryTime === undefined) return
  const age = Date.now() - entryTime
  if (age >= GLOW_DURATION_MS) return

  const t = age / GLOW_DURATION_MS // 0 → 1 over glow duration
  const fade = Math.pow(1 - t, 1.4) // fast-out easing: strong at 0, zero at 1
  const ringRadius = radius * (1 + 0.8 * t) // ring expands outward

  ctx.save()
  ctx.globalAlpha = baseAlpha * fade * 0.7
  ctx.strokeStyle = glowColor
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(x, y, ringRadius, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}
