/**
 * Browser origins allowed on custom store API routes (contact, newsletter, etc.).
 * Production storefront is sc-prints.com.au; Vercel preview URLs keep the legacy project slug.
 */
export const STOREFRONT_ORIGIN_ALLOWLIST = [
  "https://sc-prints.com.au",
  "https://www.sc-prints.com.au",
  "https://medusajs-2-0-for-railway-vercel.vercel.app",
  "http://localhost:8000",
] as const

/** Vercel preview deploys for the storefront project */
export const STOREFRONT_ORIGIN_REGEX_ALLOWLIST = [
  /^https:\/\/medusajs-2-0-for-railway-vercel[a-z0-9-]*\.vercel\.app$/,
] as const

export function getStorefrontOriginAllowlist(): string[] {
  const fromEnv = (process.env.STORE_CORS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    // Regex entries in STORE_CORS are handled by isStorefrontOriginAllowed, not this list
    .filter((entry) => !(entry.startsWith("/") && entry.endsWith("/")))

  return [...STOREFRONT_ORIGIN_ALLOWLIST, ...fromEnv]
}

/**
 * STORE_CORS may be plain origins or `/regex/` entries (see graph route).
 */
export function isStorefrontOriginAllowed(origin: string): boolean {
  if (!origin) return false

  if ((STOREFRONT_ORIGIN_ALLOWLIST as readonly string[]).includes(origin)) {
    return true
  }

  for (const re of STOREFRONT_ORIGIN_REGEX_ALLOWLIST) {
    if (re.test(origin)) return true
  }

  const configured = (process.env.STORE_CORS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  for (const entry of configured) {
    if (entry.startsWith("/") && entry.endsWith("/") && entry.length > 2) {
      try {
        if (new RegExp(entry.slice(1, -1)).test(origin)) return true
      } catch {
        /* ignore invalid regex */
      }
    } else if (entry === origin) {
      return true
    }
  }

  return false
}
