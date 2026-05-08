/**
 * Line item metadata must stay small enough for Medusa / DB limits. Fabric serializes
 * uploaded images as huge data URLs inside `sideLayouts`; we cannot ship those to
 * the order — they bloat row size and break re-order rehydration anyway.
 *
 * The smart move is to swap each known data URL for the hosted MinIO URL of the
 * same upload (we already uploaded the original on file pick). That way:
 *   1. The cart payload is small (a few KB per side instead of MB).
 *   2. `?reorder=<order_id>:<line_id>` can rehydrate the canvas — Fabric loads
 *      the image from the hosted URL instead of choking on the placeholder.
 *
 * Fall back to a placeholder string when no hosted URL is known (e.g. an
 * inline SVG with no upload counterpart). Those images won't rehydrate, which
 * matches the previous behaviour but is at least no worse.
 */
const MAX_INLINE_STRING = 240
const OMITTED_IMAGE_PLACEHOLDER = "[omitted-image-data]"

function sanitizeValue(
  value: unknown,
  imageUrlOverrides: Record<string, string> | null
): unknown {
  if (value === null || value === undefined) {
    return value
  }
  if (typeof value === "string") {
    if (value.startsWith("data:") && value.length > MAX_INLINE_STRING) {
      const hosted = imageUrlOverrides?.[value]
      if (typeof hosted === "string" && hosted.length > 0) {
        return hosted
      }
      return OMITTED_IMAGE_PLACEHOLDER
    }
    return value
  }
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeValue(entry, imageUrlOverrides))
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitizeValue(v, imageUrlOverrides)
    }
    return out
  }
  return value
}

/**
 * Strip large data URLs from a CustomizerMetadata payload before storing it on
 * a cart/order line. Pass `imageUrlOverrides` to remap known data URLs to their
 * hosted equivalents — the customizer builds this map from `sessionUploads`,
 * which carries both `dataUrl` (what Fabric serializes) and `originalStorageUrl`
 * (the MinIO URL).
 */
export function sanitizeCustomizerDesignForCart<T>(
  design: T,
  imageUrlOverrides?: Record<string, string>
): T {
  return sanitizeValue(design, imageUrlOverrides ?? null) as T
}
