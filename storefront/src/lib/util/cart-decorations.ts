/**
 * Shared helpers for the "reuse a design from your cart" UX.
 *
 * Both the bundle wizard's artwork step and the embroidery panel surface a
 * picker that reads existing cart line items and lets the customer copy a
 * design they've already configured onto a new garment. This file is the
 * single source of truth for *what counts as a reusable design* and *what
 * fields get copied across*.
 */

export type CartDesignSource = {
  lineItemId: string
  productTitle: string
  variantTitle: string | null
  thumbnail: string | null

  /** Decoration kind detected on this line. */
  kind: "embroidery" | "artwork" | "notes-only"

  /** MinIO URL of an attached logo / artwork. Null for embroidery-only lines. */
  artworkUrl: string | null

  /** Free-text decoration notes (mapped from metadata.printNotes). */
  decorationNotes: string | null

  /** Bundle title — set when this line came from a bundle wizard add. */
  bundleTitle: string | null

  /** Embroidery-specific fields. Null when kind !== "embroidery". */
  embroidery: {
    placement: "front" | "back" | "left" | "right" | "both"
    stitchCount: number
  } | null
}

type RawCartItem = {
  id?: string
  product_title?: string | null
  variant_title?: string | null
  thumbnail?: string | null
  metadata?: Record<string, unknown> | null
}

const PLACEMENTS = ["front", "back", "left", "right", "both"] as const
type Placement = (typeof PLACEMENTS)[number]

function asPlacement(v: unknown): Placement | null {
  return typeof v === "string" && (PLACEMENTS as readonly string[]).includes(v)
    ? (v as Placement)
    : null
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v
  if (typeof v === "string") {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function extractEmbroideryFromMetadata(
  metadata: Record<string, unknown>
): { placement: Placement; stitchCount: number } | null {
  const decoration = metadata.decorationDesign as
    | Record<string, unknown>
    | undefined
  if (!decoration || typeof decoration !== "object") return null
  if (decoration.method !== "embroidery") return null

  // Read placement from the unified payload (preferred) or fall back to
  // the embroidery-specific design slice.
  const placement =
    asPlacement(decoration.placement) ??
    asPlacement(
      (decoration.embroideryDesign as Record<string, unknown> | undefined)
        ?.placement
    ) ??
    "front"

  // Stitch count lives in two places — server pricing snapshot wins because
  // it's authoritative; embroideryDesign.stitchCount is the client estimate.
  const serverPricing = decoration.serverPricing as
    | Record<string, unknown>
    | undefined
  const embroideryDesign = decoration.embroideryDesign as
    | Record<string, unknown>
    | undefined
  const stitchCount =
    asNumber(serverPricing?.stitch_count) ??
    asNumber(embroideryDesign?.stitchCount) ??
    0

  if (stitchCount <= 0) return null
  return { placement, stitchCount }
}

type CustomerOriginalFile = {
  url?: unknown
  fileName?: unknown
}

function extractCustomizerOriginals(
  metadata: Record<string, unknown>
): Array<{ url: string; name: string | null; notes: string | null }> {
  const design = metadata.customizerDesign as
    | Record<string, unknown>
    | undefined
  if (!design || typeof design !== "object") return []

  const notes =
    typeof design.printNotes === "string" && design.printNotes.trim()
      ? design.printNotes
      : null

  // Primary: customerOriginalFiles (populated when the per-upload MinIO archive succeeds)
  const files = design.customerOriginalFiles
  if (Array.isArray(files) && files.length > 0) {
    const out: Array<{ url: string; name: string | null; notes: string | null }> = []
    for (const f of files as CustomerOriginalFile[]) {
      const url = typeof f?.url === "string" ? f.url.trim() : ""
      if (!url) continue
      const name = typeof f?.fileName === "string" ? f.fileName : null
      out.push({ url, name, notes })
    }
    if (out.length > 0) return out
  }

  // Fallback: scan sideLayouts Fabric JSON for image objects with hosted URLs.
  // customerOriginalFiles is absent on items added before the field was introduced
  // or when the original-file upload failed; the canvas src is the same MinIO URL
  // (set by sanitizeCustomizerDesignForCart), so it works as an equivalent source.
  const sideLayouts = design.sideLayouts
  if (!Array.isArray(sideLayouts)) return []
  const seen = new Set<string>()
  const out: Array<{ url: string; name: string | null; notes: string | null }> = []
  for (const layout of sideLayouts as unknown[]) {
    const objects = (layout as Record<string, unknown>)?.objects
    if (!Array.isArray(objects)) continue
    for (const obj of objects as unknown[]) {
      const o = obj as Record<string, unknown>
      if (o.type !== "image") continue
      const src = typeof o.src === "string" ? o.src.trim() : ""
      if (!src || src.startsWith("data:") || src === "[omitted-image-data]") continue
      if (!src.startsWith("http")) continue
      if (seen.has(src)) continue
      seen.add(src)
      out.push({ url: src, name: null, notes })
    }
  }
  return out
}

/**
 * Walk a cart payload and return one entry per *unique* reusable design.
 *
 * Designs are deduplicated by their decoration fingerprint — multiple bundle
 * lines that share the same artwork/notes appear once, and a customer who
 * adds the same embroidery to two garments doesn't see two identical entries.
 *
 * Handles three line-item shapes:
 *  - Bundle wizard lines (metadata.artwork_url + metadata.printNotes)
 *  - Customizer lines (metadata.customizerDesign.customerOriginalFiles[])
 *  - Embroidery lines (metadata.decorationDesign)
 */
export function extractCartDesigns(cart: unknown): CartDesignSource[] {
  const items = (cart as { items?: RawCartItem[] } | null)?.items ?? []
  const out: CartDesignSource[] = []

  for (const raw of items) {
    const meta = raw.metadata ?? {}

    const bundleTitle =
      typeof meta.bundle_title === "string" ? meta.bundle_title : null

    const embroidery = extractEmbroideryFromMetadata(meta)
    if (embroidery) {
      out.push({
        lineItemId: raw.id ?? "",
        productTitle: raw.product_title ?? "Item",
        variantTitle: raw.variant_title ?? null,
        thumbnail: raw.thumbnail ?? null,
        kind: "embroidery",
        artworkUrl: null,
        decorationNotes: null,
        bundleTitle,
        embroidery,
      })
      continue
    }

    // Customizer line — emit one entry per uploaded original file so the
    // customer can pick a specific logo when they've layered multiple on
    // the same garment.
    const customizerOriginals = extractCustomizerOriginals(meta)
    if (customizerOriginals.length > 0) {
      for (const file of customizerOriginals) {
        out.push({
          lineItemId: raw.id ?? "",
          productTitle: file.name ?? raw.product_title ?? "Item",
          variantTitle: raw.variant_title ?? null,
          thumbnail: raw.thumbnail ?? null,
          kind: "artwork",
          artworkUrl: file.url,
          decorationNotes: file.notes,
          bundleTitle,
          embroidery: null,
        })
      }
      continue
    }

    // Bundle wizard line (or any flow that stuck a top-level artwork_url
    // / printNotes on the line).
    const artworkUrl =
      typeof meta.artwork_url === "string" && meta.artwork_url.trim()
        ? meta.artwork_url
        : null
    const decorationNotes =
      typeof meta.printNotes === "string" && meta.printNotes.trim()
        ? meta.printNotes
        : null

    if (!artworkUrl && !decorationNotes) continue

    out.push({
      lineItemId: raw.id ?? "",
      productTitle: raw.product_title ?? "Item",
      variantTitle: raw.variant_title ?? null,
      thumbnail: raw.thumbnail ?? null,
      kind: artworkUrl ? "artwork" : "notes-only",
      artworkUrl,
      decorationNotes,
      bundleTitle,
      embroidery: null,
    })
  }

  // Deduplicate by decoration fingerprint
  const seen = new Set<string>()
  const unique: CartDesignSource[] = []
  for (const d of out) {
    const key = [
      d.kind,
      d.artworkUrl ?? "",
      d.decorationNotes ?? "",
      d.embroidery?.placement ?? "",
      d.embroidery?.stitchCount ?? 0,
    ].join("|")
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(d)
  }
  return unique
}

/** Filter to only the entries usable in a given context. */
export function filterByKind(
  designs: CartDesignSource[],
  kinds: CartDesignSource["kind"][]
): CartDesignSource[] {
  const set = new Set(kinds)
  return designs.filter((d) => set.has(d.kind))
}
