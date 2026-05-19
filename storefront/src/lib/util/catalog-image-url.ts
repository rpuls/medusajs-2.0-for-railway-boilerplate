/**
 * Catalog image optimization helpers.
 *
 * Next.js 16 defaults `images.qualities` to `[75]` only — requests with other `q`
 * values return 400 INVALID_IMAGE_OPTIMIZE_REQUEST on Vercel. Listing cards use
 * `quality={50}` and swatch backgrounds used `q=40`.
 *
 * Vercel may also return 402 when Image Optimization is unavailable on the plan.
 * We default to unoptimized images on Vercel so supplier CDN URLs load directly.
 */

export function catalogImagesUnoptimized(): boolean {
  if (process.env.NEXT_PUBLIC_UNOPTIMIZED_IMAGES === "true") {
    return true
  }
  if (process.env.NEXT_PUBLIC_UNOPTIMIZED_IMAGES === "false") {
    return false
  }
  return process.env.VERCEL === "1"
}

/** Small swatch `background-image` URL for product listing cards. */
export function catalogSwatchBackgroundImageUrl(sourceUrl: string): string {
  if (catalogImagesUnoptimized()) {
    return sourceUrl
  }
  const encoded = encodeURIComponent(sourceUrl)
  return `/_next/image?url=${encoded}&w=80&q=75`
}
