"use client"

import { useCallback, useMemo, useRef, useState } from "react"

import type { GraphNode, GraphPayload } from "../../../types/graph"
import { mergePayloads } from "../lib/merge"
import { preloadImages } from "../lib/image-pool"

type ExpansionState = "idle" | "loading" | "error"

type ClientFetcher = (params: URLSearchParams) => Promise<GraphPayload>

/**
 * Calls the Medusa backend `/store/graph` directly from the client. We don't
 * use the server-only `@lib/data/graph` helpers here because this runs after
 * hydration; we do reuse the same `NEXT_PUBLIC_MEDUSA_BACKEND_URL` + publishable
 * key pattern already in place for other storefront fetches.
 */
function getBackendBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  if (!raw) {
    throw new Error("NEXT_PUBLIC_MEDUSA_BACKEND_URL is not set")
  }
  return raw.replace(/\/+$/, "").replace(/\/store$/, "")
}

const defaultClientFetcher: ClientFetcher = async (params) => {
  const base = getBackendBaseUrl()
  const url = `${base}/store/graph?${params.toString()}`
  const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY?.trim()
  const headers: Record<string, string> = {}
  if (key) headers["x-publishable-api-key"] = key
  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`Graph fetch failed: ${response.status}`)
  }
  return (await response.json()) as GraphPayload
}

export type UseGraphExpansionOptions = {
  initialPayload: GraphPayload
  fetcher?: ClientFetcher
  /** Per-request product limit. */
  expansionLimit?: number
}

export type ExpansionInfo = {
  /** Total products available on the server for this node. */
  total: number
  /** Count that has been merged into the client payload so far. */
  loaded: number
}

export type UseGraphExpansionResult = {
  payload: GraphPayload
  state: ExpansionState
  error: string | null
  expandedNodeIds: Set<string>
  /** Expand a brand or category node's children in place. No-op for products/root. */
  expandNode: (node: GraphNode) => Promise<void>
  /** Fetch the next page for an already-expanded node. */
  loadMore: (node: GraphNode) => Promise<void>
  /** Per-node expansion info — used to drive "Load more" affordances. */
  getExpansionInfo: (nodeId: string) => ExpansionInfo | null
  /**
   * Warm up by expanding the top-N brand nodes during idle. Safe to call
   * multiple times; already-expanded brands are skipped.
   */
  prefetchTopBrands: (count?: number) => void
}

export function useGraphExpansion(
  options: UseGraphExpansionOptions
): UseGraphExpansionResult {
  const { initialPayload, fetcher = defaultClientFetcher, expansionLimit = 200 } = options

  const [payload, setPayload] = useState<GraphPayload>(initialPayload)
  const [state, setState] = useState<ExpansionState>("idle")
  const [error, setError] = useState<string | null>(null)

  const expandedRef = useRef<Set<string>>(new Set())
  const inFlightRef = useRef<Map<string, Promise<void>>>(new Map())
  const cacheRef = useRef<Map<string, GraphPayload>>(new Map())
  const infoRef = useRef<Map<string, ExpansionInfo>>(new Map())

  const buildParams = useCallback(
    (node: GraphNode, offset: number): URLSearchParams | null => {
      if (!["brand", "category", "type", "tag"].includes(node.kind)) return null
      const params = new URLSearchParams()
      if (node.kind === "brand") {
        params.set("mode", "brand")
        params.set("brand", node.label)
      } else if (node.kind === "category") {
        params.set("mode", "category")
        const categoryId = node.id.startsWith("cat:") ? node.id.slice(4) : node.id
        params.set("category_id", categoryId)
      } else if (node.kind === "type") {
        params.set("mode", "type")
        const typeId = node.id.startsWith("type:") ? node.id.slice(5) : node.id
        params.set("type_id", typeId)
      } else if (node.kind === "tag") {
        params.set("mode", "tag")
        const tagId = node.id.startsWith("tag:") ? node.id.slice(4) : node.id
        params.set("tag_id", tagId)
      }
      params.set("limit", String(expansionLimit))
      params.set("offset", String(offset))
      return params
    },
    [expansionLimit]
  )

  const runFetch = useCallback(
    async (node: GraphNode, offset: number, cacheKey: string): Promise<void> => {
      const params = buildParams(node, offset)
      if (!params) return

      const existing = inFlightRef.current.get(cacheKey)
      if (existing) return existing

      const promise = (async () => {
        setState("loading")
        setError(null)
        try {
          const cached = cacheRef.current.get(cacheKey)
          const incoming = cached ?? (await fetcher(params))
          if (!cached) cacheRef.current.set(cacheKey, incoming)

          expandedRef.current.add(node.id)

          const productsInPayload = incoming.nodes.filter((n) => n.kind === "product").length
          const previousInfo = infoRef.current.get(node.id)
          infoRef.current.set(node.id, {
            total: incoming.total ?? previousInfo?.total ?? productsInPayload,
            loaded: (previousInfo?.loaded ?? 0) + productsInPayload,
          })

          setPayload((prev) => mergePayloads(prev, incoming))
          preloadImages(incoming.nodes.map((n) => n.thumbnail))
          setState("idle")
        } catch (err) {
          setError(err instanceof Error ? err.message : "Expansion failed")
          setState("error")
        } finally {
          inFlightRef.current.delete(cacheKey)
        }
      })()

      inFlightRef.current.set(cacheKey, promise)
      return promise
    },
    [buildParams, fetcher]
  )

  const expandNode = useCallback(
    async (node: GraphNode): Promise<void> => {
      if (!["brand", "category", "type", "tag"].includes(node.kind)) return
      if (expandedRef.current.has(node.id)) return
      return runFetch(node, 0, `${node.id}:0`)
    },
    [runFetch]
  )

  const loadMore = useCallback(
    async (node: GraphNode): Promise<void> => {
      if (!["brand", "category", "type", "tag"].includes(node.kind)) return
      const info = infoRef.current.get(node.id)
      if (!info) return expandNode(node)
      if (info.loaded >= info.total) return
      return runFetch(node, info.loaded, `${node.id}:${info.loaded}`)
    },
    [expandNode, runFetch]
  )

  const getExpansionInfo = useCallback(
    (nodeId: string): ExpansionInfo | null => {
      return infoRef.current.get(nodeId) ?? null
    },
    []
  )

  const prefetchTopBrands = useCallback(
    (count = 3) => {
      if (typeof window === "undefined") return
      const brandNodes = payload.nodes
        .filter((n) => n.kind === "brand")
        .sort((a, b) => (b.productCount ?? 0) - (a.productCount ?? 0))
        .slice(0, count)

      const schedule = (cb: () => void) => {
        const ric = (window as unknown as {
          requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number
        }).requestIdleCallback
        if (typeof ric === "function") {
          ric(cb, { timeout: 2000 })
        } else {
          setTimeout(cb, 250)
        }
      }

      schedule(() => {
        for (const node of brandNodes) {
          void expandNode(node)
        }
      })
    },
    [payload.nodes, expandNode]
  )

  const expandedNodeIds = useMemo(
    () => new Set(expandedRef.current),
    // `expandedRef` mutates in place; we expose a fresh Set on every render so
    // consumers can trigger rerenders via payload changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [payload]
  )

  return {
    payload,
    state,
    error,
    expandedNodeIds,
    expandNode,
    loadMore,
    getExpansionInfo,
    prefetchTopBrands,
  }
}
