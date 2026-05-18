/**
 * Strip the genuinely heavy customizer metadata from cart/order line items
 * for safe server→client serialization through RSC.
 *
 * What gets stripped (the actual size-bombs):
 *   - sideLayouts: per-side Fabric.js JSON — every placed image/text object
 *     with full transform data; the biggest field by far on a decorated line
 *   - prints: per-image print specs (one object per placed Fabric object)
 *
 * What's KEPT (small but UI-critical):
 *   - artifacts: hosted mockup URLs per decorated side. These are short URL
 *     strings (~150 chars each) and the cart Item component reads them via
 *     getCustomizerMockupArtifacts() to render the design preview thumbnail.
 *     Stripping these broke the visible-preview in cart, which is the whole
 *     reason customers can tell their custom item apart from a blank one.
 *   - customerOriginalFiles: small array of { url, fileName, mimeType } for
 *     storefront download links. URLs are already public-read, array is tiny.
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
export function stripHeavyCartMetadataForRender<T extends { metadata?: unknown; variant?: unknown }>(
  items: T[] | null | undefined
): T[] {
  if (!items || !Array.isArray(items)) return []
  return items.map((item) => stripOneLineItem(item))
}

function stripOneLineItem<T extends { metadata?: unknown; variant?: unknown }>(item: T): T {
  let next = item as T & {
    metadata?: Record<string, unknown> | null
    variant?: Record<string, unknown> | null
  }

  // ── 1. Slim customizerDesign on metadata ──
  const meta = next.metadata
  if (meta && typeof meta === "object") {
    const design = (meta as Record<string, unknown>).customizerDesign
    if (design && typeof design === "object") {
      const designLite: Record<string, unknown> = {
        ...(design as Record<string, unknown>),
      }
      // Drop the actual size-bombs only. Keep artifacts (URLs, small) so the
      // cart Item component can render its mockup preview thumbnail, and keep
      // customerOriginalFiles so the storefront order page can show download links.
      delete designLite.sideLayouts
      delete designLite.prints
      next = {
        ...next,
        metadata: {
          ...(meta as Record<string, unknown>),
          customizerDesign: designLite,
        },
      }
    }
  }

  // ── 2. Slim variant.product duplication ──
  // Each of 100+ cart lines carries its OWN copy of variant.product through
  // enrichLineItems. The product object contains description (often a few KB
  // of HTML), full images array, brand details, collections, categories,
  // tags, and product metadata — none of which the cart UI needs per-line.
  // Keep only the fields the cart Item component reads:
  //   product.handle, product.title, product.thumbnail, product.images
  //   (just the first one — used for color-aware variant image fallback)
  const variant = next.variant
  if (variant && typeof variant === "object") {
    const v = variant as Record<string, unknown>
    const product = v.product
    if (product && typeof product === "object") {
      const p = product as Record<string, unknown>
      const slimProduct: Record<string, unknown> = {
        id: p.id,
        handle: p.handle,
        title: p.title,
        thumbnail: p.thumbnail,
        // images: keep only the first few (used by getPrimaryGarmentImageUrl
        // for color-aware variant image fallback)
        images: Array.isArray(p.images) ? p.images.slice(0, 4) : [],
      }
      next = {
        ...next,
        variant: {
          ...v,
          product: slimProduct,
        },
      }
    }
  }

  return next as T
}
