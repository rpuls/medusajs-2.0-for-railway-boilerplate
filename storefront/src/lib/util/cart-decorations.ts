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

/**
 * Walk a cart payload and return one entry per *unique* reusable design.
 *
 * Designs are deduplicated by their decoration fingerprint — multiple bundle
 * lines that share the same artwork/notes appear once, and a customer who
 * adds the same embroidery to two garments doesn't see two identical entries.
 */
export function extractCartDesigns(cart: unknown): CartDesignSource[] {
  const items = (cart as { items?: RawCartItem[] } | null)?.items ?? []
  const out: CartDesignSource[] = []

  for (const raw of items) {
    const meta = raw.metadata ?? {}

    const artworkUrl =
      typeof meta.artwork_url === "string" && meta.artwork_url.trim()
        ? meta.artwork_url
        : null
    const decorationNotes =
      typeof meta.printNotes === "string" && meta.printNotes.trim()
        ? meta.printNotes
        : null
    const embroidery = extractEmbroideryFromMetadata(meta)

    if (!artworkUrl && !decorationNotes && !embroidery) continue

    out.push({
      lineItemId: raw.id ?? "",
      productTitle: raw.product_title ?? "Item",
      variantTitle: raw.variant_title ?? null,
      thumbnail: raw.thumbnail ?? null,
      kind: embroidery ? "embroidery" : artworkUrl ? "artwork" : "notes-only",
      artworkUrl,
      decorationNotes,
      bundleTitle:
        typeof meta.bundle_title === "string" ? meta.bundle_title : null,
      embroidery,
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
