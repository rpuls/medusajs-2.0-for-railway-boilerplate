"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { useTransitionRouter } from "next-view-transitions"

import type { GraphNode, GraphPayload } from "../../../types/graph"
import { ForceGraph, type ForceGraphHandle } from "../components/force-graph"
import { GraphFilters, type GraphVisibility } from "../components/graph-filters"
import { GraphLegend } from "../components/graph-legend"
import { GraphSearch } from "../components/graph-search"
import { GraphTooltip } from "../components/graph-tooltip"
import { useGraphExpansion } from "../hooks/use-graph-expansion"
import { filterPayload } from "../lib/merge"
import { preloadImages } from "../lib/image-pool"

type Props = {
  initialPayload: GraphPayload
  /** Optional `focus` query param — `brand:<Name>` or `cat:<id>` to auto-expand + center. */
  initialFocus?: string | null
}

const DEFAULT_VISIBILITY: GraphVisibility = {
  root: true,
  brand: true,
  category: true,
  type: true,
  tag: false, // tags are numerous — off by default, user can enable via the filter panel
  product: true,
}

export function ExploreTemplate({ initialPayload, initialFocus }: Props) {
  const params = useParams()
  const countryCode = Array.isArray(params?.countryCode)
    ? params.countryCode[0]
    : (params?.countryCode as string | undefined)
  const router = useTransitionRouter()

  const [visibility, setVisibility] = useState<GraphVisibility>(DEFAULT_VISIBILITY)
  const [search, setSearch] = useState<string>("")
  const [hovered, setHovered] = useState<{
    node: GraphNode | null
    position: { x: number; y: number } | null
  }>({ node: null, position: null })
  const [settled, setSettled] = useState<boolean>(false)

  const graphRef = useRef<ForceGraphHandle | null>(null)
  const [lastExpandedId, setLastExpandedId] = useState<string | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const {
    payload,
    state,
    error,
    expandedNodeIds,
    expandNode,
    loadMore,
    getExpansionInfo,
    prefetchTopBrands,
  } = useGraphExpansion({ initialPayload, expansionLimit: 200 })

  const filteredPayload = useMemo(
    () => filterPayload(payload, visibility),
    [payload, visibility]
  )

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (node.kind === "product" && node.handle) {
        const cc = countryCode ?? "au"
        router.push(`/${cc}/products/${node.handle}`)
        return
      }
      setSelectedNodeId(node.id)
      if (
        node.kind === "brand" ||
        node.kind === "category" ||
        node.kind === "type" ||
        node.kind === "tag"
      ) {
        if (!expandedNodeIds.has(node.id)) {
          void expandNode(node)
        }
        setLastExpandedId(node.id)
        setSettled(false)
        graphRef.current?.focusNode(node.id, 2.5)
      }
    },
    [countryCode, router, expandNode, expandedNodeIds]
  )

  const handleBackgroundClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  const lastInfo = lastExpandedId ? getExpansionInfo(lastExpandedId) : null
  const lastNode = lastExpandedId
    ? payload.nodes.find((n) => n.id === lastExpandedId) ?? null
    : null
  const canLoadMore = Boolean(lastInfo && lastInfo.loaded < lastInfo.total)
  /**
   * Empty-state flag: user expanded a brand/category but the backend returned
   * zero products. Surfaced in the HUD so it's clear the graph is working and
   * the category is genuinely empty, rather than looking like a bug.
   */
  const emptyExpansion = Boolean(
    lastNode &&
      lastInfo &&
      lastInfo.total === 0 &&
      state !== "loading" &&
      (lastNode.kind === "brand" ||
        lastNode.kind === "category" ||
        lastNode.kind === "type" ||
        lastNode.kind === "tag")
  )

  const handleLoadMore = useCallback(() => {
    if (!lastNode) return
    void loadMore(lastNode)
  }, [lastNode, loadMore])

  const handleNodeHover = useCallback(
    (node: GraphNode | null, position: { x: number; y: number } | null) => {
      setHovered({ node, position })
    },
    []
  )

  /** Deep-link focus: when `?focus=brand:Ramo` is present, expand + center. */
  useEffect(() => {
    if (!initialFocus) return
    const node = payload.nodes.find((n) => n.id === initialFocus)
    if (!node) return
    if (
      (node.kind === "brand" ||
        node.kind === "category" ||
        node.kind === "type" ||
        node.kind === "tag") &&
      !expandedNodeIds.has(node.id)
    ) {
      void expandNode(node)
    }
    const handle = window.setTimeout(() => {
      graphRef.current?.focusNode(node.id, 2.5)
    }, 500)
    return () => window.clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFocus])

  /** Warm up thumbnails + brand logos + top brands once the initial engine run settles. */
  useEffect(() => {
    if (!settled) return
    preloadImages([
      ...payload.nodes.map((n) => n.thumbnail),
      ...payload.nodes.map((n) => n.logoSrc),
    ])
    prefetchTopBrands(3)
  }, [settled, payload.nodes, prefetchTopBrands])

  const hasAutoFittedRef = useRef(false)
  const onEngineStop = useCallback(() => {
    setSettled(true)
    // Frame the whole graph exactly once on the first settle so the tight
    // Obsidian-style cluster fills the viewport. Subsequent expansions keep
    // the user's current camera position.
    if (!hasAutoFittedRef.current) {
      hasAutoFittedRef.current = true
      if (!initialFocus) {
        window.setTimeout(() => graphRef.current?.zoomToFit(400, 60), 50)
      }
    }
  }, [initialFocus])

  const totalNodes = payload.nodes.length
  const visibleNodes = filteredPayload.nodes.length

  return (
    <section className="relative h-[calc(100vh-var(--nav-height,72px))] w-full overflow-hidden bg-ui-bg-base">
      <div className="pointer-events-none absolute inset-0">
        <ForceGraph
          ref={graphRef}
          payload={filteredPayload}
          highlightQuery={search}
          selectedNodeId={selectedNodeId}
          onNodeClick={handleNodeClick}
          onNodeHover={handleNodeHover}
          onBackgroundClick={handleBackgroundClick}
          onEngineStop={onEngineStop}
          cooldownTicks={settled ? 0 : 120}
          className="pointer-events-auto"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 p-4">
        <div className="pointer-events-auto mx-auto flex max-w-3xl items-start gap-2 small:max-w-2xl">
          <GraphSearch value={search} onChange={setSearch} />
        </div>
      </div>

      <div className="pointer-events-none absolute right-4 top-4 flex flex-col gap-2">
        <div className="pointer-events-auto">
          <GraphFilters value={visibility} onChange={setVisibility} />
        </div>
        <div className="pointer-events-auto">
          <GraphLegend />
        </div>
        <div className="pointer-events-auto flex flex-col gap-2 rounded-xl border border-ui-border-base bg-ui-bg-base/90 p-3 text-xsmall-regular text-ui-fg-subtle backdrop-blur">
          <p>
            {visibleNodes.toLocaleString()} of {totalNodes.toLocaleString()} nodes
          </p>
          {state === "loading" ? <p>Expanding…</p> : null}
          {state === "error" && error ? <p className="text-rose-400">{error}</p> : null}
          {emptyExpansion && lastNode ? (
            <p className="text-ui-fg-muted">
              No products are currently assigned to <strong>{lastNode.label}</strong>.
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => graphRef.current?.zoomToFit(500, 80)}
            className="rounded-md border border-ui-border-base bg-ui-bg-base px-2 py-1 text-left text-ui-fg-base hover:bg-ui-bg-subtle"
          >
            Fit view
          </button>
          {canLoadMore && lastNode && lastInfo ? (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={state === "loading"}
              className="rounded-md border border-ui-border-base bg-ui-bg-base px-2 py-1 text-left text-ui-fg-base hover:bg-ui-bg-subtle disabled:opacity-60"
            >
              Load more from {lastNode.label}
              <span className="ml-1 text-ui-fg-subtle">
                ({lastInfo.loaded}/{lastInfo.total})
              </span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 max-w-sm rounded-xl border border-ui-border-base bg-ui-bg-base/80 p-3 text-xsmall-regular text-ui-fg-subtle backdrop-blur">
        <p>
          Drag to pan, scroll to zoom. Click a brand or category to expand its products. Click
          a product to open it.
        </p>
      </div>

      <GraphTooltip node={hovered.node} position={hovered.position} />
    </section>
  )
}
