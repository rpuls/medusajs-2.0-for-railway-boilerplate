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
 * Origin for the absolute URLs a route handler answers with, such as the
 * product links and the checkout `continue_url` the UCP endpoints give an AI
 * agent. Those must name the site the agent called, or the shopper is handed a
 * link to somewhere else.
 *
 * NEXT_PUBLIC_BASE_URL wins when it is set. Otherwise the host the proxy saw:
 * on Railway the app listens on an internal port behind Railway's edge, so
 * request.url names that internal address, and only x-forwarded-host and
 * x-forwarded-proto carry the public domain. Preferred over
 * RAILWAY_PUBLIC_DOMAIN because a custom domain arrives here too.
 */
export const getRequestOrigin = (request: Request): string => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, "")
  }

  const first = (name: string) =>
    request.headers.get(name)?.split(",")[0].trim() || undefined
  const url = new URL(request.url)
  const host = first("x-forwarded-host") ?? first("host")

  if (!host) {
    return url.origin
  }

  const proto = first("x-forwarded-proto") ?? url.protocol.replace(":", "")
  return `${proto}://${host}`
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

/**
 * Whether to show the search entry point in the nav.
 *
 * On by default, opt out with NEXT_PUBLIC_FEATURE_SEARCH_DISABLED=true.
 *
 * This used to be the other way round, an opt-in
 * NEXT_PUBLIC_FEATURE_SEARCH_ENABLED, and that default cost real stores their
 * search. The Railway template provisions Meilisearch, derives a search key and
 * indexes the catalogue, but never set the opt-in flag, so every deploy ran a
 * fully working and completely unreachable search: the nav link is the only
 * route into it anywhere in the UI. Defaulting to on means the shipped
 * infrastructure and the shipped UI agree, and local development matches a
 * deploy without extra configuration.
 *
 * Compared against the string rather than read for truthiness. Env values are
 * always strings, so the old truthy check treated "false" as enabled.
 */
export const isSearchEnabled = () => {
  return process.env.NEXT_PUBLIC_FEATURE_SEARCH_DISABLED !== "true"
}
