import type { GraphLink, GraphNode, GraphPayload } from "../../../types/graph"

/**
 * react-force-graph mutates `link.source` / `link.target` to reference the
 * real node objects once the simulation ticks. This helper normalizes a link's
 * endpoints back to id strings so incoming payloads can be merged without
 * drifting into an inconsistent state.
 */
function toId(value: unknown): string {
  if (typeof value === "string") return value
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === "string") return id
  }
  return ""
}

function linkKey(link: GraphLink): string {
  const source = toId(link.source)
  const target = toId(link.target)
  return `${source}->${target}:${link.kind}`
}

export function mergePayloads(
  current: GraphPayload,
  incoming: GraphPayload
): GraphPayload {
  const nodeById = new Map<string, GraphNode>()
  for (const node of current.nodes) {
    nodeById.set(node.id, node)
  }
  for (const node of incoming.nodes) {
    const existing = nodeById.get(node.id)
    if (!existing) {
      nodeById.set(node.id, node)
      continue
    }
    nodeById.set(node.id, {
      ...existing,
      ...node,
      thumbnail: node.thumbnail ?? existing.thumbnail,
      price: node.price ?? existing.price,
      logoSrc: node.logoSrc ?? existing.logoSrc,
      productCount: node.productCount ?? existing.productCount,
    })
  }

  const linksByKey = new Map<string, GraphLink>()
  for (const link of current.links) {
    linksByKey.set(linkKey(link), {
      source: toId(link.source),
      target: toId(link.target),
      kind: link.kind,
    })
  }
  for (const link of incoming.links) {
    const normalized: GraphLink = {
      source: toId(link.source),
      target: toId(link.target),
      kind: link.kind,
    }
    if (!normalized.source || !normalized.target) continue
    linksByKey.set(linkKey(normalized), normalized)
  }

  return {
    nodes: Array.from(nodeById.values()),
    links: Array.from(linksByKey.values()),
    mode: incoming.mode,
    offset: incoming.offset,
    total: incoming.total,
  }
}

/**
 * Filter a graph by visible node kinds. Preserves only links whose endpoints
 * both survive the filter, preventing "dangling" edges pointing at hidden nodes.
 */
export function filterPayload(
  payload: GraphPayload,
  visible: { brand: boolean; category: boolean; product: boolean; root: boolean; type: boolean; tag: boolean }
): GraphPayload {
  const nodes = payload.nodes.filter((n) => visible[n.kind])
  const keepIds = new Set(nodes.map((n) => n.id))
  const links = payload.links.filter(
    (l) => keepIds.has(toId(l.source)) && keepIds.has(toId(l.target))
  )
  return { ...payload, nodes, links }
}
