/**
 * Strip heavy customizer metadata from cart/order line items for safe
 * server→client serialization through RSC. Each customizable line carries
 * a `customizerDesign` blob with:
 *
 *   - sideLayouts: per-side Fabric.js JSON (the biggest field by far —
 *     every placed image/text object with full transform data)
 *   - prints: per-image print specs
 *   - artifacts: render artifact URLs and metadata
 *   - customerOriginalFiles: uploaded source-file refs
 *   - sideEmbroideryConfigs: per-side embroidery config blobs
 *
 * For a cart with 100+ customized lines the cumulative payload easily
 * crosses the practical RSC streaming limit, which manifests as the cart
 * page error boundary firing with no specific message ("Something went
 * wrong loading your cart"). The cart UI itself only reads top-level
 * scalars (quantity, unit_price, product_title, thumbnail) — none of
 * the heavy fields — so we can safely drop them for the render pass.
 *
 * Full metadata is preserved on the backend cart line and re-fetched on
 * demand (see getOrderLineCustomizerMetadata for the re-edit flow).
 *
 * NOTE: This file deliberately lives in lib/util/ (NOT lib/data/cart.ts)
 * because lib/data/cart.ts uses `"use server"` — every export from a
 * Server Actions file must be an async function. This helper is sync,
 * so it can't sit alongside the cart Server Actions.
 */
export function stripHeavyCartMetadataForRender<T extends { metadata?: unknown }>(
  items: T[] | null | undefined
): T[] {
  if (!items || !Array.isArray(items)) return []
  return items.map((item) => {
    const meta = (item as { metadata?: Record<string, unknown> | null }).metadata
    if (!meta || typeof meta !== "object") return item
    const design = (meta as Record<string, unknown>).customizerDesign
    if (!design || typeof design !== "object") return item
    // Shallow-clone metadata + customizerDesign so we don't mutate inputs.
    const designLite: Record<string, unknown> = {
      ...(design as Record<string, unknown>),
    }
    // Drop the heaviest fields. Keep pricing.server (small, used by admin
    // tooling that reads enriched orders) and printNotes (free text).
    delete designLite.sideLayouts
    delete designLite.prints
    delete designLite.artifacts
    delete designLite.customerOriginalFiles
    delete designLite.sideEmbroideryConfigs
    // sideDecorationMethods is small (one string per side) — kept so the
    // cart line knows which sides are print vs embroidery for any future
    // summary display. Strip if it grows.
    return {
      ...item,
      metadata: {
        ...(meta as Record<string, unknown>),
        customizerDesign: designLite,
      },
    } as T
  })
}
