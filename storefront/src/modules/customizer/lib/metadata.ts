import { HttpTypes } from "@medusajs/types"

type AnyLineItem = HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
type ArtifactLike = {
  side?: unknown
  mockupUrl?: unknown
}

export type LineItemMockupArtifact = {
  side: string
  label: string
  mockupUrl: string
}

const sideLabel = (side: string) => {
  switch (side) {
    case "front":
      return "Front"
    case "back":
      return "Back"
    case "left_sleeve":
      return "Left sleeve"
    case "right_sleeve":
      return "Right sleeve"
    case "printed_tag":
      return "Printed tag"
    default:
      return side.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  }
}

export const getCustomizerMetadata = (item: AnyLineItem) => {
  const metadata = (item as any)?.metadata
  const payload = metadata?.customizerDesign

  if (!payload || typeof payload !== "object") {
    return null
  }

  const artifacts = Array.isArray((payload as any).artifacts) ? (payload as any).artifacts : []
  const sizes = Array.isArray((payload as any).sizes) ? (payload as any).sizes : []
  const rawNotes = (payload as Record<string, unknown>).printNotes
  const printNotes =
    typeof rawNotes === "string" && rawNotes.trim().length > 0 ? rawNotes.trim() : null

  const rawOriginals = (payload as { customerOriginalFiles?: unknown }).customerOriginalFiles
  const customerOriginalFiles = Array.isArray(rawOriginals) ? rawOriginals : []

  return {
    artifacts,
    sizes,
    pricing: (payload as any).pricing ?? null,
    type: String((payload as any).type ?? ""),
    printNotes,
    customerOriginalFiles,
  }
}

/** Hosted mockup URLs per decorated side (order preserved). */
export const getCustomizerMockupUrls = (item: AnyLineItem): string[] => {
  return getCustomizerMockupArtifacts(item).map((artifact) => artifact.mockupUrl)
}

export const getCustomizerMockupArtifacts = (item: AnyLineItem): LineItemMockupArtifact[] => {
  const meta = getCustomizerMetadata(item)
  if (!meta?.artifacts?.length) {
    return []
  }

  return meta.artifacts
    .map((artifact: ArtifactLike): LineItemMockupArtifact | null => {
      const mockupUrl =
        typeof artifact?.mockupUrl === "string" ? artifact.mockupUrl.trim() : ""
      if (!mockupUrl) {
        return null
      }

      const side = typeof artifact?.side === "string" ? artifact.side.trim() : "custom"
      return {
        side,
        label: sideLabel(side),
        mockupUrl,
      }
    })
    .filter((artifact: LineItemMockupArtifact | null): artifact is LineItemMockupArtifact => Boolean(artifact))
}
