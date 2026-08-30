/**
 * Public URL this storefront is served from. It feeds `metadataBase`, so it
 * decides the absolute URLs in canonical tags and Open Graph images.
 *
 * The old fallback was `https://localhost:8000`, which is wrong twice over:
 * local development is http, and shipping a localhost metadataBase means
 * every shared link resolves to the visitor's own machine.
 */
export const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }

  // Railway exposes the assigned domain without a scheme. This is read during
  // metadata generation on the server, so a non-public var is fine here.
  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN
  if (railwayDomain) {
    return railwayDomain.startsWith("http")
      ? railwayDomain
      : `https://${railwayDomain}`
  }

  return "http://localhost:8000"
}

/**
 * Your shop's own name, shown in the nav, footer, checkout header, page titles
 * and legal copy. Set NEXT_PUBLIC_STORE_NAME to your store's name. The fallback
 * is a placeholder on purpose, so an unconfigured deploy prompts you to set it
 * rather than shipping someone else's brand.
 */
export const getStoreName = () => {
  return process.env.NEXT_PUBLIC_STORE_NAME || "Your Store"
}
