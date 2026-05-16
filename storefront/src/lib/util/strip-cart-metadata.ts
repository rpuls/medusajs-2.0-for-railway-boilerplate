/**
 * Strip the genuinely heavy customizer metadata from cart/order line items
 * for safe server→client serialization through RSC.
 *
 * What gets stripped (the actual size-bombs):
 *   - sideLayouts: per-side Fabric.js JSON — every placed image/text object
 *     with full transform data; the biggest field by far on a decorated line
 *   - prints: per-image print specs (one object per placed Fabric object)
 *   - customerOriginalFiles: uploaded source-file refs
 *
 * What's KEPT (small but UI-critical):
 *   - artifacts: hosted mockup URLs per decorated side. These are short URL
 *     strings (~150 chars each) and the cart Item component reads them via
 *     getCustomizerMockupArtifacts() to render the design preview thumbnail.
 *     Stripping these broke the visible-preview in cart, which is the whole
 *     reason customers can tell their custom item apart from a blank one.
 *   - pricing.server: per-line pricing snapshot (used by admin tooling)
 *   - printNotes: free-text instructions for production
 *   - sideDecorationMethods: one string per side, tiny
 *   - sideEmbroideryConfigs: small (mm dims, stitch count); kept for cart
 *     summary surfaces and re-edit affordance
 *
 * For a cart with 100+ customized lines the cumulative payload otherwise
 * crosses the practical RSC streaming limit, which manifests as the cart
 * page error boundary firing with no specific message ("Something went
 * wrong loading your cart"). Full metadata is preserved on the backend
 * cart line and re-fetched on demand (see getOrderLineCustomizerMetadata).
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
    // Drop the actual size-bombs only. Keep artifacts (URLs, small) so the
    // cart Item component can render its mockup preview thumbnail.
    delete designLite.sideLayouts
    delete designLite.prints
    delete designLite.customerOriginalFiles
    return {
      ...item,
      metadata: {
        ...(meta as Record<string, unknown>),
        customizerDesign: designLite,
      },
    } as T
  })
}
